import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { InstrumentArticulation, TechniqueSymbolPlacement } from '@coderline/alphatab/model/InstrumentArticulation';
import type { Note } from '@coderline/alphatab/model/Note';

/**
 * @internal
 */
export class PercussionMapper {
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

    /*
     * This map was generated using the following steps:
     * 1. Make a new GP7 file with a drumkit track
     * 2. Add one note for each midi value using the instrument panel
     * 3. Load the file in alphaTab and set a breakpoint in the GP7 importer.
     * 4. Use the following snipped in the console to generate the map initializer (fix enums manually):
     * parser = new DOMParser();
     * xmlDoc = parser.parseFromString(xml, 'text/xml');
     * articulations = xmlDoc.getElementsByTagName('Articulation');
     * existingArticulations = new Map();
     * s = '';
     * for(let i = 0; i < articulations.length; i++) {
     *     const articulation = articulations[i];
     *     let midi = articulation.getElementsByTagName('InputMidiNumbers');
     * 	if(midi.length === 1) {
     * 		midi = midi[0].textContent;
     *      const elementType = articulation.parentElement.parentElement.getElementsByTagName('Type')[0].textContent;
     *      const outputMidiNumber = articulation.getElementsByTagName('OutputMidiNumber')[0].textContent;
     * 		const staffLine = articulation.getElementsByTagName('StaffLine')[0].textContent;
     * 		const techniqueSymbol = articulation.getElementsByTagName('TechniqueSymbol')[0].textContent;
     * 		const techniquePlacement = articulation.getElementsByTagName('TechniquePlacement')[0].textContent;
     * 		const noteHeads = articulation.getElementsByTagName('Noteheads')[0].textContent.split(' ').map(n=>n = 'MusicFontSymbol.' + n);
     * 		if(!existingArticulations.has(midi)) {
     *        if(techniqueSymbol) {
     * 		    s += `new InstrumentArticulation(${staffLine}, ${midi}, ${outputMidiNumber}, ${noteHeads[0]}, ${noteHeads[1]}, ${noteHeads[2]}, ${techniqueSymbol}, ${techniquePlacement}),\r\n`;
     *        }
     *        else {
     * 		    s += `new InstrumentArticulation(${staffLine}, ${midi}, ${outputMidiNumber}, ${noteHeads[0]}, ${noteHeads[1]}, ${noteHeads[2]}),\r\n`;
     *        }
     * 		  existingArticulations.set(midi, true);
     * 		}
     * 	}
     * }
     * copy(s)
     */
    public static instrumentArticulations: Map<number, InstrumentArticulation> = new Map([
            new InstrumentArticulation(
                'snare',
                3,
                38,
                38,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'snare',
                3,
                37,
                37,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            new InstrumentArticulation(
                'snare',
                3,
                91,
                38,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite
            ),
            new InstrumentArticulation(
                'hiHat',
                -1,
                42,
                42,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            new InstrumentArticulation(
                'hiHat',
                -1,
                92,
                46,
                MusicFontSymbol.NoteheadCircleSlash,
                MusicFontSymbol.NoteheadCircleSlash,
                MusicFontSymbol.NoteheadCircleSlash
            ),
            new InstrumentArticulation(
                'hiHat',
                -1,
                46,
                46,
                MusicFontSymbol.NoteheadCircleX,
                MusicFontSymbol.NoteheadCircleX,
                MusicFontSymbol.NoteheadCircleX
            ),
            new InstrumentArticulation(
                'hiHat',
                9,
                44,
                44,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            new InstrumentArticulation(
                'kickDrum',
                8,
                35,
                35,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'kickDrum',
                7,
                36,
                36,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'tom',
                1,
                50,
                50,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'tom',
                2,
                48,
                48,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'tom',
                4,
                47,
                47,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'tom',
                5,
                45,
                45,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'tom',
                6,
                43,
                43,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'ride',
                0,
                93,
                51,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.PictEdgeOfCymbal,
                TechniqueSymbolPlacement.Below
            ),
            new InstrumentArticulation(
                'ride',
                0,
                51,
                51,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            new InstrumentArticulation(
                'ride',
                0,
                53,
                53,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite
            ),
            new InstrumentArticulation(
                'ride',
                0,
                94,
                51,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.ArticStaccatoAbove,
                TechniqueSymbolPlacement.Above
            ),
            new InstrumentArticulation(
                'splash',
                -2,
                55,
                55,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            new InstrumentArticulation(
                'splash',
                -2,
                95,
                55,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.ArticStaccatoAbove,
                TechniqueSymbolPlacement.Below
            ),
            new InstrumentArticulation(
                'china',
                -3,
                52,
                52,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat
            ),
            new InstrumentArticulation(
                'china',
                -3,
                96,
                52,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat
            ),
            new InstrumentArticulation(
                'crash',
                -2,
                49,
                49,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX
            ),
            new InstrumentArticulation(
                'crash',
                -2,
                97,
                49,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.ArticStaccatoAbove,
                TechniqueSymbolPlacement.Below
            ),
            new InstrumentArticulation(
                'crash',
                -1,
                57,
                57,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX
            ),
            new InstrumentArticulation(
                'crash',
                -1,
                98,
                57,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.ArticStaccatoAbove,
                TechniqueSymbolPlacement.Below
            ),
            new InstrumentArticulation(
                'cowbell',
                1,
                99,
                56,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpHalf,
                MusicFontSymbol.NoteheadTriangleUpWhole
            ),
            new InstrumentArticulation(
                'cowbell',
                1,
                 100,
                56,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXHalf,
                MusicFontSymbol.NoteheadXWhole
            ),
            new InstrumentArticulation(
                'cowbell',
                0,
                56,
                56,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpHalf,
                MusicFontSymbol.NoteheadTriangleUpWhole
            ),
            new InstrumentArticulation(
                'cowbell',
                0,
                 101,
                56,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXHalf,
                MusicFontSymbol.NoteheadXWhole
            ),
            new InstrumentArticulation(
                'cowbell',
                -1,
                 102,
                56,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpHalf,
                MusicFontSymbol.NoteheadTriangleUpWhole
            ),
            new InstrumentArticulation(
                'cowbell',
                -1,
                 103,
                56,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXHalf,
                MusicFontSymbol.NoteheadXWhole
            ),
            new InstrumentArticulation(
                'woodblock',
                -9,
                77,
                77,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack
            ),
            new InstrumentArticulation(
                'woodblock',
                -10,
                76,
                76,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack
            ),
            new InstrumentArticulation(
                'bongo',
                -4,
                60,
                60,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'bongo',
                -5,
                 104,
                60,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside
            ),
            new InstrumentArticulation(
                'bongo',
                -6,
                 105,
                60,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            new InstrumentArticulation(
                'bongo',
                -7,
                61,
                61,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'bongo',
                -8,
                 106,
                61,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside
            ),
            new InstrumentArticulation(
                'bongo',
                -16,
                 107,
                61,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            new InstrumentArticulation(
                'timbale',
                10,
                66,
                66,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'timbale',
                9,
                65,
                65,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'agogo',
                12,
                68,
                68,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'agogo',
                11,
                67,
                67,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'conga',
                17,
                64,
                64,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'conga',
                16,
                 108,
                64,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            new InstrumentArticulation(
                'conga',
                15,
                 109,
                64,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside
            ),
            new InstrumentArticulation(
                'conga',
                14,
                63,
                63,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'conga',
                13,
                 110,
                63,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            new InstrumentArticulation(
                'conga',
                19,
                62,
                62,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside
            ),
            new InstrumentArticulation(
                'whistle',
                -11,
                72,
                72,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'whistle',
                -17,
                71,
                71,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'guiro',
                38,
                73,
                73,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'guiro',
                37,
                74,
                74,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'surdo',
                36,
                86,
                86,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'surdo',
                35,
                87,
                87,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside
            ),
            new InstrumentArticulation(
                'tambourine',
                3,
                54,
                54,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack
            ),
            new InstrumentArticulation(
                'tambourine',
                2,
                 111,
                54,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.StringsUpBow,
                TechniqueSymbolPlacement.Below
            ),
            new InstrumentArticulation(
                'tambourine',
                1,
                 112,
                54,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.StringsDownBow,
                TechniqueSymbolPlacement.Below
            ),
            new InstrumentArticulation(
                'tambourine',
                -7,
                 113,
                54,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            new InstrumentArticulation(
                'cuica',
                30,
                79,
                79,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'cuica',
                29,
                78,
                78,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            new InstrumentArticulation(
                'vibraslap',
                28,
                58,
                58,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'triangle',
                27,
                81,
                81,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'triangle',
                26,
                80,
                80,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside
            ),
            new InstrumentArticulation(
                'grancassa',
                25,
                 114,
                43,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'piatti',
                18,
                 115,
                49,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'piatti',
                24,
                 116,
                49,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            new InstrumentArticulation(
                'cabasa',
                23,
                69,
                69,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'cabasa',
                22,
                 117,
                69,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.StringsUpBow,
                TechniqueSymbolPlacement.Below
            ),
            new InstrumentArticulation(
                'castanets',
                21,
                85,
                85,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'claves',
                20,
                75,
                75,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'maraca',
                -12,
                70,
                70,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'maraca',
                -13,
                 118,
                70,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.StringsUpBow,
                TechniqueSymbolPlacement.Below
            ),
            new InstrumentArticulation(
                'maraca',
                -14,
                 119,
                70,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'maraca',
                -15,
                 120,
                70,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.StringsUpBow,
                TechniqueSymbolPlacement.Below
            ),
            new InstrumentArticulation(
                'shaker',
                -23,
                82,
                54,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'shaker',
                -24,
                 122,
                54,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.StringsUpBow,
                TechniqueSymbolPlacement.Below
            ),
            new InstrumentArticulation(
                'bellTree',
                -18,
                84,
                53,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'bellTree',
                -19,
                 123,
                53,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.StringsUpBow,
                TechniqueSymbolPlacement.Below
            ),
            new InstrumentArticulation(
                'jingleBell',
                -20,
                83,
                53,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'unpitched',
                -21,
                 124,
                62,
                MusicFontSymbol.NoteheadNull,
                MusicFontSymbol.NoteheadNull,
                MusicFontSymbol.NoteheadNull,
                MusicFontSymbol.GuitarGolpe,
                TechniqueSymbolPlacement.Above
            ),
            new InstrumentArticulation(
                'unpitched',
                -22,
                 125,
                62,
                MusicFontSymbol.NoteheadNull,
                MusicFontSymbol.NoteheadNull,
                MusicFontSymbol.NoteheadNull,
                MusicFontSymbol.GuitarGolpe,
                TechniqueSymbolPlacement.Below
            ),
            new InstrumentArticulation(
                'handClap',
                3,
                39,
                39,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'snare',
                3,
                40,
                40,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'snare',
                3,
                31,
                40,
                MusicFontSymbol.NoteheadSlashedBlack2,
                MusicFontSymbol.NoteheadSlashedBlack2,
                MusicFontSymbol.NoteheadSlashedBlack2
            ),
            new InstrumentArticulation(
                'tom',
                5,
                41,
                41,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),
            new InstrumentArticulation(
                'ride',
                2,
                59,
                59,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.PictEdgeOfCymbal,
                TechniqueSymbolPlacement.Below
            ),
            new InstrumentArticulation(
                'ride',
                2,
                 126,
                59,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            new InstrumentArticulation(
                'ride',
                2,
                 127,
                59,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite
            ),
            new InstrumentArticulation(
                'ride',
                2,
                29,
                59,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.ArticStaccatoAbove,
                TechniqueSymbolPlacement.Above
            ),
            new InstrumentArticulation(
                'crash',
                -3,
                30,
                49,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            new InstrumentArticulation(
                'snare',
                3,
                33,
                37,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),
            new InstrumentArticulation(
                'snare',
                3,
                34,
                38,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadBlack
            )
    ].map(articulation => [articulation.inputMidiNumber, articulation]));

    // these are manually defined names/identifiers for the articulation list above.
    // they are currently only used in the AlphaTex importer when using default articulations
    // but they are kept here close to the source of the default aritculation list to maintain them together.
    public static instrumentArticulationNames = new Map<string, number>([
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
        ['Hand (hit)', 60],
        ['Hand (hit)', 61],
        ['Bongo high (hit)', 60],
        ['Bongo low (hit)', 61],
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
        ['Jingle Bell (hit)', 83],
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

        return PercussionMapper.getArticulationByInputMidiNumber(articulationIndex);
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
                const gp6Articulation = PercussionMapper.getArticulationByInputMidiNumber(variations[variation]);
                if (gp6Articulation?.outputMidiNumber === articulation.outputMidiNumber) {
                    return [element, variation];
                }
            }
        }

        return [-1, -1];
    }

    public static getArticulationByInputMidiNumber(inputMidiNumber: number): InstrumentArticulation | null {
        if (PercussionMapper.instrumentArticulations.has(inputMidiNumber)) {
            return PercussionMapper.instrumentArticulations.get(inputMidiNumber)!;
        }
        return null;
    }
}
