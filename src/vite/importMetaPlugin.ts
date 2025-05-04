/**@target web */

// This file contains a customized and adapted version of the Vite built-in workerImportMetaUrl plugin
// https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/workerImportMetaUrl.ts
// The main adaptions are:
// - Custom syntax detection for workers and audio worklets
// - Custom worker types and worker URLs to not overlap with the original plugin

// With https://github.com/vitejs/vite/pull/16422 integrated this custom code should not be needed anymore

// Original Sources Licensed under:

// MIT License
// Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import type { AlphaTabVitePluginOptions } from '@src/vite/AlphaTabVitePluginOptions';
import MagicString from 'magic-string';
import {
    type ResolvedConfig,
    type Plugin,
    evalValue,
    tryFsResolve,
    tryOptimizedDepResolve,
    fileToUrl,
    cleanUrl,
    injectQuery,
    workerFileToUrl,
    AlphaTabWorkerTypes,
    WORKER_FILE_ID
} from '@src/vite/bridge';
import path from 'node:path';

const alphaTabWorkerPatterns = [
    ['alphaTabWorker', 'new', 'alphaTabUrl', 'import.meta.url'],
    ['alphaTabWorklet.addModule', 'new', 'alphaTabUrl', 'import.meta.url']
];

function includesAlphaTabWorker(code: string): boolean {
    for (const pattern of alphaTabWorkerPatterns) {
        let position = 0;

        for (const match of pattern) {
            position = code.indexOf(match, position);
            if (position === -1) {
                break;
            }
        }

        if (position !== -1) {
            return true;
        }
    }

    return false;
}

function getWorkerType(code: string, match: RegExpExecArray): AlphaTabWorkerTypes {
    if (match[1].includes('.addModule')) {
        return AlphaTabWorkerTypes.AudioWorklet;
    }

    const endOfMatch = match.indices![0][1];

    const startOfOptions = code.indexOf('{', endOfMatch);
    if (startOfOptions === -1) {
        return AlphaTabWorkerTypes.WorkerClassic;
    }

    const endOfOptions = code.indexOf('}', endOfMatch);
    if (endOfOptions === -1) {
        return AlphaTabWorkerTypes.WorkerClassic;
    }

    const endOfWorkerCreate = code.indexOf(')', endOfMatch);
    if (startOfOptions > endOfWorkerCreate || endOfOptions > endOfWorkerCreate) {
        return AlphaTabWorkerTypes.WorkerClassic;
    }

    let workerOptions: string | null | { type: string } = code.slice(startOfOptions, endOfOptions + 1);
    try {
        workerOptions = evalValue(workerOptions);
    } catch (e) {
        return AlphaTabWorkerTypes.WorkerClassic;
    }

    if (typeof workerOptions === 'object' && workerOptions?.type === 'module') {
        return AlphaTabWorkerTypes.WorkerModule;
    }

    return AlphaTabWorkerTypes.WorkerClassic;
}

export function importMetaUrlPlugin(options: AlphaTabVitePluginOptions): Plugin {
    let resolvedConfig: ResolvedConfig;
    let isBuild: boolean;
    let preserveSymlinks: boolean;

    const isWorkerActive = options.webWorkers !== false;
    const isWorkletActive = options.audioWorklets !== false;
    const isActive = isWorkerActive || isWorkletActive;

    return {
        name: 'vite-plugin-alphatab-url',
        enforce: 'pre',
        configResolved(config) {
            resolvedConfig = config as ResolvedConfig;
            isBuild = config.command === 'build';
            preserveSymlinks = config.resolve.preserveSymlinks;
        },

        shouldTransformCachedModule({ code }) {
            if (isActive && isBuild && resolvedConfig.build.watch && includesAlphaTabWorker(code)) {
                return true;
            }
            return;
        },

        async transform(code, id, options) {
            if (!isActive || options?.ssr || !includesAlphaTabWorker(code)) {
                return;
            }

            let s: MagicString | undefined;

            const alphaTabWorkerPattern =
                // @ts-expect-error For the Vite plugin we expect newer node than for alphaTab itself (-> migrate to monorepo)
                /\b(alphaTabWorker|alphaTabWorklet\.addModule)\s*\(\s*(new\s+[^ (]+alphaTabUrl\s*\(\s*(\'[^\']+\'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*\))/dg;

            let match: RegExpExecArray | null = alphaTabWorkerPattern.exec(code);
            while (match) {
                const workerType = getWorkerType(code, match);

                let typeActive = false;
                switch (workerType) {
                    case AlphaTabWorkerTypes.WorkerClassic:
                    case AlphaTabWorkerTypes.WorkerModule:
                        typeActive = isWorkerActive;
                        break;
                    case AlphaTabWorkerTypes.AudioWorklet:
                        typeActive = isWorkletActive;
                        break;
                }

                if (!typeActive) {
                    match = alphaTabWorkerPattern.exec(code);
                    continue;
                }

                s ??= new MagicString(code);

                const url = code.slice(match.indices![3][0] + 1, match.indices![3][1] - 1);

                let file = path.resolve(path.dirname(id), url);
                file =
                    tryFsResolve(file, preserveSymlinks) ??
                    tryOptimizedDepResolve(resolvedConfig, options?.ssr === true, url, id, preserveSymlinks) ??
                    file;

                let builtUrl: string;
                if (isBuild) {
                    builtUrl = await workerFileToUrl(resolvedConfig, file);
                } else {
                    builtUrl = await fileToUrl(cleanUrl(file), resolvedConfig);
                    builtUrl = injectQuery(builtUrl, `${WORKER_FILE_ID}&type=${workerType}`);
                }
                s.update(
                    match.indices![3][0],
                    match.indices![3][1],
                    // add `'' +` to skip vite:asset-import-meta-url plugin
                    `new URL('' + ${JSON.stringify(builtUrl)}, import.meta.url)`
                );

                match = alphaTabWorkerPattern.exec(code);
            }

            if (s) {
                return {
                    code: s.toString(),
                    map:
                        resolvedConfig.command === 'build' && resolvedConfig.build.sourcemap
                            ? s.generateMap({ hires: 'boundary', source: id })
                            : null
                };
            }

            return null;
        }
    };
}
