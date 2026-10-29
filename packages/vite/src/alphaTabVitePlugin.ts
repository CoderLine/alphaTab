import { detectionGlobalPlugin } from '@coderline/alphatab-vite/detectionGlobalPlugin';
import type { Plugin } from 'vite';
import type { AlphaTabVitePluginOptions } from './AlphaTabVitePluginOptions';
import { copyAssetsPlugin } from './copyAssetsPlugin';
import { importMetaUrlPlugin } from './importMetaPlugin';
import { workerPlugin } from './workerPlugin';

/**
 * @public
 */
export function alphaTab(options?: AlphaTabVitePluginOptions) {
    const plugins: Plugin[] = [];

    options ??= {};

    plugins.push(detectionGlobalPlugin());
    plugins.push(importMetaUrlPlugin(options));
    plugins.push(workerPlugin(options));
    plugins.push(copyAssetsPlugin(options));

    return plugins;
}
