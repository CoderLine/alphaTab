import { MusicFontSymbol } from "../glyphs/MusicFontSymbol";
import { Duration } from "@src/model/Duration";
import { TextBaseline } from "@src/platform/ICanvas";

export class InstrumentArticulation {
    public staffLine: number;
    public noteHeadDefault: MusicFontSymbol;
    public noteHeadHalf: MusicFontSymbol;
    public noteHeadWhole: MusicFontSymbol;
    public techniqueSymbol: MusicFontSymbol;
    public techniqueSymbolPlacement: TextBaseline;
    public outputMidiNumber: number;

    public constructor(staffLine: number,
        outputMidiNumber: number,
        noteHeadDefault: MusicFontSymbol,
        noteHeadHalf: MusicFontSymbol,
        noteHeadWhole: MusicFontSymbol,
        techniqueSymbol: MusicFontSymbol = MusicFontSymbol.None,
        techniqueSymbolPlacement: TextBaseline = TextBaseline.Middle) {
        this.outputMidiNumber = outputMidiNumber;
        this.staffLine = staffLine;
        this.noteHeadDefault = noteHeadDefault;
        this.noteHeadHalf = noteHeadHalf !== MusicFontSymbol.None ? noteHeadHalf : noteHeadDefault;
        this.noteHeadWhole = noteHeadWhole !== MusicFontSymbol.None ? noteHeadWhole : noteHeadDefault;
        this.techniqueSymbol = techniqueSymbol;
        this.techniqueSymbolPlacement = techniqueSymbolPlacement;
    }

    public getSymbol(duration: Duration): MusicFontSymbol {
        switch (duration) {
            case Duration.Whole:
                return this.noteHeadWhole;
            case Duration.Half:
                return this.noteHeadHalf;
            default:
                return this.noteHeadDefault;
        }
    }
}

export class PercussionMapper {

