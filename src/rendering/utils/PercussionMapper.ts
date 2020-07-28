import { MusicFontSymbol } from "../glyphs/MusicFontSymbol";
import { Duration } from "@src/model/Duration";

class InstrumentArticulation {
    public staffLine: number = 0;
    public noteHeadQuarter: MusicFontSymbol = MusicFontSymbol.NoteQuarter;
    public noteHalf: MusicFontSymbol = MusicFontSymbol.NoteHalf;
    public noteWhole: MusicFontSymbol = MusicFontSymbol.NoteWhole;

    public constructor(staffLine: number,
        noteHeadQuarter: MusicFontSymbol,
        NoteHalf: MusicFontSymbol,
        NoteWhole: MusicFontSymbol) {
        this.staffLine = staffLine;
        this.noteHeadQuarter = noteHeadQuarter;
        this.noteHalf = NoteHalf !== MusicFontSymbol.None ? NoteHalf : noteHeadQuarter;
        this.noteWhole = NoteWhole !== MusicFontSymbol.None ? NoteWhole : noteHeadQuarter;
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
     * 4. Use the following snipped in the console to generate the map initializer (fix musicfont symbols manually): 
     * const articulations = xmlDoc.getElementsByTagName('Articulation');
     * const existingArticulations = new Map();
     * let s = '';
     * for(let i = 0; i < articulations.length; i++) {
     *     const articulation = articulations[i];
     *     let midi = articulation.getElementsByTagName('OutputMidiNumber');
     * 	if(midi.length === 1) {
     * 		midi = midi[0].textContent;
     * 		const staffLine = articulation.getElementsByTagName('StaffLine')[0].textContent;
     * 		const noteHeads = articulation.getElementsByTagName('Noteheads')[0].textContent.split(' ').map(n=>n = 'MusicFontSymbol.' + n);
     * 		if(!existingArticulations.has(midi)) {
     * 		  s += `[${midi}, new InstrumentArticulation(${staffLine}, ${noteHeads[0]}, ${noteHeads[1]}, ${noteHeads[2]}],\r\n`;
     * 		  existingArticulations.set(midi, true);
     * 		}
     * 	}
     * }
     * copy(s)
     */
    private static instrumentArticulations: Map<number, InstrumentArticulation> = new Map([
        [38, new InstrumentArticulation(3, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [37, new InstrumentArticulation(3, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack)],
        [42, new InstrumentArticulation(-1, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack)],
        [46, new InstrumentArticulation(-1, MusicFontSymbol.NoteCircleX, MusicFontSymbol.NoteCircleX, MusicFontSymbol.NoteCircleX)],
        [44, new InstrumentArticulation(9, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack)],
        [35, new InstrumentArticulation(8, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [36, new InstrumentArticulation(7, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [50, new InstrumentArticulation(1, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [48, new InstrumentArticulation(2, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [47, new InstrumentArticulation(4, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [45, new InstrumentArticulation(5, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [43, new InstrumentArticulation(6, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [51, new InstrumentArticulation(0, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack)],
        [53, new InstrumentArticulation(0, MusicFontSymbol.NoteDiamondWhite, MusicFontSymbol.NoteDiamondWhite, MusicFontSymbol.NoteDiamondWhite)],
        [55, new InstrumentArticulation(-2, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack)],
        [52, new InstrumentArticulation(-3, MusicFontSymbol.NoteHeavyXHat, MusicFontSymbol.NoteHeavyXHat, MusicFontSymbol.NoteHeavyXHat)],
        [49, new InstrumentArticulation(-2, MusicFontSymbol.NoteHeavyX, MusicFontSymbol.NoteHeavyX, MusicFontSymbol.NoteHeavyX)],
        [57, new InstrumentArticulation(-1, MusicFontSymbol.NoteHeavyX, MusicFontSymbol.NoteHeavyX, MusicFontSymbol.NoteHeavyX)],
        [56, new InstrumentArticulation(1, MusicFontSymbol.NoteTriangleUpBlack, MusicFontSymbol.NoteTriangleUpHalf, MusicFontSymbol.NoteTriangleUpWhole)],
        [77, new InstrumentArticulation(-9, MusicFontSymbol.NoteTriangleUpBlack, MusicFontSymbol.NoteTriangleUpBlack, MusicFontSymbol.NoteTriangleUpBlack)],
        [76, new InstrumentArticulation(-10, MusicFontSymbol.NoteTriangleUpBlack, MusicFontSymbol.NoteTriangleUpBlack, MusicFontSymbol.NoteTriangleUpBlack)],
        [60, new InstrumentArticulation(-4, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [61, new InstrumentArticulation(-7, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [66, new InstrumentArticulation(10, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [65, new InstrumentArticulation(9, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [68, new InstrumentArticulation(12, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [67, new InstrumentArticulation(11, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [64, new InstrumentArticulation(17, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [63, new InstrumentArticulation(14, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [62, new InstrumentArticulation(19, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [72, new InstrumentArticulation(-11, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [71, new InstrumentArticulation(-17, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [73, new InstrumentArticulation(38, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [74, new InstrumentArticulation(37, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [86, new InstrumentArticulation(36, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [87, new InstrumentArticulation(35, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack)],
        [54, new InstrumentArticulation(3, MusicFontSymbol.NoteTriangleUpBlack, MusicFontSymbol.NoteTriangleUpBlack, MusicFontSymbol.NoteTriangleUpBlack)],
        [79, new InstrumentArticulation(30, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [78, new InstrumentArticulation(29, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack)],
        [58, new InstrumentArticulation(28, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [81, new InstrumentArticulation(27, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [80, new InstrumentArticulation(26, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack)],
        [69, new InstrumentArticulation(23, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [85, new InstrumentArticulation(21, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [75, new InstrumentArticulation(20, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [70, new InstrumentArticulation(-12, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [39, new InstrumentArticulation(3, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [40, new InstrumentArticulation(3, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [41, new InstrumentArticulation(5, MusicFontSymbol.NoteQuarter, MusicFontSymbol.NoteHalf, MusicFontSymbol.NoteWhole)],
        [59, new InstrumentArticulation(2, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack, MusicFontSymbol.NoteXBlack)],
    ]);

    public static percussionMidiToLine(midiNumber: number): number {
        if (PercussionMapper.instrumentArticulations.has(midiNumber)) {
            return PercussionMapper.instrumentArticulations.get(midiNumber)!.staffLine;
        }
        return 0;
    }

    public static percussionMidiToNoteHead(midiNumber: number, duration: Duration): MusicFontSymbol {
        if (PercussionMapper.instrumentArticulations.has(midiNumber)) {
            const articulation = PercussionMapper.instrumentArticulations.get(midiNumber)!;
            switch (duration) {
                case Duration.Whole:
                    return articulation.noteWhole;
                case Duration.Half:
                    return articulation.noteHalf;
                default:
                    return articulation.noteHeadQuarter;
            }
        }
        return MusicFontSymbol.None;
    }
}
