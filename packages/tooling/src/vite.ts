import fs from 'node:fs';
import path from 'node:path';
import { cwd } from 'node:process';
import url from 'node:url';
import typescript, { type RollupTypescriptOptions } from '@rollup/plugin-typescript';
import type { OutputChunk, OutputOptions, OutputPlugin } from 'rollup';
import license from 'rollup-plugin-license';
import { nodeExternals } from 'rollup-plugin-node-externals';
import type { MinifyOptions } from 'terser';
import ts from 'typescript';
import { defineConfig, type LibraryOptions, type UserConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { createApiDtsFiles } from './typescript';
import generateDts from './vite.plugin.dts';
import min from './vite.plugin.min';

const terserOptions: MinifyOptions = {
    mangle: {
        properties: {
            regex: /^_/
        }
    }
};

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

export function defineEsmAndCommonJsConfig(entry: string) {
    return defineConfig(({ mode }) => {
        const config = defaultBuildUserConfig();

        const libName = path.parse(entry).name;

        switch (mode) {
            case 'cjs':
                commonjs(config, __dirname, libName, entry);
                break;
            // case 'esm':
            default:
                esm(config, __dirname, libName, entry);
                break;
        }

        return config;
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
                external: [
                    'jQuery',
                    'vite',
                    'rollup',
                    /node:\w+/,
                    'child_process',
                    'fs',
                    'path',
                    'url',
                    'os',
                    'crypto',
                    'net'
                ],
                output: [],
                onLog(level, log, handler) {
                    switch (log.code) {
                        case 'CIRCULAR_DEPENDENCY': // Ignore circular dependency warnings
                        case 'EMPTY_BUNDLE': // ignore empty bundles
                            return;
                    }
                    handler(level, log);
                }
            }
        }
    };
}

export function enableTypeScript(config: UserConfig, o: Partial<RollupTypescriptOptions> = {}, types: boolean = false) {
    config.plugins!.unshift(
        tsconfigPaths(),
        typescript({
            tsconfig: './tsconfig.json',
            ...o,
            ...(types
                ? {
                      declaration: true,
                      declarationMap: false,
                      declarationDir: './dist/types'
                  }
                : {}),
            include: ['**/*.ts']
        })
    );
}

export function umd(
    config: UserConfig,
    projectDir: string,
    name: string,
    entry: string,
    tsOptions: RollupTypescriptOptions = {},
    withMin: boolean = true
) {
    enableTypeScript(config, tsOptions, false);
    const lib = config.build!.lib! as LibraryOptions;
    lib.entry = {
        [name]: path.resolve(projectDir, entry)
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
        for (const output of config.build!.rollupOptions!.output as OutputOptions[]) {
            output.plugins ??= [];
            (output.plugins as OutputPlugin[]).push(min(terserOptions));
        }
    }
}

export function commonjs(
    config: UserConfig,
    projectDir: string,
    name: string,
    entry: string,
    tsOptions: RollupTypescriptOptions = {}
) {
    enableTypeScript(config, tsOptions, false);
    const lib = config.build!.lib! as LibraryOptions;
    lib.entry = {
        [name]: path.resolve(projectDir, entry)
    };
    (config.build!.rollupOptions!.output as OutputOptions[]).push({
        globals: {
            jQuery: 'jQuery'
        },
        dir: 'dist/',
        format: 'cjs',
        name: name,
        entryFileNames: '[name].js'
    });
}

