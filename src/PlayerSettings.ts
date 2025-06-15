/**
 * Lists all modes how alphaTab can scroll the container during playback.
 */
export enum ScrollMode {
    /**
     * Do not scroll automatically
     */
    Off = 0,
    /**
     * Scrolling happens as soon the offsets of the cursors change.
     */
    Continuous = 1,
    /**
     * Scrolling happens as soon the cursors exceed the displayed range.
     */
    OffScreen = 2
}

/**
 * This object defines the details on how to generate the vibrato effects.
 * @json
 * @json_declaration
 */
export class VibratoPlaybackSettings {
    /**
     * The wavelength of the note-wide vibrato in midi ticks.
     * @defaultValue `240`
     */
    public noteWideLength: number = 240;

    /**
     * The amplitude for the note-wide vibrato in semitones.
     * @defaultValue `1`
     */
    public noteWideAmplitude: number = 1;

    /**
     * The wavelength of the note-slight vibrato in midi ticks.
     * @defaultValue `360`
     */
    public noteSlightLength: number = 360;

    /**
     * The amplitude for the note-slight vibrato in semitones.
     * @defaultValue `0.5`
     */
    public noteSlightAmplitude: number = 0.5;

    /**
     * The wavelength of the beat-wide vibrato in midi ticks.
     * @defaultValue `480`
     */
    public beatWideLength: number = 480;

    /**
     * The amplitude for the beat-wide vibrato in semitones.
     * @defaultValue `2`
     */
    public beatWideAmplitude: number = 2;

    /**
     * The wavelength of the beat-slight vibrato in midi ticks.
     * @defaultValue `480`
     */
    public beatSlightLength: number = 480;

    /**
     * The amplitude for the beat-slight vibrato in semitones.
     * @defaultValue `2`
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
     * @defaultValue `6`
     */
    public simpleSlidePitchOffset: number = 6;

    /**
     * The percentage which the simple slides should take up
     * from the whole note. for "slide into" effects the slide will take place
     * from time 0 where the note is plucked to 25% of the overall note duration.
     * For "slide out" effects the slide will start 75% and finish at 100% of the overall
     * note duration.
     * @defaultValue `0.25`
     */
    public simpleSlideDurationRatio: number = 0.25;

    /**
     * The percentage which the legato and shift slides should take up
     * from the whole note. For a value 0.5 the sliding will start at 50% of the overall note duration
     * and finish at 100%
     * @defaultValue `0.5`
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
    WebAudioAudioWorklets = 0,
    /**
     * Uses the legacy ScriptProcessor output which might perform worse.
     */
    WebAudioScriptProcessor = 1
}

/**
 * Lists the different modes how the internal alphaTab player (and related cursor behavior) is working.
 */
export enum PlayerMode {
    /**
     * The player functionality is fully disabled.
     */
    Disabled = 0,
    /**
     * The player functionality is enabled.
     * If the loaded file provides a backing track, it is used for playback.
     * If no backing track is provided, the midi synthesizer is used.
     */
    EnabledAutomatic = 1,
    /**
     * The player functionality is enabled and the synthesizer is used (even if a backing track is embedded in the file).
     */
    EnabledSynthesizer = 2,
    /**
     * The player functionality is enabled. If the input data model has no backing track configured, the player might not work as expected (as playback completes instantly).
     */
    EnabledBackingTrack = 3,
    /**
     * The player functionality is enabled and an external audio/video source is used as time axis.
     * The related player APIs need to be used to update the current position of the external audio source within alphaTab.
     */
    EnabledExternalMedia = 4
}

/**
 * The player settings control how the audio playback and UI is behaving.
 * @json
 * @json_declaration
 */
export class PlayerSettings {
    /**
     * The sound font file to load for the player.
     * @target web
     * @since 0.9.6
     * @defaultValue `null`
     * @category Player - JavaScript Specific
     * @remarks
     * When the player is enabled the soundfont from this URL will be loaded automatically after the player is ready.
     */
    public soundFont: string | null = null;

    /**
     * The element to apply the scrolling on.
     * @target web
     * @json_read_only
     * @json_raw
     * @since 0.9.6
     * @defaultValue `html,body`
     * @category Player - JavaScript Specific
     * @remarks
     * When the player is active, it by default automatically scrolls the browser window to the currently played bar. This setting
     * defines which elements should be scrolled to bring the played bar into the view port. By default scrolling happens on the `html,body`
     * selector.
     */
    public scrollElement: string | HTMLElement = 'html,body';

    /**
     * The mode used for playing audio samples
     * @target web
     * @since 1.3.0
     * @defaultValue `PlayerOutputMode.WebAudioAudioWorklets`
     * @category Player - JavaScript Specific
     * @remarks
     * Controls how alphaTab will play the audio samples in the browser.
     */
    public outputMode: PlayerOutputMode = PlayerOutputMode.WebAudioAudioWorklets;

