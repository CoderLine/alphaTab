// index.ts for more details on contents and license of this file

// https://github.com/vitejs/vite/blob/v6.1.1/packages/vite/src/node/typeUtils.ts
import type { ObjectHook, MinimalPluginContext as RollupMinimalPluginContext, Plugin as RollupPlugin } from 'rollup';

/**
 * @internal
 */
export type NonNeverKeys<T> = {
    [K in keyof T]: T[K] extends never ? never : K;
}[keyof T];

/**
 * @internal
 */
export type GetHookContextMap<Plugin> = {
    [K in keyof Plugin]-?: Plugin[K] extends ObjectHook<infer T, unknown>
        ? T extends (this: infer This, ...args: any[]) => any
            ? This extends RollupMinimalPluginContext
                ? This
                : never
            : never
        : never;
};

type RollupPluginHooksContext = GetHookContextMap<RollupPlugin>;

/**
 * @internal
 */
export type RollupPluginHooks = NonNeverKeys<RollupPluginHooksContext>;

/**
 * @internal
 */
export type RequiredExceptFor<T, K extends keyof T> = Pick<T, K> & Required<Omit<T, K>>;
