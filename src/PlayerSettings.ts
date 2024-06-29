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
     * The wavelength of the note-wide vibrato in midi ticks.
     * @default 480
     */
    public noteWideLength: number = 480;

    /**
     * The amplitude for the note-wide vibrato in semitones.
     * @default 2
     */
    public noteWideAmplitude: number = 2;

    /**
     * The wavelength of the note-slight vibrato in midi ticks.
     * @default 480
     */
    public noteSlightLength: number = 480;

    /**
     * The amplitude for the note-slight vibrato in semitones.
     * @default 2
     */
    public noteSlightAmplitude: number = 2;

    /**
     * The wavelength of the beat-wide vibrato in midi ticks.
     * @default 240
     */
    public beatWideLength: number = 240;

    /**
     * The amplitude for the beat-wide vibrato in semitones.
     * @default 3
     */
    public beatWideAmplitude: number = 3;

    /**
     * The wavelength of the beat-slight vibrato in midi ticks.
     * @default 240
     */
    public beatSlightLength: number = 240;

    /**
     * The amplitude for the beat-slight vibrato in semitones.
     * @default 3
     */
    public beatSlightAmplitude: number = 3;
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
     * @default 6
     */
    public simpleSlidePitchOffset: number = 6;

    /**
     * Gets or sets the percentage which the simple slides should take up
     * from the whole note. for "slide into" effects the slide will take place
     * from time 0 where the note is plucked to 25% of the overall note duration.
     * For "slide out" effects the slide will start 75% and finish at 100% of the overall
     * note duration.
     * @default 0.25
     */
    public simpleSlideDurationRatio: number = 0.25;

    /**
     * Gets or sets the percentage which the legato and shift slides should take up
     * from the whole note. For a value 0.5 the sliding will start at 50% of the overall note duration
     * and finish at 100%
     * @default 0.5
     */
    public shiftSlideDurationRatio: number = 0.5;
}

/**
 * Lists the different modes how alphaTab will play the generated audio.
 * @target web
 */
export enum PlayerOutputMode {
    /**
     * If [audio worklets](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_AudioWorklet) are available, they are used. 
     * If not fallback to the [ScriptProcessorNode](https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode)
     */
    WebAudioAudioWorklets,
    /**
     * Using the [ScriptProcessorNode](https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode) for playback.
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
     * When the player is enabled the soundfont from this URL will be loaded automatically after the player is ready.   
     * @since 0.9.6
     * @target web
     * @default null
     */
    public soundFont: string | null = null;

    /**
     * When the player is active, it by default automatically scrolls the browser window to the currently played bar. This setting 
     * defines which elements should be scrolled to bring the played bar into the view port. By default scrolling happens on the `html,body`
     * selector. 
     * @target web
     * @json_read_only
     * @since 0.9.6
     * @default 'html,body'
     */
    public scrollElement: string | HTMLElement = 'html,body';

    /**
     * Controls how alphaTab will play the audio samples in the browser.
     * @target web
     * @since 1.3.0
     * @default PlayerOutputMode.WebAudioAudioWorklets
     */
    public outputMode: PlayerOutputMode = PlayerOutputMode.WebAudioAudioWorklets;

    /**
     * This setting configures whether the player feature is enabled or not. Depending on the platform enabling the player needs some additional actions of the developer. 
     * For the JavaScript version the {@link PlayerSettings.soundFont} property must be set to the URL of the sound font that should be used or it must be loaded manually via API. 
     * For .net manually the soundfont must be loaded. 
     *
     * AlphaTab does not ship a default UI for the player. The API must be hooked up to some UI controls to allow the user to interact with the player.
     * @since 0.9.6
     * @default false
     */
    public enablePlayer: boolean = false;

    /**
     * This setting configures whether the playback cursors are shown or not. In case a developer decides to built an own cursor system the default one can be disabled with this setting. Enabling the cursor also requires the player to be active. 
     * @since 0.9.6
     * @default true
     */
    public enableCursor: boolean = true;

    /**
     * This setting configures whether the beat cursor is animated smoothly or whether it is ticking from beat to beat. 
     * The animation of the cursor might not be available on all targets so it might not have any effect.
     * @since 1.2.3
     * @default true
     */
    public enableAnimatedBeatCursor: boolean = true;

    /**
     * This setting configures whether the note elements are highlighted during playback.
     * The highlighting of elements might not be available on all targets and render engine, so it might not have any effect.
     * @since 1.2.3
     * @default true
     */
    public enableElementHighlighting: boolean = true;

    /**
     * This setting configures whether alphaTab provides the default user interaction features like selection of the playback range and "seek on click".
     * By default users can select the desired playback range with the mouse and also jump to individual beats by click. This behavior can be contolled w1ith this setting. 
     * @since 0.9.7
     * @default true
     */
    public enableUserInteraction: boolean = true;

