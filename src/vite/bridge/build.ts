/**@target web */

// index.ts for more details on contents and license of this file

import type { MinimalPluginContext, PluginContext, InternalModuleFormat } from 'rollup';
import { joinUrlSegments, partialEncodeURIPath } from '@src/vite/bridge/utils';
import * as path from 'node:path';
import type { ResolvedConfig } from '@src/vite/bridge/config';
import type { BuildEnvironment, Plugin } from 'vite';
import type { RollupPluginHooks } from '@src/vite/bridge/typeUtils';
import { ROLLUP_HOOKS } from '@src/vite/bridge/constants';
import { getHookHandler } from '@src/vite/bridge/plugins';

const needsEscapeRegEx = /[\n\r'\\\u2028\u2029]/;
const quoteNewlineRegEx = /([\n\r'\u2028\u2029])/g;
const backSlashRegEx = /\\/g;

function escapeId(id: string): string {
    if (!needsEscapeRegEx.test(id)) {
        return id;
    }
    return id.replace(backSlashRegEx, '\\\\').replace(quoteNewlineRegEx, '\\$1');
}

const getResolveUrl = (path: string, URL = 'URL') => `new ${URL}(${path}).href`;

const getRelativeUrlFromDocument = (relativePath: string, umd = false) =>
    getResolveUrl(
        `'${escapeId(partialEncodeURIPath(relativePath))}', ${
            umd ? `typeof document === 'undefined' ? location.href : ` : ''
        }document.currentScript && document.currentScript.src || document.baseURI`
    );

const getFileUrlFromFullPath = (path: string) => `require('u' + 'rl').pathToFileURL(${path}).href`;

const getFileUrlFromRelativePath = (path: string) => getFileUrlFromFullPath(`__dirname + '/${escapeId(path)}'`);

const relativeUrlMechanisms: Record<InternalModuleFormat, (relativePath: string) => string> = {
    amd: relativePath => {
        if (relativePath[0] !== '.') {
            relativePath = `./${relativePath}`;
        }
        return getResolveUrl(`require.toUrl('${escapeId(relativePath)}'), document.baseURI`);
    },
    cjs: relativePath =>
        `(typeof document === 'undefined' ? ${getFileUrlFromRelativePath(relativePath)} : ${getRelativeUrlFromDocument(
            relativePath
        )})`,
    es: relativePath => getResolveUrl(`'${escapeId(partialEncodeURIPath(relativePath))}', import.meta.url`),
    iife: relativePath => getRelativeUrlFromDocument(relativePath),
    // NOTE: make sure rollup generate `module` params
    system: relativePath => getResolveUrl(`'${escapeId(partialEncodeURIPath(relativePath))}', module.meta.url`),
    umd: relativePath =>
        `(typeof document === 'undefined' && typeof location === 'undefined' ? ${getFileUrlFromRelativePath(
            relativePath
        )} : ${getRelativeUrlFromDocument(relativePath, true)})`
};

const customRelativeUrlMechanisms = {
    ...relativeUrlMechanisms,
    'worker-iife': relativePath =>
        getResolveUrl(`'${escapeId(partialEncodeURIPath(relativePath))}', self.location.href`)
} as const satisfies Record<string, (relativePath: string) => string>;

export function createToImportMetaURLBasedRelativeRuntime(
    format: InternalModuleFormat,
    isWorker: boolean
): (filename: string, importer: string) => { runtime: string } {
    const formatLong = isWorker && format === 'iife' ? 'worker-iife' : format;
    const toRelativePath = customRelativeUrlMechanisms[formatLong];
    return (filename, importer) => ({
        runtime: toRelativePath(path.posix.relative(path.dirname(importer), filename))
    });
}

export function toOutputFilePathInJS(
    filename: string,
    type: 'asset' | 'public',
    hostId: string,
    hostType: 'js' | 'css' | 'html',
    config: ResolvedConfig,
    toRelative: (filename: string, hostType: string) => string | { runtime: string }
): string | { runtime: string } {
    const { renderBuiltUrl } = config.experimental;
    let relative = config.base === '' || config.base === '@src/vite/bridge/';
    if (renderBuiltUrl) {
        const result = renderBuiltUrl(filename, {
            hostId,
            hostType,
            type,
            ssr: !!config.build.ssr
        });
        if (typeof result === 'object') {
            if (result.runtime) {
                return { runtime: result.runtime };
            }
            if (typeof result.relative === 'boolean') {
                relative = result.relative;
            }
        } else if (result) {
            return result;
        }
    }
    if (relative && !config.build.ssr) {
        return toRelative(filename, hostId);
    }
    return joinUrlSegments(config.base, filename);
}

// https://github.com/vitejs/vite/blob/v6.1.1/packages/vite/src/node/build.ts#L1131

export function injectEnvironmentToHooks(environment: BuildEnvironment, plugin: Plugin): Plugin {
    const { resolveId, load, transform } = plugin;

    const clone = { ...plugin };

    for (const hook of Object.keys(clone) as RollupPluginHooks[]) {
        switch (hook) {
            case 'resolveId':
                clone[hook] = wrapEnvironmentResolveId(environment, resolveId);
                break;
            case 'load':
                clone[hook] = wrapEnvironmentLoad(environment, load);
                break;
            case 'transform':
                clone[hook] = wrapEnvironmentTransform(environment, transform);
                break;
            default:
                if (ROLLUP_HOOKS.includes(hook)) {
                    (clone as any)[hook] = wrapEnvironmentHook(environment, clone[hook]);
                }
                break;
        }
    }

    return clone;
}

function wrapEnvironmentResolveId(environment: BuildEnvironment, hook?: Plugin['resolveId']): Plugin['resolveId'] {
    if (!hook) {
        return;
    }

    const fn = getHookHandler(hook);
    const handler: Plugin['resolveId'] = function (id, importer, options) {
        return fn.call(
            injectEnvironmentInContext(this, environment),
            id,
            importer,
            injectSsrFlag(options, environment)
        );
    };

    if ('handler' in hook) {
        return {
            ...hook,
            handler
        } as Plugin['resolveId'];
    }
    return handler;
}

function wrapEnvironmentLoad(environment: BuildEnvironment, hook?: Plugin['load']): Plugin['load'] {
    if (!hook) {
        return;
    }

    const fn = getHookHandler(hook);
    const handler: Plugin['load'] = function (id, ...args) {
        return fn.call(injectEnvironmentInContext(this, environment), id, injectSsrFlag(args[0], environment));
    };

    if ('handler' in hook) {
        return {
            ...hook,
            handler
        } as Plugin['load'];
    }
    return handler;
}

function wrapEnvironmentTransform(environment: BuildEnvironment, hook?: Plugin['transform']): Plugin['transform'] {
    if (!hook) {
        return;
    }

    const fn = getHookHandler(hook);
    const handler: Plugin['transform'] = function (code, importer, ...args) {
        return fn.call(
            injectEnvironmentInContext(this, environment),
            code,
            importer,
            injectSsrFlag(args[0], environment)
        );
    };

    if ('handler' in hook) {
        return {
            ...hook,
            handler
        } as Plugin['transform'];
    }
    return handler;
}

function wrapEnvironmentHook<HookName extends keyof Plugin>(
    environment: BuildEnvironment,
    hook?: Plugin[HookName]
): Plugin[HookName] {
    if (!hook) {
        return;
    }

    const fn = getHookHandler(hook);
    if (typeof fn !== 'function') {
        return hook;
    }

    const handler: Plugin[HookName] = function (this: PluginContext, ...args: any[]) {
        return fn.call(injectEnvironmentInContext(this, environment), ...args);
    };

    if ('handler' in hook) {
        return {
            ...hook,
            handler
        } as Plugin[HookName];
    }
    return handler;
}

function injectEnvironmentInContext<Context extends MinimalPluginContext>(
    context: Context,
    environment: BuildEnvironment
) {
    context.environment ??= environment;
    return context;
}

function injectSsrFlag<T extends Record<string, any>>(
    options?: T,
    environment?: BuildEnvironment
): T & { ssr?: boolean } {
    const ssr = environment ? environment.config.consumer === 'server' : true;
    return { ...(options ?? {}), ssr } as T & {
        ssr?: boolean;
    };
}
