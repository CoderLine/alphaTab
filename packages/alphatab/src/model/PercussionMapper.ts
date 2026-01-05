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
                31,
                'Sticks',
                3,
                40,
                MusicFontSymbol.NoteheadSlashedBlack2,
                MusicFontSymbol.NoteheadSlashedBlack2,
                MusicFontSymbol.NoteheadSlashedBlack2
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
                37,
                'Snare',
                3,
                37,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
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
                41,
                'Very Low Floor Tom',
                5,
                41,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
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
                43,
                'Tom Very Low',
                6,
                43,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
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
                45,
                'Tom Low',
                5,
                45,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
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
                47,
                'Tom Medium',
                4,
                47,
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
                49,
                'Crash High',
                -2,
                49,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX
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
                51,
                'Ride',
                0,
                51,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
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
                53,
                'Ride',
                0,
                53,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite
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
                55,
                'Splash',
                -2,
                55,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
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
                57,
                'Crash Medium',
                -1,
                57,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX
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
                60,
                'Bongo High',
                -4,
                60,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
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
                63,
                'Conga High',
                14,
                63,
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
                65,
                'Timbale High',
                9,
                65,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
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
                67,
                'Agogo High',
                11,
                67,
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
                69,
                'Cabasa',
                23,
                69,
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
                71,
                'Whistle High',
                -17,
                71,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
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
                75,
                'Claves',
                20,
                75,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
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
                77,
                'Woodblock Low',
                -9,
                77,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack
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
                79,
                'Cuica',
                30,
                79,
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
                81,
                'Triangle',
                27,
                81,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
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
                83,
                'Tinkle Bell',
                -20,
                53,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
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
                85,
                'Castanets',
                21,
                85,
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
                91,
                'Snare',
                3,
                38,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite
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
                96,
                'China',
                -3,
                52,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat
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
                110,
                'Conga High',
                13,
                63,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
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
            )
        ].map(articulation => [articulation.id, articulation])
    );

    private static _instrumentArticulationNames = new Map<string, number>([
        ['Ride (choke)', 29],
        ['Cymbal (hit)', 30],
        ['Snare (side stick)', 31],
        ['Snare (side stick) 2', 33],
        ['Snare (hit)', 34],
        ['Kick (hit)', 35],
        ['Kick (hit) 2', 36],
        ['Snare (side stick) 3', 37],
        ['Snare (hit) 2', 38],
        ['Hand Clap (hit)', 39],
        ['Snare (hit) 3', 40],
        ['Low Floor Tom (hit)', 41],
        ['Hi-Hat (closed)', 42],
        ['Very Low Tom (hit)', 43],
        ['Pedal Hi-Hat (hit)', 44],
        ['Low Tom (hit)', 45],
        ['Hi-Hat (open)', 46],
        ['Mid Tom (hit)', 47],
        ['High Tom (hit)', 48],
        ['Crash high (hit)', 49],
        ['High Floor Tom (hit)', 50],
        ['Ride (middle)', 51],
        ['China (hit)', 52],
        ['Ride (bell)', 53],
        ['Tambourine (hit)', 54],
        ['Splash (hit)', 55],
        ['Cowbell medium (hit)', 56],
        ['Crash medium (hit)', 57],
        ['Vibraslap (hit)', 58],
        ['Ride (edge)', 59],
        ['Bongo high (hit)', 60],
        ['Hand (hit)', 61],
        ['Conga high (mute)', 62],
        ['Conga high (hit)', 63],
        ['Conga low (hit)', 64],
        ['Timbale high (hit)', 65],
        ['Timbale low (hit)', 66],
        ['Agogo high (hit)', 67],
        ['Agogo tow (hit)', 68],
        ['Cabasa (hit)', 69],
        ['Left Maraca (hit)', 70],
        ['Whistle high (hit)', 71],
        ['Whistle low (hit)', 72],
        ['Guiro (hit)', 73],
        ['Guiro (scrap-return)', 74],
        ['Claves (hit)', 75],
        ['Woodblock high (hit)', 76],
        ['Woodblock low (hit)', 77],
        ['Cuica (mute)', 78],
        ['Cuica (open)', 79],
        ['Triangle (rnute)', 80],
        ['Triangle (hit)', 81],
        ['Shaker (hit)', 82],
        ['Tinkle Bell (hat)', 83],
        ['Bell Tree (hit)', 84],
        ['Castanets (hit)', 85],
        ['Surdo (hit)', 86],
        ['Surdo (mute)', 87],
        ['Snare (rim shot)', 91],
        ['Hi-Hat (half)', 92],
        ['Ride (edge) 2', 93],
        ['Ride (choke) 2', 94],
        ['Splash (choke)', 95],
        ['China (choke)', 96],
        ['Crash high (choke)', 97],
        ['Crash medium (choke)', 98],
        ['Cowbell low (hit)', 99],
        ['Cowbell low (tip)', 100],
        ['Cowbell medium (tip)', 101],
        ['Cowbell high (hit)', 102],
        ['Cowbell high (tip)', 103],
        ['Hand (mute)', 104],
        ['Hand (slap)', 105],
        ['Hand (mute) 2', 106],
        ['Hand (slap) 2', 107],
        ['Conga low (slap)', 108],
        ['Conga low (mute)', 109],
        ['Conga high (slap)', 110],
        ['Tambourine (return)', 111],
        ['Tambourine (roll)', 112],
        ['Tambourine (hand)', 113],
        ['Grancassa (hit)', 114],
        ['Piatti (hat)', 115],
        ['Piatti (hand)', 116],
        ['Cabasa (return)', 117],
        ['Left Maraca (return)', 118],
        ['Right Maraca (hit)', 119],
        ['Right Maraca (return)', 120],
        ['Shaker (return)', 122],
        ['Bell Tee (return)', 123],
        ['Golpe (thumb)', 124],
        ['Golpe (finger)', 125],
        ['Ride (middle) 2', 126],
        ['Ride (bell) 2', 127]
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
