import * as alphaTab from '@coderline/alphatab';
import { applyThemeColors, type UiTheme, useUiEnvironment } from '@coderline/alphatab-ui';
import { useCallback, useMemo, useRef } from 'react';

export interface SiteAlphaTabSettingsOptions {
    /** Enables playback with the SoundFont the reader picked in the navbar. */
    player?: boolean;
    /** The demo's own settings patch; it takes precedence over the site's theme colors. */
    settings?: alphaTab.json.SettingsJson;
}

/** The props a docs demo passes to `AlphaTabProvider`. */
export interface SiteAlphaTabSettings {
    configureSettings: (settings: alphaTab.Settings) => void;
    settings: alphaTab.json.SettingsJson;
}

type JsonObject = Record<string, unknown>;

let themePatches: Record<UiTheme, alphaTab.json.SettingsJson> | null = null;

// Every color applyThemeColors sets differently per theme, so a theme switch overwrites all of them.
function themePatch(theme: UiTheme): alphaTab.json.SettingsJson {
    if (!themePatches) {
        const resources = (t: UiTheme) => {
            const settings = new alphaTab.Settings();
            applyThemeColors(settings, t);
            return settings.display.resources as unknown as JsonObject;
        };
        const light = resources('light');
        const dark = resources('dark');
        const keys = Object.keys(light).filter(key => {
            const a = light[key];
            const b = dark[key];
            return a instanceof alphaTab.model.Color && b instanceof alphaTab.model.Color && a.rgba !== b.rgba;
        });
        const patch = (colors: JsonObject): alphaTab.json.SettingsJson => ({
            display: {
                resources: Object.fromEntries(keys.map(key => [key, (colors[key] as alphaTab.model.Color).rgba]))
            }
        });
        themePatches = { light: patch(light), dark: patch(dark) };
    }
    return themePatches[theme];
}

function isPlainObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;
}

function merge(base: JsonObject, over: JsonObject): JsonObject {
    const result: JsonObject = { ...base };
    for (const [key, value] of Object.entries(over)) {
        const current = result[key];
        result[key] = isPlainObject(current) && isPlainObject(value) ? merge(current, value) : value;
    }
    return result;
}

/**
 * The site's part of a docs demo's alphaTab settings: the fonts of the site, the notation colors of
 * the current color mode and, with `player`, the synthesizer with the reader's preferred SoundFont.
 */
export function useSiteAlphaTabSettings(options: SiteAlphaTabSettingsOptions = {}): SiteAlphaTabSettings {
    const env = useUiEnvironment();
    const latest = useRef({ env, player: options.player ?? false });
    latest.current = { env, player: options.player ?? false };

    const configureSettings = useCallback((settings: alphaTab.Settings) => {
        const { env, player } = latest.current;
        if (env.fontDirectory !== undefined) {
            settings.core.fontDirectory = env.fontDirectory;
        }
        if (player) {
            settings.player.playerMode = alphaTab.PlayerMode.EnabledAutomatic;
            const soundFont = env.soundFonts?.find(env.playbackPreferences.getSnapshot().soundFontId);
            if (soundFont) {
                settings.player.soundFont = soundFont.url;
            }
        }
        env.settingsLayer?.(settings);
    }, []);

    const settings = useMemo(
        () =>
            merge(
                themePatch(env.theme) as JsonObject,
                (options.settings ?? {}) as JsonObject
            ) as alphaTab.json.SettingsJson,
        [env.theme, options.settings]
    );

    return { configureSettings, settings };
}
