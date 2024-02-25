import * as fs from 'fs'
import * as path from 'path'
import * as webpack from 'webpack'

import {
    JAVASCRIPT_MODULE_TYPE_AUTO,
    JAVASCRIPT_MODULE_TYPE_ESM
} from "webpack/lib/ModuleTypeConstants";

import { type VariableDeclarator, type Identifier, type Expression, type CallExpression, type NewExpression } from 'estree'

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
}


const AlphaTabWorkletSpecifierTag = Symbol("alphatab worklet specifier tag");


class AlphaTabWorkletRuntimeModule extends webpack.RuntimeModule {
    public static Key: string = "AlphaTabWorkletRuntime";

    constructor() {
        super("alphaTab audio worklet chunk loading", webpack.RuntimeModule.STAGE_BASIC);
    }

    override generate(): string | null {
        const compilation = this.compilation!;
        const runtimeTemplate = compilation.runtimeTemplate;
        const globalObject = runtimeTemplate.globalObject;
        const chunkLoadingGlobalExpr = `${globalObject}[${JSON.stringify(
            compilation.outputOptions.chunkLoadingGlobal
        )}]`;


        const initialChunkIds = new Set(this.chunk!.ids);
        for (const c of this.chunk!.getAllInitialChunks()) {
            if (webpack.javascript.JavascriptModulesPlugin.chunkHasJs(c, this.chunkGraph!)) {
                continue;
            }
            for (const id of c.ids!) {
                initialChunkIds.add(id);
            }
        }

        return webpack.Template.asString([
            `if ( ! ('AudioWorkletGlobalScope' in ${globalObject}) ) { return; }`,
            `const installedChunks = {`,
            webpack.Template.indent(
                Array.from(initialChunkIds, id => `${JSON.stringify(id)}: 1`).join(
                    ",\n"
                )
            ),
            "};",

            "// importScripts chunk loading",
            `const installChunk = ${runtimeTemplate.basicFunction("data", [
                runtimeTemplate.destructureArray(
                    ["chunkIds", "moreModules", "runtime"],
                    "data"
                ),
                "for(const moduleId in moreModules) {",
                webpack.Template.indent([
                    `if(${webpack.RuntimeGlobals.hasOwnProperty}(moreModules, moduleId)) {`,
                    webpack.Template.indent(
                        `${webpack.RuntimeGlobals.moduleFactories}[moduleId] = moreModules[moduleId];`
                    ),
                    "}"
                ]),
                "}",
                `if(runtime) runtime(${webpack.RuntimeGlobals.require});`,
                "while(chunkIds.length)",
                webpack.Template.indent("installedChunks[chunkIds.pop()] = 1;"),
                "parentChunkLoadingFunction(data);"
            ])};`,
            `const chunkLoadingGlobal = ${chunkLoadingGlobalExpr} = ${chunkLoadingGlobalExpr} || [];`,
            "const parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);",
            "chunkLoadingGlobal.forEach(installChunk);",
            "chunkLoadingGlobal.push = installChunk;"
        ]);
    }
}

class AlphaTabWorkletDependency extends webpack.dependencies.ModuleDependency {
    publicPath: string | undefined;
    getChunkFileName: (chunk: webpack.Chunk) => string;

    constructor(url: string, range: [number, number], publicPath: string | undefined, getChunkFileName: (chunk: webpack.Chunk) => string) {
        super(url);
        this.range = range;
        this.publicPath = publicPath;
        this.getChunkFileName = getChunkFileName;
    }
}

AlphaTabWorkletDependency.Template = class AlphaTabWorkletDependencyTemplate extends webpack.dependencies.ModuleDependency.Template {
    override apply(dependency: webpack.Dependency, source: webpack.sources.ReplaceSource, templateContext: { chunkGraph: webpack.ChunkGraph, moduleGraph: webpack.ModuleGraph, runtimeRequirements: Set<string> }): void {
        const { chunkGraph, moduleGraph } = templateContext;
        const dep = dependency as AlphaTabWorkletDependency;

        const block = moduleGraph.getParentBlock(dependency) as webpack.AsyncDependenciesBlock;
        const entrypoint = chunkGraph.getBlockChunkGroup(block) as any;

        const workletImportBaseUrl = dep.publicPath
            ? JSON.stringify(dep.publicPath)
            : webpack.RuntimeGlobals.publicPath;

        const chunk = entrypoint.getEntrypointChunk();

        // worklet global scope has no 'self', need to inject it for compatibility with chunks
        // some plugins like the auto public path need to right location. we pass this on from the main runtime
        // some plugins rely on importScripts to be defined.
        const workletInlineBootstrap = `
			globalThis.self = globalThis.self || globalThis;
			globalThis.location = \${JSON.stringify(${webpack.RuntimeGlobals.baseURI})};
			globalThis.importScripts = (url) => { throw new Error("importScripts not available, dynamic loading of chunks not supported in this context", url) };
		`;

        chunkGraph.addChunkRuntimeRequirements(chunk, new Set<string>([
            webpack.RuntimeGlobals.moduleFactories,
            AlphaTabWorkletRuntimeModule.Key
        ]))

        source.replace(
            dep.range[0],
            dep.range[1] - 1,
            webpack.Template.asString([
                "(/* worklet bootstrap */ async function(__webpack_worklet__) {",
                webpack.Template.indent([
                    `await __webpack_worklet__.addModule(URL.createObjectURL(new Blob([\`${workletInlineBootstrap}\`], { type: "application/javascript; charset=utf-8" })));`,
                    ...Array.from(chunk.getAllReferencedChunks()).map(
                        c =>
                            `await __webpack_worklet__.addModule(new URL(${workletImportBaseUrl} + ${JSON.stringify(dep.getChunkFileName(c as webpack.Chunk))}, ${webpack.RuntimeGlobals.baseURI}));`
                    )
                ]),
                `})(alphaTabWorklet)`
            ])
        );
    }
}

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

        compiler.hooks.thisCompilation.tap(pluginName, (compilation, { normalModuleFactory }) => {
            this.configureAudioWorklet(pluginName, compiler, compilation, normalModuleFactory);
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

                const outputPath = compiler.options.output.path;
                if (!outputPath) {
                    compilation.errors.push(new webpack.WebpackError('Need output.path configured in application to store asset files.'));
                    return;
                }

                async function copyFiles(subdir: string): Promise<void> {
                    const fullDir = path.join(alphaTabSourceDir!, subdir);
                    const files = await fs.promises.readdir(fullDir, { withFileTypes: true });

                    await fs.promises.mkdir(path.join(outputPath!, subdir), { recursive: true });

                    await Promise.all(files.filter(f => f.isFile()).map(
                        file => fs.promises.copyFile(path.join(file.path, file.name), path.join(outputPath!, subdir, file.name))
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
    configureAudioWorklet(pluginName: string, compiler: webpack.Compiler, compilation: webpack.Compilation, normalModuleFactory: any) {
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

            const block = new webpack.AsyncDependenciesBlock({
                entryOptions: {
                    chunkLoading: false,
                    wasmLoading: false
                }
            });

            block.loc = expr.loc;

            const workletBootstrap = new AlphaTabWorkletDependency(
                url.string,
                [expr.range![0], expr.range![1]],
                compiler.options.output.workerPublicPath,
                (chunk) => {
                    return compilation.getPath(
                        webpack.javascript.JavascriptModulesPlugin.getChunkFilenameTemplate(
                            chunk,
                            compilation.outputOptions
                        ),
                        {
                            chunk: chunk,
                            contentHashType: "javascript"
                        }
                    );
                }
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