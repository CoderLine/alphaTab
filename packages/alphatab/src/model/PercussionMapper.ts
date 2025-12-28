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
     * 1. Make a new GP8 file with a drumkit track
     * 2. Add one note for each midi value using the instrument panel
     * 3. Load the file in alphaTab and set a breakpoint in the GP8 importer.
     * 4. Use the following snippet in the console to generate the map initializer (fix enums manually):
     * 
     * parser = new DOMParser();
     * xmlDoc = parser.parseFromString(xml, 'text/xml');
     * articulations = xmlDoc.getElementsByTagName('Articulation');
     * existingArticulations = new Map();
     * s = '';
     * for(let i = 0; i < articulations.length; i++) {
     *     const articulation = articulations[i];
     *     let inputMidiNumbers = articulation.getElementsByTagName('InputMidiNumbers');
     *     if(inputMidiNumbers.length === 1 && inputMidiNumbers[0].textContent) {
     *         const midi = inputMidiNumbers[0].textContent;
     *         if(!existingArticulations.has(midi)) {
     *             // Get Element-level data
     *             const element = articulation.parentElement.parentElement;
     *             const elementType = element.getElementsByTagName('Type')[0].textContent;
     *             const elementName = element.getElementsByTagName('Name')[0].textContent;
     *             const soundbankName = element.getElementsByTagName('SoundbankName')[0]?.textContent || '';
     *             
     *             // Get Articulation-level data
     *             const articulationName = articulation.getElementsByTagName('Name')[0].textContent;
     *             const outputMidiNumber = articulation.getElementsByTagName('OutputMidiNumber')[0].textContent;
     *             const staffLine = articulation.getElementsByTagName('StaffLine')[0].textContent;
     *             const techniqueSymbol = articulation.getElementsByTagName('TechniqueSymbol')[0].textContent;
     *             const techniquePlacement = articulation.getElementsByTagName('TechniquePlacement')[0].textContent;
     *             const outputRSESound = articulation.getElementsByTagName('OutputRSESound')[0]?.textContent || '';
     *             const noteHeads = articulation.getElementsByTagName('Noteheads')[0].textContent.split(' ').map(n => 'MusicFontSymbol.' + n);
     *             
     *             // Map technique placement to enum
     *             const placementMap = {
     *                 'above': 'TechniqueSymbolPlacement.Above',
     *                 'below': 'TechniqueSymbolPlacement.Below',
     *                 'inside': 'TechniqueSymbolPlacement.Inside',
     *                 'outside': 'TechniqueSymbolPlacement.Outside'
     *             };
     *             const placementEnum = placementMap[techniquePlacement] || 'TechniqueSymbolPlacement.Inside';
     *             
     *             // Map technique symbol to enum (if exists)
     *             const techniqueSymbolEnum = techniqueSymbol ? 'MusicFontSymbol.' + techniqueSymbol : 'MusicFontSymbol.None';
     *             
     *             // Generate the code
     *             s += `            new InstrumentArticulation(\r\n`;
     *             s += `                '${elementType}',\r\n`;
     *             s += `                ${staffLine},\r\n`;
     *             s += `                ${outputMidiNumber},\r\n`;
     *             s += `                ${noteHeads[0]},\r\n`;
     *             s += `                ${noteHeads[1]},\r\n`;
     *             s += `                ${noteHeads[2]},\r\n`;
     *             s += `                ${techniqueSymbolEnum},\r\n`;
     *             s += `                ${placementEnum},\r\n`;
     *             s += `                ${midi},\r\n`;
     *             s += `                '${outputRSESound}',\r\n`;
     *             s += `                '${soundbankName}',\r\n`;
     *             s += `                '${articulationName}',\r\n`;
     *             s += `                '${elementName}'\r\n`;
     *             s += `             ),            \r\n`;
     *             
     *             existingArticulations.set(midi, true);
     *         }
     *     }
     * }
     * // Add the array wrapper
     * console.log('[\r\n' + s + '        ].map(articulation => [articulation.inputMidiNumber, articulation])');
     * copy('[\r\n' + s + '        ].map(articulation => [articulation.inputMidiNumber, articulation])');
     */
    public static instrumentArticulations: Map<number, InstrumentArticulation> = new Map([            
        new InstrumentArticulation(
                'snare',
                3,
                38,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                38,
                'stick.hit.hit',
                'Master-Snare',
                'Snare (hit)',
                'Snare'
            ),            
        new InstrumentArticulation(
                'snare',
                3,
                37,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                37,
                'stick.hit.sidestick',
                'Master-Snare',
                'Snare (side stick)',
                'Snare'
            ),            
        new InstrumentArticulation(
                'snare',
                3,
                38,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                91,
                'stick.hit.rimshot',
                'Master-Snare',
                'Snare (rim shot)',
                'Snare'
            ),            
        new InstrumentArticulation(
                'hiHat',
                -1,
                42,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                42,
                'stick.hit.closed',
                'Master-Hihat',
                'Hi-Hat (closed)',
                'Charley'
            ),            
        new InstrumentArticulation(
                'hiHat',
                -1,
                46,
                MusicFontSymbol.NoteheadCircleSlash,
                MusicFontSymbol.NoteheadCircleSlash,
                MusicFontSymbol.NoteheadCircleSlash,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                92,
                'stick.hit.half',
                'Master-Hihat',
                'Hi-Hat (half)',
                'Charley'
            ),            
        new InstrumentArticulation(
                'hiHat',
                -1,
                46,
                MusicFontSymbol.NoteheadCircleX,
                MusicFontSymbol.NoteheadCircleX,
                MusicFontSymbol.NoteheadCircleX,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                46,
                'stick.hit.open',
                'Master-Hihat',
                'Hi-Hat (open)',
                'Charley'
            ),            
        new InstrumentArticulation(
                'hiHat',
                9,
                44,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                44,
                'pedal.hit.pedal',
                'Master-Hihat',
                'Pedal Hi-Hat (hit)',
                'Charley'
            ),            
        new InstrumentArticulation(
                'kickDrum',
                8,
                35,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                35,
                'pedal.hit.hit',
                'AcousticKick-Percu',
                'Kick (hit)',
                'Acoustic Kick Drum'
            ),            
        new InstrumentArticulation(
                'kickDrum',
                7,
                36,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                36,
                'pedal.hit.hit',
                'Master-Kick',
                'Kick (hit)',
                'Kick Drum'
            ),            
        new InstrumentArticulation(
                'tom',
                1,
                50,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                50,
                'stick.hit.hit',
                'Master-Tom05',
                'High Floor Tom (hit)',
                'Tom Very High'
            ),            
        new InstrumentArticulation(
                'tom',
                2,
                48,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                48,
                'stick.hit.hit',
                'Master-Tom04',
                'High Tom (hit)',
                'Tom High'
            ),            
        new InstrumentArticulation(
                'tom',
                4,
                47,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                47,
                'stick.hit.hit',
                'Master-Tom03',
                'Mid Tom (hit)',
                'Tom Medium'
            ),            
        new InstrumentArticulation(
                'tom',
                5,
                45,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                45,
                'stick.hit.hit',
                'Master-Tom02',
                'Low Tom (hit)',
                'Tom Low'
            ),            
        new InstrumentArticulation(
                'tom',
                6,
                43,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                43,
                'stick.hit.hit',
                'Master-Tom01',
                'Very Low Tom (hit)',
                'Tom Very Low'
            ),            
        new InstrumentArticulation(
                'ride',
                0,
                51,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.PictEdgeOfCymbal,
                TechniqueSymbolPlacement.Above,
                93,
                'stick.hit.edge',
                'Master-Ride',
                'Ride (edge)',
                'Ride'
            ),            
        new InstrumentArticulation(
                'ride',
                0,
                51,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                51,
                'stick.hit.mid',
                'Master-Ride',
                'Ride (middle)',
                'Ride'
            ),            
        new InstrumentArticulation(
                'ride',
                0,
                53,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                53,
                'stick.hit.bell',
                'Master-Ride',
                'Ride (bell)',
                'Ride'
            ),            
        new InstrumentArticulation(
                'ride',
                0,
                51,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.ArticStaccatoAbove,
                TechniqueSymbolPlacement.Outside,
                94,
                'stick.hit.choke',
                'Master-Ride',
                'Ride (choke)',
                'Ride'
            ),            
        new InstrumentArticulation(
                'splash',
                -2,
                55,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                55,
                'stick.hit.hit',
                'Master-Splash',
                'Splash (hit)',
                'Splash'
            ),            
        new InstrumentArticulation(
                'splash',
                -2,
                55,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.ArticStaccatoAbove,
                TechniqueSymbolPlacement.Outside,
                95,
                'stick.hit.choke',
                'Master-Splash',
                'Splash (choke)',
                'Splash'
            ),            
        new InstrumentArticulation(
                'china',
                -3,
                52,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                52,
                'stick.hit.hit',
                'Master-China',
                'China (hit)',
                'China'
            ),            
        new InstrumentArticulation(
                'china',
                -3,
                52,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.NoteheadHeavyXHat,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                96,
                'stick.hit.choke',
                'Master-China',
                'China (choke)',
                'China'
            ),            
        new InstrumentArticulation(
                'crash',
                -2,
                49,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                49,
                'stick.hit.hit',
                'Master-Crash02',
                'Crash high (hit)',
                'Crash High'
            ),            
        new InstrumentArticulation(
                'crash',
                -2,
                49,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.ArticStaccatoAbove,
                TechniqueSymbolPlacement.Outside,
                97,
                'stick.hit.choke',
                'Master-Crash02',
                'Crash high (choke)',
                'Crash High'
            ),            
        new InstrumentArticulation(
                'crash',
                -1,
                57,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                57,
                'stick.hit.hit',
                'Master-Crash01',
                'Crash medium (hit)',
                'Crash Medium'
            ),            
        new InstrumentArticulation(
                'crash',
                -1,
                57,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.NoteheadHeavyX,
                MusicFontSymbol.ArticStaccatoAbove,
                TechniqueSymbolPlacement.Outside,
                98,
                'stick.hit.choke',
                'Master-Crash01',
                'Crash medium (choke)',
                'Crash Medium'
            ),            
        new InstrumentArticulation(
                'cowbell',
                1,
                56,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpHalf,
                MusicFontSymbol.NoteheadTriangleUpWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                99,
                'stick.hit.hit',
                'CowbellBig-Percu',
                'Cowbell low (hit)',
                'Cowbell Low'
            ),            
        new InstrumentArticulation(
                'cowbell',
                1,
                56,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXHalf,
                MusicFontSymbol.NoteheadXWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                100,
                'stick.hit.tip',
                'CowbellBig-Percu',
                'Cowbell low (tip)',
                'Cowbell Low'
            ),            
        new InstrumentArticulation(
                'cowbell',
                0,
                56,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpHalf,
                MusicFontSymbol.NoteheadTriangleUpWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                56,
                'stick.hit.hit',
                'CowbellMid-Percu',
                'Cowbell medium (hit)',
                'Cowbell Medium'
            ),            
        new InstrumentArticulation(
                'cowbell',
                0,
                56,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXHalf,
                MusicFontSymbol.NoteheadXWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                101,
                'stick.hit.tip',
                'CowbellMid-Percu',
                'Cowbell medium (tip)',
                'Cowbell Medium'
            ),            
        new InstrumentArticulation(
                'cowbell',
                -1,
                56,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpHalf,
                MusicFontSymbol.NoteheadTriangleUpWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                102,
                'stick.hit.hit',
                'CowbellSmall-Percu',
                'Cowbell high (hit)',
                'Cowbell High'
            ),            
        new InstrumentArticulation(
                'cowbell',
                -1,
                56,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXHalf,
                MusicFontSymbol.NoteheadXWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                103,
                'stick.hit.tip',
                'CowbellSmall-Percu',
                'Cowbell high (tip)',
                'Cowbell High'
            ),            
        new InstrumentArticulation(
                'woodblock',
                -9,
                77,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                77,
                'stick.hit.hit',
                'WoodblockLow-Percu',
                'Woodblock low (hit)',
                'Woodblock Low'
            ),            
        new InstrumentArticulation(
                'woodblock',
                -10,
                76,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                76,
                'stick.hit.hit',
                'WoodblockHigh-Percu',
                'Woodblock high (hit)',
                'Woodblock High'
            ),            
        new InstrumentArticulation(
                'bongo',
                -4,
                60,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                60,
                'hand.hit.hit',
                'BongoHigh-Percu',
                'Bongo High (hit)',
                'Bongo High'
            ),            
        new InstrumentArticulation(
                'bongo',
                -5,
                60,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside,
                104,
                'hand.hit.mute',
                'BongoHigh-Percu',
                'Bongo High (mute)',
                'Bongo High'
            ),            
        new InstrumentArticulation(
                'bongo',
                -6,
                60,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                105,
                'hand.hit.slap',
                'BongoHigh-Percu',
                'Bongo High (slap)',
                'Bongo High'
            ),            
        new InstrumentArticulation(
                'bongo',
                -7,
                61,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                61,
                'hand.hit.hit',
                'BongoLow-Percu',
                'Bongo Low (hit)',
                'Bongo Low'
            ),            
        new InstrumentArticulation(
                'bongo',
                -8,
                61,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside,
                106,
                'hand.hit.mute',
                'BongoLow-Percu',
                'Bongo Low (mute)',
                'Bongo Low'
            ),            
        new InstrumentArticulation(
                'bongo',
                -16,
                61,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                107,
                'hand.hit.slap',
                'BongoLow-Percu',
                'Bongo Low (slap)',
                'Bongo Low'
            ),            
        new InstrumentArticulation(
                'timbale',
                10,
                66,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                66,
                'stick.hit.hit',
                'TimbaleLow-Percu',
                'Timbale low (hit)',
                'Timbale Low'
            ),            
        new InstrumentArticulation(
                'timbale',
                9,
                65,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                65,
                'stick.hit.hit',
                'TimbaleHigh-Percu',
                'Timbale high (hit)',
                'Timbale High'
            ),            
        new InstrumentArticulation(
                'agogo',
                12,
                68,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                68,
                'stick.hit.hit',
                'AgogoLow-Percu',
                'Agogo low (hit)',
                'Agogo Low'
            ),            
        new InstrumentArticulation(
                'agogo',
                11,
                67,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                67,
                'stick.hit.hit',
                'AgogoHigh-Percu',
                'Agogo high (hit)',
                'Agogo High'
            ),            
        new InstrumentArticulation(
                'conga',
                17,
                64,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                64,
                'hand.hit.hit',
                'CongaLow-Percu',
                'Conga low (hit)',
                'Conga Low'
            ),            
        new InstrumentArticulation(
                'conga',
                16,
                64,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                108,
                'hand.hit.slap',
                'CongaLow-Percu',
                'Conga low (slap)',
                'Conga Low'
            ),            
        new InstrumentArticulation(
                'conga',
                15,
                64,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside,
                109,
                'hand.hit.mute',
                'CongaLow-Percu',
                'Conga low (mute)',
                'Conga Low'
            ),            
        new InstrumentArticulation(
                'conga',
                14,
                63,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                63,
                'hand.hit.hit',
                'CongaHigh-Percu',
                'Conga high (hit)',
                'Conga High'
            ),            
        new InstrumentArticulation(
                'conga',
                13,
                63,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                110,
                'hand.hit.slap',
                'CongaHigh-Percu',
                'Conga high (slap)',
                'Conga High'
            ),            
        new InstrumentArticulation(
                'conga',
                19,
                62,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside,
                62,
                'hand.hit.mute',
                'CongaHigh-Percu',
                'Conga high (mute)',
                'Conga High'
            ),            
        new InstrumentArticulation(
                'whistle',
                -11,
                72,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                72,
                'blow.hit.hit',
                'WhistleLow-Percu',
                'Whistle low (hit)',
                'Whistle Low'
            ),            
        new InstrumentArticulation(
                'whistle',
                -17,
                71,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                71,
                'blow.hit.hit',
                'WhistleHigh-Percu',
                'Whistle high (hit)',
                'Whistle High'
            ),            
        new InstrumentArticulation(
                'guiro',
                38,
                73,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                73,
                'stick.hit.hit',
                'Guiro-Percu',
                'Guiro (hit)',
                'Guiro'
            ),            
        new InstrumentArticulation(
                'guiro',
                37,
                74,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                74,
                'stick.scrape.return',
                'Guiro-Percu',
                'Guiro (scrap-return)',
                'Guiro'
            ),            
        new InstrumentArticulation(
                'surdo',
                36,
                86,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                86,
                'brush.hit.hit',
                'Surdo-Percu',
                'Surdo (hit)',
                'Surdo'
            ),            
        new InstrumentArticulation(
                'surdo',
                35,
                87,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadParenthesis,
                TechniqueSymbolPlacement.Inside,
                87,
                'brush.hit.mute',
                'Surdo-Percu',
                'Surdo (mute)',
                'Surdo'
            ),            
        new InstrumentArticulation(
                'tambourine',
                3,
                54,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                54,
                'hand.hit.hit',
                'Tambourine-Percu',
                'Tambourine (hit)',
                'Tambourine'
            ),            
        new InstrumentArticulation(
                'tambourine',
                2,
                54,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.StringsUpBow,
                TechniqueSymbolPlacement.Above,
                111,
                'hand.hit.return',
                'Tambourine-Percu',
                'Tambourine (return)',
                'Tambourine'
            ),            
        new InstrumentArticulation(
                'tambourine',
                1,
                54,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.NoteheadTriangleUpBlack,
                MusicFontSymbol.StringsDownBow,
                TechniqueSymbolPlacement.Above,
                112,
                'hand.hit.roll',
                'Tambourine-Percu',
                'Tambourine (roll)',
                'Tambourine'
            ),            
        new InstrumentArticulation(
                'tambourine',
                -7,
                54,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.None,
                TechniqueSymbolPlacement.Outside,
                113,
                'hand.hit.handhit',
                'Tambourine-Percu',
                'Tambourine (hand)',
                'Tambourine'
            ),            
        new InstrumentArticulation(
                'cuica',
                30,
                79,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),            
        new InstrumentArticulation(
                'cuica',
                29,
                78,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),            
        new InstrumentArticulation(
                'vibraslap',
                28,
                58,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),            
        new InstrumentArticulation(
                'triangle',
                27,
                81,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),            
        new InstrumentArticulation(
                'triangle',
                26,
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
                43,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),            
        new InstrumentArticulation(
                'piatti',
                18,
                49,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),            
        new InstrumentArticulation(
                'piatti',
                24,
                49,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),            
        new InstrumentArticulation(
                'cabasa',
                23,
                69,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),            
        new InstrumentArticulation(
                'cabasa',
                22,
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
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),            
        new InstrumentArticulation(
                'claves',
                20,
                75,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),            
        new InstrumentArticulation(
                'maraca',
                -12,
                70,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),            
        new InstrumentArticulation(
                'maraca',
                -13,
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
                70,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),            
        new InstrumentArticulation(
                'maraca',
                -15,
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
                54,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),            
        new InstrumentArticulation(
                'shaker',
                -24,
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
                53,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),            
        new InstrumentArticulation(
                'bellTree',
                -19,
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
                53,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),            
        new InstrumentArticulation(
                'unpitched',
                -21,
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
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),            
        new InstrumentArticulation(
                'snare',
                3,
                40,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),            
        new InstrumentArticulation(
                'snare',
                3,
                40,
                MusicFontSymbol.NoteheadSlashedBlack2,
                MusicFontSymbol.NoteheadSlashedBlack2,
                MusicFontSymbol.NoteheadSlashedBlack2
            ),            
        new InstrumentArticulation(
                'tom',
                5,
                41,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadHalf,
                MusicFontSymbol.NoteheadWhole
            ),            
        new InstrumentArticulation(
                'ride',
                2,
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
                59,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),            
        new InstrumentArticulation(
                'ride',
                2,
                59,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite,
                MusicFontSymbol.NoteheadDiamondWhite
            ),            
        new InstrumentArticulation(
                'ride',
                2,
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
                49,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),            
        new InstrumentArticulation(
                'snare',
                3,
                37,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack,
                MusicFontSymbol.NoteheadXBlack
            ),            
        new InstrumentArticulation(
                'snare',
                3,
                38,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadBlack,
                MusicFontSymbol.NoteheadBlack
            )
        ].map(articulation => [articulation.inputMidiNumber, articulation])
);

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
