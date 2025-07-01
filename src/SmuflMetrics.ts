import { JsonHelper } from '@src/io/JsonHelper';
import { Duration } from '@src/model/Duration';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

/**
 * https://w3c.github.io/smufl/latest/specification/engravingdefaults.html
 * @record
 */
export interface SmuflEngravingDefaults {
    arrowShaftThickness: number;
    barlineSeparation: number;
    beamSpacing: number;
    beamThickness: number;
    bracketThickness: number;
    dashedBarlineDashLength: number;
    dashedBarlineGapLength: number;
    dashedBarlineThickness: number;
    hairpinThickness: number;
    legerLineExtension: number;
    legerLineThickness: number;
    lyricLineThickness: number;
    octaveLineThickness: number;
    pedalLineThickness: number;
    repeatBarlineDotSeparation: number;
    repeatEndingLineThickness: number;
    slurEndpointThickness: number;
    slurMidpointThickness: number;
    staffLineThickness: number;
    stemThickness: number;
    subBracketThickness: number;
    textEnclosureThickness: number;
    thickBarlineThickness: number;
    thinBarlineThickness: number;
    thinThickBarlineSeparation: number;
    tieEndpointThickness: number;
    tieMidpointThickness: number;
    tupletBracketThickness: number;
}

/**
 * https://w3c.github.io/smufl/latest/specification/glyphbboxes.html
 * @record
 */
export interface SmuflGlyphBoundingBox {
    bBoxNE: [number, number];
    bBoxSW: [number, number];
}

/**
 * https://w3c.github.io/smufl/latest/specification/glyphswithanchors.html#glyphswithanchors
 * @record
 */
export interface SmuflGlyphWithAnchor {
    splitStemUpSE?: [number, number];
    splitStemUpSW?: [number, number];
    splitStemDownNE?: [number, number];
    splitStemDownNW?: [number, number];
    stemUpSE?: [number, number];
    stemDownNW?: [number, number];
    stemUpNW?: [number, number];
    stemDownSW?: [number, number];
    nominalWidth?: number;
    numeralTop?: number;
    numeralBottom?: number;
    cutOutNE?: [number, number];
    cutOutSE?: [number, number];
    cutOutSW?: [number, number];
    cutOutNW?: [number, number];
    graceNoteSlashSW?: [number, number];
    graceNoteSlashNE?: [number, number];
    graceNoteSlashNW?: [number, number];
    graceNoteSlashSE?: [number, number];
    repeatOffset?: [number, number];
    noteheadOrigin?: [number, number];
    opticalCenter?: [number, number];
}

/**
 * The SmuFL Metadata object describing the structure needed by alphaTab.
 * https://w3c.github.io/smufl/latest/specification/font-specific-metadata.html
 * @record
 */
export interface SmuflMetadata {
    engravingDefaults: SmuflEngravingDefaults;
    glyphBBoxes: Record<string, SmuflGlyphBoundingBox>;
    glyphsWithAnchors: Record<string, SmuflGlyphWithAnchor>;
}

/**
 * @json
 * @json_declaration
 */
export class SmuflStemInfo {
    // TODO: json serializer record support
    public topY = 0;
    public bottomY = 0;
    public topX = 0;
    public bottomX = 0;
}

/**
 * This class holds all SMuFL metrics we use in alphaTab like sizes,
 * spacings etc.
 * @json
 * @json_declaration
 */
export class SmuflMetrics {
    // SmuFL TODO:
    // - Spec: "Diving the EM in four provides analogue for a five-line staff."
    // - Spec: "All Glyphs should be drawn at scale consistent with the key measurement that one staff space = 0.25em"
    // - If `Environment.MusicFontSize=34` (px), 1 staff space (sp) is 34/4 => 8.5px, but we currently have 1sp as 8px
    // - Spec: "Unless otherwise stated, all glyphs shall have zero-width side bearings, i.e. no blank space to the left or right of the glyph"
    // - Spec: "Glyphs for movable notations that apply to some vertical staff position (e.g. note heads, accidentals) shall
    //          be registered such that the font baseline lies eactly at that position."
    // - Spec: Letters from dynamics should be scaled such that the caps height is around 0.5em and the x-height is around 0.25em.
    // - Spec: digits from time signatures should be scaled such that each digit is two staff spaces tal (i.e. 0.5em) and vertically centered on the baseline.
    // - Spec: Tessellating glyphs (such as wavy lines or the component parts of complex trills and mordents) should have negative side bearings, in order to achieve correct tessellation when set in a single run.
    // - Generally we should eliminate the custom spaces in this file unless they are for some specialized
    //   glyphs or annotations which have no strict SmuFL spec (e.g. chord diagrams)

    //
    // general music sheet and renderer sizes

    /**
     * The font size of the music font in pixel.
     * @internal
     */
    public musicFontSize = 36;
    public oneStaffSpace: number = this.musicFontSize / 4;
    public tabLineSpacing: number = this.oneStaffSpace * 1.2;

    // engraving defaults (TODO: reuse SmuflEngravingDefaults when all are supported)
    public barlineSeparation: number = 0;
    public beamSpacing: number = 0;
    public beamThickness: number = 0;
    public dashedBarlineDashLength: number = 0;
    public dashedBarlineGapLength: number = 0;
    public dashedBarlineThickness: number = 0;
    public legerLineThickness = 0;
    public legerLineExtension = 0;
    public repeatBarlineDotSeparation: number = 0;
    public repeatEndingLineThickness: number = 0;
    public staffLineThickness: number = 0;
    public stemThickness: number = 0;
    public thickBarlineThickness: number = 0;
    public thinBarlineThickness: number = 0;
    public thinThickBarlineSeparation: number = 0;

    public effectBandSeparation: number = 0; // TODO: part of other paddings? or make paddings part of smufl metrics (aka. stylesheet)

    public static get bravuraDefaults() {
        const metrics = new SmuflMetrics();
        metrics.initialize(SmuflMetrics.bravuraMetadata);
        return metrics;
    }

