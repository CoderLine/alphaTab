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
     * synchronously before that instance is destroyed.
     * Only the function passed in the render that precedes the construction is used.
     */
    // biome-ignore lint/suspicious/noConfusingVoidType: same contract as React's EffectCallback
    onApi?: (api: AlphaTabApi) => void | (() => void);
    children?: ReactNode;
}

/**
 * The value an {@link AlphaTabProvider} ref resolves to.
 */
export interface AlphaTabProviderHandle {
    /** The live API instance, `null` while no {@link AlphaTabHost} is mounted. */
    readonly api: AlphaTabApi | null;
}

/**
 * Owns one alphaTab API instance and provides it to its subtree.
 *
 * The API is created once an {@link AlphaTabHost} inside the provider has mounted and is destroyed when
 * the host or the provider unmounts. It is recreated only when the host's elements change; to recreate it
 * for other reasons, change the provider's React `key`. At most one API instance per provider is alive
 * at any time, also under `<StrictMode>`. Nothing touches the DOM during rendering, so the provider can
 * be rendered on the server.
 */
export const AlphaTabProvider = forwardRef<AlphaTabProviderHandle, AlphaTabProviderProps>(
    function AlphaTabProvider(props, ref) {
        const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
        const [mountElement, setMountElement] = useState<HTMLElement | null>(null);
        const [api, setApi] = useState<AlphaTabApi | null>(null);

        const latestProps = useRef(props);
        useLayoutEffect(() => {
            latestProps.current = props;
        });

        const appliedSettings = useRef<json.SettingsJson | undefined>(undefined);
        const pendingFrame = useRef(0);

        useEffect(() => {
            if (!scrollElement || !mountElement) {
                return;
            }
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
            const detach = onApi?.(created);
            setApi(created);

            return () => {
                if (pendingFrame.current) {
                    cancelAnimationFrame(pendingFrame.current);
                    pendingFrame.current = 0;
                }
                setApi(null);
                if (typeof detach === 'function') {
                    detach();
                }
                created.destroy();
            };
        }, [scrollElement, mountElement]);

        const settings = props.settings;
        useEffect(() => {
            if (!api || settingsEqual(appliedSettings.current, settings)) {
                return;
            }
            const patch = diffSettings(appliedSettings.current, settings);
            appliedSettings.current = snapshotSettings(settings);
            if (!patch) {
                return;
            }
            api.settings.fillFromJson(patch);
            if (!pendingFrame.current) {
                pendingFrame.current = requestAnimationFrame(() => {
                    pendingFrame.current = 0;
                    api.updateSettings();
                    if (api.score) {
                        api.render();
                    }
                });
            }
        });

        useImperativeHandle(ref, () => ({ api }), [api]);

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
