/**@target web */

import {
    type Hash,
    type ObjectSerializerContext,
    type ObjectDeserializerContext,
    makeDependencySerializable,
    type webPackWithAlphaTab,
    type webpackTypes,
    type NormalModuleFactory
} from '@src/webpack/Utils';

export function injectWebWorkerDependency(webPackWithAlphaTab: webPackWithAlphaTab) {
    class AlphaTabWebWorkerDependency extends webPackWithAlphaTab.webpack.dependencies.ModuleDependency {
        publicPath: string | undefined;
        private _hashUpdate: string | undefined;

        constructor(request: string, range: [number, number], publicPath: string | undefined) {
            super(request);
            this.range = range;
            this.publicPath = publicPath;
        }

        override getReferencedExports() {
            return webPackWithAlphaTab.webpack.Dependency.NO_EXPORTS_REFERENCED;
        }

        override get type() {
            return 'alphaTabWorker';
        }

        override get category() {
            return 'worker';
        }

        override updateHash(hash: Hash) {
            if (this._hashUpdate === undefined) {
                this._hashUpdate = JSON.stringify(this.publicPath);
            }
            hash.update(this._hashUpdate);
        }

        override serialize(context: ObjectSerializerContext) {
            const { write } = context;
            write(this.publicPath);
            super.serialize(context as any);
        }

        override deserialize(context: ObjectDeserializerContext) {
            const { read } = context;
            this.publicPath = read();
            super.deserialize(context as any);
        }
    }

    AlphaTabWebWorkerDependency.Template = class WorkerDependencyTemplate extends (
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
            const dep = dependency as AlphaTabWebWorkerDependency;
            const block = moduleGraph.getParentBlock(dependency) as webpackTypes.AsyncDependenciesBlock;
            const entrypoint = chunkGraph.getBlockChunkGroup(block) as any;
            const chunk = entrypoint.getEntrypointChunk() as webpackTypes.Chunk;
            // We use the workerPublicPath option if provided, else we fallback to the RuntimeGlobal publicPath
            const workerImportBaseUrl = dep.publicPath
                ? `"${dep.publicPath}"`
                : webPackWithAlphaTab.webpack.RuntimeGlobals.publicPath;

            runtimeRequirements.add(webPackWithAlphaTab.webpack.RuntimeGlobals.publicPath);
            runtimeRequirements.add(webPackWithAlphaTab.webpack.RuntimeGlobals.baseURI);
            runtimeRequirements.add(webPackWithAlphaTab.webpack.RuntimeGlobals.getChunkScriptFilename);

            source.replace(
                dep.range[0],
                dep.range[1] - 1,
                `/* worker import */ ${workerImportBaseUrl} + ${
                    webPackWithAlphaTab.webpack.RuntimeGlobals.getChunkScriptFilename
                }(${JSON.stringify(chunk.id)}), ${webPackWithAlphaTab.webpack.RuntimeGlobals.baseURI}`
            );
        }
    };

    makeDependencySerializable(webPackWithAlphaTab, AlphaTabWebWorkerDependency, 'AlphaTabWebWorkerDependency');

    webPackWithAlphaTab.alphaTab.createWebWorkerDependency = (
        request: string,
        range: [number, number],
        publicPath: string | undefined
    ) => new AlphaTabWebWorkerDependency(request, range, publicPath);

    webPackWithAlphaTab.alphaTab.registerWebWorkerDependency = (
        compilation: webpackTypes.Compilation,
        normalModuleFactory: NormalModuleFactory
    ) => {
        compilation.dependencyFactories.set(AlphaTabWebWorkerDependency, normalModuleFactory);
        compilation.dependencyTemplates.set(AlphaTabWebWorkerDependency, new AlphaTabWebWorkerDependency.Template());
    };
}
