/**@target web */

import type { Plugin, ResolvedConfig } from '@src/vite/bridge';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as url from 'node:url';

import type { AlphaTabVitePluginOptions } from '@src/vite/AlphaTabVitePluginOptions';

export function copyAssetsPlugin(options: AlphaTabVitePluginOptions): Plugin {
    let resolvedConfig: ResolvedConfig;
    let output = false;

    return {
        name: 'vite-plugin-alphatab-copy',
        enforce: 'pre',
        configResolved(config) {
            resolvedConfig = config as ResolvedConfig;
        },
        buildEnd() {
            // reset for watch mode
            output = false;
        },
        async buildStart() {
            // run copy only once even if multiple bundles are generated
            if (output) {
                return;
            }
            output = true;

            let alphaTabSourceDir = options.alphaTabSourceDir;
            if (!alphaTabSourceDir) {
                try {
                    const isEsm = typeof import.meta.url === 'string';
                    if (isEsm) {
                        alphaTabSourceDir = url.fileURLToPath(import.meta.resolve('@coderline/alphatab'));
                    } else {
                        alphaTabSourceDir = require.resolve('@coderline/alphatab');
                    }

                    alphaTabSourceDir = path.resolve(alphaTabSourceDir, '..');
                } catch (e) {
                    alphaTabSourceDir = path.join(resolvedConfig.root, 'node_modules/@coderline/alphatab/dist/');
                }
            }

            let isValidAlphaTabSourceDir: boolean;

            if (alphaTabSourceDir) {
                try {
                    await fs.promises.access(path.join(alphaTabSourceDir, 'alphaTab.mjs'), fs.constants.F_OK);
                    isValidAlphaTabSourceDir = true;
                } catch (e) {
                    isValidAlphaTabSourceDir = false;
                }
            } else {
                isValidAlphaTabSourceDir = false;
            }

            if (!isValidAlphaTabSourceDir) {
                resolvedConfig.logger.error(
                    'Could not find alphaTab, please ensure it is installed into node_modules or configure alphaTabSourceDir'
                );
                return;
            }

            const outputPath = (options.assetOutputDir ?? resolvedConfig.publicDir) as string;
            if (!outputPath) {
                return;
            }

            async function copyFiles(subdir: string): Promise<void> {
                const fullDir = path.join(alphaTabSourceDir!, subdir);

                const files = await fs.promises.readdir(fullDir, {
                    withFileTypes: true
                });

                await fs.promises.mkdir(path.join(outputPath, subdir), {
                    recursive: true
                });

                await Promise.all(
                    files
                        .filter(f => f.isFile())
                        .map(async file => {
                            // node v20.12.0 has parentPath pointing to the path (not the file)
                            // see https://github.com/nodejs/node/pull/50976
                            const sourceFilename = path.join(file.parentPath ?? file.path, file.name);
                            await fs.promises.copyFile(sourceFilename, path.join(outputPath!, subdir, file.name));
                        })
                );
            }

            await Promise.all([copyFiles('font'), copyFiles('soundfont')]);
        }
    };
}
