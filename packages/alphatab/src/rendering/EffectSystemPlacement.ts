import type { EffectBand, EffectBandXRange } from '@coderline/alphatab/rendering/EffectBand';
import { EffectBandPlacementCategory } from '@coderline/alphatab/rendering/EffectInfo';
import type { Skyline } from '@coderline/alphatab/rendering/skyline/Skyline';
import type { SkylineScratch } from '@coderline/alphatab/rendering/skyline/SkylineScratch';
import { StaffSystemSkyline } from '@coderline/alphatab/rendering/skyline/StaffSystemSkyline';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';

/**
 * Priority-ordered skyline oracle that positions every {@link EffectBand} on
 * a staff line. Fires from {@link RenderStaff.finalizeStaff}. One instance serves all staves of a
 * layout: it only holds scratch storage that is rebuilt for every staff.
 * @internal
 */
export class EffectSystemPlacement {
    /**
     * The full placement surface of the staff being finalized: content (notes/beams/ties) plus the
     * structural bar header, assembled from the bar-local skylines. Almost every effect band is
     * placed against this. The staff keeps a copy as {@link RenderStaff.systemSkyline}.
     */
    public readonly systemSkyline: StaffSystemSkyline;

    /**
     * The content-only placement surface of the staff being finalized: the same as
     * {@link systemSkyline} minus the structural bar header. Bands with
     * {@link EffectInfo.ignoresStructuralHeader} (bar numbers) are placed against this so the
     * clef/key/time, a fixed fixture already priced into the staff via scalar overflow, never
     * shoves them up. Only built for staves with such a band ({@link RenderStaff.placesAgainstContentOnly}).
     */
    public readonly contentSkyline: StaffSystemSkyline;

    private readonly _top: EffectBand[] = [];
    private readonly _bottom: EffectBand[] = [];
    private readonly _groupBands: EffectBand[] = [];
    private readonly _groupXStarts: number[] = [];
    private readonly _groupXEnds: number[] = [];
    private readonly _clearXStarts: number[] = [];
    private readonly _clearXEnds: number[] = [];

    public constructor(scratch: SkylineScratch) {
        this.systemSkyline = new StaffSystemSkyline(0, 0, 0, Number.MAX_SAFE_INTEGER, scratch);
        this.contentSkyline = new StaffSystemSkyline(0, 0, 0, Number.MAX_SAFE_INTEGER, scratch);
    }

    /**
     * Places the non-empty effect bands of the staff against {@link systemSkyline} (and {@link contentSkyline}),
     * which must hold the assembled skylines of the staff, and publishes them into it.
     * Must be followed by {@link apply} for the same staff.
     */
    public place(staff: RenderStaff): void {
        const sky = this.systemSkyline;
        const pad = staff.system.layout.renderer.settings.display.effectBandPaddingBottom;

        const top = this._top;
        const bottom = this._bottom;
        // pop() loops clear without reallocating the backing store (splice allocates a result
        // array, `.length = 0` drops the store; C#/Kotlin splice copies lists).
        while (top.length > 0) {
            top.pop();
        }
        while (bottom.length > 0) {
            bottom.pop();
        }

        // Filter non-empty bands and run `finalizeBand` (settles dynamic-height
        // effects like TabWhammy) in one walk.
        for (let i = 0; i < staff.barRenderers.length; i++) {
            const r = staff.barRenderers[i];
            const topBands = r.topEffects.bands;
            for (let j = 0, n = topBands.length; j < n; j++) {
                const b = topBands[j];
                if (!b.isEmpty) {
                    // Reset; `_placeSide` only writes it when computeLocalXRange succeeds,
                    // but the band-y loop reads it for every band.
                    b.placedMagnitude = 0;
                    b.finalizeBand();
                    top.push(b);
                }
            }
            const bottomBands = r.bottomEffects.bands;
            for (let j = 0, n = bottomBands.length; j < n; j++) {
                const b = bottomBands[j];
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
        const contentSky = staff.placesAgainstContentOnly ? this.contentSkyline : null;
        this._placeSide(top, sky.upSky, contentSky ? contentSky.upSky : null, pad, /* isTop */ true);
        this._placeSide(bottom, sky.downSky, contentSky ? contentSky.downSky : null, pad, /* isTop */ false);
    }

    /**
     * Reserves the placed bands in the renderer and staff overflows and positions them relative to the final
     * staff overflow. Overflow registered on the staff between {@link place} and this call is respected.
     */
    public apply(staff: RenderStaff): void {
        const top = this._top;
        const bottom = this._bottom;

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
        for (let i = 0, n = top.length; i < n; i++) {
            const band = top[i];
            band.y = staffTopOverflow - (band.placedMagnitude + band.height);
        }
        for (let i = 0, n = bottom.length; i < n; i++) {
            const band = bottom[i];
            band.y = band.placedMagnitude + band.renderer.bottomEffects.height - staffBottomOverflow;
        }
    }

    private static readonly _rangeScratch: EffectBandXRange = { xStart: 0, xEnd: 0 };

    /** The height the placed bands add on top of the given content overflow. */
    private static _effectsHeight(bands: EffectBand[], contentOverflow: number): number {
        let max = 0;
        for (const b of bands) {
            // bands without extent (e.g. hidden bar numbers) take no part in the placement
            if (b.computeLocalXRange(EffectSystemPlacement._rangeScratch)) {
                const outer = b.placedMagnitude + b.height;
                if (outer > max) {
                    max = outer;
                }
            }
        }
        return Math.max(0, Math.ceil(max - contentOverflow));
    }

    /**
     * Stable sort by precomputed {@link EffectBand.sortKey} (placementCategory, order desc, voice, renderer).
     * An in-place insertion sort: `sort` copies the list into a temporary store on every call.
     */
    private static _sortByPriority(bands: EffectBand[]): void {
        for (let i = 1, n = bands.length; i < n; i++) {
            const band = bands[i];
            const key = band.sortKey;
            let j = i - 1;
            while (j >= 0 && bands[j].sortKey > key) {
                bands[j + 1] = bands[j];
                j--;
            }
            bands[j + 1] = band;
        }
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

            while (groupBands.length > 0) {
                groupBands.pop();
            }
            while (groupXStarts.length > 0) {
                groupXStarts.pop();
            }
            while (groupXEnds.length > 0) {
                groupXEnds.pop();
            }
            let groupMagnitude = 0;
            for (let k = i; k < groupEnd; k++) {
                const m = bands[k];
                // one entry per occupied range (note-attached bands: one per glyph)
                const clearStarts = this._clearXStarts;
                const clearEnds = this._clearXEnds;
                while (clearStarts.length > 0) {
                    clearStarts.pop();
                }
                while (clearEnds.length > 0) {
                    clearEnds.pop();
                }
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
