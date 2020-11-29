import { MidiUtils } from '@src/midi/MidiUtils';
import { Beat } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import { Spring } from '@src/rendering/staves/Spring';
import { ModelUtils } from '@src/model/ModelUtils';
import { ICanvas } from '@src/platform/ICanvas';

/**
 * This public class stores size information about a stave.
 * It is used by the layout engine to collect the sizes of score parts
 * to align the parts across multiple staves.
 */
export class BarLayoutingInfo {
    private static readonly MinDuration: number = 30;
    private static readonly MinDurationWidth: number = 7;

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

    private updateMinStretchForce(force: number): void {
        if (this.minStretchForce < force) {
            this.minStretchForce = force;
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
        springs.forEach(spring => {
            if (spring.springWidth < this._xMin) {
                this._xMin = spring.springWidth;
            }
        });
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
        this.minStretchForce = 0;
        // We take the space required between current and next spring
        // and calculate the force needed so that the current spring
        // reserves enough space

        for (let i: number = 0; i < sortedSprings.length; i++) {
            let currentSpring = sortedSprings[i];
            let requiredSpace = 0;

            if (i === sortedSprings.length - 1) {
                requiredSpace = currentSpring.postSpringWidth;
            } else {
                let nextSpring = sortedSprings[i + 1];
                requiredSpace = currentSpring.postSpringWidth + nextSpring.preSpringWidth;
            }

            // for the first spring we need to ensure we take the initial 
            // pre-spring width into account
            if (i === 0) {
                requiredSpace += currentSpring.preSpringWidth;
            }

            let requiredSpaceForce = requiredSpace * currentSpring.springConstant;
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

    //     const height = this.height * settings.display.scale;
    //     cy -= height;

    //     canvas.color = settings.display.resources.mainGlyphColor;
    //     const font = settings.display.resources.effectFont.clone();
    //     font.size *= 0.8;
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
            duration = MidiUtils.toTicks(Duration.SixtyFourth);
        }
        if (spring.smallestDuration === 0) {
            spring.smallestDuration = duration;
        }
        let minDuration: number = spring.smallestDuration;
        let phi: number = 1 + 0.85 * Math.log2(duration / BarLayoutingInfo.MinDuration);
        return (minDuration / duration) * (1 / (phi * BarLayoutingInfo.MinDurationWidth));
    }

    public spaceToForce(space: number): number {
        if(this._timeSortedSprings.length > 0) {
            space -= this._timeSortedSprings[0].preSpringWidth
        }
        return space * this.totalSpringConstant;
    }

    public calculateVoiceWidth(force: number): number {
        let width = this.calculateWidth(force, this.totalSpringConstant);
        if(this._timeSortedSprings.length > 0) {
            width += this._timeSortedSprings[0].preSpringWidth
        }
        return width;
    }

    public calculateWidth(force: number, springConstant: number): number {
        return force / springConstant;
    }

    public buildOnTimePositions(force: number): Map<number, number> {
        if (ModelUtils.isAlmostEqualTo(this._onTimePositionsForce, force) && this._onTimePositions) {
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
