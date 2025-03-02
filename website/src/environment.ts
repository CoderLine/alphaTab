import type * as alphaTab from "@coderline/alphatab";

export default {
  setAlphaTabDefaults(settings: alphaTab.Settings) {
    settings.core.fontDirectory = "/font/";
    settings.player.soundFont = "/soundfont/sonivox.sf3";

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
  },
};
