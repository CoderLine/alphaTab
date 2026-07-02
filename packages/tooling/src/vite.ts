import fs from 'node:fs';
import path from 'node:path';
import { cwd } from 'node:process';
import url from 'node:url';
import type { OutputChunk, OutputOptions, OutputPlugin } from 'rollup';
import license from 'rollup-plugin-license';
import { nodeExternals } from 'rollup-plugin-node-externals';
import type { MinifyOptions } from 'terser';
import ts from 'typescript';
import { defineConfig, type LibraryOptions, type UserConfig } from 'vite';
import { createApiDtsFiles } from './typescript';
import generateDts from './vite.plugin.dts';
import { emitDtsPlugin } from './vite.plugin.emit-dts';
import min from './vite.plugin.min';
import { stripProfilingPlugin } from './vite.plugin.strip-profiling';
import { elementStyleUsingPlugin } from './vite.plugin.transform';

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

/**
 * Builds Vite `resolve.alias` entries from the project's `tsconfig.json`
 * `compilerOptions.paths`. `tsconfig.base.json` is the single source of truth;
 * `ts.parseJsonConfigFileContent` handles the `extends` chain and the
 * `${configDir}` template substitution.
 */
function escapeRegExp(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildTsconfigAliases(projectDir: string): Array<{ find: RegExp; replacement: string }> {
    const tsconfigPath = ts.findConfigFile(projectDir, ts.sys.fileExists);
    if (!tsconfigPath) {
        return [];
    }
    const { config, error } = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    if (error || !config) {
        return [];
    }
    const parsed = ts.parseJsonConfigFileContent(config, ts.sys, path.dirname(tsconfigPath));
    const aliases: Array<{ find: RegExp; replacement: string }> = [];
    for (const [pattern, targets] of Object.entries(parsed.options.paths ?? {})) {
        const target = targets?.[0];
        if (!target) {
            continue;
        }
        if (pattern.endsWith('/*') && target.endsWith('/*')) {
            aliases.push({
                find: new RegExp(`^${escapeRegExp(pattern.slice(0, -2))}/(.*)$`),
                replacement: `${target.slice(0, -2)}/$1`
            });
        } else {
            aliases.push({ find: new RegExp(`^${escapeRegExp(pattern)}$`), replacement: target });
        }
    }
    return aliases;
}

export function defaultBuildUserConfig(projectDir: string = process.cwd()): UserConfig {
    return {
        plugins: [licenseHeaderPlugin(), elementStyleUsingPlugin(), stripProfilingPlugin({ enabled: false })],
        resolve: {
            tsconfigPaths: true,
            alias: buildTsconfigAliases(projectDir)
        },
        oxc: {
            // skip pre-built `.js` and `.d.ts` chunks; oxc only needs the TS sources.
            exclude: [/\.js$/, /\.d\.[cm]?ts$/]
        },
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
                    'net',
                    /^vscode/
                ],
                output: [],
                onLog(level, log, handler) {
                    switch (log.code) {
                        case 'CIRCULAR_DEPENDENCY': // ignore circular dependency warnings
                        case 'EMPTY_BUNDLE': // ignore empty bundles
                        case 'EMPTY_IMPORT_META': // rolldown's automatic `{}` substitution in non-ESM
                            return;
                    }
                    handler(level, log);
                }
            }
        }
    };
}

export interface DtsRegistration {
    /**
     * Predicate that returns `false` for ESM entry chunks whose bundled `.d.ts`
     * should NOT be emitted (internal split-build entries that are not part of
     * the public type surface but still ship as JS chunks).
     */
    shouldEmitForChunk?: (chunk: OutputChunk) => boolean;
    /** Override the tsconfig used for declaration emission. */
    tsconfigPath?: string;
}

/**
 * Wires the DTS pipeline:
 * - {@link emitDtsPlugin} drives `ts.createProgram` to emit per-source `.d.ts`
 *   under `dist/types/` with {@link dtsPathsTransformer} applied.
 * - An output-side `writeBundle` plugin walks each ESM entry chunk and calls
 *   api-extractor to produce the published bundled `dist/<name>.d.ts`.
 */
