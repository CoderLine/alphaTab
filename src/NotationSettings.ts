/**
 * Lists the different modes on how rhythm notation is shown on the tab staff.
 */
export enum TabRhythmMode {
    /**
     * Rhythm notation is hidden.
     */
    Hidden = 0,
    /**
     * Rhythm notation is shown with individual beams per beat.
     */
    ShowWithBeams = 1,
    /**
     * Rhythm notation is shown and behaves like normal score notation with connected bars.
     */
    ShowWithBars = 2,
    /**
     * Automatic detection whether the tabs should show rhythm based on hidden standard notation.
     * @since 1.4.0
     */
    Automatic = 3
}

/**
 * Lists all modes on how fingerings should be displayed.
 */
export enum FingeringMode {
    /**
     * Fingerings will be shown in the standard notation staff.
     */
    ScoreDefault = 0,
    /**
     * Fingerings will be shown in the standard notation staff. Piano finger style is enforced, where
     * fingers are rendered as 1-5 instead of p,i,m,a,c and T,1,2,3,4.
     */
    ScoreForcePiano = 1,
    /**
     * Fingerings will be shown in a effect band above the tabs in case
     * they have only a single note on the beat.
     */
    SingleNoteEffectBand = 2,
    /**
     * Fingerings will be shown in a effect band above the tabs in case
     * they have only a single note on the beat. Piano finger style is enforced, where
     * fingers are rendered as 1-5 instead of p,i,m,a,c and T,1,2,3,4.
     */
    SingleNoteEffectBandForcePiano = 3
}

/**
 * Lists all modes on how alphaTab can handle the display and playback of music notation.
 */
export enum NotationMode {
    /**
     * Music elements will be displayed and played as in Guitar Pro.
     */
    GuitarPro = 0,

    /**
     * Music elements will be displayed and played as in traditional songbooks.
     * Changes:
     * 1. Bends
     *   For bends additional grace beats are introduced.
     *   Bends are categorized into gradual and fast bends.
     *   - Gradual bends are indicated by beat text "grad" or "grad.". Bend will sound along the beat duration.
     *   - Fast bends are done right before the next note. If the next note is tied even on-beat of the next note.
     * 2. Whammy Bars
     *   Dips are shown as simple annotation over the beats
     *   Whammy Bars are categorized into gradual and fast.
     *   - Gradual whammys are indicated by beat text "grad" or "grad.". Whammys will sound along the beat duration.
     *   - Fast whammys are done right the beat.
     * 3. Let Ring
     *   Tied notes with let ring are not shown in standard notation
     *   Let ring does not cause a longer playback, duration is defined via tied notes.
     */
    SongBook = 1
}

/**
 * Lists all major music notation elements that are part
 * of the music sheet and can be dynamically controlled to be shown
 * or hidden.
 */
export enum NotationElement {
    /**
     * The score title shown at the start of the music sheet.
     */
    ScoreTitle = 0,

    /**
     * The score subtitle shown at the start of the music sheet.
     */
    ScoreSubTitle = 1,

    /**
     * The score artist shown at the start of the music sheet.
     */
    ScoreArtist = 2,

    /**
     * The score album shown at the start of the music sheet.
     */
    ScoreAlbum = 3,

    /**
     * The score words author shown at the start of the music sheet.
     */
    ScoreWords = 4,

    /**
     * The score music author shown at the start of the music sheet.
     */
    ScoreMusic = 5,

    /**
     * The score words&music author shown at the start of the music sheet.
     */
    ScoreWordsAndMusic = 6,

    /**
     * The score copyright owner shown at the start of the music sheet.
     */
    ScoreCopyright = 7,

    /**
     * The tuning information of the guitar shown
     * above the staves.
     */
    GuitarTuning = 8,

    /**
     * The track names which are shown in the accolade.
     */
    TrackNames = 9,

    /**
     * The chord diagrams for guitars. Usually shown
     * below the score info.
     */
    ChordDiagrams = 10,

    /**
     * Parenthesis that are shown for tied bends
     * if they are preceeded by bends.
     */
    ParenthesisOnTiedBends = 11,

    /**
     * The tab number for tied notes if the
     * bend of a note is increased at that point.
     */
    TabNotesOnTiedBends = 12,

    /**
     * Zero tab numbers on "dive whammys".
     */
    ZerosOnDiveWhammys = 13,

    /**
     * The alternate endings information on repeats shown above the staff.
     */
    EffectAlternateEndings = 14,

    /**
     * The information about the fret on which the capo is placed shown above the staff.
     */
    EffectCapo = 15,

    /**
     * The chord names shown above beats shown above the staff.
     */
    EffectChordNames = 16,

    /**
     * The crescendo/decrescendo angle  shown above the staff.
     */
    EffectCrescendo = 17,

