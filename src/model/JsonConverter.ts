import { MetaDataEvent } from '@src/midi/MetaDataEvent';
import { MetaNumberEvent } from '@src/midi/MetaNumberEvent';
import { MidiEvent } from '@src/midi/MidiEvent';
import { SystemExclusiveEvent } from '@src/midi/SystemExclusiveEvent';
import { MidiFile } from '@src/midi/MidiFile';
import { Automation } from '@src/model/Automation';
import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { Chord } from '@src/model/Chord';
import { Fermata } from '@src/model/Fermata';
import { MasterBar } from '@src/model/MasterBar';
import { Note } from '@src/model/Note';
import { PlaybackInformation } from '@src/model/PlaybackInformation';
import { RenderStylesheet } from '@src/model/RenderStylesheet';
import { Score } from '@src/model/Score';
import { Section } from '@src/model/Section';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { Voice } from '@src/model/Voice';
import { Settings } from '@src/Settings';
import { Midi20PerNotePitchBendEvent } from '@src/midi/Midi20ChannelVoiceEvent';
import { InstrumentArticulation } from './InstrumentArticulation';

/**
 * This class can convert a full {@link Score} instance to a simple JavaScript object and back for further
 * JSON serialization.
 * @target web
 */
export class JsonConverter {
    /**
     * Converts the given score into a JSON encoded string.
     * @param score The score to serialize.
     * @returns A JSON encoded string that can be used togehter with  for conversion.
     */
    public static scoreToJson(score: Score): string {
        let obj: unknown = JsonConverter.scoreToJsObject(score);
        return JSON.stringify(obj, (_, v) => {
            // patch arraybuffer to serialize as array
            if (ArrayBuffer.isView(v)) {
                return Array.apply([], [v]);
            }
            return v;
        });
    }

    /**
     * Converts the score into a JavaScript object without circular dependencies.
     * @param score The score object to serialize
     * @returns A serialized score object without ciruclar dependencies that can be used for further serializations.
     */
    public static scoreToJsObject(score: Score): unknown {
        let score2: Score = {} as any;
        Score.copyTo(score, score2);
        score2.masterBars = [];
        score2.tracks = [];

        score2.stylesheet = {} as any;
        RenderStylesheet.copyTo(score.stylesheet, score2.stylesheet);

        JsonConverter.masterBarsToJsObject(score, score2);
        JsonConverter.tracksToJsObject(score, score2);

        return score2;
    }

    private static tracksToJsObject(score: Score, score2: Score) {
        for (let t: number = 0; t < score.tracks.length; t++) {
            let track: Track = score.tracks[t];
            let track2: Track = {} as any;
            track2.color = {} as any;
            Track.copyTo(track, track2);

            track2.playbackInfo = {} as any;
            PlaybackInformation.copyTo(track.playbackInfo, track2.playbackInfo);

            track2.percussionArticulations = [];
            for(const articulation of track.percussionArticulations) {
                const articulation2 = {} as any;
                InstrumentArticulation.copyTo(articulation, articulation2);
                track2.percussionArticulations.push(articulation2);
            }

            JsonConverter.stavesToJsObject(track, track2);
            score2.tracks.push(track2);
        }
    }

    private static stavesToJsObject(track: Track, track2: Track) {
        track2.staves = [];
        for (let s: number = 0; s < track.staves.length; s++) {
            let staff: Staff = track.staves[s];
            let staff2: Staff = {} as any;
            Staff.copyTo(staff, staff2);
            staff2.chords = new Map<string, Chord>();
            staff.chords.forEach((chord, chordId) => {
                let chord2: Chord = {} as any;
                Chord.copyTo(chord, chord2);
                staff2.chords.set(chordId, chord2);
            });

            JsonConverter.barsToJsObject(staff, staff2);
            track2.staves.push(staff2);
        }
    }

    private static barsToJsObject(staff: Staff, staff2: Staff) {
        staff2.bars = [];
        for (let b: number = 0; b < staff.bars.length; b++) {
            let bar: Bar = staff.bars[b];
            let bar2: Bar = {} as any;
            Bar.copyTo(bar, bar2);

            JsonConverter.voicesToJsObject(bar, bar2);

            staff2.bars.push(bar2);
        }
    }

