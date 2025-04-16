/**@target web */

import { isWorkerRuntime, type webPackWithAlphaTab, type webpackTypes } from '@src/webpack/Utils';

export function injectWorkerRuntimeModule(webPackWithAlphaTab: webPackWithAlphaTab) {
    class AlphaTabWorkerRuntimeModule extends webPackWithAlphaTab.webpack.RuntimeModule {
        public static Key: string = 'AlphaTabWorkerRuntime';

        constructor() {
            super('alphaTab audio worker chunk loading', webPackWithAlphaTab.webpack.RuntimeModule.STAGE_BASIC);
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
                if (webPackWithAlphaTab.webpack.javascript.JavascriptModulesPlugin.chunkHasJs(c, this.chunkGraph!)) {
                    continue;
                }
                for (const id of c.ids!) {
                    initialChunkIds.add(id);
                }
            }

            return webPackWithAlphaTab.webpack.Template.asString([
                `if ( ! ('AudioWorkletGlobalScope' in ${globalObject}) ) { return; }`,
                'const installedChunks = {',
                webPackWithAlphaTab.webpack.Template.indent(
                    Array.from(initialChunkIds, id => `${JSON.stringify(id)}: 1`).join(',\n')
                ),
                '};',

                '// importScripts chunk loading',
                `const installChunk = ${runtimeTemplate.basicFunction('data', [
                    runtimeTemplate.destructureArray(['chunkIds', 'moreModules', 'runtime'], 'data'),
                    'for(const moduleId in moreModules) {',
                    webPackWithAlphaTab.webpack.Template.indent([
                        `if(${webPackWithAlphaTab.webpack.RuntimeGlobals.hasOwnProperty}(moreModules, moduleId)) {`,
                        webPackWithAlphaTab.webpack.Template.indent(
                            `${webPackWithAlphaTab.webpack.RuntimeGlobals.moduleFactories}[moduleId] = moreModules[moduleId];`
                        ),
                        '}'
                    ]),
                    '}',
                    `if(runtime) runtime(${webPackWithAlphaTab.webpack.RuntimeGlobals.require});`,
                    'while(chunkIds.length)',
                    webPackWithAlphaTab.webpack.Template.indent('installedChunks[chunkIds.pop()] = 1;'),
                    'parentChunkLoadingFunction(data);'
                ])};`,
                `const chunkLoadingGlobal = ${chunkLoadingGlobalExpr} = ${chunkLoadingGlobalExpr} || [];`,
                'const parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);',
                'chunkLoadingGlobal.forEach(installChunk);',
                'chunkLoadingGlobal.push = installChunk;'
            ]);
        }
    }

    webPackWithAlphaTab.alphaTab.registerWebWorkerRuntimeModule = (
        pluginName: string,
        compilation: webpackTypes.Compilation
    ) => {
        compilation.hooks.runtimeRequirementInTree
            .for(AlphaTabWorkerRuntimeModule.Key)
            .tap(pluginName, (chunk: webpackTypes.Chunk) => {
                compilation.addRuntimeModule(chunk, new AlphaTabWorkerRuntimeModule());
            });

        compilation.hooks.additionalChunkRuntimeRequirements.tap(pluginName, (chunk, runtimeRequirements) => {
            if (isWorkerRuntime(chunk.runtime)) {
                runtimeRequirements.add(webPackWithAlphaTab.webpack.RuntimeGlobals.moduleFactories);
                runtimeRequirements.add(webPackWithAlphaTab.alphaTab.WebWorkerRuntimeModuleKey);
            }
        });
    };
    webPackWithAlphaTab.alphaTab.WebWorkerRuntimeModuleKey = AlphaTabWorkerRuntimeModule.Key;
}
