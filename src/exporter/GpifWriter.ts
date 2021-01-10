import { GeneralMidi } from '@src/midi/GeneralMidi';
import { MidiUtils } from '@src/midi/MidiUtils';
import { AccentuationType } from '@src/model/AccentuationType';
import { AutomationType } from '@src/model/Automation';
import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { BrushType } from '@src/model/BrushType';
import { Clef } from '@src/model/Clef';
import { CrescendoType } from '@src/model/CrescendoType';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { Fermata, FermataType } from '@src/model/Fermata';
import { Fingers } from '@src/model/Fingers';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { Lyrics } from '@src/model/Lyrics';
import { MasterBar } from '@src/model/MasterBar';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { Note } from '@src/model/Note';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { Ottavia } from '@src/model/Ottavia';
import { PercussionMapper } from '@src/model/PercussionMapper';
import { PickStroke } from '@src/model/PickStroke';
import { PlaybackInformation } from '@src/model/PlaybackInformation';
import { Score } from '@src/model/Score';
import { SimileMark } from '@src/model/SimileMark';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
import { Tuning } from '@src/model/Tuning';
import { VibratoType } from '@src/model/VibratoType';
import { Voice } from '@src/model/Voice';
import { TextBaseline } from '@src/platform/ICanvas';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { XmlDocument } from '@src/xml/XmlDocument';
import { XmlNode } from '@src/xml/XmlNode';

// Grabbed via Icon Picker beside track name in GP7
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

/**
 * This class can write a score.gpif XML from a given score model.
 */
