/**@target web */

// This file contains a customized and adapted version of the Vite built-in worker plugin
// https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/worker.ts
// This is more or less a 1:1 copy of the original worker plugin with following adaptions:
// - Only handle syntax variants known to be used in alphaTab
// - Use the alphaTab URL markers
// - Some refactoring for better code understanding

// With https://github.com/vitejs/vite/pull/16422 integrated this custom code might not be needed anymore
// Some adjustment for audio worklet in vite might be needed to treat them as type "module" workers

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
import {
    type ResolvedConfig,
    type Plugin,
    ENV_PUBLIC_PATH,
    createToImportMetaURLBasedRelativeRuntime,
    workerCache,
    toOutputFilePathInJS,
    encodeURIPath,
    isSameContent,
    AlphaTabWorkerTypes,
    WORKER_ASSET_ID,
    WORKER_FILE_ID
} from '@src/vite/bridge';
import {} from '@src/vite/bridge';
import * as path from 'node:path';
import MagicString from 'magic-string';

const workerFileRE = new RegExp(`(?:\\?|&)${WORKER_FILE_ID}&type=(\\w+)(?:&|$)`);
const workerAssetUrlRE = new RegExp(`${WORKER_ASSET_ID}([a-z\\d]{8})__`, 'g');

export function workerPlugin(options: AlphaTabVitePluginOptions): Plugin {
    let resolvedConfig: ResolvedConfig;
    let isBuild: boolean;
    let isWorker: boolean;

    const isWorkerActive = options.webWorkers !== false;
    const isWorkletActive = options.audioWorklets !== false;
    const isActive = isWorkerActive || isWorkletActive;

    return {
        name: 'vite-plugin-alphatab-worker',

        configResolved(config) {
            resolvedConfig = config as ResolvedConfig;
            isBuild = config.command === 'build';
            isWorker = config.isWorker;
        },

        buildStart() {
            if (!isActive || isWorker) {
                return;
            }
            workerCache.set(resolvedConfig, {
                assets: new Map(),
                bundle: new Map(),
                fileNameHash: new Map()
            });
        },

        load(id) {
            if (isActive && isBuild && id.includes(WORKER_FILE_ID)) {
                return '';
            }
            return;
        },

        shouldTransformCachedModule({ id }) {
            if (isActive && isBuild && resolvedConfig.build.watch && id.includes(WORKER_FILE_ID)) {
                return true;
            }
            return;
        },

        async transform(raw, id) {
            if (!isActive) {
                return;
            }

            const match = workerFileRE.exec(id);
            if (!match) {
                return;
            }

            // inject env to worker file, might be needed by imported scripts

            const envScriptPath = JSON.stringify(path.posix.join(resolvedConfig.base, ENV_PUBLIC_PATH));

            const workerType = match[1] as AlphaTabWorkerTypes;
            let injectEnv = '';
            switch (workerType) {
                case AlphaTabWorkerTypes.WorkerClassic:
                    injectEnv = `importScripts(${envScriptPath})\n`;
                    break;
                case AlphaTabWorkerTypes.WorkerModule:
                case AlphaTabWorkerTypes.AudioWorklet:
                    injectEnv = `import ${envScriptPath}\n`;
                    break;
            }

            if (injectEnv) {
                const s = new MagicString(raw);
                s.prepend(injectEnv);
                return {
                    code: s.toString(),
                    map: s.generateMap({ hires: 'boundary' })
                };
            }

            return;
        },

        renderChunk(code, chunk, outputOptions) {
            // when building the worker URLs are replaced with some placeholders
            // here we replace those placeholders with the final file names respecting chunks

            let s: MagicString;
            const result = () => {
                return (
                    s && {
                        code: s.toString(),
                        map: resolvedConfig.build.sourcemap ? s.generateMap({ hires: 'boundary' }) : null
                    }
                );
            };
            workerAssetUrlRE.lastIndex = 0;
            if (workerAssetUrlRE.test(code)) {
                const toRelativeRuntime = createToImportMetaURLBasedRelativeRuntime(
                    outputOptions.format,
                    resolvedConfig.isWorker
                );

                s = new MagicString(code);
                workerAssetUrlRE.lastIndex = 0;

                // Replace "__VITE_WORKER_ASSET__5aa0ddc0__" using relative paths
                const workerMap = workerCache.get(resolvedConfig.mainConfig || resolvedConfig)!;
                const { fileNameHash } = workerMap;

                let match: RegExpExecArray | null = workerAssetUrlRE.exec(code);
                while (match) {
                    const [full, hash] = match;
                    const filename = fileNameHash.get(hash)!;
                    const replacement = toOutputFilePathInJS(
                        filename,
                        'asset',
                        chunk.fileName,
                        'js',
                        resolvedConfig,
                        toRelativeRuntime
                    );
                    const replacementString =
                        typeof replacement === 'string'
                            ? JSON.stringify(encodeURIPath(replacement)).slice(1, -1)
                            : `"+${replacement.runtime}+"`;
                    s.update(match.index, match.index + full.length, replacementString);
                    match = workerAssetUrlRE.exec(code);
                }
            }
            return result();
        },

        generateBundle(_, bundle) {
            if (isWorker) {
                return;
            }
            const workerMap = workerCache.get(resolvedConfig)!;
            for (const asset of workerMap.assets.values()) {
                const duplicateAsset = bundle[asset.fileName];
                if (duplicateAsset) {
                    const content = duplicateAsset.type === 'asset' ? duplicateAsset.source : duplicateAsset.code;
                    // don't emit if the file name and the content is same
                    if (isSameContent(content, asset.source)) {
                        return;
                    }
                }

                this.emitFile({
                    type: 'asset',
                    fileName: asset.fileName,
                    source: asset.source
                });
            }
            workerMap.assets.clear();
        }
    };
}
