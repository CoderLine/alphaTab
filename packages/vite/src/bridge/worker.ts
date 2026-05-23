// index.ts for more details on contents and license of this file

import * as path from 'node:path';
import { BuildEnvironment } from 'vite';
import { injectEnvironmentToHooks } from './build';
import { BundlerKind, detectBundler } from './bundler';
import type { ResolvedConfig } from './config';
import { cleanUrl, getHash } from './utils';

/**
 * @internal
 */
// biome-ignore lint/suspicious/noConstEnum: Exception where we use them
export const enum AlphaTabWorkerTypes {
    WorkerClassic = 'worker_classic',
    WorkerModule = 'worker_module',
    AudioWorklet = 'audio_worklet'
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/plugins/worker.ts#L23
type WorkerBundleAsset = { fileName: string; source: string | Uint8Array };
interface WorkerCache {
    // save worker all emit chunk avoid rollup make the same asset unique.
    assets: Map<string, WorkerBundleAsset>;

    // worker bundle don't deps on any more worker runtime info an id only had a result.
    // save worker bundled file id to avoid repeated execution of bundles
    // <input_filename, fileName>
    bundle: Map<string, string>;

    // <hash, fileName>
    fileNameHash: Map<string, string>;
}
/**
 * @internal
 */
export const workerCache = new WeakMap<ResolvedConfig, WorkerCache>();

/**
 * @internal
 */
export const WORKER_FILE_ID = 'alphatab_worker';
/**
 * @internal
 */
export const WORKER_ASSET_ID = '__ALPHATAB_WORKER_ASSET__';

interface BundledWorkerChunk {
    fileName: string;
    code: string;
    map?: { toString(): string } | null;
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/plugins/worker.ts#L47
function saveEmitWorkerAsset(config: ResolvedConfig, asset: WorkerBundleAsset): void {
    const workerMap = workerCache.get(config.mainConfig || config)!;
    workerMap.assets.set(asset.fileName, asset);
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/plugins/worker.ts#L161
/**
 * @internal
 */
export async function workerFileToUrl(config: ResolvedConfig, id: string): Promise<string> {
    const workerMap = workerCache.get(config.mainConfig || config)!;
    let fileName = workerMap.bundle.get(id);
    if (!fileName) {
        const outputChunk = await bundleWorkerEntry(config, id);
        fileName = outputChunk.fileName;
        saveEmitWorkerAsset(config, {
            fileName,
            source: outputChunk.code
        });
        workerMap.bundle.set(id, fileName);
    }
    return encodeWorkerAssetFileName(fileName, workerMap);
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/plugins/worker.ts#L149
function encodeWorkerAssetFileName(fileName: string, workerCache: WorkerCache): string {
    const { fileNameHash } = workerCache;
    const hash = getHash(fileName);
    if (!fileNameHash.get(hash)) {
        fileNameHash.set(hash, fileName);
    }
    return `${WORKER_ASSET_ID}${hash}__`;
}

async function bundleWorkerEntry(config: ResolvedConfig, id: string): Promise<BundledWorkerChunk> {
    const input = cleanUrl(id);
    const bundleChain = config.bundleChain ?? [];
    const newBundleChain = [...bundleChain, input];
    if (bundleChain.includes(input)) {
        throw new Error(
            `Circular worker imports detected. Vite does not support it. Import chain: ${newBundleChain.join(' -> ')}`
        );
    }

    const { plugins, format } = config.worker;
    // Vite 8 exposes `rolldownOptions`; Vite 7 only `rollupOptions`.
    const workerOptionsCarrier = config.worker as { rolldownOptions?: any; rollupOptions?: any };
    const workerBundlerOptions = workerOptionsCarrier.rolldownOptions ?? workerOptionsCarrier.rollupOptions;

    const workerConfig = await plugins(newBundleChain);
    const workerEnvironment = new BuildEnvironment('client', workerConfig);
    await workerEnvironment.init();

    const wrappedPlugins = workerEnvironment.plugins.map(p => injectEnvironmentToHooks(workerEnvironment, p));

    const workerOutputConfig = workerBundlerOptions.output;
    const outputConfig = workerOutputConfig
        ? Array.isArray(workerOutputConfig)
            ? workerOutputConfig[0] || {}
            : workerOutputConfig
        : {};

    const generateOptions = {
        entryFileNames: path.posix.join(config.build.assetsDir, '[name]-[hash].js'),
        chunkFileNames: path.posix.join(config.build.assetsDir, '[name]-[hash].js'),
        assetFileNames: path.posix.join(config.build.assetsDir, '[name]-[hash].[ext]'),
        ...outputConfig,
        format,
        sourcemap: config.build.sourcemap
    };

    let chunk: BundledWorkerChunk;
    if (detectBundler(config) === BundlerKind.Rolldown) {
        chunk = await bundleWorkerEntryRolldown(
            config,
            input,
            workerBundlerOptions,
            wrappedPlugins,
            generateOptions,
            workerEnvironment
        );
    } else {
        chunk = await bundleWorkerEntryRollup(config, input, workerBundlerOptions, wrappedPlugins, generateOptions);
    }

    return emitSourcemapForWorkerEntry(config, chunk);
}

// Rollup path (Vite 7 and earlier).
async function bundleWorkerEntryRollup(
    config: ResolvedConfig,
    input: string,
    bundlerOptions: any,
    plugins: any,
    generateOptions: any
): Promise<BundledWorkerChunk> {
    const { rollup } = await import('rollup');
    const bundle = await rollup({
        ...bundlerOptions,
        input,
        plugins,
        preserveEntrySignatures: false
    });
    try {
        const { output } = await bundle.generate(generateOptions);
        const [outputChunk, ...rest] = output;
        for (const o of rest) {
            if (o.type === 'asset') {
                saveEmitWorkerAsset(config, o);
            } else {
                saveEmitWorkerAsset(config, { fileName: o.fileName, source: o.code });
            }
        }
        return outputChunk;
    } finally {
        await bundle.close();
    }
}

// Rolldown path (Vite 8+).
async function bundleWorkerEntryRolldown(
    config: ResolvedConfig,
    input: string,
    bundlerOptions: any,
    plugins: any,
    generateOptions: any,
    workerEnvironment: BuildEnvironment
): Promise<BundledWorkerChunk> {
    const { rolldown } = await import('rolldown');
    const workerBuildTarget = workerEnvironment.config.build.target;
    const bundle = await rolldown({
        ...bundlerOptions,
        input,
        plugins,
        transform: {
            target: workerBuildTarget === false ? undefined : workerBuildTarget,
            ...bundlerOptions.transform,
            define: {
                ...bundlerOptions.transform?.define,
                'process.env.NODE_ENV': 'process.env.NODE_ENV'
            }
        },
        moduleTypes: {
            '.css': 'js',
            ...bundlerOptions.moduleTypes
        },
        preserveEntrySignatures: false,
        experimental: {
            ...bundlerOptions.experimental,
            viteMode: true
        }
    });
    try {
        const { output } = await bundle.generate(generateOptions);
        const [outputChunk, ...rest] = output;
        for (const o of rest) {
            if (o.type === 'asset') {
                saveEmitWorkerAsset(config, o);
            } else {
                saveEmitWorkerAsset(config, { fileName: o.fileName, source: o.code });
            }
        }
        return outputChunk;
    } finally {
        await bundle.close();
    }
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/plugins/worker.ts#L124
function emitSourcemapForWorkerEntry(config: ResolvedConfig, chunk: BundledWorkerChunk): BundledWorkerChunk {
    const sourcemap = chunk.map;
    if (sourcemap) {
        if (config.build.sourcemap === 'hidden' || config.build.sourcemap === true) {
            saveEmitWorkerAsset(config, {
                fileName: `${chunk.fileName}.map`,
                source: sourcemap.toString()
            });
        }
    }
    return chunk;
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/plugins/worker.ts#L458
/**
 * @internal
 */
export function isSameContent(a: string | Uint8Array, b: string | Uint8Array) {
    if (typeof a === 'string') {
        if (typeof b === 'string') {
            return a === b;
        }
        return Buffer.from(a).equals(b);
    }
    return Buffer.from(b).equals(a);
}
