/**
 * Lists all music font symbols used within alphaTab. The names
 * and values are aligned with the SMuFL standard.
 */
export enum MusicFontSymbol {
    None = -1,

    Space = 0x20,

    Brace = 0xe000,
    BracketTop = 0xe003,
    BracketBottom = 0xe004,
    SystemDivider = 0xe007,

    GClef = 0xe050,
    CClef = 0xe05c,
    FClef = 0xe062,
    UnpitchedPercussionClef1 = 0xe069,
    SixStringTabClef = 0xe06d,
    FourStringTabClef = 0xe06e,

    TimeSig0 = 0xe080,
    TimeSig1 = 0xe081,
    TimeSig2 = 0xe082,
    TimeSig3 = 0xe083,
    TimeSig4 = 0xe084,
    TimeSig5 = 0xe085,
    TimeSig6 = 0xe086,
    TimeSig7 = 0xe087,
    TimeSig8 = 0xe088,
    TimeSig9 = 0xe089,
    TimeSigCommon = 0xe08a,
    TimeSigCutCommon = 0xe08b,

    NoteheadDoubleWholeSquare = 0xe0a1,
    NoteheadDoubleWhole = 0xe0a0,
    NoteheadWhole = 0xe0a2,
    NoteheadHalf = 0xe0a3,
    NoteheadBlack = 0xe0a4,
    NoteheadNull = 0xe0a5,
    NoteheadXOrnate = 0xe0aa,

    NoteheadPlusDoubleWhole = 0xe0ac,
    NoteheadPlusWhole = 0xe0ad,
    NoteheadPlusHalf = 0xe0ae,
    NoteheadPlusBlack = 0xe0af,

    NoteheadSquareWhite = 0xe0b8,
    NoteheadSquareBlack = 0xe0b9,

    NoteheadTriangleUpDoubleWhole = 0xe0ba,
    NoteheadTriangleUpWhole = 0xe0bb,
    NoteheadTriangleUpHalf = 0xe0bc,
    NoteheadTriangleUpBlack = 0xe0be,

    NoteheadTriangleRightWhite = 0xe0c1,
    NoteheadTriangleRightBlack = 0xe0c2,

    NoteheadTriangleDownDoubleWhole = 0xe0cc,
    NoteheadTriangleDownWhole = 0xe0c4,
    NoteheadTriangleDownHalf = 0xe0c5,
    NoteheadTriangleDownBlack = 0xe0c7,

    NoteheadDiamondDoubleWhole = 0xe0d7,
    NoteheadDiamondWhole = 0xe0d8,
    NoteheadDiamondHalf = 0xe0d9,
    NoteheadDiamondBlack = 0xe0db,

    NoteheadDiamondBlackWide = 0xe0dc,
    NoteheadDiamondWhite = 0xe0dd,
    NoteheadDiamondWhiteWide = 0xe0de,
    NoteheadCircleXDoubleWhole = 0xe0b0,
    NoteheadCircleXWhole = 0xe0b1,
    NoteheadCircleXHalf = 0xe0b2,
    NoteheadCircleX = 0xe0b3,
    NoteheadXDoubleWhole = 0xe0a6,
    NoteheadXWhole = 0xe0a7,
    NoteheadXHalf = 0xe0a8,
    NoteheadXBlack = 0xe0a9,
    NoteheadParenthesis = 0xe0ce,
    NoteheadSlashedBlack1 = 0xe0cf,
    NoteheadSlashedBlack2 = 0xe0d0,
    NoteheadSlashedHalf1 = 0xe0d1,
    NoteheadSlashedHalf2 = 0xe0d2,
    NoteheadSlashedWhole1 = 0xe0d3,
    NoteheadSlashedWhole2 = 0xe0d4,
    NoteheadSlashedDoubleWhole1 = 0xe0d5,
    NoteheadSlashedDoubleWhole2 = 0xe0d6,

    NoteheadCircledBlack = 0xe0e4,
    NoteheadCircledHalf = 0xe0e5,
    NoteheadCircledWhole = 0xe0e6,
    NoteheadCircledDoubleWhole = 0xe0e7,

