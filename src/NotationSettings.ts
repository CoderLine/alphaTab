/**
 * Lists the different modes on how rhythm notation is shown on the tab staff.
 */
export enum TabRhythmMode {
    /**
     * Rhythm notation is hidden.
     */
    Hidden,
    /**
     * Rhythm notation is shown with individual beams per beat.
     */
    ShowWithBeams,
    /**
     * Rhythm notation is shown and behaves like normal score notation with connected bars.
     */
    ShowWithBars
}

/**
 * Lists all modes on how fingerings should be displayed.
 */
export enum FingeringMode {
    /**
     * Fingerings will be shown in the standard notation staff.
     */
    ScoreDefault,
    /**
     * Fingerings will be shown in the standard notation staff. Piano finger style is enforced, where
     * fingers are rendered as 1-5 instead of p,i,m,a,c and T,1,2,3,4.
     */
    ScoreForcePiano,
    /**
     * Fingerings will be shown in a effect band above the tabs in case
     * they have only a single note on the beat.
     */
    SingleNoteEffectBand,
    /**
     * Fingerings will be shown in a effect band above the tabs in case
     * they have only a single note on the beat. Piano finger style is enforced, where
     * fingers are rendered as 1-5 instead of p,i,m,a,c and T,1,2,3,4.
     */
    SingleNoteEffectBandForcePiano
}

/**
 * Lists all modes on how alphaTab can handle the display and playback of music notation.
 */
export enum NotationMode {
    /**
     * Music elements will be displayed and played as in Guitar Pro.
     */
    GuitarPro,

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
    SongBook
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
    ScoreTitle,

    /**
     * The score subtitle shown at the start of the music sheet.
     */
    ScoreSubTitle,

    /**
     * The score artist shown at the start of the music sheet.
     */
    ScoreArtist,

    /**
     * The score album shown at the start of the music sheet.
     */
    ScoreAlbum,

    /**
     * The score words author shown at the start of the music sheet.
     */
    ScoreWords,

    /**
     * The score music author shown at the start of the music sheet.
     */
    ScoreMusic,

    /**
     * The score words&music author shown at the start of the music sheet.
     */
    ScoreWordsAndMusic,

    /**
     * The score copyright owner shown at the start of the music sheet.
     */
    ScoreCopyright,

    /**
     * The tuning information of the guitar shown
     * above the staves.
     */
    GuitarTuning,

    /**
     * The track names which are shown in the accolade.
     */
    TrackNames,
    
    /**
     * The chord diagrams for guitars. Usually shown
     * below the score info.
     */
    ChordDiagrams,

    /**
     * Parenthesis that are shown for tied bends
     * if they are preceeded by bends.
     */
    ParenthesisOnTiedBends,

    /**
     * The tab number for tied notes if the
     * bend of a note is increased at that point.
     */
    TabNotesOnTiedBends,

    /**
     * Zero tab numbers on "dive whammys".
     */
    ZerosOnDiveWhammys,

    /**
     * The alternate endings information on repeats shown above the staff.
     */
    EffectAlternateEndings,

    /**
     * The information about the fret on which the capo is placed shown above the staff.
     */
    EffectCapo,

    /**
     * The chord names shown above beats shown above the staff.
     */
    EffectChordNames,

    /**
     * The crescendo/decrescendo angle  shown above the staff.
     */
    EffectCrescendo,

    /**
     * The beat dynamics  shown above the staff.
     */
    EffectDynamics,

    /**
     * The curved angle for fade in/out effects  shown above the staff.
     */
    EffectFadeIn,

    /**
     * The fermata symbol shown above the staff.
     */
    EffectFermata,

    /**
     * The fingering information.
     */
    EffectFingering,

    /**
     * The harmonics names shown above the staff.
     * (does not represent the harmonic note heads)
     */
    EffectHarmonics,

    /**
     * The let ring name and line above the staff.
     */
    EffectLetRing,

    /**
     * The lyrics of the track shown above the staff.
     */
    EffectLyrics,

    /**
     * The section markers shown above the staff.
     */
    EffectMarker,

    /**
     * The ottava symbol and lines shown above the staff.
     */
    EffectOttavia,

    /**
     * The palm mute name and line shown above the staff.
     */
    EffectPalmMute,

    /**
     * The pick slide information shown above the staff.
     * (does not control the pick slide lines)
     */
    EffectPickSlide,

    /**
     * The pick stroke symbols shown above the staff.
     */
    EffectPickStroke,

    /**
     * The slight beat vibrato waves shown above the staff.
     */
    EffectSlightBeatVibrato,

    /**
     * The slight note vibrato waves shown above the staff.
     */
    EffectSlightNoteVibrato,

    /**
     * The tap/slap/pop effect names shown above the staff.
     */
    EffectTap,

    /**
     * The tempo information shown above the staff.
     */
    EffectTempo,

    /**
     * The additional beat text shown above the staff.
     */
    EffectText,

    /**
     * The trill name and waves shown above the staff.
     */
    EffectTrill,

    /**
     * The triplet feel symbol shown above the staff.
     */
    EffectTripletFeel,

    /**
     * The whammy bar information shown above the staff.
     * (does not control the whammy lines shown within the staff)
     */
    EffectWhammyBar,

    /**
     * The wide beat vibrato waves shown above the staff.
     */
    EffectWideBeatVibrato,

    /**
     * The wide note vibrato waves shown above the staff.
     */
    EffectWideNoteVibrato,

    /**
     * The left hand tap symbol shown above the staff.
     */
    EffectLeftHandTap
}

/**
 * The notation settings control how various music notation elements are shown and behaving
 * @json
 */
export class NotationSettings {
    /**
     * Gets or sets the mode to use for display and play music notation elements.
     */
    public notationMode: NotationMode = NotationMode.GuitarPro;

    /**
     * Gets or sets the fingering mode to use.
     */
    public fingeringMode: FingeringMode = FingeringMode.ScoreDefault;

    /**
     * Gets or sets the configuration on whether music notation elements are visible or not.
     * If notation elements are not specified, the default configuration will be applied.
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
     * Whether to show rhythm notation in the guitar tablature.
     */
    public rhythmMode: TabRhythmMode = TabRhythmMode.Hidden;

    /**
     * The height of the rythm bars.
     */
    public rhythmHeight: number = 15;

    /**
     * The transposition pitch offsets for the individual tracks.
     * They apply to rendering and playback.
     */
    public transpositionPitches: number[] = [];

    /**
     * The transposition pitch offsets for the individual tracks.
     * They apply to rendering only.
     */
    public displayTranspositionPitches: number[] = [];

    /**
     * If set to true the guitar tabs on grace beats are rendered smaller.
     */
    public smallGraceTabNotes: boolean = true;

    /**
     * If set to true bend arrows expand to the end of the last tied note
     * of the string. Otherwise they end on the next beat.
     */
    public extendBendArrowsOnTiedNotes: boolean = true;

    /**
     * If set to true, line effects (like w/bar, let-ring etc)
     * are drawn until the end of the beat instead of the start.
     */
    public extendLineEffectsToBeatEnd: boolean = false;

    /**
     * Gets or sets the height for slurs. The factor is multiplied with the a logarithmic distance
     * between slur start and end.
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
