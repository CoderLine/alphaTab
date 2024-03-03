/**@target web */
import webpack from 'webpack'
import { AlphaTabWorkletRuntimeModule } from './AlphaTabWorkletRuntimeModule';

export class AlphaTabWorkletStartRuntimeModule extends webpack.RuntimeModule {
    static readonly RuntimeGlobalWorkletGetStartupChunks = "__webpack_require__.wsc";

    constructor() {
        super("alphaTab audio worklet chunk lookup", webpack.RuntimeModule.STAGE_BASIC);
    }

    override generate(): string | null {
        const compilation = this.compilation!;
        const workletChunkLookup = new Map<string, string[]>();
        const chunkGraph = this.chunkGraph!;

        const allChunks = compilation.chunks;
        for (const chunk of allChunks) {
            const isWorkletEntry = chunkGraph
                .getTreeRuntimeRequirements(chunk)
                .has(AlphaTabWorkletRuntimeModule.Key);
            webpack.Chunk
            if (isWorkletEntry) {
                const workletChunks = Array.from(chunk.getAllReferencedChunks()).map(c => compilation.getPath(
                    webpack.javascript.JavascriptModulesPlugin.getChunkFilenameTemplate(
                        c,
                        compilation.outputOptions
                    ),
                    {
                        chunk: c,
                        contentHashType: "javascript"
                    }
                ));
                workletChunkLookup.set(String(chunk.id), workletChunks);
            }
        }

        return webpack.Template.asString([
            `${AlphaTabWorkletStartRuntimeModule.RuntimeGlobalWorkletGetStartupChunks} = (() => {`,
            webpack.Template.indent([
                "const lookup = new Map(",
                webpack.Template.indent(
                    JSON.stringify(Array.from(workletChunkLookup.entries()))
                ),
                ");",

                "return (chunkId) => lookup.get(String(chunkId)) ?? [];"
            ]),
            "})();"
        ])
    }
}