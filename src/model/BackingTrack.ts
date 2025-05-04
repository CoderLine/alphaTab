/**
 * Holds information about the backing track which can be played instead of synthesized audio.
 * @json
 * @json_strict
 */
export class BackingTrack {

    /**
     * The data of the raw audio file to be used for playback.
     * @json_ignore
     */
    public rawAudioFile: Uint8Array | undefined;

    /**
     * The number of frames the audio should be shifted to align with the song. 
     * (e.g. negative values allow skipping potential silent parts at the start of the file and directly start with the first note).
     */
    public framePadding:number = 0;
}
