import { Clef } from '@src/model/Clef';
import { Duration } from '@src/model/Duration';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { Ottavia } from '@src/model/Ottavia';

/**
 * This class holds all SMuFL metrics we use in alphaTab like sizes,
 * spacings etc.
 */
export class SmuflMetrics {
    public readonly RawLineSpacing: number = 8;
    public get stemWidth(): number {
        return 0.12 /*bravura stemThickness */ * this.RawLineSpacing;
    }
    public get staffLineThickness(): number {
        return 0.13 /*bravura staffLineThickness */ * this.RawLineSpacing;
    }
    public get beamThickness(): number {
        return 0.5 /*bravura beamThickness */ * this.RawLineSpacing;
    }
    public get beamSpacing(): number {
        return 0.25 /*bravura beamSpacing */ * this.RawLineSpacing;
    }

    public get numberedBarRendererBarSpacing() {
        return this.beamSpacing + this.beamThickness;
    }
    public readonly numberedBarRendererBarSize = 2;
    public readonly numberedBarRendererDotSpacing = 5;
    public readonly numberedBarRendererDotSize = 2;

    public readonly crescendoHeight = 17;
    public readonly barTempoHeight = 25;

    public readonly numberedDashGlyphPadding = 3;
    public readonly numberedDashGlyphWidth = 14;
    public readonly simileMarkSimpleWidth = 20;
    public readonly simileMarkDoubleWidth = 28;
    public readonly tupletOffset = 10;
    public readonly tupletSize = 15;
    public readonly tupletTextMargin = 3;
    public readonly lineBarRendererOverflowFontSiteToPadding = 0.2;
    public readonly lineBarRendererTupletFontSiteToPadding = 0.3;
    public readonly graceFlagSizeX = 12;
    public readonly graceFlagSizeY = 15;
    public readonly flagStemOffset = 0.5;
    public readonly flagStemSize = 3;
    public readonly brokenBarOffset = 6;
    public readonly numberedBarRendererLineHeightCount = 5;
    public readonly scoreBarRendererLineHeightCount = 5;
    public readonly slashBarRendererLineHeightCount = 5;
    public readonly numberedBarRendererDotPadding = 4;
    public readonly numberedBarRendererPreTimeSignaturePadding = 5;
    public readonly scoreBarRendererPreTimeSignaturePadding = 5;
    public readonly slashBarRendererPreTimeSignaturePadding = 5;
    public readonly tabBarRendererPreTimeSignaturePadding = 5;
    public readonly scoreBarRendererBeamMaxDistance = 10;
    public readonly clefTopPadding = 0.5;
    public readonly tabLineSpacing: number = 10;
    public readonly tabNumberSpacePadding: number = 1;
    public readonly tabClefLeftPadding: number = 5;
    public readonly slightNoteVibratoScale: number = 1.2;
    public readonly wideNoteVibratoScale: number = 1.2;
    public readonly accentuationPadding: number = 2;
    public readonly accidentalHeight: number = 21;
    public readonly alternateEndingsPaddingX: number = 3;
    public readonly alternateEndingsPaddingY: number = 5;
    public readonly alternateEndingsCloseLinePadding: number = 4;
    public readonly articStaccatoAbovePaddingX: number = 3;
    public readonly articStaccatoAbovePaddingY: number = 5;
    public readonly barLineWidth: number = 1
    public readonly heavyBarLineWidth: number = 4;
    public readonly dottedBarLineCircleRadius: number = 1;
    public readonly dashedBarLineSize: number = 4;
    public readonly repeatDotsCircleSize: number = 1.5;
    public readonly repeatDotsCircleOffset: number = 3;
    public readonly barLineSpace: number = 3;
    public readonly barNumberMarginPaddingRight: number = 5;
    public readonly barTempoTextPaddingScale: number = 0.7;
    public readonly barTempoSymbolYScale: number = 0.8;
    public readonly barTempoSymbolScale: number = 0.5;
    public readonly barTempoValuePadding: number = 3;
    public readonly graceBeatPadding: number = 3;
    public readonly graceBeatPostBeatStretch: number = 7;
    public readonly beatPaddingFlagEighthAndAbove: number = 20;
    public readonly beatPaddingOneHundredAndAbove: number = 10;
    public readonly beatTimerPaddingX: number = 2;
    public readonly beatTimerPaddingY: number = 2;
    public readonly beatTimerMarginY: number = 2;
    public readonly slightBeatVibratoStepSize: number = 12;
    public readonly wideBeatVibratoStepSize: number = 23;
    public readonly beatVibratoHeight: number = 15;
    public readonly bendNoteHeadElementPadding: number = 2;
    public readonly chordDiagramPaddingX: number = 5;
    public readonly chordDiagramPaddingY: number = 2;
    public readonly chordDiagramCircleRadius: number = 2.5;
    public readonly chordDiagramStringSpacing: number = 10;
    public readonly chordDiagramFretSpacing: number = 12;
    public readonly chordDiagramFontToRow: number = 1.5;
    public readonly chordDiagramNutHeight: number = 2;
    public readonly chordDiagramFretHeight: number = 1;
    public readonly circleGlyphPadding: number = 3;
    public readonly clefOttavaOffsetX = new Map<Ottavia, number>([
        [Ottavia._15ma, -4],
        [Ottavia._8va, -2],
        [Ottavia._8vb, -6],
        [Ottavia._15mb, -8],
    ]);
    public readonly clefOffsetYTop = new Map<Clef, number>([
        [Clef.Neutral, -12],
        [Clef.C3, -19],
        [Clef.C4, -19],
        [Clef.F4, -9],
        [Clef.G2, -37],
    ]);
    public readonly clefOffsetY = new Map<Clef, number>([
        [Clef.Neutral, -15],
        [Clef.C3, 27],
        [Clef.C4, 27],
        [Clef.F4, 27],
        [Clef.G2, 30],
    ]);
    public readonly clefOffsetX = new Map<Clef, number>([
        [Clef.Neutral, 0],
        [Clef.C3, 0],
        [Clef.C4, 0],
        [Clef.F4, -4],
        [Clef.G2, 0],
    ]);
    public readonly clefOttavaScale: number = 0.5;
    public readonly deadSlappedBeatWidth: number = 26;
    public readonly deadSlappedLineWidth: number = 2;
    public readonly targetDirectionGlyphHeight: number = 27;
    public readonly targetDirectionGlyphScale: number = 0.8;
    public readonly jumpDirectionFontSizeToHeight: number = 1.5;
    public readonly directionsContainerPadding: number = 3;
    public readonly dynamicsScale: number = 0.6;
    public readonly flagWidth: number = 11;
    public readonly ghostParenthesisSize: number = 6;
    public readonly leftHandTappingPadding: number = 6;
    public readonly leftHandTappingCircleScale: number = 0.625;
    

