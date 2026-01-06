import { TechniqueSymbolPlacement } from '@coderline/alphatab/model/InstrumentArticulation';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { PercussionMapper } from '@coderline/alphatab/model/PercussionMapper';
import type { PlaybackInformation } from '@coderline/alphatab/model/PlaybackInformation';
import type { Track } from '@coderline/alphatab/model/Track';

/**
 * @internal
 */
class GpifMidiProgramInfo {
    public icon: GpifIconIds = GpifIconIds.Piano;
    public instrumentSetName: string;
    public instrumentSetType: string;

    public constructor(icon: GpifIconIds, instrumentSetName: string, instrumentSetType: string | null = null) {
        this.icon = icon;
        this.instrumentSetName = instrumentSetName;
        if (!instrumentSetType) {
            const parts = instrumentSetName.split(' ');
            parts[0] = parts[0].substr(0, 1).toLowerCase() + parts[0].substr(1);
            this.instrumentSetType = parts.join('');
        } else {
            this.instrumentSetType = instrumentSetType;
        }
    }
}

// Grabbed via Icon Picker beside track name in GP7
/**
 * @internal
 */
enum GpifIconIds {
    // Guitar & Basses
    SteelGuitar = 1,
    AcousticGuitar = 2,
    TwelveStringGuitar = 3,
    ElectricGuitar = 4,
    Bass = 5,
    ClassicalGuitar = 23,
    UprightBass = 6,
    Ukulele = 7,
    Banjo = 8,
    Mandolin = 9,
    // Orchestral
    Piano = 10,
    Synth = 12,
    Strings = 11,
    Brass = 13,
    Reed = 14,
    Woodwind = 15,
    Vocal = 16,
    PitchedIdiophone = 17,
    Fx = 21,
    // Percussions
    PercussionKit = 18,
    Idiophone = 19,
    Membraphone = 20
}

/**
 * @internal
 */
export class GpifInstrumentSet {
    public lineCount: number = 0;
    public name: string = '';
    public type: string = '';
    public elements: GpifInstrumentElement[] = [];

    public static create(name: string, type: string, lineCount: number, elements: GpifInstrumentElement[]) {
        const insturmentSet = new GpifInstrumentSet();
        insturmentSet.name = name;
        insturmentSet.type = type;
        insturmentSet.lineCount = lineCount;
        insturmentSet.elements = elements;
        return insturmentSet;
    }
}

/**
 * @internal
 */
export class GpifInstrumentElement {
    public name: string;
    public type: string;
    public soundbankName: string;
    public articulations: GpifInstrumentArticulation[];

    public constructor(name: string, type: string, soundbankName: string, articulations: GpifInstrumentArticulation[]) {
        this.name = name;
        this.type = type;
        this.soundbankName = soundbankName;
        this.articulations = articulations;
    }
}

/**
 * @internal
 */
export class GpifInstrumentArticulation {
    public name: string;
    public staffLine: number;
    public noteHeads: MusicFontSymbol[];
    public techniqueSymbol: MusicFontSymbol;
    public techniqueSymbolPlacement: TechniqueSymbolPlacement;
    public inputMidiNumbers: number[];
    public outputMidiNumber: number;
    public outputRSESound: string;

    public constructor(
        name: string,
        staffLine: number,
        noteHeads: MusicFontSymbol[],
        techniqueSymbol: MusicFontSymbol,
        techniqueSymbolPlacement: TechniqueSymbolPlacement,
        inputMidiNumbers: number[],
        outputMidiNumber: number,
        outputRSESound: string
    ) {
        this.name = name;
        this.staffLine = staffLine;
        this.noteHeads = noteHeads;
        this.techniqueSymbol = techniqueSymbol;
        this.techniqueSymbolPlacement = techniqueSymbolPlacement;
        this.inputMidiNumbers = inputMidiNumbers;
        this.outputMidiNumber = outputMidiNumber;
        this.outputRSESound = outputRSESound;
    }

    public static template(name: string, inputMidiNumbers: number[], outputRSESound: string) {
        return new GpifInstrumentArticulation(
            name,
            0,
            [],
            MusicFontSymbol.None,
            TechniqueSymbolPlacement.Outside,
            inputMidiNumbers,
            0,
            outputRSESound
        );
    }
}

/**
 * A helper which provides the RSE Soundbank and MIDI mapping
 * details for exporting Guitar Pro files from the alphaTab model.
 * @internal
 */