    /**
     * The beat dynamics  shown above the staff.
     */
    EffectDynamics = 18,

    /**
     * The curved angle for fade in/out effects  shown above the staff.
     */
    EffectFadeIn = 19,

    /**
     * The fermata symbol shown above the staff.
     */
    EffectFermata = 20,

    /**
     * The fingering information.
     */
    EffectFingering = 21,

    /**
     * The harmonics names shown above the staff.
     * (does not represent the harmonic note heads)
     */
    EffectHarmonics = 22,

    /**
     * The let ring name and line above the staff.
     */
    EffectLetRing = 23,

    /**
     * The lyrics of the track shown above the staff.
     */
    EffectLyrics = 24,

    /**
     * The section markers shown above the staff.
     */
    EffectMarker = 25,

    /**
     * The ottava symbol and lines shown above the staff.
     */
    EffectOttavia = 26,

    /**
     * The palm mute name and line shown above the staff.
     */
    EffectPalmMute = 27,

    /**
     * The pick slide information shown above the staff.
     * (does not control the pick slide lines)
     */
    EffectPickSlide = 28,

    /**
     * The pick stroke symbols shown above the staff.
     */
    EffectPickStroke = 29,

    /**
     * The slight beat vibrato waves shown above the staff.
     */
    EffectSlightBeatVibrato = 30,

    /**
     * The slight note vibrato waves shown above the staff.
     */
    EffectSlightNoteVibrato = 31,

    /**
     * The tap/slap/pop effect names shown above the staff.
     */
    EffectTap = 32,

    /**
     * The tempo information shown above the staff.
     */
    EffectTempo = 33,

    /**
     * The additional beat text shown above the staff.
     */
    EffectText = 34,

    /**
     * The trill name and waves shown above the staff.
     */
    EffectTrill = 35,

    /**
     * The triplet feel symbol shown above the staff.
     */
    EffectTripletFeel = 36,

    /**
     * The whammy bar information shown above the staff.
     * (does not control the whammy lines shown within the staff)
     */
    EffectWhammyBar = 37,

    /**
     * The wide beat vibrato waves shown above the staff.
     */
    EffectWideBeatVibrato = 38,

    /**
     * The wide note vibrato waves shown above the staff.
     */
    EffectWideNoteVibrato = 39,

    /**
     * The left hand tap symbol shown above the staff.
     */
    EffectLeftHandTap = 40,

    /**
     * The "Free time" text shown above the staff.
     */
    EffectFreeTime = 41,

    /**
     * The Sustain pedal effect shown above the staff "Ped.____*"
     */
    EffectSustainPedal = 42,

    /**
     * The Golpe effect signs above and below the staff.
     */
    EffectGolpe = 43,

    /**
     * The Wah effect signs above and below the staff.
     */
    EffectWahPedal = 44,

    /**
     * The Beat barre effect signs above and below the staff "1/2B IV ─────┐"
     */
    EffectBeatBarre = 45,

    /**
     * The note ornaments like turns and mordents.
     */
    EffectNoteOrnament = 46,

    /**
     * The Rasgueado indicator above the staff Rasg. ----|"
     */
    EffectRasgueado = 47,

    /**
     * The directions indicators like coda and segno.
     */
    EffectDirections = 48,

    /**
     * The absolute playback time of beats.
     */
    EffectBeatTimer = 49
}

/**
 * The notation settings control how various music notation elements are shown and behaving
 * @json
 * @json_declaration
 */
export class NotationSettings {
    /**
     * The mode to use for display and play music notation elements.
     * @since 0.9.6
     * @category Notation
     * @defaultValue `NotationMode.GuitarPro`
     * @remarks
     * AlphaTab provides 2 main music notation display modes `GuitarPro` and `SongBook`.
     * As the names indicate they adjust the overall music notation rendering either to be more in line how [Arobas Guitar Pro](https://www.guitar-pro.com) displays it,
     * or more like the common practice in paper song books practices the display.
     *
     * The main differences in the Songbook display mode are:
     *
     * 1. **Bends**
     * For bends additional grace beats are introduced. Bends are categorized into gradual and fast bends.
     *     * Gradual bends are indicated by beat text "grad" or "grad.". Bend will sound along the beat duration.
     *     * Fast bends are done right before the next note. If the next note is tied even on-beat of the next note.
     * 2.  **Whammy Bars**
     * Dips are shown as simple annotation over the beats. Whammy Bars are categorized into gradual and fast.
     *     * Gradual whammys are indicated by beat text "grad" or "grad.". Whammys will sound along the beat duration.
     *     * Fast whammys are done right the beat.
     *
     * 3. **Let Ring**
     * Tied notes with let ring are not shown in standard notation. Let ring does not cause a longer playback, duration is defined via tied notes.
     *
     * 4. **Settings**
     * Following default setting values are applied:
     * ```js
     * {
     *     notation: {
     *         smallGraceTabNotes: false,
     *         fingeringMode: alphaTab.FingeringMode.SingleNoteEffectBandm
     *         extendBendArrowsOnTiedNotes: false
     *     },
     *     elements: {
     *         parenthesisOnTiedBends: false,
     *         tabNotesOnTiedBends: false,
     *         zerosOnDiveWhammys: true
     *     }
     * }
     * ```
     */
    public notationMode: NotationMode = NotationMode.GuitarPro;