    public readonly lineRangedGlyphSpacing: number = 3;
    public readonly lineRangedGlyphTopPadding: number = 4;
    public readonly lineRangedGlyphTopOffset: number = 5;
    public readonly lineRangedGlyphSize: number = 8;
    
    public readonly multiBarRestWidth: number = 60;
    public readonly multiBarRestPadding: number = 10;
    public readonly graceNoteHeadPadding: number = 1;
    public readonly trillTextPadding: number = 3;
    public readonly noteOrnamentBottomOffset: number = 4;
    public readonly numberedBeatPostAccidentalPadding: number = 4;
    public readonly numberedBeatNoteYTopPadding: number = 2;
    public readonly slashBeatNoteYTopPadding: number = 2;
    public readonly slashBeatNoteDotPadding: number = 5;
    public readonly slashBeatNoteDotSize: number = 1.5;
    public readonly numberedBeatNoteDotPadding: number = 5;
    public readonly numberedBeatNoteDotSize: number = 1.5;
    public readonly numberedKeySignatureScale: number = 0.7;
    public readonly numberedNoteHeadWidth: number = 12;
    public readonly numberedNoteHeadHeight: number = 17;
    public readonly numberedTieEmptySize: number = 20;
    public readonly ottavaScale: number = 0.8;
    public readonly ottavaLineSize: number = 8;
    public readonly ottavaLineSpacing: number = 3;
    public readonly ottavaPaddingY: number = 2;
    public readonly pictEdgeOfCymbalScale: number = 0.5;
    public readonly pictEdgeOfCymbalOffsetX: number = 3;
    public readonly rowContainerPadding: number = 3;
    public readonly scoreBeatGhostSpace: number = 4;
    public readonly scoreBeatNoteDotPadding: number = 5;
    public readonly scoreBeatNoteDotSize: number = 1.5;
    public readonly scorePreNotePadding: number = 4;
    public readonly scorePreFingeringPadding: number = 2;
    public readonly scorePreAccidentalPadding: number = 2;
    public readonly scoreBendEndPadding: number = 8;
    public readonly scoreBendHoldOffset: number = 4;
    public readonly scoreBendHoldSize: number = 22;
    public readonly arpeggioWidth: number = 10;
    public readonly arpeggioVibratoScale: number = 1.2;
    public readonly arpeggioArrowSize: number = 8;
    public readonly arpeggioXOffset: number = 5;
    public readonly scoreHelperNotesEndPadding: number =((10 / 2) | 0) + 3;
    public readonly scoreHelperNotesEndPadding2: number  = 10;
    public readonly scoreNoteBelowEffectSpacing: number  = 1;
    public readonly scoreTremoloOffsetUp = new Map<Duration, number>([
        [Duration.ThirtySecond, -15],
        [Duration.Sixteenth, -12],
        [Duration.Eighth, -10],
    ]);
    public readonly scoreTremoloOffsetUpOther = -10;
    public readonly scoreTremoloOffsetDown = new Map<Duration, number>([
        [Duration.ThirtySecond, 15],
        [Duration.Sixteenth, 15],
        [Duration.Eighth, 10],
    ]);
    public readonly scoreTremoloOffsetDownOther = 15;
    public readonly scoreSlideLineSizeX = 12;
    public readonly scoreSlideLineEndPadding = 2;
    public readonly scoreSlideLineOffsetX = 2;
    public readonly scoreSlideLineOffsetY = 2;
    public readonly scoreSlideVibratoScale = 1.2;
    public readonly scoreTimeSignatureCommonScale = 1;
    public readonly scoreTimeSignatureNumberScale = 1;
    public get scoreWhammySimpleDipHeight() { return this.tabWhammyPerHalfSize * 2; };
    public readonly scoreWhammySimpleDipPadding = 2;
    public readonly scoreWhammyFontSizeToOverflow = 1.5;
    public readonly scoreWhammySongBookPadding = 2;
    public readonly slashNoteHeadEffectSpacing = 7;
    public readonly slashTieEmptyHeight = 15;
    public readonly slashTieEmptyWidth = 20;
    public readonly stringNumberCirclePadding = 3;
    public readonly sustainPedalTextLinePadding = 3;
    public readonly sustainPedalStarLinePadding = 3;
    public readonly sustainPedalLineWidth = 1;
    public readonly tabTremoloOffsetX = new Map<Duration, number>([
        [Duration.ThirtySecond, 10],
        [Duration.Sixteenth, 5],
        [Duration.Eighth, 0],
    ]);
    public readonly tabTremoloXDefault = 5;
    public readonly tabNoteDotPadding = 5;
    public readonly tabNoteDotSize = 1.5;
    public readonly tabPreNotesPadding = 4;
    public readonly tabBendArrowSize: number = 6;
    public readonly tabBendDashSize: number = 3;
    public readonly tabBendBendValueHeight: number = 6;
    public readonly tabPreBendPadding: number = 2;
    public readonly tabBendVibratoScale: number = 1.2;
    public readonly tabBendFontSizeToHeight: number = 1.3;
    public readonly tabBendFontSizeToPadding: number = 0.5;
    public readonly tabBendLabelYOffset: number = 2;
    public readonly tabBrushWidth: number = 10;
    public readonly tabBrushArrowSize: number = 8;
    public readonly tabBrushVibratoScale: number = 1.2;
    public readonly tabBrushArpeggioOffset: number = 4;
    public readonly tabClefOffsetX: number = 5;
    public readonly tabNoteYTopOffset: number = 2;
    public readonly tabNoteChordEffectSpacing: number = 7;
    public readonly tabRestInvisibleWidth: number = 10;
    public readonly tabSlideSizeX: number = 12;
    public readonly tabSlideSizeY: number = 3;
    public readonly tabSlideOffsetX: number = 2;
    public readonly tabSlideVibratoScale: number = 1.2;
    public readonly tabTieEmptyHeight: number = 15;
    public readonly tabTieEmptyWidth: number = 20;

