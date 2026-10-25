import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';

/**
 * @internal
 * @record
 */
interface SlurRegistration {
    startGlyph: TieGlyph;
    endGlyph?: TieGlyph;
}

/**
 * Holds the slur information specific for an individual staff
 * @internal
 * @record
 */
interface SlurInfoContainer {
    /**
     * A set of started slurs and ties.
     */
    startedSlurs: Map<string, SlurRegistration>;
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
    public static staffKey(staff: RenderStaff): string {
        return `${staff.modelStaff.index}.${staff.modelStaff.track.index}.${staff.staffId}`;
    }

    private _staffLookup = new Map<string, SlurInfoContainer>();

    public clear() {
        this._staffLookup.clear();
    }

    public startMultiSystemSlur(startGlyph: TieGlyph) {
        const staffId = startGlyph.renderer.staff!.slurRegistryKey;
        let container: SlurInfoContainer;
        if (!this._staffLookup.has(staffId)) {
            container = {
                startedSlurs: new Map<string, SlurRegistration>()
            };
            this._staffLookup.set(staffId, container);
        } else {
            container = this._staffLookup.get(staffId)!;
        }

        container.startedSlurs.set(startGlyph.slurEffectId, { startGlyph });
    }

    public completeMultiSystemSlur(endGlyph: TieGlyph) {
        const staffId = endGlyph.renderer.staff!.slurRegistryKey;
        if (!this._staffLookup.has(staffId)) {
            return undefined;
        }
        const container = this._staffLookup.get(staffId)!;
        if (container.startedSlurs.has(endGlyph.slurEffectId)) {
            const info = container.startedSlurs.get(endGlyph.slurEffectId)!;
            info.endGlyph = endGlyph;
            return info.startGlyph;
        }
        return undefined;
    }

    /**
     * The started slurs and ties which continue on the staff of the given renderer, `null` when
     * there are none.
     */
    public getAllContinuations(renderer: BarRendererBase): TieGlyph[] | null {
        if (this._staffLookup.size === 0 || renderer.index > 0) {
            return null;
        }
        const container = this._staffLookup.get(renderer.staff!.slurRegistryKey);
        if (container === undefined) {
            return null;
        }

        let continuations: TieGlyph[] | null = null;
        for (const g of container.startedSlurs.values()) {
            if (g.startGlyph.shouldCreateMultiSystemSlur(renderer)) {
                if (continuations === null) {
                    continuations = [g.startGlyph];
                } else {
                    continuations.push(g.startGlyph);
                }
            }
        }
        return continuations;
    }
}
