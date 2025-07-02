import * as alphaTab from '../src/alphaTab.main';
import Handlebars from 'handlebars';
import * as bootstrap from 'bootstrap';

const toDomElement = (() => {
    const parser = document.createElement('div');
    return (html: string) => {
        parser.innerHTML = html;
        return parser.firstElementChild as HTMLElement;
    };
})();

const params = new URL(window.location.href).searchParams;

const defaultSettings = {
    core: {
        logLevel: (params.get('loglevel') ?? 'info') as alphaTab.json.CoreSettingsJson['logLevel'],
        file: '/test-data/musicxml-testsuite/46a-Barlines.xml',
        fontDirectory: '/font/bravura/'
    },
    player: {
        playerMode: alphaTab.PlayerMode.EnabledAutomatic,
        scrollOffsetX: -10,
        soundFont: '/font/sonivox/sonivox.sf2'
    }
} satisfies alphaTab.json.SettingsJson;

function applyFonts(settings: alphaTab.Settings) {
    settings.display.resources.copyrightFont.families = ['Noto Sans'];
    settings.display.resources.titleFont.families = ['Noto Serif'];
    settings.display.resources.subTitleFont.families = ['Noto Serif'];
    settings.display.resources.wordsFont.families = ['Noto Serif'];
    settings.display.resources.effectFont.families = ['Noto Serif'];
    settings.display.resources.timerFont.families = ['Noto Serif'];
    settings.display.resources.fretboardNumberFont.families = ['Noto Sans'];
    settings.display.resources.tablatureFont.families = ['Noto Sans'];
    settings.display.resources.graceFont.families = ['Noto Sans'];
    settings.display.resources.barNumberFont.families = ['Noto Sans'];
    settings.display.resources.fingeringFont.families = ['Noto Serif'];
    settings.display.resources.inlineFingeringFont.families = ['Noto Serif'];
    settings.display.resources.markerFont.families = ['Noto Serif'];
    settings.display.resources.directionsFont.families = ['Noto Serif'];
    settings.display.resources.numberedNotationFont.families = ['Noto Sans'];
    settings.display.resources.numberedNotationGraceFont.families = ['Noto Sans'];

    return;
    settings.core.smuflFontSources = new Map();
    settings.core.smuflFontSources.set(
        alphaTab.FontFileFormat.Woff2, '/font/finale-jazz/FinaleJazz.otf'
    )
    settings.display.resources.smuflMetrics.initialize({
 "engravingDefaults": {
  "arrowShaftThickness": 0.15, 
  "barlineSeparation": 0.5, 
  "beamSpacing": 0.25, 
  "beamThickness": 0.5, 
  "bracketThickness": 0.5, 
  "dashedBarlineDashLength": 0.42, 
  "dashedBarlineGapLength": 0.3, 
  "dashedBarlineThickness": 0.15, 
  "hairpinThickness": 0.15, 
  "legerLineExtension": 0.25, 
  "legerLineThickness": 0.19, 
  "lyricLineThickness": 0.15, 
  "octaveLineThickness": 0.15, 
  "pedalLineThickness": 0.15, 
  "repeatBarlineDotSeparation": 0.2, 
  "repeatEndingLineThickness": 0.15, 
  "slurEndpointThickness": 0.07, 
  "slurMidpointThickness": 0.33, 
  "staffLineThickness": 0.15, 
  "stemThickness": 0.15, 
  "subBracketThickness": 0.15, 
  "textEnclosureThickness": 0.15, 
  "thickBarlineThickness": 0.5, 
  "thinBarlineThickness": 0.15, 
  "thinThickBarlineSeparation": 0.5, 
  "tieEndpointThickness": 0.07, 
  "tieMidpointThickness": 0.33, 
  "tupletBracketThickness": 0.15
 }, 
 "fontName": "Finale Jazz", 
 "fontVersion": 1.9, 
 "glyphBBoxes": {
  "6stringTabClef": {
   "bBoxNE": [
    1.488, 
    3.372
   ], 
   "bBoxSW": [
    0.14, 
    -3.352
   ]
  }, 
  "U+F404": {
   "bBoxNE": [
    2.356, 
    3.168
   ], 
   "bBoxSW": [
    0.0, 
    -0.456
   ]
  }, 
  "U+F405": {
   "bBoxNE": [
    2.888, 
    2.792
   ], 
   "bBoxSW": [
    0.0, 
    -0.744
   ]
  }, 
  "U+F612": {
   "bBoxNE": [
    1.52, 
    0.772
   ], 
   "bBoxSW": [
    0.0, 
    -0.804
   ]
  }, 
  "U+F614": {
   "bBoxNE": [
    0.908, 
    0.496
   ], 
   "bBoxSW": [
    0.0, 
    -0.524
   ]
  }, 
  "U+F615": {
   "bBoxNE": [
    0.968, 
    0.484
   ], 
   "bBoxSW": [
    0.0, 
    -0.5
   ]
  }, 
  "U+F67C": {
   "bBoxNE": [
    3.436, 
    2.284
   ], 
   "bBoxSW": [
    0.0, 
    -0.08
   ]
  }, 
  "U+F700": {
   "bBoxNE": [
    0.588, 
    2.396
   ], 
   "bBoxSW": [
    0.0, 
    0.024
   ]
  }, 
  "U+F701": {
   "bBoxNE": [
    1.144, 
    0.024
   ], 
   "bBoxSW": [
    0.0, 
    -2.872
   ]
  }, 
  "U+F704": {
   "bBoxNE": [
    1.472, 
    2.504
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F706": {
   "bBoxNE": [
    0.672, 
    1.832
   ], 
   "bBoxSW": [
    0.0, 
    -0.408
   ]
  }, 
  "U+F707": {
   "bBoxNE": [
    0.74, 
    0.492
   ], 
   "bBoxSW": [
    0.0, 
    -1.648
   ]
  }, 
  "U+F710": {
   "bBoxNE": [
    0.688, 
    0.456
   ], 
   "bBoxSW": [
    0.0, 
    -0.412
   ]
  }, 
  "U+F714": {
   "bBoxNE": [
    0.932, 
    1.084
   ], 
   "bBoxSW": [
    0.0, 
    -0.6
   ]
  }, 
  "U+F715": {
   "bBoxNE": [
    1.772, 
    1.416
   ], 
   "bBoxSW": [
    0.0, 
    -1.316
   ]
  }, 
  "U+F716": {
   "bBoxNE": [
    1.66, 
    1.668
   ], 
   "bBoxSW": [
    0.0, 
    -1.528
   ]
  }, 
  "U+F717": {
   "bBoxNE": [
    1.384, 
    1.584
   ], 
   "bBoxSW": [
    0.0, 
    -1.684
   ]
  }, 
  "U+F718": {
   "bBoxNE": [
    1.616, 
    1.632
   ], 
   "bBoxSW": [
    0.0, 
    -1.052
   ]
  }, 
  "U+F719": {
   "bBoxNE": [
    2.096, 
    1.632
   ], 
   "bBoxSW": [
    0.0, 
    -0.988
   ]
  }, 
  "U+F720": {
   "bBoxNE": [
    3.84, 
    4.284
   ], 
   "bBoxSW": [
    0.044, 
    -1.088
   ]
  }, 
  "U+F721": {
   "bBoxNE": [
    2.728, 
    4.284
   ], 
   "bBoxSW": [
    -0.044, 
    -1.088
   ]
  }, 
  "U+F722": {
   "bBoxNE": [
    1.04, 
    4.284
   ], 
   "bBoxSW": [
    -1.716, 
    -1.088
   ]
  }, 
  "U+F723": {
   "bBoxNE": [
    4.44, 
    4.284
   ], 
   "bBoxSW": [
    0.044, 
    -0.936
   ]
  }, 
  "U+F724": {
   "bBoxNE": [
    2.068, 
    4.284
   ], 
   "bBoxSW": [
    -0.048, 
    3.508
   ]
  }, 
  "U+F725": {
   "bBoxNE": [
    1.404, 
    4.284
   ], 
   "bBoxSW": [
    -1.16, 
    -0.936
   ]
  }, 
  "U+F726": {
   "bBoxNE": [
    2.732, 
    4.284
   ], 
   "bBoxSW": [
    -0.048, 
    3.508
   ]
  }, 
  "U+F727": {
   "bBoxNE": [
    1.928, 
    4.284
   ], 
   "bBoxSW": [
    -0.048, 
    -1.328
   ]
  }, 
  "U+F728": {
   "bBoxNE": [
    2.612, 
    4.284
   ], 
   "bBoxSW": [
    0.044, 
    -1.088
   ]
  }, 
  "U+F729": {
   "bBoxNE": [
    7.288, 
    4.284
   ], 
   "bBoxSW": [
    0.012, 
    -1.088
   ]
  }, 
  "U+F72A": {
   "bBoxNE": [
    5.94, 
    4.284
   ], 
   "bBoxSW": [
    -0.044, 
    -1.088
   ]
  }, 
  "U+F72B": {
   "bBoxNE": [
    1.044, 
    4.284
   ], 
   "bBoxSW": [
    -4.596, 
    -1.088
   ]
  }, 
  "U+F72C": {
   "bBoxNE": [
    7.224, 
    4.284
   ], 
   "bBoxSW": [
    0.044, 
    -0.932
   ]
  }, 
  "U+F72D": {
   "bBoxNE": [
    7.072, 
    4.284
   ], 
   "bBoxSW": [
    -0.044, 
    3.508
   ]
  }, 
  "U+F72E": {
   "bBoxNE": [
    1.312, 
    4.284
   ], 
   "bBoxSW": [
    -4.4, 
    -0.932
   ]
  }, 
  "U+F72F": {
   "bBoxNE": [
    4.44, 
    3.764
   ], 
   "bBoxSW": [
    0.016, 
    -1.108
   ]
  }, 
  "U+F730": {
   "bBoxNE": [
    1.928, 
    -0.332
   ], 
   "bBoxSW": [
    -0.044, 
    -1.108
   ]
  }, 
  "U+F731": {
   "bBoxNE": [
    1.48, 
    3.764
   ], 
   "bBoxSW": [
    -0.6, 
    -1.108
   ]
  }, 
  "U+F732": {
   "bBoxNE": [
    7.256, 
    3.764
   ], 
   "bBoxSW": [
    0.028, 
    -1.108
   ]
  }, 
  "U+F733": {
   "bBoxNE": [
    7.072, 
    -0.332
   ], 
   "bBoxSW": [
    -0.044, 
    -1.108
   ]
  }, 
  "U+F734": {
   "bBoxNE": [
    1.548, 
    3.764
   ], 
   "bBoxSW": [
    -3.796, 
    -1.108
   ]
  }, 
  "U+F735": {
   "bBoxNE": [
    3.676, 
    3.952
   ], 
   "bBoxSW": [
    0.08, 
    -1.108
   ]
  }, 
  "U+F736": {
   "bBoxNE": [
    3.644, 
    -0.332
   ], 
   "bBoxSW": [
    -0.044, 
    -1.108
   ]
  }, 
  "U+F737": {
   "bBoxNE": [
    0.896, 
    1.536
   ], 
   "bBoxSW": [
    -2.36, 
    -1.108
   ]
  }, 
  "U+F738": {
   "bBoxNE": [
    6.52, 
    3.952
   ], 
   "bBoxSW": [
    0.08, 
    -1.108
   ]
  }, 
  "U+F739": {
   "bBoxNE": [
    7.072, 
    -0.332
   ], 
   "bBoxSW": [
    -0.044, 
    -1.108
   ]
  }, 
  "U+F73A": {
   "bBoxNE": [
    0.896, 
    1.536
   ], 
   "bBoxSW": [
    -4.412, 
    -1.108
   ]
  }, 
  "U+F73B": {
   "bBoxNE": [
    4.016, 
    4.284
   ], 
   "bBoxSW": [
    0.004, 
    -1.088
   ]
  }, 
  "U+F73C": {
   "bBoxNE": [
    2.728, 
    4.284
   ], 
   "bBoxSW": [
    -0.044, 
    -1.088
   ]
  }, 
  "U+F73D": {
   "bBoxNE": [
    1.804, 
    4.284
   ], 
   "bBoxSW": [
    -1.24, 
    -1.088
   ]
  }, 
  "U+F73E": {
   "bBoxNE": [
    7.68, 
    4.284
   ], 
   "bBoxSW": [
    0.004, 
    -1.088
   ]
  }, 
  "U+F740": {
   "bBoxNE": [
    1.804, 
    4.284
   ], 
   "bBoxSW": [
    -4.608, 
    -1.088
   ]
  }, 
  "U+F741": {
   "bBoxNE": [
    3.736, 
    4.284
   ], 
   "bBoxSW": [
    0.064, 
    -0.932
   ]
  }, 
  "U+F742": {
   "bBoxNE": [
    2.068, 
    4.284
   ], 
   "bBoxSW": [
    -0.044, 
    3.508
   ]
  }, 
  "U+F743": {
   "bBoxNE": [
    0.992, 
    4.284
   ], 
   "bBoxSW": [
    -1.16, 
    1.484
   ]
  }, 
  "U+F744": {
   "bBoxNE": [
    6.52, 
    4.284
   ], 
   "bBoxSW": [
    0.064, 
    -0.932
   ]
  }, 
  "U+F745": {
   "bBoxNE": [
    7.072, 
    4.284
   ], 
   "bBoxSW": [
    -0.044, 
    3.508
   ]
  }, 
  "U+F746": {
   "bBoxNE": [
    0.992, 
    4.284
   ], 
   "bBoxSW": [
    -4.412, 
    1.484
   ]
  }, 
  "U+F747": {
   "bBoxNE": [
    6.52, 
    3.952
   ], 
   "bBoxSW": [
    0.08, 
    -1.108
   ]
  }, 
  "U+F748": {
   "bBoxNE": [
    7.072, 
    -0.332
   ], 
   "bBoxSW": [
    -0.044, 
    -1.108
   ]
  }, 
  "U+F749": {
   "bBoxNE": [
    0.896, 
    1.536
   ], 
   "bBoxSW": [
    -4.412, 
    -1.108
   ]
  }, 
  "U+F74A": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F750": {
   "bBoxNE": [
    6.792, 
    1.708
   ], 
   "bBoxSW": [
    0.0, 
    0.18
   ]
  }, 
  "U+F751": {
   "bBoxNE": [
    6.796, 
    1.7
   ], 
   "bBoxSW": [
    0.0, 
    0.172
   ]
  }, 
  "U+F752": {
   "bBoxNE": [
    13.584, 
    1.704
   ], 
   "bBoxSW": [
    0.0, 
    0.172
   ]
  }, 
  "U+F753": {
   "bBoxNE": [
    13.584, 
    1.7
   ], 
   "bBoxSW": [
    0.0, 
    0.172
   ]
  }, 
  "U+F756": {
   "bBoxNE": [
    4.692, 
    0.812
   ], 
   "bBoxSW": [
    -0.076, 
    -0.004
   ]
  }, 
  "U+F757": {
   "bBoxNE": [
    6.364, 
    3.872
   ], 
   "bBoxSW": [
    -0.008, 
    -0.004
   ]
  }, 
  "U+F758": {
   "bBoxNE": [
    6.436, 
    3.768
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F759": {
   "bBoxNE": [
    2.744, 
    0.964
   ], 
   "bBoxSW": [
    0.0, 
    -0.004
   ]
  }, 
  "U+F75A": {
   "bBoxNE": [
    2.744, 
    0.968
   ], 
   "bBoxSW": [
    0.0, 
    -0.004
   ]
  }, 
  "U+F75B": {
   "bBoxNE": [
    2.436, 
    1.584
   ], 
   "bBoxSW": [
    -0.004, 
    -0.004
   ]
  }, 
  "U+F75C": {
   "bBoxNE": [
    2.444, 
    1.588
   ], 
   "bBoxSW": [
    0.004, 
    -0.004
   ]
  }, 
  "U+F75F": {
   "bBoxNE": [
    1.524, 
    2.544
   ], 
   "bBoxSW": [
    0.004, 
    -0.004
   ]
  }, 
  "U+F760": {
   "bBoxNE": [
    1.524, 
    2.544
   ], 
   "bBoxSW": [
    0.004, 
    -0.004
   ]
  }, 
  "U+F761": {
   "bBoxNE": [
    3.964, 
    1.168
   ], 
   "bBoxSW": [
    0.0, 
    -0.004
   ]
  }, 
  "U+F762": {
   "bBoxNE": [
    3.96, 
    1.168
   ], 
   "bBoxSW": [
    0.0, 
    -0.004
   ]
  }, 
  "U+F763": {
   "bBoxNE": [
    3.572, 
    2.1
   ], 
   "bBoxSW": [
    0.0, 
    -0.004
   ]
  }, 
  "U+F764": {
   "bBoxNE": [
    3.568, 
    2.092
   ], 
   "bBoxSW": [
    0.0, 
    -0.008
   ]
  }, 
  "U+F765": {
   "bBoxNE": [
    4.16, 
    1.62
   ], 
   "bBoxSW": [
    0.0, 
    -0.004
   ]
  }, 
  "U+F766": {
   "bBoxNE": [
    4.768, 
    2.084
   ], 
   "bBoxSW": [
    0.0, 
    -2.156
   ]
  }, 
  "U+F767": {
   "bBoxNE": [
    2.292, 
    0.6
   ], 
   "bBoxSW": [
    0.0, 
    -0.26
   ]
  }, 
  "U+F768": {
   "bBoxNE": [
    2.244, 
    0.308
   ], 
   "bBoxSW": [
    0.0, 
    -0.548
   ]
  }, 
  "U+F769": {
   "bBoxNE": [
    1.476, 
    2.796
   ], 
   "bBoxSW": [
    0.0, 
    -0.772
   ]
  }, 
  "U+F79E": {
   "bBoxNE": [
    4.844, 
    1.784
   ], 
   "bBoxSW": [
    0.0, 
    -0.64
   ]
  }, 
  "U+F7AC": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.74
   ]
  }, 
  "U+F7C4": {
   "bBoxNE": [
    4.396, 
    1.46
   ], 
   "bBoxSW": [
    0.0, 
    -0.532
   ]
  }, 
  "U+F7C5": {
   "bBoxNE": [
    4.396, 
    1.476
   ], 
   "bBoxSW": [
    0.0, 
    -0.516
   ]
  }, 
  "U+F7C6": {
   "bBoxNE": [
    4.396, 
    1.476
   ], 
   "bBoxSW": [
    0.0, 
    -0.516
   ]
  }, 
  "U+F7C7": {
   "bBoxNE": [
    4.396, 
    1.476
   ], 
   "bBoxSW": [
    0.0, 
    -0.516
   ]
  }, 
  "U+F7C8": {
   "bBoxNE": [
    3.748, 
    2.016
   ], 
   "bBoxSW": [
    0.0, 
    -0.052
   ]
  }, 
  "U+F800": {
   "bBoxNE": [
    1.292, 
    1.504
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F801": {
   "bBoxNE": [
    1.244, 
    0.616
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F802": {
   "bBoxNE": [
    0.556, 
    2.256
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F803": {
   "bBoxNE": [
    0.76, 
    3.18
   ], 
   "bBoxSW": [
    0.096, 
    -0.044
   ]
  }, 
  "U+F804": {
   "bBoxNE": [
    1.504, 
    4.812
   ], 
   "bBoxSW": [
    0.048, 
    -1.656
   ]
  }, 
  "U+F805": {
   "bBoxNE": [
    0.796, 
    5.008
   ], 
   "bBoxSW": [
    -0.256, 
    -1.324
   ]
  }, 
  "U+F806": {
   "bBoxNE": [
    0.844, 
    4.168
   ], 
   "bBoxSW": [
    0.0, 
    -0.916
   ]
  }, 
  "U+F807": {
   "bBoxNE": [
    0.656, 
    4.288
   ], 
   "bBoxSW": [
    -0.056, 
    -0.796
   ]
  }, 
  "U+F808": {
   "bBoxNE": [
    0.72, 
    2.452
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F809": {
   "bBoxNE": [
    0.816, 
    2.78
   ], 
   "bBoxSW": [
    0.0, 
    -0.008
   ]
  }, 
  "U+F80A": {
   "bBoxNE": [
    1.032, 
    2.832
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F80B": {
   "bBoxNE": [
    0.752, 
    4.344
   ], 
   "bBoxSW": [
    -0.004, 
    -0.744
   ]
  }, 
  "U+F80C": {
   "bBoxNE": [
    0.76, 
    4.552
   ], 
   "bBoxSW": [
    -0.112, 
    -0.444
   ]
  }, 
  "U+F80D": {
   "bBoxNE": [
    0.752, 
    5.196
   ], 
   "bBoxSW": [
    0.052, 
    -1.876
   ]
  }, 
  "U+F80E": {
   "bBoxNE": [
    0.584, 
    5.42
   ], 
   "bBoxSW": [
    -0.084, 
    -1.624
   ]
  }, 
  "U+F820": {
   "bBoxNE": [
    1.54, 
    1.956
   ], 
   "bBoxSW": [
    -0.004, 
    -0.02
   ]
  }, 
  "U+F821": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F822": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F823": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F824": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F825": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F826": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F827": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F828": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F829": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F82A": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F82B": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F82C": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F82D": {
   "bBoxNE": [
    4.212, 
    4.156
   ], 
   "bBoxSW": [
    0.32, 
    -0.976
   ]
  }, 
  "U+F82E": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F82F": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F830": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F831": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F832": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F833": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F834": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F835": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F836": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F837": {
   "bBoxNE": [
    4.656, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F838": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F839": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F83A": {
   "bBoxNE": [
    4.1, 
    4.156
   ], 
   "bBoxSW": [
    0.208, 
    -0.976
   ]
  }, 
  "U+F83B": {
   "bBoxNE": [
    2.404, 
    3.3
   ], 
   "bBoxSW": [
    0.052, 
    -0.076
   ]
  }, 
  "U+F83C": {
   "bBoxNE": [
    2.38, 
    2.996
   ], 
   "bBoxSW": [
    0.128, 
    0.716
   ]
  }, 
  "U+F83D": {
   "bBoxNE": [
    2.292, 
    2.988
   ], 
   "bBoxSW": [
    0.144, 
    0.748
   ]
  }, 
  "U+F83E": {
   "bBoxNE": [
    2.124, 
    3.004
   ], 
   "bBoxSW": [
    0.128, 
    0.732
   ]
  }, 
  "U+F83F": {
   "bBoxNE": [
    3.18, 
    3.036
   ], 
   "bBoxSW": [
    0.128, 
    0.716
   ]
  }, 
  "U+F840": {
   "bBoxNE": [
    3.436, 
    3.296
   ], 
   "bBoxSW": [
    0.128, 
    -0.076
   ]
  }, 
  "U+F841": {
   "bBoxNE": [
    5.152, 
    4.084
   ], 
   "bBoxSW": [
    0.096, 
    0.396
   ]
  }, 
  "U+F842": {
   "bBoxNE": [
    5.152, 
    4.084
   ], 
   "bBoxSW": [
    0.104, 
    -0.016
   ]
  }, 
  "U+F843": {
   "bBoxNE": [
    6.712, 
    4.504
   ], 
   "bBoxSW": [
    0.128, 
    -0.076
   ]
  }, 
  "U+F844": {
   "bBoxNE": [
    5.716, 
    4.504
   ], 
   "bBoxSW": [
    0.092, 
    -0.076
   ]
  }, 
  "U+F845": {
   "bBoxNE": [
    6.476, 
    4.504
   ], 
   "bBoxSW": [
    0.128, 
    0.076
   ]
  }, 
  "U+F846": {
   "bBoxNE": [
    5.084, 
    3.732
   ], 
   "bBoxSW": [
    0.14, 
    0.072
   ]
  }, 
  "U+F847": {
   "bBoxNE": [
    5.084, 
    3.732
   ], 
   "bBoxSW": [
    0.14, 
    0.072
   ]
  }, 
  "U+F848": {
   "bBoxNE": [
    5.084, 
    3.732
   ], 
   "bBoxSW": [
    0.14, 
    0.072
   ]
  }, 
  "U+F849": {
   "bBoxNE": [
    5.116, 
    4.208
   ], 
   "bBoxSW": [
    0.14, 
    0.072
   ]
  }, 
  "U+F84A": {
   "bBoxNE": [
    3.24, 
    2.384
   ], 
   "bBoxSW": [
    0.04, 
    0.664
   ]
  }, 
  "U+F84B": {
   "bBoxNE": [
    4.512, 
    3.176
   ], 
   "bBoxSW": [
    0.04, 
    0.664
   ]
  }, 
  "U+F84C": {
   "bBoxNE": [
    7.628, 
    4.048
   ], 
   "bBoxSW": [
    0.04, 
    0.404
   ]
  }, 
  "U+F84D": {
   "bBoxNE": [
    4.312, 
    3.008
   ], 
   "bBoxSW": [
    -0.032, 
    0.664
   ]
  }, 
  "U+F84E": {
   "bBoxNE": [
    4.216, 
    3.024
   ], 
   "bBoxSW": [
    0.056, 
    0.664
   ]
  }, 
  "U+F84F": {
   "bBoxNE": [
    5.628, 
    3.16
   ], 
   "bBoxSW": [
    -0.032, 
    0.664
   ]
  }, 
  "U+F850": {
   "bBoxNE": [
    8.716, 
    3.952
   ], 
   "bBoxSW": [
    -0.032, 
    0.308
   ]
  }, 
  "U+F851": {
   "bBoxNE": [
    8.716, 
    7.736
   ], 
   "bBoxSW": [
    -0.032, 
    0.5
   ]
  }, 
  "U+F852": {
   "bBoxNE": [
    4.464, 
    3.116
   ], 
   "bBoxSW": [
    0.04, 
    0.664
   ]
  }, 
  "U+F853": {
   "bBoxNE": [
    5.56, 
    2.616
   ], 
   "bBoxSW": [
    0.092, 
    0.676
   ]
  }, 
  "U+F854": {
   "bBoxNE": [
    2.616, 
    3.048
   ], 
   "bBoxSW": [
    0.136, 
    0.768
   ]
  }, 
  "U+F855": {
   "bBoxNE": [
    3.876, 
    3.4
   ], 
   "bBoxSW": [
    0.116, 
    0.032
   ]
  }, 
  "U+F856": {
   "bBoxNE": [
    2.268, 
    3.024
   ], 
   "bBoxSW": [
    0.116, 
    0.744
   ]
  }, 
  "U+F857": {
   "bBoxNE": [
    2.34, 
    3.004
   ], 
   "bBoxSW": [
    0.116, 
    0.732
   ]
  }, 
  "U+F858": {
   "bBoxNE": [
    2.688, 
    2.976
   ], 
   "bBoxSW": [
    0.116, 
    0.624
   ]
  }, 
  "U+F859": {
   "bBoxNE": [
    3.32, 
    3.02
   ], 
   "bBoxSW": [
    0.116, 
    0.72
   ]
  }, 
  "U+F85A": {
   "bBoxNE": [
    5.392, 
    4.448
   ], 
   "bBoxSW": [
    0.116, 
    0.744
   ]
  }, 
  "U+F85B": {
   "bBoxNE": [
    5.724, 
    4.448
   ], 
   "bBoxSW": [
    0.116, 
    0.732
   ]
  }, 
  "U+F85C": {
   "bBoxNE": [
    5.76, 
    4.448
   ], 
   "bBoxSW": [
    0.116, 
    0.804
   ]
  }, 
  "U+F85D": {
   "bBoxNE": [
    6.828, 
    4.32
   ], 
   "bBoxSW": [
    0.116, 
    0.676
   ]
  }, 
  "U+F85E": {
   "bBoxNE": [
    5.808, 
    6.6
   ], 
   "bBoxSW": [
    0.116, 
    -0.548
   ]
  }, 
  "U+F85F": {
   "bBoxNE": [
    6.18, 
    6.6
   ], 
   "bBoxSW": [
    0.116, 
    -0.548
   ]
  }, 
  "U+F860": {
   "bBoxNE": [
    5.048, 
    4.248
   ], 
   "bBoxSW": [
    0.116, 
    0.484
   ]
  }, 
  "U+F861": {
   "bBoxNE": [
    6.256, 
    4.248
   ], 
   "bBoxSW": [
    0.116, 
    0.484
   ]
  }, 
  "U+F862": {
   "bBoxNE": [
    6.316, 
    4.248
   ], 
   "bBoxSW": [
    0.116, 
    0.484
   ]
  }, 
  "U+F863": {
   "bBoxNE": [
    6.284, 
    5.804
   ], 
   "bBoxSW": [
    0.116, 
    -1.436
   ]
  }, 
  "U+F864": {
   "bBoxNE": [
    7.5, 
    4.388
   ], 
   "bBoxSW": [
    0.116, 
    0.032
   ]
  }, 
  "U+F865": {
   "bBoxNE": [
    7.516, 
    4.416
   ], 
   "bBoxSW": [
    0.116, 
    0.176
   ]
  }, 
  "U+F866": {
   "bBoxNE": [
    5.58, 
    4.484
   ], 
   "bBoxSW": [
    0.044, 
    0.656
   ]
  }, 
  "U+F867": {
   "bBoxNE": [
    4.368, 
    4.516
   ], 
   "bBoxSW": [
    -0.032, 
    0.728
   ]
  }, 
  "U+F868": {
   "bBoxNE": [
    4.44, 
    4.376
   ], 
   "bBoxSW": [
    0.108, 
    0.728
   ]
  }, 
  "U+F869": {
   "bBoxNE": [
    5.216, 
    6.824
   ], 
   "bBoxSW": [
    0.196, 
    -0.328
   ]
  }, 
  "U+F86A": {
   "bBoxNE": [
    5.196, 
    6.964
   ], 
   "bBoxSW": [
    0.096, 
    -0.184
   ]
  }, 
  "U+F86B": {
   "bBoxNE": [
    4.396, 
    4.484
   ], 
   "bBoxSW": [
    0.068, 
    0.728
   ]
  }, 
  "U+F86C": {
   "bBoxNE": [
    4.696, 
    4.388
   ], 
   "bBoxSW": [
    -0.032, 
    0.728
   ]
  }, 
  "U+F86D": {
   "bBoxNE": [
    4.296, 
    4.448
   ], 
   "bBoxSW": [
    -0.032, 
    0.728
   ]
  }, 
  "U+F86E": {
   "bBoxNE": [
    4.608, 
    7.084
   ], 
   "bBoxSW": [
    -0.032, 
    -0.068
   ]
  }, 
  "U+F86F": {
   "bBoxNE": [
    4.644, 
    7.084
   ], 
   "bBoxSW": [
    -0.032, 
    -0.068
   ]
  }, 
  "U+F870": {
   "bBoxNE": [
    4.788, 
    6.824
   ], 
   "bBoxSW": [
    -0.032, 
    -0.328
   ]
  }, 
  "U+F871": {
   "bBoxNE": [
    4.788, 
    6.824
   ], 
   "bBoxSW": [
    -0.032, 
    -0.328
   ]
  }, 
  "U+F872": {
   "bBoxNE": [
    4.788, 
    6.824
   ], 
   "bBoxSW": [
    -0.032, 
    -0.328
   ]
  }, 
  "U+F873": {
   "bBoxNE": [
    4.16, 
    4.484
   ], 
   "bBoxSW": [
    0.072, 
    0.764
   ]
  }, 
  "U+F874": {
   "bBoxNE": [
    4.384, 
    4.388
   ], 
   "bBoxSW": [
    0.0, 
    0.744
   ]
  }, 
  "U+F875": {
   "bBoxNE": [
    4.08, 
    4.448
   ], 
   "bBoxSW": [
    0.0, 
    0.752
   ]
  }, 
  "U+F876": {
   "bBoxNE": [
    5.1, 
    4.484
   ], 
   "bBoxSW": [
    0.064, 
    0.756
   ]
  }, 
  "U+F877": {
   "bBoxNE": [
    5.14, 
    4.516
   ], 
   "bBoxSW": [
    0.132, 
    0.756
   ]
  }, 
  "U+F878": {
   "bBoxNE": [
    5.1, 
    4.376
   ], 
   "bBoxSW": [
    0.12, 
    0.732
   ]
  }, 
  "U+F879": {
   "bBoxNE": [
    5.408, 
    7.084
   ], 
   "bBoxSW": [
    0.12, 
    -0.068
   ]
  }, 
  "U+F87A": {
   "bBoxNE": [
    5.392, 
    4.388
   ], 
   "bBoxSW": [
    0.112, 
    0.744
   ]
  }, 
  "U+F87B": {
   "bBoxNE": [
    4.644, 
    7.084
   ], 
   "bBoxSW": [
    -0.032, 
    -0.068
   ]
  }, 
  "U+F87C": {
   "bBoxNE": [
    5.632, 
    4.308
   ], 
   "bBoxSW": [
    0.044, 
    0.656
   ]
  }, 
  "U+F87D": {
   "bBoxNE": [
    2.456, 
    2.936
   ], 
   "bBoxSW": [
    0.044, 
    0.656
   ]
  }, 
  "U+F87E": {
   "bBoxNE": [
    2.372, 
    2.92
   ], 
   "bBoxSW": [
    0.044, 
    0.648
   ]
  }, 
  "U+F87F": {
   "bBoxNE": [
    4.776, 
    3.808
   ], 
   "bBoxSW": [
    0.044, 
    -0.184
   ]
  }, 
  "U+F880": {
   "bBoxNE": [
    4.776, 
    3.808
   ], 
   "bBoxSW": [
    0.044, 
    -0.184
   ]
  }, 
  "U+F881": {
   "bBoxNE": [
    3.012, 
    1.752
   ], 
   "bBoxSW": [
    0.072, 
    -0.436
   ]
  }, 
  "U+F882": {
   "bBoxNE": [
    4.788, 
    6.824
   ], 
   "bBoxSW": [
    -0.032, 
    -0.348
   ]
  }, 
  "U+F883": {
   "bBoxNE": [
    4.608, 
    7.084
   ], 
   "bBoxSW": [
    -0.032, 
    -0.068
   ]
  }, 
  "U+F884": {
   "bBoxNE": [
    2.948, 
    2.352
   ], 
   "bBoxSW": [
    0.08, 
    -0.032
   ]
  }, 
  "U+F885": {
   "bBoxNE": [
    3.652, 
    3.008
   ], 
   "bBoxSW": [
    0.04, 
    0.132
   ]
  }, 
  "U+F886": {
   "bBoxNE": [
    1.136, 
    2.14
   ], 
   "bBoxSW": [
    0.04, 
    0.436
   ]
  }, 
  "U+F887": {
   "bBoxNE": [
    2.248, 
    2.936
   ], 
   "bBoxSW": [
    0.04, 
    0.436
   ]
  }, 
  "U+F888": {
   "bBoxNE": [
    5.444, 
    4.516
   ], 
   "bBoxSW": [
    0.08, 
    0.436
   ]
  }, 
  "U+F889": {
   "bBoxNE": [
    5.384, 
    4.66
   ], 
   "bBoxSW": [
    0.08, 
    0.436
   ]
  }, 
  "U+F88A": {
   "bBoxNE": [
    6.916, 
    4.016
   ], 
   "bBoxSW": [
    0.092, 
    -0.036
   ]
  }, 
  "U+F88B": {
   "bBoxNE": [
    4.888, 
    4.016
   ], 
   "bBoxSW": [
    0.084, 
    0.2
   ]
  }, 
  "U+F88C": {
   "bBoxNE": [
    1.376, 
    2.728
   ], 
   "bBoxSW": [
    0.116, 
    0.136
   ]
  }, 
  "U+F88D": {
   "bBoxNE": [
    2.132, 
    3.316
   ], 
   "bBoxSW": [
    0.188, 
    -0.04
   ]
  }, 
  "U+F88E": {
   "bBoxNE": [
    5.856, 
    4.248
   ], 
   "bBoxSW": [
    0.108, 
    -0.024
   ]
  }, 
  "U+F88F": {
   "bBoxNE": [
    9.148, 
    5.008
   ], 
   "bBoxSW": [
    0.108, 
    -0.024
   ]
  }, 
  "U+F890": {
   "bBoxNE": [
    4.244, 
    3.008
   ], 
   "bBoxSW": [
    0.02, 
    -0.024
   ]
  }, 
  "U+F891": {
   "bBoxNE": [
    6.32, 
    2.412
   ], 
   "bBoxSW": [
    0.072, 
    -0.596
   ]
  }, 
  "U+F892": {
   "bBoxNE": [
    6.32, 
    2.412
   ], 
   "bBoxSW": [
    0.072, 
    -0.596
   ]
  }, 
  "U+F893": {
   "bBoxNE": [
    2.96, 
    4.484
   ], 
   "bBoxSW": [
    0.044, 
    0.836
   ]
  }, 
  "U+F894": {
   "bBoxNE": [
    3.344, 
    4.016
   ], 
   "bBoxSW": [
    0.072, 
    0.2
   ]
  }, 
  "U+F895": {
   "bBoxNE": [
    2.96, 
    4.484
   ], 
   "bBoxSW": [
    0.044, 
    0.836
   ]
  }, 
  "U+F896": {
   "bBoxNE": [
    2.96, 
    4.484
   ], 
   "bBoxSW": [
    0.044, 
    0.836
   ]
  }, 
  "U+F897": {
   "bBoxNE": [
    2.96, 
    4.484
   ], 
   "bBoxSW": [
    0.044, 
    0.836
   ]
  }, 
  "U+F898": {
   "bBoxNE": [
    3.428, 
    4.32
   ], 
   "bBoxSW": [
    0.228, 
    0.676
   ]
  }, 
  "U+F899": {
   "bBoxNE": [
    3.316, 
    7.084
   ], 
   "bBoxSW": [
    0.152, 
    -0.068
   ]
  }, 
  "U+F89A": {
   "bBoxNE": [
    3.316, 
    7.084
   ], 
   "bBoxSW": [
    0.152, 
    -0.068
   ]
  }, 
  "U+F89B": {
   "bBoxNE": [
    3.66, 
    6.824
   ], 
   "bBoxSW": [
    0.084, 
    -0.328
   ]
  }, 
  "U+F89C": {
   "bBoxNE": [
    3.66, 
    6.824
   ], 
   "bBoxSW": [
    0.084, 
    -0.328
   ]
  }, 
  "U+F89D": {
   "bBoxNE": [
    3.556, 
    6.824
   ], 
   "bBoxSW": [
    0.184, 
    -0.328
   ]
  }, 
  "U+F89E": {
   "bBoxNE": [
    3.476, 
    6.824
   ], 
   "bBoxSW": [
    0.104, 
    -0.328
   ]
  }, 
  "U+F89F": {
   "bBoxNE": [
    3.476, 
    6.824
   ], 
   "bBoxSW": [
    0.104, 
    -0.328
   ]
  }, 
  "U+F8A0": {
   "bBoxNE": [
    3.568, 
    5.804
   ], 
   "bBoxSW": [
    0.14, 
    -1.436
   ]
  }, 
  "U+F8A1": {
   "bBoxNE": [
    3.044, 
    2.364
   ], 
   "bBoxSW": [
    0.084, 
    0.648
   ]
  }, 
  "U+F8A2": {
   "bBoxNE": [
    2.156, 
    2.34
   ], 
   "bBoxSW": [
    0.084, 
    0.68
   ]
  }, 
  "U+F8A3": {
   "bBoxNE": [
    3.392, 
    2.996
   ], 
   "bBoxSW": [
    0.084, 
    0.68
   ]
  }, 
  "U+F8A4": {
   "bBoxNE": [
    3.284, 
    2.988
   ], 
   "bBoxSW": [
    0.064, 
    0.68
   ]
  }, 
  "U+F8A5": {
   "bBoxNE": [
    3.08, 
    3.004
   ], 
   "bBoxSW": [
    0.084, 
    0.68
   ]
  }, 
  "U+F8A6": {
   "bBoxNE": [
    4.192, 
    3.036
   ], 
   "bBoxSW": [
    0.084, 
    0.68
   ]
  }, 
  "U+F8A7": {
   "bBoxNE": [
    6.204, 
    4.084
   ], 
   "bBoxSW": [
    0.068, 
    0.312
   ]
  }, 
  "U+F8A8": {
   "bBoxNE": [
    6.324, 
    4.084
   ], 
   "bBoxSW": [
    0.088, 
    0.368
   ]
  }, 
  "U+F8A9": {
   "bBoxNE": [
    7.824, 
    4.504
   ], 
   "bBoxSW": [
    0.084, 
    -0.076
   ]
  }, 
  "U+F8AA": {
   "bBoxNE": [
    7.588, 
    4.504
   ], 
   "bBoxSW": [
    0.132, 
    0.428
   ]
  }, 
  "U+F8AB": {
   "bBoxNE": [
    6.04, 
    4.064
   ], 
   "bBoxSW": [
    0.084, 
    0.312
   ]
  }, 
  "U+F8AC": {
   "bBoxNE": [
    6.06, 
    4.24
   ], 
   "bBoxSW": [
    0.1, 
    0.584
   ]
  }, 
  "U+F8AD": {
   "bBoxNE": [
    6.096, 
    3.732
   ], 
   "bBoxSW": [
    0.112, 
    0.084
   ]
  }, 
  "U+F8AE": {
   "bBoxNE": [
    6.108, 
    4.356
   ], 
   "bBoxSW": [
    0.112, 
    0.2
   ]
  }, 
  "U+F8B0": {
   "bBoxNE": [
    3.148, 
    2.972
   ], 
   "bBoxSW": [
    0.048, 
    0.588
   ]
  }, 
  "U+F8B1": {
   "bBoxNE": [
    1.868, 
    2.972
   ], 
   "bBoxSW": [
    0.048, 
    0.588
   ]
  }, 
  "U+F8B2": {
   "bBoxNE": [
    3.22, 
    3.048
   ], 
   "bBoxSW": [
    0.048, 
    0.588
   ]
  }, 
  "U+F8B3": {
   "bBoxNE": [
    4.42, 
    3.408
   ], 
   "bBoxSW": [
    0.048, 
    0.032
   ]
  }, 
  "U+F8B4": {
   "bBoxNE": [
    3.284, 
    3.2
   ], 
   "bBoxSW": [
    0.048, 
    0.588
   ]
  }, 
  "U+F8B5": {
   "bBoxNE": [
    3.024, 
    3.16
   ], 
   "bBoxSW": [
    0.048, 
    0.588
   ]
  }, 
  "U+F8B6": {
   "bBoxNE": [
    3.276, 
    3.308
   ], 
   "bBoxSW": [
    0.048, 
    0.588
   ]
  }, 
  "U+F8B7": {
   "bBoxNE": [
    4.024, 
    3.136
   ], 
   "bBoxSW": [
    0.048, 
    0.588
   ]
  }, 
  "U+F8B8": {
   "bBoxNE": [
    6.388, 
    4.448
   ], 
   "bBoxSW": [
    0.048, 
    0.588
   ]
  }, 
  "U+F8B9": {
   "bBoxNE": [
    6.288, 
    4.428
   ], 
   "bBoxSW": [
    0.048, 
    0.588
   ]
  }, 
  "U+F8BA": {
   "bBoxNE": [
    6.408, 
    4.448
   ], 
   "bBoxSW": [
    0.048, 
    0.588
   ]
  }, 
  "U+F8BB": {
   "bBoxNE": [
    7.356, 
    4.32
   ], 
   "bBoxSW": [
    0.048, 
    0.588
   ]
  }, 
  "U+F8BC": {
   "bBoxNE": [
    6.728, 
    6.6
   ], 
   "bBoxSW": [
    0.048, 
    -0.548
   ]
  }, 
  "U+F8BD": {
   "bBoxNE": [
    6.748, 
    6.6
   ], 
   "bBoxSW": [
    0.048, 
    -0.548
   ]
  }, 
  "U+F8BE": {
   "bBoxNE": [
    5.456, 
    4.248
   ], 
   "bBoxSW": [
    0.048, 
    0.484
   ]
  }, 
  "U+F8BF": {
   "bBoxNE": [
    6.648, 
    4.248
   ], 
   "bBoxSW": [
    0.048, 
    0.484
   ]
  }, 
  "U+F8C0": {
   "bBoxNE": [
    6.804, 
    4.248
   ], 
   "bBoxSW": [
    0.048, 
    0.484
   ]
  }, 
  "U+F8C1": {
   "bBoxNE": [
    6.812, 
    5.804
   ], 
   "bBoxSW": [
    0.048, 
    -1.436
   ]
  }, 
  "U+F8C2": {
   "bBoxNE": [
    7.812, 
    4.388
   ], 
   "bBoxSW": [
    0.048, 
    0.032
   ]
  }, 
  "U+F8C3": {
   "bBoxNE": [
    8.004, 
    4.416
   ], 
   "bBoxSW": [
    0.048, 
    0.176
   ]
  }, 
  "U+F8C4": {
   "bBoxNE": [
    4.392, 
    2.948
   ], 
   "bBoxSW": [
    0.056, 
    0.616
   ]
  }, 
  "U+F8C5": {
   "bBoxNE": [
    4.272, 
    3.024
   ], 
   "bBoxSW": [
    0.056, 
    0.616
   ]
  }, 
  "U+F8C6": {
   "bBoxNE": [
    4.08, 
    2.988
   ], 
   "bBoxSW": [
    0.056, 
    0.616
   ]
  }, 
  "U+F8C7": {
   "bBoxNE": [
    4.48, 
    2.96
   ], 
   "bBoxSW": [
    0.056, 
    0.616
   ]
  }, 
  "U+F8C8": {
   "bBoxNE": [
    7.432, 
    3.752
   ], 
   "bBoxSW": [
    0.112, 
    -0.536
   ]
  }, 
  "U+F8C9": {
   "bBoxNE": [
    8.24, 
    3.596
   ], 
   "bBoxSW": [
    0.108, 
    -0.708
   ]
  }, 
  "U+F8CA": {
   "bBoxNE": [
    4.528, 
    3.3
   ], 
   "bBoxSW": [
    0.104, 
    -0.076
   ]
  }, 
  "U+F8CB": {
   "bBoxNE": [
    1.06, 
    2.276
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F8CC": {
   "bBoxNE": [
    0.94, 
    2.228
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F8CD": {
   "bBoxNE": [
    1.132, 
    2.316
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F8CE": {
   "bBoxNE": [
    0.996, 
    2.288
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F8CF": {
   "bBoxNE": [
    1.2, 
    2.336
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F8D0": {
   "bBoxNE": [
    0.868, 
    2.34
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F8D1": {
   "bBoxNE": [
    1.104, 
    2.28
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F8D2": {
   "bBoxNE": [
    1.152, 
    2.28
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F8D3": {
   "bBoxNE": [
    1.052, 
    2.304
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F8D4": {
   "bBoxNE": [
    0.896, 
    2.272
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F8D5": {
   "bBoxNE": [
    1.172, 
    2.276
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F8D6": {
   "bBoxNE": [
    1.848, 
    2.3
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "U+F8D7": {
   "bBoxNE": [
    4.98, 
    1.664
   ], 
   "bBoxSW": [
    0.0, 
    -0.5
   ]
  }, 
  "U+F8D8": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.66
   ]
  }, 
  "U+F8D9": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.644
   ]
  }, 
  "U+F8DA": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.6
   ]
  }, 
  "U+F8DB": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.6
   ]
  }, 
  "U+F8DC": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.804
   ]
  }, 
  "U+F8DD": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.74
   ]
  }, 
  "U+F8DE": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.74
   ]
  }, 
  "U+F8DF": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.656
   ]
  }, 
  "U+F8E0": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.004, 
    -0.5
   ]
  }, 
  "U+F8E1": {
   "bBoxNE": [
    4.616, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.472
   ]
  }, 
  "U+F8E2": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.476
   ]
  }, 
  "U+F8E3": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.488
   ]
  }, 
  "U+F8E4": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    -0.004, 
    -0.456
   ]
  }, 
  "U+F8E5": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.5
   ]
  }, 
  "U+F8E6": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.544
   ]
  }, 
  "U+F8E7": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.488
   ]
  }, 
  "U+F8E8": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.472
   ]
  }, 
  "U+F8E9": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.496
   ]
  }, 
  "U+F8EA": {
   "bBoxNE": [
    4.76, 
    1.824
   ], 
   "bBoxSW": [
    -0.42, 
    -1.004
   ]
  }, 
  "U+F8EB": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    -0.216, 
    -0.948
   ]
  }, 
  "U+F8EC": {
   "bBoxNE": [
    4.328, 
    1.544
   ], 
   "bBoxSW": [
    0.0, 
    -0.556
   ]
  }, 
  "U+F8ED": {
   "bBoxNE": [
    4.584, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.516
   ]
  }, 
  "U+F8EE": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.468
   ]
  }, 
  "U+F8EF": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.46
   ]
  }, 
  "U+F8F0": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.488
   ]
  }, 
  "U+F8F1": {
   "bBoxNE": [
    4.624, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.456
   ]
  }, 
  "U+F8F2": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.544
   ]
  }, 
  "U+F8F3": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.472
   ]
  }, 
  "U+F8F4": {
   "bBoxNE": [
    4.64, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.524
   ]
  }, 
  "U+F8F5": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.488
   ]
  }, 
  "U+F8F6": {
   "bBoxNE": [
    5.172, 
    1.824
   ], 
   "bBoxSW": [
    -0.46, 
    -0.968
   ]
  }, 
  "U+F8F7": {
   "bBoxNE": [
    4.804, 
    1.824
   ], 
   "bBoxSW": [
    -0.376, 
    -0.844
   ]
  }, 
  "U+F8F8": {
   "bBoxNE": [
    4.42, 
    1.74
   ], 
   "bBoxSW": [
    0.0, 
    -0.572
   ]
  }, 
  "U+F8F9": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    -0.004, 
    -0.508
   ]
  }, 
  "U+F8FA": {
   "bBoxNE": [
    4.62, 
    1.824
   ], 
   "bBoxSW": [
    0.0, 
    -0.492
   ]
  }, 
  "U+F8FB": {
   "bBoxNE": [
    4.184, 
    1.6
   ], 
   "bBoxSW": [
    0.0, 
    -0.516
   ]
  }, 
  "U+F8FC": {
   "bBoxNE": [
    5.3, 
    1.992
   ], 
   "bBoxSW": [
    0.0, 
    -0.992
   ]
  }, 
  "accidentalDoubleFlat": {
   "bBoxNE": [
    1.532, 
    2.236
   ], 
   "bBoxSW": [
    0.0, 
    -1.2
   ]
  }, 
  "accidentalDoubleFlatParens": {
   "bBoxNE": [
    2.308, 
    1.772
   ], 
   "bBoxSW": [
    0.0, 
    -1.14
   ]
  }, 
  "accidentalDoubleSharp": {
   "bBoxNE": [
    1.348, 
    0.892
   ], 
   "bBoxSW": [
    0.0, 
    -0.9
   ]
  }, 
  "accidentalDoubleSharpParens": {
   "bBoxNE": [
    2.076, 
    1.668
   ], 
   "bBoxSW": [
    0.0, 
    -1.552
   ]
  }, 
  "accidentalFilledReversedFlatAndFlat": {
   "bBoxNE": [
    1.56, 
    1.864
   ], 
   "bBoxSW": [
    0.0, 
    -1.016
   ]
  }, 
  "accidentalFlat": {
   "bBoxNE": [
    0.944, 
    2.24
   ], 
   "bBoxSW": [
    0.0, 
    -1.2
   ]
  }, 
  "accidentalFlatParens": {
   "bBoxNE": [
    1.78, 
    1.896
   ], 
   "bBoxSW": [
    0.0, 
    -1.34
   ]
  }, 
  "accidentalFlatSmall": {
   "bBoxNE": [
    0.384, 
    0.888
   ], 
   "bBoxSW": [
    0.0, 
    -0.488
   ]
  }, 
  "accidentalNatural": {
   "bBoxNE": [
    0.824, 
    2.232
   ], 
   "bBoxSW": [
    0.0, 
    -2.308
   ]
  }, 
  "accidentalNaturalParens": {
   "bBoxNE": [
    1.628, 
    1.864
   ], 
   "bBoxSW": [
    0.0, 
    -1.98
   ]
  }, 
  "accidentalNaturalSmall": {
   "bBoxNE": [
    0.312, 
    0.896
   ], 
   "bBoxSW": [
    0.0, 
    -0.916
   ]
  }, 
  "accidentalParensLeft": {
   "bBoxNE": [
    0.568, 
    1.296
   ], 
   "bBoxSW": [
    0.0, 
    -1.28
   ]
  }, 
  "accidentalParensRight": {
   "bBoxNE": [
    0.516, 
    1.384
   ], 
   "bBoxSW": [
    0.0, 
    -1.188
   ]
  }, 
  "accidentalQuarterToneFlat4": {
   "bBoxNE": [
    0.788, 
    1.0
   ], 
   "bBoxSW": [
    0.0, 
    -1.352
   ]
  }, 
  "accidentalQuarterToneFlatArrowUp": {
   "bBoxNE": [
    0.948, 
    2.48
   ], 
   "bBoxSW": [
    -0.112, 
    -1.204
   ]
  }, 
  "accidentalQuarterToneFlatFilledReversed": {
   "bBoxNE": [
    0.944, 
    2.24
   ], 
   "bBoxSW": [
    0.0, 
    -1.204
   ]
  }, 
  "accidentalQuarterToneFlatNaturalArrowDown": {
   "bBoxNE": [
    0.972, 
    1.788
   ], 
   "bBoxSW": [
    0.004, 
    -2.116
   ]
  }, 
  "accidentalQuarterToneFlatStein": {
   "bBoxNE": [
    0.944, 
    2.24
   ], 
   "bBoxSW": [
    0.0, 
    -1.204
   ]
  }, 
  "accidentalQuarterToneSharp4": {
   "bBoxNE": [
    0.736, 
    1.0
   ], 
   "bBoxSW": [
    0.0, 
    -1.564
   ]
  }, 
  "accidentalQuarterToneSharpArrowDown": {
   "bBoxNE": [
    1.024, 
    2.036
   ], 
   "bBoxSW": [
    0.0, 
    -2.512
   ]
  }, 
  "accidentalQuarterToneSharpNaturalArrowUp": {
   "bBoxNE": [
    0.824, 
    2.516
   ], 
   "bBoxSW": [
    -0.04, 
    -2.308
   ]
  }, 
  "accidentalQuarterToneSharpStein": {
   "bBoxNE": [
    1.144, 
    1.58
   ], 
   "bBoxSW": [
    0.0, 
    -1.736
   ]
  }, 
  "accidentalSharp": {
   "bBoxNE": [
    1.14, 
    2.26
   ], 
   "bBoxSW": [
    0.0, 
    -1.988
   ]
  }, 
  "accidentalSharpParens": {
   "bBoxNE": [
    1.952, 
    1.964
   ], 
   "bBoxSW": [
    0.0, 
    -1.796
   ]
  }, 
  "accidentalSharpSmall": {
   "bBoxNE": [
    0.564, 
    1.12
   ], 
   "bBoxSW": [
    0.0, 
    -1.0
   ]
  }, 
  "accidentalThreeQuarterTonesFlatArrowDown": {
   "bBoxNE": [
    0.952, 
    1.896
   ], 
   "bBoxSW": [
    -0.244, 
    -1.788
   ]
  }, 
  "accidentalThreeQuarterTonesSharpArrowUp": {
   "bBoxNE": [
    1.18, 
    2.488
   ], 
   "bBoxSW": [
    0.0, 
    -1.992
   ]
  }, 
  "accidentalThreeQuarterTonesSharpStein": {
   "bBoxNE": [
    1.776, 
    2.38
   ], 
   "bBoxSW": [
    0.0, 
    -2.088
   ]
  }, 
  "articAccentAbove": {
   "bBoxNE": [
    1.5, 
    0.98
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "articAccentBelow": {
   "bBoxNE": [
    1.5, 
    0.0
   ], 
   "bBoxSW": [
    0.0, 
    -0.98
   ]
  }, 
  "articAccentStaccatoAbove": {
   "bBoxNE": [
    1.5, 
    1.348
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "articAccentStaccatoBelow": {
   "bBoxNE": [
    1.5, 
    0.0
   ], 
   "bBoxSW": [
    0.0, 
    -1.456
   ]
  }, 
  "articLaissezVibrerAbove": {
   "bBoxNE": [
    3.26, 
    0.996
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "articLaissezVibrerBelow": {
   "bBoxNE": [
    3.26, 
    0.0
   ], 
   "bBoxSW": [
    0.0, 
    -0.996
   ]
  }, 
  "articMarcatoAbove": {
   "bBoxNE": [
    1.1, 
    1.34
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "articMarcatoBelow": {
   "bBoxNE": [
    1.1, 
    0.012
   ], 
   "bBoxSW": [
    0.0, 
    -1.324
   ]
  }, 
  "articMarcatoStaccatoAbove": {
   "bBoxNE": [
    1.1, 
    1.708
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "articMarcatoStaccatoBelow": {
   "bBoxNE": [
    1.1, 
    0.0
   ], 
   "bBoxSW": [
    0.0, 
    -1.816
   ]
  }, 
  "articMarcatoTenutoAbove": {
   "bBoxNE": [
    1.244, 
    1.94
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "articMarcatoTenutoBelow": {
   "bBoxNE": [
    1.24, 
    0.0
   ], 
   "bBoxSW": [
    0.0, 
    -1.94
   ]
  }, 
  "articStaccatissimoAbove": {
   "bBoxNE": [
    0.604, 
    1.056
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "articStaccatissimoBelow": {
   "bBoxNE": [
    0.604, 
    0.0
   ], 
   "bBoxSW": [
    0.0, 
    -1.056
   ]
  }, 
  "articStaccatissimoWedgeAbove": {
   "bBoxNE": [
    0.792, 
    1.12
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "articStaccatissimoWedgeBelow": {
   "bBoxNE": [
    0.792, 
    0.0
   ], 
   "bBoxSW": [
    0.0, 
    -1.12
   ]
  }, 
  "articStaccatoAbove": {
   "bBoxNE": [
    0.62, 
    0.516
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "articStaccatoBelow": {
   "bBoxNE": [
    0.62, 
    0.0
   ], 
   "bBoxSW": [
    0.0, 
    -0.516
   ]
  }, 
  "articStressAbove": {
   "bBoxNE": [
    1.268, 
    0.728
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "articStressBelow": {
   "bBoxNE": [
    1.268, 
    0.0
   ], 
   "bBoxSW": [
    0.0, 
    -0.728
   ]
  }, 
  "articTenutoAbove": {
   "bBoxNE": [
    1.244, 
    0.456
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "articTenutoAccentAbove": {
   "bBoxNE": [
    1.508, 
    1.472
   ], 
   "bBoxSW": [
    0.008, 
    0.0
   ]
  }, 
  "articTenutoAccentBelow": {
   "bBoxNE": [
    1.5, 
    0.0
   ], 
   "bBoxSW": [
    0.0, 
    -1.56
   ]
  }, 
  "articTenutoBelow": {
   "bBoxNE": [
    1.244, 
    0.0
   ], 
   "bBoxSW": [
    0.0, 
    -0.456
   ]
  }, 
  "articTenutoStaccatoAbove": {
   "bBoxNE": [
    1.432, 
    0.956
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "articTenutoStaccatoBelow": {
   "bBoxNE": [
    1.244, 
    0.0
   ], 
   "bBoxSW": [
    0.0, 
    -0.912
   ]
  }, 
  "articUnstressAbove": {
   "bBoxNE": [
    1.724, 
    0.684
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "articUnstressBelow": {
   "bBoxNE": [
    1.724, 
    0.0
   ], 
   "bBoxSW": [
    0.0, 
    -0.684
   ]
  }, 
  "augmentationDot": {
   "bBoxNE": [
    0.62, 
    0.256
   ], 
   "bBoxSW": [
    0.0, 
    -0.26
   ]
  }, 
  "barlineDashed": {
   "bBoxNE": [
    0.132, 
    4.08
   ], 
   "bBoxSW": [
    0.0, 
    -0.06
   ]
  }, 
  "barlineSingle": {
   "bBoxNE": [
    0.132, 
    4.088
   ], 
   "bBoxSW": [
    0.0, 
    -0.092
   ]
  }, 
  "brassBend": {
   "bBoxNE": [
    1.724, 
    0.684
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "brassDoitMedium": {
   "bBoxNE": [
    1.808, 
    1.212
   ], 
   "bBoxSW": [
    0.0, 
    -0.196
   ]
  }, 
  "brassDoitShort": {
   "bBoxNE": [
    1.212, 
    1.412
   ], 
   "bBoxSW": [
    0.0, 
    -0.284
   ]
  }, 
  "brassFallLipLong": {
   "bBoxNE": [
    3.568, 
    0.388
   ], 
   "bBoxSW": [
    0.008, 
    -3.0
   ]
  }, 
  "brassFallLipMedium": {
   "bBoxNE": [
    1.612, 
    0.456
   ], 
   "bBoxSW": [
    0.008, 
    -3.504
   ]
  }, 
  "brassFallLipShort": {
   "bBoxNE": [
    1.156, 
    0.364
   ], 
   "bBoxSW": [
    0.0, 
    -2.752
   ]
  }, 
  "brassFallRoughLong": {
   "bBoxNE": [
    2.252, 
    3.556
   ], 
   "bBoxSW": [
    0.004, 
    0.004
   ]
  }, 
  "brassFallRoughMedium": {
   "bBoxNE": [
    2.948, 
    2.916
   ], 
   "bBoxSW": [
    0.0, 
    -0.008
   ]
  }, 
  "brassFallRoughShort": {
   "bBoxNE": [
    1.988, 
    2.16
   ], 
   "bBoxSW": [
    0.0, 
    0.02
   ]
  }, 
  "brassFallSmoothLong": {
   "bBoxNE": [
    5.564, 
    2.476
   ], 
   "bBoxSW": [
    0.0, 
    -0.008
   ]
  }, 
  "brassFallSmoothMedium": {
   "bBoxNE": [
    3.672, 
    4.988
   ], 
   "bBoxSW": [
    0.0, 
    -0.004
   ]
  }, 
  "brassFallSmoothShort": {
   "bBoxNE": [
    2.48, 
    3.144
   ], 
   "bBoxSW": [
    0.0, 
    -0.004
   ]
  }, 
  "brassFlip": {
   "bBoxNE": [
    2.636, 
    1.684
   ], 
   "bBoxSW": [
    0.0, 
    0.004
   ]
  }, 
  "brassJazzTurn": {
   "bBoxNE": [
    2.6, 
    0.812
   ], 
   "bBoxSW": [
    -0.008, 
    -0.008
   ]
  }, 
  "brassLiftLong": {
   "bBoxNE": [
    2.252, 
    3.552
   ], 
   "bBoxSW": [
    0.004, 
    0.0
   ]
  }, 
  "brassLiftMedium": {
   "bBoxNE": [
    2.948, 
    2.924
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "brassLiftShort": {
   "bBoxNE": [
    1.984, 
    2.14
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "brassLiftSmoothLong": {
   "bBoxNE": [
    5.468, 
    2.396
   ], 
   "bBoxSW": [
    -0.1, 
    -0.088
   ]
  }, 
  "brassLiftSmoothMedium": {
   "bBoxNE": [
    3.672, 
    4.988
   ], 
   "bBoxSW": [
    0.0, 
    -0.004
   ]
  }, 
  "brassLiftSmoothShort": {
   "bBoxNE": [
    2.352, 
    3.016
   ], 
   "bBoxSW": [
    -0.008, 
    -0.004
   ]
  }, 
  "brassMuteClosed": {
   "bBoxNE": [
    1.22, 
    1.388
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "brassMuteHalfClosed": {
   "bBoxNE": [
    1.092, 
    1.276
   ], 
   "bBoxSW": [
    -0.132, 
    -0.112
   ]
  }, 
  "brassMuteOpen": {
   "bBoxNE": [
    1.044, 
    1.272
   ], 
   "bBoxSW": [
    0.004, 
    -0.028
   ]
  }, 
  "brassPlop": {
   "bBoxNE": [
    1.808, 
    0.2
   ], 
   "bBoxSW": [
    0.0, 
    -1.208
   ]
  }, 
  "brassScoop": {
   "bBoxNE": [
    1.216, 
    0.468
   ], 
   "bBoxSW": [
    0.004, 
    -1.228
   ]
  }, 
  "brassSmear": {
   "bBoxNE": [
    2.04, 
    0.636
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "breathMarkComma": {
   "bBoxNE": [
    0.584, 
    1.348
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "breathMarkTick": {
   "bBoxNE": [
    1.844, 
    2.028
   ], 
   "bBoxSW": [
    0.0, 
    -0.004
   ]
  }, 
  "breathMarkUpbow": {
   "bBoxNE": [
    1.1, 
    1.88
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "buzzRoll": {
   "bBoxNE": [
    0.636, 
    0.82
   ], 
   "bBoxSW": [
    -0.652, 
    -0.824
   ]
  }, 
  "cClef": {
   "bBoxNE": [
    2.584, 
    2.056
   ], 
   "bBoxSW": [
    0.0, 
    -2.084
   ]
  }, 
  "caesura": {
   "bBoxNE": [
    2.124, 
    2.656
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "clef15": {
   "bBoxNE": [
    0.972, 
    1.112
   ], 
   "bBoxSW": [
    0.0, 
    -0.024
   ]
  }, 
  "clef8": {
   "bBoxNE": [
    0.624, 
    1.016
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "coda": {
   "bBoxNE": [
    3.872, 
    3.768
   ], 
   "bBoxSW": [
    0.0, 
    -1.164
   ]
  }, 
  "csymAccidentalDoubleFlat": {
   "bBoxNE": [
    1.58, 
    3.12
   ], 
   "bBoxSW": [
    0.0, 
    -0.004
   ]
  }, 
  "csymAccidentalDoubleFlatSmall": {
   "bBoxNE": [
    1.28, 
    3.012
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "csymAccidentalDoubleSharp": {
   "bBoxNE": [
    1.348, 
    1.928
   ], 
   "bBoxSW": [
    0.0, 
    0.136
   ]
  }, 
  "csymAccidentalDoubleSharpSmall": {
   "bBoxNE": [
    1.164, 
    1.772
   ], 
   "bBoxSW": [
    -0.024, 
    0.228
   ]
  }, 
  "csymAccidentalFlat": {
   "bBoxNE": [
    0.904, 
    3.1
   ], 
   "bBoxSW": [
    0.0, 
    -0.004
   ]
  }, 
  "csymAccidentalFlatSmall": {
   "bBoxNE": [
    0.72, 
    2.892
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "csymAccidentalNatural": {
   "bBoxNE": [
    0.84, 
    3.232
   ], 
   "bBoxSW": [
    0.0, 
    -0.108
   ]
  }, 
  "csymAccidentalNaturalSmall": {
   "bBoxNE": [
    0.816, 
    2.584
   ], 
   "bBoxSW": [
    0.0, 
    -0.404
   ]
  }, 
  "csymAccidentalSharp": {
   "bBoxNE": [
    1.14, 
    3.28
   ], 
   "bBoxSW": [
    0.0, 
    -0.26
   ]
  }, 
  "csymAccidentalSharpSmall": {
   "bBoxNE": [
    1.032, 
    2.872
   ], 
   "bBoxSW": [
    0.0, 
    -0.4
   ]
  }, 
  "csymAlteredBassSlash": {
   "bBoxNE": [
    1.452, 
    3.588
   ], 
   "bBoxSW": [
    -0.492, 
    -1.088
   ]
  }, 
  "csymAugmented": {
   "bBoxNE": [
    1.22, 
    1.388
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "csymDiminished": {
   "bBoxNE": [
    1.04, 
    1.272
   ], 
   "bBoxSW": [
    0.0, 
    -0.028
   ]
  }, 
  "csymHalfDiminished": {
   "bBoxNE": [
    1.692, 
    1.628
   ], 
   "bBoxSW": [
    0.0, 
    -0.324
   ]
  }, 
  "csymMajorSeventh": {
   "bBoxNE": [
    1.028, 
    1.64
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "csymMinor": {
   "bBoxNE": [
    1.244, 
    0.456
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "csymParensLeftTall": {
   "bBoxNE": [
    0.74, 
    5.16
   ], 
   "bBoxSW": [
    0.052, 
    -1.896
   ]
  }, 
  "csymParensLeftVeryTall": {
   "bBoxNE": [
    0.844, 
    7.24
   ], 
   "bBoxSW": [
    0.0, 
    -3.736
   ]
  }, 
  "csymParensRightTall": {
   "bBoxNE": [
    0.544, 
    5.424
   ], 
   "bBoxSW": [
    -0.064, 
    -1.636
   ]
  }, 
  "csymParensRightVeryTall": {
   "bBoxNE": [
    0.844, 
    7.628
   ], 
   "bBoxSW": [
    0.0, 
    -3.336
   ]
  }, 
  "dynamicCrescendoHairpin": {
   "bBoxNE": [
    3.396, 
    1.64
   ], 
   "bBoxSW": [
    0.0, 
    0.264
   ]
  }, 
  "dynamicDiminuendoHairpin": {
   "bBoxNE": [
    3.396, 
    1.64
   ], 
   "bBoxSW": [
    0.0, 
    0.264
   ]
  }, 
  "dynamicFF": {
   "bBoxNE": [
    1.696, 
    2.744
   ], 
   "bBoxSW": [
    0.052, 
    0.0
   ]
  }, 
  "dynamicFFF": {
   "bBoxNE": [
    2.376, 
    2.732
   ], 
   "bBoxSW": [
    0.052, 
    0.0
   ]
  }, 
  "dynamicFFFF": {
   "bBoxNE": [
    3.044, 
    2.732
   ], 
   "bBoxSW": [
    0.02, 
    0.0
   ]
  }, 
  "dynamicFFFFF": {
   "bBoxNE": [
    3.616, 
    2.744
   ], 
   "bBoxSW": [
    0.012, 
    0.0
   ]
  }, 
  "dynamicFFFFFF": {
   "bBoxNE": [
    4.496, 
    2.732
   ], 
   "bBoxSW": [
    0.052, 
    0.0
   ]
  }, 
  "dynamicForte": {
   "bBoxNE": [
    0.972, 
    2.676
   ], 
   "bBoxSW": [
    0.0, 
    -0.036
   ]
  }, 
  "dynamicFortePiano": {
   "bBoxNE": [
    1.728, 
    2.676
   ], 
   "bBoxSW": [
    0.048, 
    -0.036
   ]
  }, 
  "dynamicForzando": {
   "bBoxNE": [
    2.348, 
    2.644
   ], 
   "bBoxSW": [
    0.072, 
    -0.068
   ]
  }, 
  "dynamicHairpinParenthesisLeft": {
   "bBoxNE": [
    0.476, 
    1.096
   ], 
   "bBoxSW": [
    0.0, 
    -1.096
   ]
  }, 
  "dynamicHairpinParenthesisRight": {
   "bBoxNE": [
    0.46, 
    1.096
   ], 
   "bBoxSW": [
    0.0, 
    -1.096
   ]
  }, 
  "dynamicMF": {
   "bBoxNE": [
    2.096, 
    2.672
   ], 
   "bBoxSW": [
    0.096, 
    -0.064
   ]
  }, 
  "dynamicMP": {
   "bBoxNE": [
    2.12, 
    2.292
   ], 
   "bBoxSW": [
    0.096, 
    -0.032
   ]
  }, 
  "dynamicMessaDiVoce": {
   "bBoxNE": [
    7.236, 
    1.64
   ], 
   "bBoxSW": [
    0.0, 
    0.264
   ]
  }, 
  "dynamicMezzo": {
   "bBoxNE": [
    1.056, 
    1.372
   ], 
   "bBoxSW": [
    0.04, 
    -0.028
   ]
  }, 
  "dynamicNiente": {
   "bBoxNE": [
    0.62, 
    1.228
   ], 
   "bBoxSW": [
    0.032, 
    -0.044
   ]
  }, 
  "dynamicNienteForHairpin": {
   "bBoxNE": [
    1.04, 
    0.644
   ], 
   "bBoxSW": [
    0.0, 
    -0.656
   ]
  }, 
  "dynamicPF": {
   "bBoxNE": [
    1.848, 
    2.676
   ], 
   "bBoxSW": [
    0.028, 
    0.0
   ]
  }, 
  "dynamicPP": {
   "bBoxNE": [
    1.936, 
    2.1
   ], 
   "bBoxSW": [
    0.072, 
    0.0
   ]
  }, 
  "dynamicPPP": {
   "bBoxNE": [
    2.084, 
    2.06
   ], 
   "bBoxSW": [
    -0.004, 
    0.0
   ]
  }, 
  "dynamicPPPP": {
   "bBoxNE": [
    2.668, 
    2.1
   ], 
   "bBoxSW": [
    -0.008, 
    0.0
   ]
  }, 
  "dynamicPPPPP": {
   "bBoxNE": [
    3.528, 
    2.1
   ], 
   "bBoxSW": [
    -0.004, 
    0.0
   ]
  }, 
  "dynamicPPPPPP": {
   "bBoxNE": [
    3.828, 
    2.06
   ], 
   "bBoxSW": [
    -0.004, 
    0.0
   ]
  }, 
  "dynamicPiano": {
   "bBoxNE": [
    1.112, 
    2.072
   ], 
   "bBoxSW": [
    0.028, 
    0.0
   ]
  }, 
  "dynamicRinforzando": {
   "bBoxNE": [
    0.608, 
    1.184
   ], 
   "bBoxSW": [
    0.0, 
    0.004
   ]
  }, 
  "dynamicRinforzando1": {
   "bBoxNE": [
    1.592, 
    2.676
   ], 
   "bBoxSW": [
    0.02, 
    -0.036
   ]
  }, 
  "dynamicRinforzando2": {
   "bBoxNE": [
    2.864, 
    2.676
   ], 
   "bBoxSW": [
    0.02, 
    -0.1
   ]
  }, 
  "dynamicSforzando": {
   "bBoxNE": [
    0.824, 
    1.832
   ], 
   "bBoxSW": [
    0.028, 
    -0.104
   ]
  }, 
  "dynamicSforzando1": {
   "bBoxNE": [
    1.684, 
    2.688
   ], 
   "bBoxSW": [
    0.092, 
    -0.116
   ]
  }, 
  "dynamicSforzandoPianissimo": {
   "bBoxNE": [
    3.068, 
    2.664
   ], 
   "bBoxSW": [
    0.104, 
    -0.116
   ]
  }, 
  "dynamicSforzandoPiano": {
   "bBoxNE": [
    2.392, 
    2.664
   ], 
   "bBoxSW": [
    0.108, 
    -0.116
   ]
  }, 
  "dynamicSforzato": {
   "bBoxNE": [
    2.948, 
    2.688
   ], 
   "bBoxSW": [
    0.072, 
    -0.132
   ]
  }, 
  "dynamicSforzatoFF": {
   "bBoxNE": [
    3.628, 
    2.796
   ], 
   "bBoxSW": [
    0.176, 
    -0.116
   ]
  }, 
  "dynamicSforzatoPiano": {
   "bBoxNE": [
    3.964, 
    2.688
   ], 
   "bBoxSW": [
    0.0, 
    -0.132
   ]
  }, 
  "dynamicZ": {
   "bBoxNE": [
    1.3, 
    1.544
   ], 
   "bBoxSW": [
    0.012, 
    -0.1
   ]
  }, 
  "fClef": {
   "bBoxNE": [
    3.628, 
    1.2
   ], 
   "bBoxSW": [
    0.0, 
    -3.404
   ]
  }, 
  "fClef8va": {
   "bBoxNE": [
    3.628, 
    2.348
   ], 
   "bBoxSW": [
    0.0, 
    -3.404
   ]
  }, 
  "fClef8vb": {
   "bBoxNE": [
    3.628, 
    1.2
   ], 
   "bBoxSW": [
    0.0, 
    -4.444
   ]
  }, 
  "fermataAbove": {
   "bBoxNE": [
    1.516, 
    2.676
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "fermataBelow": {
   "bBoxNE": [
    1.516, 
    0.0
   ], 
   "bBoxSW": [
    0.0, 
    -2.676
   ]
  }, 
  "flag16thDown": {
   "bBoxNE": [
    1.476, 
    3.372
   ], 
   "bBoxSW": [
    0.0, 
    -0.032
   ]
  }, 
  "flag16thUp": {
   "bBoxNE": [
    1.096, 
    0.196
   ], 
   "bBoxSW": [
    0.0, 
    -3.448
   ]
  }, 
  "flag8thDown": {
   "bBoxNE": [
    1.472, 
    3.34
   ], 
   "bBoxSW": [
    0.0, 
    -0.056
   ]
  }, 
  "flag8thUp": {
   "bBoxNE": [
    1.096, 
    0.048
   ], 
   "bBoxSW": [
    0.0, 
    -3.46
   ]
  }, 
  "flagInternalDown": {
   "bBoxNE": [
    1.472, 
    2.504
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "flagInternalUp": {
   "bBoxNE": [
    1.096, 
    0.064
   ], 
   "bBoxSW": [
    0.0, 
    -2.48
   ]
  }, 
  "fretboard3String": {
   "bBoxNE": [
    1.5, 
    4.092
   ], 
   "bBoxSW": [
    0.008, 
    0.0
   ]
  }, 
  "fretboard3StringNut": {
   "bBoxNE": [
    1.5, 
    4.26
   ], 
   "bBoxSW": [
    0.004, 
    0.0
   ]
  }, 
  "fretboard4String": {
   "bBoxNE": [
    2.156, 
    4.092
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "fretboard4StringNut": {
   "bBoxNE": [
    2.164, 
    4.26
   ], 
   "bBoxSW": [
    0.004, 
    0.0
   ]
  }, 
  "functionEight": {
   "bBoxNE": [
    1.572, 
    3.252
   ], 
   "bBoxSW": [
    0.112, 
    -0.04
   ]
  }, 
  "functionFive": {
   "bBoxNE": [
    1.4, 
    3.228
   ], 
   "bBoxSW": [
    0.24, 
    -0.052
   ]
  }, 
  "functionFour": {
   "bBoxNE": [
    1.632, 
    3.276
   ], 
   "bBoxSW": [
    0.144, 
    -0.052
   ]
  }, 
  "functionNine": {
   "bBoxNE": [
    1.292, 
    3.268
   ], 
   "bBoxSW": [
    0.116, 
    -0.012
   ]
  }, 
  "functionOne": {
   "bBoxNE": [
    0.98, 
    3.252
   ], 
   "bBoxSW": [
    0.224, 
    -0.084
   ]
  }, 
  "functionSeven": {
   "bBoxNE": [
    1.32, 
    3.268
   ], 
   "bBoxSW": [
    0.068, 
    -0.016
   ]
  }, 
  "functionSix": {
   "bBoxNE": [
    1.604, 
    3.28
   ], 
   "bBoxSW": [
    0.152, 
    -0.02
   ]
  }, 
  "functionThree": {
   "bBoxNE": [
    1.356, 
    3.268
   ], 
   "bBoxSW": [
    0.128, 
    -0.036
   ]
  }, 
  "functionTwo": {
   "bBoxNE": [
    1.504, 
    3.204
   ], 
   "bBoxSW": [
    0.092, 
    -0.056
   ]
  }, 
  "functionZero": {
   "bBoxNE": [
    1.308, 
    3.256
   ], 
   "bBoxSW": [
    0.228, 
    0.004
   ]
  }, 
  "gClef": {
   "bBoxNE": [
    2.848, 
    5.312
   ], 
   "bBoxSW": [
    0.0, 
    -3.336
   ]
  }, 
  "gClef8va": {
   "bBoxNE": [
    2.848, 
    6.64
   ], 
   "bBoxSW": [
    0.0, 
    -3.332
   ]
  }, 
  "gClef8vb": {
   "bBoxNE": [
    2.848, 
    5.312
   ], 
   "bBoxSW": [
    0.0, 
    -4.348
   ]
  }, 
  "graceNoteAcciaccaturaStemDown": {
   "bBoxNE": [
    0.916, 
    0.376
   ], 
   "bBoxSW": [
    -0.36, 
    -1.692
   ]
  }, 
  "graceNoteAcciaccaturaStemUp": {
   "bBoxNE": [
    1.536, 
    1.776
   ], 
   "bBoxSW": [
    0.0, 
    -0.456
   ]
  }, 
  "graceNoteAppoggiaturaStemDown": {
   "bBoxNE": [
    0.844, 
    0.376
   ], 
   "bBoxSW": [
    0.0, 
    -1.692
   ]
  }, 
  "graceNoteAppoggiaturaStemUp": {
   "bBoxNE": [
    1.304, 
    1.744
   ], 
   "bBoxSW": [
    0.0, 
    -0.38
   ]
  }, 
  "keyboardPedalD": {
   "bBoxNE": [
    1.236, 
    2.032
   ], 
   "bBoxSW": [
    0.0, 
    -0.004
   ]
  }, 
  "keyboardPedalDot": {
   "bBoxNE": [
    0.62, 
    0.496
   ], 
   "bBoxSW": [
    0.0, 
    -0.016
   ]
  }, 
  "keyboardPedalE": {
   "bBoxNE": [
    1.036, 
    2.032
   ], 
   "bBoxSW": [
    0.024, 
    0.0
   ]
  }, 
  "keyboardPedalHyphen": {
   "bBoxNE": [
    1.86, 
    1.788
   ], 
   "bBoxSW": [
    -0.18, 
    1.152
   ]
  }, 
  "keyboardPedalP": {
   "bBoxNE": [
    0.896, 
    2.032
   ], 
   "bBoxSW": [
    0.0, 
    -0.008
   ]
  }, 
  "keyboardPedalPed": {
   "bBoxNE": [
    3.992, 
    2.032
   ], 
   "bBoxSW": [
    0.0, 
    -0.016
   ]
  }, 
  "keyboardPedalUp": {
   "bBoxNE": [
    1.224, 
    1.296
   ], 
   "bBoxSW": [
    0.0, 
    -0.004
   ]
  }, 
  "legerLine": {
   "bBoxNE": [
    1.656, 
    0.192
   ], 
   "bBoxSW": [
    -0.364, 
    -0.272
   ]
  }, 
  "metAugmentationDot": {
   "bBoxNE": [
    0.62, 
    0.256
   ], 
   "bBoxSW": [
    0.0, 
    -0.26
   ]
  }, 
  "metNote16thDown": {
   "bBoxNE": [
    1.528, 
    0.772
   ], 
   "bBoxSW": [
    0.0, 
    -4.292
   ]
  }, 
  "metNote16thUp": {
   "bBoxNE": [
    2.32, 
    3.304
   ], 
   "bBoxSW": [
    0.0, 
    -0.828
   ]
  }, 
  "metNote32ndDown": {
   "bBoxNE": [
    1.472, 
    0.76
   ], 
   "bBoxSW": [
    0.0, 
    -4.164
   ]
  }, 
  "metNote32ndUp": {
   "bBoxNE": [
    2.172, 
    3.956
   ], 
   "bBoxSW": [
    0.0, 
    -0.772
   ]
  }, 
  "metNote8thDown": {
   "bBoxNE": [
    1.56, 
    0.636
   ], 
   "bBoxSW": [
    0.0, 
    -3.184
   ]
  }, 
  "metNote8thUp": {
   "bBoxNE": [
    2.288, 
    2.968
   ], 
   "bBoxSW": [
    0.0, 
    -0.752
   ]
  }, 
  "metNoteDoubleWhole": {
   "bBoxNE": [
    2.24, 
    1.116
   ], 
   "bBoxSW": [
    0.0, 
    -1.044
   ]
  }, 
  "metNoteDoubleWholeSquare": {
   "bBoxNE": [
    2.14, 
    1.076
   ], 
   "bBoxSW": [
    0.0, 
    -1.076
   ]
  }, 
  "metNoteHalfDown": {
   "bBoxNE": [
    1.448, 
    0.676
   ], 
   "bBoxSW": [
    0.0, 
    -2.952
   ]
  }, 
  "metNoteHalfUp": {
   "bBoxNE": [
    1.476, 
    3.024
   ], 
   "bBoxSW": [
    0.0, 
    -0.592
   ]
  }, 
  "metNoteQuarterDown": {
   "bBoxNE": [
    1.272, 
    0.76
   ], 
   "bBoxSW": [
    0.0, 
    -3.124
   ]
  }, 
  "metNoteQuarterUp": {
   "bBoxNE": [
    1.252, 
    2.84
   ], 
   "bBoxSW": [
    0.0, 
    -0.772
   ]
  }, 
  "metNoteWhole": {
   "bBoxNE": [
    1.82, 
    0.576
   ], 
   "bBoxSW": [
    0.0, 
    -0.56
   ]
  }, 
  "miscEyeglasses": {
   "bBoxNE": [
    6.272, 
    4.0
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "note16thDown": {
   "bBoxNE": [
    1.476, 
    0.548
   ], 
   "bBoxSW": [
    0.0, 
    -3.612
   ]
  }, 
  "note16thUp": {
   "bBoxNE": [
    2.268, 
    3.436
   ], 
   "bBoxSW": [
    0.0, 
    -0.548
   ]
  }, 
  "note32ndDown": {
   "bBoxNE": [
    1.476, 
    0.548
   ], 
   "bBoxSW": [
    0.0, 
    -4.292
   ]
  }, 
  "note32ndUp": {
   "bBoxNE": [
    2.268, 
    3.956
   ], 
   "bBoxSW": [
    0.0, 
    -0.656
   ]
  }, 
  "note8thDown": {
   "bBoxNE": [
    1.472, 
    0.548
   ], 
   "bBoxSW": [
    0.0, 
    -3.616
   ]
  }, 
  "note8thUp": {
   "bBoxNE": [
    2.268, 
    3.576
   ], 
   "bBoxSW": [
    0.0, 
    -0.548
   ]
  }, 
  "noteDoubleWhole": {
   "bBoxNE": [
    2.24, 
    1.116
   ], 
   "bBoxSW": [
    0.0, 
    -1.044
   ]
  }, 
  "noteDoubleWholeSquare": {
   "bBoxNE": [
    2.14, 
    1.076
   ], 
   "bBoxSW": [
    0.0, 
    -1.076
   ]
  }, 
  "noteHalfDown": {
   "bBoxNE": [
    1.56, 
    0.66
   ], 
   "bBoxSW": [
    0.0, 
    -3.568
   ]
  }, 
  "noteHalfUp": {
   "bBoxNE": [
    1.56, 
    3.568
   ], 
   "bBoxSW": [
    0.0, 
    -0.66
   ]
  }, 
  "noteQuarterDown": {
   "bBoxNE": [
    1.348, 
    0.548
   ], 
   "bBoxSW": [
    0.0, 
    -3.568
   ]
  }, 
  "noteQuarterUp": {
   "bBoxNE": [
    1.348, 
    3.568
   ], 
   "bBoxSW": [
    0.0, 
    -0.548
   ]
  }, 
  "noteWhole": {
   "bBoxNE": [
    1.82, 
    0.576
   ], 
   "bBoxSW": [
    0.0, 
    -0.56
   ]
  }, 
  "noteheadBlack": {
   "bBoxNE": [
    1.348, 
    0.548
   ], 
   "bBoxSW": [
    0.0, 
    -0.548
   ]
  }, 
  "noteheadBlackParens": {
   "bBoxNE": [
    1.516, 
    0.868
   ], 
   "bBoxSW": [
    -0.424, 
    -1.004
   ]
  }, 
  "noteheadCircleX": {
   "bBoxNE": [
    1.264, 
    0.752
   ], 
   "bBoxSW": [
    0.0, 
    -0.64
   ]
  }, 
  "noteheadCircledBlackLarge": {
   "bBoxNE": [
    1.34, 
    0.888
   ], 
   "bBoxSW": [
    -0.216, 
    -0.948
   ]
  }, 
  "noteheadCircledHalfLarge": {
   "bBoxNE": [
    1.68, 
    0.844
   ], 
   "bBoxSW": [
    -0.376, 
    -0.844
   ]
  }, 
  "noteheadDiamondBlack": {
   "bBoxNE": [
    1.092, 
    0.548
   ], 
   "bBoxSW": [
    0.0, 
    -0.556
   ]
  }, 
  "noteheadDiamondBlackWide": {
   "bBoxNE": [
    1.268, 
    0.464
   ], 
   "bBoxSW": [
    0.0, 
    -0.488
   ]
  }, 
  "noteheadDiamondHalfOld": {
   "bBoxNE": [
    1.08, 
    0.508
   ], 
   "bBoxSW": [
    0.0, 
    -0.508
   ]
  }, 
  "noteheadDiamondHalfWide": {
   "bBoxNE": [
    1.268, 
    0.464
   ], 
   "bBoxSW": [
    0.0, 
    -0.488
   ]
  }, 
  "noteheadDiamondWholeOld": {
   "bBoxNE": [
    1.14, 
    0.568
   ], 
   "bBoxSW": [
    0.0, 
    -0.572
   ]
  }, 
  "noteheadDoubleWhole": {
   "bBoxNE": [
    2.244, 
    1.116
   ], 
   "bBoxSW": [
    0.0, 
    -1.044
   ]
  }, 
  "noteheadDoubleWholeSquare": {
   "bBoxNE": [
    2.084, 
    1.076
   ], 
   "bBoxSW": [
    -0.056, 
    -1.076
   ]
  }, 
  "noteheadHalf": {
   "bBoxNE": [
    1.56, 
    0.66
   ], 
   "bBoxSW": [
    0.0, 
    -0.66
   ]
  }, 
  "noteheadHalfParens": {
   "bBoxNE": [
    1.912, 
    0.908
   ], 
   "bBoxSW": [
    -0.46, 
    -0.968
   ]
  }, 
  "noteheadMoonBlack": {
   "bBoxNE": [
    1.272, 
    0.468
   ], 
   "bBoxSW": [
    0.0, 
    -0.476
   ]
  }, 
  "noteheadMoonWhite": {
   "bBoxNE": [
    1.228, 
    0.476
   ], 
   "bBoxSW": [
    0.0, 
    -0.468
   ]
  }, 
  "noteheadParenthesis": {
   "bBoxNE": [
    1.664, 
    1.32
   ], 
   "bBoxSW": [
    -0.364, 
    -1.384
   ]
  }, 
  "noteheadParenthesisLeft": {
   "bBoxNE": [
    0.476, 
    1.08
   ], 
   "bBoxSW": [
    0.0, 
    -1.112
   ]
  }, 
  "noteheadParenthesisRight": {
   "bBoxNE": [
    0.396, 
    1.144
   ], 
   "bBoxSW": [
    -0.064, 
    -1.048
   ]
  }, 
  "noteheadPlusBlack": {
   "bBoxNE": [
    1.048, 
    0.572
   ], 
   "bBoxSW": [
    0.0, 
    -0.516
   ]
  }, 
  "noteheadSlashDiamondWhite": {
   "bBoxNE": [
    1.752, 
    0.988
   ], 
   "bBoxSW": [
    0.0, 
    -0.932
   ]
  }, 
  "noteheadSlashHorizontalEnds": {
   "bBoxNE": [
    2.084, 
    1.052
   ], 
   "bBoxSW": [
    0.0, 
    -1.048
   ]
  }, 
  "noteheadSlashVerticalEnds": {
   "bBoxNE": [
    1.316, 
    0.712
   ], 
   "bBoxSW": [
    0.0, 
    -0.848
   ]
  }, 
  "noteheadSlashVerticalEndsSmall": {
   "bBoxNE": [
    1.336, 
    0.7
   ], 
   "bBoxSW": [
    0.0, 
    -0.848
   ]
  }, 
  "noteheadSlashWhiteHalf": {
   "bBoxNE": [
    3.848, 
    1.116
   ], 
   "bBoxSW": [
    0.0, 
    -1.12
   ]
  }, 
  "noteheadSlashedBlack1": {
   "bBoxNE": [
    2.16, 
    1.132
   ], 
   "bBoxSW": [
    -0.608, 
    -1.152
   ]
  }, 
  "noteheadSlashedBlack2": {
   "bBoxNE": [
    2.044, 
    1.288
   ], 
   "bBoxSW": [
    -0.664, 
    -1.092
   ]
  }, 
  "noteheadSlashedHalf1": {
   "bBoxNE": [
    2.236, 
    1.136
   ], 
   "bBoxSW": [
    -0.532, 
    -1.148
   ]
  }, 
  "noteheadSlashedHalf2": {
   "bBoxNE": [
    2.08, 
    1.288
   ], 
   "bBoxSW": [
    -0.628, 
    -1.092
   ]
  }, 
  "noteheadSquareBlack": {
   "bBoxNE": [
    1.288, 
    0.48
   ], 
   "bBoxSW": [
    0.0, 
    -0.5
   ]
  }, 
  "noteheadSquareWhite": {
   "bBoxNE": [
    1.292, 
    0.484
   ], 
   "bBoxSW": [
    0.0, 
    -0.508
   ]
  }, 
  "noteheadTriangleDownBlack": {
   "bBoxNE": [
    1.14, 
    0.48
   ], 
   "bBoxSW": [
    0.0, 
    -0.496
   ]
  }, 
  "noteheadTriangleDownWhite": {
   "bBoxNE": [
    1.14, 
    0.46
   ], 
   "bBoxSW": [
    0.0, 
    -0.492
   ]
  }, 
  "noteheadTriangleLeftBlack": {
   "bBoxNE": [
    1.244, 
    0.516
   ], 
   "bBoxSW": [
    0.0, 
    -0.488
   ]
  }, 
  "noteheadTriangleLeftWhite": {
   "bBoxNE": [
    1.244, 
    0.516
   ], 
   "bBoxSW": [
    0.0, 
    -0.488
   ]
  }, 
  "noteheadTriangleRightBlack": {
   "bBoxNE": [
    1.284, 
    0.444
   ], 
   "bBoxSW": [
    0.0, 
    -0.472
   ]
  }, 
  "noteheadTriangleRightWhite": {
   "bBoxNE": [
    1.284, 
    0.444
   ], 
   "bBoxSW": [
    0.0, 
    -0.472
   ]
  }, 
  "noteheadTriangleRoundDownBlack": {
   "bBoxNE": [
    1.288, 
    0.46
   ], 
   "bBoxSW": [
    0.0, 
    -0.544
   ]
  }, 
  "noteheadTriangleRoundDownWhite": {
   "bBoxNE": [
    1.288, 
    0.46
   ], 
   "bBoxSW": [
    0.0, 
    -0.544
   ]
  }, 
  "noteheadTriangleUpBlack": {
   "bBoxNE": [
    1.18, 
    0.512
   ], 
   "bBoxSW": [
    0.0, 
    -0.472
   ]
  }, 
  "noteheadTriangleUpRightBlack": {
   "bBoxNE": [
    1.276, 
    0.476
   ], 
   "bBoxSW": [
    0.0, 
    -0.456
   ]
  }, 
  "noteheadTriangleUpRightWhite": {
   "bBoxNE": [
    1.276, 
    0.476
   ], 
   "bBoxSW": [
    0.0, 
    -0.456
   ]
  }, 
  "noteheadTriangleUpWhite": {
   "bBoxNE": [
    1.136, 
    0.492
   ], 
   "bBoxSW": [
    0.0, 
    -0.46
   ]
  }, 
  "noteheadVoidWithX": {
   "bBoxNE": [
    1.268, 
    0.792
   ], 
   "bBoxSW": [
    0.0, 
    -0.6
   ]
  }, 
  "noteheadWhole": {
   "bBoxNE": [
    1.82, 
    0.576
   ], 
   "bBoxSW": [
    0.0, 
    -0.56
   ]
  }, 
  "noteheadXBlack": {
   "bBoxNE": [
    1.172, 
    0.808
   ], 
   "bBoxSW": [
    0.0, 
    -0.72
   ]
  }, 
  "noteheadXOrnate": {
   "bBoxNE": [
    0.976, 
    0.64
   ], 
   "bBoxSW": [
    0.0, 
    -0.656
   ]
  }, 
  "octaveBassa": {
   "bBoxNE": [
    3.752, 
    1.312
   ], 
   "bBoxSW": [
    0.0, 
    -0.044
   ]
  }, 
  "octaveParensLeft": {
   "bBoxNE": [
    0.52, 
    2.12
   ], 
   "bBoxSW": [
    0.044, 
    -0.072
   ]
  }, 
  "octaveParensRight": {
   "bBoxNE": [
    0.484, 
    2.192
   ], 
   "bBoxSW": [
    0.024, 
    0.0
   ]
  }, 
  "ornamentComma": {
   "bBoxNE": [
    0.584, 
    1.348
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "ornamentMordent": {
   "bBoxNE": [
    2.576, 
    1.124
   ], 
   "bBoxSW": [
    0.0, 
    -0.288
   ]
  }, 
  "ornamentShortTrill": {
   "bBoxNE": [
    2.576, 
    0.84
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "ornamentTremblement": {
   "bBoxNE": [
    3.668, 
    0.844
   ], 
   "bBoxSW": [
    -0.44, 
    -0.064
   ]
  }, 
  "ornamentTrill": {
   "bBoxNE": [
    1.7, 
    1.736
   ], 
   "bBoxSW": [
    0.04, 
    -0.012
   ]
  }, 
  "ornamentTurn": {
   "bBoxNE": [
    1.86, 
    1.192
   ], 
   "bBoxSW": [
    0.0, 
    -0.016
   ]
  }, 
  "ottava": {
   "bBoxNE": [
    0.968, 
    2.176
   ], 
   "bBoxSW": [
    0.0, 
    -0.048
   ]
  }, 
  "ottavaAlta": {
   "bBoxNE": [
    2.128, 
    2.188
   ], 
   "bBoxSW": [
    0.0, 
    -0.048
   ]
  }, 
  "ottavaBassa": {
   "bBoxNE": [
    2.288, 
    2.176
   ], 
   "bBoxSW": [
    0.0, 
    -0.072
   ]
  }, 
  "ottavaBassaBa": {
   "bBoxNE": [
    2.396, 
    2.176
   ], 
   "bBoxSW": [
    0.0, 
    -0.048
   ]
  }, 
  "ottavaBassaVb": {
   "bBoxNE": [
    2.352, 
    2.176
   ], 
   "bBoxSW": [
    0.096, 
    -0.048
   ]
  }, 
  "pictDamp2": {
   "bBoxNE": [
    2.48, 
    1.92
   ], 
   "bBoxSW": [
    0.0, 
    -0.552
   ]
  }, 
  "pictDamp3": {
   "bBoxNE": [
    2.48, 
    1.92
   ], 
   "bBoxSW": [
    0.0, 
    -0.552
   ]
  }, 
  "pictDamp4": {
   "bBoxNE": [
    2.48, 
    1.92
   ], 
   "bBoxSW": [
    0.0, 
    -0.552
   ]
  }, 
  "pictOpen": {
   "bBoxNE": [
    0.796, 
    1.532
   ], 
   "bBoxSW": [
    0.0, 
    -0.46
   ]
  }, 
  "quindicesima": {
   "bBoxNE": [
    1.792, 
    2.284
   ], 
   "bBoxSW": [
    0.0, 
    -0.08
   ]
  }, 
  "quindicesimaAlta": {
   "bBoxNE": [
    3.328, 
    2.284
   ], 
   "bBoxSW": [
    0.0, 
    -0.08
   ]
  }, 
  "quindicesimaBassa": {
   "bBoxNE": [
    3.364, 
    2.284
   ], 
   "bBoxSW": [
    0.0, 
    -0.08
   ]
  }, 
  "quindicesimaBassaMb": {
   "bBoxNE": [
    3.432, 
    2.284
   ], 
   "bBoxSW": [
    0.0, 
    -0.08
   ]
  }, 
  "repeat1Bar": {
   "bBoxNE": [
    2.024, 
    1.024
   ], 
   "bBoxSW": [
    0.0, 
    -1.024
   ]
  }, 
  "repeat2Bars": {
   "bBoxNE": [
    2.864, 
    1.048
   ], 
   "bBoxSW": [
    -0.004, 
    -1.048
   ]
  }, 
  "repeat4Bars": {
   "bBoxNE": [
    4.588, 
    4.488
   ], 
   "bBoxSW": [
    0.0, 
    -1.048
   ]
  }, 
  "repeatBarLowerDot": {
   "bBoxNE": [
    0.588, 
    -0.392
   ], 
   "bBoxSW": [
    0.0, 
    -1.004
   ]
  }, 
  "repeatBarSlash": {
   "bBoxNE": [
    2.028, 
    1.048
   ], 
   "bBoxSW": [
    0.0, 
    -1.048
   ]
  }, 
  "repeatBarUpperDot": {
   "bBoxNE": [
    0.588, 
    0.94
   ], 
   "bBoxSW": [
    0.0, 
    0.328
   ]
  }, 
  "repeatDot": {
   "bBoxNE": [
    0.62, 
    0.256
   ], 
   "bBoxSW": [
    0.0, 
    -0.26
   ]
  }, 
  "repeatDots": {
   "bBoxNE": [
    0.664, 
    2.884
   ], 
   "bBoxSW": [
    0.0, 
    1.168
   ]
  }, 
  "repeatLeft": {
   "bBoxNE": [
    1.688, 
    4.072
   ], 
   "bBoxSW": [
    0.0, 
    -0.056
   ]
  }, 
  "repeatRight": {
   "bBoxNE": [
    1.684, 
    4.072
   ], 
   "bBoxSW": [
    0.0, 
    -0.056
   ]
  }, 
  "repeatRightLeft": {
   "bBoxNE": [
    2.984, 
    4.072
   ], 
   "bBoxSW": [
    0.0, 
    -0.056
   ]
  }, 
  "rest128th": {
   "bBoxNE": [
    1.652, 
    2.848
   ], 
   "bBoxSW": [
    0.0, 
    -2.228
   ]
  }, 
  "rest16th": {
   "bBoxNE": [
    1.396, 
    1.128
   ], 
   "bBoxSW": [
    0.0, 
    -1.384
   ]
  }, 
  "rest256th": {
   "bBoxNE": [
    1.84, 
    2.76
   ], 
   "bBoxSW": [
    0.0, 
    -3.028
   ]
  }, 
  "rest32nd": {
   "bBoxNE": [
    1.476, 
    1.752
   ], 
   "bBoxSW": [
    0.0, 
    -1.532
   ]
  }, 
  "rest64th": {
   "bBoxNE": [
    1.552, 
    2.052
   ], 
   "bBoxSW": [
    0.0, 
    -2.252
   ]
  }, 
  "rest8th": {
   "bBoxNE": [
    1.304, 
    1.068
   ], 
   "bBoxSW": [
    0.0, 
    -0.916
   ]
  }, 
  "restDoubleWhole": {
   "bBoxNE": [
    0.716, 
    1.052
   ], 
   "bBoxSW": [
    0.0, 
    -0.04
   ]
  }, 
  "restHBar": {
   "bBoxNE": [
    4.768, 
    1.788
   ], 
   "bBoxSW": [
    0.0, 
    -1.824
   ]
  }, 
  "restHBarLeft": {
   "bBoxNE": [
    2.944, 
    1.828
   ], 
   "bBoxSW": [
    0.0, 
    -1.788
   ]
  }, 
  "restHBarMiddle": {
   "bBoxNE": [
    2.016, 
    0.544
   ], 
   "bBoxSW": [
    -0.192, 
    -0.484
   ]
  }, 
  "restHBarRight": {
   "bBoxNE": [
    2.684, 
    1.828
   ], 
   "bBoxSW": [
    0.0, 
    -1.788
   ]
  }, 
  "restHalf": {
   "bBoxNE": [
    1.584, 
    0.564
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "restLonga": {
   "bBoxNE": [
    0.732, 
    1.052
   ], 
   "bBoxSW": [
    0.0, 
    -1.048
   ]
  }, 
  "restMaxima": {
   "bBoxNE": [
    1.772, 
    1.084
   ], 
   "bBoxSW": [
    0.0, 
    -1.088
   ]
  }, 
  "restQuarter": {
   "bBoxNE": [
    1.24, 
    1.592
   ], 
   "bBoxSW": [
    0.0, 
    -1.596
   ]
  }, 
  "restWhole": {
   "bBoxNE": [
    1.944, 
    0.004
   ], 
   "bBoxSW": [
    0.0, 
    -0.704
   ]
  }, 
  "segno": {
   "bBoxNE": [
    3.792, 
    3.772
   ], 
   "bBoxSW": [
    0.0, 
    -1.112
   ]
  }, 
  "staff5Lines": {
   "bBoxNE": [
    2.948, 
    4.052
   ], 
   "bBoxSW": [
    0.0, 
    -0.056
   ]
  }, 
  "stem": {
   "bBoxNE": [
    0.064, 
    4.0
   ], 
   "bBoxSW": [
    -0.068, 
    0.0
   ]
  }, 
  "stringsDownBow": {
   "bBoxNE": [
    1.44, 
    1.332
   ], 
   "bBoxSW": [
    0.0, 
    0.004
   ]
  }, 
  "stringsDownBowTurned": {
   "bBoxNE": [
    1.44, 
    1.332
   ], 
   "bBoxSW": [
    0.0, 
    0.004
   ]
  }, 
  "stringsHarmonic": {
   "bBoxNE": [
    0.796, 
    0.996
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "stringsUpBow": {
   "bBoxNE": [
    1.1, 
    1.88
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "stringsUpBowTurned": {
   "bBoxNE": [
    1.1, 
    1.88
   ], 
   "bBoxSW": [
    0.0, 
    0.0
   ]
  }, 
  "textAugmentationDot": {
   "bBoxNE": [
    0.62, 
    0.256
   ], 
   "bBoxSW": [
    0.0, 
    -0.26
   ]
  }, 
  "textBlackNoteFrac16thLongStem": {
   "bBoxNE": [
    1.348, 
    3.804
   ], 
   "bBoxSW": [
    0.0, 
    -0.548
   ]
  }, 
  "textBlackNoteFrac16thShortStem": {
   "bBoxNE": [
    1.348, 
    3.04
   ], 
   "bBoxSW": [
    0.0, 
    -0.548
   ]
  }, 
  "textBlackNoteFrac32ndLongStem": {
   "bBoxNE": [
    1.348, 
    3.804
   ], 
   "bBoxSW": [
    0.0, 
    -0.548
   ]
  }, 
  "textBlackNoteFrac8thLongStem": {
   "bBoxNE": [
    1.348, 
    3.8
   ], 
   "bBoxSW": [
    0.0, 
    -0.548
   ]
  }, 
  "textBlackNoteFrac8thShortStem": {
   "bBoxNE": [
    1.348, 
    3.04
   ], 
   "bBoxSW": [
    0.0, 
    -0.548
   ]
  }, 
  "textBlackNoteLongStem": {
   "bBoxNE": [
    1.348, 
    3.8
   ], 
   "bBoxSW": [
    0.0, 
    -0.548
   ]
  }, 
  "textBlackNoteShortStem": {
   "bBoxNE": [
    1.348, 
    3.04
   ], 
   "bBoxSW": [
    0.0, 
    -0.548
   ]
  }, 
  "textCont16thBeamLongStem": {
   "bBoxNE": [
    1.348, 
    3.804
   ], 
   "bBoxSW": [
    0.0, 
    2.544
   ]
  }, 
  "textCont16thBeamShortStem": {
   "bBoxNE": [
    1.348, 
    3.04
   ], 
   "bBoxSW": [
    0.0, 
    1.78
   ]
  }, 
  "textCont32ndBeamLongStem": {
   "bBoxNE": [
    1.348, 
    3.804
   ], 
   "bBoxSW": [
    0.0, 
    1.78
   ]
  }, 
  "textCont8thBeamLongStem": {
   "bBoxNE": [
    1.348, 
    3.8
   ], 
   "bBoxSW": [
    0.0, 
    3.3
   ]
  }, 
  "textCont8thBeamShortStem": {
   "bBoxNE": [
    1.348, 
    3.04
   ], 
   "bBoxSW": [
    -0.004, 
    2.54
   ]
  }, 
  "textTie": {
   "bBoxNE": [
    1.736, 
    -0.676
   ], 
   "bBoxSW": [
    0.0, 
    -1.28
   ]
  }, 
  "textTuplet3LongStem": {
   "bBoxNE": [
    0.808, 
    6.228
   ], 
   "bBoxSW": [
    0.0, 
    4.048
   ]
  }, 
  "textTuplet3ShortStem": {
   "bBoxNE": [
    0.808, 
    5.148
   ], 
   "bBoxSW": [
    0.0, 
    2.968
   ]
  }, 
  "textTupletBracketEndLongStem": {
   "bBoxNE": [
    1.688, 
    5.444
   ], 
   "bBoxSW": [
    0.0, 
    3.828
   ]
  }, 
  "textTupletBracketEndShortStem": {
   "bBoxNE": [
    1.688, 
    4.364
   ], 
   "bBoxSW": [
    0.0, 
    2.748
   ]
  }, 
  "textTupletBracketStartLongStem": {
   "bBoxNE": [
    1.688, 
    5.444
   ], 
   "bBoxSW": [
    0.0, 
    3.828
   ]
  }, 
  "textTupletBracketStartShortStem": {
   "bBoxNE": [
    1.688, 
    4.364
   ], 
   "bBoxSW": [
    0.0, 
    2.748
   ]
  }, 
  "timeSig0": {
   "bBoxNE": [
    1.42, 
    1.164
   ], 
   "bBoxSW": [
    0.14, 
    -1.168
   ]
  }, 
  "timeSig1": {
   "bBoxNE": [
    1.196, 
    1.184
   ], 
   "bBoxSW": [
    0.16, 
    -1.168
   ]
  }, 
  "timeSig2": {
   "bBoxNE": [
    1.412, 
    1.168
   ], 
   "bBoxSW": [
    0.148, 
    -1.168
   ]
  }, 
  "timeSig3": {
   "bBoxNE": [
    1.388, 
    1.164
   ], 
   "bBoxSW": [
    0.084, 
    -1.168
   ]
  }, 
  "timeSig4": {
   "bBoxNE": [
    1.592, 
    1.18
   ], 
   "bBoxSW": [
    0.096, 
    -1.168
   ]
  }, 
  "timeSig5": {
   "bBoxNE": [
    1.368, 
    1.164
   ], 
   "bBoxSW": [
    0.108, 
    -1.16
   ]
  }, 
  "timeSig6": {
   "bBoxNE": [
    1.424, 
    1.184
   ], 
   "bBoxSW": [
    0.14, 
    -1.16
   ]
  }, 
  "timeSig7": {
   "bBoxNE": [
    1.388, 
    1.18
   ], 
   "bBoxSW": [
    0.128, 
    -1.16
   ]
  }, 
  "timeSig8": {
   "bBoxNE": [
    1.468, 
    1.168
   ], 
   "bBoxSW": [
    0.096, 
    -1.168
   ]
  }, 
  "timeSig9": {
   "bBoxNE": [
    1.392, 
    1.168
   ], 
   "bBoxSW": [
    0.076, 
    -1.172
   ]
  }, 
  "timeSigComma": {
   "bBoxNE": [
    0.624, 
    0.704
   ], 
   "bBoxSW": [
    0.04, 
    -0.644
   ]
  }, 
  "timeSigCommon": {
   "bBoxNE": [
    1.612, 
    1.392
   ], 
   "bBoxSW": [
    0.0, 
    -1.116
   ]
  }, 
  "timeSigCutCommon": {
   "bBoxNE": [
    1.628, 
    2.536
   ], 
   "bBoxSW": [
    0.0, 
    -2.084
   ]
  }, 
  "timeSigEquals": {
   "bBoxNE": [
    1.708, 
    0.568
   ], 
   "bBoxSW": [
    0.0, 
    -0.632
   ]
  }, 
  "timeSigMultiply": {
   "bBoxNE": [
    1.676, 
    1.312
   ], 
   "bBoxSW": [
    0.0, 
    -1.312
   ]
  }, 
  "timeSigParensLeft": {
   "bBoxNE": [
    2.08, 
    2.608
   ], 
   "bBoxSW": [
    0.0, 
    -2.648
   ]
  }, 
  "timeSigParensLeftSmall": {
   "bBoxNE": [
    0.476, 
    1.088
   ], 
   "bBoxSW": [
    0.0, 
    -1.104
   ]
  }, 
  "timeSigParensRight": {
   "bBoxNE": [
    1.616, 
    2.62
   ], 
   "bBoxSW": [
    0.076, 
    -2.676
   ]
  }, 
  "timeSigParensRightSmall": {
   "bBoxNE": [
    0.46, 
    1.096
   ], 
   "bBoxSW": [
    0.0, 
    -1.096
   ]
  }, 
  "timeSigPlus": {
   "bBoxNE": [
    1.46, 
    0.82
   ], 
   "bBoxSW": [
    0.0, 
    -0.816
   ]
  }, 
  "timeSigX": {
   "bBoxNE": [
    2.096, 
    1.648
   ], 
   "bBoxSW": [
    0.0, 
    -1.648
   ]
  }, 
  "tremolo1": {
   "bBoxNE": [
    0.708, 
    0.424
   ], 
   "bBoxSW": [
    -0.704, 
    -0.42
   ]
  }, 
  "tremolo2": {
   "bBoxNE": [
    0.712, 
    0.7
   ], 
   "bBoxSW": [
    -0.712, 
    -0.696
   ]
  }, 
  "tremolo3": {
   "bBoxNE": [
    0.716, 
    1.0
   ], 
   "bBoxSW": [
    -0.72, 
    -1.0
   ]
  }, 
  "tremolo4": {
   "bBoxNE": [
    0.728, 
    1.284
   ], 
   "bBoxSW": [
    -0.732, 
    -1.284
   ]
  }, 
  "tremolo5": {
   "bBoxNE": [
    0.716, 
    1.624
   ], 
   "bBoxSW": [
    -0.72, 
    -1.624
   ]
  }, 
  "tremoloFingered1": {
   "bBoxNE": [
    0.708, 
    0.424
   ], 
   "bBoxSW": [
    -0.704, 
    -0.42
   ]
  }, 
  "tremoloFingered2": {
   "bBoxNE": [
    0.712, 
    0.7
   ], 
   "bBoxSW": [
    -0.712, 
    -0.696
   ]
  }, 
  "tremoloFingered3": {
   "bBoxNE": [
    0.716, 
    1.0
   ], 
   "bBoxSW": [
    -0.72, 
    -1.0
   ]
  }, 
  "tremoloFingered4": {
   "bBoxNE": [
    0.728, 
    1.284
   ], 
   "bBoxSW": [
    -0.732, 
    -1.284
   ]
  }, 
  "tremoloFingered5": {
   "bBoxNE": [
    0.716, 
    1.624
   ], 
   "bBoxSW": [
    -0.72, 
    -1.624
   ]
  }, 
  "tuplet0": {
   "bBoxNE": [
    0.876, 
    1.404
   ], 
   "bBoxSW": [
    0.004, 
    0.0
   ]
  }, 
  "tuplet1": {
   "bBoxNE": [
    0.692, 
    1.416
   ], 
   "bBoxSW": [
    0.072, 
    0.0
   ]
  }, 
  "tuplet2": {
   "bBoxNE": [
    0.916, 
    1.404
   ], 
   "bBoxSW": [
    0.016, 
    0.0
   ]
  }, 
  "tuplet3": {
   "bBoxNE": [
    0.932, 
    1.404
   ], 
   "bBoxSW": [
    -0.036, 
    0.0
   ]
  }, 
  "tuplet4": {
   "bBoxNE": [
    0.94, 
    1.412
   ], 
   "bBoxSW": [
    0.044, 
    0.0
   ]
  }, 
  "tuplet5": {
   "bBoxNE": [
    0.864, 
    1.392
   ], 
   "bBoxSW": [
    0.016, 
    -0.004
   ]
  }, 
  "tuplet6": {
   "bBoxNE": [
    0.86, 
    1.396
   ], 
   "bBoxSW": [
    0.044, 
    -0.008
   ]
  }, 
  "tuplet7": {
   "bBoxNE": [
    0.892, 
    1.392
   ], 
   "bBoxSW": [
    0.012, 
    -0.008
   ]
  }, 
  "tuplet8": {
   "bBoxNE": [
    0.924, 
    1.404
   ], 
   "bBoxSW": [
    -0.008, 
    0.0
   ]
  }, 
  "tuplet9": {
   "bBoxNE": [
    0.924, 
    1.404
   ], 
   "bBoxSW": [
    0.08, 
    0.0
   ]
  }, 
  "tupletColon": {
   "bBoxNE": [
    0.668, 
    1.212
   ], 
   "bBoxSW": [
    0.064, 
    0.216
   ]
  }, 
  "unpitchedPercussionClef1": {
   "bBoxNE": [
    0.512, 
    1.28
   ], 
   "bBoxSW": [
    0.0, 
    -1.14
   ]
  }, 
  "unpitchedPercussionClef2": {
   "bBoxNE": [
    1.016, 
    1.792
   ], 
   "bBoxSW": [
    0.0, 
    -1.776
   ]
  }, 
  "wiggleGlissando": {
   "bBoxNE": [
    2.492, 
    0.812
   ], 
   "bBoxSW": [
    -0.116, 
    -0.008
   ]
  }, 
  "wiggleTrill": {
   "bBoxNE": [
    2.492, 
    0.996
   ], 
   "bBoxSW": [
    -0.116, 
    0.176
   ]
  }
 }, 
 "glyphsWithAnchors": {
  "U+F612": {
   "stemDownNW": [
    0.0, 
    -0.252
   ], 
   "stemUpSE": [
    1.52, 
    0.092
   ]
  }, 
  "U+F614": {
   "stemDownNW": [
    0.004, 
    -0.156
   ], 
   "stemUpSE": [
    0.896, 
    0.332
   ]
  }, 
  "U+F615": {
   "stemDownNW": [
    0.0, 
    -0.168
   ], 
   "stemUpSE": [
    0.968, 
    0.36
   ]
  }, 
  "U+F79E": {
   "stemDownNW": [
    0.0, 
    -0.132
   ], 
   "stemUpSE": [
    1.264, 
    0.124
   ]
  }, 
  "U+F7AC": {
   "stemDownNW": [
    0.0, 
    -0.648
   ], 
   "stemUpSE": [
    0.868, 
    0.672
   ]
  }, 
  "U+F8D7": {
   "stemDownNW": [
    0.0, 
    -0.056
   ], 
   "stemUpSE": [
    1.652, 
    0.04
   ]
  }, 
  "U+F8D8": {
   "stemDownNW": [
    0.0, 
    -0.28
   ], 
   "stemUpSE": [
    1.44, 
    0.216
   ]
  }, 
  "U+F8D9": {
   "stemDownNW": [
    0.0, 
    -0.328
   ], 
   "stemUpSE": [
    1.08, 
    0.204
   ]
  }, 
  "U+F8DA": {
   "stemDownNW": [
    0.0, 
    -0.092
   ], 
   "stemUpSE": [
    1.268, 
    0.164
   ]
  }, 
  "U+F8DB": {
   "stemDownNW": [
    0.0, 
    -0.092
   ], 
   "stemUpSE": [
    1.268, 
    0.164
   ]
  }, 
  "U+F8DC": {
   "stemDownNW": [
    0.0, 
    -0.252
   ], 
   "stemUpSE": [
    1.52, 
    0.092
   ]
  }, 
  "U+F8DD": {
   "stemDownNW": [
    0.0, 
    -0.648
   ], 
   "stemUpSE": [
    0.86, 
    0.672
   ]
  }, 
  "U+F8DE": {
   "stemDownNW": [
    0.0, 
    -0.648
   ], 
   "stemUpSE": [
    0.868, 
    0.672
   ]
  }, 
  "U+F8DF": {
   "stemDownNW": [
    0.02, 
    -0.384
   ], 
   "stemUpSE": [
    0.976, 
    0.344
   ]
  }, 
  "U+F8E0": {
   "stemDownNW": [
    0.004, 
    -0.168
   ], 
   "stemUpSE": [
    0.972, 
    0.36
   ]
  }, 
  "U+F8E1": {
   "stemDownNW": [
    0.0, 
    -0.416
   ], 
   "stemUpSE": [
    1.18, 
    -0.372
   ]
  }, 
  "U+F8E2": {
   "stemDownNW": [
    0.0, 
    0.312
   ], 
   "stemUpSE": [
    1.272, 
    0.304
   ]
  }, 
  "U+F8E3": {
   "stemDownNW": [
    0.0, 
    -0.084
   ], 
   "stemUpSE": [
    1.268, 
    0.024
   ]
  }, 
  "U+F8E4": {
   "stemDownNW": [
    -0.004, 
    0.224
   ], 
   "stemUpSE": [
    1.272, 
    0.424
   ]
  }, 
  "U+F8E5": {
   "stemDownNW": [
    0.004, 
    -0.168
   ], 
   "stemUpSE": [
    1.288, 
    0.416
   ]
  }, 
  "U+F8E6": {
   "stemDownNW": [
    0.0, 
    0.156
   ], 
   "stemUpSE": [
    1.288, 
    0.176
   ]
  }, 
  "U+F8E7": {
   "stemDownNW": [
    0.0, 
    -0.416
   ], 
   "stemUpSE": [
    1.244, 
    -0.372
   ]
  }, 
  "U+F8E8": {
   "stemDownNW": [
    0.0, 
    -0.436
   ], 
   "stemUpSE": [
    1.284, 
    0.076
   ]
  }, 
  "U+F8E9": {
   "stemDownNW": [
    0.0, 
    0.352
   ], 
   "stemUpSE": [
    1.14, 
    0.432
   ]
  }, 
  "U+F8EA": {
   "stemDownNW": [
    0.0, 
    -0.328
   ], 
   "stemUpSE": [
    1.084, 
    0.204
   ]
  }, 
  "U+F8EB": {
   "stemDownNW": [
    0.0, 
    -0.328
   ], 
   "stemUpSE": [
    1.08, 
    0.204
   ]
  }, 
  "U+F8EC": {
   "stemDownNW": [
    0.0, 
    -0.028
   ], 
   "stemUpSE": [
    1.092, 
    -0.016
   ]
  }, 
  "U+F8ED": {
   "stemDownNW": [
    0.0, 
    -0.108
   ], 
   "stemUpSE": [
    1.048, 
    0.124
   ]
  }, 
  "U+F8EE": {
   "stemDownNW": [
    0.0, 
    0.128
   ], 
   "stemUpSE": [
    1.228, 
    0.34
   ]
  }, 
  "U+F8EF": {
   "stemDownNW": [
    0.0, 
    -0.412
   ], 
   "stemUpSE": [
    1.136, 
    -0.336
   ]
  }, 
  "U+F8F0": {
   "stemDownNW": [
    0.0, 
    -0.084
   ], 
   "stemUpSE": [
    1.268, 
    0.024
   ]
  }, 
  "U+F8F1": {
   "stemDownNW": [
    0.0, 
    0.224
   ], 
   "stemUpSE": [
    1.276, 
    0.424
   ]
  }, 
  "U+F8F2": {
   "stemDownNW": [
    0.0, 
    0.156
   ], 
   "stemUpSE": [
    1.288, 
    0.176
   ]
  }, 
  "U+F8F3": {
   "stemDownNW": [
    0.0, 
    -0.436
   ], 
   "stemUpSE": [
    1.284, 
    0.076
   ]
  }, 
  "U+F8F4": {
   "stemDownNW": [
    0.0, 
    0.012
   ], 
   "stemUpSE": [
    0.896, 
    0.332
   ]
  }, 
  "U+F8F5": {
   "stemDownNW": [
    0.0, 
    -0.416
   ], 
   "stemUpSE": [
    1.244, 
    -0.372
   ]
  }, 
  "U+F8F6": {
   "stemDownNW": [
    0.0, 
    -0.28
   ], 
   "stemUpSE": [
    1.444, 
    0.204
   ]
  }, 
  "U+F8F7": {
   "stemDownNW": [
    0.0, 
    -0.28
   ], 
   "stemUpSE": [
    1.344, 
    0.208
   ]
  }, 
  "U+F8F8": {
   "stemDownNW": [
    0.0, 
    -0.04
   ], 
   "stemUpSE": [
    1.14, 
    0.0
   ]
  }, 
  "U+F8F9": {
   "stemDownNW": [
    -0.004, 
    -0.16
   ], 
   "stemUpSE": [
    1.28, 
    0.348
   ]
  }, 
  "U+F8FA": {
   "stemDownNW": [
    0.0, 
    0.336
   ], 
   "stemUpSE": [
    1.14, 
    0.412
   ]
  }, 
  "U+F8FB": {
   "stemDownNW": [
    0.0, 
    -0.168
   ], 
   "stemUpSE": [
    0.796, 
    0.052
   ]
  }, 
  "U+F8FC": {
   "stemDownNW": [
    0.0, 
    0.024
   ], 
   "stemUpSE": [
    1.996, 
    -0.004
   ]
  }, 
  "accidentalQuarterToneFlat4": {
   "cutOutSE": [
    1.268, 
    -0.44
   ]
  }, 
  "flag16thDown": {
   "stemDownSW": [
    0.0, 
    0.128
   ]
  }, 
  "flag16thUp": {
   "stemUpNW": [
    0.0, 
    -0.088
   ]
  }, 
  "flag8thDown": {
   "graceNoteSlashNW": [
    -0.456, 
    2.44
   ], 
   "graceNoteSlashSE": [
    1.524, 
    0.932
   ], 
   "stemDownSW": [
    0.0, 
    0.132
   ]
  }, 
  "flag8thUp": {
   "graceNoteSlashNE": [
    1.284, 
    -0.796
   ], 
   "graceNoteSlashSW": [
    -0.644, 
    -2.456
   ], 
   "stemUpNW": [
    0.0, 
    -0.04
   ]
  }, 
  "metNoteDoubleWhole": {
   "noteheadOrigin": [
    0.336, 
    -0.184
   ]
  }, 
  "noteheadBlack": {
   "stemDownNW": [
    0.0, 
    -0.24
   ], 
   "stemUpSE": [
    1.348, 
    0.176
   ]
  }, 
  "noteheadBlackParens": {
   "stemDownNW": [
    -0.004, 
    -0.328
   ], 
   "stemUpSE": [
    1.08, 
    0.204
   ]
  }, 
  "noteheadCircleX": {
   "stemDownNW": [
    0.0, 
    -0.132
   ], 
   "stemUpSE": [
    1.264, 
    0.124
   ]
  }, 
  "noteheadCircledBlackLarge": {
   "stemDownNW": [
    0.0, 
    -0.328
   ], 
   "stemUpSE": [
    1.08, 
    0.204
   ]
  }, 
  "noteheadCircledHalfLarge": {
   "stemDownNW": [
    0.0, 
    -0.28
   ], 
   "stemUpSE": [
    1.344, 
    0.208
   ]
  }, 
  "noteheadDiamondBlack": {
   "stemDownNW": [
    0.0, 
    -0.028
   ], 
   "stemUpSE": [
    1.092, 
    -0.016
   ]
  }, 
  "noteheadDiamondBlackWide": {
   "stemDownNW": [
    0.0, 
    -0.084
   ], 
   "stemUpSE": [
    1.268, 
    0.024
   ]
  }, 
  "noteheadDiamondHalfOld": {
   "stemDownNW": [
    0.0, 
    0.012
   ], 
   "stemUpSE": [
    1.08, 
    -0.004
   ]
  }, 
  "noteheadDiamondHalfWide": {
   "stemDownNW": [
    0.0, 
    -0.084
   ], 
   "stemUpSE": [
    1.268, 
    0.024
   ]
  }, 
  "noteheadDoubleWhole": {
   "noteheadOrigin": [
    0.336, 
    -0.184
   ]
  }, 
  "noteheadHalf": {
   "stemDownNW": [
    0.0, 
    -0.28
   ], 
   "stemUpSE": [
    1.56, 
    0.216
   ]
  }, 
  "noteheadHalfParens": {
   "stemDownNW": [
    0.0, 
    -0.28
   ], 
   "stemUpSE": [
    1.444, 
    0.204
   ]
  }, 
  "noteheadMoonBlack": {
   "stemDownNW": [
    0.0, 
    0.312
   ], 
   "stemUpSE": [
    1.272, 
    0.304
   ]
  }, 
  "noteheadMoonWhite": {
   "stemDownNW": [
    0.0, 
    0.128
   ], 
   "stemUpSE": [
    1.228, 
    0.34
   ]
  }, 
  "noteheadPlusBlack": {
   "stemDownNW": [
    0.0, 
    -0.108
   ], 
   "stemUpSE": [
    1.048, 
    0.124
   ]
  }, 
  "noteheadSlashDiamondWhite": {
   "stemDownNW": [
    0.0, 
    -0.148
   ], 
   "stemUpSE": [
    1.752, 
    0.376
   ]
  }, 
  "noteheadSlashHorizontalEnds": {
   "stemDownNW": [
    0.0, 
    -0.776
   ], 
   "stemUpSE": [
    2.084, 
    0.788
   ]
  }, 
  "noteheadSlashVerticalEnds": {
   "stemDownNW": [
    0.0, 
    -0.576
   ], 
   "stemUpSE": [
    1.316, 
    0.448
   ]
  }, 
  "noteheadSlashVerticalEndsSmall": {
   "stemDownNW": [
    0.0, 
    -0.576
   ], 
   "stemUpSE": [
    1.336, 
    0.436
   ]
  }, 
  "noteheadSlashWhiteHalf": {
   "stemDownNW": [
    0.0, 
    -1.072
   ], 
   "stemUpSE": [
    3.848, 
    0.996
   ]
  }, 
  "noteheadSlashedBlack1": {
   "stemDownNW": [
    0.0, 
    -0.364
   ], 
   "stemUpSE": [
    1.416, 
    0.212
   ]
  }, 
  "noteheadSlashedBlack2": {
   "stemDownNW": [
    0.0, 
    -0.28
   ], 
   "stemUpSE": [
    1.44, 
    0.204
   ]
  }, 
  "noteheadSlashedHalf1": {
   "stemDownNW": [
    0.0, 
    -0.28
   ], 
   "stemUpSE": [
    1.56, 
    0.216
   ]
  }, 
  "noteheadSlashedHalf2": {
   "stemDownNW": [
    0.0, 
    -0.28
   ], 
   "stemUpSE": [
    1.56, 
    0.216
   ]
  }, 
  "noteheadSquareBlack": {
   "stemDownNW": [
    0.004, 
    -0.168
   ], 
   "stemUpSE": [
    1.288, 
    0.416
   ]
  }, 
  "noteheadSquareWhite": {
   "stemDownNW": [
    0.0, 
    -0.16
   ], 
   "stemUpSE": [
    1.284, 
    0.36
   ]
  }, 
  "noteheadTriangleDownBlack": {
   "stemDownNW": [
    0.0, 
    0.352
   ], 
   "stemUpSE": [
    1.14, 
    0.432
   ]
  }, 
  "noteheadTriangleDownWhite": {
   "stemDownNW": [
    0.0, 
    0.336
   ], 
   "stemUpSE": [
    1.14, 
    0.412
   ]
  }, 
  "noteheadTriangleLeftBlack": {
   "stemDownNW": [
    0.0, 
    -0.416
   ], 
   "stemUpSE": [
    1.244, 
    -0.372
   ]
  }, 
  "noteheadTriangleLeftWhite": {
   "stemDownNW": [
    0.0, 
    -0.416
   ], 
   "stemUpSE": [
    1.244, 
    -0.372
   ]
  }, 
  "noteheadTriangleRightBlack": {
   "stemDownNW": [
    0.0, 
    -0.436
   ], 
   "stemUpSE": [
    1.272, 
    0.424
   ]
  }, 
  "noteheadTriangleRightWhite": {
   "stemDownNW": [
    0.0, 
    -0.436
   ], 
   "stemUpSE": [
    1.272, 
    0.424
   ]
  }, 
  "noteheadTriangleRoundDownBlack": {
   "stemDownNW": [
    0.0, 
    0.156
   ], 
   "stemUpSE": [
    1.288, 
    0.176
   ]
  }, 
  "noteheadTriangleRoundDownWhite": {
   "stemDownNW": [
    0.0, 
    0.156
   ], 
   "stemUpSE": [
    1.288, 
    0.176
   ]
  }, 
  "noteheadTriangleUpBlack": {
   "stemDownNW": [
    0.0, 
    -0.416
   ], 
   "stemUpSE": [
    1.18, 
    -0.372
   ]
  }, 
  "noteheadTriangleUpRightBlack": {
   "stemDownNW": [
    0.0, 
    0.224
   ], 
   "stemUpSE": [
    1.276, 
    0.424
   ]
  }, 
  "noteheadTriangleUpRightWhite": {
   "stemDownNW": [
    0.0, 
    0.224
   ], 
   "stemUpSE": [
    1.276, 
    0.424
   ]
  }, 
  "noteheadTriangleUpWhite": {
   "stemDownNW": [
    0.0, 
    -0.412
   ], 
   "stemUpSE": [
    1.136, 
    -0.336
   ]
  }, 
  "noteheadVoidWithX": {
   "stemDownNW": [
    0.0, 
    -0.092
   ], 
   "stemUpSE": [
    1.268, 
    0.164
   ]
  }, 
  "noteheadXBlack": {
   "stemDownNW": [
    0.0, 
    -0.632
   ], 
   "stemUpSE": [
    1.116, 
    0.712
   ]
  }, 
  "noteheadXOrnate": {
   "stemDownNW": [
    0.02, 
    -0.384
   ], 
   "stemUpSE": [
    0.976, 
    0.344
   ]
  }, 
  "wiggleGlissando": {
   "repeatOffset": [
    2.076, 
    0.0
   ]
  }, 
  "wiggleTrill": {
   "repeatOffset": [
    2.076, 
    0.0
   ]
  }
 }, 
 "optionalGlyphs": {
  "U+F404": {
   "classes": [], 
   "codepoint": "U+F404"
  }, 
  "U+F405": {
   "classes": [], 
   "codepoint": "U+F405"
  }, 
  "U+F612": {
   "classes": [], 
   "codepoint": "U+F612"
  }, 
  "U+F614": {
   "classes": [], 
   "codepoint": "U+F614"
  }, 
  "U+F615": {
   "classes": [], 
   "codepoint": "U+F615"
  }, 
  "U+F67C": {
   "classes": [], 
   "codepoint": "U+F67C"
  }, 
  "U+F700": {
   "classes": [], 
   "codepoint": "U+F700"
  }, 
  "U+F701": {
   "classes": [], 
   "codepoint": "U+F701"
  }, 
  "U+F704": {
   "classes": [], 
   "codepoint": "U+F704"
  }, 
  "U+F706": {
   "classes": [], 
   "codepoint": "U+F706"
  }, 
  "U+F707": {
   "classes": [], 
   "codepoint": "U+F707"
  }, 
  "U+F710": {
   "classes": [], 
   "codepoint": "U+F710"
  }, 
  "U+F714": {
   "classes": [], 
   "codepoint": "U+F714"
  }, 
  "U+F715": {
   "classes": [], 
   "codepoint": "U+F715"
  }, 
  "U+F716": {
   "classes": [], 
   "codepoint": "U+F716"
  }, 
  "U+F717": {
   "classes": [], 
   "codepoint": "U+F717"
  }, 
  "U+F718": {
   "classes": [], 
   "codepoint": "U+F718"
  }, 
  "U+F719": {
   "classes": [], 
   "codepoint": "U+F719"
  }, 
  "U+F720": {
   "classes": [], 
   "codepoint": "U+F720"
  }, 
  "U+F721": {
   "classes": [], 
   "codepoint": "U+F721"
  }, 
  "U+F722": {
   "classes": [], 
   "codepoint": "U+F722"
  }, 
  "U+F723": {
   "classes": [], 
   "codepoint": "U+F723"
  }, 
  "U+F724": {
   "classes": [], 
   "codepoint": "U+F724"
  }, 
  "U+F725": {
   "classes": [], 
   "codepoint": "U+F725"
  }, 
  "U+F726": {
   "classes": [], 
   "codepoint": "U+F726"
  }, 
  "U+F727": {
   "classes": [], 
   "codepoint": "U+F727"
  }, 
  "U+F728": {
   "classes": [], 
   "codepoint": "U+F728"
  }, 
  "U+F729": {
   "classes": [], 
   "codepoint": "U+F729"
  }, 
  "U+F72A": {
   "classes": [], 
   "codepoint": "U+F72A"
  }, 
  "U+F72B": {
   "classes": [], 
   "codepoint": "U+F72B"
  }, 
  "U+F72C": {
   "classes": [], 
   "codepoint": "U+F72C"
  }, 
  "U+F72D": {
   "classes": [], 
   "codepoint": "U+F72D"
  }, 
  "U+F72E": {
   "classes": [], 
   "codepoint": "U+F72E"
  }, 
  "U+F72F": {
   "classes": [], 
   "codepoint": "U+F72F"
  }, 
  "U+F730": {
   "classes": [], 
   "codepoint": "U+F730"
  }, 
  "U+F731": {
   "classes": [], 
   "codepoint": "U+F731"
  }, 
  "U+F732": {
   "classes": [], 
   "codepoint": "U+F732"
  }, 
  "U+F733": {
   "classes": [], 
   "codepoint": "U+F733"
  }, 
  "U+F734": {
   "classes": [], 
   "codepoint": "U+F734"
  }, 
  "U+F735": {
   "classes": [], 
   "codepoint": "U+F735"
  }, 
  "U+F736": {
   "classes": [], 
   "codepoint": "U+F736"
  }, 
  "U+F737": {
   "classes": [], 
   "codepoint": "U+F737"
  }, 
  "U+F738": {
   "classes": [], 
   "codepoint": "U+F738"
  }, 
  "U+F739": {
   "classes": [], 
   "codepoint": "U+F739"
  }, 
  "U+F73A": {
   "classes": [], 
   "codepoint": "U+F73A"
  }, 
  "U+F73B": {
   "classes": [], 
   "codepoint": "U+F73B"
  }, 
  "U+F73C": {
   "classes": [], 
   "codepoint": "U+F73C"
  }, 
  "U+F73D": {
   "classes": [], 
   "codepoint": "U+F73D"
  }, 
  "U+F73E": {
   "classes": [], 
   "codepoint": "U+F73E"
  }, 
  "U+F740": {
   "classes": [], 
   "codepoint": "U+F740"
  }, 
  "U+F741": {
   "classes": [], 
   "codepoint": "U+F741"
  }, 
  "U+F742": {
   "classes": [], 
   "codepoint": "U+F742"
  }, 
  "U+F743": {
   "classes": [], 
   "codepoint": "U+F743"
  }, 
  "U+F744": {
   "classes": [], 
   "codepoint": "U+F744"
  }, 
  "U+F745": {
   "classes": [], 
   "codepoint": "U+F745"
  }, 
  "U+F746": {
   "classes": [], 
   "codepoint": "U+F746"
  }, 
  "U+F747": {
   "classes": [], 
   "codepoint": "U+F747"
  }, 
  "U+F748": {
   "classes": [], 
   "codepoint": "U+F748"
  }, 
  "U+F749": {
   "classes": [], 
   "codepoint": "U+F749"
  }, 
  "U+F74A": {
   "classes": [], 
   "codepoint": "U+F74A"
  }, 
  "U+F750": {
   "classes": [], 
   "codepoint": "U+F750"
  }, 
  "U+F751": {
   "classes": [], 
   "codepoint": "U+F751"
  }, 
  "U+F752": {
   "classes": [], 
   "codepoint": "U+F752"
  }, 
  "U+F753": {
   "classes": [], 
   "codepoint": "U+F753"
  }, 
  "U+F756": {
   "classes": [], 
   "codepoint": "U+F756"
  }, 
  "U+F757": {
   "classes": [], 
   "codepoint": "U+F757"
  }, 
  "U+F758": {
   "classes": [], 
   "codepoint": "U+F758"
  }, 
  "U+F759": {
   "classes": [], 
   "codepoint": "U+F759"
  }, 
  "U+F75A": {
   "classes": [], 
   "codepoint": "U+F75A"
  }, 
  "U+F75B": {
   "classes": [], 
   "codepoint": "U+F75B"
  }, 
  "U+F75C": {
   "classes": [], 
   "codepoint": "U+F75C"
  }, 
  "U+F75F": {
   "classes": [], 
   "codepoint": "U+F75F"
  }, 
  "U+F760": {
   "classes": [], 
   "codepoint": "U+F760"
  }, 
  "U+F761": {
   "classes": [], 
   "codepoint": "U+F761"
  }, 
  "U+F762": {
   "classes": [], 
   "codepoint": "U+F762"
  }, 
  "U+F763": {
   "classes": [], 
   "codepoint": "U+F763"
  }, 
  "U+F764": {
   "classes": [], 
   "codepoint": "U+F764"
  }, 
  "U+F765": {
   "classes": [], 
   "codepoint": "U+F765"
  }, 
  "U+F766": {
   "classes": [], 
   "codepoint": "U+F766"
  }, 
  "U+F767": {
   "classes": [], 
   "codepoint": "U+F767"
  }, 
  "U+F768": {
   "classes": [], 
   "codepoint": "U+F768"
  }, 
  "U+F769": {
   "classes": [], 
   "codepoint": "U+F769"
  }, 
  "U+F79E": {
   "classes": [], 
   "codepoint": "U+F79E"
  }, 
  "U+F7AC": {
   "classes": [], 
   "codepoint": "U+F7AC"
  }, 
  "U+F7C4": {
   "classes": [], 
   "codepoint": "U+F7C4"
  }, 
  "U+F7C5": {
   "classes": [], 
   "codepoint": "U+F7C5"
  }, 
  "U+F7C6": {
   "classes": [], 
   "codepoint": "U+F7C6"
  }, 
  "U+F7C7": {
   "classes": [], 
   "codepoint": "U+F7C7"
  }, 
  "U+F7C8": {
   "classes": [], 
   "codepoint": "U+F7C8"
  }, 
  "U+F800": {
   "classes": [], 
   "codepoint": "U+F800"
  }, 
  "U+F801": {
   "classes": [], 
   "codepoint": "U+F801"
  }, 
  "U+F802": {
   "classes": [], 
   "codepoint": "U+F802"
  }, 
  "U+F803": {
   "classes": [], 
   "codepoint": "U+F803"
  }, 
  "U+F804": {
   "classes": [], 
   "codepoint": "U+F804"
  }, 
  "U+F805": {
   "classes": [], 
   "codepoint": "U+F805"
  }, 
  "U+F806": {
   "classes": [], 
   "codepoint": "U+F806"
  }, 
  "U+F807": {
   "classes": [], 
   "codepoint": "U+F807"
  }, 
  "U+F808": {
   "classes": [], 
   "codepoint": "U+F808"
  }, 
  "U+F809": {
   "classes": [], 
   "codepoint": "U+F809"
  }, 
  "U+F80A": {
   "classes": [], 
   "codepoint": "U+F80A"
  }, 
  "U+F80B": {
   "classes": [], 
   "codepoint": "U+F80B"
  }, 
  "U+F80C": {
   "classes": [], 
   "codepoint": "U+F80C"
  }, 
  "U+F80D": {
   "classes": [], 
   "codepoint": "U+F80D"
  }, 
  "U+F80E": {
   "classes": [], 
   "codepoint": "U+F80E"
  }, 
  "U+F820": {
   "classes": [], 
   "codepoint": "U+F820"
  }, 
  "U+F821": {
   "classes": [], 
   "codepoint": "U+F821"
  }, 
  "U+F822": {
   "classes": [], 
   "codepoint": "U+F822"
  }, 
  "U+F823": {
   "classes": [], 
   "codepoint": "U+F823"
  }, 
  "U+F824": {
   "classes": [], 
   "codepoint": "U+F824"
  }, 
  "U+F825": {
   "classes": [], 
   "codepoint": "U+F825"
  }, 
  "U+F826": {
   "classes": [], 
   "codepoint": "U+F826"
  }, 
  "U+F827": {
   "classes": [], 
   "codepoint": "U+F827"
  }, 
  "U+F828": {
   "classes": [], 
   "codepoint": "U+F828"
  }, 
  "U+F829": {
   "classes": [], 
   "codepoint": "U+F829"
  }, 
  "U+F82A": {
   "classes": [], 
   "codepoint": "U+F82A"
  }, 
  "U+F82B": {
   "classes": [], 
   "codepoint": "U+F82B"
  }, 
  "U+F82C": {
   "classes": [], 
   "codepoint": "U+F82C"
  }, 
  "U+F82D": {
   "classes": [], 
   "codepoint": "U+F82D"
  }, 
  "U+F82E": {
   "classes": [], 
   "codepoint": "U+F82E"
  }, 
  "U+F82F": {
   "classes": [], 
   "codepoint": "U+F82F"
  }, 
  "U+F830": {
   "classes": [], 
   "codepoint": "U+F830"
  }, 
  "U+F831": {
   "classes": [], 
   "codepoint": "U+F831"
  }, 
  "U+F832": {
   "classes": [], 
   "codepoint": "U+F832"
  }, 
  "U+F833": {
   "classes": [], 
   "codepoint": "U+F833"
  }, 
  "U+F834": {
   "classes": [], 
   "codepoint": "U+F834"
  }, 
  "U+F835": {
   "classes": [], 
   "codepoint": "U+F835"
  }, 
  "U+F836": {
   "classes": [], 
   "codepoint": "U+F836"
  }, 
  "U+F837": {
   "classes": [], 
   "codepoint": "U+F837"
  }, 
  "U+F838": {
   "classes": [], 
   "codepoint": "U+F838"
  }, 
  "U+F839": {
   "classes": [], 
   "codepoint": "U+F839"
  }, 
  "U+F83A": {
   "classes": [], 
   "codepoint": "U+F83A"
  }, 
  "U+F83B": {
   "classes": [], 
   "codepoint": "U+F83B"
  }, 
  "U+F83C": {
   "classes": [], 
   "codepoint": "U+F83C"
  }, 
  "U+F83D": {
   "classes": [], 
   "codepoint": "U+F83D"
  }, 
  "U+F83E": {
   "classes": [], 
   "codepoint": "U+F83E"
  }, 
  "U+F83F": {
   "classes": [], 
   "codepoint": "U+F83F"
  }, 
  "U+F840": {
   "classes": [], 
   "codepoint": "U+F840"
  }, 
  "U+F841": {
   "classes": [], 
   "codepoint": "U+F841"
  }, 
  "U+F842": {
   "classes": [], 
   "codepoint": "U+F842"
  }, 
  "U+F843": {
   "classes": [], 
   "codepoint": "U+F843"
  }, 
  "U+F844": {
   "classes": [], 
   "codepoint": "U+F844"
  }, 
  "U+F845": {
   "classes": [], 
   "codepoint": "U+F845"
  }, 
  "U+F846": {
   "classes": [], 
   "codepoint": "U+F846"
  }, 
  "U+F847": {
   "classes": [], 
   "codepoint": "U+F847"
  }, 
  "U+F848": {
   "classes": [], 
   "codepoint": "U+F848"
  }, 
  "U+F849": {
   "classes": [], 
   "codepoint": "U+F849"
  }, 
  "U+F84A": {
   "classes": [], 
   "codepoint": "U+F84A"
  }, 
  "U+F84B": {
   "classes": [], 
   "codepoint": "U+F84B"
  }, 
  "U+F84C": {
   "classes": [], 
   "codepoint": "U+F84C"
  }, 
  "U+F84D": {
   "classes": [], 
   "codepoint": "U+F84D"
  }, 
  "U+F84E": {
   "classes": [], 
   "codepoint": "U+F84E"
  }, 
  "U+F84F": {
   "classes": [], 
   "codepoint": "U+F84F"
  }, 
  "U+F850": {
   "classes": [], 
   "codepoint": "U+F850"
  }, 
  "U+F851": {
   "classes": [], 
   "codepoint": "U+F851"
  }, 
  "U+F852": {
   "classes": [], 
   "codepoint": "U+F852"
  }, 
  "U+F853": {
   "classes": [], 
   "codepoint": "U+F853"
  }, 
  "U+F854": {
   "classes": [], 
   "codepoint": "U+F854"
  }, 
  "U+F855": {
   "classes": [], 
   "codepoint": "U+F855"
  }, 
  "U+F856": {
   "classes": [], 
   "codepoint": "U+F856"
  }, 
  "U+F857": {
   "classes": [], 
   "codepoint": "U+F857"
  }, 
  "U+F858": {
   "classes": [], 
   "codepoint": "U+F858"
  }, 
  "U+F859": {
   "classes": [], 
   "codepoint": "U+F859"
  }, 
  "U+F85A": {
   "classes": [], 
   "codepoint": "U+F85A"
  }, 
  "U+F85B": {
   "classes": [], 
   "codepoint": "U+F85B"
  }, 
  "U+F85C": {
   "classes": [], 
   "codepoint": "U+F85C"
  }, 
  "U+F85D": {
   "classes": [], 
   "codepoint": "U+F85D"
  }, 
  "U+F85E": {
   "classes": [], 
   "codepoint": "U+F85E"
  }, 
  "U+F85F": {
   "classes": [], 
   "codepoint": "U+F85F"
  }, 
  "U+F860": {
   "classes": [], 
   "codepoint": "U+F860"
  }, 
  "U+F861": {
   "classes": [], 
   "codepoint": "U+F861"
  }, 
  "U+F862": {
   "classes": [], 
   "codepoint": "U+F862"
  }, 
  "U+F863": {
   "classes": [], 
   "codepoint": "U+F863"
  }, 
  "U+F864": {
   "classes": [], 
   "codepoint": "U+F864"
  }, 
  "U+F865": {
   "classes": [], 
   "codepoint": "U+F865"
  }, 
  "U+F866": {
   "classes": [], 
   "codepoint": "U+F866"
  }, 
  "U+F867": {
   "classes": [], 
   "codepoint": "U+F867"
  }, 
  "U+F868": {
   "classes": [], 
   "codepoint": "U+F868"
  }, 
  "U+F869": {
   "classes": [], 
   "codepoint": "U+F869"
  }, 
  "U+F86A": {
   "classes": [], 
   "codepoint": "U+F86A"
  }, 
  "U+F86B": {
   "classes": [], 
   "codepoint": "U+F86B"
  }, 
  "U+F86C": {
   "classes": [], 
   "codepoint": "U+F86C"
  }, 
  "U+F86D": {
   "classes": [], 
   "codepoint": "U+F86D"
  }, 
  "U+F86E": {
   "classes": [], 
   "codepoint": "U+F86E"
  }, 
  "U+F86F": {
   "classes": [], 
   "codepoint": "U+F86F"
  }, 
  "U+F870": {
   "classes": [], 
   "codepoint": "U+F870"
  }, 
  "U+F871": {
   "classes": [], 
   "codepoint": "U+F871"
  }, 
  "U+F872": {
   "classes": [], 
   "codepoint": "U+F872"
  }, 
  "U+F873": {
   "classes": [], 
   "codepoint": "U+F873"
  }, 
  "U+F874": {
   "classes": [], 
   "codepoint": "U+F874"
  }, 
  "U+F875": {
   "classes": [], 
   "codepoint": "U+F875"
  }, 
  "U+F876": {
   "classes": [], 
   "codepoint": "U+F876"
  }, 
  "U+F877": {
   "classes": [], 
   "codepoint": "U+F877"
  }, 
  "U+F878": {
   "classes": [], 
   "codepoint": "U+F878"
  }, 
  "U+F879": {
   "classes": [], 
   "codepoint": "U+F879"
  }, 
  "U+F87A": {
   "classes": [], 
   "codepoint": "U+F87A"
  }, 
  "U+F87B": {
   "classes": [], 
   "codepoint": "U+F87B"
  }, 
  "U+F87C": {
   "classes": [], 
   "codepoint": "U+F87C"
  }, 
  "U+F87D": {
   "classes": [], 
   "codepoint": "U+F87D"
  }, 
  "U+F87E": {
   "classes": [], 
   "codepoint": "U+F87E"
  }, 
  "U+F87F": {
   "classes": [], 
   "codepoint": "U+F87F"
  }, 
  "U+F880": {
   "classes": [], 
   "codepoint": "U+F880"
  }, 
  "U+F881": {
   "classes": [], 
   "codepoint": "U+F881"
  }, 
  "U+F882": {
   "classes": [], 
   "codepoint": "U+F882"
  }, 
  "U+F883": {
   "classes": [], 
   "codepoint": "U+F883"
  }, 
  "U+F884": {
   "classes": [], 
   "codepoint": "U+F884"
  }, 
  "U+F885": {
   "classes": [], 
   "codepoint": "U+F885"
  }, 
  "U+F886": {
   "classes": [], 
   "codepoint": "U+F886"
  }, 
  "U+F887": {
   "classes": [], 
   "codepoint": "U+F887"
  }, 
  "U+F888": {
   "classes": [], 
   "codepoint": "U+F888"
  }, 
  "U+F889": {
   "classes": [], 
   "codepoint": "U+F889"
  }, 
  "U+F88A": {
   "classes": [], 
   "codepoint": "U+F88A"
  }, 
  "U+F88B": {
   "classes": [], 
   "codepoint": "U+F88B"
  }, 
  "U+F88C": {
   "classes": [], 
   "codepoint": "U+F88C"
  }, 
  "U+F88D": {
   "classes": [], 
   "codepoint": "U+F88D"
  }, 
  "U+F88E": {
   "classes": [], 
   "codepoint": "U+F88E"
  }, 
  "U+F88F": {
   "classes": [], 
   "codepoint": "U+F88F"
  }, 
  "U+F890": {
   "classes": [], 
   "codepoint": "U+F890"
  }, 
  "U+F891": {
   "classes": [], 
   "codepoint": "U+F891"
  }, 
  "U+F892": {
   "classes": [], 
   "codepoint": "U+F892"
  }, 
  "U+F893": {
   "classes": [], 
   "codepoint": "U+F893"
  }, 
  "U+F894": {
   "classes": [], 
   "codepoint": "U+F894"
  }, 
  "U+F895": {
   "classes": [], 
   "codepoint": "U+F895"
  }, 
  "U+F896": {
   "classes": [], 
   "codepoint": "U+F896"
  }, 
  "U+F897": {
   "classes": [], 
   "codepoint": "U+F897"
  }, 
  "U+F898": {
   "classes": [], 
   "codepoint": "U+F898"
  }, 
  "U+F899": {
   "classes": [], 
   "codepoint": "U+F899"
  }, 
  "U+F89A": {
   "classes": [], 
   "codepoint": "U+F89A"
  }, 
  "U+F89B": {
   "classes": [], 
   "codepoint": "U+F89B"
  }, 
  "U+F89C": {
   "classes": [], 
   "codepoint": "U+F89C"
  }, 
  "U+F89D": {
   "classes": [], 
   "codepoint": "U+F89D"
  }, 
  "U+F89E": {
   "classes": [], 
   "codepoint": "U+F89E"
  }, 
  "U+F89F": {
   "classes": [], 
   "codepoint": "U+F89F"
  }, 
  "U+F8A0": {
   "classes": [], 
   "codepoint": "U+F8A0"
  }, 
  "U+F8A1": {
   "classes": [], 
   "codepoint": "U+F8A1"
  }, 
  "U+F8A2": {
   "classes": [], 
   "codepoint": "U+F8A2"
  }, 
  "U+F8A3": {
   "classes": [], 
   "codepoint": "U+F8A3"
  }, 
  "U+F8A4": {
   "classes": [], 
   "codepoint": "U+F8A4"
  }, 
  "U+F8A5": {
   "classes": [], 
   "codepoint": "U+F8A5"
  }, 
  "U+F8A6": {
   "classes": [], 
   "codepoint": "U+F8A6"
  }, 
  "U+F8A7": {
   "classes": [], 
   "codepoint": "U+F8A7"
  }, 
  "U+F8A8": {
   "classes": [], 
   "codepoint": "U+F8A8"
  }, 
  "U+F8A9": {
   "classes": [], 
   "codepoint": "U+F8A9"
  }, 
  "U+F8AA": {
   "classes": [], 
   "codepoint": "U+F8AA"
  }, 
  "U+F8AB": {
   "classes": [], 
   "codepoint": "U+F8AB"
  }, 
  "U+F8AC": {
   "classes": [], 
   "codepoint": "U+F8AC"
  }, 
  "U+F8AD": {
   "classes": [], 
   "codepoint": "U+F8AD"
  }, 
  "U+F8AE": {
   "classes": [], 
   "codepoint": "U+F8AE"
  }, 
  "U+F8B0": {
   "classes": [], 
   "codepoint": "U+F8B0"
  }, 
  "U+F8B1": {
   "classes": [], 
   "codepoint": "U+F8B1"
  }, 
  "U+F8B2": {
   "classes": [], 
   "codepoint": "U+F8B2"
  }, 
  "U+F8B3": {
   "classes": [], 
   "codepoint": "U+F8B3"
  }, 
  "U+F8B4": {
   "classes": [], 
   "codepoint": "U+F8B4"
  }, 
  "U+F8B5": {
   "classes": [], 
   "codepoint": "U+F8B5"
  }, 
  "U+F8B6": {
   "classes": [], 
   "codepoint": "U+F8B6"
  }, 
  "U+F8B7": {
   "classes": [], 
   "codepoint": "U+F8B7"
  }, 
  "U+F8B8": {
   "classes": [], 
   "codepoint": "U+F8B8"
  }, 
  "U+F8B9": {
   "classes": [], 
   "codepoint": "U+F8B9"
  }, 
  "U+F8BA": {
   "classes": [], 
   "codepoint": "U+F8BA"
  }, 
  "U+F8BB": {
   "classes": [], 
   "codepoint": "U+F8BB"
  }, 
  "U+F8BC": {
   "classes": [], 
   "codepoint": "U+F8BC"
  }, 
  "U+F8BD": {
   "classes": [], 
   "codepoint": "U+F8BD"
  }, 
  "U+F8BE": {
   "classes": [], 
   "codepoint": "U+F8BE"
  }, 
  "U+F8BF": {
   "classes": [], 
   "codepoint": "U+F8BF"
  }, 
  "U+F8C0": {
   "classes": [], 
   "codepoint": "U+F8C0"
  }, 
  "U+F8C1": {
   "classes": [], 
   "codepoint": "U+F8C1"
  }, 
  "U+F8C2": {
   "classes": [], 
   "codepoint": "U+F8C2"
  }, 
  "U+F8C3": {
   "classes": [], 
   "codepoint": "U+F8C3"
  }, 
  "U+F8C4": {
   "classes": [], 
   "codepoint": "U+F8C4"
  }, 
  "U+F8C5": {
   "classes": [], 
   "codepoint": "U+F8C5"
  }, 
  "U+F8C6": {
   "classes": [], 
   "codepoint": "U+F8C6"
  }, 
  "U+F8C7": {
   "classes": [], 
   "codepoint": "U+F8C7"
  }, 
  "U+F8C8": {
   "classes": [], 
   "codepoint": "U+F8C8"
  }, 
  "U+F8C9": {
   "classes": [], 
   "codepoint": "U+F8C9"
  }, 
  "U+F8CA": {
   "classes": [], 
   "codepoint": "U+F8CA"
  }, 
  "U+F8CB": {
   "classes": [], 
   "codepoint": "U+F8CB"
  }, 
  "U+F8CC": {
   "classes": [], 
   "codepoint": "U+F8CC"
  }, 
  "U+F8CD": {
   "classes": [], 
   "codepoint": "U+F8CD"
  }, 
  "U+F8CE": {
   "classes": [], 
   "codepoint": "U+F8CE"
  }, 
  "U+F8CF": {
   "classes": [], 
   "codepoint": "U+F8CF"
  }, 
  "U+F8D0": {
   "classes": [], 
   "codepoint": "U+F8D0"
  }, 
  "U+F8D1": {
   "classes": [], 
   "codepoint": "U+F8D1"
  }, 
  "U+F8D2": {
   "classes": [], 
   "codepoint": "U+F8D2"
  }, 
  "U+F8D3": {
   "classes": [], 
   "codepoint": "U+F8D3"
  }, 
  "U+F8D4": {
   "classes": [], 
   "codepoint": "U+F8D4"
  }, 
  "U+F8D5": {
   "classes": [], 
   "codepoint": "U+F8D5"
  }, 
  "U+F8D6": {
   "classes": [], 
   "codepoint": "U+F8D6"
  }, 
  "U+F8D7": {
   "classes": [], 
   "codepoint": "U+F8D7"
  }, 
  "U+F8D8": {
   "classes": [], 
   "codepoint": "U+F8D8"
  }, 
  "U+F8D9": {
   "classes": [], 
   "codepoint": "U+F8D9"
  }, 
  "U+F8DA": {
   "classes": [], 
   "codepoint": "U+F8DA"
  }, 
  "U+F8DB": {
   "classes": [], 
   "codepoint": "U+F8DB"
  }, 
  "U+F8DC": {
   "classes": [], 
   "codepoint": "U+F8DC"
  }, 
  "U+F8DD": {
   "classes": [], 
   "codepoint": "U+F8DD"
  }, 
  "U+F8DE": {
   "classes": [], 
   "codepoint": "U+F8DE"
  }, 
  "U+F8DF": {
   "classes": [], 
   "codepoint": "U+F8DF"
  }, 
  "U+F8E0": {
   "classes": [], 
   "codepoint": "U+F8E0"
  }, 
  "U+F8E1": {
   "classes": [], 
   "codepoint": "U+F8E1"
  }, 
  "U+F8E2": {
   "classes": [], 
   "codepoint": "U+F8E2"
  }, 
  "U+F8E3": {
   "classes": [], 
   "codepoint": "U+F8E3"
  }, 
  "U+F8E4": {
   "classes": [], 
   "codepoint": "U+F8E4"
  }, 
  "U+F8E5": {
   "classes": [], 
   "codepoint": "U+F8E5"
  }, 
  "U+F8E6": {
   "classes": [], 
   "codepoint": "U+F8E6"
  }, 
  "U+F8E7": {
   "classes": [], 
   "codepoint": "U+F8E7"
  }, 
  "U+F8E8": {
   "classes": [], 
   "codepoint": "U+F8E8"
  }, 
  "U+F8E9": {
   "classes": [], 
   "codepoint": "U+F8E9"
  }, 
  "U+F8EA": {
   "classes": [], 
   "codepoint": "U+F8EA"
  }, 
  "U+F8EB": {
   "classes": [], 
   "codepoint": "U+F8EB"
  }, 
  "U+F8EC": {
   "classes": [], 
   "codepoint": "U+F8EC"
  }, 
  "U+F8ED": {
   "classes": [], 
   "codepoint": "U+F8ED"
  }, 
  "U+F8EE": {
   "classes": [], 
   "codepoint": "U+F8EE"
  }, 
  "U+F8EF": {
   "classes": [], 
   "codepoint": "U+F8EF"
  }, 
  "U+F8F0": {
   "classes": [], 
   "codepoint": "U+F8F0"
  }, 
  "U+F8F1": {
   "classes": [], 
   "codepoint": "U+F8F1"
  }, 
  "U+F8F2": {
   "classes": [], 
   "codepoint": "U+F8F2"
  }, 
  "U+F8F3": {
   "classes": [], 
   "codepoint": "U+F8F3"
  }, 
  "U+F8F4": {
   "classes": [], 
   "codepoint": "U+F8F4"
  }, 
  "U+F8F5": {
   "classes": [], 
   "codepoint": "U+F8F5"
  }, 
  "U+F8F6": {
   "classes": [], 
   "codepoint": "U+F8F6"
  }, 
  "U+F8F7": {
   "classes": [], 
   "codepoint": "U+F8F7"
  }, 
  "U+F8F8": {
   "classes": [], 
   "codepoint": "U+F8F8"
  }, 
  "U+F8F9": {
   "classes": [], 
   "codepoint": "U+F8F9"
  }, 
  "U+F8FA": {
   "classes": [], 
   "codepoint": "U+F8FA"
  }, 
  "U+F8FB": {
   "classes": [], 
   "codepoint": "U+F8FB"
  }, 
  "U+F8FC": {
   "classes": [], 
   "codepoint": "U+F8FC"
  }, 
  "accidentalDoubleFlatParens": {
   "classes": [], 
   "codepoint": "U+F5D9"
  }, 
  "accidentalDoubleSharpParens": {
   "classes": [], 
   "codepoint": "U+F5D8"
  }, 
  "accidentalFlatParens": {
   "classes": [], 
   "codepoint": "U+F5D5"
  }, 
  "accidentalFlatSmall": {
   "classes": [], 
   "codepoint": "U+F713"
  }, 
  "accidentalNaturalParens": {
   "classes": [], 
   "codepoint": "U+F5D6"
  }, 
  "accidentalNaturalSmall": {
   "classes": [], 
   "codepoint": "U+F712"
  }, 
  "accidentalSharpParens": {
   "classes": [], 
   "codepoint": "U+F5D7"
  }, 
  "accidentalSharpSmall": {
   "classes": [], 
   "codepoint": "U+F711"
  }, 
  "csymAccidentalDoubleFlatSmall": {
   "classes": [], 
   "codepoint": "U+F4E1"
  }, 
  "csymAccidentalDoubleSharpSmall": {
   "classes": [], 
   "codepoint": "U+F4E0"
  }, 
  "csymAccidentalFlatSmall": {
   "classes": [], 
   "codepoint": "U+F4DC"
  }, 
  "csymAccidentalNaturalSmall": {
   "classes": [], 
   "codepoint": "U+F4DE"
  }, 
  "csymAccidentalSharpSmall": {
   "classes": [], 
   "codepoint": "U+F4DF"
  }, 
  "noteheadBlackParens": {
   "classes": [], 
   "codepoint": "U+F5D1"
  }, 
  "noteheadHalfParens": {
   "classes": [], 
   "codepoint": "U+F5D2"
  }
 }
} as alphaTab.SmuflMetadata)

}

type HTMLElementWithTrack = HTMLElement & {
    track: alphaTab.model.Track;
};

function createTrackItem(
    at: alphaTab.AlphaTabApi,
    track: alphaTab.model.Track,
    trackSelection: Map<number, alphaTab.model.Track>
) {
    const trackTemplate = Handlebars.compile(document.querySelector('#at-track-template')!.innerHTML);
    const trackItem = toDomElement(trackTemplate(track)) as HTMLElementWithTrack;

    // init track controls
    const muteButton = trackItem.querySelector<HTMLButtonElement>('.at-track-mute')!;
    const soloButton = trackItem.querySelector<HTMLButtonElement>('.at-track-solo')!;
    const volumeSlider = trackItem.querySelector<HTMLInputElement>('.at-track-volume')!;

    muteButton.onclick = e => {
        e.stopPropagation();
        muteButton.classList.toggle('active');
        at.changeTrackMute([track], muteButton.classList.contains('active'));
    };

    soloButton.onclick = e => {
        e.stopPropagation();
        soloButton.classList.toggle('active');
        at.changeTrackSolo([track], soloButton.classList.contains('active'));
    };

    volumeSlider.oninput = e => {
        e.preventDefault();
        // Here we need to do some math to map the 1-16 slider to the
        // volume in alphaTab. In alphaTab it is 1.0 for 100% which is
        // equal to the volume in the track information
        at.changeTrackVolume([track], volumeSlider.valueAsNumber / track.playbackInfo.volume);
    };

    volumeSlider.onclick = e => {
        e.stopPropagation();
    };

    trackItem.onclick = e => {
        e.stopPropagation();
        if (!e.ctrlKey) {
            trackSelection.clear();
            trackSelection.set(track.index, track);
        } else if (trackSelection.has(track.index)) {
            trackSelection.delete(track.index);
        } else {
            trackSelection.set(track.index, track);
        }
        at.renderTracks(Array.from(trackSelection.values()).sort(t => t.index));
    };

    volumeSlider.valueAsNumber = track.playbackInfo.volume;

    trackItem.track = track;
    return trackItem;
}

let backingTrackScore: alphaTab.model.Score | null;
let backingTrackAudioElement!: HTMLAudioElement;
let waveForm!: HTMLDivElement;
let waveFormCursor!: HTMLDivElement;

function updateWaveFormCursor() {
    if (waveFormCursor) {
        waveFormCursor.style.left = `${(backingTrackAudioElement.currentTime / backingTrackAudioElement.duration) * 100}%`;
    }
}

function hideBackingTrack() {
    if (backingTrackAudioElement) {
        backingTrackAudioElement.removeEventListener('timeupdate', updateWaveFormCursor);
        backingTrackAudioElement.removeEventListener('durationchange', updateWaveFormCursor);
        backingTrackAudioElement.removeEventListener('seeked', updateWaveFormCursor);
    }
    if (waveForm) {
        waveForm.classList.add('d-none');
    }
}

async function showBackingTrack(at: alphaTab.AlphaTabApi) {
    if (!at.score!.backingTrack) {
        hideBackingTrack();
        return;
    }

    if (!waveForm) {
        waveForm = document.querySelector<HTMLDivElement>('.at-waveform')!;
        waveForm.onclick = e => {
            const percent = e.offsetX / waveForm.offsetWidth;
            if (backingTrackAudioElement) {
                backingTrackAudioElement.currentTime = backingTrackAudioElement.duration * percent;
            }
        };
        waveFormCursor = waveForm.querySelector<HTMLDivElement>('.at-waveform-cursor')!;
    }

    const audioElement = (at.player!.output as alphaTab.synth.IAudioElementBackingTrackSynthOutput).audioElement;
    if (audioElement !== backingTrackAudioElement) {
        backingTrackAudioElement = audioElement;
        audioElement.addEventListener('timeupdate', updateWaveFormCursor);
        audioElement.addEventListener('durationchange', updateWaveFormCursor);
        audioElement.addEventListener('seeked', updateWaveFormCursor);
        updateWaveFormCursor();
    }

    const score = at.score;
    if (score === backingTrackScore) {
        return;
    }
    backingTrackScore = at.score;

    const audioContext = new AudioContext();
    const rawData = await audioContext.decodeAudioData(structuredClone(at.score!.backingTrack.rawAudioFile!.buffer));

    const topChannel = rawData.getChannelData(0);
    const bottomChannel = rawData.numberOfChannels > 1 ? rawData.getChannelData(1) : topChannel;
    const length = topChannel.length;

    waveForm.classList.remove('d-none');

    const canvas = document.querySelector<HTMLCanvasElement>('.at-waveform canvas') ?? document.createElement('canvas');
    const width = waveForm.offsetWidth;
    const height = 80;
    canvas.width = width;
    canvas.height = height;
    waveForm.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;

    const pixelRatio = window.devicePixelRatio;
    const halfHeight = height / 2;

    const barWidth = 2 * pixelRatio;
    const barGap = 1 * pixelRatio;
    const barIndexScale = width / (barWidth + barGap) / length;

    ctx.beginPath();

    let prevX = 0;
    let maxTop = 0;
    let maxBottom = 0;
    for (let i = 0; i <= length; i++) {
        const x = Math.round(i * barIndexScale);

        if (x > prevX) {
            const topBarHeight = Math.round(maxTop * halfHeight);
            const bottomBarHeight = Math.round(maxBottom * halfHeight);
            const barHeight = topBarHeight + bottomBarHeight || 1;

            ctx.roundRect(prevX * (barWidth + barGap), halfHeight - topBarHeight, barWidth, barHeight, 2);

            prevX = x;
            maxTop = 0;
            maxBottom = 0;
        }

        const magnitudeTop = Math.abs(topChannel[i] || 0);
        const magnitudeBottom = Math.abs(bottomChannel[i] || 0);
        if (magnitudeTop > maxTop) {
            maxTop = magnitudeTop;
        }
        if (magnitudeBottom > maxBottom) {
            maxBottom = magnitudeBottom;
        }
    }

    ctx.fillStyle = '#436d9d';
    ctx.fill();
}

function updateBackingTrack(at: alphaTab.AlphaTabApi) {
    switch (at.actualPlayerMode) {
        case alphaTab.PlayerMode.Disabled:
        case alphaTab.PlayerMode.EnabledSynthesizer:
        case alphaTab.PlayerMode.EnabledExternalMedia:
            hideBackingTrack();
            break;
        case alphaTab.PlayerMode.EnabledBackingTrack:
            showBackingTrack(at);
            break;
    }
}

export function setupControl(selector: string, customSettings: alphaTab.json.SettingsJson) {
    const el = document.querySelector<HTMLElement>(selector)!;
    const control = el.closest<HTMLDivElement>('.at-wrap')!;

    const viewPort = control.querySelector<HTMLDivElement>('.at-viewport')!;

    const settings = new alphaTab.Settings();
    applyFonts(settings);
    settings.fillFromJson(defaultSettings);
    settings.fillFromJson({
        player: {
            scrollElement: viewPort
        }
    });
    settings.fillFromJson(customSettings);

    const at = new alphaTab.AlphaTabApi(el, settings);
    at.error.on(e => {
        console.error('alphaTab error', e);
    });

    el.ondragover = e => {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'link';
    };

    el.ondrop = e => {
        e.stopPropagation();
        e.preventDefault();
        const files = e.dataTransfer!.files;
        if (files.length === 1) {
            const reader = new FileReader();
            reader.onload = data => {
                at.load(data.target!.result, [0]);
            };
            reader.readAsArrayBuffer(files[0]);
        }
        console.log('drop', files);
    };

    const tracks = new Map();
    const trackItems: HTMLElementWithTrack[] = [];
    at.renderStarted.on(isResize => {
        if (!isResize) {
            control.classList.add('loading');
        }

        tracks.clear();
        for (const t of at.tracks) {
            tracks.set(t.index, t);
        }

        for (const trackItem of trackItems) {
            if (tracks.has(trackItem.track.index)) {
                trackItem.classList.add('active');
            } else {
                trackItem.classList.remove('active');
            }
        }
    });

    const playerLoadingIndicator = control.querySelector<HTMLElement>('.at-player-loading')!;
    at.soundFontLoad.on(args => {
        updateProgress(playerLoadingIndicator, args.loaded / args.total);
    });
    at.soundFontLoaded.on(() => {
        playerLoadingIndicator.classList.add('d-none');
    });
    at.renderFinished.on(() => {
        control.classList.remove('loading');
    });

    at.scoreLoaded.on(score => {
        control.querySelector<HTMLElement>('.at-song-title')!.innerText = score.title;
        control.querySelector<HTMLElement>('.at-song-artist')!.innerText = score.artist;

        // fill track selector
        const trackList = control.querySelector<HTMLElement>('.at-track-list')!;
        trackList.innerHTML = '';

        for (const track of score.tracks) {
            const trackItem = createTrackItem(at, track, tracks);
            trackItems.push(trackItem);
            trackList.appendChild(trackItem);
        }

        updateBackingTrack(at);
    });

    const timePositionLabel = control.querySelector<HTMLElement>('.at-time-position')!;
    const timeSliderValue = control.querySelector<HTMLElement>('.at-time-slider-value')!;

    const timeSlider = control.querySelector<HTMLInputElement>('.at-time-slider')!;
    let songTimeInfo: alphaTab.synth.PositionChangedEventArgs | null = null;
    timeSlider.onclick = e => {
        const percent = e.offsetX / timeSlider.offsetWidth;
        if (songTimeInfo) {
            at.timePosition = Math.floor(songTimeInfo.endTime * percent);
        }
    };
    at.midiLoaded.on(e => {
        songTimeInfo = e;
    });

    function formatDuration(milliseconds: number) {
        let seconds = milliseconds / 1000;
        const minutes = (seconds / 60) | 0;
        seconds = (seconds - minutes * 60) | 0;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    let previousTime = -1;
    at.playerPositionChanged.on(args => {
        // reduce number of UI updates to second changes.
        const currentSeconds = (args.currentTime / 1000) | 0;
        if (currentSeconds === previousTime) {
            return;
        }
        previousTime = currentSeconds;

        timePositionLabel.innerText = `${formatDuration(args.currentTime)} / ${formatDuration(args.endTime)}`;
        timeSliderValue.style.width = `${((args.currentTime / args.endTime) * 100).toFixed(2)}%`;
    });

    const playPauseButton = control.querySelector<HTMLButtonElement>('.at-play-pause')!;
    at.playerReady.on(() => {
        for (const c of control.querySelectorAll('.at-player .disabled')) {
            c.classList.remove('disabled');
        }

        updateBackingTrack(at);
    });

    at.playerStateChanged.on(args => {
        const icon = playPauseButton.querySelector('i')!;
        if (args.state === 0) {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        } else {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        }
    });

    playPauseButton.onclick = e => {
        e.stopPropagation();
        if (!playPauseButton.classList.contains('disabled')) {
            at.playPause();
        }
    };

    control.querySelector<HTMLButtonElement>('.at-stop')!.onclick = e => {
        e.stopPropagation();
        if (!(e.target as HTMLButtonElement).classList.contains('disabled')) {
            at.stop();
        }
    };

    control.querySelector<HTMLButtonElement>('.at-metronome')!.onclick = e => {
        e.stopPropagation();
        const link = (e.target as HTMLElement).closest('a')!;
        link.classList.toggle('active');
        if (link.classList.contains('active')) {
            at.metronomeVolume = 1;
        } else {
            at.metronomeVolume = 0;
        }
    };

    control.querySelector<HTMLElement>('.at-count-in')!.onclick = e => {
        e.stopPropagation();
        const link = (e.target as HTMLElement).closest('a')!;
        link.classList.toggle('active');
        if (link.classList.contains('active')) {
            at.countInVolume = 1;
        } else {
            at.countInVolume = 0;
        }
    };

    function createOutputDeviceItem(device: alphaTab.synth.ISynthOutputDevice) {
        const item = document.createElement('a');
        item.classList.add('dropdown-item');
        item.href = '#';
        item.onclick = async () => {
            await at.setOutputDevice(device);
        };
        item.innerText = device.label + (device.isDefault ? ' (default)' : '');
        return item;
    }

    control.querySelector('.at-output-device')!.addEventListener('show.bs.dropdown', async () => {
        const devices = await at.enumerateOutputDevices();
        if (devices.length === 0) {
            return;
        }

        const list = control.querySelector('.at-output-device .dropdown-menu')!;
        list.innerHTML = '';
        for (const d of devices) {
            const item = createOutputDeviceItem(d);
            list.appendChild(item);
        }
    });

    for (const a of control.querySelectorAll<HTMLAnchorElement>('.at-speed-options a')) {
        a.onclick = e => {
            e.preventDefault();
            at.playbackSpeed = Number.parseFloat((e.target as HTMLAnchorElement).innerText);
            control.querySelector<HTMLElement>('.at-speed-label')!.innerText = (
                e.target as HTMLAnchorElement
            ).innerText;
        };
    }

    control.querySelector<HTMLButtonElement>('.at-loop')!.onclick = e => {
        e.stopPropagation();
        const link = (e.target as HTMLButtonElement).closest('a')!;
        link.classList.toggle('active');
        if (link.classList.contains('active')) {
            at.isLooping = true;
        } else {
            at.isLooping = false;
        }
    };

    control.querySelector<HTMLButtonElement>('.at-print')!.onclick = () => {
        at.print();
    };

    control.querySelector<HTMLButtonElement>('.at-download')!.onclick = () => {
        const exporter = new alphaTab.exporter.Gp7Exporter();
        const data = exporter.export(at.score!, at.settings);
        const a = document.createElement('a');
        a.download = at.score!.title.length > 0 ? `${at.score!.title}.gp` : 'song.gp';
        a.href = URL.createObjectURL(new Blob([data]));
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    control.querySelector<HTMLButtonElement>('.at-download-audio')!.onclick = async () => {
        const exportOptions = new alphaTab.synth.AudioExportOptions();
        exportOptions.sampleRate = 44100;

        // use settings as configured currently
        exportOptions.masterVolume = at.masterVolume;
        exportOptions.metronomeVolume = at.metronomeVolume;
        if (at.playbackRange) {
            exportOptions.playbackRange = at.playbackRange;
        }

        const trackList = control.querySelectorAll<HTMLElementWithTrack>('.at-track-list .at-track');

        const soloTracks = new Set();
        for (const t of trackList) {
            const trackIndex = t.track.index;
            const volumeSlider = t.querySelector<HTMLInputElement>('.at-track-volume')!;
            exportOptions.trackVolume.set(trackIndex, volumeSlider.valueAsNumber / t.track.playbackInfo.volume);

            const muteButton = t.querySelector<HTMLButtonElement>('.at-track-mute')!;
            if (muteButton.classList.contains('active')) {
                exportOptions.trackVolume.set(trackIndex, 0);
            }

            const soloButton = t.querySelector<HTMLButtonElement>('.at-track-solo')!;
            if (soloButton.classList.contains('active')) {
                soloTracks.add(trackIndex);
            }
        }

        if (soloTracks.size > 0) {
            for (const t of at.score!.tracks) {
                if (!soloTracks.has(t.index)) {
                    exportOptions.trackVolume.set(t.index, 0);
                }
            }
        }

        await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.responseType = 'arraybuffer';
            xhr.open('GET', defaultSettings.player.soundFont, true);
            xhr.onload = () => {
                exportOptions.soundFonts = [new Uint8Array(xhr.response)];
                resolve();
            };
            xhr.onerror = e => {
                reject(e);
            };
            xhr.send();
        });

        const exporter = await at.exportAudio(exportOptions);
        let generated: Float32Array | undefined = undefined;
        try {
            let chunk: alphaTab.synth.AudioExportChunk | undefined;
            let totalSamples = 0;

            while (true) {
                chunk = await exporter.render(500);
                if (chunk === undefined) {
                    break;
                }

                if (generated === undefined) {
                    generated = new Float32Array(exportOptions.sampleRate * (chunk.endTime / 1000) * 2 /* Stereo */);
                }

                const neededSize = totalSamples + chunk.samples.length;
                if (generated.length < neededSize) {
                    const needed = neededSize - generated.length;
                    const newBuffer:Float32Array = new Float32Array(generated.length + needed);
                    newBuffer.set(generated, 0);
                    generated = newBuffer;
                }

                generated!.set(chunk.samples, totalSamples);
                totalSamples += chunk.samples.length;
            }

            if (generated && totalSamples < generated.length) {
                generated = generated.subarray(0, totalSamples);
            }
        } finally {
            exporter.destroy();
        }

        if (generated) {
            const a = document.createElement('a');
            a.download =
                at.score!.title.length > 0
                    ? `${at.score!.title}_${exportOptions.sampleRate}_float32.pcm`
                    : `song_${exportOptions.sampleRate}_float32.pcm`;
            a.href = URL.createObjectURL(
                new Blob([new Uint8Array(generated.buffer, generated.byteOffset, generated.byteLength)])
            );
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    for (const a of control.querySelectorAll<HTMLAnchorElement>('.at-zoom-options a')) {
        a.onclick = e => {
            e.preventDefault();
            at.settings.display.scale = Number.parseInt((e.target as HTMLAnchorElement).innerText) / 100.0;
            control.querySelector<HTMLElement>('.at-zoom-label')!.innerText = (e.target as HTMLAnchorElement).innerText;
            at.updateSettings();
            at.render();
        };
    }

    for (const a of control.querySelectorAll<HTMLAnchorElement>('.at-layout-options a')) {
        a.onclick = e => {
            e.preventDefault();
            const settings = at.settings;
            switch ((e.target as HTMLAnchorElement).dataset.layout) {
                case 'page':
                    settings.display.layoutMode = alphaTab.LayoutMode.Page;
                    settings.player.scrollMode = alphaTab.ScrollMode.Continuous;
                    break;
                case 'horizontal-bar':
                    settings.display.layoutMode = alphaTab.LayoutMode.Horizontal;
                    settings.player.scrollMode = alphaTab.ScrollMode.Continuous;
                    break;
                case 'horizontal-screen':
                    settings.display.layoutMode = alphaTab.LayoutMode.Horizontal;
                    settings.player.scrollMode = alphaTab.ScrollMode.OffScreen;
                    break;
            }

            at.updateSettings();
            at.render();
        };
    }

    for (const t of control.querySelectorAll('[data-toggle="tooltip"]')) {
        new bootstrap.Tooltip(t);
    }

    return at;
}

function percentageToDegrees(percentage: number) {
    return (percentage / 100) * 360;
}

function updateProgress(el: HTMLElement, value: number) {
    value = value * 100;
    const left = el.querySelector<HTMLElement>('.progress-left .progress-bar')!;
    const right = el.querySelector<HTMLElement>('.progress-right .progress-bar')!;

    if (value > 0) {
        if (value <= 50) {
            right.style.transform = `rotate(${percentageToDegrees(value)}deg)`;
        } else {
            right.style.transform = 'rotate(180deg)';
            left.style.transform = `rotate(${percentageToDegrees(value - 50)}deg)`;
        }
    }
    el.querySelector<HTMLElement>('.progress-value-number')!.innerText = String(value | 0);
}