    public readonly tabWhammyPerHalfSize = 6;
    public readonly tabWhammyDashSize = 3;
    public readonly tabWhammySimpleDipPadding = 2;
    public readonly tabWhammyTextPadding = 2;
    public readonly tieSize = 4;
    public readonly tieHeight= 22;
    public readonly bendSlurHeight= 11;
    public readonly timeSignatureNumberHeight= 18;
    public readonly timeSignatureGhostParenthesisLeftPadding= 10;
    public readonly timeSignatureGhostParenthesisRightPadding= 13;
    public readonly trillWaveScale= 1.2;
    public readonly trillLoopHeightToY = 1.37;
    public readonly tripletFeelNoteScale = 0.5;
    public readonly tripletFeelTupletScale = 0.7;
    public readonly tripletFeelHeight = 25;
    public readonly tripletFeelYPadding = 8;
    public readonly tripletFeelBracketsHeightToY = 0.3;
    public readonly tripletFeelLeftNoteXPadding = 10;
    public readonly tripletFeelRightNoteXPadding = 40;
    public readonly tripletFeelCircleOffset = 9;
    public readonly tripletFeelCircleSize = 1;
    public readonly tripletFeelEqualsOffsetX =32;
    public readonly tripletFeelEqualsOffsetY =5;
    public readonly tripletFeelAugmentationOffsetX =7;
    public readonly tripletFeelCloseParenthesisOffsetX =65;
    public readonly tuningGlyphCircleNumberScale =0.7;
    public readonly tuningGlyphRowHeight =15;
    public readonly tuningGlyphTextPadding =1;
    public readonly tuningGlyphStringColumnWidth = 64;
    public readonly tuningGlyphEndPaddingX = 15;
    public readonly scoreInfoFontSizeToHeight = 1.2;
    public readonly staffSystemSeparatorOffsetY = 10;

    public readonly systemSignSeparatorHeight = 40;
    public readonly systemSignSeparatorWidth = 36;


    public readonly barStemSizes:Map<Duration, number> = new Map<Duration, number>([
        [Duration.QuadrupleWhole, 6],
        [Duration.Half, 6],
        [Duration.QuadrupleWhole, 6],
        [Duration.Eighth, 6],
        [Duration.Sixteenth, 6],
        [Duration.ThirtySecond, 8],
        [Duration.Sixteenth, 9],
        [Duration.OneHundredTwentyEighth, 9],
        [Duration.TwoHundredFiftySixth, 10],
    ]);

    public stringsToTabClefSymbolAndScale(strings: number): [MusicFontSymbol, number] {
        if (strings <= 4) {
            return [MusicFontSymbol.FourStringTabClef, strings / 4.5];
        }

        return [MusicFontSymbol.SixStringTabClef, strings / 6.5];
    }

