/**@target web */

// index.ts for more details on contents and license of this file

import * as fs from 'node:fs';
import { tryStatSync } from '@src/vite/bridge/utils';

// https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/fsUtils.ts#L388
export function tryResolveRealFile(file: string, preserveSymlinks?: boolean): string | undefined {
    const fileStat = tryStatSync(file);
    if (fileStat?.isFile()) {
        return file;
    }
    if (fileStat?.isSymbolicLink()) {
        return preserveSymlinks ? file : fs.realpathSync(file);
    }

    return undefined;
}
