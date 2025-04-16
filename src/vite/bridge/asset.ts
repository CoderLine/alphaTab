/**@target web */

// index.ts for more details on contents and license of this file

import type { ResolvedConfig } from '@src/vite/bridge/config';
import * as path from 'node:path';
import { joinUrlSegments, removeLeadingSlash, withTrailingSlash } from '@src/vite/bridge/utils';

export const FS_PREFIX = '/@fs/';

export async function fileToUrl(id: string, config: ResolvedConfig): Promise<string> {
    let rtn: string;
    if (id.startsWith(withTrailingSlash(config.root))) {
        // in project root, infer short public path
        rtn = `/${path.posix.relative(config.root, id)}`;
    } else {
        // outside of project root, use absolute fs path
        // (this is special handled by the serve static middleware
        rtn = path.posix.join(FS_PREFIX, id);
    }
    const base = joinUrlSegments(config.server?.origin ?? '', config.base);
    return joinUrlSegments(base, removeLeadingSlash(rtn));
}
