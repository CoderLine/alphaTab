import { DynamicValue } from '@src/model/DynamicValue';

/**
 * A handler is responsible for writing midi events to a custom structure
 */
export interface IMidiFileHandler {
    /**
     * Adds a time signature to the generated midi file
     * @param tick The midi ticks when this event should be happening.
     * @param timeSignatureNumerator The time signature numerator
     * @param timeSignatureDenominator The time signature denominator
     */
    addTimeSignature(tick: number, timeSignatureNumerator: number, timeSignatureDenominator: number): void;

    /**
     * Adds a rest to the generated midi file.
     * @param track The midi track on which the rest should be "played".
     * @param tick The midi ticks when the rest is "playing".
     * @param channel The midi channel on which the rest should be "played".
     */
    addRest(track: number, tick: number, channel: number): void;

    /**
     * Adds a note to the generated midi file
     * @param track The midi track on which the note should be played.
     * @param start The midi ticks when the note should start playing.
     * @param length The duration the note in midi ticks.
     * @param key The key of the note to play
     * @param dynamicValue The dynamic which should be applied to the note.
     * @param channel The midi channel on which the note should be played.
     */
    addNote(
        track: number,
        start: number,
        length: number,
        key: number,
        dynamicValue: DynamicValue,
        channel: number
    ): void;

    /**
     * Adds a control change to the generated midi file.
     * @param track The midi track on which the controller should change.
     * @param tick The midi ticks when the controller should change.
     * @param channel The midi channel on which the controller should change.
     * @param controller The midi controller that should change.
     * @param value The value to which the midi controller should change
     */
    addControlChange(track: number, tick: number, channel: number, controller: number, value: number): void;

    /**
     * Add a program change to the generated midi file
     * @param track The midi track on which the program should change.
     * @param tick The midi ticks when the program should change.
     * @param channel The midi channel on which the program should change.
     * @param program The new program for the selected track and channel.
     */
    addProgramChange(track: number, tick: number, channel: number, program: number): void;

    /**
     * Add a tempo change to the generated midi file.
     * @param tick The midi ticks when the tempo should change change.
     * @param tempo The tempo as BPM
     */
    addTempo(tick: number, tempo: number): void;

    /**
     * Add a bend specific to a note to the generated midi file.
     * The note does not need to be started, if this event is signaled, the next time a note 
     * on this channel and key is played it will be affected. The note bend is cleared on a note-off for this key. 
     * @param track The midi track on which the bend should change.
     * @param tick The midi ticks when the bend should change.
     * @param channel The midi channel on which the bend should change.
     * @param channel The key of the note that should be affected by the bend. 
     * @param value The new bend for the selected note.
     */
    addNoteBend(track: number, tick: number, channel: number, key: number, value: number): void;

    /**
     * Add a bend to the generated midi file.
     * @param track The midi track on which the bend should change.
     * @param tick The midi ticks when the bend should change.
     * @param channel The midi channel on which the bend should change.
     * @param value The new bend for the selected track and channel.
     */
    addBend(track: number, tick: number, channel: number, value: number): void;

    /**
     * Indicates that the track is finished on the given ticks.
     * @param track The track that was finished.
     * @param tick The end tick for this track.
     */
    finishTrack(track: number, tick: number): void;
}