    /**
     * The widths of the bounding box for the respective glyphs.
     */
    public readonly GlyphWidths: Map<MusicFontSymbol, number> = new Map<MusicFontSymbol, number>([
        [MusicFontSymbol.Brace, 3],
        [MusicFontSymbol.BracketTop, 0],
        [MusicFontSymbol.BracketBottom, 0],
        [MusicFontSymbol.SystemDivider, 0],

        [MusicFontSymbol.GClef, 28],
        [MusicFontSymbol.CClef, 28],
        [MusicFontSymbol.FClef, 28],
        [MusicFontSymbol.UnpitchedPercussionClef1, 15],
        [MusicFontSymbol.SixStringTabClef, 28],
        [MusicFontSymbol.FourStringTabClef, 28],

        [MusicFontSymbol.TimeSig0, 14],
        [MusicFontSymbol.TimeSig1, 10],
        [MusicFontSymbol.TimeSig2, 14],
        [MusicFontSymbol.TimeSig3, 14],
        [MusicFontSymbol.TimeSig4, 14],
        [MusicFontSymbol.TimeSig5, 14],
        [MusicFontSymbol.TimeSig6, 14],
        [MusicFontSymbol.TimeSig7, 14],
        [MusicFontSymbol.TimeSig8, 14],
        [MusicFontSymbol.TimeSig9, 14],
        [MusicFontSymbol.TimeSigCommon, 14],
        [MusicFontSymbol.TimeSigCutCommon, 14],

        [MusicFontSymbol.NoteheadDoubleWholeSquare, 14],
        [MusicFontSymbol.NoteheadDoubleWhole, 14],
        [MusicFontSymbol.NoteheadWhole, 14],
        [MusicFontSymbol.NoteheadHalf, 9],
        [MusicFontSymbol.NoteheadBlack, 9],
        [MusicFontSymbol.NoteheadNull, 9],
        [MusicFontSymbol.NoteheadXOrnate, 9],

        [MusicFontSymbol.NoteheadPlusDoubleWhole, 16],
        [MusicFontSymbol.NoteheadPlusWhole, 10],
        [MusicFontSymbol.NoteheadPlusHalf, 10],
        [MusicFontSymbol.NoteheadPlusBlack, 10],

        [MusicFontSymbol.NoteheadSquareWhite, 11],
        [MusicFontSymbol.NoteheadSquareBlack, 11],

        [MusicFontSymbol.NoteheadTriangleUpDoubleWhole, 16],
        [MusicFontSymbol.NoteheadTriangleUpWhole, 11],
        [MusicFontSymbol.NoteheadTriangleUpHalf, 11],
        [MusicFontSymbol.NoteheadTriangleUpBlack, 11],

        [MusicFontSymbol.NoteheadTriangleRightWhite, 11],
        [MusicFontSymbol.NoteheadTriangleRightBlack, 11],

        [MusicFontSymbol.NoteheadTriangleDownDoubleWhole, 16],
        [MusicFontSymbol.NoteheadTriangleDownWhole, 11],
        [MusicFontSymbol.NoteheadTriangleDownHalf, 11],
        [MusicFontSymbol.NoteheadTriangleDownBlack, 11],

        [MusicFontSymbol.NoteheadDiamondDoubleWhole, 16],
        [MusicFontSymbol.NoteheadDiamondWhole, 9],
        [MusicFontSymbol.NoteheadDiamondHalf, 9],
        [MusicFontSymbol.NoteheadDiamondBlack, 9],

        [MusicFontSymbol.NoteheadDiamondBlackWide, 10],
        [MusicFontSymbol.NoteheadDiamondWhite, 9],
        [MusicFontSymbol.NoteheadDiamondWhiteWide, 9],
        [MusicFontSymbol.NoteheadCircleXDoubleWhole, 16],
        [MusicFontSymbol.NoteheadCircleXWhole, 9],
        [MusicFontSymbol.NoteheadCircleXHalf, 9],
        [MusicFontSymbol.NoteheadCircleX, 9],
        [MusicFontSymbol.NoteheadXDoubleWhole, 16],
        [MusicFontSymbol.NoteheadXWhole, 9],
        [MusicFontSymbol.NoteheadXHalf, 9],
        [MusicFontSymbol.NoteheadXBlack, 9],
        [MusicFontSymbol.NoteheadParenthesis, 9],
        [MusicFontSymbol.NoteheadSlashedBlack1, 9],
        [MusicFontSymbol.NoteheadSlashedBlack2, 9],
        [MusicFontSymbol.NoteheadSlashedHalf1, 9],
        [MusicFontSymbol.NoteheadSlashedHalf2, 9],
        [MusicFontSymbol.NoteheadSlashedWhole1, 9],
        [MusicFontSymbol.NoteheadSlashedWhole2, 9],
        [MusicFontSymbol.NoteheadSlashedDoubleWhole1, 16],
        [MusicFontSymbol.NoteheadSlashedDoubleWhole2, 16],

        [MusicFontSymbol.NoteheadCircledBlack, 9],
        [MusicFontSymbol.NoteheadCircledHalf, 9],
        [MusicFontSymbol.NoteheadCircledWhole, 9],
        [MusicFontSymbol.NoteheadCircledDoubleWhole, 16],

        [MusicFontSymbol.NoteheadCircleSlash, 9],
        [MusicFontSymbol.NoteheadHeavyX, 13],
        [MusicFontSymbol.NoteheadHeavyXHat, 13],

        [MusicFontSymbol.NoteheadSlashVerticalEnds, 12],
        [MusicFontSymbol.NoteheadSlashWhiteWhole, 32],
        [MusicFontSymbol.NoteheadSlashWhiteHalf, 25],

        [MusicFontSymbol.NoteheadRoundWhiteWithDot, 9],

        [MusicFontSymbol.NoteheadSquareBlackLarge, 9],
        [MusicFontSymbol.NoteheadSquareBlackWhite, 9],

        [MusicFontSymbol.NoteheadClusterDoubleWhole3rd, 16],
        [MusicFontSymbol.NoteheadClusterWhole3rd, 12],
        [MusicFontSymbol.NoteheadClusterHalf3rd, 12],
        [MusicFontSymbol.NoteheadClusterQuarter3rd, 12],

        [MusicFontSymbol.NoteShapeRoundWhite, 9],
        [MusicFontSymbol.NoteShapeRoundBlack, 9],

        [MusicFontSymbol.NoteShapeSquareWhite, 12],
        [MusicFontSymbol.NoteShapeSquareBlack, 12],

        [MusicFontSymbol.NoteShapeTriangleRightWhite, 12],
        [MusicFontSymbol.NoteShapeTriangleRightBlack, 12],

        [MusicFontSymbol.NoteShapeTriangleLeftWhite, 12],
        [MusicFontSymbol.NoteShapeTriangleLeftBlack, 12],

        [MusicFontSymbol.NoteShapeDiamondWhite, 9],
        [MusicFontSymbol.NoteShapeDiamondBlack, 9],

        [MusicFontSymbol.NoteShapeTriangleUpWhite, 12],
        [MusicFontSymbol.NoteShapeTriangleUpBlack, 12],

        [MusicFontSymbol.NoteShapeMoonWhite, 12],
        [MusicFontSymbol.NoteShapeMoonBlack, 12],

        [MusicFontSymbol.NoteShapeTriangleRoundWhite, 12],
        [MusicFontSymbol.NoteShapeTriangleRoundBlack, 12],

        [MusicFontSymbol.NoteQuarterUp, 10],
        [MusicFontSymbol.NoteEighthUp, 10],

        [MusicFontSymbol.TextBlackNoteLongStem, 0],
        [MusicFontSymbol.TextBlackNoteFrac8thLongStem, 0],
        [MusicFontSymbol.TextBlackNoteFrac16thLongStem, 0],
        [MusicFontSymbol.TextBlackNoteFrac32ndLongStem, 0],

        [MusicFontSymbol.TextCont8thBeamLongStem, 0],
        [MusicFontSymbol.TextCont16thBeamLongStem, 0],
        [MusicFontSymbol.TextCont32ndBeamLongStem, 0],

        [MusicFontSymbol.TextAugmentationDot, 0],
        [MusicFontSymbol.TextTupletBracketStartLongStem, 0],
        [MusicFontSymbol.TextTuplet3LongStem, 0],
        [MusicFontSymbol.TextTupletBracketEndLongStem, 0],

        [MusicFontSymbol.Tremolo3, 12],
        [MusicFontSymbol.Tremolo2, 12],
        [MusicFontSymbol.Tremolo1, 12],

        [MusicFontSymbol.FlagEighthUp, 0],
        [MusicFontSymbol.FlagEighthDown, 0],
        [MusicFontSymbol.FlagSixteenthUp, 0],
        [MusicFontSymbol.FlagSixteenthDown, 0],
        [MusicFontSymbol.FlagThirtySecondUp, 0],
        [MusicFontSymbol.FlagThirtySecondDown, 0],
        [MusicFontSymbol.FlagSixtyFourthUp, 0],
        [MusicFontSymbol.FlagSixtyFourthDown, 0],
        [MusicFontSymbol.FlagOneHundredTwentyEighthUp, 0],
        [MusicFontSymbol.FlagOneHundredTwentyEighthDown, 0],
        [MusicFontSymbol.FlagTwoHundredFiftySixthUp, 0],
        [MusicFontSymbol.FlagTwoHundredFiftySixthDown, 0],

        [MusicFontSymbol.AccidentalFlat, 8],
        [MusicFontSymbol.AccidentalNatural, 8],
        [MusicFontSymbol.AccidentalSharp, 8],
        [MusicFontSymbol.AccidentalDoubleSharp, 8],
        [MusicFontSymbol.AccidentalDoubleFlat, 18],
        [MusicFontSymbol.AccidentalQuarterToneFlatArrowUp, 8],
        [MusicFontSymbol.AccidentalQuarterToneSharpArrowUp, 8],
        [MusicFontSymbol.AccidentalQuarterToneNaturalArrowUp, 8],

        [MusicFontSymbol.Segno, 0],
        [MusicFontSymbol.Coda, 0],

        [MusicFontSymbol.ArticAccentAbove, 9],
        [MusicFontSymbol.ArticAccentBelow, 9],
        [MusicFontSymbol.ArticStaccatoAbove, 9],
        [MusicFontSymbol.ArticStaccatoBelow, 9],
        [MusicFontSymbol.ArticTenutoAbove, 9],
        [MusicFontSymbol.ArticTenutoBelow, 9],
        [MusicFontSymbol.ArticMarcatoAbove, 9],
        [MusicFontSymbol.ArticMarcatoBelow, 9],

        [MusicFontSymbol.FermataAbove, 23],
        [MusicFontSymbol.FermataShortAbove, 23],
        [MusicFontSymbol.FermataLongAbove, 23],

        [MusicFontSymbol.RestLonga, 9],
        [MusicFontSymbol.RestDoubleWhole, 9],
        [MusicFontSymbol.RestWhole, 9],
        [MusicFontSymbol.RestHalf, 9],
        [MusicFontSymbol.RestQuarter, 9],
        [MusicFontSymbol.RestEighth, 9],
        [MusicFontSymbol.RestSixteenth, 9],
        [MusicFontSymbol.RestThirtySecond, 12],
        [MusicFontSymbol.RestSixtyFourth, 14],
        [MusicFontSymbol.RestOneHundredTwentyEighth, 14],
        [MusicFontSymbol.RestTwoHundredFiftySixth, 14],

        [MusicFontSymbol.RestHBarLeft, 0],
        [MusicFontSymbol.RestHBarMiddle, 0],
        [MusicFontSymbol.RestHBarRight, 0],

        [MusicFontSymbol.Repeat1Bar, 0],
        [MusicFontSymbol.Repeat2Bars, 0],

        [MusicFontSymbol.Ottava, 0],
        [MusicFontSymbol.OttavaAlta, 32],
        [MusicFontSymbol.OttavaBassaVb, 29],
        [MusicFontSymbol.Quindicesima, 23],
        [MusicFontSymbol.QuindicesimaAlta, 46],

        [MusicFontSymbol.DynamicPPPPPP, 0],
        [MusicFontSymbol.DynamicPPPPP, 0],
        [MusicFontSymbol.DynamicPPPP, 0],
        [MusicFontSymbol.DynamicPPP, 0],
        [MusicFontSymbol.DynamicPP, 0],
        [MusicFontSymbol.DynamicPiano, 0],
        [MusicFontSymbol.DynamicMP, 0],
        [MusicFontSymbol.DynamicMF, 0],
        [MusicFontSymbol.DynamicPF, 0],
        [MusicFontSymbol.DynamicForte, 0],
        [MusicFontSymbol.DynamicFF, 0],
        [MusicFontSymbol.DynamicFFF, 0],
        [MusicFontSymbol.DynamicFFFF, 0],
        [MusicFontSymbol.DynamicFFFFF, 0],
        [MusicFontSymbol.DynamicFFFFFF, 0],
        [MusicFontSymbol.DynamicFortePiano, 0],
        [MusicFontSymbol.DynamicNiente, 0],
        [MusicFontSymbol.DynamicSforzando1, 0],
        [MusicFontSymbol.DynamicSforzandoPiano, 0],
        [MusicFontSymbol.DynamicSforzandoPianissimo, 0],
        [MusicFontSymbol.DynamicSforzato, 0],
        [MusicFontSymbol.DynamicSforzatoPiano, 0],
        [MusicFontSymbol.DynamicSforzatoFF, 0],
        [MusicFontSymbol.DynamicRinforzando1, 0],
        [MusicFontSymbol.DynamicRinforzando2, 0],
        [MusicFontSymbol.DynamicForzando, 0],

        [MusicFontSymbol.OrnamentTrill, 20],
        [MusicFontSymbol.OrnamentTurn, 26],
        [MusicFontSymbol.OrnamentTurnInverted, 26],
        [MusicFontSymbol.OrnamentShortTrill, 0],
        [MusicFontSymbol.OrnamentMordent, 26],

        [MusicFontSymbol.StringsDownBow, 9],
        [MusicFontSymbol.StringsUpBow, 9],

        [MusicFontSymbol.KeyboardPedalPed, 35],
        [MusicFontSymbol.KeyboardPedalUp, 16],

        [MusicFontSymbol.PictEdgeOfCymbal, 44],

        [MusicFontSymbol.GuitarString0, 20],
        [MusicFontSymbol.GuitarString1, 20],
        [MusicFontSymbol.GuitarString2, 20],
        [MusicFontSymbol.GuitarString3, 20],
        [MusicFontSymbol.GuitarString4, 20],
        [MusicFontSymbol.GuitarString5, 20],
        [MusicFontSymbol.GuitarString6, 20],
        [MusicFontSymbol.GuitarString7, 20],
        [MusicFontSymbol.GuitarString8, 20],
        [MusicFontSymbol.GuitarString9, 20],

        [MusicFontSymbol.GuitarOpenPedal, 11],
        [MusicFontSymbol.GuitarClosePedal, 11],

        [MusicFontSymbol.GuitarGolpe, 13.4],
        [MusicFontSymbol.GuitarFadeIn, 13],
        [MusicFontSymbol.GuitarFadeOut, 13],
        [MusicFontSymbol.GuitarVolumeSwell, 26],

        [MusicFontSymbol.FretboardX, 0],
        [MusicFontSymbol.FretboardO, 0],

        [MusicFontSymbol.WiggleTrill, 9],
        [MusicFontSymbol.WiggleVibratoMediumFast, 10],

        [MusicFontSymbol.OctaveBaselineM, 13],
        [MusicFontSymbol.OctaveBaselineB, 9]
    ]);

