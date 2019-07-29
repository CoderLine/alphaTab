namespace AlphaTab.Rendering.Glyphs
{
    internal enum MusicFontSymbol
    {
        None = -1,

        ClefG = 0xE050,
        ClefC = 0xE05C,
        ClefF = 0xE062,
        ClefNeutral = 0xE069,
        ClefTab = 0xE06D,
        ClefTabSmall = 0xE06E,

        RestQuadrupleWhole = 0xE4E1,
        RestDoubleWhole = 0xE4E2,
        RestWhole = 0xE4E3,
        RestHalf = 0xE4E4,
        RestQuarter = 0xE4E5,
        RestEighth = 0xE4E6,
        RestSixteenth = 0xE4E7,
        RestThirtySecond = 0xE4E8,
        RestSixtyFourth = 0xE4E9,
        RestOneHundredTwentyEighth = 0xE4EA,
        RestTwoHundredFiftySixth = 0xE4EB,

        Trill = 0xE566,

        Num0 = 0xE080,
        Num1 = 0xE081,
        Num2 = 0xE082,
        Num3 = 0xE083,
        Num4 = 0xE084,
        Num5 = 0xE085,
        Num6 = 0xE086,
        Num7 = 0xE087,
        Num8 = 0xE088,
        Num9 = 0xE089,
        TimeSignatureCommon = 0xE08A,
        TimeSignatureCutCommon = 0xE08b,

        NoteQuadrupleWhole = 0xE0A1,
        NoteDoubleWhole = 0xE0A0,
        NoteWhole = 0xE0A2,
        NoteHalf = 0xE0A3,
        NoteQuarter = 0xE0A4,
        NoteDead = 0xE0AA,
        NoteHarmonic = 0xE0DC,
        NoteHarmonicWhole = 0xE0DE,
        NoteHiHat = 0xE0B3,
        NoteSideStick = 0xE0A9,
        NoteHiHatHalf = 0xE0F7,
        NoteChineseCymbal = 0xE0F9,

        FooterUpEighth = 0xE240,
        FooterDownEighth = 0xE241,

        FooterUpSixteenth = 0xE242,
        FooterDownSixteenth = 0xE243,

        FooterUpThirtySecond = 0xE244,
        FooterDownThirtySecond = 0xE245,

        FooterUpSixtyFourth = 0xE246,
        FooterDownSixtyFourth = 0xE247,

        FooterUpOneHundredTwentyEighth = 0xE248,
        FooterDownOneHundredTwentyEighth = 0xE249,

        FooterUpTwoHundredFiftySixth = 0xE24A,
        FooterDownTwoHundredFiftySixth = 0xE24B,

        DynamicPPP = 0xE52A,
        DynamicPP = 0xE52B,
        DynamicP = 0xE520,
        DynamicMP = 0xE52C,
        DynamicMF = 0xE52D,
        DynamicF = 0xE522,
        DynamicFF = 0xE52F,
        DynamicFFF = 0xE530,

        Accentuation = 0xE4A0,
        HeavyAccentuation = 0xE4AC,

        WaveHorizontalSlight = 0xEAA4,
        WaveHorizontalWide = 0xEADE,

        PickStrokeDown = 0xE610,
        PickStrokeUp = 0xE612,
        TremoloPickingThirtySecond = 0xE222,
        TremoloPickingSixteenth = 0xE221,
        TremoloPickingEighth = 0xE220,

        Tempo = 0xE1D5,
        NoteEighth = 0xE1D7,

        AccidentalFlat = 0xE260,
        AccidentalNatural = 0xE261,
        AccidentalSharp = 0xE262,
        AccidentalQuarterToneFlatArrowUp = 0xE270,
        AccidentalQuarterToneSharpArrowUp = 0xE274,
        AccidentalQuarterToneNaturalArrowUp = 0xE272,

        Ottava8 = 0xE510,

        // ReSharper disable once InconsistentNaming
        Ottava8va = 0xE511,

        // ReSharper disable once InconsistentNaming
        Ottava8vb = 0xE51C,
        Ottava15 = 0xE514,

        // ReSharper disable once InconsistentNaming
        Ottava15ma = 0xE515,
        OttavaMBaseline = 0xEC95,
        OttavaBBaseline = 0xEC93,

        SimileMarkSimple = 0xE500,
        SimileMarkDouble = 0xE501,

        FermataMedium = 0xE4C0,
        FermataShort = 0xE4C4,
        FermataLong = 0xE4C6,

        FretboardX = 0xE859,
        FretboardO = 0xE85A
    }
}
