import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { useAlphaTabApi } from '@coderline/alphatab-react';
import { usePlayerControls, usePlayerSelector } from '../PlayerProvider';
import { useAlphaTabModule } from '@site/src/alphatab-react/module';
import type { PlayerViewSettings } from '../../state/store';
import { useMusicFont } from '@site/src/components/Playground/music-font';
import { usePersistedState } from '../use-persisted-state';
import type { Settings } from '@coderline/alphatab';
import type { AlphaTabModule } from '@site/src/alphatab-react/module';
import { buildQuickEntries, buildSchema, type SchemaEntry, type SchemaGroup, type SettingsEntry, type SettingValue } from './schema';

const RENDER_DEBOUNCE_MS = 120;

type Overrides = Record<string, SettingValue>;
type PersistedView = Pick<PlayerViewSettings, 'scale' | 'playbackSpeed' | 'masterVolume' | 'highlight'>;

/**
 * Where the Playground differs from the site-wide player defaults: the notation follows the
 * playback, and the engraving matches the selected music font.
 */
function applyPlaygroundBase(settings: Settings, module: AlphaTabModule, smuflMetadata: unknown): void {
    settings.player.scrollMode = module.ScrollMode.Continuous;
    // Keeps a bit of the system above the cursor in view instead of scrolling it flush to the top edge.
    settings.player.scrollOffsetY = -24;
    if (smuflMetadata) { settings.display.resources.engravingSettings.fillFromSmufl(smuflMetadata as never); }
}

export interface PlaygroundSettings {
    groups: SchemaGroup[];
    /** Layout and stave profile, for the quick section. */
    quick: SettingsEntry[];
    valueOf: (entry: SchemaEntry) => SettingValue | undefined;
    isOverridden: (entry: SchemaEntry) => boolean;
    setValue: (entry: SchemaEntry, value: SettingValue) => void;
    resetValue: (entry: SchemaEntry) => void;
    /** Clears every persisted override and the quick settings. */
    resetAll: () => void;
    overrideCount: number;
}

/**
 * Settings model of the Playground: the "Advanced" overrides are persisted per browser and
 * survive color-mode switches; stylesheet entries edit the loaded score. Mount once.
 */
