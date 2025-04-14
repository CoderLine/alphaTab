/**@target web */

import type { ObjectHook } from 'rollup';
import type { HookHandler } from 'vite';

// https://github.com/vitejs/vite/blob/v6.1.1/packages/vite/src/node/plugins/index.ts#L161
// biome-ignore lint/complexity/noBannedTypes: Function type needed here
export function getHookHandler<T extends ObjectHook<Function>>(hook: T): HookHandler<T> {
    return (typeof hook === 'object' ? hook.handler : hook) as HookHandler<T>;
}
