import {
    AlphaTabMetronomeEvent,
    AlphaTabRestEvent,
    ControlChangeEvent,
    EndOfTrackEvent,
    type MidiEvent,
    MidiEventType,
    NoteBendEvent,
    type NoteEvent,
    NoteOffEvent,
    NoteOnEvent,
    PitchBendEvent,
    ProgramChangeEvent,
    TempoChangeEvent,
    TimeSignatureEvent
} from '@src/midi/MidiEvent';
import { MidiFile, MidiTrack } from '@src/midi/MidiFile';
import { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { ScoreSerializer } from '@src/generated/model/ScoreSerializer';
import { SettingsSerializer } from '@src/generated/SettingsSerializer';
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import type { ControllerType } from '@src/midi/ControllerType';
import { JsonHelper } from '@src/io/JsonHelper';

/**
 * This class can convert a full {@link Score} instance to a simple JavaScript object and back for further
 * JSON serialization.
 */
export class JsonConverter {
    /**
     * @target web
     */
    private static jsonReplacer(_: any, v: any) {
        if (v instanceof Map) {
            if ('fromEntries' in Object) {
                return Object.fromEntries(v);
            }
            const o: any = {};
            for (const [k, mv] of v) {
                o[k] = mv;
            }
            return o;
        }
        if (ArrayBuffer.isView(v)) {
            return Array.apply([], [v]);
        }
        return v;
    }

    /**
     * Converts the given score into a JSON encoded string.
     * @param score The score to serialize.
     * @returns A JSON encoded string.
     * @target web
     */
    public static scoreToJson(score: Score): string {
        const obj: unknown = JsonConverter.scoreToJsObject(score);
        return JSON.stringify(obj, JsonConverter.jsonReplacer);
    }

    /**
     * Converts the given JSON string back to a {@link Score} object.
     * @param json The JSON string
     * @param settings The settings to use during conversion.
     * @returns The converted score object.
     * @target web
     */
    public static jsonToScore(json: string, settings?: Settings): Score {
        return JsonConverter.jsObjectToScore(JSON.parse(json), settings);
    }

    /**
     * Converts the score into a JavaScript object without circular dependencies.
     * @param score The score object to serialize
     * @returns A serialized score object without ciruclar dependencies that can be used for further serializations.
     */
    public static scoreToJsObject(score: Score): unknown {
        return ScoreSerializer.toJson(score);
    }

    /**
     * Converts the given JavaScript object into a score object.
     * @param jsObject The javascript object created via {@link Score}
     * @param settings The settings to use during conversion.
     * @returns The converted score object.
     */
    public static jsObjectToScore(jsObject: unknown, settings?: Settings): Score {
        const score: Score = new Score();
        ScoreSerializer.fromJson(score, jsObject);
        score.finish(settings ?? new Settings());
        return score;
    }

    /**
     * Converts the given settings into a JSON encoded string.
     * @param settings The settings to serialize.
     * @returns A JSON encoded string.
     * @target web
     */
    public static settingsToJson(settings: Settings): string {
        const obj: unknown = JsonConverter.settingsToJsObject(settings);
        return JSON.stringify(obj, JsonConverter.jsonReplacer);
    }

    /**
     * Converts the given JSON string back to a {@link Score} object.
     * @param json The JSON string
     * @returns The converted settings object.
     * @target web
     */
    public static jsonToSettings(json: string): Settings {
        return JsonConverter.jsObjectToSettings(JSON.parse(json));
    }

    /**
     * Converts the settings object into a JavaScript object for transmission between components or saving purposes.
     * @param settings The settings object to serialize
     * @returns A serialized settings object without ciruclar dependencies that can be used for further serializations.
     */
    public static settingsToJsObject(settings: Settings): Map<string, unknown> | null {
        return SettingsSerializer.toJson(settings);
    }

    /**
     * Converts the given JavaScript object into a settings object.
     * @param jsObject The javascript object created via {@link Settings}
     * @returns The converted Settings object.
     */
    public static jsObjectToSettings(jsObject: unknown): Settings {
        const settings: Settings = new Settings();
        SettingsSerializer.fromJson(settings, jsObject);
        return settings;
    }

    /**
     * Converts the given JavaScript object into a MidiFile object.
     * @param jsObject The javascript object to deserialize.
     * @returns The converted MidiFile.
     */
    public static jsObjectToMidiFile(jsObject: unknown): MidiFile {
        const midi2: MidiFile = new MidiFile();

        JsonHelper.forEach(jsObject, (v, k) => {
            switch (k) {
                case 'division':
                    midi2.division = v as number;
                    break;
                case 'tracks':
                    for (const midiTrack of v as unknown[]) {
                        const midiTrack2: MidiTrack = JsonConverter.jsObjectToMidiTrack(midiTrack);
                        midi2.tracks.push(midiTrack2);
                    }
                    break;
            }
        });

        return midi2;
    }

    private static jsObjectToMidiTrack(jsObject: unknown): MidiTrack {
        const midi2: MidiTrack = new MidiTrack();

        JsonHelper.forEach(jsObject, (v, k) => {
            switch (k) {
                case 'events':
                    for (const midiEvent of v as unknown[]) {
                        const midiEvent2: MidiEvent = JsonConverter.jsObjectToMidiEvent(midiEvent);
                        midi2.events.push(midiEvent2);
                    }
                    break;
            }
        });

        return midi2;
    }

    /**
     * Converts the given JavaScript object into a MidiEvent object.
     * @param jsObject The javascript object to deserialize.
     * @returns The converted MidiEvent.
     */
    public static jsObjectToMidiEvent(midiEvent: unknown): MidiEvent {
        const track: number = JsonHelper.getValue(midiEvent, 'track') as number;
        const tick: number = JsonHelper.getValue(midiEvent, 'tick') as number;
        const type: MidiEventType = JsonHelper.getValue(midiEvent, 'type') as number as MidiEventType;

        switch (type) {
            case MidiEventType.TimeSignature:
                return new TimeSignatureEvent(
                    track,
                    tick,
                    JsonHelper.getValue(midiEvent, 'numerator') as number,
                    JsonHelper.getValue(midiEvent, 'denominatorIndex') as number,
                    JsonHelper.getValue(midiEvent, 'midiClocksPerMetronomeClick') as number,
                    JsonHelper.getValue(midiEvent, 'thirdySecondNodesInQuarter') as number
                );
            case MidiEventType.AlphaTabRest:
                return new AlphaTabRestEvent(track, tick, JsonHelper.getValue(midiEvent, 'channel') as number);
            case MidiEventType.AlphaTabMetronome:
                return new AlphaTabMetronomeEvent(
                    track,
                    tick,
                    JsonHelper.getValue(midiEvent, 'metronomeNumerator') as number,
                    JsonHelper.getValue(midiEvent, 'metronomeDurationInTicks') as number,
                    JsonHelper.getValue(midiEvent, 'metronomeDurationInMilliseconds') as number
                );
            case MidiEventType.NoteOn:
                return new NoteOnEvent(
                    track,
                    tick,
                    JsonHelper.getValue(midiEvent, 'channel') as number,
                    JsonHelper.getValue(midiEvent, 'noteKey') as number,
                    JsonHelper.getValue(midiEvent, 'noteVelocity') as number
                );
            case MidiEventType.NoteOff:
                return new NoteOffEvent(
                    track,
                    tick,
                    JsonHelper.getValue(midiEvent, 'channel') as number,
                    JsonHelper.getValue(midiEvent, 'noteKey') as number,
                    JsonHelper.getValue(midiEvent, 'noteVelocity') as number
                );
            case MidiEventType.ControlChange:
                return new ControlChangeEvent(
                    track,
                    tick,
                    JsonHelper.getValue(midiEvent, 'channel') as number,
                    JsonHelper.getValue(midiEvent, 'controller') as number as ControllerType,
                    JsonHelper.getValue(midiEvent, 'value') as number
                );
            case MidiEventType.ProgramChange:
                return new ProgramChangeEvent(
                    track,
                    tick,
                    JsonHelper.getValue(midiEvent, 'channel') as number,
                    JsonHelper.getValue(midiEvent, 'program') as number
                );
            case MidiEventType.TempoChange:
                const tempo = new TempoChangeEvent(tick, 0);
                tempo.beatsPerMinute = JsonHelper.getValue(midiEvent, 'beatsPerMinute') as number;
                return tempo;
            case MidiEventType.PitchBend:
                return new PitchBendEvent(
                    track,
                    tick,
                    JsonHelper.getValue(midiEvent, 'channel') as number,
                    JsonHelper.getValue(midiEvent, 'value') as number
                );
            case MidiEventType.PerNotePitchBend:
                return new NoteBendEvent(
                    track,
                    tick,
                    JsonHelper.getValue(midiEvent, 'channel') as number,
                    JsonHelper.getValue(midiEvent, 'noteKey') as number,
                    JsonHelper.getValue(midiEvent, 'value') as number
                );
            case MidiEventType.EndOfTrack:
                return new EndOfTrackEvent(track, tick);
        }

        throw new AlphaTabError(AlphaTabErrorType.Format, `Unknown Midi Event type: ${type}`);
    }

    /**
     * Converts the given MidiFile object into a serialized JavaScript object.
     * @param midi The midi file to convert.
     * @returns A serialized MidiFile object without ciruclar dependencies that can be used for further serializations.
     */
    public static midiFileToJsObject(midi: MidiFile): Map<string, unknown> {
        const o = new Map<string, unknown>();
        o.set('division', midi.division);

        const tracks: Map<string, unknown>[] = [];
        for (const track of midi.tracks) {
            tracks.push(JsonConverter.midiTrackToJsObject(track));
        }
        o.set('tracks', tracks);

        return o;
    }

    private static midiTrackToJsObject(midi: MidiTrack): Map<string, unknown> {
        const o = new Map<string, unknown>();

        const events: Map<string, unknown>[] = [];
        for (const track of midi.events) {
            events.push(JsonConverter.midiEventToJsObject(track));
        }
        o.set('events', events);

        return o;
    }

    /**
     * Converts the given MidiEvent object into a serialized JavaScript object.
     * @param midi The midi file to convert.
     * @returns A serialized MidiEvent object without ciruclar dependencies that can be used for further serializations.
     */
    public static midiEventToJsObject(midiEvent: MidiEvent): Map<string, unknown> {
        const o = new Map<string, unknown>();
        o.set('track', midiEvent.track);
        o.set('tick', midiEvent.tick);
        o.set('type', midiEvent.type as number);
        switch (midiEvent.type) {
            case MidiEventType.TimeSignature:
                o.set('numerator', (midiEvent as TimeSignatureEvent).numerator);
                o.set('denominatorIndex', (midiEvent as TimeSignatureEvent).denominatorIndex);
                o.set('midiClocksPerMetronomeClick', (midiEvent as TimeSignatureEvent).midiClocksPerMetronomeClick);
                o.set('thirdySecondNodesInQuarter', (midiEvent as TimeSignatureEvent).thirtySecondNodesInQuarter);
                break;
            case MidiEventType.AlphaTabRest:
                o.set('channel', (midiEvent as AlphaTabRestEvent).channel);
                break;
            case MidiEventType.AlphaTabMetronome:
                o.set('metronomeNumerator', (midiEvent as AlphaTabMetronomeEvent).metronomeNumerator);
                o.set(
                    'metronomeDurationInMilliseconds',
                    (midiEvent as AlphaTabMetronomeEvent).metronomeDurationInMilliseconds
                );
                o.set('metronomeDurationInTicks', (midiEvent as AlphaTabMetronomeEvent).metronomeDurationInTicks);
                break;
            case MidiEventType.NoteOn:
            case MidiEventType.NoteOff:
                o.set('channel', (midiEvent as NoteEvent).channel);
                o.set('noteKey', (midiEvent as NoteEvent).noteKey);
                o.set('noteVelocity', (midiEvent as NoteEvent).noteVelocity);
                break;
            case MidiEventType.ControlChange:
                o.set('channel', (midiEvent as ControlChangeEvent).channel);
                o.set('controller', (midiEvent as ControlChangeEvent).controller as number);
                o.set('value', (midiEvent as ControlChangeEvent).value);
                break;
            case MidiEventType.ProgramChange:
                o.set('channel', (midiEvent as ProgramChangeEvent).channel);
                o.set('program', (midiEvent as ProgramChangeEvent).program);
                break;
            case MidiEventType.TempoChange:
                o.set('beatsPerMinute', (midiEvent as TempoChangeEvent).beatsPerMinute);
                break;
            case MidiEventType.PitchBend:
                o.set('channel', (midiEvent as PitchBendEvent).channel);
                o.set('value', (midiEvent as PitchBendEvent).value);
                break;
            case MidiEventType.PerNotePitchBend:
                o.set('channel', (midiEvent as NoteBendEvent).channel);
                o.set('noteKey', (midiEvent as NoteBendEvent).noteKey);
                o.set('value', (midiEvent as NoteBendEvent).value);
                break;
            case MidiEventType.EndOfTrack:
                break;
        }

        return o;
    }
}
