/**
 * Lists all modes how alphaTab can scroll the container during playback.
 */
export enum ScrollMode {
    /**
     * Do not scroll automatically
     */
    Off,
    /**
     * Scrolling happens as soon the offsets of the cursors change.
     */
    Continuous,
    /**
     * Scrolling happens as soon the cursors exceed the displayed range.
     */
    OffScreen
}

/**
 * This object defines the details on how to generate the vibrato effects.
 */
// @json
export class VibratoPlaybackSettings {
    /**
     * Gets or sets the wavelength of the note-wide vibrato in midi ticks.
     */
    public noteWideLength: number = 480;

    /**
     * Gets or sets the amplitude for the note-wide vibrato in semitones.
     */
    public noteWideAmplitude: number = 2;

    /**
     * Gets or sets the wavelength of the note-slight vibrato in midi ticks.
     */
    public noteSlightLength: number = 480;

    /**
     * Gets or sets the amplitude for the note-slight vibrato in semitones.
     */
    public noteSlightAmplitude: number = 2;

    /**
     * Gets or sets the wavelength of the beat-wide vibrato in midi ticks.
     */
    public beatWideLength: number = 240;

    /**
     * Gets or sets the amplitude for the beat-wide vibrato in semitones.
     */
    public beatWideAmplitude: number = 3;

    /**
     * Gets or sets the wavelength of the beat-slight vibrato in midi ticks.
     */
    public beatSlightLength: number = 240;

    /**
     * Gets or sets the amplitude for the beat-slight vibrato in semitones.
     */
    public beatSlightAmplitude: number = 3;
}

/**
 * The player settings control how the audio playback and UI is behaving.
 */
// @json
export class PlayerSettings {
    /**
     * Gets or sets the URl of the sound font to be loaded.
     */
    public soundFont: string | null = null;

    /**
     * Gets or sets the element that should be used for scrolling.
     */
    public scrollElement: string = 'html,body';

    /**
     * Gets or sets whether the player should be enabled.
     */
    public enablePlayer: boolean = false;

    /**
     * Gets or sets whether playback cursors should be displayed.
     */
    public enableCursor: boolean = true;

    /**
     * Gets or sets alphaTab should provide user interaction features to
     * select playback ranges and jump to the playback position by click (aka. seeking).
     */
    public enableUserInteraction: boolean = true;

    /**
     * Gets or sets the X-offset to add when scrolling.
     */
    public scrollOffsetX: number = 0;

    /**
     * Gets or sets the Y-offset to add when scrolling
     */
    public scrollOffsetY: number = 0;

    /**
     * Gets or sets the mode how to scroll.
     */
    public scrollMode: ScrollMode = ScrollMode.Continuous;

    /**
     * Gets or sets how fast the scrolling to the new position should happen (in milliseconds)
     */
    public scrollSpeed: number = 300;

    /**
     * Gets or sets the bend duration in milliseconds for songbook bends.
     */
    public songBookBendDuration: number = 75;

    /**
     * Gets or sets the duration of whammy dips in milliseconds for songbook whammys.
     */
    public songBookDipDuration: number = 150;

    /**
     * Gets or sets the settings on how the vibrato audio is generated.
     */
    public readonly vibrato: VibratoPlaybackSettings = new VibratoPlaybackSettings();

    /**
     * Gets or sets whether the triplet feel should be applied/played during audio playback.
     */
    public playTripletFeel: boolean = true;
}
