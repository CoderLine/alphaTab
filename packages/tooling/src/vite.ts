import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import terser from '@rollup/plugin-terser';
import typescript, { type RollupTypescriptOptions } from '@rollup/plugin-typescript';
import type { OutputChunk, OutputOptions } from 'rollup';
import license from 'rollup-plugin-license';
import ts from 'typescript';
import type { LibraryOptions, UserConfig } from 'vite';
import generateDts from './vite.plugin.dts.ts';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

let repositoryRoot = __dirname;
while (!fs.existsSync(path.resolve(repositoryRoot, '.git'))) {
    const parent = path.resolve(repositoryRoot, '..');
    if (parent === repositoryRoot) {
        throw new Error('Could not find repository root');
    }
    repositoryRoot = parent;
}

function getGitBranch(): string {
    const filepath = path.resolve(repositoryRoot, '.git/HEAD');
    if (!fs.existsSync(filepath)) {
        throw new Error('.git/HEAD does not exist');
    }
    const buf = fs.readFileSync(filepath);
    const match = /ref: refs\/heads\/([^\n]+)/.exec(buf.toString());
    return match ? match[1] : '';
}

export function licenseHeaderPlugin() {
    return license({
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
    });
}

export function defaultBuildUserConfig(): UserConfig {
    return {
        esbuild: false,
        plugins: [licenseHeaderPlugin()],
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
}

export function enableTypeScript(config: UserConfig, o: Partial<RollupTypescriptOptions> = {}, types: boolean = false) {
    config.plugins!.unshift(
        typescript({
            tsconfig: './tsconfig.json',
            ...o,
            ...(types
                ? {
                      declaration: true,
                      declarationMap: true,
                      declarationDir: './dist/types'
                  }
                : {})
        })
    );
}

export function umd(
    config: UserConfig,
    name: string,
    entry: string,
    tsOptions: RollupTypescriptOptions = {},
    withMin: boolean = true
) {
    enableTypeScript(config, tsOptions, false);
    const lib = config.build!.lib! as LibraryOptions;
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
        globals: {
            jQuery: 'jQuery'
        },
        dir: 'dist/',
        format: 'umd',
        name: name,
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js'
    });

    if (withMin) {
        (config.build!.rollupOptions!.output as OutputOptions[]).push({
            globals: {
                jQuery: 'jQuery'
            },
            dir: 'dist/',
            format: 'umd',
            name: name,
            plugins: [terser()],
            entryFileNames: '[name].min.js',
            chunkFileNames: '[name].min.js'
        });
    }
}

export function commonjs(config: UserConfig, name: string, entry: string, tsOptions: RollupTypescriptOptions = {}) {
    enableTypeScript(config, tsOptions, false);
    const lib = config.build!.lib! as LibraryOptions;
    lib.entry = {
        [name]: path.resolve(__dirname, entry)
    };
    (config.build!.rollupOptions!.output as OutputOptions[]).push({
        globals: {
            jQuery: 'jQuery'
        },
        dir: 'dist/',
        format: 'cjs',
        name: name,
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js'
    });
}

export function esm(
    config: UserConfig,
    name: string,
    entry: string,
    tsOptions: RollupTypescriptOptions = {},
    shouldCreateDts: (chunk: OutputChunk) => boolean = () => true,
    withMin: boolean = true
) {
    enableTypeScript(config, tsOptions, true);
    const lib = config.build!.lib! as LibraryOptions;

    lib.entry = {
        [name]: path.resolve(__dirname, entry)
    };

    (config.build!.rollupOptions!.output as OutputOptions[]).push({
        globals: {
            jQuery: 'jQuery'
        },
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
                            shouldCreateDts(chunk)
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
            globals: {
                jQuery: 'jQuery'
            },
            dir: 'dist/',
            format: 'es',
            plugins: [terser()],
            entryFileNames: '[name].min.mjs',
            chunkFileNames: '[name].min.mjs'
        });
    }
}

export function dtsPathsTransformer(mapping: Record<string, string>) {
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
