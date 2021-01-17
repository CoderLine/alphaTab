import { RenderingResources } from '@src/RenderingResources';

/**
 * Lists all stave profiles controlling which staves are shown.
 */
export enum StaveProfile {
    /**
     * The profile is auto detected by the track configurations.
     */
    Default,
    /**
     * Standard music notation and guitar tablature are rendered.
     */
    ScoreTab,
    /**
     * Only standard music notation is rendered.
     */
    Score,
    /**
     * Only guitar tablature is rendered.
     */
    Tab,
    /**
     * Only guitar tablature is rendered, but also rests and time signatures are not shown.
     * This profile is typically used in multi-track scenarios.
     */
    TabMixed
}

/**
 * Lists all layout modes that are supported.
 */
export enum LayoutMode {
    /**
     * Bars are aligned in rows using a fixed width.
     */
    Page,
    /**
     * Bars are aligned horizontally in one row
     */
    Horizontal
}

/**
 * The display settings control how the general layout and display of alphaTab is done.
 * @json
 */
export class DisplaySettings {
    /**
     * Sets the zoom level of the rendered notation
     */
    public scale: number = 1.0;

    /**
     * The default stretch force to use for layouting.
     */
    public stretchForce: number = 1.0;

    /**
     * The layouting mode used to arrange the the notation.
     */
    public layoutMode: LayoutMode = LayoutMode.Page;

    /**
     * The stave profile to use.
     */
    public staveProfile: StaveProfile = StaveProfile.Default;

    /**
     * Limit the displayed bars per row.
     */
    public barsPerRow: number = -1;

    /**
     * The bar start number to start layouting with. Note that this is the bar number and not an index!
     */
    public startBar: number = 1;

    /**
     * The amount of bars to render overall.
     */
    public barCount: number = -1;

    /**
     * The number of bars that should be rendered per partial. This setting is not used by all layouts.
     */
    public barCountPerPartial: number = 10;

    /**
     * Gets or sets the resources used during rendering. This defines all fonts and colors used.
     * @json_partial_names
     */
    public resources: RenderingResources = new RenderingResources();

    /**
     * Gets or sets the padding between the music notation and the border.
     */
    public padding: number[] | null = null;
}
