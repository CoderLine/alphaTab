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
}
