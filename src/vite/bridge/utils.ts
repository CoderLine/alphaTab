/**@target web */

// index.ts for more details on contents and license of this file

import * as fs from 'node:fs';
import { createHash } from 'node:crypto';

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/utils.ts#L1302
export function evalValue<T = unknown>(rawValue: string): T {
    const fn = new Function(`
        var console, exports, global, module, process, require
        return (\n${rawValue}\n)
      `);
    return fn();
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/shared/utils.ts#L31-L34
const postfixRE = /[?#].*$/;
export function cleanUrl(url: string): string {
    return url.replace(postfixRE, '');
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/utils.ts#L393
export function tryStatSync(file: string) {
    try {
        // The "throwIfNoEntry" is a performance optimization for cases where the file does not exist
        return fs.statSync(file, { throwIfNoEntry: false });
    } catch {
        // Ignore errors
    }
    return;
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/utils.ts#L1030
export function getHash(text: Buffer | string, length = 8): string {
    const h = createHash('sha256').update(text).digest('hex').substring(0, length);
    if (length <= 64) {
        return h;
    }
    return h.padEnd(length, '_');
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/shared/utils.ts#L40
export function withTrailingSlash(path: string): string {
    if (path[path.length - 1] !== '/') {
        return `${path}/`;
    }
    return path;
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/utils.ts#L1268
export function joinUrlSegments(a: string, b: string): string {
    if (!a || !b) {
        return a || b || '';
    }
    if (a[a.length - 1] === '/') {
        a = a.substring(0, a.length - 1);
    }
    if (b[0] !== '/') {
        b = `/${b}`;
    }
    return a + b;
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/utils.ts#L1281
export function removeLeadingSlash(str: string): string {
    return str[0] === '/' ? str.slice(1) : str;
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/utils.ts#L319
export function injectQuery(builtUrl: string, query: string): string {
    const queryIndex = builtUrl.indexOf('?');
    return builtUrl + (queryIndex === -1 ? '?' : '&') + query;
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/utils.ts#L1435
export function partialEncodeURIPath(uri: string): string {
    if (uri.startsWith('data:')) {
        return uri;
    }
    const filePath = cleanUrl(uri);
    const postfix = filePath !== uri ? uri.slice(filePath.length) : '';
    return filePath.replaceAll('%', '%25') + postfix;
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/utils.ts#L1424
export function encodeURIPath(uri: string): string {
    if (uri.startsWith('data:')) {
        return uri;
    }
    const filePath = cleanUrl(uri);
    const postfix = filePath !== uri ? uri.slice(filePath.length) : '';
    return encodeURI(filePath) + postfix;
}
