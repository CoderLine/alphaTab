/**@target web */
import webpack from 'webpack'

export class AlphaTabWorkerRuntimeModule extends webpack.RuntimeModule {
    public static Key: string = "AlphaTabWorkerRuntime";

    constructor() {
        super("alphaTab audio worker chunk loading", webpack.RuntimeModule.STAGE_BASIC);
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