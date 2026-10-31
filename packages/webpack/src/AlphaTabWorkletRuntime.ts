import type * as webpackTypes from 'webpack';

/**
 * Matches the entry module of alphaTab's audio worklet (dist or TypeScript sources).
 */
const workletEntryPattern = /[\\/]alphaTab\.worklet\.(m?js|ts)$/;

function isWorkletEntryChunk(compilation: webpackTypes.Compilation, chunk: webpackTypes.Chunk): boolean {
    for (const module of compilation.chunkGraph.getChunkEntryModulesIterable(chunk)) {
        const name = module.nameForCondition?.();
        if (name && workletEntryPattern.test(name)) {
            return true;
        }
    }
    return false;
}

function chunkFileName(compilation: webpackTypes.Compilation, chunk: webpackTypes.Chunk): string {
    const output = compilation.outputOptions;
    const template = chunk.filenameTemplate || (chunk.canBeInitial() ? output.filename : output.chunkFilename);
    return compilation.getPath(template as string, { chunk, contentHashType: 'javascript' });
}

/**
 * Makes alphaTab's audio worklet entry load the chunks it shares with the page.
 *
 * An AudioWorkletGlobalScope cannot load scripts on its own, so the page adds them before the
 * worklet entry (alphaTab's `addAudioWorkletModule`). Contract with alphaTab:
 * - every runtime except the worklet's gets `__webpack_require__.atwm(workletUrl)`, returning the
 *   URLs of the chunks the worklet entry depends on, resolved against the worklet URL (an empty array
 *   for any other URL);
 * - the worklet runtime installs the chunks pushed to the chunk loading global before it started.
 *
 * Only APIs present in both webpack and Rspack are used.
 * @internal
 */
export function registerWorkletRuntime(pluginName: string, compiler: webpackTypes.Compiler) {
    const { RuntimeModule, RuntimeGlobals } = compiler.webpack;

    class WorkletChunkMapRuntimeModule extends RuntimeModule {
        constructor() {
            super('alphaTab audio worklet chunk map', RuntimeModule.STAGE_NORMAL);
            // the generated map contains the content hashes of other chunks
            this.dependentHash = true;
        }

        override generate(): string {
            const compilation = this.compilation!;
            const map: Record<string, string[]> = {};
            for (const chunk of compilation.chunks) {
                if (isWorkletEntryChunk(compilation, chunk)) {
                    map[String(chunk.id)] = Array.from(
                        compilation.chunkGraph.getChunkEntryDependentChunksIterable(chunk),
                        c => chunkFileName(compilation, c)
                    );
                }
            }

            return [
                `${RuntimeGlobals.require}.atwm = function (url) {`,
                `    var map = ${JSON.stringify(map)};`,
                '    for (var id in map) {',
                `        var file = ${RuntimeGlobals.getChunkScriptFilename}(id);`,
                '        var base = url.length - file.length;',
                "        if (base >= 0 && url.endsWith(file) && (base === 0 || url[base - 1] === '/')) {",
                '            return map[id].map(function (f) { return url.slice(0, base) + f; });',
                '        }',
                '    }',
                '    return [];',
                '};'
            ].join('\n');
        }
    }

    class WorkletChunkInstallRuntimeModule extends RuntimeModule {
        constructor() {
            // after the chunk loading runtime replaced the `push` of the chunk loading global
            super('alphaTab audio worklet chunk install', RuntimeModule.STAGE_TRIGGER);
        }

        override generate(): string {
            const output = this.compilation!.outputOptions;
            const global = `${output.globalObject || 'self'}[${JSON.stringify(output.chunkLoadingGlobal)}]`;
            // The global object (`self` by default) exists only when alphaTab added its worker-scope
            // shim, which it does only for worklets with chunks to preload.
            return [
                "if (typeof AudioWorkletGlobalScope !== 'undefined') {",
                '    var preloaded;',
                `    try { preloaded = ${global}; } catch (e) {}`,
                '    if (Array.isArray(preloaded)) {',
                '        preloaded.slice().forEach(function (data) { preloaded.push(data); });',
                '    }',
                '}'
            ].join('\n');
        }
    }

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
        compilation.hooks.additionalTreeRuntimeRequirements.tap(pluginName, (chunk, runtimeRequirements) => {
            if (isWorkletEntryChunk(compilation, chunk)) {
                compilation.addRuntimeModule(chunk, new WorkletChunkInstallRuntimeModule());
                return;
            }

            // Decided per runtime: `executeModule` (used by loaders and builders at build time)
            // runs this hook for temporary chunks before the real chunk graph exists.
            const hasWorklet = Array.from(compilation.chunks).some(c => isWorkletEntryChunk(compilation, c));
            if (hasWorklet) {
                compilation.addRuntimeModule(chunk, new WorkletChunkMapRuntimeModule());
                runtimeRequirements.add(RuntimeGlobals.getChunkScriptFilename);
            }
        });
    });
}
