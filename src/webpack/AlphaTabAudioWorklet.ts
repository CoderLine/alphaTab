/**@target web */
import webpack from 'webpack'

import { type VariableDeclarator, type Identifier, type Expression, type CallExpression } from 'estree'
import { AlphaTabWebPackPluginOptions } from './AlphaTabWebPackPluginOptions';
import { AlphaTabWorkletDependency } from './AlphaTabWorkletDependency';
import { getWorkerRuntime, parseModuleUrl, tapJavaScript } from './Utils';

const AlphaTabWorkletSpecifierTag = Symbol("alphatab worklet specifier tag");
const workletIndexMap = new WeakMap<webpack.ParserState, number>();

/**
 * Configures the Audio Worklet aspects within webpack.
 * The counterpart which this plugin detects sits in alphaTab.main.ts
 * @param pluginName 
 * @param options 
 * @param compiler 
 * @param compilation 
 * @param normalModuleFactory 
 * @param cachedContextify 
 * @returns 
 */
export function configureAudioWorklet(pluginName: string,
    options: AlphaTabWebPackPluginOptions,
    compiler: webpack.Compiler, compilation: webpack.Compilation, normalModuleFactory: any, cachedContextify: (s: string) => string) {
    if (options.audioWorklets === false) {
        return;
    }

    compilation.dependencyFactories.set(
        AlphaTabWorkletDependency,
        normalModuleFactory
    );
    compilation.dependencyTemplates.set(
        AlphaTabWorkletDependency,
        new AlphaTabWorkletDependency.Template()
    );

    const handleAlphaTabWorklet = (parser: any, expr: CallExpression) => {
        const [arg1] = expr.arguments;
        const parsedUrl = parseModuleUrl(parser, arg1 as Expression);
        if (!parsedUrl) {
            return;
        }

        const [url] = parsedUrl;
        if (!url.isString()) {
            return;
        }

        const runtime = getWorkerRuntime(parser, compilation, cachedContextify, workletIndexMap);
        const block = new webpack.AsyncDependenciesBlock({
            entryOptions: {
                chunkLoading: false,
                wasmLoading: false,
                runtime: runtime
            }
        });

        block.loc = expr.loc;

        const workletBootstrap = new AlphaTabWorkletDependency(
            url.string,
            [expr.range![0], expr.range![1]],
            compiler.options.output.workerPublicPath,
        );
        workletBootstrap.loc = expr.loc!;
        block.addDependency(workletBootstrap);
        parser.state.module.addBlock(block);

        return true;
    };

    const parserPlugin = (parser: any) => {
        const pattern = "alphaTabWorklet";
        const itemMembers = "addModule";

        parser.hooks.preDeclarator.tap(pluginName, (decl: VariableDeclarator) => {
            if (decl.id.type === "Identifier" && decl.id.name === pattern) {
                parser.tagVariable(decl.id.name, AlphaTabWorkletSpecifierTag);
                return true;
            }
            return;
        });
        parser.hooks.pattern.for(pattern).tap(pluginName, (pattern: Identifier) => {
            parser.tagVariable(pattern.name, AlphaTabWorkletSpecifierTag);
            return true;
        });

        parser.hooks.callMemberChain
            .for(AlphaTabWorkletSpecifierTag)
            .tap(pluginName, (expression: CallExpression, members: string[]) => {
                if (itemMembers !== members.join(".")) {
                    return;
                }
                return handleAlphaTabWorklet(parser, expression);
            });
    };

    tapJavaScript(normalModuleFactory, pluginName, parserPlugin);
}
