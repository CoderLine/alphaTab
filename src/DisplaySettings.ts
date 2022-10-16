import { RenderingResources } from '@src/RenderingResources';
import { LayoutMode } from '@src/LayoutMode';
import { StaveProfile } from '@src/StaveProfile';

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
