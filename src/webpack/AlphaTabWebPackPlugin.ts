/**@target web */
import * as fs from 'fs'
import * as path from 'path'
import webpack from 'webpack'

// webpack doesn't defined properly types for all these internals 
// needed for the plugin

// @ts-expect-error
import { contextify } from "webpack/lib/util/identifier"

// @ts-expect-error
import WorkerPlugin from 'webpack/lib/dependencies/WorkerPlugin'

import { AlphaTabWorkerRuntimeModule } from './AlphaTabWorkerRuntimeModule'
import { AlphaTabWorkletStartRuntimeModule } from './AlphaTabWorkletStartRuntimeModule'
import { configureAudioWorklet } from './AlphaTabAudioWorklet';
import { AlphaTabWebPackPluginOptions } from './AlphaTabWebPackPluginOptions'
import { configureWebWorker } from './AlphaTabWebWorker'

export class AlphaTabWebPackPlugin {
    options: AlphaTabWebPackPluginOptions;

    constructor(options?: AlphaTabWebPackPluginOptions) {
        this.options = options ?? {};
    }

    apply(compiler: webpack.Compiler) {
        this.configureSoundFont(compiler);
        this.configure(compiler);
    }

    configureSoundFont(compiler: webpack.Compiler) {
        if (this.options.assetOutputDir === false) {
            return;
        }

        // register soundfont as resource
        compiler.options.module.rules.push({
            test: /\.sf2/,
            type: "asset/resource",
        });
    }


    configure(compiler: webpack.Compiler) {
        const pluginName = this.constructor.name;

        const cachedContextify = contextify.bindContextCache(
            compiler.context,
            compiler.root
        );

        compiler.hooks.thisCompilation.tap(pluginName, (compilation, { normalModuleFactory }) => {


            compilation.hooks.runtimeRequirementInTree
                .for(AlphaTabWorkerRuntimeModule.Key)
                .tap(pluginName, (chunk: webpack.Chunk) => {
                    compilation.addRuntimeModule(chunk, new AlphaTabWorkerRuntimeModule());
                });

            compilation.hooks.runtimeRequirementInTree
                .for(AlphaTabWorkletStartRuntimeModule.RuntimeGlobalWorkletGetStartupChunks)
                .tap(pluginName, (chunk: webpack.Chunk) => {
                    compilation.addRuntimeModule(chunk, new AlphaTabWorkletStartRuntimeModule());
                });


            configureAudioWorklet(pluginName, this.options, compiler, compilation, normalModuleFactory, cachedContextify);
            configureWebWorker(pluginName, this.options, compiler, compilation, normalModuleFactory, cachedContextify);
            this.configureAssetCopy(pluginName, compiler, compilation);
        });
    }

    configureAssetCopy(pluginName: string, compiler: webpack.Compiler, compilation: webpack.Compilation) {
        if (this.options.assetOutputDir === false) {
            return;
        }

        const options = this.options;
        compilation.hooks.processAssets.tapAsync(
            {
                name: pluginName,
                stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
            },
            async (_, callback) => {

                let alphaTabSourceDir = options.alphaTabSourceDir;
                if (!alphaTabSourceDir) {
                    alphaTabSourceDir = compilation.getPath('node_modules/@coderline/alphatab/dist/');
                }

                if (!alphaTabSourceDir || !fs.promises.access(path.join(alphaTabSourceDir, 'alphaTab.mjs'), fs.constants.F_OK)) {
                    compilation.errors.push(new webpack.WebpackError('Could not find alphaTab, please ensure it is installed into node_modules or configure alphaTabSourceDir'));
                    return;
                }

                const outputPath = (options.assetOutputDir ?? compiler.options.output.path) as string;
                if (!outputPath) {
                    compilation.errors.push(new webpack.WebpackError('Need output.path configured in application to store asset files.'));
                    return;
                }

                async function copyFiles(subdir: string): Promise<void> {
                    const fullDir = path.join(alphaTabSourceDir!, subdir);

                    compilation.contextDependencies.add(path.normalize(fullDir));

                    const files = await fs.promises.readdir(fullDir, { withFileTypes: true });

                    await fs.promises.mkdir(path.join(outputPath!, subdir), { recursive: true });

                    await Promise.all(files.filter(f => f.isFile()).map(
                        async file => {
                            const sourceFilename = path.join(file.path, file.name);
                            await fs.promises.copyFile(sourceFilename, path.join(outputPath!, subdir, file.name));
                            const assetFileName = subdir + '/' + file.name;
                            const existingAsset = compilation.getAsset(assetFileName);

                            const data = await fs.promises.readFile(sourceFilename);
                            const source = new compiler.webpack.sources.RawSource(data);

                            if (existingAsset) {
                                compilation.updateAsset(assetFileName, source, {
                                    copied: true,
                                    sourceFilename
                                });
                            } else {
                                compilation.emitAsset(assetFileName, source, {
                                    copied: true,
                                    sourceFilename
                                });
                            }
                        }
                    ));
                }

                await Promise.all([
                    copyFiles("font"),
                    copyFiles("soundfont")
                ]);

                callback();
            }
        );
    }
}