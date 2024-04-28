/**@target web */

// index.ts for more details on contents and license of this file

import { type InternalModuleFormat } from 'rollup';
import { joinUrlSegments, partialEncodeURIPath } from './utils';
import * as path from 'path';
import { ResolvedConfig } from './config';

const needsEscapeRegEx = /[\n\r'\\\u2028\u2029]/;
const quoteNewlineRegEx = /([\n\r'\u2028\u2029])/g;
const backSlashRegEx = /\\/g;

function escapeId(id: string): string {
    if (!needsEscapeRegEx.test(id)) return id;
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
        if (relativePath[0] !== '.') relativePath = './' + relativePath;
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
    let relative = config.base === '' || config.base === './';
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
