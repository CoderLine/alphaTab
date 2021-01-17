import { MetaDataEvent } from '@src/midi/MetaDataEvent';
import { MetaNumberEvent } from '@src/midi/MetaNumberEvent';
import { MidiEvent } from '@src/midi/MidiEvent';
import { SystemExclusiveEvent } from '@src/midi/SystemExclusiveEvent';
import { MidiFile } from '@src/midi/MidiFile';
import { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { Midi20PerNotePitchBendEvent } from '@src/midi/Midi20PerNotePitchBendEvent';
import { ScoreSerializer } from '@src/generated/model/ScoreSerializer';
import { SettingsSerializer } from '@src/generated/SettingsSerializer';

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
                return (Object as any).fromEntries(v);
            } else {
                const o: any = {};
                for (const [k, mv] of v) { o[k] = mv; }
                return o;
            }
        }
        else if (ArrayBuffer.isView(v)) {
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
        let obj: unknown = JsonConverter.scoreToJsObject(score);
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
        let score: Score = new Score();
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
        let obj: unknown = JsonConverter.settingsToJsObject(settings);
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
        let settings: Settings = new Settings();
        SettingsSerializer.fromJson(settings, jsObject);
        return settings;
    }

    /**
     * @target web
     */
    public static jsObjectToMidiFile(midi: any): MidiFile {
        let midi2: MidiFile = new MidiFile();
        midi2.division = midi.division;
        let midiEvents: any[] = midi.events;
        for (let midiEvent of midiEvents) {
            let midiEvent2: MidiEvent = JsonConverter.jsObjectToMidiEvent(midiEvent);
            midi2.events.push(midiEvent2);
        }
        return midi2;
    }

    /**
     * @target web
     */
    public static jsObjectToMidiEvent(midiEvent: any): MidiEvent {
        let track: number = midiEvent.track;
        let tick: number = midiEvent.tick;
        let message: number = midiEvent.message;
        let midiEvent2: MidiEvent;
        switch (midiEvent.type) {
            case 'SystemExclusiveEvent':
                midiEvent2 = new SystemExclusiveEvent(track, tick, 0, 0, midiEvent.data);
                midiEvent2.message = message;
                break;
            case 'MetaDataEvent':
                midiEvent2 = new MetaDataEvent(track, tick, 0, 0, midiEvent.data);
                midiEvent2.message = message;
                break;
            case 'MetaNumberEvent':
                midiEvent2 = new MetaNumberEvent(track, tick, 0, 0, midiEvent.value);
                midiEvent2.message = message;
                break;
            case 'Midi20PerNotePitchBendEvent':
                midiEvent2 = new Midi20PerNotePitchBendEvent(track, tick, 0, midiEvent.noteKey, midiEvent.pitch);
                midiEvent2.message = message;
                break;
            default:
                midiEvent2 = new MidiEvent(track, tick, 0, 0, 0);
                midiEvent2.message = message;
                break;
        }
        return midiEvent2;
    }

    /**
     * @target web
     */
    public static midiFileToJsObject(midi: MidiFile): unknown {
        let midi2: any = {} as any;
        midi2.division = midi.division;
        let midiEvents: unknown[] = [];
        midi2.events = midiEvents;
        for (let midiEvent of midi.events) {
            midiEvents.push(JsonConverter.midiEventToJsObject(midiEvent));
        }
        return midi2;
    }

    /**
     * @target web
     */
    public static midiEventToJsObject(midiEvent: MidiEvent): unknown {
        let midiEvent2: any = {} as any;
        midiEvent2.track = midiEvent.track;
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
        return midiEvent2;
    }
}
