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
     * A settings patch merged into the API settings. It is applied at construction and again whenever
     * its JSON serialization changes, through `settings.fillFromJson`, `updateSettings()` and `render()`,
     * batched to the next animation frame. A change never recreates the API.
     * Keys removed from the patch keep their last applied value.
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

function serializeSettings(settings: json.SettingsJson | undefined): string | undefined {
    return settings === undefined ? undefined : JSON.stringify(settings);
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

        const appliedSettings = useRef<string | undefined>(undefined);
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
            appliedSettings.current = serializeSettings(settings);

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

        const settingsKey = serializeSettings(props.settings);
        useEffect(() => {
            if (!api || settingsKey === appliedSettings.current) {
                return;
            }
            appliedSettings.current = settingsKey;
            const patch = latestProps.current.settings;
            if (patch) {
                api.settings.fillFromJson(patch);
            }
            if (!pendingFrame.current) {
                pendingFrame.current = requestAnimationFrame(() => {
                    pendingFrame.current = 0;
                    api.updateSettings();
                    if (api.score) {
                        api.render();
                    }
                });
            }
        }, [api, settingsKey]);

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
