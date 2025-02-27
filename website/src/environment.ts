import type * as alphaTab from "@coderline/alphatab";

export default {
  setAlphaTabDefaults(settings: alphaTab.Settings) {
    settings.core.fontDirectory = "/font/";
    settings.player.soundFont = "/soundfont/sonivox.sf3";

    settings.display.resources.copyrightFont.families = ["Roboto"];
    settings.display.resources.titleFont.families = ["PT Serif"];
    settings.display.resources.subTitleFont.families = ["PT Serif"];
    settings.display.resources.wordsFont.families = ["PT Serif"];
    settings.display.resources.effectFont.families = ["PT Serif"];
    settings.display.resources.timerFont.families = ["PT Serif"];
    settings.display.resources.fretboardNumberFont.families = ["Roboto"];
    settings.display.resources.tablatureFont.families = ["Roboto"];
    settings.display.resources.graceFont.families = ["Roboto"];
    settings.display.resources.barNumberFont.families = ["Roboto"];
    settings.display.resources.fingeringFont.families = ["PT Serif"];
    settings.display.resources.inlineFingeringFont.families = ["PT Serif"];
    settings.display.resources.markerFont.families = ["PT Serif"];
    settings.display.resources.directionsFont.families = ["PT Serif"];
    settings.display.resources.numberedNotationFont.families = ["Roboto"];
    settings.display.resources.numberedNotationGraceFont.families = ["Roboto"];
  },
};