export function esm(
    config: UserConfig,
    projectDir: string,
    name: string,
    entry: string,
    tsOptions: RollupTypescriptOptions = {},
    shouldCreateDts: (chunk: OutputChunk) => boolean = () => true,
    withMin: boolean = true
) {
    enableTypeScript(config, tsOptions, true);
    const lib = config.build!.lib! as LibraryOptions;
    const libEntry = lib.entry! as Record<string, string>;
    libEntry[name] = path.resolve(projectDir, entry);

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
                async writeBundle(options, bundle) {
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
                            const originalFilePath = path.parse(path.relative(process.cwd(), chunk.facadeModuleId!));
                            const dtsSubPath = `${originalFilePath.dir}/${originalFilePath.name}.d.ts`;
                            const dtsBundleFile = files.find(f => f.endsWith(dtsSubPath));
                            if (dtsBundleFile) {
                                generateDts(
                                    projectDir,
                                    path.resolve(options.dir!, dtsBundleFile)!,
                                    path.resolve(options.dir!, file.replace('.mjs', '.d.ts'))
                                );
                            } else {
                                this.error('Could not find entry d.ts');
                            }
                        }
                    }
                }
            }
        ]
    });

    if (withMin) {
        for (const output of config.build!.rollupOptions!.output as OutputOptions[]) {
            (output.plugins as OutputPlugin[]).push(min(terserOptions));
        }
    }
}

export function dtsPathsTransformer(mapping?: Record<string, string>, externals?: (string | RegExp)[]) {
    return (context: ts.TransformationContext) => {
        if (!mapping) {
            mapping = {};
            const options = context.getCompilerOptions();
            if (options.paths) {
                for (const [k, v] of Object.entries(options.paths)) {
                    if (k.endsWith('*') && v[0].endsWith('*')) {
                        mapping[k.substring(0, k.length - 1)] = v[0].substring(0, v[0].length - 1);
                    }
                }
            }
        }

        const isExternal = (input: string) => {
            if (!externals) {
                return false;
            }

            for (const e of externals) {
                if (typeof e === 'string') {
                    return input === e;
                } else if (e instanceof RegExp) {
                    return e.test(input);
                }
            }
            return false;
        };

        const mapPath = (filePath: string, input: string): string | undefined => {
            for (const [k, v] of Object.entries(mapping!)) {
                if (input.startsWith(k) && !isExternal(input)) {
                    const absoluteFile = path.resolve(v, input.substring(k.length));
                    return `./${path.relative(path.dirname(filePath), absoluteFile).replaceAll('\\', '/')}`;
                }
            }
            return undefined;
        };

        return (source: ts.SourceFile | ts.Bundle) => {
            const sourceFilePath = ts.isSourceFile(source) ? source.fileName : source.sourceFiles[0].fileName;

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

export function defineEsmLibConfig() {
    return defineConfig(() => {
        const config = defaultBuildUserConfig();
        enableTypeScript(
            config,
            {
                transformers: {
                    afterDeclarations: [dtsPathsTransformer()]
                }
            },
            true
        );
        const lib = config.build!.lib! as LibraryOptions;
        const libEntry = lib.entry! as Record<string, string>;

        config.plugins!.push(nodeExternals());
        for (const file of fs.globSync('src/**/*.ts')) {
            libEntry[path.relative('src', file.slice(0, file.length - path.extname(file).length))] = file;
        }

        const output = config.build!.rollupOptions!.output as OutputOptions[];

        output.push({
            dir: 'dist/',
            format: 'es',
            entryFileNames: '[name].mjs',
            chunkFileNames: '[name].mjs',
            plugins: [
                {
                    name: 'dts',
                    async writeBundle(config, bundle) {
                        const files = Object.keys(bundle);
                        const dtsBaseDir = path.resolve(config.dir!, 'types', 'src');
                        const dtsFiles = files
                            .filter(f => f.endsWith('d.ts') && f.startsWith('types/src/'))
                            .map(f => path.resolve(config.dir!, f));
                        const ctx = this;
                        await createApiDtsFiles(dtsBaseDir, dtsFiles, cwd(), config.dir!, {
                            error(message) {
                                ctx.error(message);
                            },
                            info(message) {
                                ctx.info(message);
                            },
                            log(message) {
                                ctx.debug(message);
                            },
                            warn(message) {
                                ctx.warn(message);
                            }
                        });
                    }
                }
            ]
        });
        return config;
    });
}
