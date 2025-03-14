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
 * @json
 * @json_declaration
 */
export class VibratoPlaybackSettings {
    /**
     * Gets or sets the wavelength of the note-wide vibrato in midi ticks.
     */
    public noteWideLength: number = 240;

    /**
     * Gets or sets the amplitude for the note-wide vibrato in semitones.
     */
    public noteWideAmplitude: number = 1;

    /**
     * Gets or sets the wavelength of the note-slight vibrato in midi ticks.
     */
    public noteSlightLength: number = 360;

    /**
     * Gets or sets the amplitude for the note-slight vibrato in semitones.
     */
    public noteSlightAmplitude: number = 0.5;

    /**
     * Gets or sets the wavelength of the beat-wide vibrato in midi ticks.
     */
    public beatWideLength: number = 480;

    /**
     * Gets or sets the amplitude for the beat-wide vibrato in semitones.
     */
    public beatWideAmplitude: number = 2;

    /**
     * Gets or sets the wavelength of the beat-slight vibrato in midi ticks.
     */
    public beatSlightLength: number = 480;

    /**
     * Gets or sets the amplitude for the beat-slight vibrato in semitones.
     */
    public beatSlightAmplitude: number = 2;
}

/**
 * This object defines the details on how to generate the slide effects.
 * @json
 * @json_declaration
 */
export class SlidePlaybackSettings {
    /**
     * Gets or sets 1/4 tones (bend value) offset that
     * simple slides like slide-out-below or slide-in-above use.
     */
    public simpleSlidePitchOffset: number = 6;

    /**
     * Gets or sets the percentage which the simple slides should take up
     * from the whole note. for "slide into" effects the slide will take place
     * from time 0 where the note is plucked to 25% of the overall note duration.
     * For "slide out" effects the slide will start 75% and finish at 100% of the overall
     * note duration.
     */
    public simpleSlideDurationRatio: number = 0.25;

    /**
     * Gets or sets the percentage which the legato and shift slides should take up
     * from the whole note. For a value 0.5 the sliding will start at 50% of the overall note duration
     * and finish at 100%
     */
    public shiftSlideDurationRatio: number = 0.5;
}

/**
 * Lists the different modes how alphaTab will play the generated audio.
 * @target web
 */
export enum PlayerOutputMode {
    /**
     * If audio worklets are available in the browser, they will be used for playing the audio.
     * It will fallback to the ScriptProcessor output if unavailable. 
     */
    WebAudioAudioWorklets,
    /**
     * Uses the legacy ScriptProcessor output which might perform worse.
     */
    WebAudioScriptProcessor
}

/**
 * The player settings control how the audio playback and UI is behaving.
 * @json
 * @json_declaration
 */
export class PlayerSettings {
    /**
     * Gets or sets the URL of the sound font to be loaded.
     */
    public soundFont: string | null = null;

    /**
     * Gets or sets the element that should be used for scrolling.
     * @target web
     * @json_read_only
     * @json_raw
     */
    public scrollElement: string | HTMLElement = 'html,body';

    /**
     * Gets or sets which output mode alphaTab should use.
     * @target web
     */
    public outputMode: PlayerOutputMode = PlayerOutputMode.WebAudioAudioWorklets;

    /**
     * Gets or sets whether the player should be enabled.
     */
    public enablePlayer: boolean = false;

    /**
     * Gets or sets whether playback cursors should be displayed.
     */
    public enableCursor: boolean = true;

    /**
     * Gets or sets whether the beat cursor should be animated or just ticking.
     */
    public enableAnimatedBeatCursor: boolean = true;

    /**
     * Gets or sets whether the notation elements of the currently played beat should be
     * highlighted.
     */
    public enableElementHighlighting: boolean = true;

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
     * Gets or sets whether the native browser smooth scroll mechanism should be used over a custom animation.
     * @target web
     */
    public nativeBrowserSmoothScroll: boolean = true;

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
     * @json_partial_names
     */
    public readonly vibrato: VibratoPlaybackSettings = new VibratoPlaybackSettings();

    /**
     * Gets or sets the setitngs on how the slide audio is generated.
     * @json_partial_names
     */
    public readonly slide: SlidePlaybackSettings = new SlidePlaybackSettings();

    /**
     * Gets or sets whether the triplet feel should be applied/played during audio playback.
     */
    public playTripletFeel: boolean = true;

    /**
     * Gets or sets how many milliseconds of audio samples should be buffered in total. 
     * Larger buffers cause a delay from when audio settings like volumes will be applied. 
     * Smaller buffers can cause audio crackling due to constant buffering that is happening.
     */
    public bufferTimeInMilliseconds:number = 500;
}