    NoteheadCircleSlash = 0xe0f7,
    NoteheadHeavyX = 0xe0f8,
    NoteheadHeavyXHat = 0xe0f9,

    NoteheadSlashVerticalEnds = 0xe100,
    NoteheadSlashWhiteWhole = 0xe102,
    NoteheadSlashWhiteHalf = 0xe103,

    NoteheadRoundWhiteWithDot = 0xe115,

    NoteheadSquareBlackLarge = 0xe11a,
    NoteheadSquareBlackWhite = 0xe11b,

    NoteheadClusterDoubleWhole3rd = 0xe128,
    NoteheadClusterWhole3rd = 0xe129,
    NoteheadClusterHalf3rd = 0xe12a,
    NoteheadClusterQuarter3rd = 0xe12b,

    NoteShapeRoundWhite = 0xe1b0,
    NoteShapeRoundBlack = 0xe1b1,

    NoteShapeSquareWhite = 0xe1b2,
    NoteShapeSquareBlack = 0xe1b3,

    NoteShapeTriangleRightWhite = 0xe1b4,
    NoteShapeTriangleRightBlack = 0xe1b5,

    NoteShapeTriangleLeftWhite = 0xe1b6,
    NoteShapeTriangleLeftBlack = 0xe1b7,

    NoteShapeDiamondWhite = 0xe1b8,
    NoteShapeDiamondBlack = 0xe1b9,

    NoteShapeTriangleUpWhite = 0xe1ba,
    NoteShapeTriangleUpBlack = 0xe1bb,

    NoteShapeMoonWhite = 0xe1bc,
    NoteShapeMoonBlack = 0xe1bd,

    NoteShapeTriangleRoundWhite = 0xe1be,
    NoteShapeTriangleRoundBlack = 0xe1bf,

    NoteQuarterUp = 0xe1d5,
    NoteEighthUp = 0xe1d7,

    TextBlackNoteLongStem = 0xe1f1,
    TextBlackNoteFrac8thLongStem = 0xe1f3,
    TextBlackNoteFrac16thLongStem = 0xe1f5,
    TextBlackNoteFrac32ndLongStem = 0xe1f6,

    TextCont8thBeamLongStem = 0xe1f8,
    TextCont16thBeamLongStem = 0xe1fa,
    TextCont32ndBeamLongStem = 0xe1fb,

    TextAugmentationDot = 0xe1fc,
    TextTupletBracketStartLongStem = 0xe201,
    TextTuplet3LongStem = 0xe202,
    TextTupletBracketEndLongStem = 0xe203,

    Tremolo3 = 0xe222,
    Tremolo2 = 0xe221,
    Tremolo1 = 0xe220,

    FlagEighthUp = 0xe240,
    FlagEighthDown = 0xe241,
    FlagSixteenthUp = 0xe242,
    FlagSixteenthDown = 0xe243,
    FlagThirtySecondUp = 0xe244,
    FlagThirtySecondDown = 0xe245,
    FlagSixtyFourthUp = 0xe246,
    FlagSixtyFourthDown = 0xe247,
    FlagOneHundredTwentyEighthUp = 0xe248,
    FlagOneHundredTwentyEighthDown = 0xe249,
    FlagTwoHundredFiftySixthUp = 0xe24a,
    FlagTwoHundredFiftySixthDown = 0xe24b,

    AccidentalFlat = 0xe260,
    AccidentalNatural = 0xe261,
    AccidentalSharp = 0xe262,
    AccidentalDoubleSharp = 0xe263,
    AccidentalDoubleFlat = 0xe264,
    AccidentalQuarterToneFlatArrowUp = 0xe270,
    AccidentalQuarterToneSharpArrowUp = 0xe274,
    AccidentalQuarterToneNaturalArrowUp = 0xe272,

    Segno = 0xe047,
    Coda = 0xe048,