    /**
     * The fingering mode to use.
     * @since 0.9.6
     * @category Notation
     * @defaultValue `FingeringMode.ScoreDefault`
     * @remarks
     * AlphaTab supports multiple modes on how to display fingering information in the music sheet. This setting controls how they should be displayed. The default behavior is to show the finger information
     * directly in the score along the notes. For some use cases of training courses and for beginners this notation might be hard to read. The effect band mode allows to show a single finger information above the staff.
     *
     * | Score                                                       | Effect Band                                                       |
     * |-------------------------------------------------------------|-------------------------------------------------------------------|
     * | ![Enabled](https://alphatab.net/img/reference/property/fingeringmode-score.png) | ![Disabled](https://alphatab.net/img/reference/property/fingeringmode-effectband.png) |
     */
    public fingeringMode: FingeringMode = FingeringMode.ScoreDefault;

    /**
     * Whether music notation elements are visible or not.
     * @since 0.9.8
     * @category Notation
     * @defaultValue `[[NotationElement.ZerosOnDiveWhammys, false]]`
     * @remarks
     * AlphaTab has quite a set of notation elements that are usually shown by default or only shown when using
     * the `SongBook` notation mode. This setting allows showing/hiding individual notation elements like the
     * song information or the track names.
     *
     * For each element you can configure whether it is visible or not. The setting is a Map/Dictionary where
     * the key is the element to configure and the value is a boolean value whether it should be visible or not.
     * @example
     * JavaScript
     * Internally the setting is a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) where the key must be a {@link NotationElement} enumeration value.
     * For JSON input the usual enumeration serialization applies where also the names can be used. The names
     * are case insensitive.
     *
     * ```js
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'), {
     *     notation: {
     *         elements: {
     *             scoreTitle: false,
     *             trackNames: false
     *         }
     *     }
     * });
     * api.settings.notation.elements.set(alphaTab.NotationElement.EffectWhammyBar, false);
     * ```
     * @example
     * C#
     * ```cs
     * var settings = new AlphaTab.Settings();
     * settings.Notation.Elements[AlphaTab.NotationElement.ScoreTitle] = false;
     * settings.Notation.Elements[AlphaTab.NotationElement.TrackNames] = false;
     * ```
     * @example
     * Android
     * ```kotlin
     * val settings = AlphaTab.Settings();
     * settings.notation.elements[alphaTab.NotationElement.ScoreTitle] = false;
     * settings.notation.elements[alphaTab.NotationElement.TrackNames] = false;
     * ```
     */
    public elements: Map<NotationElement, boolean> = new Map();

    /**
     * Gets the default configuration of the {@see notationElements} setting. Do not modify
     * this map as it might not result in the expected side effects.
     * If items are not listed explicitly in this list, they are considered visible.
     */
    public static defaultElements: Map<NotationElement, boolean> = new Map([
        [NotationElement.ZerosOnDiveWhammys, false]
    ]);

    /**
     * Controls how the rhythm notation is rendered for tab staves.
     * @since 0.9.6
     * @category Notation
     * @defaultValue `TabRhythmMode.Automatic`
     * @remarks
     * This setting enables the display of rhythm notation on tab staffs. [Demo](https://alphatab.net/docs/showcase/guitar-tabs)
     * {@since 1.4.0} its automatically detected whether rhythm notation should be shown on tabs (based on the visibility of other staves).
     */
    public rhythmMode: TabRhythmMode = TabRhythmMode.Automatic;

    /**
     * Controls how high the ryhthm notation is rendered below the tab staff
     * @since 0.9.6
     * @category Notation
     * @defaultValue `15`
     * @remarks
     * This setting can be used in combination with the {@link rhythmMode} setting to control how high the rhythm notation should be rendered below the tab staff.
     */
    public rhythmHeight: number = 15;

    /**
     * The transposition pitch offsets for the individual tracks used for rendering and playback.
     * @since 0.9.6
     * @category Notation
     * @defaultValue `[]`
     * @remarks
     * This setting allows transposing of tracks for display and playback.
     * The `transpositionPitches` setting allows defining an additional pitch offset per track, that is then considered when displaying the music sheet.
     */
    public transpositionPitches: number[] = [];

