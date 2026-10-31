/**@target web */
import fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';
import type * as webpackTypes from 'webpack';
import type { AlphaTabWebPackPluginOptions } from './AlphaTabWebPackPluginOptions';
import { registerWorkletRuntime } from './AlphaTabWorkletRuntime';

const pluginName = 'AlphaTabWebPackPlugin';

/**
 * The call through which alphaTab loads its audio worklet; bundled as a worker entry.
 */
const workletSyntax = '*alphaTabWorklet.addModule()';

/**
 * The module holding alphaTab's code, imported by the page, the web worker and the audio worklet entry.
 */
const alphaTabCorePattern = /[\\/]alphaTab\.core(\.min)?\.mjs$/;

/**
 * A webpack plugin configuring the bundling of alphaTab. Works with webpack 5 and Rspack.
 * @public
 */
export class AlphaTabWebPackPlugin {
    options: AlphaTabWebPackPluginOptions;

    constructor(options?: AlphaTabWebPackPluginOptions) {
        this.options = options ?? {};
    }

    /**
     * @param compiler The webpack or Rspack compiler.
     */
    apply(compiler: unknown) {
        const webpackCompiler = compiler as webpackTypes.Compiler;
        new webpackCompiler.webpack.DefinePlugin({ __ALPHATAB_WEBPACK__: 'true' }).apply(webpackCompiler);
        this._configureWorkers(webpackCompiler);
        this._configureSoundFont(webpackCompiler);
        this._configureAssetCopy(webpackCompiler);
    }

    private _configureWorkers(compiler: webpackTypes.Compiler) {
        const webWorkers = this.options.webWorkers !== false;
        const audioWorklets = this.options.audioWorklets !== false;
        if (!webWorkers && !audioWorklets) {
            return;
        }

        const options = compiler.options;

        // Page, workers and worklet load alphaTab's core from one shared chunk. That needs used
        // exports not specialized per runtime, and a split of the core out of the initial page chunk.
        // Only production analyses used exports by default; in development the analysis would make
        // modules regenerate as lazily compiled pages add usages, and hot updates would then
        // re-run shared modules (e.g. React contexts) on a live page.
        if ((options.mode ?? 'production') === 'production') {
            options.optimization.usedExports ??= 'global';
        }
        if (options.optimization.usedExports === true) {
            compiler.hooks.thisCompilation.tap(pluginName, compilation => {
                compilation.warnings.push(
                    new compiler.webpack.WebpackError(
                        "optimization.usedExports: true bundles alphaTab's core more than once (for the page and for its workers). Set it to 'global' to load one shared core chunk."
                    )
                );
            });
        }
        if (options.optimization.splitChunks !== false) {
            options.optimization.splitChunks ??= {};
            const splitChunks = options.optimization.splitChunks;
            splitChunks.cacheGroups ??= {};
            splitChunks.cacheGroups.alphaTabCore ??= {
                test: alphaTabCorePattern,
                chunks: 'all',
                enforce: true,
                priority: 10,
                reuseExistingChunk: true
            };
        }

        // The worker syntax applies to alphaTab's own modules only, independent of what the host
        // configured for its code (e.g. Angular disables worker parsing).
        const hostWorkerSyntax = options.module.parser?.javascript?.worker;
        const worker: string[] = [];
        if (audioWorklets) {
            worker.push(workletSyntax);
            registerWorkletRuntime(pluginName, compiler);
        }
        if (webWorkers) {
            worker.push('Worker');
        } else if (Array.isArray(hostWorkerSyntax)) {
            worker.push(...hostWorkerSyntax.filter(s => s !== workletSyntax));
        } else if (hostWorkerSyntax !== false) {
            worker.push('...');
        }

        options.module.rules.push({
            test: /\.m?[jt]s$/,
            descriptionData: { name: /^@coderline\/alphatab$/ },
            parser: { worker }
        });
    }

    private _configureSoundFont(compiler: webpackTypes.Compiler) {
        if (this.options.assetOutputDir === false) {
            return;
        }

        compiler.options.module.rules.push({
            test: /\.sf2/,
            type: 'asset/resource'
        });
        compiler.options.module.rules.push({
            test: /\.sf3/,
            type: 'asset/resource'
        });
    }

    private _configureAssetCopy(compiler: webpackTypes.Compiler) {
        if (this.options.assetOutputDir === false) {
            return;
        }

        const options = this.options;
        const webpack = compiler.webpack;
        compiler.hooks.thisCompilation.tap(pluginName, compilation => {
            compilation.hooks.processAssets.tapPromise(
                {
                    name: pluginName,
                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
                },
                async () => {
                    const alphaTabSourceDir = options.alphaTabSourceDir ?? (await findAlphaTabDist(compilation));
                    if (!alphaTabSourceDir || !(await exists(path.join(alphaTabSourceDir, 'alphaTab.mjs')))) {
                        compilation.errors.push(
                            new webpack.WebpackError(
                                'Could not find alphaTab, please ensure it is installed into node_modules or configure alphaTabSourceDir'
                            )
                        );
                        return;
                    }

                    const outputPath = (options.assetOutputDir ?? compiler.options.output.path) as string;
                    if (!outputPath) {
                        compilation.errors.push(
                            new webpack.WebpackError('Need output.path configured in application to store asset files.')
                        );
                        return;
                    }

                    const copyFiles = async (subdir: string): Promise<void> => {
                        const fullDir = path.join(alphaTabSourceDir, subdir);
                        compilation.contextDependencies.add(path.normalize(fullDir));

                        const files = await fs.promises.readdir(fullDir, { withFileTypes: true });
                        await fs.promises.mkdir(path.join(outputPath, subdir), { recursive: true });

                        await Promise.all(
                            files
                                .filter(f => f.isFile())
                                .map(async file => {
                                    const sourceFilename = path.join(fullDir, file.name);
                                    await fs.promises.copyFile(
                                        sourceFilename,
                                        path.join(outputPath, subdir, file.name)
                                    );

                                    const assetFileName = `${subdir}/${file.name}`;
                                    const source = new webpack.sources.RawSource(
                                        await fs.promises.readFile(sourceFilename)
                                    );
                                    const info = { copied: true, sourceFilename };
                                    if (compilation.getAsset(assetFileName)) {
                                        compilation.updateAsset(assetFileName, source, info);
                                    } else {
                                        compilation.emitAsset(assetFileName, source, info);
                                    }
                                })
                        );
                    };

                    await Promise.all([copyFiles('font'), copyFiles('soundfont')]);
                }
            );
        });
    }
}

async function exists(file: string): Promise<boolean> {
    try {
        await fs.promises.access(file, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

/**
 * The `dist` directory of the installed `@coderline/alphatab` package, if it can be found.
 */
async function findAlphaTabDist(compilation: webpackTypes.Compilation): Promise<string | undefined> {
    let dir: string;
    try {
        const entry =
            typeof import.meta.url === 'string'
                ? url.fileURLToPath(import.meta.resolve('@coderline/alphatab'))
                : require.resolve('@coderline/alphatab');
        dir = path.dirname(entry);
    } catch {
        return compilation.getPath('node_modules/@coderline/alphatab/dist/');
    }

    while (true) {
        if (await exists(path.join(dir, 'package.json'))) {
            return path.join(dir, 'dist');
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            return undefined;
        }
        dir = parent;
    }
}
