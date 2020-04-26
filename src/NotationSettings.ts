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
     * Whether to display the song information or not.
     */
    public hideInfo: boolean = false;

    /**
     * Whether to display the tuning information or not.
     */
    public hideTuning: boolean = false;

    /**
     * Whether to display the track names in the accolade or not.
     */
    public hideTrackNames: boolean = false;

    /**
     * Whether to display the chord diagrams or not.
     */
    public hideChordDiagrams: boolean = false;

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
     * If set to true the note heads on tied notes
     * will have parenthesis if they are preceeded by bends.
     */
    public showParenthesisForTiedBends: boolean = true;

    /**
     * If set to true a tab number will be shown in case
     * a bend is increased on a tied note.
     */
    public showTabNoteOnTiedBend: boolean = true;

    /**
     * If set to true, 0 is shown on dive whammy bars.
     */
    public showZeroOnDiveWhammy: boolean = false;

    /**
     * If set to true, line effects (like w/bar, let-ring etc)
     * are drawn until the end of the beat instead of the start.
     */
    public extendLineEffectsToBeatEnd: boolean = false;

    /**
     * Gets or sets the height for slurs. The factor is multiplied with the a logarithmic distance
     * between slur start and end.
     */
    public slurHeight: number = 7.0;
}
