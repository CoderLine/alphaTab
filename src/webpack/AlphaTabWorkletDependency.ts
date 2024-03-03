/**@target web */
import webpack from 'webpack'
import makeSerializable from 'webpack/lib/util/makeSerializable'


import { AlphaTabWorkletRuntimeModule } from './AlphaTabWorkletRuntimeModule'
import { AlphaTabWorkletStartRuntimeModule } from './AlphaTabWorkletStartRuntimeModule';

interface Hash {
    update(data: string | Buffer, inputEncoding?: string): Hash;
}

interface ObjectSerializerContext {
    write: (arg0?: any) => void;
}

interface ObjectDeserializerContext {
    read: () => any;
}

/**
 * This module dependency injects the relevant code into a worklet bootstrap script
 * to install chunks which have been added to the worklet via addModule before the bootstrap script starts.
 */
export class AlphaTabWorkletDependency extends webpack.dependencies.ModuleDependency {
    publicPath: string | undefined;

    private _hashUpdate: string | undefined;

    constructor(url: string, range: [number, number], publicPath: string | undefined) {
        super(url);
        this.range = range;
        this.publicPath = publicPath;
    }

    override get type() {
        return "alphaTabWorklet";
    }

    override get category() {
        return "worker";
    }

    override updateHash(hash: Hash): void {
        if (this._hashUpdate === undefined) {
            this._hashUpdate = JSON.stringify(this.publicPath);
        }
        hash.update(this._hashUpdate);
    }

    override serialize(context: ObjectSerializerContext): void {
        const { write } = context;
        write(this.publicPath);
        super.serialize(context as any);
    }

    override deserialize(context: ObjectDeserializerContext): void {
        const { read } = context;
        this.publicPath = read();
        super.deserialize(context as any);
    }
}

AlphaTabWorkletDependency.Template = class AlphaTabWorkletDependencyTemplate extends webpack.dependencies.ModuleDependency.Template {
    override apply(dependency: webpack.Dependency, source: webpack.sources.ReplaceSource, templateContext: { chunkGraph: webpack.ChunkGraph, moduleGraph: webpack.ModuleGraph, runtimeRequirements: Set<string> }): void {
        const { chunkGraph, moduleGraph, runtimeRequirements } = templateContext;
        const dep = dependency as AlphaTabWorkletDependency;

        const block = moduleGraph.getParentBlock(dependency) as webpack.AsyncDependenciesBlock;
        const entrypoint = chunkGraph.getBlockChunkGroup(block) as any;

        const workletImportBaseUrl = dep.publicPath
            ? JSON.stringify(dep.publicPath)
            : webpack.RuntimeGlobals.publicPath;

        const chunk = entrypoint.getEntrypointChunk() as webpack.Chunk;

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
        runtimeRequirements.add(AlphaTabWorkletStartRuntimeModule.RuntimeGlobalWorkletGetStartupChunks);

        source.replace(
            dep.range[0],
            dep.range[1] - 1,
            webpack.Template.asString([
                "(/* worklet bootstrap */ async function(__webpack_worklet__) {",
                webpack.Template.indent([
                    `await __webpack_worklet__.addModule(URL.createObjectURL(new Blob([\`${workletInlineBootstrap}\`], { type: "application/javascript; charset=utf-8" })));`,
                    `for (const fileName of ${AlphaTabWorkletStartRuntimeModule.RuntimeGlobalWorkletGetStartupChunks}(${chunk.id})) {`,
                    webpack.Template.indent([
                        `await __webpack_worklet__.addModule(new URL(${workletImportBaseUrl} + fileName, ${webpack.RuntimeGlobals.baseURI}));`
                    ]),
                    "}"
                ]),
                `})(alphaTabWorklet)`
            ])
        );
    }
}

makeSerializable(
    AlphaTabWorkletDependency,
    'AlphaTabWorkletDependency'
);
