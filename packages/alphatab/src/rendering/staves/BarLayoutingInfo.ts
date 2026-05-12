import { MidiUtils } from '@coderline/alphatab/midi/MidiUtils';
import type { Beat } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { BeatContainerGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import { Spring } from '@coderline/alphatab/rendering/staves/Spring';

/**
 * @internal
 * @record
 */
interface BarLayoutingInfoBeatSizes {
    preBeatSize: number;
    onBeatSize: number;
}

/**
 * Minimum-distance constraint contributed by overlay content (lyrics, beat text)
 * attached to a beat. Records how far the overlay extends left/right of the beat's
 * onTime anchor.
 * @internal
 * @record
 */
interface OverlayRod {
    timePosition: number;
    leftExtent: number;
    rightExtent: number;
}

/**
 * This public class stores size information about a stave.
 * It is used by the layout engine to collect the sizes of score parts
 * to align the parts across multiple staves.
 * @internal
 */
export class BarLayoutingInfo {
    private static readonly _defaultMinDuration: number = 30;
    private static readonly _defaultMinDurationWidth: number = 6.5;

    // Valid range for `DisplaySettings.spacingRatio`. Outside this band the layout
    // degenerates (collapse below 1.2, runaway above 2.0).
    private static readonly _spacingRatioMin: number = 1.2;
    private static readonly _spacingRatioMax: number = 2.0;

    /**
     * Power-law exponent for the spring formula, from `DisplaySettings.spacingRatio`.
     * Clamps to `[_spacingRatioMin, _spacingRatioMax]`. By construction
     * `phi(2*dmin, dmin) === spacingRatio`.
     */
    public static spacingExponentFromRatio(spacingRatio: number): number {
        let r = spacingRatio;
        if (r < BarLayoutingInfo._spacingRatioMin) {
            r = BarLayoutingInfo._spacingRatioMin;
        } else if (r > BarLayoutingInfo._spacingRatioMax) {
            r = BarLayoutingInfo._spacingRatioMax;
        }
        return Math.log2(r);
    }

    private _timeSortedSprings: Spring[] = [];
    private _minTime: number = -1;
    private _onTimePositionsForce: number = 0;
    private _onTimePositions: Map<number, number> = new Map();
    private _incompleteGraceRodsWidth: number = 0;
    private _beatSizes: Map<number, BarLayoutingInfoBeatSizes> = new Map();

    /**
     * Overlay rods bucketed per visual band. Outer key is a `bandKey` (typically the
     * band's `NotationElement` stringified). Inner map keyed by `Spring.timePosition`.
     * Rods in different bands occupy different vertical tracks and never collide;
     * pair-overlap evaluates each band independently. Same-band, same-timePosition
     * registrations (lyric-on-score + lyric-on-tab for one beat) max-merge.
     */
    private _overlayRodsByBand: Map<string, Map<number, OverlayRod>> = new Map();

    /**
     * Per-band time-sorted view of {@link _overlayRodsByBand}. Maintained on insert
     * via the same insertion-sort {@link addSpring} uses on {@link _timeSortedSprings}.
     */
    private _timeSortedOverlayRodsByBand: Map<string, OverlayRod[]> = new Map();

    // the smallest duration we have between two springs to ensure we have positive spring constants
    private _minDuration: number = BarLayoutingInfo._defaultMinDuration;

    /** Precomputed `log2(spacingRatio)`. Default matches `DisplaySettings.spacingRatio = √2`. */
    private readonly _spacingExponent: number;

    // Safety floor preventing overlay items from touching at the minimum-force boundary
    // (rare; in normal layouts justification slack dominates).
    private static readonly _overlayMinPadding: number = 3;

    public constructor(spacingRatio: number = Math.SQRT2) {
        this._spacingExponent = BarLayoutingInfo.spacingExponentFromRatio(spacingRatio);
    }

    /**
     * an internal version number that increments whenever a change was made.
     */
    public version: number = 0;

    public preBeatSize: number = 0;
    public postBeatSize: number = 0;
    public minStretchForce: number = 0;
    public totalSpringConstant: number = 0;

    /**
     * The smallest note duration encountered within this bar's springs, used as the reference in
     * the Gourlay stretch formula. Read by the owning {@link StaffSystem} so that the system can
     * aggregate a shared minimum across all bars and trigger a reconcile if an added bar introduces
     * a shorter duration than previously seen.
     */
    public get localMinDuration(): number {
        return this._minDuration;
    }

    /**
     * The minimum-duration reference against which the spring constants currently held by this info
     * were computed. Set by {@link finish} and {@link recomputeSpringConstants}. The owning
     * StaffSystem compares this against its system-wide minimum to decide whether spring constants
     * need re-derivation.
     */
    public computedWithMinDuration: number = 0;

    private _updateMinStretchForce(force: number): void {
        if (this.minStretchForce < force) {
            this.minStretchForce = force;
        }
    }

    public getBeatSizes(beat: Beat) {
        const key = beat.absoluteDisplayStart;
        if (this._beatSizes.has(key)) {
            return this._beatSizes.get(key);
        }
        return undefined;
    }

    public setBeatSizes(beat: BeatContainerGlyphBase, sizes: BarLayoutingInfoBeatSizes) {
        const key = beat.absoluteDisplayStart;
        if (this._beatSizes.has(key)) {
            const current = this._beatSizes.get(key)!;
            if (current.onBeatSize < sizes.onBeatSize) {
                current.onBeatSize = sizes.onBeatSize;
            }

            if (current.preBeatSize < sizes.preBeatSize) {
                current.preBeatSize = sizes.preBeatSize;
            }
        } else {
            this._beatSizes.set(key, sizes);
        }
    }

    public getPreBeatSize(beat: Beat) {
        if (beat.graceType !== GraceType.None) {
            const groupId = beat.graceGroup!.id;
            const graceRod = this.allGraceRods.get(groupId)![beat.graceIndex];
            return graceRod.preBeatWidth;
        }
        const start: number = beat.absoluteDisplayStart;
        if (!this.springs.has(start)) {
            return 0;
        }

        return this.springs.get(start)!.preBeatWidth;
    }

    public getPostBeatSize(beat: Beat) {
        if (beat.graceType !== GraceType.None) {
            const groupId = beat.graceGroup!.id;
            const graceRod = this.allGraceRods.get(groupId)![beat.graceIndex];
            return graceRod.postSpringWidth;
        }
        const start: number = beat.absoluteDisplayStart;
        if (!this.springs.has(start)) {
            return 0;
        }

        return this.springs.get(start)!.postSpringWidth;
    }

    public incompleteGraceRods: Map<string, Spring[]> = new Map();
    public allGraceRods: Map<string, Spring[]> = new Map();
    public springs: Map<number, Spring> = new Map();

    public addSpring(
        start: number,
        duration: number,
        graceBeatWidth: number,
        preBeatWidth: number,
        postSpringSize: number
    ): Spring {
        this.version++;
        let spring: Spring;
        if (!this.springs.has(start)) {
            spring = new Spring();
            spring.timePosition = start;
            spring.allDurations.add(duration);
            // check in the previous spring for the shortest duration that overlaps with this spring
            // Gourlay defines that we need the smallest note duration that either starts **or continues** on the current spring.
            if (this._timeSortedSprings.length > 0) {
                let smallestDuration: number = duration;
                const previousSpring: Spring = this._timeSortedSprings[this._timeSortedSprings.length - 1];
                for (const prevDuration of previousSpring.allDurations) {
                    const end: number = previousSpring.timePosition + prevDuration;
                    if (end >= start && prevDuration < smallestDuration) {
                        smallestDuration = prevDuration;
                    }
                }
                //spring.smallestDuration = duration;
                if (duration < this._minDuration) {
                    this._minDuration = duration;
                }
            }
            spring.longestDuration = duration;
            spring.postSpringWidth = postSpringSize;
            spring.graceBeatWidth = graceBeatWidth;
            spring.preBeatWidth = preBeatWidth;
            this.springs.set(start, spring);
            const timeSorted: Spring[] = this._timeSortedSprings;
            let insertPos: number = timeSorted.length - 1;
            while (insertPos > 0 && timeSorted[insertPos].timePosition > start) {
                insertPos--;
            }
            this._timeSortedSprings.splice(insertPos + 1, 0, spring);
        } else {
            spring = this.springs.get(start)!;
            if (spring.postSpringWidth < postSpringSize) {
                spring.postSpringWidth = postSpringSize;
            }
            if (spring.graceBeatWidth < graceBeatWidth) {
                spring.graceBeatWidth = graceBeatWidth;
            }
            if (spring.preBeatWidth < preBeatWidth) {
                spring.preBeatWidth = preBeatWidth;
            }
            if (duration < spring.smallestDuration) {
                spring.smallestDuration = duration;
            }
            if (duration > spring.longestDuration) {
                spring.longestDuration = duration;
            }
            spring.allDurations.add(duration);
        }
        if (this._minTime === -1 || this._minTime > start) {
            this._minTime = start;
        }
        return spring;
    }

    public addBeatSpring(beat: BeatContainerGlyphBase, preBeatSize: number, postBeatSize: number): void {
        const start: number = beat.absoluteDisplayStart;
        if (beat.graceType !== GraceType.None) {
            // For grace beats we just remember the the sizes required for them
            // these sizes are then considered when the target beat is added.

            const groupId = beat.graceGroup!.id;

            if (!this.allGraceRods.has(groupId)) {
                this.allGraceRods.set(groupId, new Array<Spring>(beat.graceGroup!.beats.length));
            }

            if (!beat.graceGroup!.isComplete && !this.incompleteGraceRods.has(groupId)) {
                this.incompleteGraceRods.set(groupId, new Array<Spring>(beat.graceGroup!.beats.length));
            }

            const existingSpring = this.allGraceRods.get(groupId)![beat.graceIndex];
            if (existingSpring) {
                if (existingSpring.postSpringWidth < postBeatSize) {
                    existingSpring.postSpringWidth = postBeatSize;
                }
                if (existingSpring.preBeatWidth < preBeatSize) {
                    existingSpring.preBeatWidth = preBeatSize;
                }
            } else {
                const graceSpring = new Spring();
                graceSpring.timePosition = start;
                graceSpring.postSpringWidth = postBeatSize;
                graceSpring.preBeatWidth = preBeatSize;
                if (!beat.graceGroup!.isComplete) {
                    this.incompleteGraceRods.get(groupId)![beat.graceIndex] = graceSpring;
                }
                this.allGraceRods.get(groupId)![beat.graceIndex] = graceSpring;
            }
        } else {
            let graceBeatSize = 0;
            if (beat.graceGroup && this.allGraceRods.has(beat.graceGroup.id)) {
                for (const graceBeat of this.allGraceRods.get(beat.graceGroup.id)!) {
                    graceBeatSize += graceBeat.springWidth;
                }
            }

            this.addSpring(start, beat.displayDuration, graceBeatSize, preBeatSize, postBeatSize);
        }
    }

    /**
     * Registers an overlay rod for a beat into the bucket identified by `bandKey`
     * (typically `String(band.info.notationElement)`). Same-band, same-timePosition
     * duplicates max-merge.
     */
    public addOverlayRod(bandKey: string, timePosition: number, leftExtent: number, rightExtent: number): void {
        this.version++;
        let bandMap = this._overlayRodsByBand.get(bandKey);
        let bandSorted = this._timeSortedOverlayRodsByBand.get(bandKey);
        if (!bandMap) {
            bandMap = new Map<number, OverlayRod>();
            this._overlayRodsByBand.set(bandKey, bandMap);
            bandSorted = [];
            this._timeSortedOverlayRodsByBand.set(bandKey, bandSorted);
        }
        const rod = bandMap.get(timePosition);
        if (!rod) {
            const newRod: OverlayRod = { timePosition, leftExtent, rightExtent };
            bandMap.set(timePosition, newRod);
            const timeSorted: OverlayRod[] = bandSorted!;
            let insertPos: number = timeSorted.length - 1;
            while (insertPos > 0 && timeSorted[insertPos].timePosition > timePosition) {
                insertPos--;
            }
            timeSorted.splice(insertPos + 1, 0, newRod);
        } else {
            if (rod.leftExtent < leftExtent) {
                rod.leftExtent = leftExtent;
            }
            if (rod.rightExtent < rightExtent) {
                rod.rightExtent = rightExtent;
            }
        }
    }

    public finish(): void {
        for (const [_, s] of this.allGraceRods) {
            // for grace beats we store the offset
            // in the 'graceBeatWidth' for later use during applying
            // beat positions
            let x = 0;
            for (const sp of s) {
                x += sp.preBeatWidth;
                sp.graceBeatWidth = x;
                x += sp.postSpringWidth;
            }
        }
        this._incompleteGraceRodsWidth = 0;
        for (const s of this.incompleteGraceRods.values()) {
            for (const sp of s) {
                this._incompleteGraceRodsWidth += sp.preBeatWidth + sp.postSpringWidth;
            }
        }

        this._calculateSpringConstants(this._minDuration);
        this.computedWithMinDuration = this._minDuration;
        this.version++;
    }

    /**
     * Re-derives the spring constants (and {@link minStretchForce} / {@link totalSpringConstant})
     * using a caller-supplied minimum-duration reference rather than this bar's local minimum.
     *
     * Called by {@link StaffSystem.reconcileMinDurationIfDirty} when a bar added later to the
     * system introduced a shorter note than previously seen, invalidating this bar's spring
     * constants. Grace-rod data is not recomputed — it is independent of the minimum-duration
     * reference. The internal {@link version} is bumped so downstream consumers (e.g.
     * {@link BarRendererBase.applyLayoutingInfo}) pick up the refreshed positions.
     */
    public recomputeSpringConstants(minDuration: number): void {
        this._calculateSpringConstants(minDuration);
        this.computedWithMinDuration = minDuration;
        this.version++;
    }

    private _calculateSpringConstants(minDuration: number): void {
        let totalSpringConstant: number = 0;
        const sortedSprings: Spring[] = this._timeSortedSprings;
        if (sortedSprings.length === 0) {
            this.totalSpringConstant = -1;
            this.minStretchForce = -1;
            return;
        }
        for (let i: number = 0; i < sortedSprings.length; i++) {
            const currentSpring: Spring = sortedSprings[i];
            let duration: number = 0;
            if (i === sortedSprings.length - 1) {
                duration = currentSpring.longestDuration;
            } else {
                const nextSpring: Spring = sortedSprings[i + 1];
                duration = Math.abs(nextSpring.timePosition - currentSpring.timePosition);
            }
            currentSpring.springConstant = this._calculateSpringConstant(currentSpring, duration, minDuration);
            totalSpringConstant += 1 / currentSpring.springConstant;
        }
        this.totalSpringConstant = 1 / totalSpringConstant;

        // calculate the force required to have at least the minimum size.
        this.minStretchForce = 0;
        for (let i: number = 0; i < sortedSprings.length; i++) {
            const currentSpring = sortedSprings[i];
            let requiredSpace = 0;

            if (i === sortedSprings.length - 1) {
                requiredSpace = currentSpring.postSpringWidth;
            } else {
                const nextSpring = sortedSprings[i + 1];
                requiredSpace = currentSpring.postSpringWidth + nextSpring.preSpringWidth;
            }

            // for the first spring we need to ensure we take the initial
            // pre-spring width into account
            if (i === 0) {
                requiredSpace += currentSpring.preSpringWidth;
            }

            const requiredSpaceForce = requiredSpace * currentSpring.springConstant;
            this._updateMinStretchForce(requiredSpaceForce);
        }

        // Overlay rods: pair-overlap + last-rod phantom-next-beat per band. Bands
        // occupy different vertical tracks (lyric below, beat-text above, ...) so
        // each bucket is evaluated independently and their forces max-merge into
        // `minStretchForce`.
        // TODO(overlay-rods, cross-bar): bar-local only. A system-level accumulator
        // could pair bar N's last rod with bar N+1's first rod across the boundary.
        const overlayPadding = BarLayoutingInfo._overlayMinPadding;
        for (const rods of this._timeSortedOverlayRodsByBand.values()) {
            this._applyOverlayRodConstraints(rods, sortedSprings, overlayPadding);
        }
    }

    /**
     * Pair-overlap + last-rod phantom-next-beat for a single band's rod list.
     * Called once per band by {@link _calculateSpringConstants}.
     */
    private _applyOverlayRodConstraints(
        rods: OverlayRod[],
        sortedSprings: Spring[],
        overlayPadding: number
    ): void {
        if (rods.length === 0) {
            return;
        }

        // Pair-overlap pass: for each adjacent (A, B), sum 1/k over the springs
        // anchored in [A.timePosition, B.timePosition) and convert the required gap
        // `A.rightExtent + B.leftExtent + padding` to a force `requiredGap / invSum`.
        let springIdx = 0;
        while (
            springIdx < sortedSprings.length &&
            sortedSprings[springIdx].timePosition !== rods[0].timePosition
        ) {
            springIdx++;
        }

        for (let r = 1; r < rods.length; r++) {
            const a = rods[r - 1];
            const b = rods[r];

            let invSum = 0;
            while (
                springIdx < sortedSprings.length &&
                sortedSprings[springIdx].timePosition !== b.timePosition
            ) {
                invSum += 1 / sortedSprings[springIdx].springConstant;
                springIdx++;
            }

            const requiredGap = a.rightExtent + b.leftExtent + overlayPadding;
            if (requiredGap > 0 && invSum > 0) {
                const overlayForce = requiredGap / invSum;
                this._updateMinStretchForce(overlayForce);
            }
        }

        // Last-rod phantom-next-beat: treat the bar's right edge as a phantom beat
        // with leftExtent=0. Natural gap = force/k_last + postBeatSize, floored by
        // lastSpring.postSpringWidth + postBeatSize. Fires only on overflow.
        // TODO: symmetric handling for the first beat's
        // LEFT edge is an accepted MVP gap (no force-scaled gap before first onTime).
        const lastRod = rods[rods.length - 1];
        const lastSpring = sortedSprings[sortedSprings.length - 1];
        if (lastRod.timePosition === lastSpring.timePosition) {
            const overlayRightRequirement = lastRod.rightExtent + overlayPadding;
            const naturalRightBudget = lastSpring.postSpringWidth + this.postBeatSize;
            if (overlayRightRequirement > naturalRightBudget) {
                const requiredForce =
                    (overlayRightRequirement - this.postBeatSize) * lastSpring.springConstant;
                this._updateMinStretchForce(requiredForce);
            }
        }
    }

    public height: number = 0;
    public paint(_cx: number, _cy: number, _canvas: ICanvas) {}

    // public height: number = 30;
    // public paint(cx: number, cy: number, canvas: ICanvas) {
    //     let sortedSprings: Spring[] = this._timeSortedSprings;
    //     if (sortedSprings.length === 0) {
    //         return;
    //     }

    //     const settings = canvas.settings;
    //     const force = Math.max(settings.display.stretchForce, this.minStretchForce);

    //     const height = this.height;
    //     cy -= height;

    //     canvas.color = settings.display.resources.mainGlyphColor;
    //     const font = settings.display.resources.effectFont.withSize(settings.display.resources.effectFont.size * 0.8);
    //     canvas.font = font;
    //     canvas.fillText(force.toFixed(2), cx, cy);

    //     cy += settings.display.resources.effectFont.size * 1.5;

    //     let springX: number = sortedSprings[0].preSpringWidth;
    //     for (let i: number = 0; i < sortedSprings.length; i++) {
    //         const spring = sortedSprings[i];

    //         canvas.color = new Color(0, 0, 255, 100);
    //         canvas.fillRect(cx + springX - spring.preSpringWidth, cy, spring.preSpringWidth, height / 2);

    //         canvas.color = new Color(0, 255, 0, 100);
    //         canvas.fillRect(cx + springX, cy, spring.postSpringWidth, height / 2);

    //         canvas.color = settings.display.resources.mainGlyphColor;
    //         canvas.moveTo(cx + springX, cy);
    //         canvas.lineTo(cx + springX, cy + height / 2);
    //         canvas.stroke();

    //         springX += this.calculateWidth(force, spring.springConstant);
    //     }
    // }

    private _calculateSpringConstant(spring: Spring, duration: number, minDuration: number): number {
        if (duration <= 0) {
            duration = MidiUtils.toTicks(Duration.TwoHundredFiftySixth);
        }
        if (spring.smallestDuration === 0) {
            spring.smallestDuration = duration;
        }
        const smallestDuration: number = spring.smallestDuration;

        const minDurationWidth = BarLayoutingInfo._defaultMinDurationWidth;

        // Power-law (Dorico/MuseScore/Finale) model: phi grows as a configurable power of the
        // duration ratio so that doubling the duration multiplies horizontal allocation by
        // exactly `spacingRatio` (= 2 ^ _spacingExponent). Replaces the previous additive
        // `1 + 0.85 * log2(d/dmin)` formula which produced a compressing ratio at long
        // durations and caused rest-only bars to balloon under high stretch force.
        const phi: number = Math.pow(duration / minDuration, this._spacingExponent);
        return (smallestDuration / duration) * (1 / (phi * minDurationWidth));
    }

    public spaceToForce(space: number): number {
        if (this.totalSpringConstant !== -1) {
            if (this._timeSortedSprings.length > 0) {
                space -= this._timeSortedSprings[0].preSpringWidth;
            }
            space -= this._incompleteGraceRodsWidth;
            return Math.max(space, 0) * this.totalSpringConstant;
        }
        return -1;
    }

    public calculateVoiceWidth(force: number): number {
        let width = 0;
        if (this.totalSpringConstant !== -1) {
            width = this._calculateWidth(force, this.totalSpringConstant);
        }

        if (this._timeSortedSprings.length > 0) {
            width += this._timeSortedSprings[0].preSpringWidth;
        }
        width += this._incompleteGraceRodsWidth;
        return width;
    }

    private _calculateWidth(force: number, springConstant: number): number {
        return force / springConstant;
    }

    public buildOnTimePositions(force: number): Map<number, number> {
        if (this.totalSpringConstant === -1) {
            return new Map<number, number>();
        }
        if (ModelUtils.isAlmostEqualTo(this._onTimePositionsForce, force) && this._onTimePositions) {
            return this._onTimePositions;
        }
        this._onTimePositionsForce = force;
        const positions: Map<number, number> = new Map<number, number>();
        this._onTimePositions = positions;
        const sortedSprings: Spring[] = this._timeSortedSprings;
        if (sortedSprings.length === 0) {
            return positions;
        }
        let springX: number = sortedSprings[0].preSpringWidth;
        for (let i: number = 0; i < sortedSprings.length; i++) {
            positions.set(sortedSprings[i].timePosition, springX);
            springX += this._calculateWidth(force, sortedSprings[i].springConstant);
        }
        return positions;
    }
}
