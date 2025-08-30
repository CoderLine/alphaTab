/**@target web */

import type { Expression, CallExpression, NewExpression } from 'estree';
import type { AlphaTabWebPackPluginOptions } from '@src/webpack/AlphaTabWebPackPluginOptions';
import { getWorkerRuntime, parseModuleUrl, tapJavaScript, type webPackWithAlphaTab, type webpackTypes } from '@src/webpack/Utils';

const workerIndexMap = new WeakMap<webpackTypes.ParserState, number>();

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
export function configureWebWorker(
    webPackWithAlphaTab: webPackWithAlphaTab,
    pluginName: string,
    options: AlphaTabWebPackPluginOptions,
    compiler: webpackTypes.Compiler,
    compilation: webpackTypes.Compilation,
    normalModuleFactory: any,
    cachedContextify: (s: string) => string
) {
    if (options.audioWorklets === false) {
        return;
    }

    webPackWithAlphaTab.alphaTab.registerWebWorkerDependency(compilation, normalModuleFactory);

    new webPackWithAlphaTab.webpack.javascript.EnableChunkLoadingPlugin('import-scripts').apply(compiler);

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

        const block = new webPackWithAlphaTab.webpack.AsyncDependenciesBlock({
            entryOptions: {
                chunkLoading: 'import-scripts',
                wasmLoading: false,
                runtime: runtime,
                library: {
                    // prevent any built-in/default library settings
                    // to be active for this chunk
                    type: 'at-worker'
                }
            }
        });

        block.loc = expr.loc;

        const workletBootstrap = webPackWithAlphaTab.alphaTab.createWebWorkerDependency(
            url.string,
            range,
            compiler.options.output.workerPublicPath
        );
        workletBootstrap.loc = expr.loc!;
        block.addDependency(workletBootstrap);
        parser.state.module.addBlock(block);

        const dep1 = new webPackWithAlphaTab.webpack.dependencies.ConstDependency(
            `{ type: ${compilation.options.output.module ? '"module"' : 'undefined'} }`,
            arg2.range!
        );
        dep1.loc = expr.loc!;
        parser.state.module.addPresentationalDependency(dep1);

        parser.walkExpression(expr.callee);
        parser.walkExpression((arg1 as NewExpression).callee);

        return true;
    };

    const parserPlugin = (parser: any) => {
        parser.hooks.new
            .for('alphaTab.Environment.alphaTabWorker')
            .tap(pluginName, (expr: CallExpression) => handleAlphaTabWorker(parser, expr));
    };

    tapJavaScript(normalModuleFactory, pluginName, parserPlugin);
}
