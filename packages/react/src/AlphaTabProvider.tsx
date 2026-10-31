import { AlphaTabApi, type json, Settings } from '@coderline/alphatab';
import {
    forwardRef,
    type ReactNode,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState
} from 'react';
import { AlphaTabContext, type AlphaTabContextValue } from './context';
import { warnInDevelopment } from './dev';
import { ApiLifecycle } from './lifecycle';
import { diffSettings, settingsEqual, snapshotSettings } from './settings';

/**
 * Props of {@link AlphaTabProvider}.
 */
export interface AlphaTabProviderProps {
    /**
     * Prepares the settings of a new API instance. Called right before construction, after
     * `player.scrollElement` is set to the host's scroll element and before
     * {@link AlphaTabProviderProps.settings} is merged on top.
     * Only the function passed in the render that precedes the construction is used.
     */
    configureSettings?: (settings: Settings) => void;
    /**
     * A settings patch merged into the API settings. It is applied whole at construction. Afterwards,
     * the values that differ from the previous render's patch are applied through
     * `settings.fillFromJson`, followed by `updateSettings()` and, when a score is loaded, `render()`,
     * batched to the next animation frame. A change never recreates the API.
     *
     * Values are compared structurally: plain objects by key regardless of order, arrays by element and
     * `Map`s by entry, while DOM nodes and other class instances are compared by identity. Settings the
     * patch leaves unchanged are not touched, so values set at runtime through the API stay in place.
     * Arrays and `Map`s replace the setting whole. Keys removed from the patch, or set to `undefined`,
     * keep their last applied value; a key that comes back is applied again.
     */
    settings?: json.SettingsJson;
    /**
     * The URL of the score to display, loaded through `api.load(file, tracks)`.
     *
     * The source props are reactive: the provider loads the score once a new API instance is provided,
     * after the effects of its descendants have subscribed to the API, and again whenever `file` or
     * `tex` changes. Removing the source keeps the displayed score. Only one of `file` and `tex` should
     * be set; a non-empty `file` takes precedence, and setting both logs a warning in development.
     * Consumers that load scores through the API themselves should omit `file` and `tex`, as a change
     * of either would load the prop's score over theirs.
     */
    file?: string;
    /**
     * alphaTex source of the score to display, loaded through `api.tex(tex, tracks)`. Reactive like
     * {@link AlphaTabProviderProps.file}, which takes precedence.
     */
    tex?: string;
    /**
     * The tracks to display: track indexes, or `'all'`. Applied with the next source load; a change
     * while `file` and `tex` stay the same re-renders the displayed score with the new tracks, also
     * one loaded through the API. Arrays are compared by content. Defaults to the first track.
     */
    tracks?: number | number[] | 'all';
    /**
     * Called with every new API instance, right after construction. A returned function is called
     * right before that instance is destroyed, after the effect cleanups of the provider's descendants.
     * When `onApi` throws, the instance is destroyed and the error propagates to the nearest error
     * boundary. Only the function passed in the render that precedes the construction is used.
     */
    // biome-ignore lint/suspicious/noConfusingVoidType: same contract as React's EffectCallback
    onApi?: (api: AlphaTabApi) => void | (() => void);
    children?: ReactNode;
}

/**
 * The value an {@link AlphaTabProvider} ref resolves to. The object stays the same for the lifetime
 * of the provider.
 */
export interface AlphaTabProviderHandle {
    /** The live API instance, `null` while no {@link AlphaTabHost} is mounted. */
    readonly api: AlphaTabApi | null;
}

interface LoadedSource {
    readonly api: AlphaTabApi;
    readonly file: string | undefined;
    readonly tex: string | undefined;
    readonly tracksKey: string | undefined;
}

/** A value-comparable form of the `tracks` prop, as the indexes `api.renderScore` takes. */
function trackIndexesKey(tracks: AlphaTabProviderProps['tracks']): string | undefined {
    if (tracks === undefined) {
        return undefined;
    }
    if (tracks === 'all') {
        return '-1';
    }
    return (typeof tracks === 'number' ? [tracks] : tracks).join(',');
}

function parseTrackIndexesKey(key: string | undefined): number[] | undefined {
    if (key === undefined) {
        return undefined;
    }
    return key === '' ? [] : key.split(',').map(Number);
}

/**
 * Owns one alphaTab API instance and provides it to its subtree.
 *
 * The API is created once an {@link AlphaTabHost} inside the provider has mounted and is recreated only
 * when the host's elements change; to recreate it for other reasons, change the provider's React `key`.
 * Nothing touches the DOM during rendering, so the provider can be rendered on the server.
 *
 * An instance that is replaced, or whose host or provider unmounts, is no longer provided right away
 * and is destroyed once the effects of the subtree that used it have been cleaned up, so these cleanups
 * may still call it. A new instance on the same mount element is only created after its predecessor is
 * destroyed, which keeps one instance per element alive, also under `<StrictMode>`.
 */