    public initialize(smufl: SmuflMetadata) {
        // custom alphatab
        this.effectBandSeparation = this.oneStaffSpace / 4;

        // SmuFl spec

        // TODO arrowShaftThickness
        this.barlineSeparation = smufl.engravingDefaults.barlineSeparation * this.oneStaffSpace;
        this.beamSpacing = smufl.engravingDefaults.beamThickness * this.oneStaffSpace;
        this.beamThickness = smufl.engravingDefaults.beamThickness * this.oneStaffSpace;
        // TODO bracketThickness
        this.dashedBarlineDashLength = smufl.engravingDefaults.dashedBarlineDashLength * this.oneStaffSpace;
        this.dashedBarlineGapLength = smufl.engravingDefaults.dashedBarlineGapLength * this.oneStaffSpace;
        this.dashedBarlineThickness = smufl.engravingDefaults.dashedBarlineThickness * this.oneStaffSpace;
        // TODO hairpinThickness
        this.legerLineExtension = smufl.engravingDefaults.legerLineExtension * this.oneStaffSpace;
        this.legerLineThickness = smufl.engravingDefaults.legerLineThickness * this.oneStaffSpace;
        // TODO lyricLineThickness
        // TODO octaveLineThickness
        // TODO pedalLineThickness
        this.repeatBarlineDotSeparation = smufl.engravingDefaults.repeatBarlineDotSeparation * this.oneStaffSpace;
        this.repeatEndingLineThickness = smufl.engravingDefaults.repeatEndingLineThickness * this.oneStaffSpace; // TODO which line is this exactly?
        // TODO slurEndpointThickness
        // TODO slurMidpointThickness
        this.staffLineThickness = smufl.engravingDefaults.staffLineThickness * this.oneStaffSpace;
        this.stemThickness = smufl.engravingDefaults.stemThickness * this.oneStaffSpace;
        // TODO subBracketThickness
        // TODO textEnclosureThickness
        this.thickBarlineThickness = smufl.engravingDefaults.thickBarlineThickness * this.oneStaffSpace;
        this.thinBarlineThickness = smufl.engravingDefaults.thinBarlineThickness * this.oneStaffSpace;
        this.thinThickBarlineSeparation = smufl.engravingDefaults.thinThickBarlineSeparation * this.oneStaffSpace;
        // TODO tieEndpointThickness
        // TODO tieMidpointThickness
        // TODO tupletBracketThickness

        for (const [g, v] of Object.entries(smufl.glyphsWithAnchors)) {
            const name = g.substring(0, 1).toUpperCase() + g.substring(1);
            const symbol = JsonHelper.parseEnum<MusicFontSymbol>(name, MusicFontSymbol);
            if (symbol && v.stemDownNW) {
                const b = new SmuflStemInfo();
                b.topX = v.stemDownNW[0] * this.oneStaffSpace;
                b.topY = v.stemDownNW[1] * this.oneStaffSpace;
                if (v.stemDownSW) {
                    b.bottomX = v.stemDownSW[0] * this.oneStaffSpace;
                    b.bottomY = v.stemDownSW[1] * this.oneStaffSpace;
                } else {
                    b.bottomX = b.topX + this.stemThickness;
                    b.bottomY = 0;
                }
                this.stemDown.set(symbol, b);
            }
            if (symbol && v.stemUpSE) {
                const b = new SmuflStemInfo();
                b.bottomX = v.stemUpSE[0] * this.oneStaffSpace;
                b.bottomY = v.stemUpSE[1] * this.oneStaffSpace;
                if (v.stemUpNW) {
                    b.topX = v.stemUpNW[0] * this.oneStaffSpace;
                    b.topY = v.stemUpNW[1] * this.oneStaffSpace;
                } else {
                    b.topX = b.bottomX - this.stemThickness;
                    b.topY = 0;
                }
                this.stemUp.set(symbol, b);
            }
            if (symbol && v.repeatOffset) {
                this.repeatOffsetX.set(symbol, v.repeatOffset[0] * this.oneStaffSpace);
            }
        }

        for (const [g, v] of Object.entries(smufl.glyphBBoxes)) {
            const name = g.substring(0, 1).toUpperCase() + g.substring(1);
            const symbol = JsonHelper.parseEnum<MusicFontSymbol>(name, MusicFontSymbol);
            if (symbol) {
                this.glyphTop.set(symbol, v.bBoxNE[1] * this.oneStaffSpace);
                this.glyphBottom.set(symbol, v.bBoxSW[1] * this.oneStaffSpace);
                this.glyphWidths.set(symbol, (v.bBoxNE[0] - v.bBoxSW[0]) * this.oneStaffSpace);
                this.glyphHeights.set(symbol, (v.bBoxNE[1] - v.bBoxSW[1]) * this.oneStaffSpace);
            }
        }
    }

    public tabNumberSpacePadding: number = 1;

    //
    // combined sizes (TODO: splitup into paddings and glyph sizes)
    public get numberedBarRendererBarSpacing() {
        return this.beamSpacing + this.beamThickness;
    }

    //
    // paddings/margins between elements (TODO: try to eliminate custom paddings)
    public directionsContainerPadding: number = 3;
    public leftHandTappingPadding: number = 6;
    public multiBarRestPadding: number = 10;
    public trillTextPadding: number = 3;

    public numberedBeatPostAccidentalPadding: number = 4;

    public slashBeatNoteDotPadding: number = 5;
    public numberedBeatNoteDotPadding: number = 5;
    public scoreBeatNoteDotPadding: number = 5;
    public numberedBarRendererDotSpacing = 5;
    public numberedBarRendererDotPadding = 4;
    public tabNoteDotPadding = 5;

    public numberedBarRendererPreTimeSignaturePadding = 5;
    public scoreBarRendererPreTimeSignaturePadding = 5;
    public slashBarRendererPreTimeSignaturePadding = 5;
    public tabBarRendererPreTimeSignaturePadding = 5;

    public rowContainerPadding: number = 3;

    public scoreBeatGhostSpace: number = 4;
    public scorePreNotePadding: number = 4;
    public scorePreFingeringPadding: number = 2;
    public scorePreAccidentalPadding: number = 2;

    public scoreBendEndPadding: number = 8;
    public scoreBendHoldOffset: number = 22;
    public scoreBendHoldSize: number = 4;

    public scoreHelperNotesEndPadding: number = ((10 / 2) | 0) + 3;
    public scoreHelperNotesEndPadding2: number = 10;

    public scoreNoteBelowEffectSpacing: number = 1;

    public tupletTextMargin = 3;
    public tabClefLeftPadding: number = 5;

    public alternateEndingsPaddingX: number = 3;
    public alternateEndingsPaddingY: number = 5;
    public alternateEndingsCloseLinePadding: number = 4;

    public beatTimerPaddingX: number = 2;
    public beatTimerPaddingY: number = 2;
    public beatTimerMarginY: number = 2;

    public bendNoteHeadElementPadding: number = 2;

    public circleGlyphPadding: number = 3;

    public scoreSlideLineEndPadding = 2;
    public scoreSlideLineOffsetX = 2;
    public scoreSlideLineOffsetY = 2;

    public scoreWhammySimpleDipPadding = 2;
    public scoreWhammySongBookPadding = 2;
    public slashNoteHeadEffectSpacing = 7;

    public tabPreNotesPadding = 4;
    public tabNoteChordEffectSpacing: number = 7;

    public tabWhammySimpleDipPadding = 2;
    public tabWhammyTextPadding = 2;

    //
    // range glyphs (TODO: check for SMuFL spec)
    public lineRangedGlyphSpacing: number = 3;
    public lineRangedGlyphTopPadding: number = 4;
    public lineRangedGlyphTopOffset: number = 5;
    public lineRangedGlyphSize: number = 8;
    public ottavaLineSize: number = 8;
    public ottavaLineSpacing: number = 3;
    public ottavaPaddingY: number = 2;

    public numberedDashGlyphPadding = 3;
    public stringNumberCirclePadding = 3;
    public sustainPedalTextLinePadding = 3;
    public sustainPedalStarLinePadding = 3;

    public timeSignatureGhostParenthesisLeftPadding = 10;
    public timeSignatureGhostParenthesisRightPadding = 13;

    //
    // repeated glyph advance
    public tabBrushArpeggioOffset: number = 4;

    //
    // glyph positioning/alignment offsets (TODO: try to eliminate or calculate from bounding box)
    public pictEdgeOfCymbalOffsetX: number = 3;
    public arpeggioXOffset: number = 5;
    public noteOrnamentBottomOffset: number = 4;

    public numberedBeatNoteYTopPadding: number = 2;
    public slashBeatNoteYTopPadding: number = 2;

    public tupletOffset = 10;

    public tabClefOffsetX: number = 5;
    public tabNoteYTopOffset: number = 2;

    public accentuationPadding: number = 2;

    public articStaccatoAbovePaddingX: number = 3;
    public articStaccatoAbovePaddingY: number = 5;
    public barTempoValuePadding: number = 3;

    public graceBeatPadding: number = 3;
    public graceBeatPostBeatStretch: number = 7;

    public scoreTremoloOffsetUp = new Map<Duration, number>([
        [Duration.ThirtySecond, -15],
        [Duration.Sixteenth, -12],
        [Duration.Eighth, -10]
    ]);
    public scoreTremoloOffsetUpOther = -10;
    public scoreTremoloOffsetDown = new Map<Duration, number>([
        [Duration.ThirtySecond, 15],
        [Duration.Sixteenth, 15],
        [Duration.Eighth, 10]
    ]);
    public scoreTremoloOffsetDownOther = 15;
    public tabTremoloOffsetX = new Map<Duration, number>([
        [Duration.ThirtySecond, 10],
        [Duration.Sixteenth, 5],
        [Duration.Eighth, 0]
    ]);
    public tabTremoloXDefault = 5;
    public tabPreBendPadding: number = 2;
    public tabBendLabelYOffset: number = 2;
    public tabSlideOffsetX: number = 2;

