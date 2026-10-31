import type * as alphaTab from '@coderline/alphatab';
import { AlphaTabHost, AlphaTabProvider, useAlphaTabApi, useAlphaTabElements } from '@coderline/alphatab-react';
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    useSyncExternalStore
} from 'react';
import { type UiEnvironment, useUiEnvironment } from '../environment';
import type { ScoreSource } from '../state/playback/score-source';
import { applyBaseSettings, type BaseSettingsOptions, type ScoreFonts } from '../state/settings';
import { registerForSpacebar } from '../state/spacebar-playback';
import { initialPlayerStoreState, PlayerStore, type PlayerStoreState } from '../state/store';
import { SelectionHandles } from './controls/selection-handles';

// Split so that components using only the store do not re-render on every state change.
const PlayerStoreContext = createContext<PlayerStore | null | undefined>(undefined);
const PlayerStateContext = createContext<PlayerStoreState>(initialPlayerStoreState);

function usePlayerStoreContext(caller: string): PlayerStore | null {
    const store = useContext(PlayerStoreContext);
    if (store === undefined) {
        throw new Error(`${caller} must be used inside <PlayerProvider>`);
    }
    return store;
}

const noopSubscribe = () => () => {};
const noopSnapshot = () => initialPlayerStoreState;

export interface PlayerProviderProps {
    /** URL of a file in any format alphaTab imports. Changing it loads the new file. Takes precedence over `tex`. */
    file?: string;
    /** alphaTex source. Changing it loads the new source. */
    tex?: string;
    /** Tracks rendered by the initial score; `'all'` shows every track. */
    tracks?: number[] | 'all';
    /**
     * alphaTab settings merged over the base settings. Changes are applied to the living API with
     * `settings.fillFromJson`, `updateSettings()` and `render()`.
     */
    settings?: alphaTab.json.SettingsJson;
    /**
     * Enables playback, `true` by default. `false` keeps the player disabled, for pages that only
     * render, which skips the audio setup and the SoundFont download.
     */
    player?: boolean;
    /** The text fonts of the score; `noto` expects the host to load Noto Sans and Noto Serif. */
    fonts?: ScoreFonts;
    /**
     * The instance loads its own SoundFont, so the environment's SoundFont preference does not
     * apply. Implied when `settings` sets `player.soundFont` or the environment has no SoundFont provider.
     */
    ownSoundFont?: boolean;
    children: ReactNode;
}

interface LatestProps {
    env: UiEnvironment;
    settings: alphaTab.json.SettingsJson | undefined;
    player: boolean;
    fonts: ScoreFonts;
    ownSoundFont: boolean;
    file: string | undefined;
    tex: string | undefined;
    tracks: number[] | 'all' | undefined;
}

function ownsSoundFont(p: LatestProps): boolean {
    return p.ownSoundFont || !!p.settings?.player?.soundFont || !p.env.soundFonts;
}

function baseOptions(p: LatestProps): BaseSettingsOptions {
    return {
        theme: p.env.theme,
        fonts: p.fonts,
        fontDirectory: p.env.fontDirectory,
        suppliedSoundFont: !ownsSoundFont(p),
        layer: p.env.settingsLayer
    };
}

function sourceOf(file: string | undefined, tex: string | undefined): ScoreSource | null {
    return file ? { url: file } : tex ? { tex } : null;
}

function load(store: PlayerStore, source: ScoreSource, tracks: number[] | 'all' | undefined): void {
    if (source.tex !== undefined) {
        const result = store.loadTex(source.tex, { tracks });
        if (!result.rendered) {
            console.error('[alphaTab-ui] The alphaTex has errors', result.diagnostics);
        }
        return;
    }
    store.loadSource(source, { tracks }).catch((e: unknown) => {
        console.error('[alphaTab-ui] Failed to load the score', e);
    });
}

/**
 * Creates an alphaTab API and its {@link PlayerStore} for the {@link PlayerHost} below it and
 * provides both to its subtree, see {@link usePlayerState} and {@link usePlayerControls}. Settings
 * come from the {@link UiEnvironment}, the `fonts` choice and the `settings` patch; scores load
 * through the store. Changing `player`, `fonts` or `ownSoundFont` recreates the API.
 */
