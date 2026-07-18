import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
    type DependencyList,
    type ReactNode,
} from 'react';
import type * as alphaTab from '@coderline/alphatab';
import { useColorMode } from '@docusaurus/theme-common';
import { useAlphaTabModule } from './module';
import { applyAlphaTabSettings, type AlphaTabPreset } from './settings';
import { AlphaTabStore, initialAlphaTabState, type AlphaTabState } from './store';
import { SelectionHandles } from './selection-handles';

interface AlphaTabContextValue {
    state: AlphaTabState;
    store: AlphaTabStore | null;
    api: alphaTab.AlphaTabApi | null;
    setMountElement: (node: HTMLDivElement | null) => void;
    setScrollElement: (node: HTMLDivElement | null) => void;
}

const AlphaTabContext = createContext<AlphaTabContextValue | null>(null);

function useAlphaTabContext(): AlphaTabContextValue {
    const ctx = useContext(AlphaTabContext);
    if (!ctx) {
        throw new Error('useAlphaTab* hooks must be used inside <AlphaTabPlayer>');
    }
    return ctx;
}

const noopSubscribe = () => () => {};
const noopSnapshot = () => initialAlphaTabState;

export interface AlphaTabPlayerProps {
    /** URL of a `.gp`/`.gp5`/`.gpx`/`.musicxml`/`.capx` to load on mount. */
    file?: string;
    /** Inline alphaTex source to load on mount. Mutually exclusive with `file`. */
    tex?: string;
    /** Initial track selection. `'all'` shows every track. */
    tracks?: number[] | 'all';
    /**
     * Extra alphaTab settings deep-merged over the preset defaults at
     * construction time. Changes at runtime are applied via
     * `settings.fillFromJson` + `updateSettings()` + `render()`.
     */
    settings?: alphaTab.json.SettingsJson;
    /**
     * Enable the synth player. Defaults to `true`. Pages that only need a
     * static render (layout demos, notation catalogues) can pass `false` to
     * skip the audio-worklet setup and the SoundFont fetch.
     */
    player?: boolean;
    /**
     * Which opinionated defaults to apply. `docs` (default) is a neutral
     * baseline for the docs site; `landing` layers the marketing chrome on.
     */
    settingsPreset?: AlphaTabPreset;
    children: ReactNode;
}