    /**
     * The heights of the bounding box for the respective glyphs.
     */
    public readonly GlyphHeights: Map<MusicFontSymbol, number> = new Map<MusicFontSymbol, number>([
        [MusicFontSymbol.Brace, 34],
        [MusicFontSymbol.BracketTop, 0],
        [MusicFontSymbol.BracketBottom, 0],
        [MusicFontSymbol.SystemDivider, 0],

        [MusicFontSymbol.GClef, 0],
        [MusicFontSymbol.CClef, 0],
        [MusicFontSymbol.FClef, 0],
        [MusicFontSymbol.UnpitchedPercussionClef1, 0],
        [MusicFontSymbol.SixStringTabClef, 0],
        [MusicFontSymbol.FourStringTabClef, 0],

        [MusicFontSymbol.TimeSig0, 0],
        [MusicFontSymbol.TimeSig1, 0],
        [MusicFontSymbol.TimeSig2, 0],
        [MusicFontSymbol.TimeSig3, 0],
        [MusicFontSymbol.TimeSig4, 0],
        [MusicFontSymbol.TimeSig5, 0],
        [MusicFontSymbol.TimeSig6, 0],
        [MusicFontSymbol.TimeSig7, 0],
        [MusicFontSymbol.TimeSig8, 0],
        [MusicFontSymbol.TimeSig9, 0],
        [MusicFontSymbol.TimeSigCommon, 0],
        [MusicFontSymbol.TimeSigCutCommon, 0],

        [MusicFontSymbol.NoteheadDoubleWholeSquare, 8],
        [MusicFontSymbol.NoteheadDoubleWhole, 8],
        [MusicFontSymbol.NoteheadWhole, 8],
        [MusicFontSymbol.NoteheadHalf, 8],
        [MusicFontSymbol.NoteheadBlack, 8],
        [MusicFontSymbol.NoteheadNull, 8],
        [MusicFontSymbol.NoteheadXOrnate, 8],

        [MusicFontSymbol.NoteheadPlusDoubleWhole, 8],
        [MusicFontSymbol.NoteheadPlusWhole, 8],
        [MusicFontSymbol.NoteheadPlusHalf, 8],
        [MusicFontSymbol.NoteheadPlusBlack, 8],

        [MusicFontSymbol.NoteheadSquareWhite, 8],
        [MusicFontSymbol.NoteheadSquareBlack, 8],

        [MusicFontSymbol.NoteheadTriangleUpDoubleWhole, 8],
        [MusicFontSymbol.NoteheadTriangleUpWhole, 8],
        [MusicFontSymbol.NoteheadTriangleUpHalf, 8],
        [MusicFontSymbol.NoteheadTriangleUpBlack, 8],

        [MusicFontSymbol.NoteheadTriangleRightWhite, 8],
        [MusicFontSymbol.NoteheadTriangleRightBlack, 8],

        [MusicFontSymbol.NoteheadTriangleDownDoubleWhole, 8],
        [MusicFontSymbol.NoteheadTriangleDownWhole, 8],
        [MusicFontSymbol.NoteheadTriangleDownHalf, 8],
        [MusicFontSymbol.NoteheadTriangleDownBlack, 8],

        [MusicFontSymbol.NoteheadDiamondDoubleWhole, 8],
        [MusicFontSymbol.NoteheadDiamondWhole, 8],
        [MusicFontSymbol.NoteheadDiamondHalf, 8],
        [MusicFontSymbol.NoteheadDiamondBlack, 8],

        [MusicFontSymbol.NoteheadDiamondBlackWide, 9],
        [MusicFontSymbol.NoteheadDiamondWhite, 9],
        [MusicFontSymbol.NoteheadDiamondWhiteWide, 9],
        [MusicFontSymbol.NoteheadCircleXDoubleWhole, 8],
        [MusicFontSymbol.NoteheadCircleXWhole, 8],
        [MusicFontSymbol.NoteheadCircleXHalf, 8],
        [MusicFontSymbol.NoteheadCircleX, 8],
        [MusicFontSymbol.NoteheadXDoubleWhole, 8],
        [MusicFontSymbol.NoteheadXWhole, 8],
        [MusicFontSymbol.NoteheadXHalf, 8],
        [MusicFontSymbol.NoteheadXBlack, 8],
        [MusicFontSymbol.NoteheadParenthesis, 8],
        [MusicFontSymbol.NoteheadSlashedBlack1, 8],
        [MusicFontSymbol.NoteheadSlashedBlack2, 8],
        [MusicFontSymbol.NoteheadSlashedHalf1, 8],
        [MusicFontSymbol.NoteheadSlashedHalf2, 8],
        [MusicFontSymbol.NoteheadSlashedWhole1, 8],
        [MusicFontSymbol.NoteheadSlashedWhole2, 8],
        [MusicFontSymbol.NoteheadSlashedDoubleWhole1, 8],
        [MusicFontSymbol.NoteheadSlashedDoubleWhole2, 8],

        [MusicFontSymbol.NoteheadCircledBlack, 8],
        [MusicFontSymbol.NoteheadCircledHalf, 8],
        [MusicFontSymbol.NoteheadCircledWhole, 8],
        [MusicFontSymbol.NoteheadCircledDoubleWhole, 8],

        [MusicFontSymbol.NoteheadCircleSlash, 8],
        [MusicFontSymbol.NoteheadHeavyX, 8],
        [MusicFontSymbol.NoteheadHeavyXHat, 8],

        [MusicFontSymbol.NoteheadSlashVerticalEnds, 17],
        [MusicFontSymbol.NoteheadSlashWhiteWhole, 17],
        [MusicFontSymbol.NoteheadSlashWhiteHalf, 17],

        [MusicFontSymbol.NoteheadRoundWhiteWithDot, 8],

        [MusicFontSymbol.NoteheadSquareBlackLarge, 8],
        [MusicFontSymbol.NoteheadSquareBlackWhite, 8],

        [MusicFontSymbol.NoteheadClusterDoubleWhole3rd, 8],
        [MusicFontSymbol.NoteheadClusterWhole3rd, 8],
        [MusicFontSymbol.NoteheadClusterHalf3rd, 8],
        [MusicFontSymbol.NoteheadClusterQuarter3rd, 8],

        [MusicFontSymbol.NoteShapeRoundWhite, 8],
        [MusicFontSymbol.NoteShapeRoundBlack, 8],

        [MusicFontSymbol.NoteShapeSquareWhite, 8],
        [MusicFontSymbol.NoteShapeSquareBlack, 8],

        [MusicFontSymbol.NoteShapeTriangleRightWhite, 8],
        [MusicFontSymbol.NoteShapeTriangleRightBlack, 8],

        [MusicFontSymbol.NoteShapeTriangleLeftWhite, 8],
        [MusicFontSymbol.NoteShapeTriangleLeftBlack, 8],

        [MusicFontSymbol.NoteShapeDiamondWhite, 8],
        [MusicFontSymbol.NoteShapeDiamondBlack, 8],

        [MusicFontSymbol.NoteShapeTriangleUpWhite, 8],
        [MusicFontSymbol.NoteShapeTriangleUpBlack, 8],

        [MusicFontSymbol.NoteShapeMoonWhite, 8],
        [MusicFontSymbol.NoteShapeMoonBlack, 8],

        [MusicFontSymbol.NoteShapeTriangleRoundWhite, 8],
        [MusicFontSymbol.NoteShapeTriangleRoundBlack, 8],

        [MusicFontSymbol.NoteQuarterUp, 8],
        [MusicFontSymbol.NoteEighthUp, 8],

        [MusicFontSymbol.TextBlackNoteLongStem, 0],
        [MusicFontSymbol.TextBlackNoteFrac8thLongStem, 0],
        [MusicFontSymbol.TextBlackNoteFrac16thLongStem, 0],
        [MusicFontSymbol.TextBlackNoteFrac32ndLongStem, 0],

        [MusicFontSymbol.TextCont8thBeamLongStem, 0],
        [MusicFontSymbol.TextCont16thBeamLongStem, 0],
        [MusicFontSymbol.TextCont32ndBeamLongStem, 0],

        [MusicFontSymbol.TextAugmentationDot, 0],
        [MusicFontSymbol.TextTupletBracketStartLongStem, 0],
        [MusicFontSymbol.TextTuplet3LongStem, 0],
        [MusicFontSymbol.TextTupletBracketEndLongStem, 0],

        [MusicFontSymbol.Tremolo3, 0],
        [MusicFontSymbol.Tremolo2, 0],
        [MusicFontSymbol.Tremolo1, 0],

        [MusicFontSymbol.FlagEighthUp, 0],
        [MusicFontSymbol.FlagEighthDown, 0],
        [MusicFontSymbol.FlagSixteenthUp, 0],
        [MusicFontSymbol.FlagSixteenthDown, 0],
        [MusicFontSymbol.FlagThirtySecondUp, 0],
        [MusicFontSymbol.FlagThirtySecondDown, 0],
        [MusicFontSymbol.FlagSixtyFourthUp, 0],
        [MusicFontSymbol.FlagSixtyFourthDown, 0],
        [MusicFontSymbol.FlagOneHundredTwentyEighthUp, 0],
        [MusicFontSymbol.FlagOneHundredTwentyEighthDown, 0],
        [MusicFontSymbol.FlagTwoHundredFiftySixthUp, 0],
        [MusicFontSymbol.FlagTwoHundredFiftySixthDown, 0],

        [MusicFontSymbol.AccidentalFlat, 0],
        [MusicFontSymbol.AccidentalNatural, 0],
        [MusicFontSymbol.AccidentalSharp, 0],
        [MusicFontSymbol.AccidentalDoubleSharp, 0],
        [MusicFontSymbol.AccidentalDoubleFlat, 0],
        [MusicFontSymbol.AccidentalQuarterToneFlatArrowUp, 0],
        [MusicFontSymbol.AccidentalQuarterToneSharpArrowUp, 0],
        [MusicFontSymbol.AccidentalQuarterToneNaturalArrowUp, 0],

        [MusicFontSymbol.Segno, 0],
        [MusicFontSymbol.Coda, 0],

        [MusicFontSymbol.ArticAccentAbove, 9],
        [MusicFontSymbol.ArticAccentBelow, 9],
        [MusicFontSymbol.ArticStaccatoAbove, 9],
        [MusicFontSymbol.ArticStaccatoBelow, 9],
        [MusicFontSymbol.ArticTenutoAbove, 9],
        [MusicFontSymbol.ArticTenutoBelow, 9],
        [MusicFontSymbol.ArticMarcatoAbove, 9],
        [MusicFontSymbol.ArticMarcatoBelow, 9],

        [MusicFontSymbol.FermataAbove, 12],
        [MusicFontSymbol.FermataShortAbove, 12],
        [MusicFontSymbol.FermataLongAbove, 12],

        [MusicFontSymbol.RestLonga, 0],
        [MusicFontSymbol.RestDoubleWhole, 0],
        [MusicFontSymbol.RestWhole, 0],
        [MusicFontSymbol.RestHalf, 0],
        [MusicFontSymbol.RestQuarter, 0],
        [MusicFontSymbol.RestEighth, 0],
        [MusicFontSymbol.RestSixteenth, 0],
        [MusicFontSymbol.RestThirtySecond, 0],
        [MusicFontSymbol.RestSixtyFourth, 0],
        [MusicFontSymbol.RestOneHundredTwentyEighth, 0],
        [MusicFontSymbol.RestTwoHundredFiftySixth, 0],

        [MusicFontSymbol.RestHBarLeft, 0],
        [MusicFontSymbol.RestHBarMiddle, 0],
        [MusicFontSymbol.RestHBarRight, 0],

        [MusicFontSymbol.Repeat1Bar, 0],
        [MusicFontSymbol.Repeat2Bars, 0],

        [MusicFontSymbol.Ottava, 13],
        [MusicFontSymbol.OttavaAlta, 13],
        [MusicFontSymbol.OttavaBassaVb, 13],
        [MusicFontSymbol.Quindicesima, 13],
        [MusicFontSymbol.QuindicesimaAlta, 13],

        [MusicFontSymbol.DynamicPPPPPP, 28.4],
        [MusicFontSymbol.DynamicPPPPP, 28.4],
        [MusicFontSymbol.DynamicPPPP, 28.4],
        [MusicFontSymbol.DynamicPPP, 28.4],
        [MusicFontSymbol.DynamicPP, 28.4],
        [MusicFontSymbol.DynamicPiano, 28.4],
        [MusicFontSymbol.DynamicMP, 28.4],
        [MusicFontSymbol.DynamicMF, 28.4],
        [MusicFontSymbol.DynamicPF, 28.4],
        [MusicFontSymbol.DynamicForte, 28.4],
        [MusicFontSymbol.DynamicFF, 28.4],
        [MusicFontSymbol.DynamicFFF, 28.4],
        [MusicFontSymbol.DynamicFFFF, 28.4],
        [MusicFontSymbol.DynamicFFFFF, 28.4],
        [MusicFontSymbol.DynamicFFFFFF, 28.4],
        [MusicFontSymbol.DynamicFortePiano, 28.4],
        [MusicFontSymbol.DynamicNiente, 28.4],
        [MusicFontSymbol.DynamicSforzando1, 28.4],
        [MusicFontSymbol.DynamicSforzandoPiano, 28.4],
        [MusicFontSymbol.DynamicSforzandoPianissimo, 28.4],
        [MusicFontSymbol.DynamicSforzato, 28.4],
        [MusicFontSymbol.DynamicSforzatoPiano, 28.4],
        [MusicFontSymbol.DynamicSforzatoFF, 28.4],
        [MusicFontSymbol.DynamicRinforzando1, 28.4],
        [MusicFontSymbol.DynamicRinforzando2, 28.4],
        [MusicFontSymbol.DynamicForzando, 28.4],

        [MusicFontSymbol.OrnamentTrill, 24],
        [MusicFontSymbol.OrnamentTurn, 18],
        [MusicFontSymbol.OrnamentTurnInverted, 18],
        [MusicFontSymbol.OrnamentShortTrill, 18],
        [MusicFontSymbol.OrnamentMordent, 18],

        [MusicFontSymbol.StringsDownBow, 13 / 0.75],
        [MusicFontSymbol.StringsUpBow, 13 / 0.75],

        [MusicFontSymbol.KeyboardPedalPed, 19],
        [MusicFontSymbol.KeyboardPedalUp, 16],

        [MusicFontSymbol.PictEdgeOfCymbal, 30],

        [MusicFontSymbol.GuitarString0, 20],
        [MusicFontSymbol.GuitarString1, 20],
        [MusicFontSymbol.GuitarString2, 20],
        [MusicFontSymbol.GuitarString3, 20],
        [MusicFontSymbol.GuitarString4, 20],
        [MusicFontSymbol.GuitarString5, 20],
        [MusicFontSymbol.GuitarString6, 20],
        [MusicFontSymbol.GuitarString7, 20],
        [MusicFontSymbol.GuitarString8, 20],
        [MusicFontSymbol.GuitarString9, 20],

        [MusicFontSymbol.GuitarOpenPedal, 11],
        [MusicFontSymbol.GuitarClosePedal, 11],

        [MusicFontSymbol.GuitarGolpe, 13.4],
        [MusicFontSymbol.GuitarFadeIn, 13],
        [MusicFontSymbol.GuitarFadeOut, 13],
        [MusicFontSymbol.GuitarVolumeSwell, 13],

        [MusicFontSymbol.FretboardX, 0],
        [MusicFontSymbol.FretboardO, 0],

        [MusicFontSymbol.WiggleTrill, 6],
        [MusicFontSymbol.WiggleVibratoMediumFast, 10],

        [MusicFontSymbol.OctaveBaselineM, 0],
        [MusicFontSymbol.OctaveBaselineB, 0]
    ]);
}
