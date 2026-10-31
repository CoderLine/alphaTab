import * as alphaTab from '@coderline/alphatab';
import type { Settings } from '@coderline/alphatab';

export type UiTheme = 'light' | 'dark';

/** The text fonts of the rendered score: alphaTab's own, or Noto Sans and Noto Serif. */
export type ScoreFonts = 'default' | 'noto';

/** What the settings every player starts from depend on. */
export interface BaseSettingsOptions {
    theme: UiTheme;
    fonts: ScoreFonts;
    /** `core.fontDirectory`; `undefined` keeps alphaTab's own lookup. */
    fontDirectory?: string;
    /** The playback controller supplies the SoundFont, so `player.soundFont` stays unset. */
    suppliedSoundFont: boolean;
    /** Host settings applied last, e.g. a music font or URL-driven debug options. */
    layer?: (settings: Settings) => void;
}

/**
 * Writes the settings every player starts from into `settings`: the theme colors and fonts, a
 * disabled player (the playback controller enables it), page layout without scrolling, and the
 * cursor and element highlighting.
 */
export function applyBaseSettings(settings: Settings, options: BaseSettingsOptions): void {
    if (options.fontDirectory !== undefined) {
        settings.core.fontDirectory = options.fontDirectory;
    }
    if (options.suppliedSoundFont) {
        settings.player.soundFont = null;
    }
    settings.player.playerMode = alphaTab.PlayerMode.Disabled;
    settings.player.scrollMode = alphaTab.ScrollMode.Off;
    settings.player.enableCursor = true;
    settings.player.enableElementHighlighting = true;
    settings.display.layoutMode = alphaTab.LayoutMode.Page;
    applyThemeColors(settings, options.theme);
    if (options.fonts === 'noto') {
        applyNotoFonts(settings);
    }
    options.layer?.(settings);
}

/** Sets the notation colors for `theme`; `light` restores alphaTab's defaults. */
export function applyThemeColors(settings: Settings, theme: UiTheme): void {
    const defaults = new alphaTab.Settings().display.resources;
    const r = settings.display.resources;
    const color = (value: string) => alphaTab.model.Color.fromJson(value)!;

    if (theme === 'dark') {
        r.staffLineColor = color('rgb(90, 90, 90)');
        r.barSeparatorColor = color('rgb(221, 221, 238)');
        r.barNumberColor = color('rgb(225, 50, 56)');
        r.mainGlyphColor = color('rgb(255,255,255)');
        r.secondaryGlyphColor = color('rgba(255,255,255,0.4)');
        r.scoreInfoColor = color('rgb(255,255,255)');
    } else {
        r.staffLineColor = defaults.staffLineColor;
        r.barSeparatorColor = defaults.barSeparatorColor;
        r.barNumberColor = defaults.barNumberColor;
        r.mainGlyphColor = defaults.mainGlyphColor;
        r.secondaryGlyphColor = defaults.secondaryGlyphColor;
        r.scoreInfoColor = defaults.scoreInfoColor;
    }
}

/** Sets the text fonts of the score to Noto Sans and Noto Serif, which the host must load. */
export function applyNotoFonts(settings: Settings): void {
    const r = settings.display.resources;
    r.copyrightFont.families = ['Noto Sans'];
    r.titleFont.families = ['Noto Serif'];
    r.subTitleFont.families = ['Noto Serif'];
    r.wordsFont.families = ['Noto Serif'];
    r.effectFont.families = ['Noto Serif'];
    r.timerFont.families = ['Noto Serif'];
    r.fretboardNumberFont.families = ['Noto Sans'];
    r.tablatureFont.families = ['Noto Sans'];
    r.graceFont.families = ['Noto Sans'];
    r.barNumberFont.families = ['Noto Sans'];
    r.fingeringFont.families = ['Noto Serif'];
    r.inlineFingeringFont.families = ['Noto Serif'];
    r.markerFont.families = ['Noto Serif'];
    r.directionsFont.families = ['Noto Serif'];
    r.numberedNotationFont.families = ['Noto Sans'];
    r.numberedNotationGraceFont.families = ['Noto Sans'];
}
