import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from 'react';
import * as alphaTab from '@coderline/alphatab';
import {
    AlphaTabHost,
    AlphaTabProvider,
    useAlphaTabApi,
    useAlphaTabElements,
} from '@coderline/alphatab-react';
import { useColorMode } from '@docusaurus/theme-common';
import { applyAlphaTabSettings, applyPlayerDefaults, type AlphaTabPreset } from '../state/settings';
import { PlayerStore, initialPlayerStoreState, type PlayerStoreState } from '../state/store';
import { SelectionHandles } from './controls/selection-handles';
import { registerForSpacebar } from '../state/spacebar-playback';

// Split so that components using only the store do not re-render on every state change.
const AlphaTabStoreContext = createContext<PlayerStore | null | undefined>(undefined);
const AlphaTabStateContext = createContext<PlayerStoreState>(initialPlayerStoreState);

function useAlphaTabStoreContext(): PlayerStore | null {
    const store = useContext(AlphaTabStoreContext);
    if (store === undefined) {
        throw new Error('useAlphaTab* hooks must be used inside <PlayerProvider>');
    }
    return store;
}

const noopSubscribe = () => () => {};
const noopSnapshot = () => initialPlayerStoreState;

export interface PlayerProviderProps {
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
    /**
     * The page loads SoundFonts itself (e.g. SoundFont API demos), so the
     * site-wide SoundFont preference is not applied. Implied when `settings`
     * sets `player.soundFont`.
     */
    ownSoundFont?: boolean;
    children: ReactNode;
}

export function PlayerProvider({
    file,
    tex,
    tracks,
    settings,
    player = true,
    settingsPreset = 'docs',
    ownSoundFont = false,
    children,
}: PlayerProviderProps) {
    const [store, setStore] = useState<PlayerStore | null>(null);
    const { colorMode } = useColorMode();

    // The provider calls these once per API instance with the props of the preceding render.
    const latest = useRef({ colorMode, settings, player, settingsPreset, ownSoundFont });
    latest.current = { colorMode, settings, player, settingsPreset, ownSoundFont };

    const configureSettings = useCallback((s: alphaTab.Settings) => {
        applyAlphaTabSettings(alphaTab, s, {
            colorMode: latest.current.colorMode,
            preset: latest.current.settingsPreset,
        });
        applyPlayerDefaults(alphaTab, s);
    }, []);

    const onApi = useCallback((api: alphaTab.AlphaTabApi) => {
        const current = latest.current;
        const playerSettings = current.settings?.player;
        const created = new PlayerStore(api, alphaTab, current.colorMode, current.settingsPreset, {
            fixedSource: !current.player || playerSettings?.playerMode !== undefined,
            ownSoundFont: current.ownSoundFont || !!playerSettings?.soundFont,
        });
        if (playerSettings?.scrollMode !== undefined) { created.setScrollDuringPlayback(false); }
        setStore(created);
        return () => {
            created.destroy();
            setStore(null);
        };
    }, []);

    useEffect(() => {
        if (store) { store.applyColorMode(colorMode); }
    }, [store, colorMode]);

    // Runtime file/tex switches after mount.
    const initialFile = useRef(file);
    const initialTex = useRef(tex);
    useEffect(() => {
        if (!store) { return; }
        if (file !== initialFile.current) {
            initialFile.current = file;
            if (file) {
                void store.loadScoreFromUrl(file);
            }
        }
    }, [store, file]);
    useEffect(() => {
        if (!store) { return; }
        if (tex !== initialTex.current) {
            initialTex.current = tex;
            if (tex) {
                store.loadScoreFromTex(tex);
            }
        }
    }, [store, tex]);

    const state = useSyncExternalStore(
        store ? store.subscribe : noopSubscribe,
        store ? store.getSnapshot : noopSnapshot,
        noopSnapshot,
    );

    return (
        <AlphaTabProvider
            // These props shape the store and the playback source, which are bound to one API instance.
            key={`${player}:${settingsPreset}:${ownSoundFont}`}
            configureSettings={configureSettings}
            settings={settings}
            file={file}
            tex={file || !tex ? undefined : tex}
            tracks={tracks}
            onApi={onApi}
        >
            <AlphaTabStoreContext.Provider value={store}>
                <AlphaTabStateContext.Provider value={state}>
                    <SpacebarPlayback />
                    {children}
                </AlphaTabStateContext.Provider>
            </AlphaTabStoreContext.Provider>
        </AlphaTabProvider>
    );
}

// Temporary: register with the global spacebar-playPause coordinator so
// authors can audibly step through demos without one focus target per
// player. Uses the scroll element as the "container" for visibility scoring.
function SpacebarPlayback() {
    const api = useAlphaTabApi();
    const { scrollElement } = useAlphaTabElements();
    useEffect(() => {
        if (!api || !scrollElement) { return; }
        return registerForSpacebar(scrollElement, api);
    }, [api, scrollElement]);
    return null;
}

function SelectionHandlesOverlay() {
    const api = useAlphaTabApi();
    const { mountElement } = useAlphaTabElements();
    return <SelectionHandles api={api ?? undefined} mountElement={mountElement} />;
}

interface PlayerHostProps {
    className?: string;
    /** When true, wraps the score in draggable start/end selection handles. */
    withSelectionHandles?: boolean;
}

export function PlayerHost({ className, withSelectionHandles = false }: PlayerHostProps) {
    return (
        <AlphaTabHost
            className={className}
            overlay={withSelectionHandles ? <SelectionHandlesOverlay /> : undefined}
        />
    );
}

export interface PlayerScoreProps extends Omit<PlayerProviderProps, 'children'> {
    /** Class name forwarded to the canvas wrapper. */
    className?: string;
    /** Show the draggable selection handles used for range selection. */
    withSelectionHandles?: boolean;
}

/**
 * One-shot convenience: mounts `<PlayerProvider>` + `<PlayerHost>`
 * in a single JSX line. Ideal for MDX pages that only need a rendered
 * score with no chrome.
 */
export function PlayerScore({ className, withSelectionHandles, ...playerProps }: PlayerScoreProps) {
    return (
        <PlayerProvider {...playerProps}>
            <PlayerHost className={className} withSelectionHandles={withSelectionHandles} />
        </PlayerProvider>
    );
}

/** The full player state; the component re-renders on every change, including playback position updates. */
export function usePlayerState(): PlayerStoreState {
    useAlphaTabStoreContext();
    return useContext(AlphaTabStateContext);
}

/**
 * A slice of the player state; the component re-renders only when the selected value changes
 * (compared with `Object.is`). The selector must return stable references, e.g. `(s) => s.view`.
 */
export function usePlayerSelector<T>(selector: (state: PlayerStoreState) => T): T {
    const store = useAlphaTabStoreContext();
    const selectorRef = useRef(selector);
    selectorRef.current = selector;
    const getSnapshot = useCallback(
        () => selectorRef.current(store ? store.getSnapshot() : initialPlayerStoreState),
        [store],
    );
    return useSyncExternalStore(store ? store.subscribe : noopSubscribe, getSnapshot, getSnapshot);
}

export function usePlayerControls(): PlayerStore | null {
    return useAlphaTabStoreContext();
}
