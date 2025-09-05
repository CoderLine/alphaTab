import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import terser from '@rollup/plugin-terser';
import typescript, { RollupTypescriptOptions } from '@rollup/plugin-typescript';
import MagicString from 'magic-string';
import type { OutputOptions } from 'rollup';
import { viteStaticCopy } from 'vite-plugin-static-copy'
import license from 'rollup-plugin-license';
import ts from 'typescript';
import { defineConfig, LibraryOptions, Plugin, UserConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { elementStyleUsingTransformer } from './scripts/element-style-transformer';
import generateDts from './vite.plugin.dts';

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

export default defineConfig(({ mode }) => {
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
            viteStaticCopy({
                targets: [
                    { src: 'font/bravura/*', dest: 'font/' },
                    { src: 'font/sonivox/*', dest: 'soundfont/' }
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

    switch (mode) {
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
});
