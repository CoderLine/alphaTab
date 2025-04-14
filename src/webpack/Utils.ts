/**@target web */
import type * as webpackTypes from 'webpack';

export type { webpackTypes };

export type webPackWithAlphaTab = {
    webpack: webpackTypes.Compiler['webpack'];
    alphaTab: {
        // web worker
        registerWebWorkerRuntimeModule(pluginName: string, compilation: webpackTypes.Compilation): void;
        WebWorkerRuntimeModuleKey: string;

        createWebWorkerDependency(
            request: string,
            range: [number, number],
            publicPath: string | undefined
        ): webpackTypes.dependencies.ModuleDependency;
        registerWebWorkerDependency(
            compilation: webpackTypes.Compilation,
            normalModuleFactory: NormalModuleFactory
        ): void;

        // audio worklet
        registerWorkletRuntimeModule(pluginName: string, compilation: webpackTypes.Compilation): void;
        RuntimeGlobalWorkletGetStartupChunks: string;

        createWorkletDependency(
            request: string,
            range: [number, number],
            publicPath: string | undefined
        ): webpackTypes.dependencies.ModuleDependency;

        registerWorkletDependency(
            compilation: webpackTypes.Compilation,
            normalModuleFactory: NormalModuleFactory
        ): void;
    };
};

export type NormalModuleFactory = webpackTypes.Compilation['params']['normalModuleFactory'];
export type Parser = any;
import type { Expression, NewExpression } from 'estree';

const JAVASCRIPT_MODULE_TYPE_AUTO = 'javascript/auto';
const JAVASCRIPT_MODULE_TYPE_ESM = 'javascript/esm';

export interface Hash {
    update(data: string | Buffer, inputEncoding?: string): Hash;
}

export interface ObjectSerializerContext {
    write: (arg0?: any) => void;
}

export interface ObjectDeserializerContext {
    read: () => any;
}

export function makeDependencySerializable(webPackWithAlphaTab: webPackWithAlphaTab, dependency: any, key: string) {
    webPackWithAlphaTab.webpack.util.serialization.register(dependency, key, null, {
        serialize(obj, context) {
            obj.serialize(context);
        },
        deserialize(context) {
            if (typeof dependency.deserialize === 'function') {
                return dependency.deserialize(context);
            }
            const obj = new dependency();
            obj.deserialize(context);
            return obj;
        }
    });
}

export function tapJavaScript(
    normalModuleFactory: NormalModuleFactory,
    pluginName: string,
    parserPlugin: (parser: any) => void
) {
    normalModuleFactory.hooks.parser.for(JAVASCRIPT_MODULE_TYPE_AUTO).tap(pluginName, parserPlugin);
    normalModuleFactory.hooks.parser.for(JAVASCRIPT_MODULE_TYPE_ESM).tap(pluginName, parserPlugin);
}

export function parseModuleUrl(parser: any, expr: Expression) {
    if (expr.type !== 'NewExpression' || (expr as NewExpression).arguments.length !== 2) {
        return;
    }

    const newExpr = expr as NewExpression;
    const [arg1, arg2] = newExpr.arguments;
    const callee = parser.evaluateExpression(newExpr.callee);

    if (!callee.isIdentifier() || !callee.identifier.includes('alphaTabUrl')) {
        return;
    }

    const arg1Value = parser.evaluateExpression(arg1);
    return [arg1Value, [arg1.range![0], arg2.range![1]]];
}

const ALPHATAB_WORKER_RUNTIME_PREFIX = 'atworker_';

export function getWorkerRuntime(
    parser: any,
    compilation: webpackTypes.Compilation,
    cachedContextify: (s: string) => string,
    workerIndexMap: WeakMap<webpackTypes.ParserState, number>
): string {
    const i = workerIndexMap.get(parser.state) || 0;
    workerIndexMap.set(parser.state, i + 1);
    const name = `${cachedContextify(parser.state.module.identifier())}|${i}`;
    const hash = compilation.compiler.webpack.util.createHash(compilation.outputOptions.hashFunction!);
    hash.update(name);
    const digest = hash.digest(compilation.outputOptions.hashDigest) as string;
    const runtime = digest.slice(0, compilation.outputOptions.hashDigestLength);

    return ALPHATAB_WORKER_RUNTIME_PREFIX + runtime;
}

export function isWorkerRuntime(runtime: webpackTypes.Chunk['runtime']) {
    if (typeof runtime !== 'string') {
        return false;
    }
    return runtime.startsWith(ALPHATAB_WORKER_RUNTIME_PREFIX);
}
