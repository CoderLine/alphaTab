import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { InstrumentArticulation, TechniqueSymbolPlacement } from '@coderline/alphatab/model/InstrumentArticulation';
import type { Note } from '@coderline/alphatab/model/Note';

/**
 * @internal
 */
export class PercussionMapper {
    // To update the following generated code, use the GpExporterTest.percussion-articulations unit test
    // which will generate the new code to copy for here.
    // We could also use an NPM script for that but for now this is enough.

    // BEGIN generated articulations
    public static instrumentArticulations: Map<number, InstrumentArticulation> = new Map(
        [
            InstrumentArticulation.create(
                38,
                'snare',
                3,
                38,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                37,
                'snare',
                3,
                37,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                91,
                'snare',
                3,
                38,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite
            ),
            InstrumentArticulation.create(
                42,
                'hiHat',
                -1,
                42,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                92,
                'hiHat',
                -1,
                46,
                MusicFontSymbol.NoteheadCircleSlash,
                MusicFontSymbol.NoteheadCircleSlash,
                MusicFontSymbol.NoteheadCircleSlash
            ),
            InstrumentArticulation.create(
                46,
                'hiHat',
                -1,
                46,
                MusicFontSymbol.NoteheadCircleX,
                MusicFontSymbol.NoteheadCircleX,
                MusicFontSymbol.NoteheadCircleX
            ),
            InstrumentArticulation.create(
                44,
                'hiHat',
                9,
                44,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                35,
                'kickDrum',
                8,
                35,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                36,
                'kickDrum',
                7,
                36,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                50,
                'tom',
                1,
                50,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                48,
                'tom',
                2,
                48,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                47,
                'tom',
                4,
                47,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                45,
                'tom',
                5,
                45,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                43,
                'tom',
                6,
                43,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                93,
                'ride',
                0,
                51,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.PictEdgeOfCymbal,
                TechniqueSymbolPlacement.Above
            ),
            InstrumentArticulation.create(
                51,
                'ride',
                0,
                51,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                53,
                'ride',
                0,
                53,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite
            ),
            InstrumentArticulation.create(
                94,
                'ride',
                0,
                51,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.ArticStaccatoAbove,
                TechniqueSymbolPlacement.Outside
            ),
            InstrumentArticulation.create(
                55,
                'splash',
                -2,
                55,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                95,
                'splash',
                -2,
                55,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.ArticStaccatoAbove,
                TechniqueSymbolPlacement.Outside
            ),
            InstrumentArticulation.create(
                52,
                'china',
                -3,
                52,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat
            ),
            InstrumentArticulation.create(
                96,
                'china',
                -3,
                52,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat
            ),
            InstrumentArticulation.create(
                49,
                'crash',
                -2,
                49,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX
            ),
            InstrumentArticulation.create(
                97,
                'crash',
                -2,
                49,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.ArticStaccatoAbove,
                TechniqueSymbolPlacement.Outside
            ),
            InstrumentArticulation.create(
                57,
                'crash',
                -1,
                57,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX
            ),
            InstrumentArticulation.create(
                98,
                'crash',
                -1,
                57,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.ArticStaccatoAbove,
                TechniqueSymbolPlacement.Outside
            ),
            InstrumentArticulation.create(
                99,
                'cowbell',
                1,
                56,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpHalf,
                MusicFontSymbol.NoteheadTriangleUpWhole
            ),
            InstrumentArticulation.create(
                100,
                'cowbell',
                1,
                56,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXHalf,
                MusicFontSymbol.NoteheadXWhole
            ),
            InstrumentArticulation.create(
                56,
                'cowbell',
                0,
                56,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpHalf,
                MusicFontSymbol.NoteheadTriangleUpWhole
            ),
            InstrumentArticulation.create(
                101,
                'cowbell',
                0,
                56,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXHalf,
                MusicFontSymbol.NoteheadXWhole
            ),
            InstrumentArticulation.create(
                102,
                'cowbell',
                -1,
                56,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpHalf,
                MusicFontSymbol.NoteheadTriangleUpWhole
            ),
            InstrumentArticulation.create(
                103,
                'cowbell',
                -1,
                56,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXHalf,
                MusicFontSymbol.NoteheadXWhole
            ),
            InstrumentArticulation.create(
                77,
                'woodblock',
                -9,
                77,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack
            ),
            InstrumentArticulation.create(
                76,
                'woodblock',
                -10,
                76,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack
            ),
            InstrumentArticulation.create(
                60,
                'bongo',
                -4,
                60,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                104,
                'bongo',
                -5,
                60,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside
            ),
            InstrumentArticulation.create(
                105,
                'bongo',
                -6,
                60,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                61,
                'bongo',
                -7,
                61,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                106,
                'bongo',
                -8,
                61,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside
            ),
            InstrumentArticulation.create(
                107,
                'bongo',
                -16,
                61,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                66,
                'timbale',
                10,
                66,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                65,
                'timbale',
                9,
                65,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                68,
                'agogo',
                12,
                68,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                67,
                'agogo',
                11,
                67,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                64,
                'conga',
                17,
                64,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                108,
                'conga',
                16,
                64,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                109,
                'conga',
                15,
                64,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside
            ),
            InstrumentArticulation.create(
                63,
                'conga',
                14,
                63,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                110,
                'conga',
                13,
                63,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                62,
                'conga',
                19,
                62,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside
            ),
            InstrumentArticulation.create(
                72,
                'whistle',
                -11,
                72,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                71,
                'whistle',
                -17,
                71,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                73,
                'guiro',
                38,
                73,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                74,
                'guiro',
                37,
                74,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                86,
                'surdo',
                36,
                86,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                87,
                'surdo',
                35,
                87,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside
            ),
            InstrumentArticulation.create(
                54,
                'tambourine',
                3,
                54,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack
            ),
            InstrumentArticulation.create(
                111,
                'tambourine',
                2,
                54,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.StringsUpBow,
                TechniqueSymbolPlacement.Above
            ),
            InstrumentArticulation.create(
                112,
                'tambourine',
                1,
                54,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.StringsDownBow,
                TechniqueSymbolPlacement.Above
            ),
            InstrumentArticulation.create(
                113,
                'tambourine',
                -7,
                54,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                79,
                'cuica',
                30,
                79,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                78,
                'cuica',
                29,
                78,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                58,
                'vibraslap',
                28,
                58,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                81,
                'triangle',
                27,
                81,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                80,
                'triangle',
                26,
                80,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside
            ),
            InstrumentArticulation.create(
                114,
                'grancassa',
                25,
                43,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                115,
                'piatti',
                18,
                49,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                116,
                'piatti',
                24,
                49,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                69,
                'cabasa',
                23,
                69,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                117,
                'cabasa',
                22,
                69,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.StringsUpBow,
                TechniqueSymbolPlacement.Outside
            ),
            InstrumentArticulation.create(
                85,
                'castanets',
                21,
                85,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                75,
                'claves',
                20,
                75,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                70,
                'maraca',
                -12,
                70,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                118,
                'maraca',
                -13,
                70,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.StringsUpBow,
                TechniqueSymbolPlacement.Outside
            ),
            InstrumentArticulation.create(
                119,
                'maraca',
                -14,
                70,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                120,
                'maraca',
                -15,
                70,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.StringsUpBow,
                TechniqueSymbolPlacement.Outside
            ),
            InstrumentArticulation.create(
                82,
                'shaker',
                -23,
                82,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                122,
                'shaker',
                -24,
                82,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.StringsUpBow,
                TechniqueSymbolPlacement.Outside
            ),
            InstrumentArticulation.create(
                84,
                'bellTree',
                -18,
                53,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                123,
                'bellTree',
                -19,
                53,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.StringsUpBow,
                TechniqueSymbolPlacement.Outside
            ),
            InstrumentArticulation.create(
                83,
                'jingleBell',
                -20,
                53,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                83,
                'jingleBell',
                -20,
                53,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                124,
                'unpitched',
                -21,
                62,
                MusicFontSymbol.NoteheadNull,
                MusicFontSymbol.NoteheadNull,
                MusicFontSymbol.NoteheadNull,
                MusicFontSymbol.GuitarGolpe,
                TechniqueSymbolPlacement.Below
            ),
            InstrumentArticulation.create(
                125,
                'unpitched',
                -22,
                62,
                MusicFontSymbol.NoteheadNull,
                MusicFontSymbol.NoteheadNull,
                MusicFontSymbol.NoteheadNull,
                MusicFontSymbol.GuitarGolpe,
                TechniqueSymbolPlacement.Above
            ),
            InstrumentArticulation.create(
                39,
                'handClap',
                3,
                39,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                40,
                'snare',
                3,
                40,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                31,
                'snare',
                3,
                40,
                MusicFontSymbol.NoteheadSlashedBlack2,
                MusicFontSymbol.NoteheadSlashedBlack2,
                MusicFontSymbol.NoteheadSlashedBlack2
            ),
            InstrumentArticulation.create(
                41,
                'tom',
                5,
                41,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                59,
                'ride',
                2,
                59,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.PictEdgeOfCymbal,
                TechniqueSymbolPlacement.Above
            ),
            InstrumentArticulation.create(
                126,
                'ride',
                2,
                59,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                127,
                'ride',
                2,
                59,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite
            ),
            InstrumentArticulation.create(
                29,
                'ride',
                2,
                59,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.ArticStaccatoAbove,
                TechniqueSymbolPlacement.Outside
            ),
            InstrumentArticulation.create(
                30,
                'crash',
                -3,
                49,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                33,
                'snare',
                3,
                37,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                34,
                'snare',
                3,
                38,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadBlack
            )
        ].map(articulation => [articulation.id, articulation])
    );

