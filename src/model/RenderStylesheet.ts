// @ts-ignore https://github.com/microsoft/TypeScript/issues/61183
// biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
import type { Track } from '@src/model/Track';

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
 * Lists the different policies on how to display the track names.
 */
export enum TrackNamePolicy {
    /**
     * Track names are hidden everywhere.
     */
    Hidden = 0,
    /**
     * Track names are displayed on the first system.
     */
    FirstSystem = 1,
    /**
     * Track names are displayed on all systems.
     */
    AllSystems = 2
}

/**
 * Lists the different modes what text to display for track names.
 */
export enum TrackNameMode {
    /**
     * Full track names are displayed {@link Track.name}
     */
    FullName = 0,
    /**
     * Short Track names (abbreviations) are displayed {@link Track.shortName}
     */
    ShortName = 1
}

/**
 * Lists the different orientations modes how to render the track names.
 */
export enum TrackNameOrientation {
    /**
     * Text is shown horizontally (left-to-right)
     */
    Horizontal = 0,
    /**
     * Vertically rotated (bottom-to-top)
     */
    Vertical = 1
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

    /**
     * The policy where to show track names when a single track is rendered.
     */
    public singleTrackTrackNamePolicy: TrackNamePolicy = TrackNamePolicy.FirstSystem;

    /**
     * The policy where to show track names when a multiple tracks are rendered.
     */
    public multiTrackTrackNamePolicy: TrackNamePolicy = TrackNamePolicy.FirstSystem;

    /**
     * The mode what text to display for the track name on the first system
     */
    public firstSystemTrackNameMode: TrackNameMode = TrackNameMode.ShortName;

    /**
     * The mode what text to display for the track name on the first system
     */
    public otherSystemsTrackNameMode: TrackNameMode = TrackNameMode.ShortName;

    /**
     * The orientation of the the track names on the first system
     */
    public firstSystemTrackNameOrientation: TrackNameOrientation = TrackNameOrientation.Vertical;

    /**
     * The orientation of the the track names on other systems
     */
    public otherSystemsTrackNameOrientation: TrackNameOrientation = TrackNameOrientation.Vertical;

    /**
     * If multi track: Whether to render multiple subsequent empty (or rest-only) bars together as multi-bar rest.
     */
    public multiTrackMultiBarRest: boolean = false;

    /**
     * If single track: Whether to render multiple subsequent empty (or rest-only) bars together as multi-bar rest.
     */
    public perTrackMultiBarRest: Set<number> | null = null;
}