export class GpifSoundMapper {
    // NOTE: this code is not generated as the midi insturment list is anyhow fixed and should not never change.
    private static _midiProgramInfoLookup: Map<number, GpifMidiProgramInfo> = new Map([
        [0, new GpifMidiProgramInfo(GpifIconIds.Piano, 'Acoustic Piano')],
        [1, new GpifMidiProgramInfo(GpifIconIds.Piano, 'Acoustic Piano')],
        [2, new GpifMidiProgramInfo(GpifIconIds.Piano, 'Electric Piano')],
        [3, new GpifMidiProgramInfo(GpifIconIds.Piano, 'Acoustic Piano')],
        [4, new GpifMidiProgramInfo(GpifIconIds.Piano, 'Electric Piano')],
        [5, new GpifMidiProgramInfo(GpifIconIds.Piano, 'Electric Piano')],
        [6, new GpifMidiProgramInfo(GpifIconIds.Piano, 'Harpsichord')],
        [7, new GpifMidiProgramInfo(GpifIconIds.Piano, 'Harpsichord')],
        [8, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, 'Celesta')],
        [9, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, 'Vibraphone')],
        [10, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, 'Vibraphone')],
        [11, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, 'Vibraphone')],
        [12, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, 'Xylophone')],
        [13, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, 'Xylophone')],
        [14, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, 'Vibraphone')],
        [15, new GpifMidiProgramInfo(GpifIconIds.Banjo, 'Banjo')],
        [16, new GpifMidiProgramInfo(GpifIconIds.Piano, 'Electric Organ')],
        [17, new GpifMidiProgramInfo(GpifIconIds.Piano, 'Electric Organ')],
        [18, new GpifMidiProgramInfo(GpifIconIds.Piano, 'Electric Organ')],
        [19, new GpifMidiProgramInfo(GpifIconIds.Piano, 'Electric Organ')],
        [20, new GpifMidiProgramInfo(GpifIconIds.Piano, 'Electric Organ')],
        [21, new GpifMidiProgramInfo(GpifIconIds.Piano, 'Electric Organ')],
        [22, new GpifMidiProgramInfo(GpifIconIds.Woodwind, 'Recorder')],
        [23, new GpifMidiProgramInfo(GpifIconIds.Piano, 'Electric Organ')],
        [24, new GpifMidiProgramInfo(GpifIconIds.ClassicalGuitar, 'Nylon Guitar')],
        [25, new GpifMidiProgramInfo(GpifIconIds.SteelGuitar, 'Steel Guitar')],
        [26, new GpifMidiProgramInfo(GpifIconIds.SteelGuitar, 'Electric Guitar')],
        [27, new GpifMidiProgramInfo(GpifIconIds.ElectricGuitar, 'Electric Guitar')],
        [28, new GpifMidiProgramInfo(GpifIconIds.ElectricGuitar, 'Electric Guitar')],
        [29, new GpifMidiProgramInfo(GpifIconIds.ElectricGuitar, 'Electric Guitar')],
        [30, new GpifMidiProgramInfo(GpifIconIds.SteelGuitar, 'Electric Guitar')],
        [31, new GpifMidiProgramInfo(GpifIconIds.SteelGuitar, 'Electric Guitar')],
        [32, new GpifMidiProgramInfo(GpifIconIds.Bass, 'Acoustic Bass')],
        [33, new GpifMidiProgramInfo(GpifIconIds.Bass, 'Electric Bass')],
        [34, new GpifMidiProgramInfo(GpifIconIds.Bass, 'Electric Bass')],
        [35, new GpifMidiProgramInfo(GpifIconIds.Bass, 'Acoustic Bass')],
        [36, new GpifMidiProgramInfo(GpifIconIds.Bass, 'Electric Bass')],
        [37, new GpifMidiProgramInfo(GpifIconIds.Bass, 'Electric Bass')],
        [38, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Synth Bass')],
        [39, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Synth Bass')],
        [40, new GpifMidiProgramInfo(GpifIconIds.Strings, 'Violin')],
        [41, new GpifMidiProgramInfo(GpifIconIds.Strings, 'Viola')],
        [42, new GpifMidiProgramInfo(GpifIconIds.Strings, 'Cello')],
        [43, new GpifMidiProgramInfo(GpifIconIds.Strings, 'Contrabass')],
        [44, new GpifMidiProgramInfo(GpifIconIds.Strings, 'Violin')],
        [45, new GpifMidiProgramInfo(GpifIconIds.Strings, 'Violin')],
        [46, new GpifMidiProgramInfo(GpifIconIds.Piano, 'Harp')],
        [47, new GpifMidiProgramInfo(GpifIconIds.Membraphone, 'Timpani')],
        [48, new GpifMidiProgramInfo(GpifIconIds.Strings, 'Violin')],
        [49, new GpifMidiProgramInfo(GpifIconIds.Strings, 'Violin')],
        [50, new GpifMidiProgramInfo(GpifIconIds.Strings, 'Violin')],
        [51, new GpifMidiProgramInfo(GpifIconIds.Strings, 'Violin')],
        [52, new GpifMidiProgramInfo(GpifIconIds.Vocal, 'Voice')],
        [53, new GpifMidiProgramInfo(GpifIconIds.Vocal, 'Voice')],
        [54, new GpifMidiProgramInfo(GpifIconIds.Vocal, 'Voice')],
        [55, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Pad Synthesizer')],
        [56, new GpifMidiProgramInfo(GpifIconIds.Brass, 'Trumpet')],
        [57, new GpifMidiProgramInfo(GpifIconIds.Brass, 'Trombone')],
        [58, new GpifMidiProgramInfo(GpifIconIds.Brass, 'Tuba')],
        [59, new GpifMidiProgramInfo(GpifIconIds.Brass, 'Trumpet')],
        [60, new GpifMidiProgramInfo(GpifIconIds.Brass, 'French Horn')],
        [61, new GpifMidiProgramInfo(GpifIconIds.Brass, 'Trumpet')],
        [62, new GpifMidiProgramInfo(GpifIconIds.Brass, 'Trumpet')],
        [63, new GpifMidiProgramInfo(GpifIconIds.Brass, 'Trumpet')],
        [64, new GpifMidiProgramInfo(GpifIconIds.Reed, 'Saxophone')],
        [65, new GpifMidiProgramInfo(GpifIconIds.Reed, 'Saxophone')],
        [66, new GpifMidiProgramInfo(GpifIconIds.Reed, 'Saxophone')],
        [67, new GpifMidiProgramInfo(GpifIconIds.Reed, 'Saxophone')],
        [68, new GpifMidiProgramInfo(GpifIconIds.Reed, 'Oboe')],
        [69, new GpifMidiProgramInfo(GpifIconIds.Reed, 'English Horn')],
        [70, new GpifMidiProgramInfo(GpifIconIds.Reed, 'Bassoon')],
        [71, new GpifMidiProgramInfo(GpifIconIds.Reed, 'Clarinet')],
        [72, new GpifMidiProgramInfo(GpifIconIds.Reed, 'Piccolo')],
        [73, new GpifMidiProgramInfo(GpifIconIds.Woodwind, 'Flute')],
        [74, new GpifMidiProgramInfo(GpifIconIds.Woodwind, 'Recorder')],
        [75, new GpifMidiProgramInfo(GpifIconIds.Woodwind, 'Flute')],
        [76, new GpifMidiProgramInfo(GpifIconIds.Woodwind, 'Recorder')],
        [77, new GpifMidiProgramInfo(GpifIconIds.Woodwind, 'Flute')],
        [78, new GpifMidiProgramInfo(GpifIconIds.Woodwind, 'Recorder')],
        [79, new GpifMidiProgramInfo(GpifIconIds.Woodwind, 'Flute')],
        [80, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Lead Synthesizer')],
        [81, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Lead Synthesizer')],
        [82, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Lead Synthesizer')],
        [83, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Lead Synthesizer')],
        [84, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Lead Synthesizer')],
        [85, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Lead Synthesizer')],
        [86, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Lead Synthesizer')],
        [87, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Lead Synthesizer')],
        [88, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Pad Synthesizer')],
        [89, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Pad Synthesizer')],
        [90, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Pad Synthesizer')],
        [91, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Pad Synthesizer')],
        [92, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Pad Synthesizer')],
        [93, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Pad Synthesizer')],
        [94, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Pad Synthesizer')],
        [95, new GpifMidiProgramInfo(GpifIconIds.Synth, 'Pad Synthesizer')],
        [96, new GpifMidiProgramInfo(GpifIconIds.Fx, 'Pad Synthesizer')],
        [97, new GpifMidiProgramInfo(GpifIconIds.Fx, 'Pad Synthesizer')],
        [98, new GpifMidiProgramInfo(GpifIconIds.Fx, 'Pad Synthesizer')],
        [99, new GpifMidiProgramInfo(GpifIconIds.Fx, 'Pad Synthesizer')],
        [100, new GpifMidiProgramInfo(GpifIconIds.Fx, 'Lead Synthesizer')],
        [101, new GpifMidiProgramInfo(GpifIconIds.Fx, 'Lead Synthesizer')],
        [102, new GpifMidiProgramInfo(GpifIconIds.Fx, 'Lead Synthesizer')],
        [103, new GpifMidiProgramInfo(GpifIconIds.Fx, 'Trumpet')],
        [104, new GpifMidiProgramInfo(GpifIconIds.ElectricGuitar, 'Banjo')],
        [105, new GpifMidiProgramInfo(GpifIconIds.Banjo, 'Banjo')],
        [106, new GpifMidiProgramInfo(GpifIconIds.Ukulele, 'Ukulele')],
        [107, new GpifMidiProgramInfo(GpifIconIds.Banjo, 'Banjo')],
        [108, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, 'Xylophone')],
        [109, new GpifMidiProgramInfo(GpifIconIds.Reed, 'Bassoon')],
        [110, new GpifMidiProgramInfo(GpifIconIds.Strings, 'Violin')],
        [111, new GpifMidiProgramInfo(GpifIconIds.Woodwind, 'Flute')],
        [112, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, 'Xylophone')],
        [113, new GpifMidiProgramInfo(GpifIconIds.Idiophone, 'Celesta')],
        [114, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, 'Vibraphone')],
        [115, new GpifMidiProgramInfo(GpifIconIds.Idiophone, 'Xylophone')],
        [116, new GpifMidiProgramInfo(GpifIconIds.Membraphone, 'Xylophone')],
        [117, new GpifMidiProgramInfo(GpifIconIds.Membraphone, 'Xylophone')],
        [118, new GpifMidiProgramInfo(GpifIconIds.Membraphone, 'Xylophone')],
        [119, new GpifMidiProgramInfo(GpifIconIds.Idiophone, 'Celesta')],
        [120, new GpifMidiProgramInfo(GpifIconIds.Fx, 'Steel Guitar')],
        [121, new GpifMidiProgramInfo(GpifIconIds.Fx, 'Recorder')],
        [122, new GpifMidiProgramInfo(GpifIconIds.Fx, 'Recorder')],
        [123, new GpifMidiProgramInfo(GpifIconIds.Fx, 'Recorder')],
        [124, new GpifMidiProgramInfo(GpifIconIds.Fx, 'Recorder')],
        [125, new GpifMidiProgramInfo(GpifIconIds.Fx, 'Recorder')],
        [126, new GpifMidiProgramInfo(GpifIconIds.Fx, 'Recorder')],
        [127, new GpifMidiProgramInfo(GpifIconIds.Fx, 'Timpani')]
    ]);

    // To update the following generated code, use the GpExporterTest.sound-mapper unit test
    // which will generate the new code to copy for here.
    // We could also use an NPM script for that but for now this is enough.

    // BEGIN generated
    private static _drumInstrumentSet = GpifInstrumentSet.create('Drums', 'drumKit', 5, [
        new GpifInstrumentElement('Snare', 'snare', 'Master-Snare', [
            GpifInstrumentArticulation.template('Snare (hit)', [38], 'stick.hit.hit'),
            GpifInstrumentArticulation.template('Snare (side stick)', [37], 'stick.hit.sidestick'),
            GpifInstrumentArticulation.template('Snare (rim shot)', [91], 'stick.hit.rimshot')
        ]),
        new GpifInstrumentElement('Charley', 'hiHat', 'Master-Hihat', [
            GpifInstrumentArticulation.template('Hi-Hat (closed)', [42], 'stick.hit.closed'),
            GpifInstrumentArticulation.template('Hi-Hat (half)', [92], 'stick.hit.half'),
            GpifInstrumentArticulation.template('Hi-Hat (open)', [46], 'stick.hit.open'),
            GpifInstrumentArticulation.template('Pedal Hi-Hat (hit)', [44], 'pedal.hit.pedal')
        ]),
        new GpifInstrumentElement('Acoustic Kick Drum', 'kickDrum', 'AcousticKick-Percu', [
            GpifInstrumentArticulation.template('Kick (hit)', [35], 'pedal.hit.hit')
        ]),
        new GpifInstrumentElement('Kick Drum', 'kickDrum', 'Master-Kick', [
            GpifInstrumentArticulation.template('Kick (hit)', [36], 'pedal.hit.hit')
        ]),
        new GpifInstrumentElement('Tom Very High', 'tom', 'Master-Tom05', [
            GpifInstrumentArticulation.template('High Floor Tom (hit)', [50], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Tom High', 'tom', 'Master-Tom04', [
            GpifInstrumentArticulation.template('High Tom (hit)', [48], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Tom Medium', 'tom', 'Master-Tom03', [
            GpifInstrumentArticulation.template('Mid Tom (hit)', [47], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Tom Low', 'tom', 'Master-Tom02', [
            GpifInstrumentArticulation.template('Low Tom (hit)', [45], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Tom Very Low', 'tom', 'Master-Tom01', [
            GpifInstrumentArticulation.template('Very Low Tom (hit)', [43], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Ride', 'ride', 'Master-Ride', [
            GpifInstrumentArticulation.template('Ride (edge)', [93], 'stick.hit.edge'),
            GpifInstrumentArticulation.template('Ride (middle)', [51], 'stick.hit.mid'),
            GpifInstrumentArticulation.template('Ride (bell)', [53], 'stick.hit.bell'),
            GpifInstrumentArticulation.template('Ride (choke)', [94], 'stick.hit.choke')
        ]),
        new GpifInstrumentElement('Splash', 'splash', 'Master-Splash', [
            GpifInstrumentArticulation.template('Splash (hit)', [55], 'stick.hit.hit'),
            GpifInstrumentArticulation.template('Splash (choke)', [95], 'stick.hit.choke')
        ]),
        new GpifInstrumentElement('China', 'china', 'Master-China', [
            GpifInstrumentArticulation.template('China (hit)', [52], 'stick.hit.hit'),
            GpifInstrumentArticulation.template('China (choke)', [96], 'stick.hit.choke')
        ]),
        new GpifInstrumentElement('Crash High', 'crash', 'Master-Crash02', [
            GpifInstrumentArticulation.template('Crash high (hit)', [49], 'stick.hit.hit'),
            GpifInstrumentArticulation.template('Crash high (choke)', [97], 'stick.hit.choke')
        ]),
        new GpifInstrumentElement('Crash Medium', 'crash', 'Master-Crash01', [
            GpifInstrumentArticulation.template('Crash medium (hit)', [57], 'stick.hit.hit'),
            GpifInstrumentArticulation.template('Crash medium (choke)', [98], 'stick.hit.choke')
        ]),
        new GpifInstrumentElement('Cowbell Low', 'cowbell', 'CowbellBig-Percu', [
            GpifInstrumentArticulation.template('Cowbell low (hit)', [99], 'stick.hit.hit'),
            GpifInstrumentArticulation.template('Cowbell low (tip)', [100], 'stick.hit.tip')
        ]),
        new GpifInstrumentElement('Cowbell Medium', 'cowbell', 'CowbellMid-Percu', [
            GpifInstrumentArticulation.template('Cowbell medium (hit)', [56], 'stick.hit.hit'),
            GpifInstrumentArticulation.template('Cowbell medium (tip)', [101], 'stick.hit.tip')
        ]),
        new GpifInstrumentElement('Cowbell High', 'cowbell', 'CowbellSmall-Percu', [
            GpifInstrumentArticulation.template('Cowbell high (hit)', [102], 'stick.hit.hit'),
            GpifInstrumentArticulation.template('Cowbell high (tip)', [103], 'stick.hit.tip')
        ]),
        new GpifInstrumentElement('Woodblock Low', 'woodblock', 'WoodblockLow-Percu', [
            GpifInstrumentArticulation.template('Woodblock low (hit)', [77], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Woodblock High', 'woodblock', 'WoodblockHigh-Percu', [
            GpifInstrumentArticulation.template('Woodblock high (hit)', [76], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Bongo High', 'bongo', 'BongoHigh-Percu', [
            GpifInstrumentArticulation.template('Bongo High (hit)', [60], 'hand.hit.hit'),
            GpifInstrumentArticulation.template('Bongo High (mute)', [104], 'hand.hit.mute'),
            GpifInstrumentArticulation.template('Bongo High (slap)', [105], 'hand.hit.slap')
        ]),
        new GpifInstrumentElement('Bongo Low', 'bongo', 'BongoLow-Percu', [
            GpifInstrumentArticulation.template('Bongo Low (hit)', [61], 'hand.hit.hit'),
            GpifInstrumentArticulation.template('Bongo Low (mute)', [106], 'hand.hit.mute'),
            GpifInstrumentArticulation.template('Bongo Low (slap)', [107], 'hand.hit.slap')
        ]),
        new GpifInstrumentElement('Timbale Low', 'timbale', 'TimbaleLow-Percu', [
            GpifInstrumentArticulation.template('Timbale low (hit)', [66], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Timbale High', 'timbale', 'TimbaleHigh-Percu', [
            GpifInstrumentArticulation.template('Timbale high (hit)', [65], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Agogo Low', 'agogo', 'AgogoLow-Percu', [
            GpifInstrumentArticulation.template('Agogo low (hit)', [68], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Agogo High', 'agogo', 'AgogoHigh-Percu', [
            GpifInstrumentArticulation.template('Agogo high (hit)', [67], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Conga Low', 'conga', 'CongaLow-Percu', [
            GpifInstrumentArticulation.template('Conga low (hit)', [64], 'hand.hit.hit'),
            GpifInstrumentArticulation.template('Conga low (slap)', [108], 'hand.hit.slap'),
            GpifInstrumentArticulation.template('Conga low (mute)', [109], 'hand.hit.mute')
        ]),
        new GpifInstrumentElement('Conga High', 'conga', 'CongaHigh-Percu', [
            GpifInstrumentArticulation.template('Conga high (hit)', [63], 'hand.hit.hit'),
            GpifInstrumentArticulation.template('Conga high (slap)', [110], 'hand.hit.slap'),
            GpifInstrumentArticulation.template('Conga high (mute)', [62], 'hand.hit.mute')
        ]),
        new GpifInstrumentElement('Whistle Low', 'whistle', 'WhistleLow-Percu', [
            GpifInstrumentArticulation.template('Whistle low (hit)', [72], 'blow.hit.hit')
        ]),
        new GpifInstrumentElement('Whistle High', 'whistle', 'WhistleHigh-Percu', [
            GpifInstrumentArticulation.template('Whistle high (hit)', [71], 'blow.hit.hit')
        ]),
        new GpifInstrumentElement('Guiro', 'guiro', 'Guiro-Percu', [
            GpifInstrumentArticulation.template('Guiro (hit)', [73], 'stick.hit.hit'),
            GpifInstrumentArticulation.template('Guiro (scrap-return)', [74], 'stick.scrape.return')
        ]),
        new GpifInstrumentElement('Surdo', 'surdo', 'Surdo-Percu', [
            GpifInstrumentArticulation.template('Surdo (hit)', [86], 'brush.hit.hit'),
            GpifInstrumentArticulation.template('Surdo (mute)', [87], 'brush.hit.mute')
        ]),
        new GpifInstrumentElement('Tambourine', 'tambourine', 'Tambourine-Percu', [
            GpifInstrumentArticulation.template('Tambourine (hit)', [54], 'hand.hit.hit'),
            GpifInstrumentArticulation.template('Tambourine (return)', [111], 'hand.hit.return'),
            GpifInstrumentArticulation.template('Tambourine (roll)', [112], 'hand.hit.roll'),
            GpifInstrumentArticulation.template('Tambourine (hand)', [113], 'hand.hit.handhit')
        ]),
        new GpifInstrumentElement('Cuica', 'cuica', 'Cuica-Percu', [
            GpifInstrumentArticulation.template('Cuica (open)', [79], 'hand.hit.hit'),
            GpifInstrumentArticulation.template('Cuica (mute)', [78], 'hand.hit.mute')
        ]),
        new GpifInstrumentElement('Vibraslap', 'vibraslap', 'Vibraslap-Percu', [
            GpifInstrumentArticulation.template('Vibraslap (hit)', [58], 'hand.hit.hit')
        ]),
        new GpifInstrumentElement('Triangle', 'triangle', 'Triangle-Percu', [
            GpifInstrumentArticulation.template('Triangle (hit)', [81], 'stick.hit.hit'),
            GpifInstrumentArticulation.template('Triangle (mute)', [80], 'stick.hit.mute')
        ]),
        new GpifInstrumentElement('Grancassa', 'grancassa', 'Grancassa-Percu', [
            GpifInstrumentArticulation.template('Grancassa (hit)', [114], 'mallet.hit.hit')
        ]),
        new GpifInstrumentElement('Piatti', 'piatti', 'Piatti-Percu', [
            GpifInstrumentArticulation.template('Piatti (hit)', [115], 'hand.hit.hit'),
            GpifInstrumentArticulation.template('Piatti (hand)', [116], 'hand.hit.hit')
        ]),
        new GpifInstrumentElement('Cabasa', 'cabasa', 'Cabasa-Percu', [
            GpifInstrumentArticulation.template('Cabasa (hit)', [69], 'hand.hit.hit'),
            GpifInstrumentArticulation.template('Cabasa (return)', [117], 'hand.hit.return')
        ]),
        new GpifInstrumentElement('Castanets', 'castanets', 'Castanets-Percu', [
            GpifInstrumentArticulation.template('Castanets (hit)', [85], 'hand.hit.hit')
        ]),
        new GpifInstrumentElement('Claves', 'claves', 'Claves-Percu', [
            GpifInstrumentArticulation.template('Claves (hit)', [75], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Left Maraca', 'maraca', 'Maracas-Percu', [
            GpifInstrumentArticulation.template('Left Maraca (hit)', [70], 'hand.hit.hit'),
            GpifInstrumentArticulation.template('Left Maraca (return)', [118], 'hand.hit.return')
        ]),
        new GpifInstrumentElement('Right Maraca', 'maraca', 'Maracas-Percu', [
            GpifInstrumentArticulation.template('Right Maraca (hit)', [119], 'hand.hit.hit'),
            GpifInstrumentArticulation.template('Right Maraca (return)', [120], 'hand.hit.return')
        ]),
        new GpifInstrumentElement('Shaker', 'shaker', 'ShakerStudio-Percu', [
            GpifInstrumentArticulation.template('Shaker (hit)', [82], 'hand.hit.hit'),
            GpifInstrumentArticulation.template('Shaker (return)', [122], 'hand.hit.return')
        ]),
        new GpifInstrumentElement('Bell Tree', 'bellTree', 'BellTree-Percu', [
            GpifInstrumentArticulation.template('Bell Tree (hit)', [84], 'stick.hit.hit'),
            GpifInstrumentArticulation.template('Bell Tree (return)', [123], 'stick.hit.return')
        ]),
        new GpifInstrumentElement('Jingle Bell', 'jingleBell', 'JingleBell-Percu', [
            GpifInstrumentArticulation.template('Jingle Bell (hit)', [83], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Tinkle Bell', 'jingleBell', 'JingleBell-Percu', [
            GpifInstrumentArticulation.template('Tinkle Bell (hit)', [83], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Golpe', 'unpitched', 'Golpe-Percu', [
            GpifInstrumentArticulation.template('Golpe (thumb)', [124], 'thumb.hit.body'),
            GpifInstrumentArticulation.template('Golpe (finger)', [125], 'finger4.hit.body')
        ]),
        new GpifInstrumentElement('Hand Clap', 'handClap', 'GroupHandClap-Percu', [
            GpifInstrumentArticulation.template('Hand Clap (hit)', [39], 'hand.hit.hit')
        ]),
        new GpifInstrumentElement('Electric Snare', 'snare', 'ElectricSnare-Percu', [
            GpifInstrumentArticulation.template('Electric Snare (hit)', [40], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Sticks', 'snare', 'Stick-Percu', [
            GpifInstrumentArticulation.template('Snare (side stick)', [31], 'stick.hit.sidestick')
        ]),
        new GpifInstrumentElement('Very Low Floor Tom', 'tom', 'LowFloorTom-Percu', [
            GpifInstrumentArticulation.template('Low Floor Tom (hit)', [41], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Ride Cymbal 2', 'ride', 'Ride-Percu', [
            GpifInstrumentArticulation.template('Ride (edge)', [59], 'stick.hit.edge'),
            GpifInstrumentArticulation.template('Ride (middle)', [126], 'stick.hit.mid'),
            GpifInstrumentArticulation.template('Ride (bell)', [127], 'stick.hit.bell'),
            GpifInstrumentArticulation.template('Ride (choke)', [29], 'stick.hit.choke')
        ]),
        new GpifInstrumentElement('Reverse Cymbal', 'crash', 'Reverse-Cymbal', [
            GpifInstrumentArticulation.template('Reverse Cymbal (hit)', [30], 'stick.hit.hit')
        ]),
        new GpifInstrumentElement('Metronome', 'snare', 'Metronome-Percu', [
            GpifInstrumentArticulation.template('Metronome (hit)', [33], 'stick.hit.sidestick'),
            GpifInstrumentArticulation.template('Metronome (bell)', [34], 'stick.hit.hit')
        ])
    ]);
    // END generated

    private static _elementByArticulation: Map<string, GpifInstrumentElement> | undefined = undefined;
    private static _articulationsById: Map<string, GpifInstrumentArticulation> | undefined = undefined;

    private static _initLookups() {
        const set = GpifSoundMapper._drumInstrumentSet;
        const elementByArticulation = new Map<string, GpifInstrumentElement>();
        const articulationsById = new Map<string, GpifInstrumentArticulation>();
        for (const element of set.elements.values()) {
            for (const articulation of element.articulations) {
                for (const midi of articulation.inputMidiNumbers) {
                    const gpId = `${element.name}.${midi}`;
                    elementByArticulation.set(gpId, element);
                    articulationsById.set(gpId, articulation);
                }
            }
        }

        GpifSoundMapper._elementByArticulation = elementByArticulation;
        GpifSoundMapper._articulationsById = articulationsById;
        return elementByArticulation;
    }

    public static getIconId(playbackInfo: PlaybackInformation): number {
        if (playbackInfo.primaryChannel === 9) {
            return GpifIconIds.PercussionKit;
        }
        if (GpifSoundMapper._midiProgramInfoLookup.has(playbackInfo.program)) {
            return GpifSoundMapper._midiProgramInfoLookup.get(playbackInfo.program)!.icon;
        }
        return GpifIconIds.SteelGuitar;
    }

    public static buildInstrumentSet(track: Track): GpifInstrumentSet {
        if (track.percussionArticulations.length > 0 || track.isPercussion) {
            return GpifSoundMapper._buildPercussionInstrumentSet(track);
        } else {
            return GpifSoundMapper._buildPitchedInstrumentSet(track);
        }
    }

    private static readonly _pitchedElement = new GpifInstrumentElement('Pitched', 'pitched', '', [
        new GpifInstrumentArticulation(
            '',
            0,
            [MusicFontSymbol.NoteheadBlack, MusicFontSymbol.NoteheadHalf, MusicFontSymbol.NoteheadWhole],
            MusicFontSymbol.None,
            TechniqueSymbolPlacement.Outside,
            [],
            0,
            ''
        )
    ]);

    private static _buildPitchedInstrumentSet(track: Track): GpifInstrumentSet {
        const instrumentSet = new GpifInstrumentSet();
        instrumentSet.lineCount = track.staves[0].standardNotationLineCount;

        const programInfo = GpifSoundMapper._midiProgramInfoLookup.has(track.playbackInfo.program)
            ? GpifSoundMapper._midiProgramInfoLookup.get(track.playbackInfo.program)!
            : GpifSoundMapper._midiProgramInfoLookup.get(0)!;

        instrumentSet.name = programInfo.instrumentSetName;
        instrumentSet.type = programInfo.instrumentSetType;
        const element = new GpifInstrumentElement(
            GpifSoundMapper._pitchedElement.name,
            GpifSoundMapper._pitchedElement.type,
            GpifSoundMapper._pitchedElement.soundbankName,
            [GpifSoundMapper._pitchedElement.articulations[0]]
        );
        instrumentSet.elements.push(element);
        return instrumentSet;
    }

    private static _buildPercussionInstrumentSet(track: Track): GpifInstrumentSet {
        if (!GpifSoundMapper._elementByArticulation) {
            GpifSoundMapper._initLookups();
        }

        const instrumentSet = new GpifInstrumentSet();
        instrumentSet.lineCount = track.staves[0].standardNotationLineCount;
        instrumentSet.name = 'Drums';
        instrumentSet.type = 'drumKit';

        const articulations =
            track.percussionArticulations.length > 0
                ? track.percussionArticulations
                : Array.from(PercussionMapper.instrumentArticulations.values());

        // NOTE: GP files are very sensitive in terms of articulation and element order.
        // notes reference articulations index based within the overall file.
        let element: GpifInstrumentElement | undefined = undefined;
        for (const articulation of articulations) {
            // main info from own articulation
            const gpifArticulation = new GpifInstrumentArticulation(
                articulation.elementType,
                articulation.staffLine,
                [articulation.noteHeadDefault, articulation.noteHeadHalf, articulation.noteHeadWhole],
                articulation.techniqueSymbol,
                articulation.techniqueSymbolPlacement,
                [articulation.id],
                articulation.outputMidiNumber,
                ''
            );

            // additional details we try to lookup from the known templates
            const gpId = articulation.uniqueId;
            if (GpifSoundMapper._articulationsById!.has(gpId)) {
                const knownArticulation = GpifSoundMapper._articulationsById!.get(gpId)!;
                gpifArticulation.inputMidiNumbers = knownArticulation.inputMidiNumbers;
                gpifArticulation.name = knownArticulation.name;
                gpifArticulation.outputRSESound = knownArticulation.outputRSESound;
            }

            // check for element change
            if (GpifSoundMapper._elementByArticulation!.has(gpId)) {
                const knownElement = GpifSoundMapper._elementByArticulation!.get(gpId)!;
                if (!element || element.name !== articulation.elementType) {
                    element = new GpifInstrumentElement(
                        knownElement.name,
                        knownElement.type,
                        knownElement.soundbankName,
                        []
                    );
                    instrumentSet.elements.push(element);
                }
            } else {
                if (!element || element.name !== articulation.elementType) {
                    element = new GpifInstrumentElement(articulation.elementType, articulation.elementType, '', []);
                    instrumentSet.elements.push(element);
                }
            }

            element.articulations.push(gpifArticulation);
        }

        return instrumentSet;
    }
}