export function addDts(config: UserConfig, projectDir: string, options: DtsRegistration = {}) {
    const tsconfigPath = options.tsconfigPath ?? path.resolve(projectDir, 'tsconfig.json');
    const declarationDir = path.resolve(projectDir, 'dist/types');
    const srcDir = path.resolve(projectDir, 'src');
    const shouldEmitForChunk = options.shouldEmitForChunk ?? (() => true);

    config.plugins!.push(
        emitDtsPlugin({ projectDir, tsconfigPath, declarationDir: 'dist/types' })
    );

    const externals = config.build!.rollupOptions!.external! as (string | RegExp)[];

    const output = config.build!.rollupOptions!.output as OutputOptions[];
    const ensureBundlingPlugin = (o: OutputOptions) => {
        o.plugins ??= [];
        (o.plugins as OutputPlugin[]).push({
            name: 'alphatab:bundle-dts',
            async writeBundle(opts, bundle) {
                for (const fileName of Object.keys(bundle)) {
                    const chunk = bundle[fileName];
                    if (
                        chunk.type !== 'chunk' ||
                        !chunk.isEntry ||
                        !fileName.endsWith('.mjs') ||
                        !shouldEmitForChunk(chunk)
                    ) {
                        continue;
                    }
                    // intermediates mirror the entry's path relative to src/ (rootDir).
                    const relative = path.parse(path.relative(srcDir, chunk.facadeModuleId!));
                    const intermediate = path.join(declarationDir, relative.dir, `${relative.name}.d.ts`);
                    if (!fs.existsSync(intermediate)) {
                        this.error(`Could not find intermediate d.ts at ${intermediate}`);
                    }
                    const outFile = path.resolve(opts.dir!, fileName.replace(/\.mjs$/, '.d.ts'));
                    generateDts(projectDir, intermediate, outFile, externals);
                }
            }
        });
    };

    for (const o of output) {
        if (o.format === 'es' || o.format === 'esm') {
            ensureBundlingPlugin(o);
        }
    }
}

export function umd(
    config: UserConfig,
    projectDir: string,
    name: string,
    entry: string,
    withMin: boolean = true
) {
    const lib = config.build!.lib! as LibraryOptions;
    lib.entry = {
        [name]: path.resolve(projectDir, entry)
    };

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

export function commonjs(config: UserConfig, projectDir: string, name: string, entry: string) {
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
        entryFileNames: '[name].cjs'
    });
}

export interface EsmOptions {
    withMin?: boolean;
}

export function esm(
    config: UserConfig,
    projectDir: string,
    name: string,
    entry: string,
    options: EsmOptions = {}
) {
    const { withMin = true } = options;

    const lib = config.build!.lib! as LibraryOptions;
    const libEntry = lib.entry! as Record<string, string>;
    libEntry[name] = path.resolve(projectDir, entry);

    const output = config.build!.rollupOptions!.output as OutputOptions[];
    if (!output.some(o => o.format === 'es')) {
        output.push({
            globals: {
                jQuery: 'jQuery'
            },
            dir: 'dist/',
            format: 'es',
            entryFileNames: '[name].mjs',
            chunkFileNames: '[name].mjs'
        });
    }

    if (withMin) {
        for (const o of output) {
            o.plugins ??= [];
            (o.plugins as OutputPlugin[]).push(min(terserOptions));
        }
    }
}

export function defineEsmCjsLibConfig(setup?: (config: UserConfig) => void) {
    return defineEsmLibConfig(config => {
        const output = config.build!.rollupOptions!.output as OutputOptions[];

        output.push({
            dir: 'dist/',
            format: 'cjs',
            entryFileNames: '[name].cjs',
            chunkFileNames: '[name].cjs'
        });

        setup?.(config);
        return config;
    });
}

export function defineEsmLibConfig(setup?: (config: UserConfig) => void) {
    return defineConfig(() => {
        const projectDir = cwd();
        const config = defaultBuildUserConfig(projectDir);

        const lib = config.build!.lib! as LibraryOptions;
        const libEntry = lib.entry! as Record<string, string>;

        config.plugins!.push(nodeExternals());
        for (const file of fs.globSync('src/**/*.ts')) {
            libEntry[path.relative('src', file.slice(0, file.length - path.extname(file).length))] = file;
        }

        const declarationDir = path.resolve(projectDir, 'dist/types');
        config.plugins!.push(emitDtsPlugin({ projectDir, declarationDir: 'dist/types' }));

        const esmOutput: OutputOptions = {
            dir: 'dist/',
            format: 'es',
            entryFileNames: '[name].mjs',
            chunkFileNames: '[name].mjs',
            plugins: [
                {
                    name: 'alphatab:filter-per-file-dts',
                    async writeBundle(opts) {
                        const dtsBaseDir = declarationDir;
                        if (!fs.existsSync(dtsBaseDir)) {
                            this.error(`Expected declaration directory ${dtsBaseDir} to exist`);
                        }
                        const dtsFiles: string[] = [];
                        const collect = (dir: string) => {
                            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                                const full = path.join(dir, entry.name);
                                if (entry.isDirectory()) {
                                    collect(full);
                                } else if (entry.name.endsWith('.d.ts')) {
                                    dtsFiles.push(full);
                                }
                            }
                        };
                        collect(dtsBaseDir);

                        await createApiDtsFiles(dtsBaseDir, dtsFiles, projectDir, path.resolve(opts.dir!), {
                            error: msg => this.error(msg),
                            info: msg => this.info(msg),
                            log: msg => this.debug(msg),
                            warn: msg => this.warn(msg)
                        });
                    }
                }
            ]
        };
        const output = config.build!.rollupOptions!.output as OutputOptions[];
        output.push(esmOutput);

        setup?.(config);
        return config;
    });
}