    private static _instrumentArticulationNames = new Map<string, number>([
        ['Snare (hit)', 38],
        ['Snare (side stick)', 37],
        ['Snare (rim shot)', 91],
        ['Hi-Hat (closed)', 42],
        ['Hi-Hat (half)', 92],
        ['Hi-Hat (open)', 46],
        ['Pedal Hi-Hat (hit)', 44],
        ['Kick (hit)', 35],
        ['Kick (hit)', 36],
        ['High Floor Tom (hit)', 50],
        ['High Tom (hit)', 48],
        ['Mid Tom (hit)', 47],
        ['Low Tom (hit)', 45],
        ['Very Low Tom (hit)', 43],
        ['Ride (edge)', 93],
        ['Ride (middle)', 51],
        ['Ride (bell)', 53],
        ['Ride (choke)', 94],
        ['Splash (hit)', 55],
        ['Splash (choke)', 95],
        ['China (hit)', 52],
        ['China (choke)', 96],
        ['Crash high (hit)', 49],
        ['Crash high (choke)', 97],
        ['Crash medium (hit)', 57],
        ['Crash medium (choke)', 98],
        ['Cowbell low (hit)', 99],
        ['Cowbell low (tip)', 100],
        ['Cowbell medium (hit)', 56],
        ['Cowbell medium (tip)', 101],
        ['Cowbell high (hit)', 102],
        ['Cowbell high (tip)', 103],
        ['Woodblock low (hit)', 77],
        ['Woodblock high (hit)', 76],
        ['Bongo High (hit)', 60],
        ['Bongo High (mute)', 104],
        ['Bongo High (slap)', 105],
        ['Bongo Low (hit)', 61],
        ['Bongo Low (mute)', 106],
        ['Bongo Low (slap)', 107],
        ['Timbale low (hit)', 66],
        ['Timbale high (hit)', 65],
        ['Agogo low (hit)', 68],
        ['Agogo high (hit)', 67],
        ['Conga low (hit)', 64],
        ['Conga low (slap)', 108],
        ['Conga low (mute)', 109],
        ['Conga high (hit)', 63],
        ['Conga high (slap)', 110],
        ['Conga high (mute)', 62],
        ['Whistle low (hit)', 72],
        ['Whistle high (hit)', 71],
        ['Guiro (hit)', 73],
        ['Guiro (scrap-return)', 74],
        ['Surdo (hit)', 86],
        ['Surdo (mute)', 87],
        ['Tambourine (hit)', 54],
        ['Tambourine (return)', 111],
        ['Tambourine (roll)', 112],
        ['Tambourine (hand)', 113],
        ['Cuica (open)', 79],
        ['Cuica (mute)', 78],
        ['Vibraslap (hit)', 58],
        ['Triangle (hit)', 81],
        ['Triangle (mute)', 80],
        ['Grancassa (hit)', 114],
        ['Piatti (hit)', 115],
        ['Piatti (hand)', 116],
        ['Cabasa (hit)', 69],
        ['Cabasa (return)', 117],
        ['Castanets (hit)', 85],
        ['Claves (hit)', 75],
        ['Left Maraca (hit)', 70],
        ['Left Maraca (return)', 118],
        ['Right Maraca (hit)', 119],
        ['Right Maraca (return)', 120],
        ['Shaker (hit)', 82],
        ['Shaker (return)', 122],
        ['Bell Tree (hit)', 84],
        ['Bell Tree (return)', 123],
        ['Jingle Bell (hit)', 83],
        ['Tinkle Bell (hit)', 83],
        ['Golpe (thumb)', 124],
        ['Golpe (finger)', 125],
        ['Hand Clap (hit)', 39],
        ['Electric Snare (hit)', 40],
        ['Snare (side stick)', 31],
        ['Low Floor Tom (hit)', 41],
        ['Ride (edge)', 59],
        ['Ride (middle)', 126],
        ['Ride (bell)', 127],
        ['Ride (choke)', 29],
        ['Reverse Cymbal (hit)', 30],
        ['Metronome (hit)', 33],
        ['Metronome (bell)', 34]
    ]);
    // END generated articulations