export function AlphaTabPlayer({
    file,
    tex,
    tracks,
    settings,
    player = true,
    settingsPreset = 'docs',
    children,
}: AlphaTabPlayerProps) {
    const module = useAlphaTabModule();
    const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);
    const [scrollNode, setScrollNode] = useState<HTMLDivElement | null>(null);
    const [store, setStore] = useState<AlphaTabStore | null>(null);
    const [api, setApi] = useState<alphaTab.AlphaTabApi | null>(null);
    const { colorMode } = useColorMode();
    const colorModeRef = useRef(colorMode);
    colorModeRef.current = colorMode;

    const setMountElement = useCallback((node: HTMLDivElement | null) => {
        setMountNode(node);
    }, []);

    const setScrollElement = useCallback((node: HTMLDivElement | null) => {
        setScrollNode(node);
    }, []);

    // Freeze the initial-mount props via refs so the effect below re-runs only
    // when the DOM nodes change. Runtime changes to `file`/`tex`/`tracks`/
    // `settings` are handled by dedicated effects further down.
    const initialSettingsRef = useRef(settings);
    initialSettingsRef.current = settings;

    useEffect(() => {
        if (!module || !mountNode || !scrollNode) return;

        const constructed = new module.Settings();
        applyAlphaTabSettings(module, constructed, {
            colorMode: colorModeRef.current,
            preset: settingsPreset,
        });
        constructed.player.scrollElement = scrollNode;
        constructed.player.playerMode = player
            ? module.PlayerMode.EnabledAutomatic
            : module.PlayerMode.Disabled;
        constructed.display.layoutMode = module.LayoutMode.Page;
        constructed.player.scrollMode = module.ScrollMode.Off;
        constructed.player.enableCursor = true;
        constructed.player.enableElementHighlighting = true;

        if (file) constructed.core.file = file;
        if (tex) constructed.core.tex = true;
        if (tracks !== undefined) {
            constructed.core.tracks = tracks === 'all' ? [-1] : tracks;
        }
        if (initialSettingsRef.current) {
            constructed.fillFromJson(initialSettingsRef.current);
        }

        // Tex content needs to sit inside the mount element as textContent
        // before construction — alphaTab reads it during startup.
        if (tex && !file) {
            mountNode.textContent = tex;
        }

        const created = new module.AlphaTabApi(mountNode, constructed);
        const s = new AlphaTabStore(created, module, colorModeRef.current, settingsPreset);
        setStore(s);
        setApi(created);

        return () => {
            s.destroy();
            setStore(null);
            setApi(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [module, mountNode, scrollNode, player, settingsPreset]);

    // Color mode sync.
    useEffect(() => {
        if (store) store.applyColorMode(colorMode);
    }, [store, colorMode]);

    // Runtime file/tex switches after mount.
    const initialFile = useRef(file);
    const initialTex = useRef(tex);
    useEffect(() => {
        if (!store) return;
        if (file !== initialFile.current) {
            initialFile.current = file;
            if (file) {
                void store.loadScoreFromUrl(file);
            }
        }
    }, [store, file]);
    useEffect(() => {
        if (!store) return;
        if (tex !== initialTex.current) {
            initialTex.current = tex;
            if (tex) {
                store.loadScoreFromTex(tex);
            }
        }
    }, [store, tex]);

    // Runtime settings patch after mount.
    const initialSettingsJson = useRef(JSON.stringify(settings ?? null));
    useEffect(() => {
        if (!store) return;
        const nextJson = JSON.stringify(settings ?? null);
        if (nextJson !== initialSettingsJson.current) {
            initialSettingsJson.current = nextJson;
            if (settings) store.updateSettings(settings);
        }
    }, [store, settings]);

    const state = useSyncExternalStore(
        store ? store.subscribe : noopSubscribe,
        store ? store.getSnapshot : noopSnapshot,
        noopSnapshot,
    );

    const contextValue = useMemo(
        () => ({ state, store, api, setMountElement, setScrollElement }),
        [state, store, api, setMountElement, setScrollElement],
    );

    return <AlphaTabContext.Provider value={contextValue}>{children}</AlphaTabContext.Provider>;
}

interface AlphaTabCanvasProps {
    className?: string;
    /** When true, wraps the score in draggable start/end selection handles. */
    withSelectionHandles?: boolean;
}

export function AlphaTabCanvas({ className, withSelectionHandles = false }: AlphaTabCanvasProps) {
    const { setMountElement, setScrollElement, api } = useAlphaTabContext();
    const [mountNode, setLocalMountNode] = useState<HTMLDivElement | null>(null);
    const combinedMountRef = useCallback((node: HTMLDivElement | null) => {
        setLocalMountNode(node);
        setMountElement(node);
    }, [setMountElement]);

    return (
        <div ref={setScrollElement} className={className}>
            <div style={{ position: 'relative' }}>
                <div ref={combinedMountRef} />
                {withSelectionHandles && (
                    <SelectionHandles api={api ?? undefined} mountElement={mountNode} />
                )}
            </div>
        </div>
    );
}

export interface AlphaTabScoreProps extends Omit<AlphaTabPlayerProps, 'children'> {
    /** Class name forwarded to the canvas wrapper. */
    className?: string;
    /** Show the draggable selection handles used for range selection. */
    withSelectionHandles?: boolean;
}

/**
 * One-shot convenience: mounts `<AlphaTabPlayer>` + `<AlphaTabCanvas>`
 * in a single JSX line. Ideal for MDX pages that only need a rendered
 * score with no chrome.
 */
export function AlphaTabScore({ className, withSelectionHandles, ...playerProps }: AlphaTabScoreProps) {
    return (
        <AlphaTabPlayer {...playerProps}>
            <AlphaTabCanvas className={className} withSelectionHandles={withSelectionHandles} />
        </AlphaTabPlayer>
    );
}

export function useAlphaTabState(): AlphaTabState {
    return useAlphaTabContext().state;
}

export function useAlphaTabControls(): AlphaTabStore | null {
    return useAlphaTabContext().store;
}

/**
 * The raw `AlphaTabApi` instance for advanced integrations: attaching
 * custom cursor/scroll handlers, invoking exporter classes, subscribing
 * to bespoke events, mutating the loaded score model.
 * Returns `null` while the API is booting.
 */
export function useAlphaTabApi(): alphaTab.AlphaTabApi | null {
    return useAlphaTabContext().api;
}

type ApiEventKeys = {
    [K in keyof alphaTab.AlphaTabApi]: alphaTab.AlphaTabApi[K] extends
        | alphaTab.IEventEmitter
        | alphaTab.IEventEmitterOfT<any>
        ? K
        : never;
}[keyof alphaTab.AlphaTabApi];

/**
 * Subscribe to an alphaTab API event for the lifetime of the component
 * (or until `deps` change). Handles the on/off symmetry so consumers
 * can pass a plain function.
 */
export function useAlphaTabEvent<E extends ApiEventKeys>(
    event: E,
    handler: Parameters<alphaTab.AlphaTabApi[E]['on']>[0],
    deps?: DependencyList,
): void {
    const api = useAlphaTabApi();
    useEffect(() => {
        if (!api) return;
        const emitter = api[event] as unknown as alphaTab.IEventEmitterOfT<unknown>;
        emitter.on(handler as never);
        return () => {
            emitter.off(handler as never);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api, event, ...(deps ?? [])]);
}
