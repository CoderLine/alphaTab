/**@target web */
import * as fs from 'fs'
import * as path from 'path'
import webpack from 'webpack'
import { contextify } from "webpack/lib/util/identifier"

import {
    JAVASCRIPT_MODULE_TYPE_AUTO,
    JAVASCRIPT_MODULE_TYPE_ESM
} from "webpack/lib/ModuleTypeConstants";

import { type VariableDeclarator, type Identifier, type Expression, type CallExpression, type NewExpression } from 'estree'
import { AlphaTabWorkletDependency } from './AlphaTabWorkletDependency'
import { AlphaTabWorkletRuntimeModule } from './AlphaTabWorkletRuntimeModule'
import { AlphaTabWorkletStartRuntimeModule } from './AlphaTabWorkletStartRuntimeModule'

export interface AlphaTabWebPackPluginChunkOptions {
    name?: string;
    minSize?: number;
    priority?: number;
}

export interface AlphaTabWebPackPluginOptions {
    /**
     * The location where alphaTab can be found.
     * (default: node_modules/@coderline/alphatab/dist)
     */
    alphaTabSourceDir?: string;
    /**
     * The options related to the chunk into which alphaTab is placed in case
     * Webpack is configured with optimization.splitChunks.cacheGroups
     * 
     * (default: { name: "chunk-alphatab", minSize: 0, priority: 10 })
     */
    alphaTabChunk?: AlphaTabWebPackPluginChunkOptions | false;

    /**
     * The location where assets of alphaTab should be placed.
     * (default: compiler.options.output.path)
     */
    assetOutputDir?: string;
}

const AlphaTabWorkletSpecifierTag = Symbol("alphatab worklet specifier tag");

const workletIndexMap = new WeakMap<webpack.ParserState, number>();

export class AlphaTabWebPackPlugin {
    options: AlphaTabWebPackPluginOptions;

    constructor(options?: AlphaTabWebPackPluginOptions) {
        this.options = options ?? {};
    }

    apply(compiler: webpack.Compiler) {
        this.configureChunk(compiler);
        this.configure(compiler);
    }