    private static _gp6ElementAndVariationToArticulation: number[][] = [
        // known GP6 elements and variations, analyzed from a GPX test file
        // with all instruments inside manually aligned with the same names of articulations in GP7
        // [{articulation index}]   // [{element number}] => {element name} ({variation[0]}, {variation[1]}, {variation[2]})
        [35, 35, 35], // [0] => Kick (hit, unused, unused)
        [38, 91, 37], // [1] => Snare (hit, rim shot, side stick)
        [99, 100, 99], // [2] => Cowbell low (hit, tip, unused)
        [56, 100, 56], // [3] => Cowbell medium (hit, tip, unused)
        [102, 103, 102], // [4] => Cowbell high (hit, tip, unused)
        [43, 43, 43], // [5] => Tom very low (hit, unused, unused)
        [45, 45, 45], // [6] => Tom low (hit, unused, unused)
        [47, 47, 47], // [7] => Tom medium (hit, unused, unused)
        [48, 48, 48], // [8] => Tom high (hit, unused, unused)
        [50, 50, 50], // [9] => Tom very high (hit, unused, unused)
        [42, 92, 46], // [10] => Hihat (closed, half, open)
        [44, 44, 44], // [11] => Pedal hihat (hit, unused, unused)
        [57, 98, 57], // [12] => Crash medium (hit, choke, unused)
        [49, 97, 49], // [13] => Crash high (hit, choke, unused)
        [55, 95, 55], // [14] => Splash (hit, choke, unused)
        [51, 93, 127], // [15] => Ride (middle, edge, bell)
        [52, 96, 52] // [16] => China (hit, choke, unused)
    ];

