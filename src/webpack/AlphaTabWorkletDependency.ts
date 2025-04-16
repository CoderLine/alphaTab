/**@target web */

import {
    type Hash,
    type NormalModuleFactory,
    type ObjectDeserializerContext,
    type ObjectSerializerContext,
    makeDependencySerializable,
    type webPackWithAlphaTab,
    type webpackTypes
} from '@src/webpack/Utils';

export function injectWorkletDependency(webPackWithAlphaTab: webPackWithAlphaTab) {
    /**
     * This module dependency injects the relevant code into a worklet bootstrap script
     * to install chunks which have been added to the worklet via addModule before the bootstrap script starts.
     */
    class AlphaTabWorkletDependency extends webPackWithAlphaTab.webpack.dependencies.ModuleDependency {
        publicPath: string | undefined;

        private _hashUpdate: string | undefined;

        constructor(url: string, range: [number, number], publicPath: string | undefined) {
            super(url);
            this.range = range;
            this.publicPath = publicPath;
        }

        override get type() {
            return 'alphaTabWorklet';
        }

        override get category() {
            return 'worker';
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

    AlphaTabWorkletDependency.Template = class AlphaTabWorkletDependencyTemplate extends (
        webPackWithAlphaTab.webpack.dependencies.ModuleDependency.Template
    ) {
        override apply(
            dependency: webpackTypes.Dependency,
            source: webpackTypes.sources.ReplaceSource,
            templateContext: {
                chunkGraph: webpackTypes.ChunkGraph;
                moduleGraph: webpackTypes.ModuleGraph;
                runtimeRequirements: Set<string>;
            }
        ): void {
            const { chunkGraph, moduleGraph, runtimeRequirements } = templateContext;
            const dep = dependency as AlphaTabWorkletDependency;

            const block = moduleGraph.getParentBlock(dependency) as webpackTypes.AsyncDependenciesBlock;
            const entrypoint = chunkGraph.getBlockChunkGroup(block) as any;

            const workletImportBaseUrl = dep.publicPath
                ? JSON.stringify(dep.publicPath)
                : webPackWithAlphaTab.webpack.RuntimeGlobals.publicPath;

            const chunk = entrypoint.getEntrypointChunk() as webpackTypes.Chunk;

            // worklet global scope has no 'self', need to inject it for compatibility with chunks
            // some plugins like the auto public path need to right location. we pass this on from the main runtime
            // some plugins rely on importScripts to be defined.
            const workletInlineBootstrap = `
                globalThis.self = globalThis.self || globalThis;
                globalThis.location = \${JSON.stringify(${webPackWithAlphaTab.webpack.RuntimeGlobals.baseURI})};
                globalThis.importScripts = (url) => { throw new Error("importScripts not available, dynamic loading of chunks not supported in this context", url) };
            `;

            chunkGraph.addChunkRuntimeRequirements(
                chunk,
                new Set<string>([
                    webPackWithAlphaTab.webpack.RuntimeGlobals.moduleFactories,
                    webPackWithAlphaTab.alphaTab.WebWorkerRuntimeModuleKey
                ])
            );

            runtimeRequirements.add(webPackWithAlphaTab.alphaTab.RuntimeGlobalWorkletGetStartupChunks);

            source.replace(
                dep.range[0],
                dep.range[1] - 1,
                webPackWithAlphaTab.webpack.Template.asString([
                    '(/* worklet bootstrap */ async function(__webpack_worklet__) {',
                    webPackWithAlphaTab.webpack.Template.indent([
                        `await __webpack_worklet__.addModule(URL.createObjectURL(new Blob([\`${workletInlineBootstrap}\`], { type: "application/javascript; charset=utf-8" })));`,
                        `for (const fileName of ${webPackWithAlphaTab.alphaTab.RuntimeGlobalWorkletGetStartupChunks}(${JSON.stringify(chunk.id)})) {`,
                        webPackWithAlphaTab.webpack.Template.indent([
                            `await __webpack_worklet__.addModule(new URL(${workletImportBaseUrl} + fileName, ${webPackWithAlphaTab.webpack.RuntimeGlobals.baseURI}));`
                        ]),
                        '}'
                    ]),
                    '})(alphaTabWorklet)'
                ])
            );
        }
    };

    makeDependencySerializable(webPackWithAlphaTab, AlphaTabWorkletDependency, 'AlphaTabWorkletDependency');

    webPackWithAlphaTab.alphaTab.registerWorkletDependency = (
        compilation: webpackTypes.Compilation,
        normalModuleFactory: NormalModuleFactory
    ) => {
        compilation.dependencyFactories.set(AlphaTabWorkletDependency, normalModuleFactory);
        compilation.dependencyTemplates.set(AlphaTabWorkletDependency, new AlphaTabWorkletDependency.Template());
    };

    webPackWithAlphaTab.alphaTab.createWorkletDependency = (
        request: string,
        range: [number, number],
        publicPath: string | undefined
    ) => new AlphaTabWorkletDependency(request, range, publicPath);
}
