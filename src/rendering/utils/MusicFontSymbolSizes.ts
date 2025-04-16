import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

/**
 * Stores the sizes for the {@link MusicFontSymbol} glyphs.
 */
export class MusicFontSymbolSizes {
    // NOTE: with https://github.com/CoderLine/alphaTab/issues/1949 we fill this list properly from the input font metadata

    /**
     * The widths of the bounding box for the respective glyphs.
     */
    public static readonly Widths: Map<MusicFontSymbol, number> = new Map<MusicFontSymbol, number>([
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
    public static readonly Heights: Map<MusicFontSymbol, number> = new Map<MusicFontSymbol, number>([
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
