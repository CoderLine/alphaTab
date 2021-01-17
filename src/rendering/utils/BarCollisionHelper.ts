import { Beat } from "@src/model/Beat";
import { BeamingHelper } from "./BeamingHelper";

export class ReservedLayoutAreaSlot {
    public topY: number = 0;
    public bottomY: number = 0;
    public constructor(topY: number, bottomY: number) {
        this.topY = topY;
        this.bottomY = bottomY;
    }
}

export class ReservedLayoutArea {
    public beat: Beat;
    public topY: number = -1000;
    public bottomY: number = -1000;
    public slots: ReservedLayoutAreaSlot[] = [];

    public constructor(beat: Beat) {
        this.beat = beat;
    }

    public addSlot(topY: number, bottomY: number) {
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

export class BarCollisionHelper {
    public reservedLayoutAreasByDisplayTime: Map<number, ReservedLayoutArea> = new Map();
    public restDurationsByDisplayTime: Map<number/*start*/, Map<number/*duration*/, number/*beat id*/>> = new Map();

    public getBeatMinMaxY(): number[] {
        let minY = -1000;
        let maxY = -1000;
        for(const v of this.reservedLayoutAreasByDisplayTime.values()) {
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
        }

        if (minY === -1000) {
            return [0, 0];
        }
        return [minY, maxY];
    }

    public reserveBeatSlot(beat: Beat, topY: number, bottomY: number): void {
        if (topY == bottomY) {
            return;
        }
        if (!this.reservedLayoutAreasByDisplayTime.has(beat.displayStart)) {
            this.reservedLayoutAreasByDisplayTime.set(beat.displayStart, new ReservedLayoutArea(beat));
        }
        this.reservedLayoutAreasByDisplayTime.get(beat.displayStart)!.addSlot(topY, bottomY);
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
            if (this.reservedLayoutAreasByDisplayTime.has(beat.playbackStart)) {
                // do check for collisions we need to obtain the range on which the 
                // restglyph is placed
                // rest glyphs have their ancor 
                const restSizes = BeamingHelper.computeLineHeightsForRest(beat.duration).map(i => i * linesToPixel);
                let oldRestTopY = currentY - restSizes[0];
                let oldRestBottomY = currentY + restSizes[1];
                let newRestTopY = oldRestTopY;

                const reservedSlots = this.reservedLayoutAreasByDisplayTime.get(beat.playbackStart)!;
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
}