    private static voicesToJsObject(bar: Bar, bar2: Bar) {
        bar2.voices = [];
        for (let v: number = 0; v < bar.voices.length; v++) {
            let voice: Voice = bar.voices[v];
            let voice2: Voice = {} as any;
            Voice.copyTo(voice, voice2);

            JsonConverter.beatsToJsObject(voice, voice2);

            bar2.voices.push(voice2);
        }
    }

    private static beatsToJsObject(voice: Voice, voice2: Voice) {
        voice2.beats = [];
        for (let bb: number = 0; bb < voice.beats.length; bb++) {
            let beat: Beat = voice.beats[bb];
            let dynamicBeat2: any = {} as any;
            let beat2: Beat = dynamicBeat2;
            Beat.copyTo(beat, beat2);

            beat2.automations = [];
            for (let a: number = 0; a < beat.automations.length; a++) {
                let automation: Automation = {} as any;
                Automation.copyTo(beat.automations[a], automation);
                beat2.automations.push(automation);
            }

            beat2.whammyBarPoints = [];
            for (let i: number = 0; i < beat.whammyBarPoints.length; i++) {
                let point: BendPoint = {} as any;
                BendPoint.copyTo(beat.whammyBarPoints[i], point);
                beat2.whammyBarPoints.push(point);
            }

            JsonConverter.notesToJsObject(beat, beat2);

            voice2.beats.push(beat2);
        }
    }

    private static notesToJsObject(beat: Beat, beat2: Beat) {
        beat2.notes = [];
        for (let n: number = 0; n < beat.notes.length; n++) {
            let note: Note = beat.notes[n];
            let dynamicNote2: any = {} as any;
            let note2: Note = dynamicNote2;
            Note.copyTo(note, note2);

            if (note.isTieDestination) {
                dynamicNote2.tieOriginId = note.tieOrigin!.id;
            }

            if (note.isTieOrigin) {
                dynamicNote2.tieDestinationId = note.tieDestination!.id;
            }

            if (note.isSlurDestination) {
                dynamicNote2.slurOriginId = note.slurOrigin!.id;
            }

            if (note.isSlurOrigin) {
                dynamicNote2.slurDestinationId = note.slurDestination!.id;
            }

            if (note.isHammerPullDestination) {
                dynamicNote2.hammerPullOriginId = note.hammerPullOrigin!.id;
            }

            if (note.isHammerPullOrigin) {
                dynamicNote2.hammerPullDestinationId = note.hammerPullDestination!.id;
            }

            note2.bendPoints = [];
            for (let i: number = 0; i < note.bendPoints.length; i++) {
                let point: BendPoint = {} as any;
                BendPoint.copyTo(note.bendPoints[i], point);
                note2.bendPoints.push(point);
            }
            beat2.notes.push(note2);
        }
    }

    private static masterBarsToJsObject(score: Score, score2: Score) {
        for (let i: number = 0; i < score.masterBars.length; i++) {
            let masterBar: MasterBar = score.masterBars[i];
            let masterBar2: MasterBar = {} as any;
            MasterBar.copyTo(masterBar, masterBar2);
            if (masterBar.tempoAutomation) {
                masterBar2.tempoAutomation = {} as any;
                Automation.copyTo(masterBar.tempoAutomation, masterBar2.tempoAutomation!);
            }

            if (masterBar.section) {
                masterBar2.section = {} as any;
                Section.copyTo(masterBar.section, masterBar2.section!);
            }

            masterBar2.fermata = new Map<number, Fermata>();
            masterBar.fermata.forEach((fermata, fermataId) => {
                let fermata2: any = {} as any;
                masterBar2.fermata.set(fermataId, fermata2);
                Fermata.copyTo(fermata, fermata2);
            });

            score2.masterBars.push(masterBar2);
        }
    }

    /**
     * Converts the given JSON string back to a {@link Score} object.
     * @param json The JSON string that was created via {@link Score}
     * @param settings The settings to use during conversion.
     * @returns The converted score object.
     */
    public static jsonToScore(json: string, settings?: Settings): Score {
        return JsonConverter.jsObjectToScore(JsonConverter.jsObjectToScore(JSON.parse(json), settings), settings);
    }

