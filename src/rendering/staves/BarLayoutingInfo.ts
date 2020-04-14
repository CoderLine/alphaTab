import { MidiUtils } from '@src/audio/util/MidiUtils';
import { Beat } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import { Platform } from '@src/platform/Platform';
import { Spring } from '@src/rendering/staves/Spring';

/**
 * This public class stores size information about a stave.
 * It is used by the layout engine to collect the sizes of score parts
 * to align the parts across multiple staves.
 */
export class BarLayoutingInfo {
    private static readonly MinDuration: number = 30;
    private static readonly MinDurationWidth: number = 10;

    private _timeSortedSprings: Spring[] = [];
    private _xMin: number = 0;
    private _minTime: number = -1;
    private _onTimePositionsForce: number = 0;
    private _onTimePositions: Map<number, number> = new Map();

    /**
     * an internal version number that increments whenever a change was made.
     */
    public version: number = 0;

    public preBeatSizes: Map<number, number> = new Map();
    public onBeatSizes: Map<number, number> = new Map();
    public onBeatCenterX: Map<number, number> = new Map();
    public preBeatSize: number = 0;
    public postBeatSize: number = 0;
    public voiceSize: number = 0;
    public minStretchForce: number = 0;
    public totalSpringConstant: number = 0;

    public updateVoiceSize(size: number): void {
        if (size > this.voiceSize) {
            this.voiceSize = size;
            this.version++;
        }
    }

    public setPreBeatSize(beat: Beat, size: number): void {
        if (!this.preBeatSizes.has(beat.index) || this.preBeatSizes.get(beat.index)! < size) {
            this.preBeatSizes.set(beat.index, size);
            this.version++;
        }
    }

    public getPreBeatSize(beat: Beat): number {
        if (this.preBeatSizes.has(beat.index)) {
            return this.preBeatSizes.get(beat.index)!;
        }
        return 0;
    }

    public setOnBeatSize(beat: Beat, size: number): void {
        if (!this.onBeatSizes.has(beat.index) || this.onBeatSizes.get(beat.index)! < size) {
            this.onBeatSizes.set(beat.index, size);
            this.version++;
        }
    }

    public getOnBeatSize(beat: Beat): number {
        if (this.onBeatSizes.has(beat.index)) {
            return this.onBeatSizes.get(beat.index)!;
        }
        return 0;
    }

    public getBeatCenterX(beat: Beat): number {
        if (this.onBeatCenterX.has(beat.index)) {
            return this.onBeatCenterX.get(beat.index)!;
        }
        return 0;
    }

    public setBeatCenterX(beat: Beat, x: number): void {
        if (!this.onBeatCenterX.has(beat.index) || this.onBeatCenterX.get(beat.index)! < x) {
            this.onBeatCenterX.set(beat.index, x);
            this.version++;
        }
    }

    public updateMinStretchForce(force: number): void {
        if (this.minStretchForce < force) {
            this.minStretchForce = force;
            this.version++;
        }
    }

    public springs: Map<number, Spring> = new Map();

    public addSpring(start: number, duration: number, preSpringSize: number, postSpringSize: number): Spring {
        this.version++;
        let spring: Spring;
        if (!this.springs.has(start)) {
            spring = new Spring();
            spring.timePosition = start;
            spring.allDurations.push(duration);
            // check in the previous spring for the shortest duration that overlaps with this spring
            // Gourlay defines that we need the smallest note duration that either starts **or continues** on the current spring.
            if (this._timeSortedSprings.length > 0) {
                let smallestDuration: number = duration;
                let previousSpring: Spring = this._timeSortedSprings[this._timeSortedSprings.length - 1];
                for (let prevDuration of previousSpring.allDurations) {
                    let end: number = previousSpring.timePosition + prevDuration;
                    if (end >= start && prevDuration < smallestDuration) {
                        smallestDuration = prevDuration;
                    }
                }
            }
            spring.longestDuration = duration;
            spring.postSpringWidth = postSpringSize;
            spring.preSpringWidth = preSpringSize;
            this.springs.set(start, spring);
            let timeSorted: Spring[] = this._timeSortedSprings;
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
            if (spring.preSpringWidth < preSpringSize) {
                spring.preSpringWidth = preSpringSize;
            }
            if (duration < spring.smallestDuration) {
                spring.smallestDuration = duration;
            }
            if (duration > spring.longestDuration) {
                spring.longestDuration = duration;
            }
            spring.allDurations.push(duration);
        }
        if (this._minTime === -1 || this._minTime > start) {
            this._minTime = start;
        }
        return spring;
    }

    public addBeatSpring(beat: Beat, preBeatSize: number, postBeatSize: number): Spring {
        let start: number = beat.absoluteDisplayStart;
        return this.addSpring(start, beat.displayDuration, preBeatSize, postBeatSize);
    }

    public finish(): void {
        this.calculateSpringConstants();
        this.version++;
    }

    private calculateSpringConstants(): void {
        this._xMin = 0;
        let springs: Map<number, Spring> = this.springs;
        for (let kvp of springs) {
            let spring: Spring = kvp[1];
            if (spring.springWidth < this._xMin) {
                this._xMin = spring.springWidth;
            }
        }
        let totalSpringConstant: number = 0;
        let sortedSprings: Spring[] = this._timeSortedSprings;
        for (let i: number = 0; i < sortedSprings.length; i++) {
            let currentSpring: Spring = sortedSprings[i];
            let duration: number = 0;
            if (i === sortedSprings.length - 1) {
                duration = currentSpring.longestDuration;
            } else {
                let nextSpring: Spring = sortedSprings[i + 1];
                duration = Math.abs(nextSpring.timePosition - currentSpring.timePosition);
            }
            currentSpring.springConstant = this.calculateSpringConstant(currentSpring, duration);
            totalSpringConstant += 1 / currentSpring.springConstant;
        }
        this.totalSpringConstant = 1 / totalSpringConstant;
        // calculate the force required to have at least the minimum size.
        for (let i: number = 0; i < sortedSprings.length; i++) {
            let force: number = sortedSprings[i].springWidth * sortedSprings[i].springConstant;
            this.updateMinStretchForce(force);
        }
    }

    private calculateSpringConstant(spring: Spring, duration: number): number {
        if (duration <= 0) {
            duration = MidiUtils.toTicks(Duration.SixtyFourth);
        }
        if (spring.smallestDuration === 0) {
            spring.smallestDuration = duration;
        }
        let minDuration: number = spring.smallestDuration;
        let phi: number = 1 + 0.6 * Math.log2(duration / BarLayoutingInfo.MinDuration);
        return (minDuration / duration) * (1 / (phi * BarLayoutingInfo.MinDurationWidth));
    }

    public spaceToForce(space: number): number {
        return space * this.totalSpringConstant;
    }

    public calculateVoiceWidth(force: number): number {
        return this.calculateWidth(force, this.totalSpringConstant);
    }

    public calculateWidth(force: number, springConstant: number): number {
        return force / springConstant;
    }

    public buildOnTimePositions(force: number): Map<number, number> {
        if (Platform.isAlmostEqualTo(this._onTimePositionsForce, force) && this._onTimePositions) {
            return this._onTimePositions;
        }
        this._onTimePositionsForce = force;
        let positions: Map<number, number> = (this._onTimePositions = new Map<number, number>());
        let sortedSprings: Spring[] = this._timeSortedSprings;
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
