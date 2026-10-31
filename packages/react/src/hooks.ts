import type { AlphaTabApi, IEventEmitter, IEventEmitterOfT } from '@coderline/alphatab';
import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { AlphaTabContext, type AlphaTabElements, useAlphaTabContext } from './context';

/** The names of the events {@link AlphaTabApi} exposes. */
export type AlphaTabEventName = {
    [K in keyof AlphaTabApi]-?: AlphaTabApi[K] extends IEventEmitter | IEventEmitterOfT<any> ? K : never;
}[keyof AlphaTabApi];

/** The argument alphaTab passes to handlers of the event `E`; `unknown` for events without one. */
export type AlphaTabEventArgs<E extends AlphaTabEventName> =
    AlphaTabApi[E] extends IEventEmitterOfT<infer T> ? T : never;

/** A handler of the event `E`. */
export type AlphaTabEventHandler<E extends AlphaTabEventName> =
    AlphaTabApi[E] extends IEventEmitterOfT<infer T> ? (arg: T) => void : () => void;

/**
 * The API of the nearest {@link AlphaTabProvider}, `null` while it has none.
 * @throws When used outside an {@link AlphaTabProvider}.
 */
export function useAlphaTabApi(): AlphaTabApi | null {
    return useAlphaTabContext('useAlphaTabApi').api;
}

/**
 * The DOM elements of the {@link AlphaTabHost} of the nearest {@link AlphaTabProvider}.
 * @throws When used outside an {@link AlphaTabProvider}.
 */
export function useAlphaTabElements(): AlphaTabElements {
    return useAlphaTabContext('useAlphaTabElements').elements;
}

function useLatest<T>(value: T) {
    const ref = useRef(value);
    useLayoutEffect(() => {
        ref.current = value;
    });
    return ref;
}

function emitterOf(api: AlphaTabApi, event: AlphaTabEventName): IEventEmitterOfT<unknown> {
    return api[event] as unknown as IEventEmitterOfT<unknown>;
}

/**
 * Subscribes `handler` to an event of the nearest {@link AlphaTabProvider}'s API, for as long as the
 * component is mounted and that API is alive.
 *
 * Each call reaches the `handler` of the latest render; passing a new function does not resubscribe.
 * @throws When used outside an {@link AlphaTabProvider}.
 */
export function useAlphaTabEvent<E extends AlphaTabEventName>(event: E, handler: AlphaTabEventHandler<E>): void;
/**
 * Subscribes `handler` to an event of `api` while `api` is set; works outside an {@link AlphaTabProvider}.
 *
 * Each call reaches the `handler` of the latest render; passing a new function does not resubscribe.
 */
export function useAlphaTabEvent<E extends AlphaTabEventName>(
    api: AlphaTabApi | null | undefined,
    event: E,
    handler: AlphaTabEventHandler<E>
): void;
export function useAlphaTabEvent(...args: unknown[]): void {
    const context = useContext(AlphaTabContext);
    const fromContext = typeof args[0] === 'string';
    if (fromContext && !context) {
        throw new Error('useAlphaTabEvent(event, handler) must be used inside <AlphaTabProvider>');
    }
    const api = (fromContext ? context!.api : args[0]) as AlphaTabApi | null | undefined;
    const event = (fromContext ? args[0] : args[1]) as AlphaTabEventName;
    const handler = useLatest((fromContext ? args[1] : args[2]) as (arg: unknown) => void);

    useEffect(() => {
        if (!api) {
            return;
        }
        return emitterOf(api, event).on(arg => handler.current(arg));
    }, [api, event, handler]);
}

const subscribeNone = () => () => {};
const snapshotNone = () => undefined;

/**
 * A value derived from an event of `api`, re-rendering the component whenever the event fires.
 *
 * `read` yields the current value, e.g. `api => api.playerState`, and supplies the value until the event
 * first fires. `select` derives the value from each event, e.g. `e => e.state`. Both receive the API and
 * are called in their latest version.
 * Returns `undefined` while `api` is unset and during server rendering.
 */
export function useAlphaTabEventValue<E extends AlphaTabEventName, T>(
    api: AlphaTabApi | null | undefined,
    event: E,
    select: (arg: AlphaTabEventArgs<E>, api: AlphaTabApi) => T,
    read: (api: AlphaTabApi) => T
): T | undefined {
    const latestSelect = useLatest(select);
    const latestRead = useLatest(read);

    const source = useMemo(() => {
        if (!api) {
            return undefined;
        }
        let hasValue = false;
        let value: T;
        return {
            subscribe(onChange: () => void) {
                let fired = false;
                const unsubscribe = emitterOf(api, event).on(arg => {
                    fired = true;
                    hasValue = true;
                    value = latestSelect.current(arg as AlphaTabEventArgs<E>, api);
                    onChange();
                });
                if (!fired) {
                    const current = latestRead.current(api);
                    if (!hasValue || !Object.is(current, value)) {
                        hasValue = true;
                        value = current;
                        onChange();
                    }
                }
                return unsubscribe;
            },
            getSnapshot(): T {
                if (!hasValue) {
                    hasValue = true;
                    value = latestRead.current(api);
                }
                return value;
            }
        };
    }, [api, event, latestSelect, latestRead]);

    return useSyncExternalStore<T | undefined>(
        source?.subscribe ?? subscribeNone,
        source?.getSnapshot ?? snapshotNone,
        snapshotNone
    );
}
