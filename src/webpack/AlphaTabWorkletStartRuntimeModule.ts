/**@target web */
import { isWorkerRuntime, type webPackWithAlphaTab, type webpackTypes } from '@src/webpack/Utils';

export function injectWorkletRuntimeModule(webPackWithAlphaTab: webPackWithAlphaTab) {
    class AlphaTabWorkletStartRuntimeModule extends webPackWithAlphaTab.webpack.RuntimeModule {
        static readonly RuntimeGlobalWorkletGetStartupChunks = '__webpack_require__.wsc';

        constructor() {
            super('alphaTab audio worklet chunk lookup', webPackWithAlphaTab.webpack.RuntimeModule.STAGE_BASIC);
        }

        override generate(): string | null {
            const compilation = this.compilation!;
            const workletChunkLookup = new Map<string, string[]>();

            const allChunks = compilation.chunks;
            for (const chunk of allChunks) {
                const isWorkletEntry = isWorkerRuntime(chunk.runtime);

                if (isWorkletEntry) {
                    const workletChunks = Array.from(chunk.getAllReferencedChunks()).map(c => {
                        // force content chunk to be created
                        compilation.hooks.contentHash.call(c);
                        return compilation.getPath(
                            webPackWithAlphaTab.webpack.javascript.JavascriptModulesPlugin.getChunkFilenameTemplate(
                                c,
                                compilation.outputOptions
                            ),
                            {
                                chunk: c,
                                contentHashType: 'javascript'
                            }
                        );
                    });
                    workletChunkLookup.set(String(chunk.id), workletChunks);
                }
            }

            return webPackWithAlphaTab.webpack.Template.asString([
                `${AlphaTabWorkletStartRuntimeModule.RuntimeGlobalWorkletGetStartupChunks} = (() => {`,
                webPackWithAlphaTab.webpack.Template.indent([
                    'const lookup = new Map(',
                    webPackWithAlphaTab.webpack.Template.indent(
                        JSON.stringify(Array.from(workletChunkLookup.entries()))
                    ),
                    ');',

                    'return (chunkId) => lookup.get(String(chunkId)) ?? [];'
                ]),
                '})();'
            ]);
        }
    }

    webPackWithAlphaTab.alphaTab.RuntimeGlobalWorkletGetStartupChunks =
        AlphaTabWorkletStartRuntimeModule.RuntimeGlobalWorkletGetStartupChunks;

    webPackWithAlphaTab.alphaTab.registerWorkletRuntimeModule = (
        pluginName: string,
        compilation: webpackTypes.Compilation
    ) => {
        compilation.hooks.runtimeRequirementInTree
            .for(AlphaTabWorkletStartRuntimeModule.RuntimeGlobalWorkletGetStartupChunks)
            .tap(pluginName, (chunk: webpackTypes.Chunk) => {
                compilation.addRuntimeModule(chunk, new AlphaTabWorkletStartRuntimeModule());
            });
    };
}
