import fs from 'node:fs';
import path from 'node:path';
import { rspack } from '@rspack/core';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { describe, expect, it } from 'vitest';
import webpack from 'webpack';
import type { AlphaTabWebPackPluginOptions } from '../src/AlphaTabWebPackPluginOptions';
import { AlphaTabWebPackPlugin } from '../src/alphaTab.webpack';

type BundlerName = 'webpack' | 'rspack';

interface BuildResult {
    errors: string[];
    warnings: string[];
    stats?: StatsJson;
}

interface StatsModule {
    name?: string;
    nameForCondition?: string;
    moduleType?: string;
    modules?: StatsModule[];
}

interface StatsChunk {
    id: string | number;
    names: string[];
    files: string[];
    runtime: string[] | string;
    entry: boolean;
    modules?: StatsModule[];
}

interface StatsJson {
    outputPath: string;
    chunks: StatsChunk[];
}

/**
 * The message of a build error, without the decoration Rspack adds.
 */
function message(e: Error): string {
    return e.message.replace(/^\s*×\s*/, '').trim();
}

/**
 * Runs the given bundler and returns errors, warnings and the chunk stats of the build.
 */
function bundle(bundler: BundlerName, config: Record<string, unknown>): Promise<BuildResult> {
    return new Promise<BuildResult>(resolve => {
        const callback = (err: Error | null, stats: any) => {
            if (err) {
                resolve({ errors: [err.message], warnings: [] });
                return;
            }
            resolve({
                errors: stats.compilation.errors.map(message),
                warnings: stats.compilation.warnings.map(message),
                stats: stats.toJson({ all: false, outputPath: true, chunks: true, chunkModules: true })
            });
        };
        if (bundler === 'rspack') {
            rspack(config as any, callback);
        } else {
            webpack(config as any, callback);
        }
    });
}

function bundleMisconfigured(
    bundler: BundlerName,
    pluginOptions: AlphaTabWebPackPluginOptions,
    config: Record<string, unknown> = {}
): Promise<BuildResult> {
    return bundle(bundler, {
        mode: 'development',
        context: path.resolve('./test-data/misconfigured'),
        entry: './src/app.mjs',
        output: {
            path: path.resolve(`./test-data/project/out/misconfigured-${bundler}`)
        },
        plugins: [new AlphaTabWebPackPlugin(pluginOptions)],
        ...config
    });
}

function moduleNames(chunk: StatsChunk): string[] {
    const names: string[] = [];
    const collect = (modules: StatsModule[] | undefined) => {
        for (const m of modules ?? []) {
            names.push(m.nameForCondition ?? m.name ?? '');
            collect(m.modules);
        }
    };
    collect(chunk.modules);
    return names;
}

function runtimes(chunk: StatsChunk): string[] {
    return Array.isArray(chunk.runtime) ? chunk.runtime : [chunk.runtime];
}

function chunksWithModule(stats: StatsJson, pattern: RegExp): StatsChunk[] {
    return stats.chunks.filter(c => moduleNames(c).some(n => pattern.test(n)));
}

function readChunk(stats: StatsJson, chunk: StatsChunk): string {
    const file = chunk.files.find(f => f.endsWith('.js'))!;
    return fs.readFileSync(path.join(stats.outputPath, file), 'utf8');
}

