/**@target web */

// index.ts for more details on contents and license of this file

import type { ResolvedConfig } from '@src/vite/bridge/config';
import { cleanUrl, getHash } from '@src/vite/bridge/utils';
import type { OutputChunk } from 'rollup';
import * as path from 'node:path';
import { BuildEnvironment } from 'vite';
import { injectEnvironmentToHooks } from '@src/vite/bridge/build';

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
export const workerCache = new WeakMap<ResolvedConfig, WorkerCache>();

export const WORKER_FILE_ID = 'alphatab_worker';
export const WORKER_ASSET_ID = '__ALPHATAB_WORKER_ASSET__';

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/plugins/worker.ts#L47
function saveEmitWorkerAsset(config: ResolvedConfig, asset: WorkerBundleAsset): void {
    const workerMap = workerCache.get(config.mainConfig || config)!;
    workerMap.assets.set(asset.fileName, asset);
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/plugins/worker.ts#L161
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

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/plugins/worker.ts#L55
async function bundleWorkerEntry(config: ResolvedConfig, id: string): Promise<OutputChunk> {
    const input = cleanUrl(id);
    const bundleChain = config.bundleChain ?? [];
    const newBundleChain = [...bundleChain, input];
    if (bundleChain.includes(input)) {
        throw new Error(
            `Circular worker imports detected. Vite does not support it. Import chain: ${newBundleChain.join(' -> ')}`
        );
    }

    // bundle the file as entry to support imports
    const { rollup } = await import('rollup');
    const { plugins, rollupOptions, format } = config.worker;

    const workerConfig = await plugins(newBundleChain);
    const workerEnvironment = new BuildEnvironment('client', workerConfig); // TODO: should this be 'worker'?
    await workerEnvironment.init();

    const bundle = await rollup({
        ...rollupOptions,
        input,
        plugins: workerEnvironment.plugins.map(p => injectEnvironmentToHooks(workerEnvironment, p)),
        preserveEntrySignatures: false
    });
    let chunk: OutputChunk;
    try {
        const workerOutputConfig = config.worker.rollupOptions.output;
        const workerConfig = workerOutputConfig
            ? Array.isArray(workerOutputConfig)
                ? workerOutputConfig[0] || {}
                : workerOutputConfig
            : {};
        const {
            output: [outputChunk, ...outputChunks]
        } = await bundle.generate({
            entryFileNames: path.posix.join(config.build.assetsDir, '[name]-[hash].js'),
            chunkFileNames: path.posix.join(config.build.assetsDir, '[name]-[hash].js'),
            assetFileNames: path.posix.join(config.build.assetsDir, '[name]-[hash].[ext]'),
            ...workerConfig,
            format,
            sourcemap: config.build.sourcemap
        });
        chunk = outputChunk;
        for (const outputChunk of outputChunks) {
            if (outputChunk.type === 'asset') {
                saveEmitWorkerAsset(config, outputChunk);
            } else if (outputChunk.type === 'chunk') {
                saveEmitWorkerAsset(config, {
                    fileName: outputChunk.fileName,
                    source: outputChunk.code
                });
            }
        }
    } finally {
        await bundle.close();
    }
    return emitSourcemapForWorkerEntry(config, chunk);
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/plugins/worker.ts#L124
function emitSourcemapForWorkerEntry(config: ResolvedConfig, chunk: OutputChunk): OutputChunk {
    const { map: sourcemap } = chunk;

    if (sourcemap) {
        if (config.build.sourcemap === 'hidden' || config.build.sourcemap === true) {
            const data = sourcemap.toString();
            const mapFileName = `${chunk.fileName}.map`;
            saveEmitWorkerAsset(config, {
                fileName: mapFileName,
                source: data
            });
        }
    }
    return chunk;
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/plugins/worker.ts#L458
export function isSameContent(a: string | Uint8Array, b: string | Uint8Array) {
    if (typeof a === 'string') {
        if (typeof b === 'string') {
            return a === b;
        }
        return Buffer.from(a).equals(b);
    }
    return Buffer.from(b).equals(a);
}
