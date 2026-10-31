import type { Plugin } from 'vite';
import type { AlphaTabVitePluginOptions } from './AlphaTabVitePluginOptions';
import { copyAssetsPlugin } from './copyAssetsPlugin';
import { detectionGlobalPlugin } from './detectionGlobalPlugin';
import { importMetaUrlPlugin } from './importMetaPlugin';

/**
 * @public
 */
export function alphaTab(options?: AlphaTabVitePluginOptions): Plugin[] {
    options ??= {};
    return [detectionGlobalPlugin(), importMetaUrlPlugin(options), copyAssetsPlugin(options)];
}