export function usePlaygroundSettings(onReload: () => void): PlaygroundSettings {
    const store = usePlayerControls();
    const api = useAlphaTabApi();
    const module = useAlphaTabModule();
    const { colorMode } = useColorMode();
    const score = usePlayerSelector((s) => s.currentScore);
    const scoreRevision = usePlayerSelector((s) => s.scoreRevision);
    const view = usePlayerSelector((s) => s.view);
    const { metadata: smuflMetadata } = useMusicFont();

    const groups = useMemo(() => (module ? buildSchema(module) : []), [module]);
    const quick = useMemo(() => (module ? buildQuickEntries(module) : []), [module]);
    const entries = useMemo(
        () => new Map<string, SchemaEntry>([...quick, ...groups.flatMap((g) => g.entries)].map((e) => [e.id, e])),
        [groups, quick],
    );
    const onReloadRef = useRef(onReload);
    onReloadRef.current = onReload;

    const [overrides, setOverrides] = usePersistedState<Overrides>('alphatab.playground-settings.v1', {});
    const overridesRef = useRef(overrides);
    overridesRef.current = overrides;

    const defaults = useMemo(() => {
        const result: Overrides = {};
        if (!store || !module) { return result; }
        const settings = store.createDefaultSettings();
        applyPlaygroundBase(settings, module, smuflMetadata);
        for (const entry of entries.values()) {
            if (entry.effect !== 'stylesheet') { result[entry.id] = entry.read(settings); }
        }
        return result;
        // Theme colors are part of the defaults.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store, module, entries, colorMode, smuflMetadata]);

    // Re-applied by the store after it rebuilds base settings (theme switch, reset).
    useEffect(() => {
        if (!store || !module) { return; }
        store.setScrollDuringPlayback(false);
        return store.addSettingsLayer((settings) => {
            applyPlaygroundBase(settings, module, smuflMetadata);
            for (const [id, value] of Object.entries(overridesRef.current)) {
                const entry = entries.get(id);
                if (entry && entry.effect !== 'stylesheet') { entry.write(settings, value, module); }
            }
        });
    }, [store, module, entries, smuflMetadata]);

    const [savedView, setSavedView] = usePersistedState<PersistedView | null>('alphatab.playground-view.v1', null);
    const viewRestored = useRef(false);
    useEffect(() => {
        if (!store || viewRestored.current) { return; }
        viewRestored.current = true;
        if (!savedView) { return; }
        store.setScale(savedView.scale);
        store.setPlaybackSpeed(savedView.playbackSpeed);
        store.setMasterVolume(savedView.masterVolume);
        store.setEnableHighlight(savedView.highlight);
        // Restores once per mount; later changes flow the other way.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store]);
    useEffect(() => {
        if (!store || !viewRestored.current) { return; }
        const { scale, playbackSpeed, masterVolume, highlight } = view;
        setSavedView({ scale, playbackSpeed, masterVolume, highlight });
    }, [store, view, setSavedView]);

    const renderTimer = useRef(0);
    useEffect(() => () => window.clearTimeout(renderTimer.current), []);

    const applyEntry = useCallback(
        (entry: SchemaEntry, value: SettingValue) => {
            if (!store || !api || !module) { return; }
            if (entry.effect === 'stylesheet') {
                store.mutateScore((s) => entry.write(s, value));
                return;
            }
            entry.write(api.settings, value, module);
            switch (entry.effect) {
                case 'render':
                case 'renderMidi':
                    // Drags and color pickers fire continuously; only the settled value is worth a re-layout.
                    window.clearTimeout(renderTimer.current);
                    renderTimer.current = window.setTimeout(() => {
                        store.updateSettings();
                        if (entry.effect === 'renderMidi') { store.regenerateMidi(); }
                    }, RENDER_DEBOUNCE_MS);
                    break;
                case 'apply':
                    store.updateSettings(undefined, { render: false });
                    break;
                case 'midi':
                    store.updateSettings(undefined, { render: false });
                    store.regenerateMidi();
                    break;
                case 'player':
                    store.rebuildPlayer();
                    break;
                case 'reload':
                    onReloadRef.current();
                    break;
                case 'none':
                    break;
            }
        },
        [store, api, module],
    );

    const setValue = useCallback(
        (entry: SchemaEntry, value: SettingValue) => {
            applyEntry(entry, value);
            if (entry.effect === 'stylesheet') { return; }
            setOverrides((prev) => {
                const next = { ...prev };
                if (value === defaults[entry.id]) { delete next[entry.id]; }
                else { next[entry.id] = value; }
                return next;
            });
        },
        [applyEntry, defaults, setOverrides],
    );

    const resetValue = useCallback(
        (entry: SchemaEntry) => {
            if (entry.effect === 'stylesheet') { return; }
            const fallback = defaults[entry.id];
            if (fallback !== undefined) { setValue(entry, fallback); }
        },
        [defaults, setValue],
    );

    const resetAll = useCallback(() => {
        if (!store || !api || !module) { return; }
        const effects = new Set<string>();
        for (const id of Object.keys(overridesRef.current)) {
            const entry = entries.get(id);
            if (!entry || entry.effect === 'stylesheet' || defaults[id] === undefined) { continue; }
            entry.write(api.settings, defaults[id], module);
            effects.add(entry.effect);
        }
        overridesRef.current = {};
        setOverrides({});
        store.resetSettings();
        if (effects.has('midi') || effects.has('renderMidi')) { store.regenerateMidi(); }
        if (effects.has('player')) { store.rebuildPlayer(); }
        if (effects.has('reload')) { onReloadRef.current(); }
    }, [store, api, module, entries, defaults, setOverrides]);

    const readValue = useCallback(
        (entry: SchemaEntry): SettingValue | undefined => {
            if (entry.effect === 'stylesheet') { return score ? entry.read(score) : undefined; }
            return overrides[entry.id] ?? defaults[entry.id];
        },
        // `scoreRevision` invalidates reads from the mutable score model.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [overrides, defaults, score, scoreRevision],
    );

    const isOverridden = useCallback((entry: SchemaEntry) => entry.id in overrides, [overrides]);

    return {
        groups,
        quick,
        valueOf: readValue,
        isOverridden,
        setValue,
        resetValue,
        resetAll,
        overrideCount: Object.keys(overrides).length,
    };
}
