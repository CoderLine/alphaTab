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
    private _staffLookup = new Map<string, SlurInfoContainer>();

    public clear() {
        this._staffLookup.clear();
    }

    public startMultiSystemSlur(startGlyph: TieGlyph) {
        const staffId = SlurRegistry._staffId(startGlyph.renderer.staff!);
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

    private static _staffId(staff: RenderStaff): string {
        return `${staff.modelStaff.index}.${staff.modelStaff.track.index}.${staff.staffId}`;
    }

    public completeMultiSystemSlur(endGlyph: TieGlyph) {
        const staffId = SlurRegistry._staffId(endGlyph.renderer.staff!);
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

    public *getAllContinuations(renderer: BarRendererBase): Iterable<TieGlyph> {
        const staffId = SlurRegistry._staffId(renderer.staff!);
        if (!this._staffLookup.has(staffId) || renderer.index > 0) {
            return;
        }

        const container = this._staffLookup.get(staffId)!;
        for (const g of container.startedSlurs.values()) {
            if (g.startGlyph.shouldCreateMultiSystemSlur(renderer)) {
                yield g.startGlyph;
            }
        }
    }
}