    /**
     * Whether the player should be enabled.
     * @since 0.9.6
     * @defaultValue `false`
     * @category Player
     * @deprecated Use {@link playerMode} instead.
     * @remarks
     * This setting configures whether the player feature is enabled or not. Depending on the platform enabling the player needs some additional actions of the developer.
     * For the JavaScript version the [player.soundFont](/docs/reference/settings/player/soundfont) property must be set to the URL of the sound font that should be used or it must be loaded manually via API.
     * For .net manually the soundfont must be loaded.
     *
     * AlphaTab does not ship a default UI for the player. The API must be hooked up to some UI controls to allow the user to interact with the player.
     */
    public enablePlayer: boolean = false;

    /**
     * Whether the player should be enabled and which mode it should use.
     * @since 1.6.0
     * @defaultValue `PlayerMode.Disabled`
     * @category Player
     * @remarks
     * This setting configures whether the player feature is enabled or not. Depending on the platform enabling the player needs some additional actions of the developer.
     * 
     * **Synthesizer**
     * 
     * If the synthesizer is used (via {@link PlayerMode.EnabledAutomatic} or {@link PlayerMode.EnabledSynthesizer}) a sound font is needed so that the midi synthesizer can produce the audio samples.
     * 
     * For the JavaScript version the [player.soundFont](/docs/reference/settings/player/soundfont) property must be set to the URL of the sound font that should be used or it must be loaded manually via API.
     * For .net manually the soundfont must be loaded.
     * 
     * **Backing Track**
     * 
     * For a built-in backing track of the input file no additional data needs to be loaded (assuming everything is filled via the input file). 
     * Otherwise the `score.backingTrack` needs to be filled before loading and the related sync points need to be configured.
     * 
     * **External Media**
     * 
     * For synchronizing alphaTab with an external media no data needs to be loaded into alphaTab. The configured sync points on the MasterBars are used
     * as reference to synchronize the external media with the internal time axis. Then the related APIs on the AlphaTabApi object need to be used
     * to update the playback state and exterrnal audio position during playback.
     * 
     * **User Interface**
     *
     * AlphaTab does not ship a default UI for the player. The API must be hooked up to some UI controls to allow the user to interact with the player.
     */
    public playerMode: PlayerMode = PlayerMode.Disabled;

    /**
     * Whether playback cursors should be displayed.
     * @since 0.9.6
     * @defaultValue `true` (if player is not disabled)
     * @category Player
     * @remarks
     * This setting configures whether the playback cursors are shown or not. In case a developer decides to built an own cursor system the default one can be disabled with this setting. Enabling the cursor also requires the player to be active.
     */
    public enableCursor: boolean = true;

    /**
     * Whether the beat cursor should be animated or just ticking.
     * @since 1.2.3
     * @defaultValue `true`
     * @category Player
     * @remarks
     * This setting configures whether the beat cursor is animated smoothly or whether it is ticking from beat to beat.
     * The animation of the cursor might not be available on all targets so it might not have any effect.
     */
    public enableAnimatedBeatCursor: boolean = true;

    /**
     * Whether the notation elements of the currently played beat should be highlighted.
     * @since 1.2.3
     * @defaultValue `true`
     * @category Player
     * @remarks
     * This setting configures whether the note elements are highlighted during playback.
     * The highlighting of elements might not be available on all targets and render engine, so it might not have any effect.
     */
    public enableElementHighlighting: boolean = true;

    /**
     * Whether the default user interaction behavior should be active or not.
     * @since 0.9.7
     * @defaultValue `true`
     * @category Player
     * @remarks
     * This setting configures whether alphaTab provides the default user interaction features like selection of the playback range and "seek on click".
     * By default users can select the desired playback range with the mouse and also jump to individual beats by click. This behavior can be contolled with this setting.
     */
    public enableUserInteraction: boolean = true;

    /**
     * The X-offset to add when scrolling.
     * @since 0.9.6
     * @defaultValue `0`
     * @category Player
     * @remarks
     * When alphaTab does an auto-scrolling to the displayed bar, it will try to align the view port to the displayed bar. If due to
     * some layout specifics or for aesthetics a small padding is needed, this setting allows an additional X-offset that is added to the
     * scroll position.
     */
    public scrollOffsetX: number = 0;

    /**
     * The Y-offset to add when scrolling.
     * @since 0.9.6
     * @defaultValue `0`
     * @category Player
     * @remarks
     * When alphaTab does an auto-scrolling to the displayed bar, it will try to align the view port to the displayed bar. If due to
     * some layout specifics or for aesthetics a small padding is needed, this setting allows an additional Y-offset that is added to the
     * scroll position.
     */
    public scrollOffsetY: number = 0;

    /**
     * The mode how to scroll.
     * @since 0.9.6
     * @defaultValue `ScrollMode.Continuous`
     * @category Player
     * @remarks
     * This setting controls how alphaTab behaves for scrolling.
     */
    public scrollMode: ScrollMode = ScrollMode.Continuous;