    /* 
     * The following map was generated using the following procedure: 
     * 1. Create a GP7 file with a drumkit track
     * 2. Use the DrumKit View to create one note foreach midi note value
     * 3. Export the file as GPX
     * 4. Load the file in the browser using alphaTab and set a breakpoint in the GPX importer where the XML loaded from the container
     * 5. Use the following snippet in the browser console to generate the map init code:
     *      const parser = new DOMParser();
     *      const xmlDoc = parser.parseFromString(xml, 'text/xml');
     *      let program = 29;
     *      const notes = xmlDoc.getElementsByTagName('Note');
     *      const existing = new Map();
     *      let s = '';
     *      for(let i = 0; i < notes.length; i++) {
     *          const note = notes[i];
     *          const element = note.getElementsByTagName('Element');
     *          const variation = note.getElementsByTagName('Element');
     *          if(element.length === 1 && variation.length === 1) {
     *              if(existing.has(`${element[0].textContent}_${variation[0].textContent}`)) {
     *                s += `// Midi Program ${program} has no element/variation combination in GP6 \r\n`
     *              } else {
     *                s += `[PercussionMapper.elementAndVariationToMapKey(${element[0].textContent}, ${variation[0].textContent}), ${program}],\r\n`;
     *                existing.set(`${element[0].textContent}_${variation[0].textContent}`, true);
     *              }
     *          } else {
     *              s += `// Midi Program ${program} has no element/variation combination in GP6 \r\n`
     *          }
     *          program++;
     *      }
     *      copy(s) 
     */
    private static gp6ElementAndVariationToMidi: Map<number/*elementAndVariationToMapKey()*/, number/*Midi Number*/> = new Map([
        // Midi Program 29 has no element/variation combination in GP6 
        // Midi Program 30 has no element/variation combination in GP6 
        // Midi Program 31 has no element/variation combination in GP6 
        // Midi Program 32 has no element/variation combination in GP6 
        // Midi Program 33 has no element/variation combination in GP6 
        [PercussionMapper.elementAndVariationToMapKey(0, 0), 34],
        // Midi Program 35 has no element/variation combination in GP6 
        [PercussionMapper.elementAndVariationToMapKey(1, 1), 36],
        // Midi Program 37 has no element/variation combination in GP6 
        // Midi Program 38 has no element/variation combination in GP6 
        // Midi Program 39 has no element/variation combination in GP6 
        [PercussionMapper.elementAndVariationToMapKey(5, 5), 40],
        [PercussionMapper.elementAndVariationToMapKey(10, 10), 41],
        // Midi Program 42 has no element/variation combination in GP6 
        [PercussionMapper.elementAndVariationToMapKey(11, 11), 43],
        [PercussionMapper.elementAndVariationToMapKey(6, 6), 44],
        // Midi Program 45 has no element/variation combination in GP6 
        [PercussionMapper.elementAndVariationToMapKey(7, 7), 46],
        [PercussionMapper.elementAndVariationToMapKey(8, 8), 47],
        [PercussionMapper.elementAndVariationToMapKey(13, 13), 48],
        [PercussionMapper.elementAndVariationToMapKey(9, 9), 49],
        [PercussionMapper.elementAndVariationToMapKey(15, 15), 50],
        [PercussionMapper.elementAndVariationToMapKey(16, 16), 51],
        // Midi Program 52 has no element/variation combination in GP6 
        // Midi Program 53 has no element/variation combination in GP6 
        [PercussionMapper.elementAndVariationToMapKey(14, 14), 54],
        [PercussionMapper.elementAndVariationToMapKey(3, 3), 55],
        [PercussionMapper.elementAndVariationToMapKey(12, 12), 56],
        // Midi Program 57 has no element/variation combination in GP6 
        // Midi Program 58 has no element/variation combination in GP6 
        // Midi Program 59 has no element/variation combination in GP6 
        // Midi Program 60 has no element/variation combination in GP6 
        // Midi Program 61 has no element/variation combination in GP6 
        // Midi Program 62 has no element/variation combination in GP6 
        // Midi Program 63 has no element/variation combination in GP6 
        // Midi Program 64 has no element/variation combination in GP6 
        // Midi Program 65 has no element/variation combination in GP6 
        // Midi Program 66 has no element/variation combination in GP6 
        // Midi Program 67 has no element/variation combination in GP6 
        // Midi Program 68 has no element/variation combination in GP6 
        // Midi Program 69 has no element/variation combination in GP6 
        // Midi Program 70 has no element/variation combination in GP6 
        // Midi Program 71 has no element/variation combination in GP6 
        // Midi Program 72 has no element/variation combination in GP6 
        // Midi Program 73 has no element/variation combination in GP6 
        // Midi Program 74 has no element/variation combination in GP6 
        // Midi Program 75 has no element/variation combination in GP6 
        // Midi Program 76 has no element/variation combination in GP6 
        // Midi Program 77 has no element/variation combination in GP6 
        // Midi Program 78 has no element/variation combination in GP6 
        // Midi Program 79 has no element/variation combination in GP6 
        // Midi Program 80 has no element/variation combination in GP6 
        // Midi Program 81 has no element/variation combination in GP6 
        // Midi Program 82 has no element/variation combination in GP6 
        // Midi Program 83 has no element/variation combination in GP6 
        // Midi Program 84 has no element/variation combination in GP6 
        // Midi Program 85 has no element/variation combination in GP6 
        // Midi Program 86 has no element/variation combination in GP6 
        // Midi Program 87 has no element/variation combination in GP6 
        // Midi Program 88 has no element/variation combination in GP6 
        // Midi Program 89 has no element/variation combination in GP6 
        // Midi Program 90 has no element/variation combination in GP6 
        // Midi Program 91 has no element/variation combination in GP6 
        // Midi Program 92 has no element/variation combination in GP6 
        // Midi Program 93 has no element/variation combination in GP6 
        // Midi Program 94 has no element/variation combination in GP6 
        [PercussionMapper.elementAndVariationToMapKey(2, 2), 95],
        // Midi Program 96 has no element/variation combination in GP6 
        // Midi Program 97 has no element/variation combination in GP6 
        [PercussionMapper.elementAndVariationToMapKey(4, 4), 98],
        // Midi Program 99 has no element/variation combination in GP6 
        // Midi Program 100 has no element/variation combination in GP6 
        // Midi Program 101 has no element/variation combination in GP6 
        // Midi Program 102 has no element/variation combination in GP6 
        // Midi Program 103 has no element/variation combination in GP6 
        // Midi Program 104 has no element/variation combination in GP6 
        // Midi Program 105 has no element/variation combination in GP6 
        // Midi Program 106 has no element/variation combination in GP6 
        // Midi Program 107 has no element/variation combination in GP6 
        // Midi Program 108 has no element/variation combination in GP6 
        // Midi Program 109 has no element/variation combination in GP6 
        // Midi Program 110 has no element/variation combination in GP6 
        // Midi Program 111 has no element/variation combination in GP6 
        // Midi Program 112 has no element/variation combination in GP6 
        // Midi Program 113 has no element/variation combination in GP6 
        // Midi Program 114 has no element/variation combination in GP6 
        // Midi Program 115 has no element/variation combination in GP6 
        // Midi Program 116 has no element/variation combination in GP6 
        // Midi Program 117 has no element/variation combination in GP6 
        // Midi Program 118 has no element/variation combination in GP6 
        // Midi Program 119 has no element/variation combination in GP6 
        // Midi Program 120 has no element/variation combination in GP6 
        // Midi Program 121 has no element/variation combination in GP6 
        // Midi Program 122 has no element/variation combination in GP6 
    ]);

