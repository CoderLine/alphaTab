import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs';

import { defineConfig, LibraryOptions, Plugin, UserConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import server from './vite.plugin.server';
import license from 'rollup-plugin-license';
import copy from 'rollup-plugin-copy';
import type { OutputOptions } from 'rollup';
import typescript, { RollupTypescriptOptions } from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import ts from 'typescript';
import generateDts from './vite.plugin.dts';
import MagicString from 'magic-string';
import { elementStyleUsingTransformer } from './scripts/element-style-transformer';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function getGitBranch(): string {
    const filepath = '.git/HEAD';
    if (!fs.existsSync(filepath)) {
        throw new Error('.git/HEAD does not exist');
    }
    const buf = fs.readFileSync(filepath);
    const match = /ref: refs\/heads\/([^\n]+)/.exec(buf.toString());
    return match ? match[1] : '';
}

function dtsPathsTransformer(mapping: Record<string, string>) {
    const mapPath = (filePath, input: string): string | undefined => {
        for (const [k, v] of Object.entries(mapping)) {
            if (input.startsWith(k)) {
                const absoluteFile = path.resolve(v, input.substring(k.length));
                return './' + path.relative(path.dirname(filePath), absoluteFile).replaceAll('\\', '/');
            }
        }
        return undefined;
    };

    return (context: ts.TransformationContext) => {
        return (source: ts.SourceFile | ts.Bundle) => {
            const sourceFilePath = ts.isSourceFile(source) ? source.fileName : source.sourceFiles[0];

            const visitor = (node: ts.Node) => {
                if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                    const mapped = mapPath(sourceFilePath, node.moduleSpecifier.text);
                    if (mapped) {
                        return ts.factory.createExportDeclaration(
                            node.modifiers,
                            node.isTypeOnly,
                            node.exportClause,
                            ts.factory.createStringLiteral(mapped),
                            node.attributes
                        );
                    }
                    return node;
                } else if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
                    const mapped = mapPath(sourceFilePath, node.moduleSpecifier.text);
                    if (mapped) {
                        return ts.factory.createImportDeclaration(
                            node.modifiers,
                            node.importClause,
                            ts.factory.createStringLiteral(mapped),
                            node.attributes
                        );
                    }
                    return node;
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitEachChild(source, visitor, context);
        };
    };
}

export default defineConfig(({ command, mode }) => {
    if (command === 'serve') {
        return {
            plugins: [
                tsconfigPaths(),
                typescript({
                    tsconfig: './tsconfig.json',
                    transformers: {
                        before: [elementStyleUsingTransformer()]
                    }
                }),
                server()
            ],
            server: {
                open: '/playground/control.html'
            },
            esbuild: false
            // esbuild: {
            //     supported: {
            //         using: false
            //     },

            // }
        };
    } else {
        const commonOutput: Partial<OutputOptions> = {
            globals: {
                jQuery: 'jQuery'
            }
        };

        const config: UserConfig = {
            esbuild: false,
            plugins: [
                license({
                    banner: {
                        commentStyle: 'ignored',
                        content: {
                            file: 'LICENSE.header',
                        },
                        data() {
                            let buildNumber = process.env.GITHUB_RUN_NUMBER || 0;
                            let gitBranch = getGitBranch();
                            return {
                                branch: gitBranch,
                                build: buildNumber
                            };
                        }
                    }
                }),
                copy({
                    targets: [
                        { src: 'font/bravura/*', dest: 'dist/font' },
                        { src: 'font/sonivox/*', dest: 'dist/soundfont' }
                    ]
                })
            ],
            build: {
                emptyOutDir: false,
                lib: {
                    entry: {
                        'alphaTab.core': path.resolve(__dirname, 'src/alphaTab.core.ts'),
                        alphaTab: path.resolve(__dirname, 'src/alphaTab.main.ts'),
                        'alphaTab.worker': path.resolve(__dirname, 'src/alphaTab.worker.ts'),
                        'alphaTab.worklet': path.resolve(__dirname, 'src/alphaTab.worklet.ts')
                    },
                    name: 'alphaTab'
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

        const enableTypeScript = (o: Partial<RollupTypescriptOptions> = {}, types: boolean = false) => {
            config.plugins!.unshift(
                tsconfigPaths(),
                typescript({
                    tsconfig: './tsconfig.json',
                    ...(types
                        ? {
                              declaration: true,
                              declarationMap: true,
                              declarationDir: './dist/types'
                          }
                        : {}),
                    ...o,
                    transformers: {
                        before: [elementStyleUsingTransformer()],
                        afterDeclarations: [
                            dtsPathsTransformer({
                                '@src/': path.resolve(__dirname, 'src')
                            })
                        ]
                    }
                })
            );
        };

        const umd = (
            name: string,
            entry: string,
            tsOptions: RollupTypescriptOptions,
            cjs?: boolean,
            withMin?: boolean
        ) => {
            enableTypeScript(tsOptions, false);

            lib.entry = {
                [name]: path.resolve(__dirname, entry)
            };
            config.plugins!.push({
                name: 'import-meta',
                resolveImportMeta() {
                    return '{}'; // prevent import.meta to be empty in non ES outputs
                }
            });
            (config.build!.rollupOptions!.output as OutputOptions[]).push({
                ...commonOutput,
                dir: 'dist/',
                format: cjs ? 'cjs' : 'umd',
                name: name,
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js'
            });

            if (withMin) {
                (config.build!.rollupOptions!.output as OutputOptions[]).push({
                    ...commonOutput,
                    dir: 'dist/',
                    format: cjs ? 'cjs' : 'umd',
                    name: name,
                    plugins: [terser()],
                    entryFileNames: '[name].min.js',
                    chunkFileNames: '[name].min.js'
                });
            }
        };

        const esm = (name: string, entry: string, tsOptions: RollupTypescriptOptions, withMin: boolean = true) => {
            enableTypeScript(tsOptions, true);

            lib.entry = {
                [name]: path.resolve(__dirname, entry)
            };

            (config.build!.rollupOptions!.external as string[]).push('@src/alphaTab.core');

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
                                if (
                                    file.endsWith('.mjs') &&
                                    chunk.type === 'chunk' &&
                                    chunk.isEntry &&
                                    !chunk.facadeModuleId!.endsWith('alphaTab.core.ts')
                                ) {
                                    this.info(`Creating types for bundle ${file}`);
                                    generateDts(__dirname, chunk.facadeModuleId!, file.replace('.mjs', '.d.ts'));
                                }
                            }
                        }
                    }
                ]
            });

            if (withMin) {
                (config.build!.rollupOptions!.output as OutputOptions[]).push({
                    ...commonOutput,
                    dir: 'dist/',
                    format: 'es',
                    plugins: [terser()],
                    entryFileNames: '[name].min.mjs',
                    chunkFileNames: '[name].min.mjs'
                });
            }
        };

        const lib = config.build!.lib! as LibraryOptions;

        // TODO: move to a monorepo style repository and isolate packages
        const viteOptions: RollupTypescriptOptions = {
            include: ['src/*.vite.ts', 'src/vite/**']
        };

        const webpackOptions: RollupTypescriptOptions = {
            include: ['src/*.webpack.ts', 'src/webpack/**']
        };

        switch (mode) {
            case 'vite-cjs':
                umd('alphaTab.vite', 'src/alphaTab.vite.ts', viteOptions, true, false);
                break;
            case 'vite-esm':
                esm('alphaTab.vite', 'src/alphaTab.vite.ts', viteOptions, false);
                break;
            case 'webpack-cjs':
                umd('alphaTab.webpack', 'src/alphaTab.webpack.ts', webpackOptions, true, false);
                break;
            case 'webpack-esm':
                esm('alphaTab.webpack', 'src/alphaTab.webpack.ts', webpackOptions, false);
                break;
            case 'umd':
                umd('alphaTab', 'src/alphaTab.main.ts', {}, false, true);
                break;
            default:
            case 'esm':
                // ensure we have file extensions in the URL worker resolve area
                const adjustScriptPathsPlugin = (min: boolean) => {
                    return {
                        name: 'adjust-script-paths',
                        renderChunk(code, chunk) {
                            const modifiedCode = new MagicString(code);
                            const extension = min ? '.min.mjs' : '.mjs';
                            modifiedCode
                                 .replaceAll(/(@src|\.)\/alphaTab\.(core|worker|worklet)(\.ts)?(['"])/g, 
                                    `./alphaTab.$2${extension}$4`)

                            return {
                                code: modifiedCode.toString(),
                                map: modifiedCode.generateMap()
                            };
                        }
                    } satisfies Plugin;
                };

                esm('alphaTab', 'src/alphaTab.main.ts', {});
                lib.entry['alphaTab.core'] = path.resolve(__dirname, 'src/alphaTab.core.ts');
                lib.entry['alphaTab.worker'] = path.resolve(__dirname, 'src/alphaTab.worker.ts');
                lib.entry['alphaTab.worklet'] = path.resolve(__dirname, 'src/alphaTab.worklet.ts');

                for (const output of config.build!.rollupOptions!.output as OutputOptions[]) {
                    const isMin = (output.entryFileNames as string).includes('.min');
                    (output.plugins as Plugin[]).push(adjustScriptPathsPlugin(isMin));
                }
                break;
        }

        return config;
    }
});
