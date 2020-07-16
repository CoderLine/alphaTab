import { Bounds } from '@src/rendering/utils/Bounds';
import { BoundsLookup } from '@src/rendering/utils/BoundsLookup';
import { MasterBarBounds } from '@src/rendering/utils/MasterBarBounds';

/**
 * Represents the bounds of a stave group.
 */
export class StaveGroupBounds {
    /**
     * Gets or sets the index of the bounds within the parent lookup.
     * This allows fast access of the next/previous groups.
     */
    public index: number = 0;

    /**
     * Gets or sets the bounds covering all visually visible elements of this stave group.
     */
    public visualBounds!: Bounds;

    /**
     * Gets or sets the actual bounds of the elements in this stave group including whitespace areas.
     */
    public realBounds!: Bounds;

    /**
     * Gets or sets the list of master bar bounds related to this stave group.
     */
    public bars: MasterBarBounds[] = [];

    /**
     * Gets or sets a reference to the parent bounds lookup.
     */
    public boundsLookup!: BoundsLookup;

    /**
     * Finished the lookup for optimized access.
     */
    public finish(): void {
        for (let t of this.bars) {
            t.finish();
        }
    }

    /**
     * Adds a new master bar to this lookup.
     * @param bounds The master bar bounds to add.
     */
    public addBar(bounds: MasterBarBounds): void {
        this.boundsLookup.addMasterBar(bounds);
        bounds.staveGroupBounds = this;
        this.bars.push(bounds);
    }

    /**
     * Tries to find the master bar bounds that are located at the given X-position.
     * @param x The X-position to find a master bar.
     * @returns The master bounds at the given X-position.
     */
    public findBarAtPos(x: number): MasterBarBounds | null {
        let b: MasterBarBounds | null = null;
        // move from left to right as long we find bars that start before the clicked position
        for (let bar of this.bars) {
            if (!b || bar.realBounds.x < x) {
                b = bar;
            } else if (x > bar.realBounds.x + bar.realBounds.w) {
                break;
            }
        }
        return b;
    }
}
