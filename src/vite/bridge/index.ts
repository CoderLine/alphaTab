/**@target web */

// The files in this folder contain a wide range of internal functions we adapted or copy/pasted from
// vite. Many of these functions are not exposed but needed to rebuild/adapt the worker
// plugin. We hope to get the official worker and custom syntax support into
// vite directly, but progress there is rather slow.

// So we adapted the original plugins and customized them to our needs of alphaTab.
// We try to reference as good as possible the origin of every function.

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

export type { Plugin } from 'vite';
export { fileToUrl } from '@src/vite/bridge/asset';
export { createToImportMetaURLBasedRelativeRuntime, toOutputFilePathInJS } from '@src/vite/bridge/build';
export type { ResolvedConfig } from '@src/vite/bridge/config';
export { ENV_PUBLIC_PATH } from '@src/vite/bridge/constants';
export { evalValue, cleanUrl, injectQuery, encodeURIPath } from '@src/vite/bridge/utils';
export { tryFsResolve } from '@src/vite/bridge/resolve';
export { tryOptimizedDepResolve } from '@src/vite/bridge/optimizer';
export {
    AlphaTabWorkerTypes,
    WORKER_ASSET_ID,
    WORKER_FILE_ID,
    workerFileToUrl,
    workerCache,
    isSameContent
} from '@src/vite/bridge/worker';