    public stemUp = new Map<MusicFontSymbol, SmuflStemInfo>();
    public stemDown = new Map<MusicFontSymbol, SmuflStemInfo>();
    public repeatOffsetX = new Map<MusicFontSymbol, number>();

    //
    // glyph sizes (TODO: move to lookup or check if SmuFL has other constants)
    public deadSlappedLineWidth: number = 2;
    public targetDirectionGlyphHeight: number = 27;
    public flagWidth: number = 11;
    public ghostParenthesisSize: number = 6;
    public leftHandTappingCircleScale: number = 0.625;
    public multiBarRestWidth: number = 60;
    public numberedNoteHeadWidth: number = 12;
    public numberedNoteHeadHeight: number = 17;
    public numberedTieEmptySize: number = 20;
    public arpeggioWidth: number = 10;
    public arpeggioArrowSize: number = 8;

    public slashBeatNoteDotSize: number = 1.5;
    public numberedBeatNoteDotSize: number = 1.5;
    public scoreBeatNoteDotSize: number = 1.5;
    public numberedBarRendererDotSize = 2;
    public tabNoteDotSize = 1.5;

    public numberedBarRendererBarSize = 2;

    public crescendoHeight = 17;

    public barTempoHeight = 25;
    public numberedDashGlyphWidth = 14;
    public simileMarkSimpleWidth = 20;
    public simileMarkDoubleWidth = 28;

    public tupletSize = 15;

    public graceFlagSizeX = 12;
    public graceFlagSizeY = 15;

    public flagStemSize = 3;
    public brokenBarOffset = 6;

    public scoreBarRendererBeamMaxDistance = 10;
    public accidentalHeight: number = 21;

    public dottedBarLineCircleRadius: number = 1;

    public beatPaddingFlagEighthAndAbove: number = 20;
    public beatPaddingOneHundredAndAbove: number = 10;

    public barNumberMarginPaddingRight: number = 5;

    public scoreSlideLineSizeX = 12;

    public get scoreWhammySimpleDipHeight() {
        return this.tabWhammyPerHalfSize * 2;
    }

    public slashTieEmptyHeight = 15;
    public slashTieEmptyWidth = 20;

    public sustainPedalLineWidth = 1;

    public tabBendArrowSize: number = 6;
    public tabBendDashSize: number = 3;
    public tabBendBendValueHeight: number = 6;

    public tabBrushWidth: number = 10;
    public tabBrushArrowSize: number = 8;
    public tabRestInvisibleWidth: number = 10;
    public tabSlideSizeX: number = 12;
    public tabSlideSizeY: number = 3;

    public tabTieEmptyHeight: number = 15;
    public tabTieEmptyWidth: number = 20;

    public tabWhammyPerHalfSize = 6;
    public tabWhammyDashSize = 3;

    public tieSize = 4;
    public tieHeight = 22;
    public bendSlurHeight = 11;

    public timeSignatureNumberHeight = 18;

    public barStemSizes: Map<Duration, number> = new Map<Duration, number>([
        [Duration.QuadrupleWhole, 6],
        [Duration.Half, 6],
        [Duration.Quarter, 6],
        [Duration.Eighth, 6],
        [Duration.Sixteenth, 6],
        [Duration.ThirtySecond, 8],
        [Duration.SixtyFourth, 9],
        [Duration.OneHundredTwentyEighth, 9],
        [Duration.TwoHundredFiftySixth, 10]
    ]);

    public glyphTop: Map<MusicFontSymbol, number> = new Map<MusicFontSymbol, number>();
    public glyphBottom: Map<MusicFontSymbol, number> = new Map<MusicFontSymbol, number>();

    /**
     * The widths of the bounding box for the respective glyphs.
     */
    public glyphWidths: Map<MusicFontSymbol, number> = new Map<MusicFontSymbol, number>();
    /**
     * The heights of the bounding box for the respective glyphs.
     */
    public glyphHeights: Map<MusicFontSymbol, number> = new Map<MusicFontSymbol, number>();

    //
    // chord diagram (TODO: check if SmuFL has some glyphs we can check)
    public chordDiagramPaddingX: number = 5;
    public chordDiagramPaddingY: number = 2;
    public chordDiagramCircleRadius: number = 2.5;
    public chordDiagramStringSpacing: number = 10;
    public chordDiagramFretSpacing: number = 12;
    public chordDiagramNutHeight: number = 2;
    public chordDiagramFretHeight: number = 1;

    //
    // glyph scales (TODO: Align with SMuFL where needed, otherwise eliminate to scale 1)
    public targetDirectionGlyphScale: number = 0.8;
    public dynamicsScale: number = 0.6;
    public numberedKeySignatureScale: number = 0.7;
    public ottavaScale: number = 0.8;
    public pictEdgeOfCymbalScale: number = 0.5;
    public trillLoopHeightToY = 1.37;

    public barTempoSymbolYScale: number = 0.8;
    public barTempoSymbolScale: number = 0.5;

    public stringsToTabClefSymbolAndScale(strings: number): [MusicFontSymbol, number] {
        if (strings <= 4) {
            return [MusicFontSymbol.FourStringTabClef, strings / 4.5];
        }

        return [MusicFontSymbol.SixStringTabClef, strings / 6.5];
    }

    //
    // tuning (TODO: fixed values or take others as reference?)
    public tuningGlyphCircleNumberScale = 0.7;
    public tuningGlyphRowHeight = 15;
    public tuningGlyphTextPadding = 1;
    public tuningGlyphStringColumnWidth = 64;
    public tuningGlyphEndPaddingX = 15;

    //
    // triplet feel (TODO: fixed values or take others as reference?)
    public tripletFeelNoteScale = 0.5;
    public tripletFeelTupletScale = 0.7;
    public tripletFeelHeight = 25;
    public tripletFeelYPadding = 8;
    public tripletFeelBracketsHeightToY = 0.3;
    public tripletFeelLeftNoteXPadding = 10;
    public tripletFeelRightNoteXPadding = 40;
    public tripletFeelCircleOffset = 9;
    public tripletFeelCircleSize = 1;
    public tripletFeelEqualsOffsetX = 32;
    public tripletFeelEqualsOffsetY = 5;
    public tripletFeelAugmentationOffsetX = 7;
    public tripletFeelCloseParenthesisOffsetX = 65;

    //
    // font size > height factors (TODO: use proper measuring?)
    public scoreInfoFontSizeToHeight = 1.2;
    public scoreWhammyFontSizeToOverflow = 1.5;
    public lineBarRendererOverflowFontSiteToPadding = 0.2;
    public lineBarRendererTupletFontSiteToPadding = 0.3;
    public chordDiagramFontToRow: number = 1.5;
    public jumpDirectionFontSizeToHeight: number = 1.5;
    public tabBendFontSizeToHeight: number = 1.3;
    public tabBendFontSizeToPadding: number = 0.5;
    public barTempoTextPaddingScale: number = 0.7;

