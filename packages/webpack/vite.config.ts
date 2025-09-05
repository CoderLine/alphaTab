import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import typescript from '@rollup/plugin-typescript';
import type { OutputOptions } from 'rollup';
import license from 'rollup-plugin-license';
import { defineConfig, type LibraryOptions, type UserConfig } from 'vite';
// TODO monorepo: move to shared package
import generateDts from '../alphatab/vite.plugin.dts';

// TODO monorepo: move to shared package
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function getGitBranch(): string {
    const filepath = path.resolve(__dirname, '..', '..', '.git/HEAD');
    if (!fs.existsSync(filepath)) {
        throw new Error('.git/HEAD does not exist');
    }
    const buf = fs.readFileSync(filepath);
    const match = /ref: refs\/heads\/([^\n]+)/.exec(buf.toString());
    return match ? match[1] : '';
}

export default defineConfig(({ command, mode }) => {
    if (command === 'serve') {
        return {};
    } else {
        const commonOutput: Partial<OutputOptions> = {};
        // TODO monorepo: move to shared package
        const config: UserConfig = {
            esbuild: false,
            plugins: [
                license({
                    banner: {
                        commentStyle: 'ignored',
                        content: {
                            file: 'LICENSE.header'
                        },
                        data() {
                            const buildNumber = process.env.GITHUB_RUN_NUMBER || 0;
                            const gitBranch = getGitBranch();
                            return {
                                branch: gitBranch,
                                build: buildNumber
                            };
                        }
                    }
                })
            ],
            build: {
                emptyOutDir: false,
                lib: {
                    entry: {}
                },
                minify: false,
                rollupOptions: {
                    external: ['jQuery', 'vite', 'rollup', /node:.*/],
                    output: [],
                    onLog(level, log, handler) {
                        if (log.code === 'CIRCULAR_DEPENDENCY') {
                            return; // Ignore circular dependency warnings
                        }
                        handler(level, log);
                    }
                }
            }
        };

        // TODO monorepo: move to shared package
        const enableTypeScript = (types: boolean = false) => {
            config.plugins!.unshift(
                typescript({
                    tsconfig: './tsconfig.json',
                    ...(types
                        ? {
                              declaration: true,
                              declarationMap: true,
                              declarationDir: './dist/types'
                          }
                        : {})
                })
            );
        };

        // TODO monorepo: move to shared package
        const cjs = (name: string, entry: string) => {
            enableTypeScript(false);

            lib.entry = {
                [name]: path.resolve(__dirname, entry)
            };
            (config.build!.rollupOptions!.output as OutputOptions[]).push({
                ...commonOutput,
                dir: 'dist/',
                format: 'cjs',
                name: name,
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js'
            });
        };

        // TODO monorepo: move to shared package
        const esm = (name: string, entry: string) => {
            enableTypeScript(true);

            lib.entry = {
                [name]: path.resolve(__dirname, entry)
            };

            (config.build!.rollupOptions!.output as OutputOptions[]).push({
                ...commonOutput,
                dir: 'dist/',
                format: 'es',
                entryFileNames: '[name].mjs',
                chunkFileNames: '[name].mjs',
                plugins: [
                    {
                        name: 'dts',
                        writeBundle(_, bundle) {
                            const files = Object.keys(bundle);

                            for (const file of files) {
                                const chunk = bundle[file];
                                if (file.endsWith('.mjs') && chunk.type === 'chunk' && chunk.isEntry) {
                                    this.info(`Creating types for bundle ${file}`);
                                    generateDts(__dirname, chunk.facadeModuleId!, file.replace('.mjs', '.d.ts'));
                                }
                            }
                        }
                    }
                ]
            });
        };

        const lib = config.build!.lib! as LibraryOptions;

        switch (mode) {
            case 'cjs':
                cjs('alphaTab.webpack', 'src/alphaTab.webpack.ts');
                break;
            // case 'esm':
            default:
                esm('alphaTab.webpack', 'src/alphaTab.webpack.ts');
                break;
        }

        return config;
    }
});
