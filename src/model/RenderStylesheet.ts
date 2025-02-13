/**
 * Lists the different modes on how the brackets/braces are drawn and extended.
 */
export enum BracketExtendMode {
    /**
     * Do not draw brackets
     */
    NoBrackets = 0,

    /**
     * Groups staves into bracket (or braces for grand staff).
     */
    GroupStaves = 1,

    /**
     * Groups similar instruments in multi-track rendering into brackets.
     * The braces of tracks with grand-staffs break any brackets.
     * Similar instruments means actually the same "midi program". No custom grouping is currently done.
     */
    GroupSimilarInstruments = 2
}

/**
 * This class represents the rendering stylesheet.
 * It contains settings which control the display of the score when rendered.
 * @json
 * @json_strict
 */
export class RenderStylesheet {
    /**
     * Whether dynamics are hidden.
     */
    public hideDynamics: boolean = false;

    /**
     * The mode in which brackets and braces are drawn.
     */
    public bracketExtendMode: BracketExtendMode = BracketExtendMode.GroupStaves;

    /**
     * Whether to draw the // sign to separate systems.
     */
    public useSystemSignSeparator: boolean = false;

    /**
     * Whether to show the tuning.
     */
    public globalDisplayTuning: boolean = true;

    /**
     * Whether to show the tuning.(per-track)
     */
    public perTrackDisplayTuning: Map<number, boolean> | null = null;

    /**
     * Whether to show the chord diagrams on top.
     */
    public globalDisplayChordDiagramsOnTop: boolean = true;

    /**
     * Whether to show the chord diagrams on top. (per-track)
     */
    public perTrackChordDiagramsOnTop: Map<number, boolean> | null = null;    
}
