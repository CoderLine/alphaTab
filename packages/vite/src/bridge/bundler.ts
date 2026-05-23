// Detects whether the host Vite installation uses Rollup (Vite <= 7) or
// Rolldown (Vite >= 8). The worker bundling path branches on this so each
// bundler receives the plugin shape it expects.

import type { ResolvedConfig } from './config';

/**
 * @internal
 */
export const enum BundlerKind {
    Rollup = 'rollup',
    Rolldown = 'rolldown'
}

/**
 * @internal
 */
export function detectBundler(config: ResolvedConfig): BundlerKind {
    // Vite 8 carries `rolldownOptions` on the resolved worker options; Vite 7
    // only emits `rollupOptions`.
    return 'rolldownOptions' in (config.worker as object) ? BundlerKind.Rolldown : BundlerKind.Rollup;
}
