import { MidiUtils } from '@src/midi/MidiUtils';
import type { Beat } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import { Spring } from '@src/rendering/staves/Spring';
import { ModelUtils } from '@src/model/ModelUtils';
import type { ICanvas } from '@src/platform/ICanvas';
import { GraceType } from '@src/model/GraceType';

/**
 * This public class stores size information about a stave.
 * It is used by the layout engine to collect the sizes of score parts
 * to align the parts across multiple staves.
 */
export class BarLayoutingInfo {
    private static readonly MinDuration: number = 30;
    private static readonly MinDurationWidth: number = 7;

    private _timeSortedSprings: Spring[] = [];
    private _minTime: number = -1;
    private _onTimePositionsForce: number = 0;
    private _onTimePositions: Map<number, number> = new Map();
    private _incompleteGraceRodsWidth: number = 0;

    // the smallest duration we have between two springs to ensure we have positive spring constants
    private _minDuration: number = BarLayoutingInfo.MinDuration;

    /**
     * an internal version number that increments whenever a change was made.
     */
    public version: number = 0;

    public preBeatSize: number = 0;
    public postBeatSize: number = 0;
    public minStretchForce: number = 0;
    public totalSpringConstant: number = 0;

    private updateMinStretchForce(force: number): void {
        if (this.minStretchForce < force) {
            this.minStretchForce = force;
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

    public addBeatSpring(beat: Beat, preBeatSize: number, postBeatSize: number): void {
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

        this.calculateSpringConstants();
        this.version++;
    }

    private calculateSpringConstants(): void {
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
            currentSpring.springConstant = this.calculateSpringConstant(currentSpring, duration);
            totalSpringConstant += 1 / currentSpring.springConstant;
        }
        this.totalSpringConstant = 1 / totalSpringConstant;

        // calculate the force required to have at least the minimum size.
        this.minStretchForce = 0;
        // We take the space required between current and next spring
        // and calculate the force needed so that the current spring
        // reserves enough space

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
            this.updateMinStretchForce(requiredSpaceForce);
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

    private calculateSpringConstant(spring: Spring, duration: number): number {
        if (duration <= 0) {
            duration = MidiUtils.toTicks(Duration.TwoHundredFiftySixth);
        }
        if (spring.smallestDuration === 0) {
            spring.smallestDuration = duration;
        }
        const smallestDuration: number = spring.smallestDuration;

        const minDuration = this._minDuration;
        const minDurationWidth = BarLayoutingInfo.MinDurationWidth;

        const phi: number = 1 + 0.85 * Math.log2(duration / minDuration);
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
            width = this.calculateWidth(force, this.totalSpringConstant);
        }

        if (this._timeSortedSprings.length > 0) {
            width += this._timeSortedSprings[0].preSpringWidth;
        }
        width += this._incompleteGraceRodsWidth;
        return width;
    }

    private calculateWidth(force: number, springConstant: number): number {
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
            springX += this.calculateWidth(force, sortedSprings[i].springConstant);
        }
        return positions;
    }
}
