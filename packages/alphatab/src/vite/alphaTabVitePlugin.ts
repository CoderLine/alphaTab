/**@target web */

import type { Plugin } from '@src/vite/bridge';
import type { AlphaTabVitePluginOptions } from '@src/vite/AlphaTabVitePluginOptions';
import { importMetaUrlPlugin } from '@src/vite/importMetaPlugin';
import { copyAssetsPlugin } from '@src/vite/copyAssetsPlugin';
import { workerPlugin } from '@src/vite/workerPlugin';

export function alphaTab(options?: AlphaTabVitePluginOptions) {
    const plugins: Plugin[] = [];

    options ??= {};

    plugins.push(importMetaUrlPlugin(options));
    plugins.push(workerPlugin(options));
    plugins.push(copyAssetsPlugin(options));

    return plugins;
}