export const AlphaTabProvider = forwardRef<AlphaTabProviderHandle, AlphaTabProviderProps>(
    function AlphaTabProvider(props, ref) {
        const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
        const [mountElement, setMountElement] = useState<HTMLElement | null>(null);
        const [api, setApi] = useState<AlphaTabApi | null>(null);
        const [lifecycle] = useState(() => new ApiLifecycle());
        const [handle] = useState<AlphaTabProviderHandle>(() => ({
            get api() {
                return lifecycle.live;
            }
        }));

        const latestProps = useRef(props);
        useLayoutEffect(() => {
            latestProps.current = props;
        });

        const appliedSettings = useRef<json.SettingsJson | undefined>(undefined);

        useEffect(() => {
            if (!scrollElement || !mountElement) {
                return;
            }
            // destroying clears the mount element, so it must not hit the successor's content
            lifecycle.destroyRetired((_, element) => element === mountElement);

            const { configureSettings, settings, onApi } = latestProps.current;

            const initial = new Settings();
            initial.player.scrollElement = scrollElement;
            configureSettings?.(initial);
            if (settings) {
                initial.fillFromJson(settings);
            }
            appliedSettings.current = snapshotSettings(settings);

            const created = new AlphaTabApi(mountElement, initial);
            // biome-ignore lint/suspicious/noConfusingVoidType: the return type of onApi
            let detach: void | (() => void);
            try {
                detach = onApi?.(created);
            } catch (error) {
                created.destroy();
                throw error;
            }
            lifecycle.activate(created);
            setApi(created);

            return () => {
                setApi(null);
                lifecycle.retire(created, mountElement, typeof detach === 'function' ? detach : undefined);
            };
        }, [lifecycle, scrollElement, mountElement]);

        // A replaced instance is destroyed in the first commit that no longer provides it, after the
        // descendants' effect cleanups for it.
        useEffect(() => {
            lifecycle.destroyRetired(retired => retired !== api);
        }, [lifecycle, api]);

        // Unmounting cleans up the provider before its descendants, so destruction waits for them.
        useEffect(
            () => () => {
                queueMicrotask(() => lifecycle.destroyRetired());
            },
            [lifecycle]
        );

        const settings = props.settings;
        useEffect(() => {
            if (!api || api !== lifecycle.live || settingsEqual(appliedSettings.current, settings)) {
                return;
            }
            const patch = diffSettings(appliedSettings.current, settings);
            appliedSettings.current = snapshotSettings(settings);
            if (!patch) {
                return;
            }
            api.settings.fillFromJson(patch);
            lifecycle.requestFrame(() => {
                api.updateSettings();
                if (api.score) {
                    api.render();
                }
            });
        });

        const file = props.file || undefined;
        const tex = file === undefined ? props.tex : undefined;
        const tracksKey = trackIndexesKey(props.tracks);
        const loadedSource = useRef<LoadedSource | null>(null);
        // Runs after the descendants' effects, so their subscriptions see the events of the first load.
        useEffect(() => {
            if (!api || api !== lifecycle.live) {
                return;
            }
            const previous = loadedSource.current?.api === api ? loadedSource.current : null;
            loadedSource.current = { api, file, tex, tracksKey };
            const trackIndexes = parseTrackIndexesKey(tracksKey);
            if (previous && previous.file === file && previous.tex === tex) {
                if (previous.tracksKey !== tracksKey && api.score) {
                    api.renderScore(api.score, trackIndexes);
                }
                return;
            }
            if (file !== undefined) {
                api.load(file, trackIndexes);
            } else if (tex !== undefined) {
                api.tex(tex, trackIndexes);
            }
        }, [lifecycle, api, file, tex, tracksKey]);

        const bothSources = !!props.file && props.tex !== undefined;
        useEffect(() => {
            if (bothSources) {
                warnInDevelopment('<AlphaTabProvider> received both file and tex; tex is ignored.');
            }
        }, [bothSources]);

        useImperativeHandle(ref, () => handle, [handle]);

        const context = useMemo<AlphaTabContextValue>(
            () => ({
                api,
                elements: { scrollElement, mountElement },
                setScrollElement,
                setMountElement
            }),
            [api, scrollElement, mountElement]
        );

        return <AlphaTabContext.Provider value={context}>{props.children}</AlphaTabContext.Provider>;
    }
);
