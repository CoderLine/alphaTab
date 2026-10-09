import type { EffectBand } from '@coderline/alphatab/rendering/EffectBand';
import { EffectBandPlacementCategory } from '@coderline/alphatab/rendering/EffectInfo';
import type { Skyline } from '@coderline/alphatab/rendering/skyline/Skyline';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';

/**
 * Priority-ordered skyline oracle that positions every {@link EffectBand} on
 * a staff line. Fires from {@link RenderStaff.finalizeStaff}.
 * @internal
 */
export class EffectSystemPlacement {
    private readonly _staff: RenderStaff;

    // Reusable scratch buffers; rebuilt every finalize cycle.
    private readonly _top: EffectBand[] = [];
    private readonly _bottom: EffectBand[] = [];
    private readonly _groupBands: EffectBand[] = [];
    private readonly _groupXStarts: number[] = [];
    private readonly _groupXEnds: number[] = [];
    private readonly _clearXStarts: number[] = [];
    private readonly _clearXEnds: number[] = [];

    public constructor(staff: RenderStaff) {
        this._staff = staff;
    }

    public placeAndApply(): void {
        const staff = this._staff;
        const sky = staff.systemSkyline;
        const pad = staff.system.layout.renderer.settings.display.effectBandPaddingBottom;

        const top = this._top;
        const bottom = this._bottom;
        // splice() instead of `.length = 0`: transpile-safe array clear.
        top.splice(0, top.length);
        bottom.splice(0, bottom.length);

        // Filter non-empty bands and run `finalizeBand` (settles dynamic-height
        // effects like TabWhammy) in one walk.
        for (let i = 0; i < staff.barRenderers.length; i++) {
            const r = staff.barRenderers[i];
            for (const b of r.topEffects.bands) {
                if (!b.isEmpty) {
                    // Reset; `_placeSide` only writes it when computeLocalXRange succeeds,
                    // but the band-y loop reads it for every band.
                    b.placedMagnitude = 0;
                    b.finalizeBand();
                    top.push(b);
                }
            }
            for (const b of r.bottomEffects.bands) {
                if (!b.isEmpty) {
                    b.placedMagnitude = 0;
                    b.finalizeBand();
                    bottom.push(b);
                }
            }
        }

        EffectSystemPlacement._sortByPriority(top);
        EffectSystemPlacement._sortByPriority(bottom);

        // Content-only surface for bands that ignore the structural header (bar
        // numbers). Null when no such band exists, in which case every band is
        // placed against the full skyline exactly as before.
        const contentSky = staff.placesAgainstContentOnly ? staff.contentSkyline : null;
        this._placeSide(top, sky.upSky, contentSky ? contentSky.upSky : null, pad, /* isTop */ true);
        this._placeSide(bottom, sky.downSky, contentSky ? contentSky.downSky : null, pad, /* isTop */ false);

        // A bar reserves its own content and the bands placed on it. Bands know their final
        // position (magnitude + height), so the reserved height does not depend on the skyline before
        // placement, which also contains content of other bars reaching into this bar (ties, brackets)
        // and misses content registered as overflow without a skyline entry.
        for (let i = 0; i < staff.barRenderers.length; i++) {
            const r = staff.barRenderers[i];
            r.topEffects.height = EffectSystemPlacement._effectsHeight(r.topEffects.bands, r.contentTopOverflow);
            r.bottomEffects.height = EffectSystemPlacement._effectsHeight(
                r.bottomEffects.bands,
                r.contentBottomOverflow
            );

            r.registerStaffOverflows();
        }

        const staffTopOverflow = staff.topOverflow;
        const staffBottomOverflow = staff.bottomOverflow;
        for (const band of top) {
            band.y = staffTopOverflow - (band.placedMagnitude + band.height);
        }
        for (const band of bottom) {
            band.y = band.placedMagnitude + band.renderer.bottomEffects.height - staffBottomOverflow;
        }
    }

    /** The height the placed bands add on top of the given content overflow. */
    private static _effectsHeight(bands: EffectBand[], contentOverflow: number): number {
        let max = 0;
        for (const b of bands) {
            if (!b.isEmpty) {
                const outer = b.placedMagnitude + b.height;
                if (outer > max) {
                    max = outer;
                }
            }
        }
        return Math.max(0, Math.ceil(max - contentOverflow));
    }

