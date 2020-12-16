import { MetaDataEvent } from '@src/midi/MetaDataEvent';
import { MetaNumberEvent } from '@src/midi/MetaNumberEvent';
import { MidiEvent } from '@src/midi/MidiEvent';
import { SystemExclusiveEvent } from '@src/midi/SystemExclusiveEvent';
import { MidiFile } from '@src/midi/MidiFile';
import { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { Midi20PerNotePitchBendEvent } from '@src/midi/Midi20ChannelVoiceEvent';

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
        // TODO: new json serializer
        return score;
    }

    /**
     * Converts the given JSON string back to a {@link Score} object.
     * @param json The JSON string that was created via {@link Score}
     * @param settings The settings to use during conversion.
     * @returns The converted score object.
     */
    public static jsonToScore(json: string, settings?: Settings): Score {
        return JsonConverter.jsObjectToScore(settings);
    }

    /**
     * Converts the given JavaScript object into a score object.
     * @param jsObject The javascript object created via {@link Score}
     * @pas The settings to use during conversion.
     * @returns The converted score object.
     */
    public static jsObjectToScore(jsObject: any, settings?: Settings): Score {
        let score2: Score = new Score();

        score2.finish(settings ?? new Settings());
        return score2;
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