    ArticAccentAbove = 0xe4a0,
    ArticAccentBelow = 0xe4a1,
    ArticStaccatoAbove = 0xe4a2,
    ArticStaccatoBelow = 0xe4a3,
    ArticTenutoAbove = 0xe4a4,
    ArticTenutoBelow = 0xe4a5,
    ArticMarcatoAbove = 0xe4ac,
    ArticMarcatoBelow = 0xe4ad,

    FermataAbove = 0xe4c0,
    FermataShortAbove = 0xe4c4,
    FermataLongAbove = 0xe4c6,

    RestLonga = 0xe4e1,
    RestDoubleWhole = 0xe4e2,
    RestWhole = 0xe4e3,
    RestHalf = 0xe4e4,
    RestQuarter = 0xe4e5,
    RestEighth = 0xe4e6,
    RestSixteenth = 0xe4e7,
    RestThirtySecond = 0xe4e8,
    RestSixtyFourth = 0xe4e9,
    RestOneHundredTwentyEighth = 0xe4ea,
    RestTwoHundredFiftySixth = 0xe4eb,

    RestHBarLeft = 0xe4ef,
    RestHBarMiddle = 0xe4f0,
    RestHBarRight = 0xe4f1,

    Repeat1Bar = 0xe500,
    Repeat2Bars = 0xe501,

    Ottava = 0xe510,
    OttavaAlta = 0xe511,
    OttavaBassaVb = 0xe51c,
    Quindicesima = 0xe514,
    QuindicesimaAlta = 0xe515,

    DynamicPPPPPP = 0xe527,
    DynamicPPPPP = 0xe528,
    DynamicPPPP = 0xe529,
    DynamicPPP = 0xe52a,
    DynamicPP = 0xe52b,
    DynamicPiano = 0xe520,
    DynamicMP = 0xe52c,
    DynamicMF = 0xe52d,
    DynamicPF = 0xe52e,
    DynamicForte = 0xe522,
    DynamicFF = 0xe52f,
    DynamicFFF = 0xe530,
    DynamicFFFF = 0xe531,
    DynamicFFFFF = 0xe532,
    DynamicFFFFFF = 0xe533,
    DynamicFortePiano = 0xe534,
    DynamicNiente = 0xe526,
    DynamicSforzando1 = 0xe536,
    DynamicSforzandoPiano = 0xe537,
    DynamicSforzandoPianissimo = 0xe538,
    DynamicSforzato = 0xe539,
    DynamicSforzatoPiano = 0xe53a,
    DynamicSforzatoFF = 0xe53b,
    DynamicRinforzando1 = 0xe53c,
    DynamicRinforzando2 = 0xe53d,
    DynamicForzando = 0xe535,

    OrnamentTrill = 0xe566,
    OrnamentTurn = 0xe567,
    OrnamentTurnInverted = 0xe568,
    OrnamentShortTrill = 0xe56c,
    OrnamentMordent = 0xe56d,

    StringsDownBow = 0xe610,
    StringsUpBow = 0xe612,

    KeyboardPedalPed = 0xe650,
    KeyboardPedalUp = 0xe655,

    PictEdgeOfCymbal = 0xe729,

    GuitarString0 = 0xe833,
    GuitarString1 = 0xe834,
    GuitarString2 = 0xe835,
    GuitarString3 = 0xe836,
    GuitarString4 = 0xe837,
    GuitarString5 = 0xe838,
    GuitarString6 = 0xe839,
    GuitarString7 = 0xe83a,
    GuitarString8 = 0xe83b,
    GuitarString9 = 0xe83c,

    GuitarOpenPedal = 0xe83d,
    GuitarClosePedal = 0xe83f,

    GuitarGolpe = 0xe842,
    GuitarFadeIn = 0xe843,
    GuitarFadeOut = 0xe844,
    GuitarVolumeSwell = 0xe845,

    FretboardX = 0xe859,
    FretboardO = 0xe85a,

    WiggleTrill = 0xeaa4,
    WiggleVibratoMediumFast = 0xeade,

    OctaveBaselineM = 0xec95,
    OctaveBaselineB = 0xec93
}