    /**
     * The transposition pitch offsets for the individual tracks used for rendering only.
     * @since 0.9.6
     * @category Notation
     * @defaultValue `[]`
     * @remarks
     * For some instruments the pitch shown on the standard notation has an additional transposition. One example is the Guitar.
     * Notes are shown 1 octave higher than they are on the piano. The following image shows a C4 for a piano and a guitar, and a C5 for the piano as comparison:
     *
     * ![Display Transposition Pitches example](https://alphatab.net/img/reference/property/displaytranspositionpitches.png)
     *
     * The `DisplayTranspositionPitch` setting allows defining an additional pitch offset per track, that is then considered when displaying the music sheet.
     * This setting does not affect the playback of the instrument in any way. Despite the 2 different standard notations in the above example, they both play the same note height.
     * The transposition is defined as number of semitones and one value per track of the song can be defined.
     */
    public displayTranspositionPitches: number[] = [];

    /**
     * If set to true the guitar tabs on grace beats are rendered smaller.
     * @since 0.9.6
     * @category Notation
     * @defaultValue `true`
     * @remarks
     * By default, grace notes are drawn smaller on the guitar tabs than the other numbers. With this setting alphaTab can be configured to show grace tab notes with normal text size.
     * | Enabled                                                            | Disabled                                                             |
     * |--------------------------------------------------------------------|----------------------------------------------------------------------|
     * | ![Enabled](https://alphatab.net/img/reference/property/smallgracetabnotes-enabled.png) | ![Disabled](https://alphatab.net/img/reference/property/smallgracetabnotes-disabled.png) |
     */
    public smallGraceTabNotes: boolean = true;

    /**
     * If set to true bend arrows expand to the end of the last tied note of the string. Otherwise they end on the next beat.
     * @since 0.9.6
     * @category Notation
     * @defaultValue `true`
     * @remarks
     * By default the arrows and lines on bend effects are extended to the space of tied notes. This behavior is the Guitar Pro default but some applications and songbooks practice it different.
     * There the bend only is drawn to the next beat.
     * | Enabled                                                                     | Disabled                                                                      |
     * |-----------------------------------------------------------------------------|-------------------------------------------------------------------------------|
     * | ![Enabled](https://alphatab.net/img/reference/property/extendbendarrowsontiednotes-enabled.png) | ![Disabled](https://alphatab.net/img/reference/property/extendbendarrowsontiednotes-disabled.png) |
     */
    public extendBendArrowsOnTiedNotes: boolean = true;

    /**
     * If set to true, line effects like w/bar and let-ring are drawn until the end of the beat instead of the start
     * @since 0.9.6
     * @category Notation
     * @defaultValue `false`
     * @remarks
     * By default effect annotations that render a line above the staff, stop on the beat. This is the typical display of Guitar Pro. In songbooks and some other tools
     * these effects are drawn to the end of this beat.
     * | Enabled                                                                     | Disabled                                                                      |
     * |-----------------------------------------------------------------------------|-------------------------------------------------------------------------------|
     * | ![Enabled](https://alphatab.net/img/reference/property/extendlineeffectstobeatend-enabled.png) | ![Disabled](https://alphatab.net/img/reference/property/extendlineeffectstobeatend-disabled.png) |
     */
    public extendLineEffectsToBeatEnd: boolean = false;

    /**
     * The height scale factor for slurs
     * @since 0.9.6
     * @category Notation
     * @defaultValue `5`
     * @remarks
     * Slurs and ties currently calculate their height based on the distance they have from start to end note. Most music notation software do some complex collision detection to avoid a slur to overlap with other elements, alphaTab
     * only has a simplified version of the slur positioning as of today. This setting allows adjusting the slur height to avoid collisions. The factor defined by this setting, is multiplied with the logarithmic distance between start and end.
     * | Slur Height Default                                                    | Slur Height 14                                               |
     * |------------------------------------------------------------------------|--------------------------------------------------------------|
     * | ![Slur Height Default](https://alphatab.net/img/reference/property/slurheight-default.png) | ![Slur Height 14](https://alphatab.net/img/reference/property/slurheight-14.png)  |
     */
    public slurHeight: number = 5.0;

    /**
     * Gets whether the given music notation element should be shown
     * @param element the element to check
     * @returns true if the element should be shown, otherwise false.
     */
    public isNotationElementVisible(element: NotationElement): boolean {
        if (this.elements.has(element)) {
            return this.elements.get(element)!;
        }
        if (NotationSettings.defaultElements.has(element)) {
            return NotationSettings.defaultElements.get(element)!;
        }
        return true;
    }
}
