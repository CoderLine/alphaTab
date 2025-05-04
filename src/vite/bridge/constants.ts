/**@target web */

import type { RollupPluginHooks } from '@src/vite/bridge/typeUtils';

// index.ts for more details on contents and license of this file

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/constants.ts#L143
export const METADATA_FILENAME = '_metadata.json';

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/constants.ts#L63
export const ENV_PUBLIC_PATH = '/@vite/env';

// https://github.com/vitejs/vite/blob/v6.1.1/packages/vite/src/node/constants.ts#L10C1-L38C32
export const ROLLUP_HOOKS = [
    'options',
    'buildStart',
    'buildEnd',
    'renderStart',
    'renderError',
    'renderChunk',
    'writeBundle',
    'generateBundle',
    'banner',
    'footer',
    'augmentChunkHash',
    'outputOptions',
    'renderDynamicImport',
    'resolveFileUrl',
    'resolveImportMeta',
    'intro',
    'outro',
    'closeBundle',
    'closeWatcher',
    'load',
    'moduleParsed',
    'watchChange',
    'resolveDynamicImport',
    'resolveId',
    'shouldTransformCachedModule',
    'transform',
    'onLog'
] satisfies RollupPluginHooks[];