    /** Sort by precomputed {@link EffectBand.sortKey} (placementCategory, order desc, voice, renderer). */
    private static _sortByPriority(bands: EffectBand[]): void {
        bands.sort((a, b) => a.sortKey - b.sortKey);
    }

    private _placeSide(
        bands: EffectBand[],
        sky: Skyline,
        contentSky: Skyline | null,
        pad: number,
        isTop: boolean
    ): void {
        const groupBands = this._groupBands;
        const groupXStarts = this._groupXStarts;
        const groupXEnds = this._groupXEnds;
        let i = 0;
        while (i < bands.length) {
            const band = bands[i];

            // Group same-magnitude bands: HorizontalRow row mates or linked-chain continuations.
            // Two-phase: query all members without inserting (so chain members don't see each other),
            // then commit every member at the group's max magnitude.
            let groupEnd = i + 1;
            const groupEffectId = band.info.effectId;
            const groupVoiceIndex = band.voice.index;
            if (band.info.placementCategory === EffectBandPlacementCategory.HorizontalRow) {
                while (
                    groupEnd < bands.length &&
                    bands[groupEnd].info.placementCategory === EffectBandPlacementCategory.HorizontalRow &&
                    bands[groupEnd].info.effectId === groupEffectId &&
                    bands[groupEnd].voice.index === groupVoiceIndex
                ) {
                    groupEnd++;
                }
            } else {
                while (
                    groupEnd < bands.length &&
                    bands[groupEnd].info.effectId === groupEffectId &&
                    bands[groupEnd].voice.index === groupVoiceIndex &&
                    bands[groupEnd].isLinkedToPrevious
                ) {
                    groupEnd++;
                }
            }

            // Whole group shares one effectId/info, so the header policy is uniform.
            // Header-ignoring bands (bar numbers) query the content-only surface; the
            // clef/key/time never enters their magnitude.
            const querySky = contentSky !== null && band.info.ignoresStructuralHeader === true ? contentSky : sky;

            groupBands.splice(0, groupBands.length);
            groupXStarts.splice(0, groupXStarts.length);
            groupXEnds.splice(0, groupXEnds.length);
            let groupMagnitude = 0;
            for (let k = i; k < groupEnd; k++) {
                const m = bands[k];
                // one entry per occupied range (note-attached bands: one per glyph)
                const clearStarts = this._clearXStarts;
                const clearEnds = this._clearXEnds;
                clearStarts.splice(0, clearStarts.length);
                clearEnds.splice(0, clearEnds.length);
                const firstRange = groupXStarts.length;
                if (!m.collectPlacementRanges(clearStarts, clearEnds, groupXStarts, groupXEnds)) {
                    continue;
                }
                for (let r = firstRange; r < groupXStarts.length; r++) {
                    groupXStarts[r] = m.renderer.x + groupXStarts[r];
                    groupXEnds[r] = m.renderer.x + groupXEnds[r];
                    const clearStart = m.renderer.x + clearStarts[r - firstRange];
                    const clearEnd = m.renderer.x + clearEnds[r - firstRange];
                    const mag = isTop
                        ? querySky.placeAbove(clearStart, clearEnd, m.height, pad)
                        : querySky.placeBelow(clearStart, clearEnd, m.height, pad);
                    if (mag > groupMagnitude) {
                        groupMagnitude = mag;
                    }
                    groupBands.push(m);
                }
            }
            for (let k = 0; k < groupBands.length; k++) {
                const b = groupBands[k];
                b.placedMagnitude = groupMagnitude;
                // Always publish into the full skyline so later bands stack above this
                // one; mirror into the content surface (when present) so it stays a
                // faithful "content + placed bands, minus header" view for any later
                // header-ignoring band.
                sky.insert(groupXStarts[k], groupXEnds[k], groupMagnitude + b.height, pad);
                if (contentSky !== null) {
                    contentSky.insert(groupXStarts[k], groupXEnds[k], groupMagnitude + b.height, pad);
                }
            }
            i = groupEnd;
        }
    }
}
