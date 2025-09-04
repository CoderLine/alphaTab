import type { Hydra } from '@src/synth/soundfont/Hydra';
import type { SynthEvent } from '@src/synth/synthesis/SynthEvent';

/**
 * Classes implementing this interface can act as main audio synthesis engine
 * within alphaSynth.
 */
export interface IAudioSampleSynthesizer {
    /**
     * The master volume to produce.
     */
    masterVolume: number;

    /**
     * The volume of metronome ticks.
     */
    metronomeVolume: number;

    /**
     * The output sample rate which is produced.
     */
    readonly outSampleRate: number;

    /**
     * The current tempo according to the processed midi events (used for metronome event generation)
     */
    readonly currentTempo: number;
    /**
     * The current time signature numerator according to the processed midi events  (used for metronome event generation)
     */
    readonly timeSignatureNumerator: number;
    /**
     * The current time signature denominator according to the processed midi events  (used for metronome event generation)
     */
    readonly timeSignatureDenominator: number;

    /**
     * The number of voices which are currently active in the syntheiszer and still producing audio.
     */
    readonly activeVoiceCount: number;

    /**
     * Ensures for all active notes a note-off is issued to stop playing the keys.
     * @param immediate Whether the stop should happen immediately or with sustain->release.
     */
    noteOffAll(immediate: boolean): void;

    /**
     * Stop all playing notes immediatly and reset all channel parameters but keeps user
     * defined settings
     */
    resetSoft(): void;

    /**
     * Resets all loaded presets.
     */
    resetPresets(): void;

    /**
     * Loads the presets from the given SoundFont hydra structure.
     * @param hydra  The SoundFont hydra structure.
     * @param instrumentPrograms The used instrument programs to load the samples for.
     * @param percussionKeys The instrument keys used.
     * @param append Whether the presets should be appended or whether they should replace all loaded ones.
     */
    loadPresets(hydra: Hydra, instrumentPrograms: Set<number>, percussionKeys: Set<number>, append: boolean): void;

    /**
     * Configures the channel used to generate metronome sounds.
     * @param metronomeVolume The volume for the channel.
     */
    setupMetronomeChannel(metronomeVolume: number): void;

    /**
     * Synthesizes the given number of samples without producing an output (e.g. on seeking)
     * @param sampleCount The number of samples to synthesize.
     */
    synthesizeSilent(sampleCount: number): void;

    /**
     * Processes the given synth event.
     * @param synthEvent The synth event.
     */
    dispatchEvent(synthEvent: SynthEvent): void;

    /**
     * Synthesizes the given number of samples into the provided output buffer.
     * @param buffer The buffer to fill.
     * @param bufferPos The offset in the buffer to start writing into.
     * @param sampleCount The number of samples to synthesize.
     */
    synthesize(buffer: Float32Array, bufferPos: number, sampleCount: number): SynthEvent[];

    /**
     * Applies the given transposition pitches used for general pitch changes that should be applied to the song.
     * Used for general transpositions applied to the file.
     * @param transpositionPitches A map defining for a given list of midi channels the number of semitones that should be adjusted.
     */
    applyTranspositionPitches(transpositionPitches: Map<number, number>): void;
    /**
     * Sets the transposition pitch of a given channel. This pitch is additionally applied beside the
     * ones applied already via {@link applyTranspositionPitches}.
     * @param channel The channel number
     * @param semitones The number of semitones to apply as pitch offset.
     */
    setChannelTranspositionPitch(channel: number, semitones: number): void;

    /**
     * Sets the mute state of a channel.
     * @param channel The channel number
     * @param mute true if the channel should be muted, otherwise false.
     */
    channelSetMute(channel: number, mute: boolean): void;

    /**
     * Gets the solo state of a channel.
     * @param channel The channel number
     * @param solo true if the channel should be played solo, otherwise false.
     */
    channelSetSolo(channel: number, solo: boolean): void;

    /**
     * Resets the mute/solo state of all channels
     */
    resetChannelStates(): void;

    /**
     * Gets or sets the current and initial volume of the given channel.
     * @param channel The channel number.
     * @param volume The volume of of the channel (0.0-1.0)
     */
    channelSetMixVolume(channel: number, volume: number): void;

    /**
     * Checks whether the synth has loaded the samples for a given midi program.
     * @param program The program to check.
     */
    hasSamplesForProgram(program: number): boolean;
    
    /**
     * Checks whether the synth has loaded the samples for a given percussion key.
     * @param key The midi key defining the percussion instrument.
     */
    hasSamplesForPercussion(key: number): boolean;
}
