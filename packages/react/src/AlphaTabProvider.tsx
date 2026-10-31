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
import { ApiLifecycle } from './lifecycle';
import { diffSettings, settingsEqual, snapshotSettings } from './settings';

/**
 * Props of {@link AlphaTabProvider}.
 */
export interface AlphaTabProviderProps {
    /**
     * Prepares the settings of a new API instance. Called right before construction, after
     * `player.scrollElement` is set to the host's scroll element and the initial sources are applied,
     * and before {@link AlphaTabProviderProps.settings} is merged on top.
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
     * The URL of a file to load when the API is created (`core.file`). Takes precedence over
     * {@link AlphaTabProviderProps.tex}. Later changes are ignored; load further scores through the API.
     */
    file?: string;
    /**
     * alphaTex source to load when the API is created (`core.tex`). Later changes are ignored; load
     * further scores through the API, e.g. `api.tex()`.
     */
    tex?: string;
    /** The initially displayed tracks (`core.tracks`). Later changes are ignored. */
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

            const { configureSettings, settings, file, tex, tracks, onApi } = latestProps.current;

            const initial = new Settings();
            initial.player.scrollElement = scrollElement;
            if (file) {
                initial.core.file = file;
            } else if (tex !== undefined) {
                initial.core.tex = true;
                mountElement.textContent = tex;
            }
            if (tracks !== undefined) {
                initial.core.tracks = tracks;
            }
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