describe.each<BundlerName>(['webpack', 'rspack'])('%s', bundler => {
    it('bundle-correctly', { timeout: 120000 }, async () => {
        const project = path.resolve('./test-data/project');
        const out = path.join(project, 'out', bundler);
        await fs.promises.rm(out, { force: true, recursive: true });

        const { errors, stats } = await bundle(bundler, {
            context: project,
            entry: {
                app: {
                    import: './src/app.mjs',
                    // see https://github.com/CoderLine/alphaTab/issues/2299
                    library: {
                        type: 'assign',
                        name: 'alphaTabApp'
                    }
                }
            },
            output: {
                filename: '[name]-[contenthash:8].js',
                chunkFilename: '[name]-[contenthash:8].js',
                path: out
            },
            plugins: [new AlphaTabWebPackPlugin(), new HtmlWebpackPlugin()],
            optimization: {
                minimize: false
            },
            performance: { hints: false },
            module: {
                parser: {
                    javascript: {
                        // Angular disables worker parsing for the application code
                        worker: false
                    }
                }
            }
        });
        expect(errors).toEqual([]);

        // assets are copied
        for (const file of [
            'font/Bravura.otf',
            'font/Bravura.woff',
            'font/Bravura.woff2',
            'font/Bravura-OFL.txt',
            'soundfont/LICENSE',
            'soundfont/sonivox.sf2'
        ]) {
            expect(fs.existsSync(path.join(out, file)), `File '${file}' missing`).toBe(true);
        }

        const app = stats!.chunks.find(c => c.names.includes('app'))!;
        expect(app, 'app chunk').toBeDefined();
        const [worker] = chunksWithModule(stats!, /[\\/]alphaTab\.worker\.mjs$/);
        const [worklet] = chunksWithModule(stats!, /[\\/]alphaTab\.worklet\.mjs$/);
        expect(worker?.entry, 'worker entry chunk').toBe(true);
        expect(worklet?.entry, 'worklet entry chunk').toBe(true);

        // one core chunk, shared by the page, the worker and the worklet runtime
        const core = chunksWithModule(stats!, /[\\/]alphaTab\.core\.mjs$/);
        expect(core.length, 'chunks containing the alphaTab core').toBe(1);
        expect(runtimes(core[0]).sort()).toEqual([...runtimes(app), ...runtimes(worker), ...runtimes(worklet)].sort());

        // the application's own worker stays as configured by the application
        expect(stats!.chunks.some(c => c.entry && moduleNames(c).some(n => /app\.worker\.mjs$/.test(n)))).toBe(false);

        const coreFile = core[0].files.find(f => f.endsWith('.js'))!;
        const appText = readChunk(stats!, app);
        // the page lists the worklet's chunks for alphaTab's addAudioWorkletModule
        expect(appText).toContain('.atwm = function');
        expect(appText).toContain(JSON.stringify(coreFile));
        expect(appText).not.toContain('__ALPHATAB_WEBPACK__');
        expect(appText).toContain('alphaTabApp = __webpack_exports__');

        const workletText = readChunk(stats!, worklet);
        expect(workletText).toContain('AudioWorkletGlobalScope');
        expect(workletText).not.toContain('.atwm = function');

        for (const chunk of [worker, worklet, core[0]]) {
            expect(readChunk(stats!, chunk)).not.toContain('alphaTabApp = __webpack_exports__');
        }
    });

    it('reports-missing-alphatab', { timeout: 10000 }, async () => {
        const { errors } = await bundleMisconfigured(bundler, {
            alphaTabSourceDir: path.resolve('./test-data/misconfigured/does-not-exist')
        });
        expect(errors).toEqual([
            'Could not find alphaTab, please ensure it is installed into node_modules or configure alphaTabSourceDir'
        ]);
    });

    it('reports-missing-output-path', { timeout: 10000 }, async () => {
        const { errors } = await bundleMisconfigured(bundler, {
            alphaTabSourceDir: path.resolve('./test-data/misconfigured/alphatab'),
            assetOutputDir: ''
        });
        expect(errors).toEqual(['Need output.path configured in application to store asset files.']);
    });

    it('reports-failed-asset-copy', { timeout: 10000 }, async () => {
        const { errors } = await bundleMisconfigured(bundler, {
            alphaTabSourceDir: path.resolve('./test-data/misconfigured/alphatab')
        });
        expect(errors.length).toBe(1);
        expect(errors[0]).toContain('ENOENT');
    });

    it('warns-on-per-runtime-used-exports', { timeout: 10000 }, async () => {
        const { warnings } = await bundleMisconfigured(
            bundler,
            { assetOutputDir: false },
            { optimization: { usedExports: true } }
        );
        expect(warnings.some(w => w.includes("Set it to 'global'"))).toBe(true);
    });
});