    /**
     * Converts the given JavaScript object into a score object.
     * @param jsObject The javascript object created via {@link Score}
     * @param settings The settings to use during conversion.
     * @returns The converted score object.
     */
    public static jsObjectToScore(jsObject: unknown, settings?: Settings): Score {
        let score: Score = jsObject as Score;
        let score2: Score = new Score();

        Score.copyTo(score, score2);
        RenderStylesheet.copyTo(score.stylesheet, score2.stylesheet);

        JsonConverter.jsObjectToMasterBars(score, score2);

        JsonConverter.jsObjectToTracks(score, score2);

        score2.finish(settings ?? new Settings());
        return score2;
    }

    private static jsObjectToTracks(score: Score, score2: Score) {
        for (let t: number = 0; t < score.tracks.length; t++) {
            let track: Track = score.tracks[t];
            let track2: Track = new Track();
            track2.ensureStaveCount(track.staves.length);
            Track.copyTo(track, track2);
            score2.addTrack(track2);
            PlaybackInformation.copyTo(track.playbackInfo, track2.playbackInfo);

            for(const articulation of track.percussionArticulations) {
                const articulation2 = new InstrumentArticulation();
                InstrumentArticulation.copyTo(articulation, articulation2);
                track2.percussionArticulations.push(articulation2);
            }

            JsonConverter.jsObjectToStaves(track, track2);
        }
    }

    private static jsObjectToStaves(track: Track, track2: Track) {
        for (let s: number = 0; s < track.staves.length; s++) {
            let staff: Staff = track.staves[s];
            let staff2: Staff = track2.staves[s];
            Staff.copyTo(staff, staff2);
            JsonConverter.jsObjectMapForEach(staff.chords, (chord, chordId) => {
                let chord2: Chord = new Chord();
                Chord.copyTo(chord, chord2);
                staff2.addChord(chordId, chord2);
            });

            JsonConverter.jsObjectToBars(staff, staff2);
        }
    }

    private static jsObjectMapForEach(obj: any, callback: (value: any, key: any) => void) {
        if ('forEach' in obj) {
            obj.forEach(callback);
        } else {
            for (let x in obj) {
                if (obj.hasOwnProperty(x)) {
                    callback(obj[x], x);
                }
            }
        }
    }

    private static jsObjectToBars(staff: Staff, staff2: Staff) {
        for (let b: number = 0; b < staff.bars.length; b++) {
            let bar: Bar = staff.bars[b];
            let bar2: Bar = new Bar();
            Bar.copyTo(bar, bar2);
            staff2.addBar(bar2);

            JsonConverter.jsObjectToVoices(bar, bar2);
        }
    }

    private static jsObjectToVoices(bar: Bar, bar2: Bar) {
        for (let v: number = 0; v < bar.voices.length; v++) {
            let voice: Voice = bar.voices[v];
            let voice2: Voice = new Voice();
            Voice.copyTo(voice, voice2);
            bar2.addVoice(voice2);

            JsonConverter.jsObjectToBeats(voice, voice2);
        }
    }

    private static jsObjectToBeats(voice: Voice, voice2: Voice) {
        for (let bb: number = 0; bb < voice.beats.length; bb++) {
            let beat: Beat = voice.beats[bb];
            let beat2: Beat = new Beat();
            Beat.copyTo(beat, beat2);
            voice2.addBeat(beat2);

            for (let a: number = 0; a < beat.automations.length; a++) {
                let automation: Automation = new Automation();
                Automation.copyTo(beat.automations[a], automation);
                beat2.automations.push(automation);
            }

            for (let i: number = 0; i < beat.whammyBarPoints.length; i++) {
                let point: BendPoint = new BendPoint(0, 0);
                BendPoint.copyTo(beat.whammyBarPoints[i], point);
                beat2.addWhammyBarPoint(point);
            }

            JsonConverter.jsObjectToNotes(beat, beat2);
        }
    }

