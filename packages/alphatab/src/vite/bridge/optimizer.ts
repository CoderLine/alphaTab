/**@target web */

// index.ts for more details on contents and license of this file

import { type DepOptimizationMetadata, type DevEnvironment, type OptimizedDepInfo, normalizePath } from 'vite';
import type { ResolvedConfig } from '@src/vite/bridge/config';
import { tryFsResolve } from '@src/vite/bridge/resolve';
import { cleanUrl } from '@src/vite/bridge/utils';
import * as path from 'node:path';
import { METADATA_FILENAME } from '@src/vite/bridge/constants';
import * as fs from 'node:fs';

// https://github.com/Danielku15/vite/blob/88b7def341f12d07d7d4f83cbe3dc73cc8c6b7be/packages/vite/src/node/optimizer/index.ts#L1356
export function tryOptimizedDepResolve(
    config: ResolvedConfig,
    ssr: boolean,
    url: string,
    depId: string,
    preserveSymlinks: boolean
): string | undefined {
    const optimizer = getDepsOptimizer(config, ssr);

    if (optimizer?.isOptimizedDepFile(depId)) {
        const depFile = cleanUrl(depId);
        const info = optimizedDepInfoFromFile(optimizer.metadata, depFile);
        const depSrc = info?.src;
        if (depSrc) {
            const resolvedFile = path.resolve(path.dirname(depSrc), url);
            return tryFsResolve(resolvedFile, preserveSymlinks);
        }
    }

    return undefined;
}

type DepsOptimizer = DevEnvironment['depsOptimizer'];

// https://github.com/Danielku15/vite/blob/88b7def341f12d07d7d4f83cbe3dc73cc8c6b7be/packages/vite/src/node/optimizer/optimizer.ts#L32-L40
const depsOptimizerMap = new WeakMap<ResolvedConfig, DepsOptimizer>();
const devSsrDepsOptimizerMap = new WeakMap<ResolvedConfig, DepsOptimizer>();

function getDepsOptimizer(config: ResolvedConfig, ssr?: boolean): DepsOptimizer {
    const map = ssr ? devSsrDepsOptimizerMap : depsOptimizerMap;

    let optimizer = map.get(config);
    if (!optimizer) {
        optimizer = createDepsOptimizer(config);
        map.set(config, optimizer);
    }
    return optimizer;
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/optimizer/optimizer.ts#L79
function createDepsOptimizer(config: ResolvedConfig) {
    const depsCacheDirPrefix = normalizePath(path.resolve(config.cacheDir, 'deps'));

    const metadata = parseDepsOptimizerMetadata(
        fs.readFileSync(path.join(depsCacheDirPrefix, METADATA_FILENAME), 'utf8'),
        depsCacheDirPrefix
    )!;

    const notImplemented = () => {
        throw new Error('not implemented');
    };
    const depsOptimizer: DepsOptimizer = {
        async init() {},
        metadata,
        registerMissingImport: notImplemented,
        run: notImplemented,
        // https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/optimizer/index.ts#L916
        isOptimizedDepFile: id => id.startsWith(depsCacheDirPrefix),
        isOptimizedDepUrl: notImplemented,
        getOptimizedDepId: notImplemented,
        close: notImplemented,
        options: {}
    };

    return depsOptimizer;
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/optimizer/index.ts#L944
function parseDepsOptimizerMetadata(jsonMetadata: string, depsCacheDir: string): DepOptimizationMetadata | undefined {
    const { hash, lockfileHash, configHash, browserHash, optimized, chunks } = JSON.parse(
        jsonMetadata,
        (key: string, value: string) => {
            if (key === 'file' || key === 'src') {
                return normalizePath(path.resolve(depsCacheDir, value));
            }
            return value;
        }
    );
    if (!chunks || Object.values(optimized).some(depInfo => !(depInfo as { fileHash: string }).fileHash)) {
        // outdated _metadata.json version, ignore
        return;
    }
    const metadata = {
        hash,
        lockfileHash,
        configHash,
        browserHash,
        optimized: {},
        discovered: {},
        chunks: {},
        depInfoList: []
    };
    for (const id of Object.keys(optimized)) {
        addOptimizedDepInfo(metadata, 'optimized', {
            ...optimized[id],
            id,
            browserHash
        });
    }
    for (const id of Object.keys(chunks)) {
        addOptimizedDepInfo(metadata, 'chunks', {
            ...chunks[id],
            id,
            browserHash,
            needsInterop: false
        });
    }
    return metadata;
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/optimizer/index.ts#L322
function addOptimizedDepInfo(
    metadata: DepOptimizationMetadata,
    type: 'optimized' | 'discovered' | 'chunks',
    depInfo: OptimizedDepInfo
): OptimizedDepInfo {
    metadata[type][depInfo.id] = depInfo;
    metadata.depInfoList.push(depInfo);
    return depInfo;
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/optimizer/index.ts#L1248
export function optimizedDepInfoFromFile(
    metadata: DepOptimizationMetadata,
    file: string
): OptimizedDepInfo | undefined {
    return metadata.depInfoList.find(depInfo => depInfo.file === file);
}
