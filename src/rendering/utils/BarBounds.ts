import type { Bar } from '@src/model/Bar';
import type { BeatBounds } from '@src/rendering/utils/BeatBounds';
import type { Bounds } from '@src/rendering/utils/Bounds';
import type { MasterBarBounds } from '@src/rendering/utils/MasterBarBounds';

/**
 * Represents the boundaries of a single bar.
 */
export class BarBounds {
    /**
     * Gets or sets the reference to the related {@link MasterBarBounds}
     */
    public masterBarBounds!: MasterBarBounds;

    /**
     * Gets or sets the bounds covering all visually visible elements spanning this bar.
     */
    public visualBounds!: Bounds;

    /**
     * Gets or sets the actual bounds of the elements in this bar including whitespace areas.
     */
    public realBounds!: Bounds;

    /**
     * Gets or sets the bar related to this boundaries.
     */
    public bar!: Bar;

    /**
     * Gets or sets a list of the beats contained in this lookup.
     */
    public beats: BeatBounds[] = [];

    /**
     * Adds a new beat to this lookup.
     * @param bounds The beat bounds to add.
     */
    public addBeat(bounds: BeatBounds): void {
        bounds.barBounds = this;
        this.beats.push(bounds);
        this.masterBarBounds.addBeat(bounds);
    }

    /**
     * Tries to find the beat at the given X-position.
     * @param x The X-position of the beat to find.
     * @returns The beat at the given X-position or null if none was found.
     */
    public findBeatAtPos(x: number): BeatBounds | null {
        let beat: BeatBounds | null = null;
        for (const t of this.beats) {
            if (!beat || t.realBounds.x < x) {
                beat = t;
            } else if (t.realBounds.x > x) {
                break;
            }
        }
        return beat;
    }

    /**
     * Finishes the lookup object and optimizes itself for fast access.
     */
    public finish(scale: number = 1): void {
        this.realBounds.scaleWith(scale);
        this.visualBounds.scaleWith(scale);

        this.beats.sort((a, b) => a.realBounds.x - b.realBounds.x);
        for (const b of this.beats) {
            b.finish(scale);
        }
    }
}