    public static readonly bravuraMetadata: SmuflMetadata =
        // begin bravura_alphatab_metadata
        {
            engravingDefaults: {
                arrowShaftThickness: 0.16,
                barlineSeparation: 0.4,
                beamSpacing: 0.25,
                beamThickness: 0.5,
                bracketThickness: 0.5,
                dashedBarlineDashLength: 0.5,
                dashedBarlineGapLength: 0.25,
                dashedBarlineThickness: 0.16,
                hairpinThickness: 0.16,
                legerLineExtension: 0.4,
                legerLineThickness: 0.16,
                lyricLineThickness: 0.16,
                octaveLineThickness: 0.16,
                pedalLineThickness: 0.16,
                repeatBarlineDotSeparation: 0.16,
                repeatEndingLineThickness: 0.16,
                slurEndpointThickness: 0.1,
                slurMidpointThickness: 0.22,
                staffLineThickness: 0.13,
                stemThickness: 0.12,
                subBracketThickness: 0.16,
                textEnclosureThickness: 0.16,
                thickBarlineThickness: 0.5,
                thinBarlineThickness: 0.16,
                tieEndpointThickness: 0.1,
                tieMidpointThickness: 0.22,
                thinThickBarlineSeparation: 0.4,
                tupletBracketThickness: 0.16
            },
            glyphBBoxes: {
                accidentalDoubleFlat: {
                    bBoxNE: [1.644, 1.748],
                    bBoxSW: [0, -0.7]
                },
                accidentalDoubleSharp: {
                    bBoxNE: [0.988, 0.508],
                    bBoxSW: [0, -0.5]
                },
                accidentalFlat: {
                    bBoxNE: [0.904, 1.756],
                    bBoxSW: [0, -0.7]
                },
                accidentalNatural: {
                    bBoxNE: [0.672, 1.364],
                    bBoxSW: [0, -1.34]
                },
                accidentalQuarterToneFlatArrowUp: {
                    bBoxNE: [0.992, 2.316],
                    bBoxSW: [-0.168, -0.708]
                },
                accidentalSharp: {
                    bBoxNE: [0.996, 1.4],
                    bBoxSW: [0, -1.392]
                },
                articAccentAbove: {
                    bBoxNE: [1.356, 0.98],
                    bBoxSW: [0, 0.004]
                },
                articAccentBelow: {
                    bBoxNE: [1.356, 0],
                    bBoxSW: [0, -0.976]
                },
                articMarcatoAbove: {
                    bBoxNE: [0.94, 1.012],
                    bBoxSW: [-0.004, -0.004]
                },
                articMarcatoBelow: {
                    bBoxNE: [0.94, 0],
                    bBoxSW: [-0.004, -1.016]
                },
                articStaccatoAbove: {
                    bBoxNE: [0.336, 0.336],
                    bBoxSW: [0, 0]
                },
                articStaccatoBelow: {
                    bBoxNE: [0.336, 0],
                    bBoxSW: [0, -0.336]
                },
                articTenutoAbove: {
                    bBoxNE: [1.352, 0.192],
                    bBoxSW: [-0.004, 0]
                },
                articTenutoBelow: {
                    bBoxNE: [1.352, 0],
                    bBoxSW: [-0.004, -0.192]
                },
                brace: {
                    bBoxNE: [0.328, 3.988],
                    bBoxSW: [0.008, 0]
                },
                bracketBottom: {
                    bBoxNE: [1.876, 0],
                    bBoxSW: [0, -1.18]
                },
                bracketTop: {
                    bBoxNE: [1.876, 1.18],
                    bBoxSW: [0, 0]
                },
                cClef: {
                    bBoxNE: [2.796, 2.024],
                    bBoxSW: [0, -2.024]
                },
                cClef8vb: {
                    bBoxNE: [2.796, 2.024],
                    bBoxSW: [0, -2.964]
                },
                clef15: {
                    bBoxNE: [1.436, 1.02],
                    bBoxSW: [0, -0.012]
                },
                clef8: {
                    bBoxNE: [0.82, 0.988],
                    bBoxSW: [0, 0]
                },
                coda: {
                    bBoxNE: [3.82, 3.592],
                    bBoxSW: [-0.016, -0.632]
                },
                dynamicFF: {
                    bBoxNE: [2.44, 1.776],
                    bBoxSW: [-0.54, -0.608]
                },
                dynamicFFF: {
                    bBoxNE: [3.32, 1.776],
                    bBoxSW: [-0.62, -0.608]
                },
                dynamicFFFF: {
                    bBoxNE: [4.28, 1.776],
                    bBoxSW: [-0.62, -0.608]
                },
                dynamicFFFFF: {
                    bBoxNE: [5.24, 1.776],
                    bBoxSW: [-0.62, -0.608]
                },
                dynamicFFFFFF: {
                    bBoxNE: [6.2, 1.776],
                    bBoxSW: [-0.62, -0.608]
                },
                dynamicForte: {
                    bBoxNE: [1.456, 1.776],
                    bBoxSW: [-0.564, -0.608]
                },
                dynamicFortePiano: {
                    bBoxNE: [2.476, 1.776],
                    bBoxSW: [-0.564, -0.608]
                },
                dynamicForzando: {
                    bBoxNE: [1.988, 1.776],
                    bBoxSW: [-0.564, -0.608]
                },
                dynamicMF: {
                    bBoxNE: [3.272, 1.724],
                    bBoxSW: [-0.08, -0.66]
                },
                dynamicMP: {
                    bBoxNE: [3.3, 1.096],
                    bBoxSW: [-0.08, -0.568]
                },
                dynamicNiente: {
                    bBoxNE: [1.232, 1.096],
                    bBoxSW: [-0.092, -0.04]
                },
                dynamicPF: {
                    bBoxNE: [3.08, 1.776],
                    bBoxSW: [-0.288, -0.608]
                },
                dynamicPP: {
                    bBoxNE: [2.912, 1.096],
                    bBoxSW: [-0.328, -0.568]
                },
                dynamicPPP: {
                    bBoxNE: [4.292, 1.096],
                    bBoxSW: [-0.368, -0.568]
                },
                dynamicPPPP: {
                    bBoxNE: [5.672, 1.096],
                    bBoxSW: [-0.408, -0.568]
                },
                dynamicPPPPP: {
                    bBoxNE: [7.092, 1.096],
                    bBoxSW: [-0.408, -0.568]
                },
                dynamicPPPPPP: {
                    bBoxNE: [8.512, 1.096],
                    bBoxSW: [-0.408, -0.568]
                },
                dynamicPiano: {
                    bBoxNE: [1.464, 1.096],
                    bBoxSW: [-0.356, -0.568]
                },
                dynamicRinforzando1: {
                    bBoxNE: [2.5, 1.776],
                    bBoxSW: [-0.08, -0.608]
                },
                dynamicRinforzando2: {
                    bBoxNE: [2.976, 1.776],
                    bBoxSW: [-0.08, -0.608]
                },
                dynamicSforzando1: {
                    bBoxNE: [2.416, 1.776],
                    bBoxSW: [0, -0.608]
                },
                dynamicSforzandoPianissimo: {
                    bBoxNE: [4.796, 1.776],
                    bBoxSW: [0, -0.608]
                },
                dynamicSforzandoPiano: {
                    bBoxNE: [3.38, 1.776],
                    bBoxSW: [0, -0.608]
                },
                dynamicSforzato: {
                    bBoxNE: [2.932, 1.776],
                    bBoxSW: [0, -0.608]
                },
                dynamicSforzatoFF: {
                    bBoxNE: [3.856, 1.776],
                    bBoxSW: [0, -0.608]
                },
                dynamicSforzatoPiano: {
                    bBoxNE: [4.304, 1.776],
                    bBoxSW: [0, -0.608]
                },
                fClef: {
                    bBoxNE: [2.736, 1.048],
                    bBoxSW: [-0.02, -2.54]
                },
                fClef15ma: {
                    bBoxNE: [2.736, 1.984],
                    bBoxSW: [-0.02, -2.54]
                },
                fClef15mb: {
                    bBoxNE: [2.736, 1.048],
                    bBoxSW: [-0.02, -2.968]
                },
                fClef8va: {
                    bBoxNE: [2.736, 1.98],
                    bBoxSW: [-0.02, -2.54]
                },
                fClef8vb: {
                    bBoxNE: [2.736, 1.048],
                    bBoxSW: [-0.02, -2.976]
                },
                fermataAbove: {
                    bBoxNE: [2.42, 1.316],
                    bBoxSW: [0.012, -0.012]
                },
                fermataLongAbove: {
                    bBoxNE: [2.412, 1.332],
                    bBoxSW: [0, -0.004]
                },
                fermataShortAbove: {
                    bBoxNE: [2.416, 1.364],
                    bBoxSW: [0, 0]
                },
                fretboardO: {
                    bBoxNE: [0.564, 0.564],
                    bBoxSW: [0, 0]
                },
                fretboardX: {
                    bBoxNE: [0.596, 0.596],
                    bBoxSW: [0, 0]
                },
                gClef: {
                    bBoxNE: [2.684, 4.392],
                    bBoxSW: [0, -2.632]
                },
                gClef15ma: {
                    bBoxNE: [2.684, 5.276],
                    bBoxSW: [0, -2.632]
                },
                gClef15mb: {
                    bBoxNE: [2.684, 4.392],
                    bBoxSW: [0, -3.524]
                },
                gClef8va: {
                    bBoxNE: [2.684, 5.28],
                    bBoxSW: [0, -2.632]
                },
                gClef8vb: {
                    bBoxNE: [2.684, 4.392],
                    bBoxSW: [0, -3.512]
                },
                guitarClosePedal: {
                    bBoxNE: [1.144, 1.14],
                    bBoxSW: [0, -0.004]
                },
                guitarFadeIn: {
                    bBoxNE: [1.448, 1.46],
                    bBoxSW: [0, 0]
                },
                guitarFadeOut: {
                    bBoxNE: [1.448, 1.46],
                    bBoxSW: [0, 0]
                },
                guitarGolpe: {
                    bBoxNE: [1.08, 1.128],
                    bBoxSW: [0.004, 0]
                },
                guitarOpenPedal: {
                    bBoxNE: [1.144, 1.144],
                    bBoxSW: [0, 0]
                },
                guitarString0: {
                    bBoxNE: [2.164, 2.156],
                    bBoxSW: [0.004, 0]
                },
                guitarString1: {
                    bBoxNE: [2.16, 2.156],
                    bBoxSW: [0, 0]
                },
                guitarString2: {
                    bBoxNE: [2.16, 2.156],
                    bBoxSW: [0, 0]
                },
                guitarString3: {
                    bBoxNE: [2.16, 2.156],
                    bBoxSW: [0, 0]
                },
                guitarString4: {
                    bBoxNE: [2.164, 2.156],
                    bBoxSW: [0.004, 0]
                },
                guitarString5: {
                    bBoxNE: [2.16, 2.156],
                    bBoxSW: [0, 0]
                },
                guitarString6: {
                    bBoxNE: [2.16, 2.156],
                    bBoxSW: [0, 0]
                },
                guitarString7: {
                    bBoxNE: [2.16, 2.156],
                    bBoxSW: [0, 0]
                },
                guitarString8: {
                    bBoxNE: [2.16, 2.156],
                    bBoxSW: [0, 0]
                },
                guitarString9: {
                    bBoxNE: [2.16, 2.156],
                    bBoxSW: [0, 0]
                },
                guitarVibratoStroke: {
                    bBoxNE: [0.668, 0.476],
                    bBoxSW: [-0.056, 0]
                },
                guitarVolumeSwell: {
                    bBoxNE: [2.896, 1.46],
                    bBoxSW: [0, 0]
                },
                guitarWideVibratoStroke: {
                    bBoxNE: [0.908, 0.896],
                    bBoxSW: [-0.096, 0]
                },
                keyboardPedalPed: {
                    bBoxNE: [4.076, 2.22],
                    bBoxSW: [0, -0.032]
                },
                keyboardPedalUp: {
                    bBoxNE: [1.8, 1.8],
                    bBoxSW: [0, 0]
                },
                noteQuarterUp: {
                    bBoxNE: [1.328, 3.5],
                    bBoxSW: [0, -0.564]
                },
                noteShapeDiamondBlack: {
                    bBoxNE: [1.444, 0.548],
                    bBoxSW: [0, -0.552]
                },
                noteShapeDiamondWhite: {
                    bBoxNE: [1.444, 0.544],
                    bBoxSW: [0, -0.556]
                },
                noteShapeMoonBlack: {
                    bBoxNE: [1.444, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteShapeMoonWhite: {
                    bBoxNE: [1.444, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteShapeRoundBlack: {
                    bBoxNE: [1.456, 0.552],
                    bBoxSW: [0, -0.552]
                },
                noteShapeRoundWhite: {
                    bBoxNE: [1.464, 0.548],
                    bBoxSW: [0, -0.548]
                },
                noteShapeSquareBlack: {
                    bBoxNE: [1.44, 0.46],
                    bBoxSW: [0, -0.46]
                },
                noteShapeSquareWhite: {
                    bBoxNE: [1.44, 0.46],
                    bBoxSW: [0, -0.46]
                },
                noteShapeTriangleLeftBlack: {
                    bBoxNE: [1.44, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteShapeTriangleLeftWhite: {
                    bBoxNE: [1.44, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteShapeTriangleRightBlack: {
                    bBoxNE: [1.44, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteShapeTriangleRightWhite: {
                    bBoxNE: [1.44, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteShapeTriangleRoundBlack: {
                    bBoxNE: [1.424, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteShapeTriangleRoundWhite: {
                    bBoxNE: [1.424, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteShapeTriangleUpBlack: {
                    bBoxNE: [1.424, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteShapeTriangleUpWhite: {
                    bBoxNE: [1.424, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadBlack: {
                    bBoxNE: [1.18, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadCircleSlash: {
                    bBoxNE: [1, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadCircleX: {
                    bBoxNE: [0.996, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadCircleXDoubleWhole: {
                    bBoxNE: [1.688, 0.62],
                    bBoxSW: [0, -0.62]
                },
                noteheadCircleXHalf: {
                    bBoxNE: [1, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadCircleXWhole: {
                    bBoxNE: [0.996, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadCircledBlack: {
                    bBoxNE: [1.284, 0.668],
                    bBoxSW: [-0.084, -0.684]
                },
                noteheadCircledDoubleWhole: {
                    bBoxNE: [2.412, 0.852],
                    bBoxSW: [0, -0.872]
                },
                noteheadCircledHalf: {
                    bBoxNE: [1.244, 0.668],
                    bBoxSW: [-0.072, -0.648]
                },
                noteheadCircledWhole: {
                    bBoxNE: [1.748, 0.844],
                    bBoxSW: [0, -0.9]
                },
                noteheadClusterDoubleWhole3rd: {
                    bBoxNE: [2.428, 1.62],
                    bBoxSW: [0, -0.62]
                },
                noteheadClusterHalf3rd: {
                    bBoxNE: [1.264, 1.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadClusterQuarter3rd: {
                    bBoxNE: [1.44, 1.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadClusterWhole3rd: {
                    bBoxNE: [1.7, 1.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadDiamondBlack: {
                    bBoxNE: [1, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadDiamondBlackWide: {
                    bBoxNE: [1.4, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadDiamondDoubleWhole: {
                    bBoxNE: [1.728, 0.62],
                    bBoxSW: [0, -0.62]
                },
                noteheadDiamondHalf: {
                    bBoxNE: [1.004, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadDiamondWhite: {
                    bBoxNE: [1, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadDiamondWhiteWide: {
                    bBoxNE: [1.4, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadDiamondWhole: {
                    bBoxNE: [1.08, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadDoubleWhole: {
                    bBoxNE: [2.396, 0.62],
                    bBoxSW: [0, -0.62]
                },
                noteheadDoubleWholeSquare: {
                    bBoxNE: [1.664, 0.792],
                    bBoxSW: [0, -0.76]
                },
                noteheadHalf: {
                    bBoxNE: [1.18, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadHeavyX: {
                    bBoxNE: [1.54, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadHeavyXHat: {
                    bBoxNE: [1.828, 1.04],
                    bBoxSW: [-0.292, -0.5]
                },
                noteheadParenthesis: {
                    bBoxNE: [1.472, 0.728],
                    bBoxSW: [-0.292, -0.72]
                },
                noteheadPlusBlack: {
                    bBoxNE: [0.996, 0.5],
                    bBoxSW: [-0.004, -0.5]
                },
                noteheadPlusDoubleWhole: {
                    bBoxNE: [1.892, 0.62],
                    bBoxSW: [0, -0.62]
                },
                noteheadPlusHalf: {
                    bBoxNE: [1.044, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadPlusWhole: {
                    bBoxNE: [1.14, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadRoundWhiteWithDot: {
                    bBoxNE: [1.004, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadSlashVerticalEnds: {
                    bBoxNE: [1.46, 0.996],
                    bBoxSW: [0, -1.004]
                },
                noteheadSlashWhiteHalf: {
                    bBoxNE: [3.12, 1],
                    bBoxSW: [0, -1]
                },
                noteheadSlashWhiteWhole: {
                    bBoxNE: [3.92, 1],
                    bBoxSW: [0, -1]
                },
                noteheadSlashedBlack1: {
                    bBoxNE: [1.5, 0.668],
                    bBoxSW: [-0.32, -0.66]
                },
                noteheadSlashedBlack2: {
                    bBoxNE: [1.504, 0.672],
                    bBoxSW: [-0.316, -0.656]
                },
                noteheadSlashedDoubleWhole1: {
                    bBoxNE: [2.384, 0.672],
                    bBoxSW: [0, -0.716]
                },
                noteheadSlashedDoubleWhole2: {
                    bBoxNE: [2.384, 0.676],
                    bBoxSW: [0, -0.712]
                },
                noteheadSlashedHalf1: {
                    bBoxNE: [1.544, 0.64],
                    bBoxSW: [-0.268, -0.568]
                },
                noteheadSlashedHalf2: {
                    bBoxNE: [1.52, 0.672],
                    bBoxSW: [-0.292, -0.536]
                },
                noteheadSlashedWhole1: {
                    bBoxNE: [1.732, 0.592],
                    bBoxSW: [-0.088, -0.628]
                },
                noteheadSlashedWhole2: {
                    bBoxNE: [1.744, 0.604],
                    bBoxSW: [-0.072, -0.616]
                },
                noteheadSquareBlack: {
                    bBoxNE: [1.252, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadSquareBlackLarge: {
                    bBoxNE: [2, 1],
                    bBoxSW: [0, -1]
                },
                noteheadSquareBlackWhite: {
                    bBoxNE: [2, 1],
                    bBoxSW: [0, -1]
                },
                noteheadSquareWhite: {
                    bBoxNE: [1.252, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadTriangleDownBlack: {
                    bBoxNE: [1.168, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadTriangleDownDoubleWhole: {
                    bBoxNE: [1.932, 0.62],
                    bBoxSW: [0, -0.62]
                },
                noteheadTriangleDownHalf: {
                    bBoxNE: [1.14, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadTriangleDownWhole: {
                    bBoxNE: [1.276, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadTriangleRightBlack: {
                    bBoxNE: [1.356, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadTriangleRightWhite: {
                    bBoxNE: [1.356, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadTriangleUpBlack: {
                    bBoxNE: [1.172, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadTriangleUpDoubleWhole: {
                    bBoxNE: [1.932, 0.62],
                    bBoxSW: [0, -0.62]
                },
                noteheadTriangleUpHalf: {
                    bBoxNE: [1.14, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadTriangleUpWhole: {
                    bBoxNE: [1.276, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadWhole: {
                    bBoxNE: [1.688, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadXBlack: {
                    bBoxNE: [1.16, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadXDoubleWhole: {
                    bBoxNE: [2.184, 0.62],
                    bBoxSW: [0, -0.62]
                },
                noteheadXHalf: {
                    bBoxNE: [1.336, 0.5],
                    bBoxSW: [0, -0.5]
                },
                noteheadXOrnate: {
                    bBoxNE: [0.988, 0.504],
                    bBoxSW: [0, -0.504]
                },
                noteheadXWhole: {
                    bBoxNE: [1.508, 0.5],
                    bBoxSW: [0, -0.5]
                },
                octaveBaselineB: {
                    bBoxNE: [0.796, 1.352],
                    bBoxSW: [0, -0.04]
                },
                octaveBaselineM: {
                    bBoxNE: [1.524, 0.928],
                    bBoxSW: [0, -0.02]
                },
                ornamentMordent: {
                    bBoxNE: [2.916, 1.276],
                    bBoxSW: [0.004, -0.292]
                },
                ornamentShortTrill: {
                    bBoxNE: [2.9, 0.98],
                    bBoxSW: [0, 0]
                },
                ornamentTrill: {
                    bBoxNE: [2.084, 1.56],
                    bBoxSW: [0, -0.04]
                },
                ornamentTurn: {
                    bBoxNE: [1.84, 0.872],
                    bBoxSW: [0, 0]
                },
                ornamentTurnInverted: {
                    bBoxNE: [1.828, 0.872],
                    bBoxSW: [-0.012, 0]
                },
                ottava: {
                    bBoxNE: [1.544, 1.852],
                    bBoxSW: [0, -0.04]
                },
                ottavaAlta: {
                    bBoxNE: [3.54, 1.852],
                    bBoxSW: [0, -0.04]
                },
                ottavaBassaVb: {
                    bBoxNE: [3.184, 1.852],
                    bBoxSW: [0, -0.04]
                },
                pictEdgeOfCymbal: {
                    bBoxNE: [4.828, 2.14],
                    bBoxSW: [0.004, 0]
                },
                quindicesima: {
                    bBoxNE: [2.668, 1.844],
                    bBoxSW: [0, -0.04]
                },
                quindicesimaAlta: {
                    bBoxNE: [5.26, 1.844],
                    bBoxSW: [0, -0.04]
                },
                repeat1Bar: {
                    bBoxNE: [2.128, 1.116],
                    bBoxSW: [0, -1]
                },
                repeat2Bars: {
                    bBoxNE: [3.048, 1.116],
                    bBoxSW: [0, -1]
                },
                repeatDot: {
                    bBoxNE: [0.4, 0.2],
                    bBoxSW: [0, -0.2]
                },
                restDoubleWhole: {
                    bBoxNE: [0.5, 1],
                    bBoxSW: [0, 0]
                },
                restHBarLeft: {
                    bBoxNE: [1.5, 1.048],
                    bBoxSW: [0, -1.08]
                },
                restHBarMiddle: {
                    bBoxNE: [1.42, 0.384],
                    bBoxSW: [-0.108, -0.416]
                },
                restHBarRight: {
                    bBoxNE: [1.5, 1.048],
                    bBoxSW: [0, -1.08]
                },
                restHalf: {
                    bBoxNE: [1.128, 0.568],
                    bBoxSW: [0, -0.008]
                },
                restLonga: {
                    bBoxNE: [0.5, 1],
                    bBoxSW: [0, -0.996]
                },
                restQuarter: {
                    bBoxNE: [1.08, 1.492],
                    bBoxSW: [0.004, -1.5]
                },
                restWhole: {
                    bBoxNE: [1.128, 0.036],
                    bBoxSW: [0, -0.54]
                },
                segno: {
                    bBoxNE: [2.2, 3.036],
                    bBoxSW: [0.016, -0.108]
                },
                stringsDownBow: {
                    bBoxNE: [1.248, 1.272],
                    bBoxSW: [0, 0]
                },
                stringsUpBow: {
                    bBoxNE: [0.996, 1.98],
                    bBoxSW: [0.004, 0.004]
                },
                systemDivider: {
                    bBoxNE: [4.232, 4.24],
                    bBoxSW: [0, -0.272]
                },
                textAugmentationDot: {
                    bBoxNE: [0.4, 0.256],
                    bBoxSW: [0, -0.144]
                },
                textBlackNoteFrac16thLongStem: {
                    bBoxNE: [1.368, 3.512],
                    bBoxSW: [0, -0.56]
                },
                textBlackNoteFrac32ndLongStem: {
                    bBoxNE: [1.368, 3.512],
                    bBoxSW: [0, -0.56]
                },
                textBlackNoteFrac8thLongStem: {
                    bBoxNE: [1.368, 3.512],
                    bBoxSW: [0, -0.56]
                },
                textBlackNoteLongStem: {
                    bBoxNE: [1.328, 3.512],
                    bBoxSW: [0, -0.564]
                },
                textCont16thBeamLongStem: {
                    bBoxNE: [1.368, 3.512],
                    bBoxSW: [0, 2.264]
                },
                textCont32ndBeamLongStem: {
                    bBoxNE: [1.368, 3.512],
                    bBoxSW: [0, 1.504]
                },
                textCont8thBeamLongStem: {
                    bBoxNE: [1.368, 3.512],
                    bBoxSW: [0, 3.012]
                },
                textTuplet3LongStem: {
                    bBoxNE: [0.94, 5.3],
                    bBoxSW: [0, 4.2]
                },
                textTupletBracketEndLongStem: {
                    bBoxNE: [1.272, 4.764],
                    bBoxSW: [0, 3.94]
                },
                textTupletBracketStartLongStem: {
                    bBoxNE: [1.272, 4.764],
                    bBoxSW: [0, 3.94]
                },
                timeSig0: {
                    bBoxNE: [1.8, 1.004],
                    bBoxSW: [0.08, -1]
                },
                timeSig1: {
                    bBoxNE: [1.256, 1.004],
                    bBoxSW: [0.08, -1]
                },
                timeSig2: {
                    bBoxNE: [1.704, 1.016],
                    bBoxSW: [0.08, -1.028]
                },
                timeSig3: {
                    bBoxNE: [1.604, 0.996],
                    bBoxSW: [0.08, -1.004]
                },
                timeSig4: {
                    bBoxNE: [1.8, 1.004],
                    bBoxSW: [0.08, -1]
                },
                timeSig5: {
                    bBoxNE: [1.532, 0.984],
                    bBoxSW: [0.08, -1.004]
                },
                timeSig6: {
                    bBoxNE: [1.656, 1.004],
                    bBoxSW: [0.08, -0.996]
                },
                timeSig7: {
                    bBoxNE: [1.684, 0.996],
                    bBoxSW: [0.08, -1]
                },
                timeSig8: {
                    bBoxNE: [1.664, 1.036],
                    bBoxSW: [0.08, -1.036]
                },
                timeSig9: {
                    bBoxNE: [1.656, 1.004],
                    bBoxSW: [0.08, -0.996]
                },
                timeSigCommon: {
                    bBoxNE: [1.696, 1.004],
                    bBoxSW: [0.02, -0.996]
                },
                timeSigCutCommon: {
                    bBoxNE: [1.672, 1.444],
                    bBoxSW: [0, -1.436]
                },
                tremolo1: {
                    bBoxNE: [0.6, 0.376],
                    bBoxSW: [-0.6, -0.372]
                },
                tremolo2: {
                    bBoxNE: [0.596, 0.748],
                    bBoxSW: [-0.604, -0.748]
                },
                tremolo3: {
                    bBoxNE: [0.6, 1.112],
                    bBoxSW: [-0.6, -1.12]
                },
                unpitchedPercussionClef1: {
                    bBoxNE: [1.528, 1],
                    bBoxSW: [0, -1]
                },
                wiggleSawtooth: {
                    bBoxNE: [3.06, 1.06],
                    bBoxSW: [-0.068, -1.068]
                },
                wiggleSawtoothNarrow: {
                    bBoxNE: [2.06, 1.064],
                    bBoxSW: [-0.072, -1.064]
                },
                wiggleTrill: {
                    bBoxNE: [1.08, 0.836],
                    bBoxSW: [-0.144, 0.392]
                },
                wiggleVibratoMediumFast: {
                    bBoxNE: [1.292, 0.8],
                    bBoxSW: [-0.104, -0.164]
                }
            },
            glyphsWithAnchors: {
                accidentalDoubleFlat: {
                    cutOutNE: [0.988, 0.644],
                    cutOutSE: [1.336, -0.396]
                },
                accidentalFlat: {
                    cutOutNE: [0.252, 0.656],
                    cutOutSE: [0.504, -0.476]
                },
                accidentalNatural: {
                    cutOutNE: [0.192, 0.776],
                    cutOutSW: [0.476, -0.828]
                },
                accidentalQuarterToneFlatArrowUp: {
                    cutOutNE: [0.604, 0.664],
                    cutOutSE: [0.62, -0.452]
                },
                accidentalSharp: {
                    cutOutNE: [0.84, 0.896],
                    cutOutNW: [0.144, 0.568],
                    cutOutSE: [0.84, -0.596],
                    cutOutSW: [0.144, -0.896]
                },
                dynamicFF: {
                    opticalCenter: [1.852, 0]
                },
                dynamicFFF: {
                    opticalCenter: [2.472, 0]
                },
                dynamicFFFF: {
                    opticalCenter: [2.824, 0]
                },
                dynamicFFFFF: {
                    opticalCenter: [2.976, 0]
                },
                dynamicFFFFFF: {
                    opticalCenter: [3.504, 0]
                },
                dynamicForte: {
                    opticalCenter: [1.256, 0]
                },
                dynamicFortePiano: {
                    opticalCenter: [1.5, 0]
                },
                dynamicForzando: {
                    opticalCenter: [1.352, 0]
                },
                dynamicMF: {
                    opticalCenter: [1.796, 0]
                },
                dynamicMP: {
                    opticalCenter: [1.848, 0]
                },
                dynamicNiente: {
                    opticalCenter: [0.616, 0]
                },
                dynamicPF: {
                    opticalCenter: [1.68, 0]
                },
                dynamicPP: {
                    opticalCenter: [1.708, 0]
                },
                dynamicPPP: {
                    opticalCenter: [2.368, 0]
                },
                dynamicPPPP: {
                    opticalCenter: [3.004, 0]
                },
                dynamicPPPPP: {
                    opticalCenter: [3.552, 0]
                },
                dynamicPPPPPP: {
                    opticalCenter: [4.248, 0]
                },
                dynamicPiano: {
                    opticalCenter: [1.22, 0]
                },
                dynamicRinforzando1: {
                    opticalCenter: [1.564, 0]
                },
                dynamicRinforzando2: {
                    opticalCenter: [2.084, 0]
                },
                dynamicSforzando1: {
                    opticalCenter: [1.3, 0]
                },
                dynamicSforzandoPianissimo: {
                    opticalCenter: [1.972, 0]
                },
                dynamicSforzandoPiano: {
                    opticalCenter: [1.904, 0]
                },
                dynamicSforzato: {
                    opticalCenter: [1.76, 0]
                },
                dynamicSforzatoFF: {
                    opticalCenter: [2.276, 0]
                },
                dynamicSforzatoPiano: {
                    opticalCenter: [1.848, 0]
                },
                guitarVibratoStroke: {
                    repeatOffset: [0.608, 0]
                },
                guitarWideVibratoStroke: {
                    repeatOffset: [0.82, 0]
                },
                noteShapeDiamondBlack: {
                    stemDownNW: [0, 0],
                    stemUpSE: [1.444, 0]
                },
                noteShapeDiamondWhite: {
                    stemDownNW: [0, 0],
                    stemUpSE: [1.436, 0]
                },
                noteShapeMoonBlack: {
                    stemDownNW: [0, 0.068],
                    stemUpSE: [1.44, 0.068]
                },
                noteShapeMoonWhite: {
                    stemDownNW: [0, 0.072],
                    stemUpSE: [1.444, 0.068]
                },
                noteShapeRoundBlack: {
                    stemDownNW: [0, -0.168],
                    stemUpSE: [1.444, 0.184]
                },
                noteShapeRoundWhite: {
                    stemDownNW: [0, -0.168],
                    stemUpSE: [1.456, 0.192]
                },
                noteShapeSquareBlack: {
                    stemDownNW: [0, 0.46],
                    stemUpSE: [1.44, -0.46]
                },
                noteShapeSquareWhite: {
                    stemDownNW: [0, 0.46],
                    stemUpSE: [1.44, -0.46]
                },
                noteShapeTriangleLeftBlack: {
                    stemDownNW: [0, 0.5],
                    stemUpSE: [1.436, -0.5]
                },
                noteShapeTriangleLeftWhite: {
                    stemDownNW: [0, 0.5],
                    stemUpSE: [1.436, -0.5]
                },
                noteShapeTriangleRightBlack: {
                    stemDownNW: [0, 0.476],
                    stemUpSE: [1.44, -0.5]
                },
                noteShapeTriangleRightWhite: {
                    stemDownNW: [0, 0.476],
                    stemUpSE: [1.44, -0.5]
                },
                noteShapeTriangleRoundBlack: {
                    stemDownNW: [0, 0.172],
                    stemUpSE: [1.424, 0.172]
                },
                noteShapeTriangleRoundWhite: {
                    stemDownNW: [0, 0.172],
                    stemUpSE: [1.424, 0.172]
                },
                noteShapeTriangleUpBlack: {
                    stemDownNW: [0, -0.5],
                    stemUpSE: [1.424, -0.5]
                },
                noteShapeTriangleUpWhite: {
                    stemDownNW: [0, -0.5],
                    stemUpSE: [1.424, -0.5]
                },
                noteheadBlack: {
                    cutOutNW: [0.208, 0.3],
                    cutOutSE: [0.94, -0.296],
                    splitStemDownNE: [0.968, -0.248],
                    splitStemDownNW: [0.12, -0.416],
                    splitStemUpSE: [1.092, 0.392],
                    splitStemUpSW: [0.312, 0.356],
                    stemDownNW: [0, -0.168],
                    stemUpSE: [1.18, 0.168]
                },
                noteheadCircleSlash: {
                    stemDownNW: [0.004, 0],
                    stemUpSE: [1, 0]
                },
                noteheadCircleX: {
                    stemDownNW: [0, 0],
                    stemUpSE: [0.996, 0]
                },
                noteheadCircleXDoubleWhole: {
                    noteheadOrigin: [0.352, 0]
                },
                noteheadCircleXHalf: {
                    stemDownNW: [0, 0],
                    stemUpSE: [1, 0]
                },
                noteheadCircledBlack: {
                    stemDownNW: [0, -0.164],
                    stemUpSE: [1.18, 0.168]
                },
                noteheadCircledDoubleWhole: {
                    noteheadOrigin: [0.356, 0]
                },
                noteheadCircledHalf: {
                    stemDownNW: [0, -0.144],
                    stemUpSE: [1.172, 0.156]
                },
                noteheadClusterDoubleWhole3rd: {
                    noteheadOrigin: [0.364, 0]
                },
                noteheadClusterHalf3rd: {
                    stemDownNW: [0, -0.164],
                    stemUpSE: [1.264, 1.144]
                },
                noteheadClusterQuarter3rd: {
                    stemDownNW: [0, 0.26],
                    stemUpSE: [1.44, 0.744]
                },
                noteheadDiamondBlack: {
                    stemDownNW: [0, 0],
                    stemUpSE: [1, 0]
                },
                noteheadDiamondBlackWide: {
                    stemDownNW: [0, 0],
                    stemUpSE: [1.4, 0]
                },
                noteheadDiamondDoubleWhole: {
                    noteheadOrigin: [0.324, 0]
                },
                noteheadDiamondHalf: {
                    stemDownNW: [0, 0],
                    stemUpSE: [1.004, 0]
                },
                noteheadDiamondWhite: {
                    stemDownNW: [0, 0],
                    stemUpSE: [1, 0]
                },
                noteheadDiamondWhiteWide: {
                    stemDownNW: [0, 0.004],
                    stemUpSE: [1.4, 0]
                },
                noteheadDoubleWhole: {
                    noteheadOrigin: [0.36, 0]
                },
                noteheadHalf: {
                    cutOutNW: [0.204, 0.296],
                    cutOutSE: [0.98, -0.3],
                    splitStemDownNE: [0.956, -0.3],
                    splitStemDownNW: [0.128, -0.428],
                    splitStemUpSE: [1.108, 0.372],
                    splitStemUpSW: [0.328, 0.38],
                    stemDownNW: [0, -0.168],
                    stemUpSE: [1.18, 0.168]
                },
                noteheadHeavyX: {
                    stemDownNW: [0, -0.436],
                    stemUpSE: [1.54, 0.44]
                },
                noteheadHeavyXHat: {
                    stemDownNW: [0, -0.436],
                    stemUpSE: [1.54, 0.456]
                },
                noteheadPlusBlack: {
                    stemDownNW: [-0.004, 0],
                    stemUpSE: [0.996, 0]
                },
                noteheadPlusDoubleWhole: {
                    noteheadOrigin: [0.372, 0]
                },
                noteheadPlusHalf: {
                    stemDownNW: [0, -0.112],
                    stemUpSE: [1.044, 0.088]
                },
                noteheadRoundWhiteWithDot: {
                    stemDownNW: [0, 0],
                    stemUpSE: [1.004, 0]
                },
                noteheadSlashVerticalEnds: {
                    stemDownNW: [0, -0.664],
                    stemUpSE: [1.46, 0.656]
                },
                noteheadSlashWhiteHalf: {
                    stemDownNW: [0, -1],
                    stemUpSE: [3.12, 1]
                },
                noteheadSlashedBlack1: {
                    stemDownNW: [0, -0.172],
                    stemUpSE: [1.18, 0.164]
                },
                noteheadSlashedBlack2: {
                    stemDownNW: [0, -0.172],
                    stemUpSE: [1.18, 0.164]
                },
                noteheadSlashedDoubleWhole1: {
                    noteheadOrigin: [0.356, 0]
                },
                noteheadSlashedDoubleWhole2: {
                    noteheadOrigin: [0.356, 0]
                },
                noteheadSlashedHalf1: {
                    stemDownNW: [0, -0.168],
                    stemUpSE: [1.168, 0.164]
                },
                noteheadSlashedHalf2: {
                    stemDownNW: [0, -0.164],
                    stemUpSE: [1.172, 0.168]
                },
                noteheadSquareBlack: {
                    stemDownNW: [0, -0.5],
                    stemUpSE: [1.252, 0.5]
                },
                noteheadSquareBlackLarge: {
                    stemDownNW: [0, 0],
                    stemUpSE: [2, 0]
                },
                noteheadSquareBlackWhite: {
                    stemDownNW: [0, -1],
                    stemUpSE: [2, 1]
                },
                noteheadSquareWhite: {
                    stemDownNW: [0, -0.5],
                    stemUpSE: [1.252, 0.5]
                },
                noteheadTriangleDownBlack: {
                    stemDownNW: [0, 0.5],
                    stemUpSE: [1.168, 0.5]
                },
                noteheadTriangleDownDoubleWhole: {
                    noteheadOrigin: [0.384, 0]
                },
                noteheadTriangleDownHalf: {
                    stemDownNW: [0, 0.464],
                    stemUpSE: [1.14, 0.464]
                },
                noteheadTriangleRightBlack: {
                    stemDownNW: [0, -0.5],
                    stemUpSE: [1.356, 0.5]
                },
                noteheadTriangleRightWhite: {
                    stemDownNW: [0, -0.5],
                    stemUpSE: [1.356, 0.5]
                },
                noteheadTriangleUpBlack: {
                    stemDownNW: [0, -0.5],
                    stemUpSE: [1.172, -0.5]
                },
                noteheadTriangleUpDoubleWhole: {
                    noteheadOrigin: [0.34, 0]
                },
                noteheadTriangleUpHalf: {
                    stemDownNW: [0, -0.46],
                    stemUpSE: [1.14, -0.46]
                },
                noteheadWhole: {
                    cutOutNW: [0.172, 0.332],
                    cutOutSE: [1.532, -0.364]
                },
                noteheadXBlack: {
                    stemDownNW: [0, -0.44],
                    stemUpSE: [1.16, 0.444]
                },
                noteheadXDoubleWhole: {
                    noteheadOrigin: [0.348, 0]
                },
                noteheadXHalf: {
                    stemDownNW: [0, -0.412],
                    stemUpSE: [1.336, 0.412]
                },
                noteheadXOrnate: {
                    stemDownNW: [0, -0.312],
                    stemUpSE: [0.988, 0.316]
                },
                wiggleSawtooth: {
                    repeatOffset: [2.992, 0]
                },
                wiggleSawtoothNarrow: {
                    repeatOffset: [1.996, 0]
                },
                wiggleTrill: {
                    repeatOffset: [0.948, 0]
                },
                wiggleVibratoMediumFast: {
                    repeatOffset: [1.18, 0]
                }
            }
        };
    // end bravura_alphatab_metadata.json
}
