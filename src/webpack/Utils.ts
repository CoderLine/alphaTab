/**@target web */

import {
    JAVASCRIPT_MODULE_TYPE_AUTO,
    JAVASCRIPT_MODULE_TYPE_ESM
}
    // @ts-expect-error
    from "webpack/lib/ModuleTypeConstants";

import webpack from 'webpack'

// @ts-expect-error
import makeSerializable from 'webpack/lib/util/makeSerializable'

export type NormalModuleFactory = webpack.Compilation['params']['normalModuleFactory'];
export type Parser = any;
import type { Expression, NewExpression } from 'estree'

export interface Hash {
    update(data: string | Buffer, inputEncoding?: string): Hash;
}

export interface ObjectSerializerContext {
    write: (arg0?: any) => void;
}

export interface ObjectDeserializerContext {
    read: () => any;
}

export function makeDependencySerializable(dependency: any, key: string) {
    makeSerializable(dependency, key);
}

export function tapJavaScript(normalModuleFactory: NormalModuleFactory, pluginName: string, parserPlugin: (parser: any) => void) {
    normalModuleFactory.hooks.parser
        .for(JAVASCRIPT_MODULE_TYPE_AUTO)
        .tap(pluginName, parserPlugin);
    normalModuleFactory.hooks.parser
        .for(JAVASCRIPT_MODULE_TYPE_ESM)
        .tap(pluginName, parserPlugin);
}

export function parseModuleUrl(parser: any, expr: Expression) {
    if (expr.type !== "NewExpression" || (expr as NewExpression).arguments.length !== 2) {
        return;
    }

    const newExpr = expr as NewExpression;
    const [arg1, arg2] = newExpr.arguments;
    const callee = parser.evaluateExpression(newExpr.callee);

    if (!callee.isIdentifier() || callee.identifier !== "URL") {
        return;
    }

    const arg1Value = parser.evaluateExpression(arg1);
    return [
        arg1Value,
        [
            (arg1.range!)[0],
            (arg2.range!)[1]
        ]
    ];
}

export function getWorkerRuntime(
    parser: any,
    compilation: webpack.Compilation,
    cachedContextify: (s: string) => string,
    workerIndexMap: WeakMap<webpack.ParserState, number>): string {

    let i = workerIndexMap.get(parser.state) || 0;
    workerIndexMap.set(parser.state, i + 1);
    let name = `${cachedContextify(
        parser.state.module.identifier()
    )}|${i}`;
    const hash = webpack.util.createHash(compilation.outputOptions.hashFunction);
    hash.update(name);
    const digest = hash.digest(compilation.outputOptions.hashDigest) as string;
    const runtime = digest.slice(
        0,
        compilation.outputOptions.hashDigestLength
    );


    return runtime;
};