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
                'Snare',
                3,
                38,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                37,
                'Snare',
                3,
                37,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                91,
                'Snare',
                3,
                38,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite
            ),
            InstrumentArticulation.create(
                42,
                'Charley',
                -1,
                42,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                92,
                'Charley',
                -1,
                46,
                MusicFontSymbol.NoteheadCircleSlash,
                MusicFontSymbol.NoteheadCircleSlash,
                MusicFontSymbol.NoteheadCircleSlash
            ),
            InstrumentArticulation.create(
                46,
                'Charley',
                -1,
                46,
                MusicFontSymbol.NoteheadCircleX,
                MusicFontSymbol.NoteheadCircleX,
                MusicFontSymbol.NoteheadCircleX
            ),
            InstrumentArticulation.create(
                44,
                'Charley',
                9,
                44,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                35,
                'Acoustic Kick Drum',
                8,
                35,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                36,
                'Kick Drum',
                7,
                36,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                50,
                'Tom Very High',
                1,
                50,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                48,
                'Tom High',
                2,
                48,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                47,
                'Tom Medium',
                4,
                47,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                45,
                'Tom Low',
                5,
                45,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                43,
                'Tom Very Low',
                6,
                43,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                93,
                'Ride',
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
                'Ride',
                0,
                51,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                53,
                'Ride',
                0,
                53,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite
            ),
            InstrumentArticulation.create(
                94,
                'Ride',
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
                'Splash',
                -2,
                55,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                95,
                'Splash',
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
                'China',
                -3,
                52,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat
            ),
            InstrumentArticulation.create(
                96,
                'China',
                -3,
                52,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat
            ),
            InstrumentArticulation.create(
                49,
                'Crash High',
                -2,
                49,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX
            ),
            InstrumentArticulation.create(
                97,
                'Crash High',
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
                'Crash Medium',
                -1,
                57,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX
            ),
            InstrumentArticulation.create(
                98,
                'Crash Medium',
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
                'Cowbell Low',
                1,
                56,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpHalf,
                MusicFontSymbol.NoteheadTriangleUpWhole
            ),
            InstrumentArticulation.create(
                100,
                'Cowbell Low',
                1,
                56,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXHalf,
                MusicFontSymbol.NoteheadXWhole
            ),
            InstrumentArticulation.create(
                56,
                'Cowbell Medium',
                0,
                56,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpHalf,
                MusicFontSymbol.NoteheadTriangleUpWhole
            ),
            InstrumentArticulation.create(
                101,
                'Cowbell Medium',
                0,
                56,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXHalf,
                MusicFontSymbol.NoteheadXWhole
            ),
            InstrumentArticulation.create(
                102,
                'Cowbell High',
                -1,
                56,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpHalf,
                MusicFontSymbol.NoteheadTriangleUpWhole
            ),
            InstrumentArticulation.create(
                103,
                'Cowbell High',
                -1,
                56,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXHalf,
                MusicFontSymbol.NoteheadXWhole
            ),
            InstrumentArticulation.create(
                77,
                'Woodblock Low',
                -9,
                77,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack
            ),
            InstrumentArticulation.create(
                76,
                'Woodblock High',
                -10,
                76,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack
            ),
            InstrumentArticulation.create(
                60,
                'Bongo High',
                -4,
                60,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                104,
                'Bongo High',
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
                'Bongo High',
                -6,
                60,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                61,
                'Bongo Low',
                -7,
                61,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                106,
                'Bongo Low',
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
                'Bongo Low',
                -16,
                61,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                66,
                'Timbale Low',
                10,
                66,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                65,
                'Timbale High',
                9,
                65,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                68,
                'Agogo Low',
                12,
                68,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                67,
                'Agogo High',
                11,
                67,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                64,
                'Conga Low',
                17,
                64,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                108,
                'Conga Low',
                16,
                64,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                109,
                'Conga Low',
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
                'Conga High',
                14,
                63,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                110,
                'Conga High',
                13,
                63,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                62,
                'Conga High',
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
                'Whistle Low',
                -11,
                72,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                71,
                'Whistle High',
                -17,
                71,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                73,
                'Guiro',
                38,
                73,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                74,
                'Guiro',
                37,
                74,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                86,
                'Surdo',
                36,
                86,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                87,
                'Surdo',
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
                'Tambourine',
                3,
                54,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack
            ),
            InstrumentArticulation.create(
                111,
                'Tambourine',
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
                'Tambourine',
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
                'Tambourine',
                -7,
                54,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                79,
                'Cuica',
                30,
                79,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                78,
                'Cuica',
                29,
                78,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                58,
                'Vibraslap',
                28,
                58,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                81,
                'Triangle',
                27,
                81,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                80,
                'Triangle',
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
                'Grancassa',
                25,
                43,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                115,
                'Piatti',
                18,
                49,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                116,
                'Piatti',
                24,
                49,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                69,
                'Cabasa',
                23,
                69,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                117,
                'Cabasa',
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
                'Castanets',
                21,
                85,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                75,
                'Claves',
                20,
                75,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                70,
                'Left Maraca',
                -12,
                70,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                118,
                'Left Maraca',
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
                'Right Maraca',
                -14,
                70,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                120,
                'Right Maraca',
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
                'Shaker',
                -23,
                82,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                122,
                'Shaker',
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
                'Bell Tree',
                -18,
                53,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                123,
                'Bell Tree',
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
                'Jingle Bell',
                -20,
                53,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                83,
                'Tinkle Bell',
                -20,
                53,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                124,
                'Golpe',
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
                'Golpe',
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
                'Hand Clap',
                3,
                39,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                40,
                'Electric Snare',
                3,
                40,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                31,
                'Sticks',
                3,
                40,
                MusicFontSymbol.NoteheadSlashedBlack2,
                MusicFontSymbol.NoteheadSlashedBlack2,
                MusicFontSymbol.NoteheadSlashedBlack2
            ),
            InstrumentArticulation.create(
                41,
                'Very Low Floor Tom',
                5,
                41,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            InstrumentArticulation.create(
                59,
                'Ride Cymbal 2',
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
                'Ride Cymbal 2',
                2,
                59,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                127,
                'Ride Cymbal 2',
                2,
                59,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite
            ),
            InstrumentArticulation.create(
                29,
                'Ride Cymbal 2',
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
                'Reverse Cymbal',
                -3,
                49,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                33,
                'Metronome',
                3,
                37,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            InstrumentArticulation.create(
                34,
                'Metronome',
                3,
                38,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadBlack
            )
        ].map(articulation => [articulation.id, articulation])
    );

    private static _instrumentArticulationNames = new Map<string, string>([
        ['Snare (hit)', 'Snare.38'],
        ['Snare (side stick)', 'Snare.37'],
        ['Snare (rim shot)', 'Snare.91'],
        ['Hi-Hat (closed)', 'Charley.42'],
        ['Hi-Hat (half)', 'Charley.92'],
        ['Hi-Hat (open)', 'Charley.46'],
        ['Pedal Hi-Hat (hit)', 'Charley.44'],
        ['Kick (hit)', 'Acoustic Kick Drum.35'],
        ['Kick (hit) 2', 'Kick Drum.36'],
        ['High Floor Tom (hit)', 'Tom Very High.50'],
        ['High Tom (hit)', 'Tom High.48'],
        ['Mid Tom (hit)', 'Tom Medium.47'],
        ['Low Tom (hit)', 'Tom Low.45'],
        ['Very Low Tom (hit)', 'Tom Very Low.43'],
        ['Ride (edge)', 'Ride.93'],
        ['Ride (middle)', 'Ride.51'],
        ['Ride (bell)', 'Ride.53'],
        ['Ride (choke)', 'Ride.94'],
        ['Splash (hit)', 'Splash.55'],
        ['Splash (choke)', 'Splash.95'],
        ['China (hit)', 'China.52'],
        ['China (choke)', 'China.96'],
        ['Crash high (hit)', 'Crash High.49'],
        ['Crash high (choke)', 'Crash High.97'],
        ['Crash medium (hit)', 'Crash Medium.57'],
        ['Crash medium (choke)', 'Crash Medium.98'],
        ['Cowbell low (hit)', 'Cowbell Low.99'],
        ['Cowbell low (tip)', 'Cowbell Low.100'],
        ['Cowbell medium (hit)', 'Cowbell Medium.56'],
        ['Cowbell medium (tip)', 'Cowbell Medium.101'],
        ['Cowbell high (hit)', 'Cowbell High.102'],
        ['Cowbell high (tip)', 'Cowbell High.103'],
        ['Woodblock low (hit)', 'Woodblock Low.77'],
        ['Woodblock high (hit)', 'Woodblock High.76'],
        ['Bongo High (hit)', 'Bongo High.60'],
        ['Bongo High (mute)', 'Bongo High.104'],
        ['Bongo High (slap)', 'Bongo High.105'],
        ['Bongo Low (hit)', 'Bongo Low.61'],
        ['Bongo Low (mute)', 'Bongo Low.106'],
        ['Bongo Low (slap)', 'Bongo Low.107'],
        ['Timbale low (hit)', 'Timbale Low.66'],
        ['Timbale high (hit)', 'Timbale High.65'],
        ['Agogo low (hit)', 'Agogo Low.68'],
        ['Agogo high (hit)', 'Agogo High.67'],
        ['Conga low (hit)', 'Conga Low.64'],
        ['Conga low (slap)', 'Conga Low.108'],
        ['Conga low (mute)', 'Conga Low.109'],
        ['Conga high (hit)', 'Conga High.63'],
        ['Conga high (slap)', 'Conga High.110'],
        ['Conga high (mute)', 'Conga High.62'],
        ['Whistle low (hit)', 'Whistle Low.72'],
        ['Whistle high (hit)', 'Whistle High.71'],
        ['Guiro (hit)', 'Guiro.73'],
        ['Guiro (scrap-return)', 'Guiro.74'],
        ['Surdo (hit)', 'Surdo.86'],
        ['Surdo (mute)', 'Surdo.87'],
        ['Tambourine (hit)', 'Tambourine.54'],
        ['Tambourine (return)', 'Tambourine.111'],
        ['Tambourine (roll)', 'Tambourine.112'],
        ['Tambourine (hand)', 'Tambourine.113'],
        ['Cuica (open)', 'Cuica.79'],
        ['Cuica (mute)', 'Cuica.78'],
        ['Vibraslap (hit)', 'Vibraslap.58'],
        ['Triangle (hit)', 'Triangle.81'],
        ['Triangle (mute)', 'Triangle.80'],
        ['Grancassa (hit)', 'Grancassa.114'],
        ['Piatti (hit)', 'Piatti.115'],
        ['Piatti (hand)', 'Piatti.116'],
        ['Cabasa (hit)', 'Cabasa.69'],
        ['Cabasa (return)', 'Cabasa.117'],
        ['Castanets (hit)', 'Castanets.85'],
        ['Claves (hit)', 'Claves.75'],
        ['Left Maraca (hit)', 'Left Maraca.70'],
        ['Left Maraca (return)', 'Left Maraca.118'],
        ['Right Maraca (hit)', 'Right Maraca.119'],
        ['Right Maraca (return)', 'Right Maraca.120'],
        ['Shaker (hit)', 'Shaker.82'],
        ['Shaker (return)', 'Shaker.122'],
        ['Bell Tree (hit)', 'Bell Tree.84'],
        ['Bell Tree (return)', 'Bell Tree.123'],
        ['Jingle Bell (hit)', 'Jingle Bell.83'],
        ['Tinkle Bell (hit)', 'Tinkle Bell.83'],
        ['Golpe (thumb)', 'Golpe.124'],
        ['Golpe (finger)', 'Golpe.125'],
        ['Hand Clap (hit)', 'Hand Clap.39'],
        ['Electric Snare (hit)', 'Electric Snare.40'],
        ['Snare (side stick) 2', 'Sticks.31'],
        ['Low Floor Tom (hit)', 'Very Low Floor Tom.41'],
        ['Ride (edge) 2', 'Ride Cymbal 2.59'],
        ['Ride (middle) 2', 'Ride Cymbal 2.126'],
        ['Ride (bell) 2', 'Ride Cymbal 2.127'],
        ['Ride (choke) 2', 'Ride Cymbal 2.29'],
        ['Reverse Cymbal (hit)', 'Reverse Cymbal.30'],
        ['Metronome (hit)', 'Metronome.33'],
        ['Metronome (bell)', 'Metronome.34']
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

        // no efficient lookup for now, mainly used by exporter
        if (articulation) {
            const uniqueId = articulation.uniqueId;
            for (const [name, value] of PercussionMapper.instrumentArticulationNames) {
                if (value === uniqueId) {
                    return name;
                }
            }
        } else {
            const uniqueId = `.${n.percussionArticulation}`;
            for (const [name, value] of PercussionMapper.instrumentArticulationNames) {
                if (value.endsWith(uniqueId)) {
                    return name;
                }
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

    public static getArticulationById(inputMidiNumber: number): InstrumentArticulation | null {
        if (PercussionMapper.instrumentArticulations.has(inputMidiNumber)) {
            return PercussionMapper.instrumentArticulations.get(inputMidiNumber)!;
        }
        return null;
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

    public static readonly instrumentArticulationNames = PercussionMapper._mergeNames([
        new Map<string, string>([
            // these are historical values we supported in the past, but were
            // renamed in Guitar Pro.
            // mostly typos due to typos or clarifications.
            ['Hand (hit)', 'Bongo Low.61'],
            ['Tinkle Bell (hat)', 'Tingle Bell.83'],
            ['Cymbal (hit)', 'Reverse Cymbal.30'],
            ['Snare (side stick) 3', 'Snare.37'],
            ['Snare (hit) 2', 'Snare.38'],
            ['Snare (hit) 3', 'Snare.40'],
            ['Agogo tow (hit)', 'Agogo Low.68'],
            ['Triangle (rnute)', 'Triangle.80'],
            ['Hand (mute)', 'Bongo High.104'],
            ['Hand (slap)', 'Bongo High.105'],
            ['Hand (mute) 2', 'Bongo Low.106'],
            ['Hand (slap) 2', 'Bongo Low.107'],
            ['Piatti (hat)', 'Piatti.115'],
            ['Bell Tee (return)', 'Bell Tree.123']
        ]),
        PercussionMapper._instrumentArticulationNames
    ]);

    private static _mergeNames(maps: Map<string, string>[]) {
        const merged = new Map<string, string>(maps[0]);
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

    private static _instrumentArticulationsByUniqueId: Map<string, InstrumentArticulation> | undefined;
    public static getInstrumentArticulationByUniqueId(uniqueId: string): InstrumentArticulation | undefined {
        let lookup = PercussionMapper._instrumentArticulationsByUniqueId;
        if (!lookup) {
            lookup = new Map<string, InstrumentArticulation>();
            for (const articulation of PercussionMapper.instrumentArticulations.values()) {
                lookup.set(articulation.uniqueId, articulation);
            }
            PercussionMapper._instrumentArticulationsByUniqueId = lookup;
        }

        return lookup.has(uniqueId) ? lookup.get(uniqueId)! : undefined;
    }
}
