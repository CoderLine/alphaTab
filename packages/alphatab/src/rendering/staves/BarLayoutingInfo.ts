import { MidiUtils } from '@coderline/alphatab/midi/MidiUtils';
import type { Beat } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import type { Track } from '@coderline/alphatab/model/Track';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { BeatContainerGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import type { IHeaderRodSink } from '@coderline/alphatab/rendering/staves/HeaderProfile';
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
 * One column of the bar header (start barline, staff inset, clef, key signature,
 * time signature ...) shared by all staves of a master bar. Header glyphs register
 * their extents around their anchor; the column takes the maximum of all staves.
 * @internal
 */
class HeaderRod {
    public rank: number = 0;
    public pre: number = 0;
    public post: number = 0;
    public offset: number = 0;
}

/**
 * This public class stores size information about a stave.
 * It is used by the layout engine to collect the sizes of score parts
 * to align the parts across multiple staves.
 * @internal
 */
export class BarLayoutingInfo implements IHeaderRodSink {
    /**
     * The longest duration (in ticks) the spacing reference can have; shorter durations in the score
     * lower the reference.
     */
    public static readonly defaultMinDuration: number = 30;
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
    private static readonly _noOnTimePositions: number[] = [];
    // the on-time positions of the last computed force and of the force before, see buildOnTimePositions
    private _onTimeForce: number = Number.NaN;
    private _onTimePositions: number[] = BarLayoutingInfo._noOnTimePositions;
    private _previousOnTimeForce: number = Number.NaN;
    private _previousOnTimePositions: number[] = BarLayoutingInfo._noOnTimePositions;
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

    // the duration reference of the spacing formula, shared by all bars of a layout,
    // or lowered by the bar's own springs when no reference was given
    private _minDuration: number;
    private readonly _usesLocalMinDuration: boolean;

    /** Precomputed `log2(spacingRatio)`. Default matches `DisplaySettings.spacingRatio = √2`. */
    private readonly _spacingExponent: number;

    // Safety floor preventing overlay items from touching at the minimum-force boundary
    // (rare; in normal layouts justification slack dominates).
    private static readonly _overlayMinPadding: number = 3;

    /**
     * The minimum padding between the content of two adjacent beats ({@link EngravingSettings.beatContentPadding}).
     */
    public readonly beatContentPadding: number;

    /**
     * The minimum padding between the content of the last beat and the bar line
     * ({@link EngravingSettings.barlineContentPadding}).
     */
    public readonly barlineContentPadding: number;

    public constructor(
        spacingRatio: number = Math.SQRT2,
        beatContentPadding: number = 0,
        barlineContentPadding: number = 0,
        minDuration: number = BarLayoutingInfo.defaultMinDuration,
        usesLocalMinDuration: boolean = false
    ) {
        this._minDuration = minDuration;
        this._usesLocalMinDuration = usesLocalMinDuration;
        this._spacingExponent = BarLayoutingInfo.spacingExponentFromRatio(spacingRatio);
        this.beatContentPadding = beatContentPadding;
        this.barlineContentPadding = barlineContentPadding;
    }

    /**
     * an internal version number that increments whenever a change was made.
     */
    public version: number = 0;

    /**
     * Header columns sorted by rank. Instances are pooled across resize cycles:
     * only the first {@link _headerRodCount} entries are valid.
     */
    private _headerRods: HeaderRod[] = [];
    private _headerRodCount: number = 0;
    private _headerRodsDirty: boolean = false;
    private _preBeatSize: number = 0;

    /**
     * The total width of the bar header (all header columns), shared across all staves.
     */
    public get preBeatSize(): number {
        if (this._headerRodsDirty) {
            this._updateHeaderRods();
        }
        return this._preBeatSize;
    }

    /**
     * Clears all header columns. Called at the start of each layout cycle of a system,
     * the bar renderers re-register their header glyphs afterwards.
     */
    public resetHeaderRods(): void {
        this._headerRodCount = 0;
        this._preBeatSize = 0;
        this._headerRodsDirty = false;
    }

    /**
     * Registers the extents of a header glyph around its anchor for the column identified by `rank`.
     * Columns are ordered by their rank, the same rank across staves forms one aligned column.
     * @param rank The rank identifying (and ordering) the column.
     * @param pre The extent left of the anchor.
     * @param post The extent right of the anchor (including the glyph's trailing spacing).
     */
    public addHeaderRod(rank: number, pre: number, post: number): void {
        const rods = this._headerRods;
        const count = this._headerRodCount;
        let insertPos = 0;
        while (insertPos < count && rods[insertPos].rank < rank) {
            insertPos++;
        }

        this._headerRodsDirty = true;
        if (insertPos < count && rods[insertPos].rank === rank) {
            const existing = rods[insertPos];
            if (existing.pre < pre) {
                existing.pre = pre;
            }
            if (existing.post < post) {
                existing.post = post;
            }
            return;
        }

        // reuse a pooled instance (from a previous cycle) if available
        let rod: HeaderRod;
        if (count < rods.length) {
            rod = rods[count];
            rods.splice(count, 1);
        } else {
            rod = new HeaderRod();
        }
        rod.rank = rank;
        rod.pre = pre;
        rod.post = post;
        rod.offset = 0;
        rods.splice(insertPos, 0, rod);
        this._headerRodCount = count + 1;
    }

    /**
     * Gets the x-position (relative to the header start) for a header glyph registered with
     * {@link addHeaderRod}, aligning its anchor with the anchors of the other staves.
     * @param rank The rank of the column.
     * @param ownPre The extent left of the anchor the glyph registered.
     */
    public getHeaderRodX(rank: number, ownPre: number): number {
        if (this._headerRodsDirty) {
            this._updateHeaderRods();
        }
        const rods = this._headerRods;
        for (let i = 0; i < this._headerRodCount; i++) {
            const rod = rods[i];
            if (rod.rank === rank) {
                return rod.offset + rod.pre - ownPre;
            }
        }
        return 0;
    }

    private _updateHeaderRods(): void {
        const rods = this._headerRods;
        let x = 0;
        for (let i = 0; i < this._headerRodCount; i++) {
            const rod = rods[i];
            rod.offset = x;
            x += rod.pre + rod.post;
        }
        this._preBeatSize = x;
        this._headerRodsDirty = false;
    }

    public postBeatSize: number = 0;
    public minStretchForce: number = 0;
    public totalSpringConstant: number = 0;

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

    public setBeatSizes(beat: BeatContainerGlyphBase, preBeatSize: number, onBeatSize: number) {
        const key = beat.absoluteDisplayStart;
        if (this._beatSizes.has(key)) {
            const current = this._beatSizes.get(key)!;
            if (current.onBeatSize < onBeatSize) {
                current.onBeatSize = onBeatSize;
            }

            if (current.preBeatSize < preBeatSize) {
                current.preBeatSize = preBeatSize;
            }
        } else {
            this._beatSizes.set(key, { preBeatSize, onBeatSize });
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
            if (this._usesLocalMinDuration && this._timeSortedSprings.length > 0 && duration < this._minDuration) {
                this._minDuration = duration;
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
            timeSorted.splice(insertPos + 1, 0, spring);
            for (let i = insertPos + 1; i < timeSorted.length; i++) {
                timeSorted[i].index = i;
            }
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

            beat.spring = this.addSpring(start, beat.displayDuration, graceBeatSize, preBeatSize, postBeatSize);
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
            // padding to the beat before the grace group (see MultiVoiceContainerGlyph)
            this._incompleteGraceRodsWidth += this.beatContentPadding;
            for (const sp of s) {
                this._incompleteGraceRodsWidth += sp.preBeatWidth + sp.postSpringWidth;
            }
        }

        this._calculateSpringConstants(this._minDuration);
        this.version++;
    }

    /**
     * The spacing duration reference for a layout: the shortest displayed beat duration of the
     * rendered bars, at most {@link defaultMinDuration}.
     */
    public static referenceMinDuration(tracks: Track[], firstBarIndex: number, lastBarIndex: number): number {
        let minDuration = BarLayoutingInfo.defaultMinDuration;
        for (const track of tracks) {
            for (const staff of track.staves) {
                const last = Math.min(lastBarIndex, staff.bars.length - 1);
                for (let i = firstBarIndex; i <= last; i++) {
                    for (const voice of staff.bars[i].voices) {
                        for (const beat of voice.beats) {
                            if (beat.graceType === GraceType.None) {
                                const duration = beat.displayDuration;
                                if (duration > 0 && duration < minDuration) {
                                    minDuration = duration;
                                }
                            }
                        }
                    }
                }
            }
        }
        return minDuration;
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
                requiredSpace = currentSpring.postSpringWidth + this.barlineContentPadding;
            } else {
                const nextSpring = sortedSprings[i + 1];
                requiredSpace = currentSpring.postSpringWidth + this.beatContentPadding + nextSpring.preSpringWidth;
            }

            // the first spring's pre-spring width is not part of the requirement:
            // it is a fixed offset in front of the first spring (see calculateVoiceWidth,
            // spaceToForce and buildOnTimePositions) and does not need to be stretched in.

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
    private _applyOverlayRodConstraints(rods: OverlayRod[], sortedSprings: Spring[], overlayPadding: number): void {
        if (rods.length === 0) {
            return;
        }

        // Pair-overlap pass: for each adjacent (A, B), sum 1/k over the springs
        // anchored in [A.timePosition, B.timePosition) and convert the required gap
        // `A.rightExtent + B.leftExtent + padding` to a force `requiredGap / invSum`.
        let springIdx = 0;
        while (springIdx < sortedSprings.length && sortedSprings[springIdx].timePosition !== rods[0].timePosition) {
            springIdx++;
        }

        for (let r = 1; r < rods.length; r++) {
            const a = rods[r - 1];
            const b = rods[r];

            let invSum = 0;
            while (springIdx < sortedSprings.length && sortedSprings[springIdx].timePosition !== b.timePosition) {
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
                const requiredForce = (overlayRightRequirement - this.postBeatSize) * lastSpring.springConstant;
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

    /**
     * The width of the bars of this master bar before justification, as
     * {@link BarRendererBase.applyLayoutingInfo} computes it.
     */
    public naturalBarWidth(stretchForce: number): number {
        const voiceWidth = this.calculateVoiceWidth(Math.max(stretchForce, this.minStretchForce));
        return Math.ceil(Math.floor(this.preBeatSize + voiceWidth) + this.postBeatSize);
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

    /**
     * The x positions of the time-sorted springs at the given force, indexed by {@link Spring.index}.
     * The result is shared: it stays valid until positions for two other forces were requested and
     * must not be modified.
     */
    public buildOnTimePositions(force: number): number[] {
        if (this.totalSpringConstant === -1) {
            return BarLayoutingInfo._noOnTimePositions;
        }
        if (ModelUtils.isAlmostEqualTo(this._onTimeForce, force)) {
            return this._onTimePositions;
        }

        // the layout alternates between the natural and the fitted force of a bar
        const previousForce = this._previousOnTimeForce;
        let positions = this._previousOnTimePositions;
        this._previousOnTimeForce = this._onTimeForce;
        this._previousOnTimePositions = this._onTimePositions;
        this._onTimeForce = force;
        if (previousForce === force) {
            this._onTimePositions = positions;
            return positions;
        }

        const sortedSprings: Spring[] = this._timeSortedSprings;
        if (positions.length !== sortedSprings.length) {
            positions = new Array<number>(sortedSprings.length);
        }
        this._onTimePositions = positions;
        if (sortedSprings.length === 0) {
            return positions;
        }

        let springX: number = sortedSprings[0].preSpringWidth;
        for (let i: number = 0; i < sortedSprings.length; i++) {
            positions[i] = springX;
            springX += this._calculateWidth(force, sortedSprings[i].springConstant);
        }
        return positions;
    }
}
