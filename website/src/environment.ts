import * as alphaTab from "@coderline/alphatab";
import type { ColorMode } from '@docusaurus/theme-common';

const defaultColors = (new alphaTab.Settings()).display.resources;

function setAlphaTabColors(settings: alphaTab.Settings, colorMode: ColorMode) {
    if (colorMode === 'dark') {
      settings.display.resources.staffLineColor = alphaTab.model.Color.fromJson('rgb(90, 90, 90)')!;
      settings.display.resources.barSeparatorColor = alphaTab.model.Color.fromJson('rgb(221, 221, 238)')!;
      settings.display.resources.barNumberColor = alphaTab.model.Color.fromJson('rgb(225, 50, 56)')!;
      settings.display.resources.mainGlyphColor = alphaTab.model.Color.fromJson('rgb(255,255,255)')!;
      settings.display.resources.secondaryGlyphColor = alphaTab.model.Color.fromJson('rgba(255,255,255,0.4)')!;
      settings.display.resources.scoreInfoColor = alphaTab.model.Color.fromJson('rgb(255,255,255)')!;
    } else {
      settings.display.resources.staffLineColor = defaultColors.staffLineColor;
      settings.display.resources.barSeparatorColor =defaultColors.barSeparatorColor;
      settings.display.resources.barNumberColor = defaultColors.barNumberColor;
      settings.display.resources.mainGlyphColor = defaultColors.mainGlyphColor;
      settings.display.resources.secondaryGlyphColor = defaultColors.secondaryGlyphColor;
      settings.display.resources.scoreInfoColor = defaultColors.scoreInfoColor;
    }
}

 function setAlphaTabDefaults(settings: alphaTab.Settings, colorMode: ColorMode) {
    settings.core.fontDirectory = "/font/";
    settings.player.soundFont = "/soundfont/sonivox.sf3";
    settings.player.scrollMode = alphaTab.ScrollMode.Off;
    settings.player.playerMode = alphaTab.PlayerMode.Disabled;

    if (typeof window !== 'undefined') {
      const params = new URL(window.location.href).searchParams;
      settings.fillFromJson({
        core: {
          logLevel: (params.get('loglevel') ?? 'info') as keyof typeof alphaTab.LogLevel
        }
      })
    }
      
    setAlphaTabColors(settings, colorMode);

    settings.display.resources.copyrightFont.families = ["Noto Sans"];
    settings.display.resources.titleFont.families = ["Noto Serif"];
    settings.display.resources.subTitleFont.families = ["Noto Serif"];
    settings.display.resources.wordsFont.families = ["Noto Serif"];
    settings.display.resources.effectFont.families = ["Noto Serif"];
    settings.display.resources.timerFont.families = ["Noto Serif"];
    settings.display.resources.fretboardNumberFont.families = ["Noto Sans"];
    settings.display.resources.tablatureFont.families = ["Noto Sans"];
    settings.display.resources.graceFont.families = ["Noto Sans"];
    settings.display.resources.barNumberFont.families = ["Noto Sans"];
    settings.display.resources.fingeringFont.families = ["Noto Serif"];
    settings.display.resources.inlineFingeringFont.families = ["Noto Serif"];
    settings.display.resources.markerFont.families = ["Noto Serif"];
    settings.display.resources.directionsFont.families = ["Noto Serif"];
    settings.display.resources.numberedNotationFont.families = ["Noto Sans"];
    settings.display.resources.numberedNotationGraceFont.families = ["Noto Sans"];
}

export default {
  setAlphaTabColors,
  setAlphaTabDefaults
};