export class GpifWriter {
    private _rhythmIdLookup: Map<string, string> = new Map<string, string>();
    private static MidiProgramInfoLookup: Map<number, GpifMidiProgramInfo> = new Map([
        [0, new GpifMidiProgramInfo(GpifIconIds.Piano, "Acoustic Piano")],
        [1, new GpifMidiProgramInfo(GpifIconIds.Piano, "Acoustic Piano")],
        [2, new GpifMidiProgramInfo(GpifIconIds.Piano, "Electric Piano")],
        [3, new GpifMidiProgramInfo(GpifIconIds.Piano, "Acoustic Piano")],
        [4, new GpifMidiProgramInfo(GpifIconIds.Piano, "Electric Piano")],
        [5, new GpifMidiProgramInfo(GpifIconIds.Piano, "Electric Piano")],
        [6, new GpifMidiProgramInfo(GpifIconIds.Piano, "Harpsichord")],
        [7, new GpifMidiProgramInfo(GpifIconIds.Piano, "Harpsichord")],
        [8, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, "Celesta")],
        [9, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, "Vibraphone")],
        [10, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, "Vibraphone")],
        [11, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, "Vibraphone")],
        [12, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, "Xylophone")],
        [13, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, "Xylophone")],
        [14, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, "Vibraphone")],
        [15, new GpifMidiProgramInfo(GpifIconIds.Banjo, "Banjo")],
        [16, new GpifMidiProgramInfo(GpifIconIds.Piano, "Electric Organ")],
        [17, new GpifMidiProgramInfo(GpifIconIds.Piano, "Electric Organ")],
        [18, new GpifMidiProgramInfo(GpifIconIds.Piano, "Electric Organ")],
        [19, new GpifMidiProgramInfo(GpifIconIds.Piano, "Electric Organ")],
        [20, new GpifMidiProgramInfo(GpifIconIds.Piano, "Electric Organ")],
        [21, new GpifMidiProgramInfo(GpifIconIds.Piano, "Electric Organ")],
        [22, new GpifMidiProgramInfo(GpifIconIds.Woodwind, "Recorder")],
        [23, new GpifMidiProgramInfo(GpifIconIds.Piano, "Electric Organ")],
        [24, new GpifMidiProgramInfo(GpifIconIds.ClassicalGuitar, "Nylon Guitar")],
        [25, new GpifMidiProgramInfo(GpifIconIds.SteelGuitar, "Steel Guitar")],
        [26, new GpifMidiProgramInfo(GpifIconIds.SteelGuitar, "Electric Guitar")],
        [27, new GpifMidiProgramInfo(GpifIconIds.ElectricGuitar, "Electric Guitar")],
        [28, new GpifMidiProgramInfo(GpifIconIds.ElectricGuitar, "Electric Guitar")],
        [29, new GpifMidiProgramInfo(GpifIconIds.ElectricGuitar, "Electric Guitar")],
        [30, new GpifMidiProgramInfo(GpifIconIds.SteelGuitar, "Electric Guitar")],
        [31, new GpifMidiProgramInfo(GpifIconIds.SteelGuitar, "Electric Guitar")],
        [32, new GpifMidiProgramInfo(GpifIconIds.Bass, "Acoustic Bass")],
        [33, new GpifMidiProgramInfo(GpifIconIds.Bass, "Electric Bass")],
        [34, new GpifMidiProgramInfo(GpifIconIds.Bass, "Electric Bass")],
        [35, new GpifMidiProgramInfo(GpifIconIds.Bass, "Acoustic Bass")],
        [36, new GpifMidiProgramInfo(GpifIconIds.Bass, "Electric Bass")],
        [37, new GpifMidiProgramInfo(GpifIconIds.Bass, "Electric Bass")],
        [38, new GpifMidiProgramInfo(GpifIconIds.Synth, "Synth Bass")],
        [39, new GpifMidiProgramInfo(GpifIconIds.Synth, "Synth Bass")],
        [40, new GpifMidiProgramInfo(GpifIconIds.Strings, "Violin")],
        [41, new GpifMidiProgramInfo(GpifIconIds.Strings, "Viola")],
        [42, new GpifMidiProgramInfo(GpifIconIds.Strings, "Cello")],
        [43, new GpifMidiProgramInfo(GpifIconIds.Strings, "Contrabass")],
        [44, new GpifMidiProgramInfo(GpifIconIds.Strings, "Violin")],
        [45, new GpifMidiProgramInfo(GpifIconIds.Strings, "Violin")],
        [46, new GpifMidiProgramInfo(GpifIconIds.Piano, "Harp")],
        [47, new GpifMidiProgramInfo(GpifIconIds.Membraphone, "Timpani")],
        [48, new GpifMidiProgramInfo(GpifIconIds.Strings, "Violin")],
        [49, new GpifMidiProgramInfo(GpifIconIds.Strings, "Violin")],
        [50, new GpifMidiProgramInfo(GpifIconIds.Strings, "Violin")],
        [51, new GpifMidiProgramInfo(GpifIconIds.Strings, "Violin")],
        [52, new GpifMidiProgramInfo(GpifIconIds.Vocal, "Voice")],
        [53, new GpifMidiProgramInfo(GpifIconIds.Vocal, "Voice")],
        [54, new GpifMidiProgramInfo(GpifIconIds.Vocal, "Voice")],
        [55, new GpifMidiProgramInfo(GpifIconIds.Synth, "Pad Synthesizer")],
        [56, new GpifMidiProgramInfo(GpifIconIds.Brass, "Trumpet")],
        [57, new GpifMidiProgramInfo(GpifIconIds.Brass, "Trombone")],
        [58, new GpifMidiProgramInfo(GpifIconIds.Brass, "Tuba")],
        [59, new GpifMidiProgramInfo(GpifIconIds.Brass, "Trumpet")],
        [60, new GpifMidiProgramInfo(GpifIconIds.Brass, "French Horn")],
        [61, new GpifMidiProgramInfo(GpifIconIds.Brass, "Trumpet")],
        [62, new GpifMidiProgramInfo(GpifIconIds.Brass, "Trumpet")],
        [63, new GpifMidiProgramInfo(GpifIconIds.Brass, "Trumpet")],
        [64, new GpifMidiProgramInfo(GpifIconIds.Reed, "Saxophone")],
        [65, new GpifMidiProgramInfo(GpifIconIds.Reed, "Saxophone")],
        [66, new GpifMidiProgramInfo(GpifIconIds.Reed, "Saxophone")],
        [67, new GpifMidiProgramInfo(GpifIconIds.Reed, "Saxophone")],
        [68, new GpifMidiProgramInfo(GpifIconIds.Reed, "Oboe")],
        [69, new GpifMidiProgramInfo(GpifIconIds.Reed, "English Horn")],
        [70, new GpifMidiProgramInfo(GpifIconIds.Reed, "Bassoon")],
        [71, new GpifMidiProgramInfo(GpifIconIds.Reed, "Clarinet")],
        [72, new GpifMidiProgramInfo(GpifIconIds.Reed, "Piccolo")],
        [73, new GpifMidiProgramInfo(GpifIconIds.Woodwind, "Flute")],
        [74, new GpifMidiProgramInfo(GpifIconIds.Woodwind, "Recorder")],
        [75, new GpifMidiProgramInfo(GpifIconIds.Woodwind, "Flute")],
        [76, new GpifMidiProgramInfo(GpifIconIds.Woodwind, "Recorder")],
        [77, new GpifMidiProgramInfo(GpifIconIds.Woodwind, "Flute")],
        [78, new GpifMidiProgramInfo(GpifIconIds.Woodwind, "Recorder")],
        [79, new GpifMidiProgramInfo(GpifIconIds.Woodwind, "Flute")],
        [80, new GpifMidiProgramInfo(GpifIconIds.Synth, "Lead Synthesizer")],
        [81, new GpifMidiProgramInfo(GpifIconIds.Synth, "Lead Synthesizer")],
        [82, new GpifMidiProgramInfo(GpifIconIds.Synth, "Lead Synthesizer")],
        [83, new GpifMidiProgramInfo(GpifIconIds.Synth, "Lead Synthesizer")],
        [84, new GpifMidiProgramInfo(GpifIconIds.Synth, "Lead Synthesizer")],
        [85, new GpifMidiProgramInfo(GpifIconIds.Synth, "Lead Synthesizer")],
        [86, new GpifMidiProgramInfo(GpifIconIds.Synth, "Lead Synthesizer")],
        [87, new GpifMidiProgramInfo(GpifIconIds.Synth, "Lead Synthesizer")],
        [88, new GpifMidiProgramInfo(GpifIconIds.Synth, "Pad Synthesizer")],
        [89, new GpifMidiProgramInfo(GpifIconIds.Synth, "Pad Synthesizer")],
        [90, new GpifMidiProgramInfo(GpifIconIds.Synth, "Pad Synthesizer")],
        [91, new GpifMidiProgramInfo(GpifIconIds.Synth, "Pad Synthesizer")],
        [92, new GpifMidiProgramInfo(GpifIconIds.Synth, "Pad Synthesizer")],
        [93, new GpifMidiProgramInfo(GpifIconIds.Synth, "Pad Synthesizer")],
        [94, new GpifMidiProgramInfo(GpifIconIds.Synth, "Pad Synthesizer")],
        [95, new GpifMidiProgramInfo(GpifIconIds.Synth, "Pad Synthesizer")],
        [96, new GpifMidiProgramInfo(GpifIconIds.Fx, "Pad Synthesizer")],
        [97, new GpifMidiProgramInfo(GpifIconIds.Fx, "Pad Synthesizer")],
        [98, new GpifMidiProgramInfo(GpifIconIds.Fx, "Pad Synthesizer")],
        [99, new GpifMidiProgramInfo(GpifIconIds.Fx, "Pad Synthesizer")],
        [100, new GpifMidiProgramInfo(GpifIconIds.Fx, "Lead Synthesizer")],
        [101, new GpifMidiProgramInfo(GpifIconIds.Fx, "Lead Synthesizer")],
        [102, new GpifMidiProgramInfo(GpifIconIds.Fx, "Lead Synthesizer")],
        [103, new GpifMidiProgramInfo(GpifIconIds.Fx, "Trumpet")],
        [104, new GpifMidiProgramInfo(GpifIconIds.ElectricGuitar, "Banjo")],
        [105, new GpifMidiProgramInfo(GpifIconIds.Banjo, "Banjo")],
        [106, new GpifMidiProgramInfo(GpifIconIds.Ukulele, "Ukulele")],
        [107, new GpifMidiProgramInfo(GpifIconIds.Banjo, "Banjo")],
        [108, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, "Xylophone")],
        [109, new GpifMidiProgramInfo(GpifIconIds.Reed, "Bassoon")],
        [110, new GpifMidiProgramInfo(GpifIconIds.Strings, "Violin")],
        [111, new GpifMidiProgramInfo(GpifIconIds.Woodwind, "Flute")],
        [112, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, "Xylophone")],
        [113, new GpifMidiProgramInfo(GpifIconIds.Idiophone, "Celesta")],
        [114, new GpifMidiProgramInfo(GpifIconIds.PitchedIdiophone, "Vibraphone")],
        [115, new GpifMidiProgramInfo(GpifIconIds.Idiophone, "Xylophone")],
        [116, new GpifMidiProgramInfo(GpifIconIds.Membraphone, "Xylophone")],
        [117, new GpifMidiProgramInfo(GpifIconIds.Membraphone, "Xylophone")],
        [118, new GpifMidiProgramInfo(GpifIconIds.Membraphone, "Xylophone")],
        [119, new GpifMidiProgramInfo(GpifIconIds.Idiophone, "Celesta")],
        [120, new GpifMidiProgramInfo(GpifIconIds.Fx, "Steel Guitar")],
        [121, new GpifMidiProgramInfo(GpifIconIds.Fx, "Recorder")],
        [122, new GpifMidiProgramInfo(GpifIconIds.Fx, "Recorder")],
        [123, new GpifMidiProgramInfo(GpifIconIds.Fx, "Recorder")],
        [124, new GpifMidiProgramInfo(GpifIconIds.Fx, "Recorder")],
        [125, new GpifMidiProgramInfo(GpifIconIds.Fx, "Recorder")],
        [126, new GpifMidiProgramInfo(GpifIconIds.Fx, "Recorder")],
        [127, new GpifMidiProgramInfo(GpifIconIds.Fx, "Timpani")]
    ])

    private static DrumKitProgramInfo: GpifMidiProgramInfo = new GpifMidiProgramInfo(GpifIconIds.PercussionKit, "Drums", "drumKit");

    public writeXml(score: Score): string {
        const xmlDocument = new XmlDocument();

        this._rhythmIdLookup = new Map<string, string>()

        this.writeDom(xmlDocument, score);

        return xmlDocument.toString('', true);
    }

    private writeDom(parent: XmlNode, score: Score) {
        const gpif = parent.addElement('GPIF');

        // just some values at the time this was implemented, 
        gpif.addElement('GPVersion').innerText = '7';
        const gpRevision = gpif.addElement('GPRevision');
        gpRevision.innerText = '7';
        gpRevision.attributes.set('required', '12021');
        gpRevision.attributes.set('recommended', '12023');
        gpRevision.innerText = '12025';
        gpif.addElement('Encoding').addElement('EncodingDescription').innerText = 'GP7';

        this.writeScoreNode(gpif, score);
        this.writeMasterTrackNode(gpif, score);
        this.writeAudioTracksNode(gpif, score);
        this.writeTracksNode(gpif, score);
        this.writeMasterBarsNode(gpif, score);

        const bars = gpif.addElement('Bars');
        const voices = gpif.addElement('Voices');
        const beats = gpif.addElement('Beats');
        const notes = gpif.addElement('Notes');
        const rhythms = gpif.addElement('Rhythms');

        for (const tracks of score.tracks) {

            for (const staff of tracks.staves) {

                for (const bar of staff.bars) {

                    this.writeBarNode(bars, bar);

                    for (const voice of bar.voices) {
                        this.writeVoiceNode(voices, voice);

                        for (const beat of voice.beats) {
                            this.writeBeatNode(beats, beat, rhythms);

                            for (const note of beat.notes) {
                                this.writeNoteNode(notes, note);
                            }
                        }
                    }
                }
            }
        }
    }

    private writeNoteNode(parent: XmlNode, note: Note) {
        const noteNode = parent.addElement('Note');
        noteNode.attributes.set('id', note.id.toString());

        this.writeNoteProperties(noteNode, note);

        if (note.isGhost) {
            noteNode.addElement('AntiAccent').innerText = 'normal';
        }

        if (note.isLetRing) {
            noteNode.addElement('LetRing');
        }

        if (note.isTrill) {
            noteNode.addElement('Trill').innerText = note.trillValue.toString();
        }

        let accentFlags = 0;
        if (note.isStaccato) {
            accentFlags |= 1;
        }
        switch (note.accentuated) {
            case AccentuationType.Normal:
                accentFlags |= 0x08;
                break;
            case AccentuationType.Heavy:
                accentFlags |= 0x04;
                break;
        }

        if (accentFlags > 0) {
            noteNode.addElement('Accent').innerText = accentFlags.toString();
        }

        if (note.isTieOrigin || note.isTieDestination) {
            const tie = noteNode.addElement('Tie');
            tie.attributes.set('origin', note.isTieOrigin ? 'true' : 'false');
            tie.attributes.set('destination', note.isTieDestination ? 'true' : 'false');
        }

        switch (note.vibrato) {
            case VibratoType.Slight:
                noteNode.addElement('Vibrato').innerText = 'Slight';
                break;
            case VibratoType.Wide:
                noteNode.addElement('Vibrato').innerText = 'Wide';
                break;
        }

        if (note.isFingering) {
            switch (note.leftHandFinger) {
                case Fingers.Thumb:
                    noteNode.addElement('LeftFingering').innerText = 'P';
                    break;
                case Fingers.IndexFinger:
                    noteNode.addElement('LeftFingering').innerText = 'I';
                    break;
                case Fingers.MiddleFinger:
                    noteNode.addElement('LeftFingering').innerText = 'M';
                    break;
                case Fingers.AnnularFinger:
                    noteNode.addElement('LeftFingering').innerText = 'A';
                    break;
                case Fingers.LittleFinger:
                    noteNode.addElement('LeftFingering').innerText = 'C';
                    break;
            }
            switch (note.rightHandFinger) {
                case Fingers.Thumb:
                    noteNode.addElement('RightFingering').innerText = 'P';
                    break;
                case Fingers.IndexFinger:
                    noteNode.addElement('RightFingering').innerText = 'I';
                    break;
                case Fingers.MiddleFinger:
                    noteNode.addElement('RightFingering').innerText = 'M';
                    break;
                case Fingers.AnnularFinger:
                    noteNode.addElement('RightFingering').innerText = 'A';
                    break;
                case Fingers.LittleFinger:
                    noteNode.addElement('RightFingering').innerText = 'C';
                    break;
            }
        }

        if (note.percussionArticulation >= 0) {
            noteNode.addElement('InstrumentArticulation').innerText = note.percussionArticulation.toString();
        } else {
            noteNode.addElement('InstrumentArticulation').innerText = '0';

        }
    }

    private writeNoteProperties(parent: XmlNode, note: Note) {
        const properties = parent.addElement('Properties');

        this.writeConcertPitch(properties, note);
        this.writeTransposedPitch(properties, note);


        if (note.isStringed) {
            this.writeSimplePropertyNode(properties, 'String', 'String', (note.string - 1).toString());
            this.writeSimplePropertyNode(properties, 'Fret', 'Fret', note.fret.toString());
            this.writeSimplePropertyNode(properties, 'Midi', 'Number', note.realValue.toString());
        }

        if (note.isPiano) {
            this.writeSimplePropertyNode(properties, 'Octave', 'Number', note.octave.toString());
            this.writeSimplePropertyNode(properties, 'Tone', 'Step', note.tone.toString());
            this.writeSimplePropertyNode(properties, 'Midi', 'Number', note.realValue.toString());
        }


        if (note.beat.tap) {
            this.writeSimplePropertyNode(properties, 'Tapped', 'Enable', null);
        }

        if (note.harmonicType !== HarmonicType.None) {
            switch (note.harmonicType) {
                case HarmonicType.Natural:
                    this.writeSimplePropertyNode(properties, 'HarmonicType', 'HType', 'Natural');
                    break;
                case HarmonicType.Artificial:
                    this.writeSimplePropertyNode(properties, 'HarmonicType', 'HType', 'Artificial');
                    break;
                case HarmonicType.Pinch:
                    this.writeSimplePropertyNode(properties, 'HarmonicType', 'HType', 'Pinch');
                    break;
                case HarmonicType.Tap:
                    this.writeSimplePropertyNode(properties, 'HarmonicType', 'HType', 'Tap');
                    break;
                case HarmonicType.Semi:
                    this.writeSimplePropertyNode(properties, 'HarmonicType', 'HType', 'Semi');
                    break;
                case HarmonicType.Feedback:
                    this.writeSimplePropertyNode(properties, 'HarmonicType', 'HType', 'Feedback');
                    break;
            }

            if (note.harmonicValue !== 0) {
                this.writeSimplePropertyNode(properties, 'HarmonicFret', 'HFret', note.harmonicValue.toString())
            }
        }


        if (note.isDead) {
            this.writeSimplePropertyNode(properties, 'Muted', 'Enable', null);
        }

        if (note.isPalmMute) {
            this.writeSimplePropertyNode(properties, 'PalmMuted', 'Enable', null);
        }

        if (note.hasBend) {
            this.writeBend(properties, note);
        }

        if (note.isHammerPullOrigin) {
            this.writeSimplePropertyNode(properties, 'HopoOrigin', 'Enable', null);
        }

        if (note.isHammerPullDestination) {
            this.writeSimplePropertyNode(properties, 'HopoDestination', 'Enable', null);
        }

        if (note.isLeftHandTapped) {
            this.writeSimplePropertyNode(properties, 'LeftHandTapped', 'Enable', null);
        }


        let slideFlags = 0;
        switch (note.slideInType) {
            case SlideInType.IntoFromAbove:
                slideFlags |= 32;
                break;
            case SlideInType.IntoFromBelow:
                slideFlags |= 16;
                break;
        }
        switch (note.slideOutType) {
            case SlideOutType.Shift:
                slideFlags |= 1;
                break;
            case SlideOutType.Legato:
                slideFlags |= 2;
                break;
            case SlideOutType.OutDown:
                slideFlags |= 4;
                break;
            case SlideOutType.OutUp:
                slideFlags |= 8;
                break;
            case SlideOutType.PickSlideDown:
                slideFlags |= 64;
                break;
            case SlideOutType.PickSlideUp:
                slideFlags |= 128;
                break;
        }

        if (slideFlags > 0) {
            this.writeSimplePropertyNode(properties, 'Slide', 'Flags', slideFlags.toString());
        }
    }

    private writeTransposedPitch(properties: XmlNode, note: Note) {
        if (note.isPercussion) {
            this.writePitch(properties, "ConcertPitch", "C", "-1", '');
        } else {
            this.writePitchForValue(properties, "TransposedPitch", note.displayValueWithoutBend, note.accidentalMode)
        }
    }

    private writeConcertPitch(properties: XmlNode, note: Note) {
        if (note.isPercussion) {
            this.writePitch(properties, "ConcertPitch", "C", "-1", '');
        } else {
            this.writePitchForValue(properties, "ConcertPitch", note.realValueWithoutHarmonic, note.accidentalMode)
        }
    }

    private writePitchForValue(properties: XmlNode, propertyName: string, value: number, accidentalMode: NoteAccidentalMode) {
        let index = 0;
        let octave: number = 0;

        let step = '';
        let accidental = '';

        const updateParts: () => void = () => {
            index = value % 12;
            octave = (value / 12) | 0;

            step = Tuning.defaultSteps[index];
            accidental = Tuning.defaultAccidentals[index];
        };
        updateParts();

        switch (accidentalMode) {
            case NoteAccidentalMode.Default:
                break;
            case NoteAccidentalMode.ForceNone:
                accidental = '';
                break;
            case NoteAccidentalMode.ForceNatural:
                accidental = ''
                break;
            case NoteAccidentalMode.ForceSharp:
                accidental = '#';
                break;
            case NoteAccidentalMode.ForceDoubleSharp:
                if (accidental === '#') {
                    value -= 2;
                    updateParts();
                }
                accidental = 'x';
                break;
            case NoteAccidentalMode.ForceFlat:
                if (accidental === '#') {
                    value += 1;
                    updateParts();
                }
                accidental = 'b';
                break;
            case NoteAccidentalMode.ForceDoubleFlat:
                if (accidental === '#') {
                    value += 2;
                    updateParts();
                }
                accidental = 'bb';
                break;
        }

        this.writePitch(properties, propertyName, step, octave.toString(), accidental);
    }

    private writePitch(properties: XmlNode, propertyName: string, step: string, octave: string, accidental: string) {
        const property = properties.addElement('Property');
        property.attributes.set('name', propertyName);

        const pitch = property.addElement('Pitch');

        pitch.addElement('Step').innerText = step;
        pitch.addElement('Accidental').innerText = accidental;
        pitch.addElement('Octave').innerText = octave;
    }

    private writeBend(properties: XmlNode, note: Note) {
        if (note.hasBend && note.bendPoints.length <= 4) {
            this.writeStandardBend(properties, note.bendPoints);
        }
    }

    private writeStandardBend(properties: XmlNode, bendPoints: BendPoint[]) {
        this.writeSimplePropertyNode(properties, 'Bended', 'Enable', null);

        var bendOrigin = bendPoints[0];
        var bendDestination = bendPoints[bendPoints.length - 1];
        var bendMiddle1: BendPoint;
        var bendMiddle2: BendPoint;

        switch (bendPoints.length) {
            case 4:
                bendMiddle1 = bendPoints[1];
                bendMiddle2 = bendPoints[2];
                break;
            case 3:
                bendMiddle1 = bendPoints[1];
                bendMiddle2 = bendPoints[1];
                break;
            case 2:
            default:
                bendMiddle1 = new BendPoint(
                    (bendOrigin.offset + bendDestination.offset) / 2,
                    (bendOrigin.value + bendDestination.value) / 2
                );
                bendMiddle2 = bendMiddle1;
                break;
        }

        this.writeSimplePropertyNode(properties, 'BendDestinationOffset', 'Float', this.toBendOffset(bendDestination.offset).toString());
        this.writeSimplePropertyNode(properties, 'BendDestinationValue', 'Float', this.toBendValue(bendDestination.value).toString());

        this.writeSimplePropertyNode(properties, 'BendMiddleOffset1', 'Float', this.toBendOffset(bendMiddle1.offset).toString());
        this.writeSimplePropertyNode(properties, 'BendMiddleOffset2', 'Float', this.toBendOffset(bendMiddle2.offset).toString());
        this.writeSimplePropertyNode(properties, 'BendMiddleValue', 'Float', this.toBendValue(bendMiddle1.value).toString());

        this.writeSimplePropertyNode(properties, 'BendOriginOffset', 'Float', this.toBendOffset(bendOrigin.offset).toString());
        this.writeSimplePropertyNode(properties, 'BendOriginValue', 'Float', this.toBendValue(bendOrigin.value).toString());
    }

    private toBendValue(value: number) {
        // GPIF: 25 per quarternote
        return value * 25;
    }

    private toBendOffset(value: number) {
        // GPIF range: 0-100
        return (value / BendPoint.MaxPosition) * 100.0;
    }


    private writeBeatNode(parent: XmlNode, beat: Beat, rhythms: XmlNode) {
        const beatNode = parent.addElement('Beat');
        beatNode.attributes.set('id', beat.id.toString());

        beatNode.addElement('Dynamic').innerText = DynamicValue[beat.dynamics];
        if (beat.fadeIn) {
            beatNode.addElement('Fadding').innerText = 'FadeIn';
        }
        if (beat.isTremolo) {
            switch (beat.tremoloSpeed) {
                case Duration.Eighth:
                    beatNode.addElement('Tremolo').innerText = '1/2';
                    break;
                case Duration.Sixteenth:
                    beatNode.addElement('Tremolo').innerText = '1/4';
                    break;
                case Duration.ThirtySecond:
                    beatNode.addElement('Tremolo').innerText = '1/8';
                    break;
            }
        }
        if (beat.hasChord) {
            beatNode.addElement('Chord').setCData(beat.chordId!);
        }
        if (beat.crescendo !== CrescendoType.None) {
            beatNode.addElement('Hairpin').innerText = CrescendoType[beat.crescendo];
        }
        switch (beat.brushType) {
            case BrushType.ArpeggioUp:
                beatNode.addElement('Arpeggio').innerText = 'Up';
                break;
            case BrushType.ArpeggioDown:
                beatNode.addElement('Arpeggio').innerText = 'Down';
                break;
        }
        if (beat.text) {
            beatNode.addElement('FreeText').setCData(beat.text);
        }
        switch (beat.graceType) {
            case GraceType.OnBeat:
            case GraceType.BeforeBeat:
                beatNode.addElement('GraceNotes').innerText = GraceType[beat.graceType];
                break;
        }
        if (beat.ottava !== Ottavia.Regular) {
            beatNode.addElement('Ottavia').innerText = Ottavia[beat.ottava].substr(1);
        }
        if (beat.hasWhammyBar) {
            this.writeWhammyNode(beatNode, beat);
        }

        if (beat.isLegatoOrigin || beat.isLegatoDestination) {
            const legato = beatNode.addElement('Legato');
            legato.attributes.set('origin', beat.isLegatoOrigin ? 'true' : 'false');
            legato.attributes.set('destination', beat.isLegatoDestination ? 'true' : 'false');
        }

        this.writeRhythm(beatNode, beat, rhythms);

        if (beat.preferredBeamDirection !== null) {
            switch (beat.preferredBeamDirection) {
                case BeamDirection.Up:
                    beatNode.addElement('TransposedPitchStemOrientation').innerText = 'Upward';
                    break;
                case BeamDirection.Down:
                    beatNode.addElement('TransposedPitchStemOrientation').innerText = 'Downward';
                    break;
            }
        }

        beatNode.addElement('ConcertPitchStemOrientation').innerText = 'Undefined';
        if (!beat.isRest) {
            beatNode.addElement('Notes').innerText = beat.notes.map(n => n.id).join(' ');
        }

        this.writeBeatProperties(beatNode, beat);
        this.writeBeatXProperties(beatNode, beat);

        if (beat.lyrics && beat.lyrics.length > 0) {
            this.writeBeatLyrics(beatNode, beat.lyrics);
        }
    }

    private writeBeatLyrics(beatNode: XmlNode, lyrics: string[]) {
        const lyricsNode = beatNode.addElement('Lyrics');
        for (const l of lyrics) {
            const line = lyricsNode.addElement('Line');
            line.setCData(l);
        }
    }

    private writeBeatXProperties(beatNode: XmlNode, beat: Beat) {
        const beatProperties = beatNode.addElement('XProperties');

        if (beat.brushDuration > 0) {
            this.writeSimpleXPropertyNode(beatProperties, '687935489', 'Int', beat.brushDuration.toString());
        }
    }

    private writeBeatProperties(beatNode: XmlNode, beat: Beat) {
        const beatProperties = beatNode.addElement('Properties');

        switch (beat.brushType) {
            case BrushType.BrushUp:
                this.writeSimplePropertyNode(beatProperties, 'Brush', 'Direction', 'Up');
                break;
            case BrushType.BrushDown:
                this.writeSimplePropertyNode(beatProperties, 'Brush', 'Direction', 'Down');
                break;
        }

        switch (beat.pickStroke) {
            case PickStroke.Up:
                this.writeSimplePropertyNode(beatProperties, 'PickStroke', 'Direction', 'Up');
                break;
            case PickStroke.Down:
                this.writeSimplePropertyNode(beatProperties, 'PickStroke', 'Direction', 'Down');
                break;
        }

        if (beat.slap) {
            this.writeSimplePropertyNode(beatProperties, 'Slapped', 'Enable', null);
        }

        if (beat.pop) {
            this.writeSimplePropertyNode(beatProperties, 'Popped', 'Enable', null);
        }

        switch (beat.vibrato) {
            case VibratoType.Wide:
                this.writeSimplePropertyNode(beatProperties, 'VibratoWTremBar', 'Strength', 'Wide');
                break;
            case VibratoType.Slight:
                this.writeSimplePropertyNode(beatProperties, 'VibratoWTremBar', 'Strength', 'Slight');
                break;
        }
    }

    private writeRhythm(parent: XmlNode, beat: Beat, rhythms: XmlNode) {

        const rhythmId = `${beat.duration}_${beat.dots}_${beat.tupletNumerator}_${beat.tupletDenominator}';`

        let rhythm: string;
        if (!this._rhythmIdLookup.has(rhythmId)) {

            rhythm = this._rhythmIdLookup.size.toString();
            this._rhythmIdLookup.set(rhythmId, rhythm);

            const rhythmNode = rhythms.addElement('Rhythm');
            rhythmNode.attributes.set('id', rhythm);

            if (beat.hasTuplet) {
                const tupletNode = rhythmNode.addElement('PrimaryTuplet');
                tupletNode.attributes.set('num', beat.tupletNumerator.toString());
                tupletNode.attributes.set('den', beat.tupletDenominator.toString());
            }
            if (beat.dots > 0) {
                rhythmNode.addElement('AugmentationDot').attributes.set('count', beat.dots.toString());
            }

            let noteValue = 'Quarter';
            switch (beat.duration) {
                case Duration.QuadrupleWhole:
                    noteValue = 'Long';
                    break;
                case Duration.DoubleWhole:
                    noteValue = 'DoubleWhole';
                    break;
                case Duration.Whole:
                    noteValue = 'Whole';
                    break;
                case Duration.Half:
                    noteValue = 'Half';
                    break;
                case Duration.Quarter:
                    noteValue = 'Quarter';
                    break;
                case Duration.Eighth:
                    noteValue = 'Eighth';
                    break;
                case Duration.Sixteenth:
                    noteValue = '16th';
                    break;
                case Duration.ThirtySecond:
                    noteValue = '32nd';
                    break;
                case Duration.SixtyFourth:
                    noteValue = '64th';
                    break;
                case Duration.OneHundredTwentyEighth:
                    noteValue = '128th';
                    break;
                case Duration.TwoHundredFiftySixth:
                    noteValue = '256th';
                    break;
            }
            rhythmNode.addElement('NoteValue').innerText = noteValue
        } else {
            rhythm = this._rhythmIdLookup.get(rhythmId)!;
        }

        parent.addElement('Rhythm').attributes.set('ref', rhythm);
    }

    private writeWhammyNode(parent: XmlNode, beat: Beat) {
        if (beat.hasWhammyBar && beat.whammyBarPoints.length <= 4) {
            this.writeStandardWhammy(parent, beat.whammyBarPoints);
        }
    }

    private writeStandardWhammy(parent: XmlNode, whammyBarPoints: BendPoint[]) {

        const whammyNode = parent.addElement('Whammy');
        var whammyOrigin = whammyBarPoints[0];
        var whammyDestination = whammyBarPoints[whammyBarPoints.length - 1];
        var whammyMiddle1: BendPoint;
        var whammyMiddle2: BendPoint;

        switch (whammyBarPoints.length) {
            case 4:
                whammyMiddle1 = whammyBarPoints[1];
                whammyMiddle2 = whammyBarPoints[2];
                break;
            case 3:
                whammyMiddle1 = whammyBarPoints[1];
                whammyMiddle2 = whammyBarPoints[1];
                break;
            case 2:
            default:
                whammyMiddle1 = new BendPoint(
                    (whammyOrigin.offset + whammyDestination.offset) / 2,
                    (whammyOrigin.value + whammyDestination.value) / 2
                );
                whammyMiddle2 = whammyMiddle1;
                break;
        }

        whammyNode.attributes.set('destinationOffset', this.toBendOffset(whammyDestination.offset).toString());
        whammyNode.attributes.set('destinationValue', this.toBendValue(whammyDestination.value).toString());

        whammyNode.attributes.set('middleOffset1', this.toBendOffset(whammyMiddle1.offset).toString());
        whammyNode.attributes.set('middleOffset2', this.toBendOffset(whammyMiddle2.offset).toString());
        whammyNode.attributes.set('middleValue', this.toBendValue(whammyMiddle1.value).toString());

        whammyNode.attributes.set('originOffset', this.toBendOffset(whammyOrigin.offset).toString());
        whammyNode.attributes.set('originValue', this.toBendValue(whammyOrigin.value).toString());
    }

    private writeScoreNode(parent: XmlNode, score: Score) {
        const scoreNode = parent.addElement('Score');

        scoreNode.addElement('Title').setCData(score.title);
        scoreNode.addElement('SubTitle').setCData(score.subTitle);
        scoreNode.addElement('Artist').setCData(score.artist);
        scoreNode.addElement('Album').setCData(score.album);
        scoreNode.addElement('Words').setCData(score.words);
        scoreNode.addElement('Music').setCData(score.music);
        scoreNode.addElement('WordsAndMusic').setCData(score.words === score.music ? score.words : '');
        scoreNode.addElement('Copyright').setCData(score.copyright);
        scoreNode.addElement('Tabber').setCData(score.tab);
        scoreNode.addElement('Instructions').setCData(score.instructions);
        scoreNode.addElement('Notices').setCData(score.notices);
        scoreNode.addElement('FirstPageHeader').setCData('');
        scoreNode.addElement('FirstPageFooter').setCData('');
        scoreNode.addElement('PageHeader').setCData('');
        scoreNode.addElement('PageFooter').setCData('');

        scoreNode.addElement('ScoreSystemsDefaultLayout').setCData('4');
        scoreNode.addElement('ScoreSystemsLayout').setCData('4');

        scoreNode.addElement('ScoreZoomPolicy').innerText = 'Value';
        scoreNode.addElement('ScoreZoom').innerText = '1';
        // not fully clear at this point so we rather activate it
        scoreNode.addElement('MultiVoice').innerText = '1>';
    }

    private writeMasterTrackNode(parent: XmlNode, score: Score) {
        const masterTrackNode = parent.addElement('MasterTrack');

        masterTrackNode.addElement('Tracks').innerText = score.tracks.map(t => t.index).join(' ');

        const automations = masterTrackNode.addElement('Automations');

        if (score.masterBars.length > 0 && score.masterBars[0].isAnacrusis) {
            masterTrackNode.addElement('Anacrusis');
        }

        const initialTempoAutomation = automations.addElement('Automation');
        initialTempoAutomation.addElement('Type').innerText = 'Tempo';
        initialTempoAutomation.addElement('Linear').innerText = 'false';
        initialTempoAutomation.addElement('Bar').innerText = "0";
        initialTempoAutomation.addElement('Position').innerText = "0";
        initialTempoAutomation.addElement('Visible').innerText = 'true';
        initialTempoAutomation.addElement('Value').innerText = `${score.tempo} 2`;
        if (score.tempoLabel) {
            initialTempoAutomation.addElement('Text').innerText = score.tempoLabel;
        }

        for (const mb of score.masterBars) {
            if (mb.index > 0 && mb.tempoAutomation) {
                const tempoAutomation = automations.addElement('Automation');
                tempoAutomation.addElement('Type').innerText = 'Tempo';
                tempoAutomation.addElement('Linear').innerText = mb.tempoAutomation.isLinear ? 'true' : 'false';
                tempoAutomation.addElement('Bar').innerText = mb.index.toString();
                tempoAutomation.addElement('Position').innerText = mb.tempoAutomation.ratioPosition.toString();
                tempoAutomation.addElement('Visible').innerText = 'true';
                tempoAutomation.addElement('Value').innerText = `${mb.tempoAutomation.value} 2`;
                if (mb.tempoAutomation.text) {
                    tempoAutomation.addElement('Text').innerText = mb.tempoAutomation.text;
                }
            }
        }
    }

    private writeAudioTracksNode(parent: XmlNode, score: Score) {
        parent.addElement('AudioTracks');
    }

    private writeTracksNode(parent: XmlNode, score: Score) {
        const tracksNode = parent.addElement('Tracks');

        for (const track of score.tracks) {
            this.writeTrackNode(tracksNode, track);
        }
    }

    private writeTrackNode(parent: XmlNode, track: Track) {
        const trackNode = parent.addElement('Track');
        trackNode.attributes.set('id', track.index.toString());

        trackNode.addElement('Name').setCData(track.name);
        trackNode.addElement('ShortName').setCData(track.shortName);
        trackNode.addElement('Color').innerText = `${track.color.r} ${track.color.g} ${track.color.b}`;

        // Note: unclear what these values mean, various combinations in GP7 lead to these values
        trackNode.addElement('SystemsDefautLayout').innerText = "3";
        trackNode.addElement('SystemsLayout').innerText = "1";

        trackNode.addElement('AutoBrush');
        trackNode.addElement('PalmMute').innerText = '0';

        trackNode.addElement('PlayingStyle').innerText = GeneralMidi.isGuitar(track.playbackInfo.program)
            ? 'StringedPick'
            : 'Default';
        trackNode.addElement('UseOneChannelPerString');

        trackNode.addElement('IconId').innerText = GpifWriter.getIconId(track.playbackInfo).toString();

        this.writeInstrumentSetNode(trackNode, track);
        this.writeTransposeNode(trackNode, track);

        this.writeRseNode(trackNode, track);

        trackNode.addElement('ForcedSound').innerText = '-1';

        this.writeMidiConnectionNode(trackNode, track);

        if (track.playbackInfo.isSolo) {
            trackNode.addElement('PlaybackState').innerText = 'Solo';
        } else if (track.playbackInfo.isMute) {
            trackNode.addElement('PlaybackState').innerText = 'Mute';
        } else {
            trackNode.addElement('PlaybackState').innerText = 'Default';
        }

        trackNode.addElement('AudioEngineState').innerText = 'MIDI';

        this.writeLyricsNode(trackNode, track);

        this.writeStavesNode(trackNode, track);

        this.writeSoundsAndAutomations(trackNode, track);
    }

    private static getIconId(playbackInfo: PlaybackInformation): GpifIconIds {
        if (playbackInfo.primaryChannel === 9) {
            return GpifWriter.DrumKitProgramInfo.icon;
        }
        if (GpifWriter.MidiProgramInfoLookup.has(playbackInfo.program)) {
            return GpifWriter.MidiProgramInfoLookup.get(playbackInfo.program)!.icon;
        }
        return GpifIconIds.SteelGuitar;
    }

    private writeSoundAndAutomation(
        soundsNode: XmlNode,
        automationsNode: XmlNode,
        name: string, path: string, role: string,
        barIndex: number, program: number,
        ratioPosition: number = 0) {

        const soundNode = soundsNode.addElement('Sound');
        soundNode.addElement('Name').setCData(name);
        soundNode.addElement('Label').setCData(name);
        soundNode.addElement('Path').setCData(path);
        soundNode.addElement('Role').setCData(role);

        const midi = soundNode.addElement('MIDI');
        midi.addElement('LSB').innerText = '0';
        midi.addElement('MSB').innerText = '0';
        midi.addElement('Program').innerText = program.toString();

        const automationNode = automationsNode.addElement('Automation');
        automationNode.addElement('Type').innerText = 'Sound';
        automationNode.addElement('Linear').innerText = 'false';
        automationNode.addElement('Bar').innerText = barIndex.toString();
        automationNode.addElement('Position').innerText = ratioPosition.toString();
        automationNode.addElement('Visible').innerText = "true";
        automationNode.addElement('Value').setCData(`${path};${name};${role}`);
    }

    private writeSoundsAndAutomations(trackNode: XmlNode, track: Track) {
        const soundsNode = trackNode.addElement('Sounds');
        const automationsNode = trackNode.addElement('Automations');

        if (track.staves.length > 0 && track.staves[0].bars.length > 0) {
            const trackSoundName = `Track_${track.index}_Initial`;
            const trackSoundPath = `Midi/${track.playbackInfo.program}`;
            const trackSoundRole = 'Factory';
            let trackSoundWritten = false;

            for (const staff of track.staves) {
                for (const bar of staff.bars) {
                    for (const voice of bar.voices) {
                        for (const beat of voice.beats) {
                            const soundAutomation = beat.getAutomation(AutomationType.Instrument);
                            const isTrackSound = bar.index === 0 && beat.index === 0;
                            if (soundAutomation) {
                                const name = isTrackSound ? trackSoundName : `ProgramChange_${beat.id}`;
                                const path = isTrackSound ? trackSoundPath : `Midi/${soundAutomation.value}`;
                                const role = isTrackSound ? trackSoundRole : 'User';

                                if (!isTrackSound && !trackSoundWritten) {
                                    this.writeSoundAndAutomation(soundsNode, automationsNode,
                                        trackSoundName, trackSoundPath, trackSoundRole,
                                        track.staves[0].bars[0].index, track.playbackInfo.program
                                    );
                                    trackSoundWritten = true;
                                }

                                this.writeSoundAndAutomation(soundsNode, automationsNode,
                                    name, path, role,
                                    bar.index, soundAutomation.value,
                                    soundAutomation.ratioPosition
                                );

                                if (isTrackSound) {
                                    trackSoundWritten = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private writeMidiConnectionNode(trackNode: XmlNode, track: Track) {
        const midiConnection = trackNode.addElement('MidiConnection');
        midiConnection.addElement('Port').innerText = track.playbackInfo.port.toString();
        midiConnection.addElement('PrimaryChannel').innerText = track.playbackInfo.primaryChannel.toString();
        midiConnection.addElement('SecondaryChannel').innerText = track.playbackInfo.secondaryChannel.toString();
        midiConnection.addElement('ForeOneChannelPerString').innerText = 'false';
    }

    private writeRseNode(trackNode: XmlNode, track: Track) {
        const rse = trackNode.addElement('RSE');

        const channelStrip = rse.addElement('ChannelStrip');
        channelStrip.attributes.set('version', 'E56');

        const channelStripParameters = channelStrip.addElement('Parameters');
        channelStripParameters.innerText = `0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 1 0.5 ${track.playbackInfo.balance / 16} ${track.playbackInfo.volume / 16} 0.5 0.5 0.5`;
    }

    private writeStavesNode(trackNode: XmlNode, track: Track) {
        const staves = trackNode.addElement('Staves');
        for (const staff of track.staves) {
            this.writeStaffNode(staves, staff);
        }
    }

    private writeStaffNode(parent: XmlNode, staff: Staff) {
        const staffNode = parent.addElement('Staff');
        const properties = staffNode.addElement('Properties');

        this.writeSimplePropertyNode(properties, 'CapoFret', 'Fret', staff.capo.toString());
        this.writeSimplePropertyNode(properties, 'FretCount', 'Fret', "24");

        if (staff.tuning.length > 0) {
            const tuningProperty = properties.addElement('Property');
            tuningProperty.attributes.set('name', 'Tuning');
            tuningProperty.addElement('Pitches').innerText = staff.tuning.slice().reverse().join(' ');
            tuningProperty.addElement('Label').setCData(staff.tuningName);
            tuningProperty.addElement('LabelVisible').innerText = staff.tuningName ? "true" : "false";
            tuningProperty.addElement('Flat');

            switch (staff.tuning.length) {
                case 3:
                    tuningProperty.addElement('Instrument').innerText = 'Shamisen';
                    break;
                case 4:
                    if (staff.track.playbackInfo.program === 105) {
                        tuningProperty.addElement('Instrument').innerText = 'Banjo';
                    } else if (staff.track.playbackInfo.program == 42) {
                        tuningProperty.addElement('Instrument').innerText = 'Cello';
                    } else if (staff.track.playbackInfo.program == 43) {
                        tuningProperty.addElement('Instrument').innerText = 'Contrabass';
                    } else if (staff.track.playbackInfo.program == 40) {
                        tuningProperty.addElement('Instrument').innerText = 'Violin';
                    } else if (staff.track.playbackInfo.program == 41) {
                        tuningProperty.addElement('Instrument').innerText = 'Viola';
                    } else {
                        tuningProperty.addElement('Instrument').innerText = 'Bass';
                    }
                    break;
                case 5:
                    if (staff.track.playbackInfo.program === 105) {
                        tuningProperty.addElement('Instrument').innerText = 'Banjo';
                    } else {
                        tuningProperty.addElement('Instrument').innerText = 'Bass';
                    }
                    break;
                case 6:
                    if (staff.track.playbackInfo.program === 105) {
                        tuningProperty.addElement('Instrument').innerText = 'Banjo';
                    } else if (staff.track.playbackInfo.program <= 39) {
                        tuningProperty.addElement('Instrument').innerText = 'Bass';
                    } else {
                        tuningProperty.addElement('Instrument').innerText = 'Guitar';
                    }
                    break;
                case 7:
                    if (staff.track.playbackInfo.program <= 39) {
                        tuningProperty.addElement('Instrument').innerText = 'Bass';
                    } else {
                        tuningProperty.addElement('Instrument').innerText = 'Guitar';
                    }
                    break;
                default:
                    tuningProperty.addElement('Instrument').innerText = 'Guitar';
                    break;
            }
        }

        this.writeSimplePropertyNode(properties, 'PartialCapoFret', 'Fret', "0");
        this.writeSimplePropertyNode(properties, 'PartialCapoStringFlags', 'Bitset', staff.tuning.map(_ => '0').join(''));

        this.writeSimplePropertyNode(properties, 'TuningFlat', 'Enable', null);

        this.writeDiagramCollection(properties, staff, 'DiagramCollection');
        this.writeDiagramCollection(properties, staff, 'DiagramWorkingSet');
    }

    private writeDiagramCollection(properties: XmlNode, staff: Staff, name: string) {
        const diagramCollectionProperty = properties.addElement('Property');
        diagramCollectionProperty.attributes.set('name', name);
        const diagramCollectionItems = diagramCollectionProperty.addElement('Items');

        for (const [id, chord] of staff.chords) {
            const diagramCollectionItem = diagramCollectionItems.addElement('Item');
            diagramCollectionItem.attributes.set('id', id);
            diagramCollectionItem.attributes.set('name', chord.name);

            const diagram = diagramCollectionItem.addElement('Diagram');
            diagram.attributes.set('stringCount', chord.strings.length.toString());
            diagram.attributes.set('fretCount', '5');
            diagram.attributes.set('baseFret', (chord.firstFret - 1).toString());
            diagram.attributes.set('barStates', chord.strings.map(_ => '1').join(' '));

            const frets: number[] = [];
            const fretToStrings = new Map<number, number[]>();

            for (let i = 0; i < chord.strings.length; i++) {
                let chordFret = chord.strings[i];
                if (chordFret !== -1) {
                    const fretNode = diagram.addElement('Fret');
                    const chordString = (chord.strings.length - 1 - i);
                    fretNode.attributes.set('string', chordString.toString());
                    fretNode.attributes.set('fret', (chordFret - chord.firstFret + 1).toString());
                    if (!fretToStrings.has(chordFret)) {
                        fretToStrings.set(chordFret, []);
                        frets.push(chordFret);
                    }
                    fretToStrings.get(chordFret)!.push(chordString);
                }
            }

            frets.sort();

            // try to rebuild the barre frets
            const fingering = diagram.addElement('Fingering');
            if (chord.barreFrets.length > 0) {
                const fingers = [
                    Fingers.LittleFinger,
                    Fingers.AnnularFinger,
                    Fingers.MiddleFinger,
                    Fingers.IndexFinger,
                ];

                for (const fret of frets) {
                    const fretStrings = fretToStrings.get(fret)!;
                    if (fretStrings.length > 1 && chord.barreFrets.indexOf(fret) >= 0) {
                        const finger = fingers.length > 0 ? fingers.pop() : Fingers.IndexFinger;
                        for (const fretString of fretStrings) {
                            const position = fingering.addElement('Position');
                            switch (finger) {
                                case Fingers.LittleFinger:
                                    position.attributes.set('finger', 'Pinky');
                                    break;
                                case Fingers.AnnularFinger:
                                    position.attributes.set('finger', 'Ring');
                                    break;
                                case Fingers.MiddleFinger:
                                    position.attributes.set('finger', 'Middle');
                                    break;
                                case Fingers.IndexFinger:
                                    position.attributes.set('finger', 'Index');
                                    break;
                            }
                            position.attributes.set('fret', (fret - chord.firstFret + 1).toString());
                            position.attributes.set('string', fretString.toString());
                        }
                    }
                }
            }


            const showName = diagram.addElement('Property');
            showName.attributes.set('name', 'ShowName');
            showName.attributes.set('type', 'bool');
            showName.attributes.set('value', chord.showName ? "true" : "false");

            const showDiagram = diagram.addElement('Property');
            showDiagram.attributes.set('name', 'ShowDiagram');
            showDiagram.attributes.set('type', 'bool');
            showDiagram.attributes.set('value', chord.showDiagram ? "true" : "false");

            const showFingering = diagram.addElement('Property');
            showFingering.attributes.set('name', 'ShowFingering');
            showFingering.attributes.set('type', 'bool');
            showFingering.attributes.set('value', chord.showFingering ? "true" : "false");


            // TODO Chord details
            const chordNode = diagram.addElement('Chord');
            const keyNoteNode = chordNode.addElement('KeyNote');
            keyNoteNode.attributes.set('step', 'C');
            keyNoteNode.attributes.set('accidental', 'Natural');

            const bassNoteNode = chordNode.addElement('BassNote');
            bassNoteNode.attributes.set('step', 'C');
            bassNoteNode.attributes.set('accidental', 'Natural');

            const degree1Node = chordNode.addElement('Degree');
            degree1Node.attributes.set('interval', 'Third');
            degree1Node.attributes.set('alteration', 'Major');
            degree1Node.attributes.set('omitted', 'false');

            const degree2Node = chordNode.addElement('Degree');
            degree2Node.attributes.set('interval', 'Fifth');
            degree2Node.attributes.set('alteration', 'Perfect');
            degree2Node.attributes.set('omitted', 'false');
        }
    }

    private writeSimplePropertyNode(parent: XmlNode, propertyName: string, propertyValueTagName: string, propertyValue: string | null) {
        const prop = parent.addElement('Property');
        prop.attributes.set('name', propertyName);
        const propertyValueTag = prop.addElement(propertyValueTagName);
        if (propertyValue !== null) {
            propertyValueTag.innerText = propertyValue;
        }
        return prop;
    }

    private writeSimpleXPropertyNode(parent: XmlNode, propertyId: string, propertyValueTagName: string, propertyValue: string | null) {
        const prop = parent.addElement('XProperty');
        prop.attributes.set('id', propertyId);
        const propertyValueTag = prop.addElement(propertyValueTagName);
        if (propertyValue !== null) {
            propertyValueTag.innerText = propertyValue;
        }
        return prop;
    }

    private writeLyricsNode(trackNode: XmlNode, track: Track) {
        const lyrics = trackNode.addElement('Lyrics');
        lyrics.attributes.set('dispatched', 'true');

        let lines: Lyrics[] = [];

        for (const bar of track.staves[0].bars) {
            for (const voice of bar.voices) {
                if (!voice.isEmpty) {
                    for (const beat of voice.beats) {
                        if (beat.lyrics) {
                            for (let l = 0; l < beat.lyrics.length; l++) {
                                // initial create of the lines
                                while (l >= lines.length) {
                                    const newLyrics = new Lyrics();
                                    newLyrics.startBar = bar.index;
                                    newLyrics.text = '[Empty]';
                                    lines.push(newLyrics);
                                }

                                const line = lines[l];
                                line.text = line.text == '[Empty]'
                                    ? beat.lyrics[l]
                                    : line.text + ' ' + beat.lyrics[l].split(' ').join('+');
                            }
                        }
                    }
                }
            }
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lyrics.addElement('Line');
            line.addElement('Text').setCData(lines[i].text);
            line.addElement('Offset').innerText = lines[i].startBar.toString();
        }
    }

    private writeTransposeNode(trackNode: XmlNode, track: Track) {
        const transpose = trackNode.addElement('Transpose');

        const octaveTranspose = Math.floor(track.staves[0].displayTranspositionPitch / 12);
        const chromaticTranspose = track.staves[0].displayTranspositionPitch - (octaveTranspose * 12);

        transpose.addElement('Chromatic').innerText = chromaticTranspose.toString();
        transpose.addElement('Octave').innerText = octaveTranspose.toString();
    }

    private writeInstrumentSetNode(trackNode: XmlNode, track: Track) {
        const instrumentSet = trackNode.addElement('InstrumentSet');

        const firstStaff: Staff = track.staves[0];

        instrumentSet.addElement('LineCount').innerText = firstStaff.standardNotationLineCount.toString();


        if (track.percussionArticulations.length > 0 || firstStaff.isPercussion) {
            const articulations = track.percussionArticulations.length > 0
                ? track.percussionArticulations
                : Array.from(PercussionMapper.instrumentArticulations.values());

            instrumentSet.addElement('Name').innerText = GpifWriter.DrumKitProgramInfo.instrumentSetName;
            instrumentSet.addElement('Type').innerText = GpifWriter.DrumKitProgramInfo.instrumentSetType;
            let currentElementType: string = "";
            let currentElementName: string = "";
            let currentArticulations: XmlNode = null!;
            let counterPerType = new Map<string, number>();
            const elements = instrumentSet.addElement('Elements');
            for (const articulation of articulations) {
                if (!currentElementType || currentElementType !== articulation.elementType) {
                    var currentElement = elements.addElement('Element');

                    let name = articulation.elementType;
                    if (counterPerType.has(name)) {
                        const counter = counterPerType.get(name)!;
                        name += ' ' + counter;
                        counterPerType.set(name, counter + 1);
                    } else {
                        counterPerType.set(name, 1);
                    }

                    currentElementName = name;
                    currentElement.addElement('Name').innerText = name;
                    currentElement.addElement('Type').innerText = articulation.elementType;

                    currentArticulations = currentElement.addElement('Articulations');
                }


                const articulationNode = currentArticulations.addElement('Articulation');
                articulationNode.addElement('Name').innerText = currentElementName + ' ' + currentArticulations.childNodes.length;
                articulationNode.addElement('StaffLine').innerText = articulation.staffLine.toString();
                articulationNode.addElement('Noteheads').innerText = [
                    this.mapMusicSymbol(articulation.noteHeadDefault),
                    this.mapMusicSymbol(articulation.noteHeadHalf),
                    this.mapMusicSymbol(articulation.noteHeadWhole)
                ].join(' ');

                switch (articulation.techniqueSymbolPlacement) {
                    case TextBaseline.Top:
                        articulationNode.addElement('TechniquePlacement').innerText = "below";
                        break;
                    case TextBaseline.Middle:
                        articulationNode.addElement('TechniquePlacement').innerText = "inside";
                        break;
                    case TextBaseline.Bottom:
                        articulationNode.addElement('TechniquePlacement').innerText = "above";
                        break;
                }
                articulationNode.addElement('TechniqueSymbol').innerText = this.mapMusicSymbol(articulation.techniqueSymbol);
                articulationNode.addElement('InputMidiNumbers').innerText = '';
                articulationNode.addElement('OutputMidiNumber').innerText = articulation.outputMidiNumber.toString();
            }
        } else {
            const programInfo = GpifWriter.MidiProgramInfoLookup.has(track.playbackInfo.program)
                ? GpifWriter.MidiProgramInfoLookup.get(track.playbackInfo.program)!
                : GpifWriter.MidiProgramInfoLookup.get(0)!;

            instrumentSet.addElement('Name').innerText = programInfo.instrumentSetName;
            instrumentSet.addElement('Type').innerText = programInfo.instrumentSetType;

            // Only the simple pitched element for normal instruments
            const elements = instrumentSet.addElement('Elements');
            const element = elements.addElement('Element');

            element.addElement('Pitched').innerText = 'Pitched';
            element.addElement('Type').innerText = 'pitched';
            element.addElement('SoundbankName').innerText = '';

            const articulations = element.addElement('Articulations');
            const articulation = articulations.addElement('Articulation');

            articulation.addElement('Name').innerText = '';
            articulation.addElement('StaffLine').innerText = '0';
            articulation.addElement('Noteheads').innerText = 'noteheadBlack noteheadHalf noteheadWhole';
            articulation.addElement('TechniquePlacement').innerText = 'outside';
            articulation.addElement('TechniqueSymbol').innerText = '';
            articulation.addElement('InputMidiNumbers').innerText = '';
            articulation.addElement('OutputRSESound').innerText = '';
            articulation.addElement('OutputMidiNumber').innerText = '0';
        }
    }

    private mapMusicSymbol(symbol: MusicFontSymbol): string {
        if (symbol === MusicFontSymbol.None) {
            return '';
        }
        let s = MusicFontSymbol[symbol];
        return s.substring(0, 1).toLowerCase() + s.substring(1);
    }

    private writeMasterBarsNode(parent: XmlNode, score: Score) {
        const masterBars = parent.addElement('MasterBars');
        for (const masterBar of score.masterBars) {
            this.writeMasterBarNode(masterBars, masterBar);
        }
    }

    private writeMasterBarNode(parent: XmlNode, masterBar: MasterBar) {
        const masterBarNode = parent.addElement('MasterBar');

        const key = masterBarNode.addElement('Key');
        key.addElement('AccidentalCount').innerText = (masterBar.keySignature as number).toString();
        key.addElement('Mode').innerText = KeySignatureType[masterBar.keySignatureType];
        key.addElement('Sharps').innerText = 'Sharps';

        masterBarNode.addElement('Time').innerText = `${masterBar.timeSignatureNumerator}/${masterBar.timeSignatureDenominator}`;

        let bars: string[] = [];
        for (const tracks of masterBar.score.tracks) {
            for (const staves of tracks.staves) {
                bars.push(staves.bars[masterBar.index].id.toString());
            }
        }

        masterBarNode.addElement('Bars').innerText = bars.join(' ');

        if (masterBar.isDoubleBar) {
            masterBarNode.addElement('DoubleBar');
        }
        if (masterBar.isSectionStart) {
            const section = masterBarNode.addElement('Section');
            section.addElement('Letter').setCData(masterBar.section!.marker);
            section.addElement('Text').setCData(masterBar.section!.text);
        }

        if (masterBar.isRepeatStart || masterBar.isRepeatEnd) {
            const repeat = masterBarNode.addElement('Repeat');
            repeat.attributes.set('start', masterBar.isRepeatStart ? "true" : "false");
            repeat.attributes.set('end', masterBar.isRepeatEnd ? "true" : "false");
            if (masterBar.isRepeatEnd) {
                repeat.attributes.set('count', masterBar.repeatCount.toString());
            }
        }

        if (masterBar.alternateEndings > 0) {
            let remainingBits = masterBar.alternateEndings;

            const alternateEndings: number[] = [];
            let bit = 0;
            while (remainingBits > 0) {
                if (((remainingBits >> bit) & 0x01) == 0x01) {
                    alternateEndings.push(bit + 1);
                    // clear bit
                    remainingBits &= ~(1 << bit);
                }
                bit++;
            }

            masterBarNode.addElement('AlternateEndings').innerText = alternateEndings.join(' ');;
        }

        if (masterBar.tripletFeel !== TripletFeel.NoTripletFeel) {
            masterBarNode.addElement('TripletFeel').innerText = TripletFeel[masterBar.tripletFeel];
        }

        this.writeFermatas(masterBarNode, masterBar);
    }

    private writeFermatas(parent: XmlNode, masterBar: MasterBar) {
        if (masterBar.fermata.size === 0) {
            return;
        }

        if (masterBar.fermata.size > 0) {
            const fermatas = parent.addElement('Fermatas');
            for (const [offset, fermata] of masterBar.fermata) {
                this.writeFermata(fermatas, offset, fermata);
            }
        }

    }
    private writeFermata(parent: XmlNode, offset: number, fermata: Fermata) {

        let numerator = -1;
        let denominator = 1;
        if (offset > 0) {
            while (denominator < 10) {
                // Offset = (numerator / denominator) * QuarterTime
                // (Offset / QuarterTime) * denominator = numerator

                numerator = (offset / MidiUtils.QuarterTime) * denominator;

                // found a full digit match
                if (numerator === Math.floor(numerator)) {
                    break;
                }

                numerator = -1;
                denominator++;
            }
        } else {
            numerator = 0;
            denominator = 1;
        }

        if (numerator === -1) {
            // No split found
            return;
        }

        const fermataNode = parent.addElement('Fermata');

        fermataNode.addElement('Type').innerText = FermataType[fermata.type];
        fermataNode.addElement('Length').innerText = fermata.length.toString();
        fermataNode.addElement('Offset').innerText = `${numerator}/${denominator}`;
    }

    private writeBarNode(parent: XmlNode, bar: Bar) {
        const barNode = parent.addElement('Bar');
        barNode.attributes.set('id', bar.id.toString());

        barNode.addElement('Voices').innerText = bar.voices.map(v => v.isEmpty ? '-1' : v.id.toString()).join(' ');
        barNode.addElement('Clef').innerText = Clef[bar.clef];
        if (bar.clefOttava !== Ottavia.Regular) {
            barNode.addElement('Ottavia').innerText = Ottavia[bar.clefOttava].substr(1);
        }
        if (bar.simileMark !== SimileMark.None) {
            barNode.addElement('SimileMark').innerText = SimileMark[bar.simileMark];
        }
    }

    private writeVoiceNode(parent: XmlNode, voice: Voice) {
        if (voice.isEmpty) {
            return;
        }
        const voiceNode = parent.addElement('Voice');
        voiceNode.attributes.set('id', voice.id.toString());
        voiceNode.addElement('Beats').innerText = voice.beats.map(v => v.id).join(' ');
    }
}
