import type { Settings } from '@coderline/alphatab';
import type { ColorMode } from '@docusaurus/theme-common';
import type { AlphaTabModule } from './module';

export interface AlphaTabPlayerSettings {
    colorMode: ColorMode;
}

export function applyAlphaTabSettings(
    module: AlphaTabModule,
    settings: Settings,
    options: AlphaTabPlayerSettings,
): void {
    settings.core.fontDirectory = '/font/';
    settings.player.soundFont = '/soundfont/sonivox.sf3';
    settings.player.scrollMode = module.ScrollMode.Off;
    settings.player.playerMode = module.PlayerMode.Disabled;

    if (typeof window !== 'undefined') {
        const params = new URL(window.location.href).searchParams;
        settings.fillFromJson({
            core: {
                logLevel: (params.get('loglevel') ?? 'info') as keyof typeof module.LogLevel,
            },
        });
    }

    applyThemeColors(module, settings, options.colorMode);
    applyFontFamily(settings);
}

export function applyTheme(module: AlphaTabModule, settings: Settings, colorMode: ColorMode): void {
    applyThemeColors(module, settings, colorMode);
}

function applyThemeColors(module: AlphaTabModule, settings: Settings, colorMode: ColorMode): void {
    const defaults = new module.Settings().display.resources;
    const r = settings.display.resources;

    if (colorMode === 'dark') {
        r.staffLineColor = module.model.Color.fromJson('rgb(90, 90, 90)')!;
        r.barSeparatorColor = module.model.Color.fromJson('rgb(221, 221, 238)')!;
        r.barNumberColor = module.model.Color.fromJson('rgb(225, 50, 56)')!;
        r.mainGlyphColor = module.model.Color.fromJson('rgb(255,255,255)')!;
        r.secondaryGlyphColor = module.model.Color.fromJson('rgba(255,255,255,0.4)')!;
        r.scoreInfoColor = module.model.Color.fromJson('rgb(255,255,255)')!;
    } else {
        r.staffLineColor = defaults.staffLineColor;
        r.barSeparatorColor = defaults.barSeparatorColor;
        r.barNumberColor = defaults.barNumberColor;
        r.mainGlyphColor = defaults.mainGlyphColor;
        r.secondaryGlyphColor = defaults.secondaryGlyphColor;
        r.scoreInfoColor = defaults.scoreInfoColor;
    }
}

function applyFontFamily(settings: Settings): void {
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
