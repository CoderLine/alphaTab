import type { AlphaTabVitePluginOptions } from './AlphaTabVitePluginOptions';
import type { Plugin } from './bridge';
import { copyAssetsPlugin } from './copyAssetsPlugin';
import { importMetaUrlPlugin } from './importMetaPlugin';
import { workerPlugin } from './workerPlugin';

export function alphaTab(options?: AlphaTabVitePluginOptions) {
    const plugins: Plugin[] = [];

    options ??= {};

    plugins.push(importMetaUrlPlugin(options));
    plugins.push(workerPlugin(options));
    plugins.push(copyAssetsPlugin(options));

    return plugins;
}
