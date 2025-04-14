import type { Beat } from '@src/model/Beat';
import type { BarBounds } from '@src/rendering/utils/BarBounds';
import type { BeatBounds } from '@src/rendering/utils/BeatBounds';
import type { Bounds } from '@src/rendering/utils/Bounds';
import type { StaffSystemBounds } from '@src/rendering/utils/StaffSystemBounds';

/**
 * Represents the boundaries of a list of bars related to a single master bar.
 */
export class MasterBarBounds {
    /**
     * Gets or sets the index of this bounds relative within the parent lookup.
     */
    public index: number = 0;

    /**
     * Gets or sets a value indicating whether this bounds are the first of the line.
     */
    public isFirstOfLine: boolean = false;

    /**
     * Gets or sets the bounds covering all visually visible elements spanning all bars of this master bar.
     */
    public visualBounds!: Bounds;

    /**
     * Gets or sets the actual bounds of the elements in this master bar including whitespace areas.
     */
    public realBounds!: Bounds;

    /**
     * Gets or sets the actual bounds which are exactly aligned with the lines of the staffs.
     */
    public lineAlignedBounds!: Bounds;

    /**
     * Gets or sets the list of individual bars within this lookup.
     */
    public bars: BarBounds[] = [];

    /**
     * Gets or sets a reference to the parent {@link staffSystemBounds}.
     */
    public staffSystemBounds: StaffSystemBounds | null = null;

    /**
     * Gets or sets a reference to the parent {@link staffSystemBounds}.
     * @deprecated use staffSystemBounds
     */
    public get staveGroupBounds(): StaffSystemBounds | null {
        return this.staffSystemBounds;
    }

    /**
     * Adds a new bar to this lookup.
     * @param bounds The bar bounds to add to this lookup.
     */
    public addBar(bounds: BarBounds): void {
        bounds.masterBarBounds = this;
        this.bars.push(bounds);
    }

    /**
     * Tries to find a beat at the given location.
     * @param x The absolute X position where the beat spans across.
     * @param y The absolute Y position where the beat spans across.
     * @returns The beat that spans across the given point, or null if none of the contained bars had a beat at this position.
     */
    public findBeatAtPos(x: number, y: number): Beat | null {
        let beat: BeatBounds | null = null;
        const distance = 10000000;
        for (const bar of this.bars) {
            const b = bar.findBeatAtPos(x);
            if (b && (!beat || beat.realBounds.x < b.realBounds.x)) {
                const newDistance = Math.abs(b.realBounds.x - x);
                if (!beat || newDistance < distance) {
                    beat = b;
                }
            }
        }
        return !beat ? null : beat.beat;
    }

    /**
     * Finishes the lookup object and optimizes itself for fast access.
     */
    public finish(scale: number = 1): void {
        this.realBounds.scaleWith(scale);
        this.visualBounds.scaleWith(scale);
        this.lineAlignedBounds.scaleWith(scale);

        this.bars.sort((a, b) => {
            if (a.realBounds.y < b.realBounds.y) {
                return -1;
            }
            if (a.realBounds.y > b.realBounds.y) {
                return 1;
            }
            if (a.realBounds.x < b.realBounds.x) {
                return -1;
            }
            if (a.realBounds.x > b.realBounds.x) {
                return 1;
            }
            return 0;
        });
        for (const bar of this.bars) {
            bar.finish(scale);
        }
    }

    /**
     * Adds a new beat to the lookup.
     * @param bounds The beat bounds to add.
     */
    public addBeat(bounds: BeatBounds): void {
        this.staffSystemBounds!.boundsLookup.addBeat(bounds);
    }
}
