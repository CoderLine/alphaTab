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
     * capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
     * existingArticulations = new Map();
     * s = '';
     * for(let i = 0; i < articulations.length; i++) {
     *     const articulation = articulations[i];
     *     let inputMidiNumbers = articulation.getElementsByTagName('InputMidiNumbers');
     *     if(inputMidiNumbers.length === 1 && inputMidiNumbers[0].textContent) {
     *         const inputMidiNumber = inputMidiNumbers[0].textContent;
     *         if(!existingArticulations.has(inputMidiNumber)) {
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
     *             const techniqueSymbol = capitalize(articulation.getElementsByTagName('TechniqueSymbol')[0].textContent);
     *             const techniquePlacement = articulation.getElementsByTagName('TechniquePlacement')[0].textContent;
     *             const outputRSESound = articulation.getElementsByTagName('OutputRSESound')[0]?.textContent || '';
     *             const noteHeads = articulation.getElementsByTagName('Noteheads')[0]
     *                                   .textContent.split(' ')
     *                                   .map(n => 'MusicFontSymbol.' + capitalize(n));
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
     *             s += `                '${elementName}',\r\n`;
     *             s += `                '${elementType}',\r\n`;
     *             s += `                '${articulationName}',\r\n`;
     *             s += `                ${staffLine},\r\n`;
     *             s += `                ${inputMidiNumber},\r\n`;
     *             s += `                ${outputMidiNumber},\r\n`;
     *             s += `                '${outputRSESound}',\r\n`;
     *             s += `                '${soundbankName}',\r\n`;
     *             s += `                ${noteHeads[0]},\r\n`;
     *             s += `                ${noteHeads[1]},\r\n`;
     *             s += `                ${noteHeads[2]},\r\n`;
     *             s += `                ${techniqueSymbolEnum},\r\n`;
     *             s += `                ${placementEnum}\r\n`;
     *             s += `             ),            \r\n`;
     *             
     *             existingArticulations.set(inputMidiNumber, true);
     *         }
     *     }
     * }
     * // Add the array wrapper
     * console.log('[\r\n' + s + '        ].map(articulation => [articulation.inputMidiNumber, articulation])');
     * copy('[\r\n' + s + '        ].map(articulation => [articulation.inputMidiNumber, articulation])');
     */
    public static instrumentArticulations: Map<number, InstrumentArticulation> = new Map([
        new InstrumentArticulation(
            'Snare',
            'snare',
            'Snare (hit)',
            3,
            38,
            38,
            'stick.hit.hit',
            'Master-Snare',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Snare',
            'snare',
            'Snare (side stick)',
            3,
            37,
            37,
            'stick.hit.sidestick',
            'Master-Snare',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack
         ),            
        new InstrumentArticulation(
            'Snare',
            'snare',
            'Snare (rim shot)',
            3,
            91,
            38,
            'stick.hit.rimshot',
            'Master-Snare',
            MusicFontSymbol.NoteheadDiamondWhite,
            MusicFontSymbol.NoteheadDiamondWhite,
            MusicFontSymbol.NoteheadDiamondWhite
         ),            
        new InstrumentArticulation(
            'Charley',
            'hiHat',
            'Hi-Hat (closed)',
            -1,
            42,
            42,
            'stick.hit.closed',
            'Master-Hihat',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack
         ),            
        new InstrumentArticulation(
            'Charley',
            'hiHat',
            'Hi-Hat (half)',
            -1,
            92,
            46,
            'stick.hit.half',
            'Master-Hihat',
            MusicFontSymbol.NoteheadCircleSlash,
            MusicFontSymbol.NoteheadCircleSlash,
            MusicFontSymbol.NoteheadCircleSlash
         ),            
        new InstrumentArticulation(
            'Charley',
            'hiHat',
            'Hi-Hat (open)',
            -1,
            46,
            46,
            'stick.hit.open',
            'Master-Hihat',
            MusicFontSymbol.NoteheadCircleX,
            MusicFontSymbol.NoteheadCircleX,
            MusicFontSymbol.NoteheadCircleX
         ),            
        new InstrumentArticulation(
            'Charley',
            'hiHat',
            'Pedal Hi-Hat (hit)',
            9,
            44,
            44,
            'pedal.hit.pedal',
            'Master-Hihat',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack
         ),            
        new InstrumentArticulation(
            'Acoustic Kick Drum',
            'kickDrum',
            'Kick (hit)',
            8,
            35,
            35,
            'pedal.hit.hit',
            'AcousticKick-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Kick Drum',
            'kickDrum',
            'Kick (hit)',
            7,
            36,
            36,
            'pedal.hit.hit',
            'Master-Kick',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Tom Very High',
            'tom',
            'High Floor Tom (hit)',
            1,
            50,
            50,
            'stick.hit.hit',
            'Master-Tom05',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Tom High',
            'tom',
            'High Tom (hit)',
            2,
            48,
            48,
            'stick.hit.hit',
            'Master-Tom04',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Tom Medium',
            'tom',
            'Mid Tom (hit)',
            4,
            47,
            47,
            'stick.hit.hit',
            'Master-Tom03',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Tom Low',
            'tom',
            'Low Tom (hit)',
            5,
            45,
            45,
            'stick.hit.hit',
            'Master-Tom02',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Tom Very Low',
            'tom',
            'Very Low Tom (hit)',
            6,
            43,
            43,
            'stick.hit.hit',
            'Master-Tom01',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Ride',
            'ride',
            'Ride (edge)',
            0,
            93,
            51,
            'stick.hit.edge',
            'Master-Ride',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.PictEdgeOfCymbal,
            TechniqueSymbolPlacement.Above
         ),            
        new InstrumentArticulation(
            'Ride',
            'ride',
            'Ride (middle)',
            0,
            51,
            51,
            'stick.hit.mid',
            'Master-Ride',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack
         ),            
        new InstrumentArticulation(
            'Ride',
            'ride',
            'Ride (bell)',
            0,
            53,
            53,
            'stick.hit.bell',
            'Master-Ride',
            MusicFontSymbol.NoteheadDiamondWhite,
            MusicFontSymbol.NoteheadDiamondWhite,
            MusicFontSymbol.NoteheadDiamondWhite
         ),            
        new InstrumentArticulation(
            'Ride',
            'ride',
            'Ride (choke)',
            0,
            94,
            51,
            'stick.hit.choke',
            'Master-Ride',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.ArticStaccatoAbove,
            TechniqueSymbolPlacement.Outside
         ),            
        new InstrumentArticulation(
            'Splash',
            'splash',
            'Splash (hit)',
            -2,
            55,
            55,
            'stick.hit.hit',
            'Master-Splash',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack
         ),            
        new InstrumentArticulation(
            'Splash',
            'splash',
            'Splash (choke)',
            -2,
            95,
            55,
            'stick.hit.choke',
            'Master-Splash',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.ArticStaccatoAbove,
            TechniqueSymbolPlacement.Outside
         ),            
        new InstrumentArticulation(
            'China',
            'china',
            'China (hit)',
            -3,
            52,
            52,
            'stick.hit.hit',
            'Master-China',
            MusicFontSymbol.NoteheadHeavyXHat,
            MusicFontSymbol.NoteheadHeavyXHat,
            MusicFontSymbol.NoteheadHeavyXHat
         ),            
        new InstrumentArticulation(
            'China',
            'china',
            'China (choke)',
            -3,
            96,
            52,
            'stick.hit.choke',
            'Master-China',
            MusicFontSymbol.NoteheadHeavyXHat,
            MusicFontSymbol.NoteheadHeavyXHat,
            MusicFontSymbol.NoteheadHeavyXHat
         ),            
        new InstrumentArticulation(
            'Crash High',
            'crash',
            'Crash high (hit)',
            -2,
            49,
            49,
            'stick.hit.hit',
            'Master-Crash02',
            MusicFontSymbol.NoteheadHeavyX,
            MusicFontSymbol.NoteheadHeavyX,
            MusicFontSymbol.NoteheadHeavyX
         ),            
        new InstrumentArticulation(
            'Crash High',
            'crash',
            'Crash high (choke)',
            -2,
            97,
            49,
            'stick.hit.choke',
            'Master-Crash02',
            MusicFontSymbol.NoteheadHeavyX,
            MusicFontSymbol.NoteheadHeavyX,
            MusicFontSymbol.NoteheadHeavyX,
            MusicFontSymbol.ArticStaccatoAbove,
            TechniqueSymbolPlacement.Outside
         ),            
        new InstrumentArticulation(
            'Crash Medium',
            'crash',
            'Crash medium (hit)',
            -1,
            57,
            57,
            'stick.hit.hit',
            'Master-Crash01',
            MusicFontSymbol.NoteheadHeavyX,
            MusicFontSymbol.NoteheadHeavyX,
            MusicFontSymbol.NoteheadHeavyX
         ),            
        new InstrumentArticulation(
            'Crash Medium',
            'crash',
            'Crash medium (choke)',
            -1,
            98,
            57,
            'stick.hit.choke',
            'Master-Crash01',
            MusicFontSymbol.NoteheadHeavyX,
            MusicFontSymbol.NoteheadHeavyX,
            MusicFontSymbol.NoteheadHeavyX,
            MusicFontSymbol.ArticStaccatoAbove,
            TechniqueSymbolPlacement.Outside
         ),            
        new InstrumentArticulation(
            'Cowbell Low',
            'cowbell',
            'Cowbell low (hit)',
            1,
            99,
            56,
            'stick.hit.hit',
            'CowbellBig-Percu',
            MusicFontSymbol.NoteheadTriangleUpBlack,
            MusicFontSymbol.NoteheadTriangleUpHalf,
            MusicFontSymbol.NoteheadTriangleUpWhole
         ),            
        new InstrumentArticulation(
            'Cowbell Low',
            'cowbell',
            'Cowbell low (tip)',
            1,
            100,
            56,
            'stick.hit.tip',
            'CowbellBig-Percu',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXHalf,
            MusicFontSymbol.NoteheadXWhole
         ),            
        new InstrumentArticulation(
            'Cowbell Medium',
            'cowbell',
            'Cowbell medium (hit)',
            0,
            56,
            56,
            'stick.hit.hit',
            'CowbellMid-Percu',
            MusicFontSymbol.NoteheadTriangleUpBlack,
            MusicFontSymbol.NoteheadTriangleUpHalf,
            MusicFontSymbol.NoteheadTriangleUpWhole
         ),            
        new InstrumentArticulation(
            'Cowbell Medium',
            'cowbell',
            'Cowbell medium (tip)',
            0,
            101,
            56,
            'stick.hit.tip',
            'CowbellMid-Percu',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXHalf,
            MusicFontSymbol.NoteheadXWhole
         ),            
        new InstrumentArticulation(
            'Cowbell High',
            'cowbell',
            'Cowbell high (hit)',
            -1,
            102,
            56,
            'stick.hit.hit',
            'CowbellSmall-Percu',
            MusicFontSymbol.NoteheadTriangleUpBlack,
            MusicFontSymbol.NoteheadTriangleUpHalf,
            MusicFontSymbol.NoteheadTriangleUpWhole
         ),            
        new InstrumentArticulation(
            'Cowbell High',
            'cowbell',
            'Cowbell high (tip)',
            -1,
            103,
            56,
            'stick.hit.tip',
            'CowbellSmall-Percu',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXHalf,
            MusicFontSymbol.NoteheadXWhole
         ),            
        new InstrumentArticulation(
            'Woodblock Low',
            'woodblock',
            'Woodblock low (hit)',
            -9,
            77,
            77,
            'stick.hit.hit',
            'WoodblockLow-Percu',
            MusicFontSymbol.NoteheadTriangleUpBlack,
            MusicFontSymbol.NoteheadTriangleUpBlack,
            MusicFontSymbol.NoteheadTriangleUpBlack
         ),            
        new InstrumentArticulation(
            'Woodblock High',
            'woodblock',
            'Woodblock high (hit)',
            -10,
            76,
            76,
            'stick.hit.hit',
            'WoodblockHigh-Percu',
            MusicFontSymbol.NoteheadTriangleUpBlack,
            MusicFontSymbol.NoteheadTriangleUpBlack,
            MusicFontSymbol.NoteheadTriangleUpBlack
         ),            
        new InstrumentArticulation(
            'Bongo High',
            'bongo',
            'Bongo High (hit)',
            -4,
            60,
            60,
            'hand.hit.hit',
            'BongoHigh-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Bongo High',
            'bongo',
            'Bongo High (mute)',
            -5,
            104,
            60,
            'hand.hit.mute',
            'BongoHigh-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole,
            MusicFontSymbol.NoteheadParenthesis,
            TechniqueSymbolPlacement.Inside
         ),            
        new InstrumentArticulation(
            'Bongo High',
            'bongo',
            'Bongo High (slap)',
            -6,
            105,
            60,
            'hand.hit.slap',
            'BongoHigh-Percu',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack
         ),            
        new InstrumentArticulation(
            'Bongo Low',
            'bongo',
            'Bongo Low (hit)',
            -7,
            61,
            61,
            'hand.hit.hit',
            'BongoLow-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Bongo Low',
            'bongo',
            'Bongo Low (mute)',
            -8,
            106,
            61,
            'hand.hit.mute',
            'BongoLow-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole,
            MusicFontSymbol.NoteheadParenthesis,
            TechniqueSymbolPlacement.Inside
         ),            
        new InstrumentArticulation(
            'Bongo Low',
            'bongo',
            'Bongo Low (slap)',
            -16,
            107,
            61,
            'hand.hit.slap',
            'BongoLow-Percu',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack
         ),            
        new InstrumentArticulation(
            'Timbale Low',
            'timbale',
            'Timbale low (hit)',
            10,
            66,
            66,
            'stick.hit.hit',
            'TimbaleLow-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Timbale High',
            'timbale',
            'Timbale high (hit)',
            9,
            65,
            65,
            'stick.hit.hit',
            'TimbaleHigh-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Agogo Low',
            'agogo',
            'Agogo low (hit)',
            12,
            68,
            68,
            'stick.hit.hit',
            'AgogoLow-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Agogo High',
            'agogo',
            'Agogo high (hit)',
            11,
            67,
            67,
            'stick.hit.hit',
            'AgogoHigh-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Conga Low',
            'conga',
            'Conga low (hit)',
            17,
            64,
            64,
            'hand.hit.hit',
            'CongaLow-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Conga Low',
            'conga',
            'Conga low (slap)',
            16,
            108,
            64,
            'hand.hit.slap',
            'CongaLow-Percu',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack
         ),            
        new InstrumentArticulation(
            'Conga Low',
            'conga',
            'Conga low (mute)',
            15,
            109,
            64,
            'hand.hit.mute',
            'CongaLow-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole,
            MusicFontSymbol.NoteheadParenthesis,
            TechniqueSymbolPlacement.Inside
         ),            
        new InstrumentArticulation(
            'Conga High',
            'conga',
            'Conga high (hit)',
            14,
            63,
            63,
            'hand.hit.hit',
            'CongaHigh-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Conga High',
            'conga',
            'Conga high (slap)',
            13,
            110,
            63,
            'hand.hit.slap',
            'CongaHigh-Percu',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack
         ),            
        new InstrumentArticulation(
            'Conga High',
            'conga',
            'Conga high (mute)',
            19,
            62,
            62,
            'hand.hit.mute',
            'CongaHigh-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole,
            MusicFontSymbol.NoteheadParenthesis,
            TechniqueSymbolPlacement.Inside
         ),            
        new InstrumentArticulation(
            'Whistle Low',
            'whistle',
            'Whistle low (hit)',
            -11,
            72,
            72,
            'blow.hit.hit',
            'WhistleLow-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Whistle High',
            'whistle',
            'Whistle high (hit)',
            -17,
            71,
            71,
            'blow.hit.hit',
            'WhistleHigh-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Guiro',
            'guiro',
            'Guiro (hit)',
            38,
            73,
            73,
            'stick.hit.hit',
            'Guiro-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Guiro',
            'guiro',
            'Guiro (scrap-return)',
            37,
            74,
            74,
            'stick.scrape.return',
            'Guiro-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Surdo',
            'surdo',
            'Surdo (hit)',
            36,
            86,
            86,
            'brush.hit.hit',
            'Surdo-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Surdo',
            'surdo',
            'Surdo (mute)',
            35,
            87,
            87,
            'brush.hit.mute',
            'Surdo-Percu',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadParenthesis,
            TechniqueSymbolPlacement.Inside
         ),            
        new InstrumentArticulation(
            'Tambourine',
            'tambourine',
            'Tambourine (hit)',
            3,
            54,
            54,
            'hand.hit.hit',
            'Tambourine-Percu',
            MusicFontSymbol.NoteheadTriangleUpBlack,
            MusicFontSymbol.NoteheadTriangleUpBlack,
            MusicFontSymbol.NoteheadTriangleUpBlack
         ),            
        new InstrumentArticulation(
            'Tambourine',
            'tambourine',
            'Tambourine (return)',
            2,
            111,
            54,
            'hand.hit.return',
            'Tambourine-Percu',
            MusicFontSymbol.NoteheadTriangleUpBlack,
            MusicFontSymbol.NoteheadTriangleUpBlack,
            MusicFontSymbol.NoteheadTriangleUpBlack,
            MusicFontSymbol.StringsUpBow,
            TechniqueSymbolPlacement.Above
         ),            
        new InstrumentArticulation(
            'Tambourine',
            'tambourine',
            'Tambourine (roll)',
            1,
            112,
            54,
            'hand.hit.roll',
            'Tambourine-Percu',
            MusicFontSymbol.NoteheadTriangleUpBlack,
            MusicFontSymbol.NoteheadTriangleUpBlack,
            MusicFontSymbol.NoteheadTriangleUpBlack,
            MusicFontSymbol.StringsDownBow,
            TechniqueSymbolPlacement.Above
         ),            
        new InstrumentArticulation(
            'Tambourine',
            'tambourine',
            'Tambourine (hand)',
            -7,
            113,
            54,
            'hand.hit.handhit',
            'Tambourine-Percu',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack
         ),            
        new InstrumentArticulation(
            'Cuica',
            'cuica',
            'Cuica (open)',
            30,
            79,
            79,
            'hand.hit.hit',
            'Cuica-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Cuica',
            'cuica',
            'Cuica (mute)',
            29,
            78,
            78,
            'hand.hit.mute',
            'Cuica-Percu',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack
         ),            
        new InstrumentArticulation(
            'Vibraslap',
            'vibraslap',
            'Vibraslap (hit)',
            28,
            58,
            58,
            'hand.hit.hit',
            'Vibraslap-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Triangle',
            'triangle',
            'Triangle (hit)',
            27,
            81,
            81,
            'stick.hit.hit',
            'Triangle-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Triangle',
            'triangle',
            'Triangle (mute)',
            26,
            80,
            80,
            'stick.hit.mute',
            'Triangle-Percu',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadParenthesis,
            TechniqueSymbolPlacement.Inside
         ),            
        new InstrumentArticulation(
            'Grancassa',
            'grancassa',
            'Grancassa (hit)',
            25,
            114,
            43,
            'mallet.hit.hit',
            'Grancassa-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Piatti',
            'piatti',
            'Piatti (hit)',
            18,
            115,
            49,
            'hand.hit.hit',
            'Piatti-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Piatti',
            'piatti',
            'Piatti (hand)',
            24,
            116,
            49,
            'hand.hit.hit',
            'Piatti-Percu',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack
         ),            
        new InstrumentArticulation(
            'Cabasa',
            'cabasa',
            'Cabasa (hit)',
            23,
            69,
            69,
            'hand.hit.hit',
            'Cabasa-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Cabasa',
            'cabasa',
            'Cabasa (return)',
            22,
            117,
            69,
            'hand.hit.return',
            'Cabasa-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole,
            MusicFontSymbol.StringsUpBow,
            TechniqueSymbolPlacement.Outside
         ),            
        new InstrumentArticulation(
            'Castanets',
            'castanets',
            'Castanets (hit)',
            21,
            85,
            85,
            'hand.hit.hit',
            'Castanets-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Claves',
            'claves',
            'Claves (hit)',
            20,
            75,
            75,
            'stick.hit.hit',
            'Claves-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Left Maraca',
            'maraca',
            'Left Maraca (hit)',
            -12,
            70,
            70,
            'hand.hit.hit',
            'Maracas-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Left Maraca',
            'maraca',
            'Left Maraca (return)',
            -13,
            118,
            70,
            'hand.hit.return',
            'Maracas-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole,
            MusicFontSymbol.StringsUpBow,
            TechniqueSymbolPlacement.Outside
         ),            
        new InstrumentArticulation(
            'Right Maraca',
            'maraca',
            'Right Maraca (hit)',
            -14,
            119,
            70,
            'hand.hit.hit',
            'Maracas-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Right Maraca',
            'maraca',
            'Right Maraca (return)',
            -15,
            120,
            70,
            'hand.hit.return',
            'Maracas-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole,
            MusicFontSymbol.StringsUpBow,
            TechniqueSymbolPlacement.Outside
         ),            
        new InstrumentArticulation(
            'Shaker',
            'shaker',
            'Shaker (hit)',
            -23,
            82,
            82,
            'hand.hit.hit',
            'ShakerStudio-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Shaker',
            'shaker',
            'Shaker (return)',
            -24,
            122,
            82,
            'hand.hit.return',
            'ShakerStudio-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole,
            MusicFontSymbol.StringsUpBow,
            TechniqueSymbolPlacement.Outside
         ),            
        new InstrumentArticulation(
            'Bell Tree',
            'bellTree',
            'Bell Tree (hit)',
            -18,
            84,
            53,
            'stick.hit.hit',
            'BellTree-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Bell Tree',
            'bellTree',
            'Bell Tree (return)',
            -19,
            123,
            53,
            'stick.hit.return',
            'BellTree-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole,
            MusicFontSymbol.StringsUpBow,
            TechniqueSymbolPlacement.Outside
         ),            
        new InstrumentArticulation(
            'Jingle Bell',
            'jingleBell',
            'Jingle Bell (hit)',
            -20,
            83,
            53,
            'stick.hit.hit',
            'JingleBell-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Golpe',
            'unpitched',
            'Golpe (thumb)',
            -21,
            124,
            62,
            'thumb.hit.body',
            'Golpe-Percu',
            MusicFontSymbol.NoteheadNull,
            MusicFontSymbol.NoteheadNull,
            MusicFontSymbol.NoteheadNull,
            MusicFontSymbol.GuitarGolpe,
            TechniqueSymbolPlacement.Below
         ),            
        new InstrumentArticulation(
            'Golpe',
            'unpitched',
            'Golpe (finger)',
            -22,
            125,
            62,
            'finger4.hit.body',
            'Golpe-Percu',
            MusicFontSymbol.NoteheadNull,
            MusicFontSymbol.NoteheadNull,
            MusicFontSymbol.NoteheadNull,
            MusicFontSymbol.GuitarGolpe,
            TechniqueSymbolPlacement.Above
         ),            
        new InstrumentArticulation(
            'Hand Clap',
            'handClap',
            'Hand Clap (hit)',
            3,
            39,
            39,
            'hand.hit.hit',
            'GroupHandClap-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Electric Snare',
            'snare',
            'Electric Snare (hit)',
            3,
            40,
            40,
            'stick.hit.hit',
            'ElectricSnare-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Sticks',
            'snare',
            'Snare (side stick)',
            3,
            31,
            40,
            'stick.hit.sidestick',
            'Stick-Percu',
            MusicFontSymbol.NoteheadSlashedBlack2,
            MusicFontSymbol.NoteheadSlashedBlack2,
            MusicFontSymbol.NoteheadSlashedBlack2
         ),            
        new InstrumentArticulation(
            'Very Low Floor Tom',
            'tom',
            'Low Floor Tom (hit)',
            5,
            41,
            41,
            'stick.hit.hit',
            'LowFloorTom-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadHalf,
            MusicFontSymbol.NoteheadWhole
         ),            
        new InstrumentArticulation(
            'Ride Cymbal 2',
            'ride',
            'Ride (edge)',
            2,
            59,
            59,
            'stick.hit.edge',
            'Ride-Percu',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.PictEdgeOfCymbal,
            TechniqueSymbolPlacement.Above
         ),            
        new InstrumentArticulation(
            'Ride Cymbal 2',
            'ride',
            'Ride (middle)',
            2,
            126,
            59,
            'stick.hit.mid',
            'Ride-Percu',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack
         ),            
        new InstrumentArticulation(
            'Ride Cymbal 2',
            'ride',
            'Ride (bell)',
            2,
            127,
            59,
            'stick.hit.bell',
            'Ride-Percu',
            MusicFontSymbol.NoteheadDiamondWhite,
            MusicFontSymbol.NoteheadDiamondWhite,
            MusicFontSymbol.NoteheadDiamondWhite
         ),            
        new InstrumentArticulation(
            'Ride Cymbal 2',
            'ride',
            'Ride (choke)',
            2,
            29,
            59,
            'stick.hit.choke',
            'Ride-Percu',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.ArticStaccatoAbove,
            TechniqueSymbolPlacement.Outside
         ),            
        new InstrumentArticulation(
            'Reverse Cymbal',
            'crash',
            'Reverse Cymbal (hit)',
            -3,
            30,
            49,
            'stick.hit.hit',
            'Reverse-Cymbal',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack
         ),            
        new InstrumentArticulation(
            'Metronome',
            'snare',
            'Metronome (hit)',
            3,
            33,
            37,
            'stick.hit.sidestick',
            'Metronome-Percu',
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack,
            MusicFontSymbol.NoteheadXBlack
         ),            
        new InstrumentArticulation(
            'Metronome',
            'snare',
            'Metronome (bell)',
            3,
            34,
            38,
            'stick.hit.hit',
            'Metronome-Percu',
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadBlack,
            MusicFontSymbol.NoteheadBlack
         ),            
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
        if(articulation && articulation.articulationName !== '') {
            return articulation.articulationName;
        }

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