    configure(compiler: webpack.Compiler) {
        const pluginName = this.constructor.name;

        const cachedContextify = contextify.bindContextCache(
            compiler.context,
            compiler.root
        );

        compiler.hooks.thisCompilation.tap(pluginName, (compilation, { normalModuleFactory }) => {
            this.configureAudioWorklet(pluginName, compiler, compilation, normalModuleFactory, cachedContextify);
            this.configureAssetCopy(pluginName, compiler, compilation);
        });
    }
    configureAssetCopy(pluginName: string, compiler: webpack.Compiler, compilation: webpack.Compilation) {
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

                const outputPath = options.assetOutputDir ?? compiler.options.output.path;
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
    configureAudioWorklet(pluginName: string, compiler: webpack.Compiler, compilation: webpack.Compilation, normalModuleFactory: any, cachedContextify: (s: string) => string) {
        compilation.dependencyFactories.set(
            AlphaTabWorkletDependency,
            normalModuleFactory
        );
        compilation.dependencyTemplates.set(
            AlphaTabWorkletDependency,
            new AlphaTabWorkletDependency.Template()
        );

        compilation.hooks.runtimeRequirementInTree
            .for(AlphaTabWorkletRuntimeModule.Key)
            .tap(pluginName, (chunk: webpack.Chunk) => {
                compilation.addRuntimeModule(chunk, new AlphaTabWorkletRuntimeModule());
            });

        compilation.hooks.runtimeRequirementInTree
            .for(AlphaTabWorkletStartRuntimeModule.RuntimeGlobalWorkletGetStartupChunks)
            .tap(pluginName, (chunk: webpack.Chunk) => {
                compilation.addRuntimeModule(chunk, new AlphaTabWorkletStartRuntimeModule());
            });

        const parseModuleUrl = (parser: any, expr: Expression) => {
            if (expr.type !== "NewExpression" && arguments.length !== 2) {
                return;
            }

            const newExpr = expr as NewExpression;
            const [arg1, arg2] = newExpr.arguments;
            const callee = parser.evaluateExpression(newExpr.callee);

            if (!callee.isIdentifier() || callee.identifier !== "URL") {
                return;
            }

            const arg1Value = parser.evaluateExpression(arg1);
            return [
                arg1Value,
                [
                    (arg1.range!)[0],
                    (arg2.range!)[1]
                ]
            ];
        }

        const handleAlphaTabWorklet = (parser: any, expr: CallExpression) => {
            const [arg1] = expr.arguments;
            const parsedUrl = parseModuleUrl(parser, arg1 as Expression);
            if (!parsedUrl) {
                return;
            }

            const [url] = parsedUrl;
            if (!url.isString()) {
                return;
            }

            let i = workletIndexMap.get(parser.state) || 0;
            workletIndexMap.set(parser.state, i + 1);
            let name = `${cachedContextify(
                parser.state.module.identifier()
            )}|${i}`;
            const hash = webpack.util.createHash(compilation.outputOptions.hashFunction);
            hash.update(name);
            const digest = hash.digest(compilation.outputOptions.hashDigest) as string;
            const runtime = digest.slice(
                0,
                compilation.outputOptions.hashDigestLength
            );

            const block = new webpack.AsyncDependenciesBlock({
                entryOptions: {
                    chunkLoading: false,
                    wasmLoading: false,
                    runtime: runtime
                }
            });

            block.loc = expr.loc;

            const workletBootstrap = new AlphaTabWorkletDependency(
                url.string,
                [expr.range![0], expr.range![1]],
                compiler.options.output.workerPublicPath
             
            );
            workletBootstrap.loc = expr.loc!;
            block.addDependency(workletBootstrap);
            parser.state.module.addBlock(block);

            return true;
        };

        const parserPlugin = (parser: any) => {
            const pattern = "alphaTabWorklet";
            const itemMembers = "addModule";

            parser.hooks.preDeclarator.tap(pluginName, (decl: VariableDeclarator) => {
                if (decl.id.type === "Identifier" && decl.id.name === pattern) {
                    parser.tagVariable(decl.id.name, AlphaTabWorkletSpecifierTag);
                    return true;
                }
                return;
            });
            parser.hooks.pattern.for(pattern).tap(pluginName, (pattern: Identifier) => {
                parser.tagVariable(pattern.name, AlphaTabWorkletSpecifierTag);
                return true;
            });

            parser.hooks.callMemberChain
                .for(AlphaTabWorkletSpecifierTag)
                .tap(pluginName, (expression: CallExpression, members: string[]) => {
                    if (itemMembers !== members.join(".")) {
                        return;
                    }
                    return handleAlphaTabWorklet(parser, expression);
                });
        };

        normalModuleFactory.hooks.parser
            .for(JAVASCRIPT_MODULE_TYPE_AUTO)
            .tap(pluginName, parserPlugin);
        normalModuleFactory.hooks.parser
            .for(JAVASCRIPT_MODULE_TYPE_ESM)
            .tap(pluginName, parserPlugin);
    }

    configureChunk(compiler: webpack.Compiler) {
        const options = this.options;
        let alphaTabChunk: AlphaTabWebPackPluginChunkOptions | undefined;
        if (options.alphaTabChunk !== false) {
            alphaTabChunk = {
                name: "chunk-alphatab",
                minSize: 0,
                priority: 10,
                ...this.options.alphaTabChunk
            };
        }

        if (alphaTabChunk && compiler.options.optimization.splitChunks && compiler.options.optimization.splitChunks.cacheGroups) {
            const alphaTabSourceDir = options.alphaTabSourceDir ? path.resolve(options.alphaTabSourceDir) : `node_modules${path.sep}@coderline${path.sep}alphatab`;
            compiler.options.optimization.splitChunks.cacheGroups["alphatab"] = {
                ...alphaTabChunk,
                chunks: "all",
                test(module: { resource?: string }) {
                    if (!module.resource) {
                        return false;
                    }
                    return module.resource.includes(alphaTabSourceDir);
                }
            }
        }
    }
}