    private static elementAndVariationToMapKey(element: number, variation: number): number {
        return ((element & 0xFFFF) << 16) | (variation & 0xFFFF);
    }

    public static midiFromElementVariation(element: number, variation: number): number {
        const key = PercussionMapper.elementAndVariationToMapKey(element, variation);
        if (PercussionMapper.gp6ElementAndVariationToMidi.has(key)) {
            return PercussionMapper.gp6ElementAndVariationToMidi.get(key)!;
        } else {
            // unknown combination, should not happen, fallback to some default value (Snare hit)
            return 38;
        }
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
     *      const outputMidiNumber = articulation.getElementsByTagName('OutputMidiNumber')[0].textContent
     * 		const staffLine = articulation.getElementsByTagName('StaffLine')[0].textContent;
     * 		const techniqueSymbol = articulation.getElementsByTagName('TechniqueSymbol')[0].textContent;
     * 		const techniquePlacement = articulation.getElementsByTagName('TechniquePlacement')[0].textContent;
     * 		const noteHeads = articulation.getElementsByTagName('Noteheads')[0].textContent.split(' ').map(n=>n = 'MusicFontSymbol.' + n);
     * 		if(!existingArticulations.has(midi)) {
     *        if(techniqueSymbol) {
     * 		    s += `[${midi}, new InstrumentArticulation(${staffLine}, ${outputMidiNumber}, ${noteHeads[0]}, ${noteHeads[1]}, ${noteHeads[2]}, ${techniqueSymbol}, ${techniquePlacement})],\r\n`;
     *        }
     *        else {
     * 		    s += `[${midi}, new InstrumentArticulation(${staffLine}, ${outputMidiNumber}, ${noteHeads[0]}, ${noteHeads[1]}, ${noteHeads[2]})],\r\n`;
     *        }
     * 		  existingArticulations.set(midi, true);
     * 		}
     * 	}
     * }
     * copy(s)
     */
    private static instrumentArticulations: Map<number, InstrumentArticulation> = new Map([
        [38, new InstrumentArticulation(3, 38, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [37, new InstrumentArticulation(3, 37, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack)],
        [91, new InstrumentArticulation(3, 38, MusicFontSymbol.NoteheadDiamondWhite, MusicFontSymbol.NoteheadDiamondWhite, MusicFontSymbol.NoteheadDiamondWhite)],
        [42, new InstrumentArticulation(-1, 42, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack)],
        [92, new InstrumentArticulation(-1, 46, MusicFontSymbol.NoteheadCircleSlash, MusicFontSymbol.NoteheadCircleSlash, MusicFontSymbol.NoteheadCircleSlash)],
        [46, new InstrumentArticulation(-1, 46, MusicFontSymbol.NoteheadCircleX, MusicFontSymbol.NoteheadCircleX, MusicFontSymbol.NoteheadCircleX)],
        [44, new InstrumentArticulation(9, 44, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack)],
        [35, new InstrumentArticulation(8, 35, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [36, new InstrumentArticulation(7, 36, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [50, new InstrumentArticulation(1, 50, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [48, new InstrumentArticulation(2, 48, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [47, new InstrumentArticulation(4, 47, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [45, new InstrumentArticulation(5, 45, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [43, new InstrumentArticulation(6, 43, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [93, new InstrumentArticulation(0, 51, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.PictEdgeOfCymbal, TextBaseline.Bottom)],
        [51, new InstrumentArticulation(0, 51, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack)],
        [53, new InstrumentArticulation(0, 53, MusicFontSymbol.NoteheadDiamondWhite, MusicFontSymbol.NoteheadDiamondWhite, MusicFontSymbol.NoteheadDiamondWhite)],
        [94, new InstrumentArticulation(0, 51, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.ArticStaccatoAbove, TextBaseline.Top)],
        [55, new InstrumentArticulation(-2, 55, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack)],
        [95, new InstrumentArticulation(-2, 55, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.ArticStaccatoAbove, TextBaseline.Bottom)],
        [52, new InstrumentArticulation(-3, 52, MusicFontSymbol.NoteheadHeavyXHat, MusicFontSymbol.NoteheadHeavyXHat, MusicFontSymbol.NoteheadHeavyXHat)],
        [96, new InstrumentArticulation(-3, 52, MusicFontSymbol.NoteheadHeavyXHat, MusicFontSymbol.NoteheadHeavyXHat, MusicFontSymbol.NoteheadHeavyXHat)],
        [49, new InstrumentArticulation(-2, 49, MusicFontSymbol.NoteheadHeavyX, MusicFontSymbol.NoteheadHeavyX, MusicFontSymbol.NoteheadHeavyX)],
        [97, new InstrumentArticulation(-2, 49, MusicFontSymbol.NoteheadHeavyX, MusicFontSymbol.NoteheadHeavyX, MusicFontSymbol.NoteheadHeavyX, MusicFontSymbol.ArticStaccatoAbove, TextBaseline.Bottom)],
        [57, new InstrumentArticulation(-1, 57, MusicFontSymbol.NoteheadHeavyX, MusicFontSymbol.NoteheadHeavyX, MusicFontSymbol.NoteheadHeavyX)],
        [98, new InstrumentArticulation(-1, 57, MusicFontSymbol.NoteheadHeavyX, MusicFontSymbol.NoteheadHeavyX, MusicFontSymbol.NoteheadHeavyX, MusicFontSymbol.ArticStaccatoAbove, TextBaseline.Bottom)],
        [99, new InstrumentArticulation(1, 56, MusicFontSymbol.NoteheadTriangleUpBlack, MusicFontSymbol.NoteheadTriangleUpHalf, MusicFontSymbol.NoteheadTriangleUpWhole)],
        [100, new InstrumentArticulation(1, 56, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXHalf, MusicFontSymbol.NoteheadXWhole)],
        [56, new InstrumentArticulation(0, 56, MusicFontSymbol.NoteheadTriangleUpBlack, MusicFontSymbol.NoteheadTriangleUpHalf, MusicFontSymbol.NoteheadTriangleUpWhole)],
        [101, new InstrumentArticulation(0, 56, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXHalf, MusicFontSymbol.NoteheadXWhole)],
        [102, new InstrumentArticulation(-1, 56, MusicFontSymbol.NoteheadTriangleUpBlack, MusicFontSymbol.NoteheadTriangleUpHalf, MusicFontSymbol.NoteheadTriangleUpWhole)],
        [103, new InstrumentArticulation(-1, 56, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXHalf, MusicFontSymbol.NoteheadXWhole)],
        [77, new InstrumentArticulation(-9, 77, MusicFontSymbol.NoteheadTriangleUpBlack, MusicFontSymbol.NoteheadTriangleUpBlack, MusicFontSymbol.NoteheadTriangleUpBlack)],
        [76, new InstrumentArticulation(-10, 76, MusicFontSymbol.NoteheadTriangleUpBlack, MusicFontSymbol.NoteheadTriangleUpBlack, MusicFontSymbol.NoteheadTriangleUpBlack)],
        [60, new InstrumentArticulation(-4, 60, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [104, new InstrumentArticulation(-5, 60, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole, MusicFontSymbol.NoteheadParenthesis, TextBaseline.Middle)],
        [105, new InstrumentArticulation(-6, 60, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack)],
        [61, new InstrumentArticulation(-7, 61, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [106, new InstrumentArticulation(-8, 61, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole, MusicFontSymbol.NoteheadParenthesis, TextBaseline.Middle)],
        [107, new InstrumentArticulation(-16, 61, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack)],
        [66, new InstrumentArticulation(10, 66, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [65, new InstrumentArticulation(9, 65, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [68, new InstrumentArticulation(12, 68, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [67, new InstrumentArticulation(11, 67, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [64, new InstrumentArticulation(17, 64, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [108, new InstrumentArticulation(16, 64, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack)],
        [109, new InstrumentArticulation(15, 64, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole, MusicFontSymbol.NoteheadParenthesis, TextBaseline.Middle)],
        [63, new InstrumentArticulation(14, 63, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [110, new InstrumentArticulation(13, 63, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack)],
        [62, new InstrumentArticulation(19, 62, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole, MusicFontSymbol.NoteheadParenthesis, TextBaseline.Middle)],
        [72, new InstrumentArticulation(-11, 72, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [71, new InstrumentArticulation(-17, 71, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [73, new InstrumentArticulation(38, 73, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [74, new InstrumentArticulation(37, 74, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [86, new InstrumentArticulation(36, 86, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [87, new InstrumentArticulation(35, 87, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadParenthesis, TextBaseline.Middle)],
        [54, new InstrumentArticulation(3, 54, MusicFontSymbol.NoteheadTriangleUpBlack, MusicFontSymbol.NoteheadTriangleUpBlack, MusicFontSymbol.NoteheadTriangleUpBlack)],
        [111, new InstrumentArticulation(2, 54, MusicFontSymbol.NoteheadTriangleUpBlack, MusicFontSymbol.NoteheadTriangleUpBlack, MusicFontSymbol.NoteheadTriangleUpBlack, MusicFontSymbol.StringsUpBow, TextBaseline.Bottom)],
        [112, new InstrumentArticulation(1, 54, MusicFontSymbol.NoteheadTriangleUpBlack, MusicFontSymbol.NoteheadTriangleUpBlack, MusicFontSymbol.NoteheadTriangleUpBlack, MusicFontSymbol.StringsDownBow, TextBaseline.Bottom)],
        [113, new InstrumentArticulation(-7, 54, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack)],
        [79, new InstrumentArticulation(30, 79, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [78, new InstrumentArticulation(29, 78, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack)],
        [58, new InstrumentArticulation(28, 58, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [81, new InstrumentArticulation(27, 81, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [80, new InstrumentArticulation(26, 80, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadParenthesis, TextBaseline.Middle)],
        [114, new InstrumentArticulation(25, 43, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [115, new InstrumentArticulation(18, 49, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [116, new InstrumentArticulation(24, 49, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack)],
        [69, new InstrumentArticulation(23, 69, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [117, new InstrumentArticulation(22, 69, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole, MusicFontSymbol.StringsUpBow, TextBaseline.Bottom)],
        [85, new InstrumentArticulation(21, 85, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [75, new InstrumentArticulation(20, 75, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [70, new InstrumentArticulation(-12, 70, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [118, new InstrumentArticulation(-13, 70, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole, MusicFontSymbol.StringsUpBow, TextBaseline.Bottom)],
        [119, new InstrumentArticulation(-14, 70, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [120, new InstrumentArticulation(-15, 70, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole, MusicFontSymbol.StringsUpBow, TextBaseline.Bottom)],
        [82, new InstrumentArticulation(-23, 54, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [122, new InstrumentArticulation(-24, 54, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole, MusicFontSymbol.StringsUpBow, TextBaseline.Bottom)],
        [84, new InstrumentArticulation(-18, 53, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [123, new InstrumentArticulation(-19, 53, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole, MusicFontSymbol.StringsUpBow, TextBaseline.Bottom)],
        [83, new InstrumentArticulation(-20, 53, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [124, new InstrumentArticulation(-21, 62, MusicFontSymbol.NoteheadNull, MusicFontSymbol.NoteheadNull, MusicFontSymbol.NoteheadNull, MusicFontSymbol.GuitarGolpe, TextBaseline.Bottom)],
        [125, new InstrumentArticulation(-22, 62, MusicFontSymbol.NoteheadNull, MusicFontSymbol.NoteheadNull, MusicFontSymbol.NoteheadNull, MusicFontSymbol.GuitarGolpe, TextBaseline.Top)],
        [39, new InstrumentArticulation(3, 39, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [40, new InstrumentArticulation(3, 40, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [31, new InstrumentArticulation(3, 40, MusicFontSymbol.NoteheadSlashedBlack2, MusicFontSymbol.NoteheadSlashedBlack2, MusicFontSymbol.NoteheadSlashedBlack2)],
        [41, new InstrumentArticulation(5, 41, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole)],
        [59, new InstrumentArticulation(2, 59, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.PictEdgeOfCymbal, TextBaseline.Bottom)],
        [126, new InstrumentArticulation(2, 59, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack)],
        [127, new InstrumentArticulation(2, 59, MusicFontSymbol.NoteheadDiamondWhite, MusicFontSymbol.NoteheadDiamondWhite, MusicFontSymbol.NoteheadDiamondWhite)],
        [29, new InstrumentArticulation(2, 59, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.ArticStaccatoAbove, TextBaseline.Top)],
        [30, new InstrumentArticulation(-3, 49, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack)],
        [33, new InstrumentArticulation(3, 37, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack, MusicFontSymbol.NoteheadXBlack)],
        [34, new InstrumentArticulation(3, 38, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadBlack)]
    ]);

    public static getArticulation(midiNumber: number): InstrumentArticulation | null {
        if (PercussionMapper.instrumentArticulations.has(midiNumber)) {
            return PercussionMapper.instrumentArticulations.get(midiNumber)!;
        }
        return null;
    }
}