    /**
     * How fast the scrolling to the new position should happen.
     * @since 0.9.6
     * @defaultValue `300`
     * @category Player
     * @remarks
     * If possible from the platform, alphaTab will try to do a smooth scrolling to the played bar.
     * This setting defines the speed of scrolling in milliseconds.
     * Note that {@link nativeBrowserSmoothScroll} must be set to `false` for this to have an effect.
     */
    public scrollSpeed: number = 300;

    /**
     * Whether the native browser smooth scroll mechanism should be used over a custom animation.
     * @target web
     * @since 1.2.3
     * @defaultValue `true`
     * @category Player
     * @remarks
     * This setting configures whether the [native browser feature](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo)
     * for smooth scrolling should be used over a custom animation.
     * If this setting is enabled, options like {@link scrollSpeed} will not have an effect anymore.
     */
    public nativeBrowserSmoothScroll: boolean = true;

    /**
     * The bend duration in milliseconds for songbook bends.
     * @since 0.9.6
     * @defaultValue `75`
     * @category Player
     * @remarks
     * If the display mode `songbook` is enabled, this has an effect on the way bends are played. For songbook bends the bend is done very quickly at the end or start of the beat.
     * This setting defines the play duration for those bends in milliseconds. This duration is in milliseconds unlike some other settings which are in midi ticks. The reason is that on songbook bends,
     * the bends should always be played in the same speed, regardless of the song tempo. Midi ticks are tempo dependent.
     */
    public songBookBendDuration: number = 75;

    /**
     * The duration of whammy dips in milliseconds for songbook whammys.
     * @since 0.9.6
     * @defaultValue `150`
     * @category Player
     * @remarks
     * If the display mode `songbook` is enabled, this has an effect on the way whammy dips are played. For songbook dips the whammy is pressed very quickly at the start of the beat.
     * This setting defines the play duration for those whammy bars in milliseconds. This duration is in milliseconds unlike some other settings which are in midi ticks. The reason is that on songbook dips,
     * the whammy should always be pressed in the same speed, regardless of the song tempo. Midi ticks are tempo dependent.
     */
    public songBookDipDuration: number = 150;

    /**
     * The Vibrato settings allow control how the different vibrato types are generated for audio.
     * @json_partial_names
     * @since 0.9.6
     * @category Player
     * @remarks
     * AlphaTab supports 4 types of vibratos, for each vibrato the amplitude and the wavelength can be configured. The amplitude controls how many semitones
     * the vibrato changes the pitch up and down while playback. The wavelength controls how many midi ticks it will take to complete one up and down vibrato.
     * The 4 vibrato types are:
     *
     * 1. Beat Slight - A fast vibrato on the whole beat. This vibrato is usually done with the whammy bar.
     * 2. Beat Wide - A slow vibrato on the whole beat. This vibrato is usually done with the whammy bar.
     * 3. Note Slight - A fast vibrato on a single note. This vibrato is usually done with the finger on the fretboard.
     * 4. Note Wide - A slow vibrato on a single note. This vibrato is usually done with the finger on the fretboard.
     */
    public readonly vibrato: VibratoPlaybackSettings = new VibratoPlaybackSettings();

    /**
     * The slide settings allow control how the different slide types are generated for audio.
     * @json_partial_names
     * @since 0.9.6
     * @domWildcard
     * @category Player
     * @remarks
     * AlphaTab supports various types of slides which can be grouped into 3 types:
     *
     * * Shift Slides
     * * Legato Slides
     *
     *
     * * Slide into from below
     * * Slide into from above
     * * Slide out to below
     * * Slide out to above
     *
     *
     * * Pick Slide out to above
     * * Pick Slide out to below
     *
     * For the first 2 groups the audio generation can be adapted. For the pick slide the audio generation cannot be adapted
     * as there is no mechanism yet in alphaTab to play pick slides to make them sound real.
     *
     * For the first group only the duration or start point of the slide can be configured while for the second group
     * the duration/start-point and the pitch offset can be configured.
     */
    public readonly slide: SlidePlaybackSettings = new SlidePlaybackSettings();

    /**
     * Whether the triplet feel should be played or only displayed.
     * @since 0.9.6
     * @defaultValue `true`
     * @category Player
     * @remarks
     * If this setting is enabled alphaTab will play the triplet feels accordingly, if it is disabled the triplet feel is only displayed but not played.
     */
    public playTripletFeel: boolean = true;

    /**
     * The number of milliseconds the player should buffer.
     * @since 1.2.3
     * @defaultValue `500`
     * @category Player
     * @remarks
     * Gets or sets how many milliseconds of audio samples should be buffered in total.
     *
     * * Larger buffers cause a delay from when audio settings like volumes will be applied.
     * * Smaller buffers can cause audio crackling due to constant buffering that is happening.
     *
     * This buffer size can be changed whenever needed.
     */
    public bufferTimeInMilliseconds: number = 500;
}