    public static articulationFromElementVariation(element: number, variation: number): number {
        if (element < PercussionMapper._gp6ElementAndVariationToArticulation.length) {
            if (variation >= PercussionMapper._gp6ElementAndVariationToArticulation.length) {
                variation = 0;
            }
            return PercussionMapper._gp6ElementAndVariationToArticulation[element][variation];
        }
        // unknown combination, should not happen, fallback to some default value (Snare hit)
        return 38;
    }

    public static getArticulationName(n: Note): string {
        const articulation = PercussionMapper.getArticulation(n);
        let input = n.percussionArticulation;
        if (articulation) {
            input = articulation.outputMidiNumber;
        }

        // no efficient lookup for now, mainly used by exporter
        for (const [name, value] of PercussionMapper.instrumentArticulationNames) {
            if (value === input) {
                return name;
            }
        }

        return 'unknown';
    }

    public static getArticulation(n: Note): InstrumentArticulation | null {
        const articulationIndex = n.percussionArticulation;
        if (articulationIndex < 0) {
            return null;
        }

        const trackArticulations = n.beat.voice.bar.staff.track.percussionArticulations;
        if (articulationIndex < trackArticulations.length) {
            return trackArticulations[articulationIndex];
        }

        return PercussionMapper.getArticulationById(articulationIndex);
    }

