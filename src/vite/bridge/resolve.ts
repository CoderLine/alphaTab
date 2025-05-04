/**@target web */

// index.ts for more details on contents and license of this file

import { normalizePath } from 'vite';
import { tryResolveRealFile } from '@src/vite/bridge/fsUtils';
import { cleanUrl } from '@src/vite/bridge/utils';

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/plugins/resolve.ts#L534
function splitFileAndPostfix(path: string) {
    const file = cleanUrl(path);
    return { file, postfix: path.slice(file.length) };
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/plugins/resolve.ts#L566-L574
export function tryFsResolve(fsPath: string, preserveSymlinks: boolean): string | undefined {
    const { file, postfix } = splitFileAndPostfix(fsPath);
    const res = tryCleanFsResolve(file, preserveSymlinks);
    if (res) {
        return res + postfix;
    }

    return;
}

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/plugins/resolve.ts#L580
function tryCleanFsResolve(file: string, preserveSymlinks: boolean): string | undefined {
    if (file.includes('node_modules')) {
        return tryResolveRealFile(file, preserveSymlinks);
    }

    const normalizedResolved = tryResolveRealFile(normalizePath(file));
    if (!normalizedResolved) {
        return tryResolveRealFile(file, preserveSymlinks);
    }

    return normalizedResolved;
}
