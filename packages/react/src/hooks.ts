import type { AlphaTabApi, IEventEmitter, IEventEmitterOfT } from '@coderline/alphatab';
import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react';
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

function reportHandlerError(error: unknown) {
    if (typeof reportError === 'function') {
        reportError(error);
    } else {
        console.error(error);
    }
}

/**
 * Subscribes `handler` to an event of the nearest {@link AlphaTabProvider}'s API, for as long as the
 * component is mounted and that API is alive.
 *
 * Each call reaches the `handler` of the latest render; passing a new function does not resubscribe.
 * An error thrown by the handler is passed to `reportError` (or `console.error`) instead of
 * propagating into alphaTab, so other listeners of the event still run.
 *
 * alphaTab calls a new listener right away for events whose state already exists: `scoreLoaded` with
 * a loaded score, `midiLoaded` with loaded MIDI, `playerReady` once ready, `playerStateChanged`,
 * `playerPositionChanged`, `playbackRangeChanged` with a range, and `activeBeatsChanged` /
 * `playedBeatChanged` during playback. The handler sees this replay whenever the hook subscribes, i.e.
 * for every new API instance and, under `<StrictMode>` in development, twice on mount.
 * @throws When used outside an {@link AlphaTabProvider}.
 */
export function useAlphaTabEvent<E extends AlphaTabEventName>(event: E, handler: AlphaTabEventHandler<E>): void;
/**
 * Subscribes `handler` to an event of `api` while `api` is set; works outside an {@link AlphaTabProvider}.
 *
 * Calls, errors and replays behave as for the context form, {@link useAlphaTabEvent}.
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
        return emitterOf(api, event).on(arg => {
            try {
                handler.current(arg);
            } catch (error) {
                reportHandlerError(error);
            }
        });
    }, [api, event, handler]);
}

type Select = (arg: unknown, api: AlphaTabApi) => unknown;
type Read = ((api: AlphaTabApi) => unknown) | undefined;

interface EventValueSource {
    subscribe(onChange: () => void): () => void;
    derive(select: Select, read: Read): unknown;
}

/** Keeps the latest argument of `event` and derives the value from it on demand. */
function createEventValueSource(api: AlphaTabApi, event: AlphaTabEventName): EventValueSource {
    let last: { arg: unknown } | undefined;
    let version = 0;
    let cache: { version: number; select: Select; read: Read; value: unknown } | undefined;
    return {
        subscribe(onChange) {
            let replayed = false;
            const unsubscribe = emitterOf(api, event).on(arg => {
                replayed = true;
                last = { arg };
                version++;
                onChange();
            });
            if (!replayed && !last) {
                // the state `read` reflects may have changed since rendering
                version++;
                onChange();
            }
            return unsubscribe;
        },
        derive(select, read) {
            if (cache && cache.version === version && cache.select === select && cache.read === read) {
                return cache.value;
            }
            const value = last ? select(last.arg, api) : read?.(api);
            cache = { version, select, read, value };
            return value;
        }
    };
}

const subscribeNone = () => () => {};
const snapshotNone = () => undefined;

/**
 * A value derived from an event of the nearest {@link AlphaTabProvider}'s API, re-rendering the
 * component whenever the event fires.
 *
 * `select` derives the value from the latest event argument, e.g. `e => e.state`; `read` yields the
 * current value until the event first fires, e.g. `api => api.playerState`. Without `read`, the value
 * is `undefined` until then. Both may be inline functions: the value is derived again when either
 * changes, and they run during rendering, so errors they throw reach the nearest error boundary.
 * Events alphaTab replays on subscription (see {@link useAlphaTabEvent}) supply their value right away.
 * Returns `undefined` while there is no API and during server rendering.
 * @throws When used outside an {@link AlphaTabProvider}.
 */
export function useAlphaTabEventValue<E extends AlphaTabEventName, T>(
    event: E,
    select: (arg: AlphaTabEventArgs<E>, api: AlphaTabApi) => T,
    read?: (api: AlphaTabApi) => T
): T | undefined;
/**
 * A value derived from an event of `api`, as the context form {@link useAlphaTabEventValue} derives
 * it; works outside an {@link AlphaTabProvider}. Returns `undefined` while `api` is unset.
 */
export function useAlphaTabEventValue<E extends AlphaTabEventName, T>(
    api: AlphaTabApi | null | undefined,
    event: E,
    select: (arg: AlphaTabEventArgs<E>, api: AlphaTabApi) => T,
    read?: (api: AlphaTabApi) => T
): T | undefined;
export function useAlphaTabEventValue(...args: unknown[]): unknown {
    const context = useContext(AlphaTabContext);
    const fromContext = typeof args[0] === 'string';
    if (fromContext && !context) {
        throw new Error('useAlphaTabEventValue(event, select) must be used inside <AlphaTabProvider>');
    }
    const offset = fromContext ? 0 : 1;
    const api = (fromContext ? context!.api : args[0]) as AlphaTabApi | null | undefined;
    const event = args[offset] as AlphaTabEventName;
    const select = args[offset + 1] as Select;
    const read = args[offset + 2] as Read;

    const source = useMemo(() => (api ? createEventValueSource(api, event) : undefined), [api, event]);
    const getSnapshot = useCallback(() => source?.derive(select, read), [source, select, read]);
    return useSyncExternalStore(source?.subscribe ?? subscribeNone, getSnapshot, snapshotNone);
}
