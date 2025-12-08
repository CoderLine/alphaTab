import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';

/**
 * Holds the slur information specific for an individual staff
 * @internal
 */
interface SlurInfoContainer {
    /**
     * A set of started slurs and ties.
     */
    startedSlurs: Map<string, TieGlyph>;
}

/**
 * This registry keeps track of which slurs and ties were started and needs completion.
 * Slurs might span multiple systems, and in such cases we need to create additional
 * slur/ties in the intermediate and end system.
 *
 * @internal
 *
 */
export class SlurRegistry {
    private _staffLookup = new Map<string, SlurInfoContainer>();

    public clear() {
        this._staffLookup.clear();
    }

    public startMultiSystemSlur(startGlyph: TieGlyph) {
        const staffId = startGlyph.renderer.staff.staffId;
        let container: SlurInfoContainer;
        if (!this._staffLookup.has(staffId)) {
            container = {
                startedSlurs: new Map<string, TieGlyph>()
            };
            this._staffLookup.set(staffId, container);
        } else {
            container = this._staffLookup.get(staffId)!;
        }

        container.startedSlurs.set(startGlyph.slurEffectId, startGlyph);
    }

    public completeMultiSystemSlur(endGlyph: TieGlyph) {
        const staffId = endGlyph.renderer.staff.staffId;
        if (!this._staffLookup.has(staffId)) {
            return;
        }
        const container = this._staffLookup.get(staffId)!;
        container.startedSlurs.delete(endGlyph.slurEffectId);
    }

    public tryGetContinuationStart(renderer: BarRendererBase, slurEffectId: string): TieGlyph | undefined {
        const staffId = renderer.staff.staffId;
        if (!this._staffLookup.has(staffId)) {
            return undefined;
        }
        const container = this._staffLookup.get(staffId)!;
        if (!container.startedSlurs.has(slurEffectId)) {
            return;
        }

        const glyph = container.startedSlurs.get(slurEffectId)!;
        // continuations are only on staff breaks
        if (glyph.renderer.staff === renderer.staff) {
            return undefined;
        }
        return;
    }

    // public getAllContinuations(renderer: BarRendererBase): Map<string, TieGlyph> | undefined {
    //     const staffId = renderer.staff.staffId;
    //     if (!this._staffLookup.has(staffId)) {
    //         return undefined;
    //     }
    //     const container = this._staffLookup.get(staffId)!;
    //     return container.startedSlurs;
    // }
}
