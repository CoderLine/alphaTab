/**@target web */
import webpack from 'webpack'


import { type Expression, type CallExpression } from 'estree'
import { AlphaTabWebPackPluginOptions } from './AlphaTabWebPackPluginOptions';
import { getWorkerRuntime, parseModuleUrl, tapJavaScript } from './Utils';
// @ts-expect-error
import EnableChunkLoadingPlugin from "webpack/lib/javascript/EnableChunkLoadingPlugin";
// @ts-expect-error
import WorkerDependency from "webpack/lib/dependencies/WorkerDependency";

const workerIndexMap = new WeakMap<webpack.ParserState, number>();

/**
 * Configures the WebWorker aspects within webpack.
 * The counterpart which this plugin detects sits in alphaTab.main.ts
 * @param pluginName 
 * @param options 
 * @param compiler 
 * @param compilation 
 * @param normalModuleFactory 
 * @param cachedContextify 
 * @returns 
 */
export function configureWebWorker(pluginName: string,
    options: AlphaTabWebPackPluginOptions,
    compiler: webpack.Compiler, compilation: webpack.Compilation, normalModuleFactory: any, cachedContextify: (s: string) => string) {
    if (options.audioWorklets === false) {
        return;
    }

    compilation.dependencyFactories.set(
        WorkerDependency,
        normalModuleFactory
    );
    compilation.dependencyTemplates.set(
        WorkerDependency,
        new WorkerDependency.Template()
    );

    new EnableChunkLoadingPlugin('import-scripts').apply(compiler);

    const handleAlphaTabWorker = (parser: any, expr: CallExpression) => {
        const [arg1, arg2] = expr.arguments;
        const parsedUrl = parseModuleUrl(parser, arg1 as Expression);
        if (!parsedUrl) {
            return;
        }

        const [url, range] = parsedUrl;
        if (!url.isString()) {
            return;
        }

        const runtime = getWorkerRuntime(parser, compilation, cachedContextify, workerIndexMap);

        const block = new webpack.AsyncDependenciesBlock({
            entryOptions: {
                chunkLoading: 'import-scripts',
                wasmLoading: false,
                runtime: runtime
            }
        });

        block.loc = expr.loc;

        const workletBootstrap = new WorkerDependency(
            url.string,
            range,
            compiler.options.output.workerPublicPath,
        );
        workletBootstrap.loc = expr.loc!;
        block.addDependency(workletBootstrap);
        parser.state.module.addBlock(block);

        const dep1 = new webpack.dependencies.ConstDependency(
            `{ type: ${compilation.options.output.module ? '"module"' : "undefined"} }`,
            arg2.range!
        );
        dep1.loc = expr.loc!;
        parser.state.module.addPresentationalDependency(dep1);

        parser.walkExpression(expr.callee);

        return true;
    };

    const parserPlugin = (parser: any) => {
        parser.hooks.new.for("alphaTab.Environment.alphaTabWorker").tap(pluginName, (expr:CallExpression) => handleAlphaTabWorker(parser, expr));
    };

    tapJavaScript(normalModuleFactory, pluginName, parserPlugin);
}