export function PlayerProvider({
    file,
    tex,
    tracks,
    settings,
    player = true,
    fonts = 'default',
    ownSoundFont = false,
    children
}: PlayerProviderProps) {
    const env = useUiEnvironment();
    const [store, setStore] = useState<PlayerStore | null>(null);

    // The API is created with the props of the render that precedes it.
    const latest = useRef<LatestProps>({ env, settings, player, fonts, ownSoundFont, file, tex, tracks });
    latest.current = { env, settings, player, fonts, ownSoundFont, file, tex, tracks };
    const loaded = useRef<{ file?: string; tex?: string }>({});

    const configureSettings = useCallback((s: alphaTab.Settings) => {
        applyBaseSettings(s, baseOptions(latest.current));
    }, []);

    const onApi = useCallback((api: alphaTab.AlphaTabApi) => {
        const current = latest.current;
        const playerSettings = current.settings?.player;
        const created = new PlayerStore(api, {
            base: baseOptions(current),
            playback: {
                fixedSource: !current.player || playerSettings?.playerMode !== undefined,
                ownSoundFont: ownsSoundFont(current),
                soundFonts: current.env.soundFonts,
                preferences: current.env.playbackPreferences
            }
        });
        if (playerSettings?.scrollMode !== undefined) {
            created.setScrollDuringPlayback(false);
        }
        loaded.current = { file: current.file, tex: current.tex };
        const source = sourceOf(current.file, current.tex);
        if (source) {
            load(created, source, current.tracks);
        }
        setStore(created);
        return () => {
            created.destroy();
            setStore(null);
        };
    }, []);

    useEffect(() => {
        store?.setTheme(env.theme);
    }, [store, env.theme]);

    useEffect(() => {
        store?.setBaseLayer(env.settingsLayer);
    }, [store, env.settingsLayer]);

    useEffect(() => {
        if (!store || (file === loaded.current.file && tex === loaded.current.tex)) {
            return;
        }
        loaded.current = { file, tex };
        const source = sourceOf(file, tex);
        if (source) {
            load(store, source, latest.current.tracks);
        }
    }, [store, file, tex]);

    const state = useSyncExternalStore(
        store ? store.subscribe : noopSubscribe,
        store ? store.getSnapshot : noopSnapshot,
        noopSnapshot
    );

    return (
        <AlphaTabProvider
            // These props shape the store and the playback source, which are bound to one API instance.
            key={`${player}:${fonts}:${ownSoundFont}`}
            configureSettings={configureSettings}
            settings={settings}
            onApi={onApi}>
            <PlayerStoreContext.Provider value={store}>
                <PlayerStateContext.Provider value={state}>
                    <SpacebarPlayback />
                    {children}
                </PlayerStateContext.Provider>
            </PlayerStoreContext.Provider>
        </AlphaTabProvider>
    );
}

// Spacebar toggles the most visible player, so pages with many players need no focus target per player.
function SpacebarPlayback() {
    const api = useAlphaTabApi();
    const { scrollElement } = useAlphaTabElements();
    useEffect(() => {
        if (!api || !scrollElement) {
            return;
        }
        return registerForSpacebar(scrollElement, api);
    }, [api, scrollElement]);
    return null;
}

function SelectionHandlesOverlay() {
    const api = useAlphaTabApi();
    const { mountElement } = useAlphaTabElements();
    return <SelectionHandles api={api ?? undefined} mountElement={mountElement} />;
}

export interface PlayerHostProps {
    className?: string;
    /** Draggable start and end handles on the selected playback range. */
    withSelectionHandles?: boolean;
    /** Content positioned in score coordinates, scrolling with the score, e.g. markers drawn from the bounds lookup. */
    overlay?: ReactNode;
}

/** The element the score of the surrounding {@link PlayerProvider} renders into. */
export function PlayerHost({ className, withSelectionHandles = false, overlay }: PlayerHostProps) {
    return (
        <AlphaTabHost
            className={className}
            overlay={
                withSelectionHandles || overlay ? (
                    <>
                        {overlay}
                        {withSelectionHandles && <SelectionHandlesOverlay />}
                    </>
                ) : undefined
            }
        />
    );
}

export interface PlayerScoreProps extends Omit<PlayerProviderProps, 'children'> {
    /** Class of the host element. */
    className?: string;
    withSelectionHandles?: boolean;
}

/** A {@link PlayerProvider} with its {@link PlayerHost} and no controls. */
export function PlayerScore({ className, withSelectionHandles, ...playerProps }: PlayerScoreProps) {
    return (
        <PlayerProvider {...playerProps}>
            <PlayerHost className={className} withSelectionHandles={withSelectionHandles} />
        </PlayerProvider>
    );
}

/** The full player state; the component re-renders on every change, including playback position updates. */
export function usePlayerState(): PlayerStoreState {
    usePlayerStoreContext('usePlayerState');
    return useContext(PlayerStateContext);
}

/**
 * A slice of the player state; the component re-renders only when the selected value changes
 * (compared with `Object.is`). The selector must return stable references, e.g. `(s) => s.view`.
 */
export function usePlayerSelector<T>(selector: (state: PlayerStoreState) => T): T {
    const store = usePlayerStoreContext('usePlayerSelector');
    const selectorRef = useRef(selector);
    selectorRef.current = selector;
    const getSnapshot = useCallback(
        () => selectorRef.current(store ? store.getSnapshot() : initialPlayerStoreState),
        [store]
    );
    return useSyncExternalStore(store ? store.subscribe : noopSubscribe, getSnapshot, getSnapshot);
}

/** The store of the surrounding {@link PlayerProvider}; `null` until its API exists. */
export function usePlayerControls(): PlayerStore | null {
    return usePlayerStoreContext('usePlayerControls');
}