    public static getElementAndVariation(n: Note): number[] {
        const articulation = PercussionMapper.getArticulation(n);
        if (!articulation) {
            return [-1, -1];
        }

        // search for the first element/variation combination with the same midi output
        for (let element = 0; element < PercussionMapper._gp6ElementAndVariationToArticulation.length; element++) {
            const variations = PercussionMapper._gp6ElementAndVariationToArticulation[element];
            for (let variation = 0; variation < variations.length; variation++) {
                const gp6Articulation = PercussionMapper.getArticulationById(variations[variation]);
                if (gp6Articulation?.outputMidiNumber === articulation.outputMidiNumber) {
                    return [element, variation];
                }
            }
        }

        return [-1, -1];
    }

    public static getArticulationById(inputMidiNumber: number): InstrumentArticulation | null {
        if (PercussionMapper.instrumentArticulations.has(inputMidiNumber)) {
            return PercussionMapper.instrumentArticulations.get(inputMidiNumber)!;
        }
        return null;
    }

    public static readonly instrumentArticulationNames = PercussionMapper._mergeNames([
        new Map<string, number>([
            ['Hand (hit)', 60],
            ['Hand (hit)', 61],
            ['Tinkle Bell (hat)', 83]
        ]),
        PercussionMapper._instrumentArticulationNames
    ]);

    private static _mergeNames(maps: Map<string, number>[]) {
        const merged = new Map<string, number>(maps[0]);
        for (let i = 1; i < maps.length; i++) {
            for (const [k, v] of maps[i]) {
                merged.set(k, v);
            }
        }
        return merged;
    }

    private static _articulationsByOutputNumber: Map<number, InstrumentArticulation> | undefined;
    public static tryMatchKnownArticulation(articulation: InstrumentArticulation): number {
        let articulationsByOutputNumber = PercussionMapper._articulationsByOutputNumber;
        if (!articulationsByOutputNumber) {
            articulationsByOutputNumber = new Map<number, InstrumentArticulation>();
            for (const a of PercussionMapper.instrumentArticulations.values()) {
                // first one wins
                if (!articulationsByOutputNumber.has(a.outputMidiNumber)) {
                    articulationsByOutputNumber.set(a.outputMidiNumber, a);
                }
            }
            PercussionMapper._articulationsByOutputNumber = articulationsByOutputNumber;
        }

        return articulationsByOutputNumber.has(articulation.outputMidiNumber)
            ? articulationsByOutputNumber.get(articulation.outputMidiNumber)!.id
            : -1;
    }
}