    /**
     * When alphaTab does an auto-scrolling to the displayed bar, it will try to align the view port to the displayed bar. If due to 
     * some layout specifics or for aesthetics a small padding is needed, this setting allows an additional X-offset that is added to the 
     * scroll position. 
     * @since 0.9.6
     * @default 0
     */
    public scrollOffsetX: number = 0;

    /**
     * When alphaTab does an auto-scrolling to the displayed bar, it will try to align the view port to the displayed bar. If due to 
     * some layout specifics or for aesthetics a small padding is needed, this setting allows an additional Y-offset that is added to the 
     * scroll position. 
     * @since 0.9.6
     * @default 0
     */
    public scrollOffsetY: number = 0;

    /**
     * This setting controls how alphaTab behaves for scrolling.
     * @since 0.9.6
     * @default ScrollMode.Continuous
     */
    public scrollMode: ScrollMode = ScrollMode.Continuous;

    /**
     * If possible from the platform, alphaTab will try to do a smooth scrolling to the played bar.
     * This setting defines the speed of scrolling in milliseconds.
     * Note that {@link PlayerSettings.nativeBrowserSmoothScroll} must be set to `false` for this to have an effect.
     * @since 0.9.6
     * @default 300
     */
    public scrollSpeed: number = 300;

    /**
     * This setting configures whether the [native browser feature](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo)
     * for smooth scrolling should be used over a custom animation.
     * If this setting is enabled, options like {@link PlayerSettings.scrollSpeed} will not have an effect anymore.
     * @since 1.2.3
     * @target web
     * @default true
     */
    public nativeBrowserSmoothScroll: boolean = true;

    /**
     * If the display mode `songbook` is enabled, this has an effect on the way bends are played. For songbook bends the bend is done very quickly at the end or start of the beat. 
     * This setting defines the play duration for those bends in milliseconds. This duration is in milliseconds unlike some other settings which are in midi ticks. The reason is that on songbook bends, 
     * the bends should always be played in the same speed, regardless of the song tempo. Midi ticks are tempo dependent. 
     * @since 0.9.6
     * @default 75
     */
    public songBookBendDuration: number = 75;

    /**
     * If the display mode `songbook` is enabled, this has an effect on the way whammy dips are played. For songbook dips the whammy is pressed very quickly at the start of the beat. 
     * This setting defines the play duration for those whammy bars in milliseconds. This duration is in milliseconds unlike some other settings which are in midi ticks. The reason is that on songbook dips, 
     * the whammy should always be pressed in the same speed, regardless of the song tempo. Midi ticks are tempo dependent. 
     * @since 0.9.6
     * @default 150
     */
    public songBookDipDuration: number = 150;

    /**
     * AlphaTab supports 4 types of vibratos, for each vibrato the amplitude and the wavelength can be configured. The amplitude controls how many semitones
     * the vibrato changes the pitch up and down while playback. The wavelength controls how many midi ticks it will take to complete one up and down vibrato.
     * The 4 vibrato types are: 
     * 
     * 1. Beat Slight - A fast vibrato on the whole beat. This vibrato is usually done with the whammy bar.
     * 2. Beat Wide - A slow vibrato on the whole beat. This vibrato is usually done with the whammy bar.
     * 3. Note Slight - A fast vibrato on a single note. This vibrato is usually done with the finger on the fretboard.
     * 4. Note Wide - A slow vibrato on a single note. This vibrato is usually done with the finger on the fretboard.
     * @json_partial_names
     * @since 0.9.6
     */
    public readonly vibrato: VibratoPlaybackSettings = new VibratoPlaybackSettings();

    /**
     * AlphaTab supports various types of slides which can be grouped into 3 types: 
     * 
     * * Shift Slides
     * * Legato Slides
     * 
     * * Slide into from below
     * * Slide into from above
     * * Slide out to below
     * * Slide out to above 
     * 
     * * Pick Slide out to above
     * * Pick Slide out to below
     *  
     * For the first 2 groups the audio generation can be adapted. For the pick slide the audio generation cannot be adapted
     * as there is no mechanism yet in alphaTab to play pick slides to make them sound real. 
     * 
     * For the first group only the duration or start point of the slide can be configured while for the second group
     * the duration/start-point and the pitch offset can be configured. 
     * @json_partial_names
     * @since 0.9.6
     */
    public readonly slide: SlidePlaybackSettings = new SlidePlaybackSettings();

    /**
     * If this setting is enabled alphaTab will play the triplet feels accordingly, if it is disabled the triplet feel is only displayed but not played. 
     * @since 0.9.6
     * @default true
     */
    public playTripletFeel: boolean = true;

    /**
     * Gets or sets how many milliseconds of audio samples should be buffered in total. 
     * * Larger buffers cause a delay from when audio settings like volumes will be applied. 
     * * Smaller buffers can cause audio crackling due to constant buffering that is happening.
     * This buffer size can be changed whenever needed.
     * @since 1.2.3
     * @default 500
     */
    public bufferTimeInMilliseconds:number = 500;
}
