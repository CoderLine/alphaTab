/**
 * This public class stores the midi specific information of a track needed
 * for playback.
 * @json
 */
export class PlaybackInformation {
    /**
     * Gets or sets the volume (0-16)
     */
    public volume: number = 15;

    /**
     * Gets or sets the balance (0-16; 8=center)
     */
    public balance: number = 8;

    /**
     * Gets or sets the midi port to use.
     */
    public port: number = 1;

    /**
     * Gets or sets the midi program to use.
     */
    public program: number = 0;

    /**
     * Gets or sets the primary channel for all normal midi events.
     */
    public primaryChannel: number = 0;

    /**
     * Gets or sets the secondary channel for special midi events.
     */
    public secondaryChannel: number = 0;

    /**
     * Gets or sets whether the track is muted.
     */
    public isMute: boolean = false;

    /**
     * Gets or sets whether the track is playing alone.
     */
    public isSolo: boolean = false;
}