    private static jsObjectToNotes(beat: Beat, beat2: Beat) {
        for (let n: number = 0; n < beat.notes.length; n++) {
            let note: Note = beat.notes[n];
            let note2: Note = new Note();
            Note.copyTo(note, note2);
            beat2.addNote(note2);

            for (let i: number = 0; i < note.bendPoints.length; i++) {
                let point: BendPoint = new BendPoint(0, 0);
                BendPoint.copyTo(note.bendPoints[i], point);
                note2.addBendPoint(point);
            }
        }
    }

    private static jsObjectToMasterBars(score: Score, score2: Score) {
        for (let i: number = 0; i < score.masterBars.length; i++) {
            let masterBar: MasterBar = score.masterBars[i];
            let masterBar2: MasterBar = new MasterBar();
            MasterBar.copyTo(masterBar, masterBar2);

            if (masterBar.tempoAutomation) {
                masterBar2.tempoAutomation = new Automation();
                Automation.copyTo(masterBar.tempoAutomation, masterBar2.tempoAutomation);
            }

            if (masterBar.section) {
                masterBar2.section = new Section();
                Section.copyTo(masterBar.section, masterBar2.section);
            }

            JsonConverter.jsObjectMapForEach(masterBar.fermata, (fermata, key) => {
                let fermata2: Fermata = new Fermata();
                Fermata.copyTo(fermata, fermata2);
                masterBar2.addFermata(typeof key === 'string' ? parseInt(key) : key, fermata2);
            });
            score2.addMasterBar(masterBar2);
        }
    }

    public static jsObjectToMidiFile(midi: any): MidiFile {
        let midi2: MidiFile = new MidiFile();
        midi2.division = midi.division;
        let midiEvents: any[] = midi.events;
        for (let midiEvent of midiEvents) {
            let tick: number = midiEvent.tick;
            let message: number = midiEvent.message;
            let midiEvent2: MidiEvent;
            switch (midiEvent.type) {
                case 'SystemExclusiveEvent':
                    midiEvent2 = new SystemExclusiveEvent(tick, 0, 0, midiEvent.data);
                    midiEvent2.message = message;
                    break;
                case 'MetaDataEvent':
                    midiEvent2 = new MetaDataEvent(tick, 0, 0, midiEvent.data);
                    midiEvent2.message = message;
                    break;
                case 'MetaNumberEvent':
                    midiEvent2 = new MetaNumberEvent(tick, 0, 0, midiEvent.value);
                    midiEvent2.message = message;
                    break;
                case 'Midi20PerNotePitchBendEvent':
                    midiEvent2 = new Midi20PerNotePitchBendEvent(tick, 0, midiEvent.noteKey, midiEvent.pitch);
                    midiEvent2.message = message;
                    break;
                default:
                    midiEvent2 = new MidiEvent(tick, 0, 0, 0);
                    midiEvent2.message = message;
                    break;
            }
            midi2.events.push(midiEvent2);
        }
        return midi2;
    }

    public static midiFileToJsObject(midi: MidiFile): unknown {
        let midi2: any = {} as any;
        midi2.division = midi.division;
        let midiEvents: unknown[] = [];
        midi2.events = midiEvents;
        for (let midiEvent of midi.events) {
            let midiEvent2: any = {} as any;
            midiEvents.push(midiEvent2);
            midiEvent2.tick = midiEvent.tick;
            midiEvent2.message = midiEvent.message;
            if (midiEvent instanceof SystemExclusiveEvent) {
                midiEvent2.type = 'SystemExclusiveEvent';
                midiEvent2.data = midiEvent.data;
            } else if (midiEvent instanceof MetaDataEvent) {
                midiEvent2.type = 'MetaDataEvent';
                midiEvent2.data = midiEvent.data;
            } else if (midiEvent instanceof MetaNumberEvent) {
                midiEvent2.type = 'MetaNumberEvent';
                midiEvent2.value = midiEvent.value;
            } else if (midiEvent instanceof Midi20PerNotePitchBendEvent) {
                midiEvent2.type = 'Midi20PerNotePitchBendEvent';
                midiEvent2.noteKey = midiEvent.noteKey;
                midiEvent2.pitch = midiEvent.pitch;
            }
        }
        return midi2;
    }
}
