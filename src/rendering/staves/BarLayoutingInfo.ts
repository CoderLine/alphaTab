import { MidiUtils } from '@src/midi/MidiUtils';
import { Beat } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import { Spring } from '@src/rendering/staves/Spring';
import { ModelUtils } from '@src/model/ModelUtils';
import { ICanvas } from '@src/platform/ICanvas';
import { GraceType } from '@src/model/GraceType';
import { BeamingHelper } from '../utils/BeamingHelper';

class ReservedLayoutAreaSlot {
    public topY: number = 0;
    public bottomY: number = 0;
    public constructor(topY: number, bottomY: number) {
        this.topY = topY;
        this.bottomY = bottomY;
    }
}
class ReservedLayoutArea {
    public topY: number = -1000;
    public bottomY: number = -1000;
    public slots: ReservedLayoutAreaSlot[] = [];

    public addSlot(topY: number, bottomY: number) {
        if (topY == bottomY) {
            return;
        }
        this.slots.push(new ReservedLayoutAreaSlot(topY, bottomY));
        if (this.topY === -1000) {
            this.topY = topY;
            this.bottomY = bottomY;
        } else {
            const min = Math.min(topY, bottomY);
            const max = Math.max(topY, bottomY);
            if (min < this.topY) {
                this.topY = min;
            }
            if (max > this.bottomY) {
                this.bottomY = max;
            }
        }
    }
}

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
    private _incompleteGraceRodsWidth: number = 0;

    /**
     * an internal version number that increments whenever a change was made.
     */
    public version: number = 0;

    private _reservedLayoutAreasByDisplayTime: Map<number, ReservedLayoutArea> = new Map();
    public preBeatSizes: Map<number, number> = new Map();
    public onBeatSizes: Map<number, number> = new Map();
    public onBeatCenterX: Map<number, number> = new Map();
    public preBeatSize: number = 0;
    public postBeatSize: number = 0;
    public voiceSize: number = 0;
    public minStretchForce: number = 0;
    public totalSpringConstant: number = 0;
    public restDurationsByDisplayTime: Map<number/*start*/, Map<number/*duration*/, number/*beat id*/>> = new Map();

    public updateVoiceSize(size: number): void {
        if (size > this.voiceSize) {
            this.voiceSize = size;
            this.version++;
        }
    }

    public getBeatMinMaxY(): number[] {
        let minY = -1000;
        let maxY = -1000;
        this._reservedLayoutAreasByDisplayTime.forEach((v, k) => {
            if (minY === -1000) {
                minY = v.topY;
                maxY = v.bottomY;
            } else {
                if (minY > v.topY) {
                    minY = v.topY;
                }
                if (maxY < v.bottomY) {
                    maxY = v.bottomY;
                }
            }
        });

        if (minY === -1000) {
            return [0, 0];
        }
        return [minY, maxY];
    }

    public setBeatYPositions(beat: Beat, topY: number, bottomY: number): void {
        if (!this._reservedLayoutAreasByDisplayTime.has(beat.displayStart)) {
            this._reservedLayoutAreasByDisplayTime.set(beat.displayStart, new ReservedLayoutArea());
        }
        this._reservedLayoutAreasByDisplayTime.get(beat.displayStart)!.addSlot(topY, bottomY);
        if (beat.isRest) {
            this.registerRest(beat);

        }
    }
    
    public registerRest(beat: Beat) {
        if (!this.restDurationsByDisplayTime.has(beat.displayStart)) {
            this.restDurationsByDisplayTime.set(beat.displayStart, new Map<number, number>());
        }
        if (!this.restDurationsByDisplayTime.get(beat.displayStart)!.has(beat.playbackDuration)) {
            this.restDurationsByDisplayTime.get(beat.displayStart)!.set(beat.playbackDuration, beat.id);
        }
    }

    public applyRestCollisionOffset(beat: Beat, currentY: number, linesToPixel: number): number {
        // for the first voice we do not need collision detection on rests
        // we just place it normally
        if (beat.voice.index > 0) {
            // From the Spring-Rod poisitioning we have the guarantee
            // that 2 timewise subsequent elements can never collide 
            // on the horizontal axis. So we only need to check for collisions
            // of elements at the current time position
            // if there are none, we can just use the line
            if (this._reservedLayoutAreasByDisplayTime.has(beat.playbackStart)) {
                // do check for collisions we need to obtain the range on which the 
                // restglyph is placed
                // rest glyphs have their ancor 
                const restSizes = BeamingHelper.computeLineHeightsForRest(beat.duration).map(i => i * linesToPixel);
                let oldRestTopY = currentY - restSizes[0];
                let oldRestBottomY = currentY + restSizes[1];
                let newRestTopY = oldRestTopY;

                const reservedSlots = this._reservedLayoutAreasByDisplayTime.get(beat.playbackStart)!;
                let hasCollision = false;
                for (const slot of reservedSlots.slots) {
                    if ((oldRestTopY >= slot.topY && oldRestTopY <= slot.bottomY) ||
                        (oldRestBottomY >= slot.topY && oldRestBottomY <= slot.bottomY)) {
                        hasCollision = true;
                        break;
                    }
                }

                if (hasCollision) {
                    // second voice above, the others below
                    if (beat.voice.index == 1) {
                        // move rest above top position
                        // TODO: rest must align with note lines
                        newRestTopY = reservedSlots.topY - restSizes[1] - restSizes[0];
                    } else {
                        // move rest above top position
                        // TODO: rest must align with note lines
                        newRestTopY = reservedSlots.bottomY;
                    }

                    let newRestBottomY = newRestTopY + restSizes[0] + restSizes[1];

                    // moving always happens in full stave spaces
                    const staveSpace = linesToPixel * 2;
                    let distanceInLines = Math.ceil(Math.abs(newRestTopY - oldRestTopY) / staveSpace);

                    // register new min/max offsets
                    reservedSlots.addSlot(newRestTopY, newRestBottomY);

                    if (newRestTopY < oldRestTopY) {
                        return distanceInLines * -staveSpace;
                    } else {
                        return distanceInLines * staveSpace;
                    }
                }
            }
        }

        return 0;
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

    public incompleteGraceRods: Map<string, Spring[]> = new Map();
    public allGraceRods: Map<string, Spring[]> = new Map();
    public springs: Map<number, Spring> = new Map();

    public addSpring(start: number, duration: number, graceBeatWidth: number, preBeatWidth: number, postSpringSize: number): Spring {
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
                let previousSpring: Spring = this._timeSortedSprings[this._timeSortedSprings.length - 1];
                previousSpring.allDurations.forEach(prevDuration => {
                    let end: number = previousSpring.timePosition + prevDuration;
                    if (end >= start && prevDuration < smallestDuration) {
                        smallestDuration = prevDuration;
                    }
                });
            }
            spring.longestDuration = duration;
            spring.postSpringWidth = postSpringSize;
            spring.graceBeatWidth = graceBeatWidth;
            spring.preBeatWidth = preBeatWidth;
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
        let start: number = beat.absoluteDisplayStart;
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

            let existingSpring = this.allGraceRods.get(groupId)![beat.graceIndex];
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
        this.allGraceRods.forEach((s, k) => {
            let offset = 0;
            if (this.incompleteGraceRods.has(k)) {
                for (const sp of s) {
                    offset += sp.preBeatWidth;
                    sp.graceBeatWidth = offset;
                    offset += sp.postSpringWidth;
                }
            } else {
                for (let i = s.length - 1; i >= 0; i--) {
                    // for grace beats we store the offset 
                    // in the 'graceBeatWidth' for later use during applying
                    // beat positions
                    s[i].graceBeatWidth = offset;
                    offset -= (s[i].preBeatWidth + s[i].postSpringWidth);
                }
            }
        });
        this._incompleteGraceRodsWidth = 0;
        this.incompleteGraceRods.forEach(s => {
            for (const sp of s) {
                this._incompleteGraceRodsWidth += sp.preBeatWidth + sp.postSpringWidth;
            }
        });

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
        if (sortedSprings.length === 0) {
            this.totalSpringConstant = -1;
            this.minStretchForce = -1;
            return;
        }
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
    public paint(_cx: number, _cy: number, _canvas: ICanvas) { }

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
        if (this.totalSpringConstant !== -1) {
            if (this._timeSortedSprings.length > 0) {
                space -= this._timeSortedSprings[0].preSpringWidth
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
