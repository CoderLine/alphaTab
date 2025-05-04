/**@target web */

// index.ts for more details on contents and license of this file

import type { ResolvedConfig as ResolvedConfigWithoutInternal } from 'vite';

export type ResolvedConfig = ResolvedConfigWithoutInternal & {
    // https://github.com/vitejs/vite/blob/b7ddfae5f852c2948fab03e94751ce56f5f31ce0/packages/vite/src/node/config.ts#L376-L378
    mainConfig: ResolvedConfig | null;
    bundleChain: string[];
};
