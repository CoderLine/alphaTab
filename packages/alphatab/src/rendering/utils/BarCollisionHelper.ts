import type { Beat } from '@coderline/alphatab/model/Beat';
import { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';

/**
 * @internal
 */
export class ReservedLayoutArea {
    public beat: Beat;
    public topY: number = -1000;
    public bottomY: number = -1000;
    /**
     * The reserved slots in insertion order as interleaved pairs: `[top0, bottom0, top1, bottom1, ...]`.
     */
    public slots: number[] = [];

    public constructor(beat: Beat) {
        this.beat = beat;
    }

    /**
     * A copy of {@link slots} sorted by the top of the slots, keeping the insertion order of equal tops.
     */
    public getSlotsSortedByTop(): number[] {
        const slots = this.slots;
        const sorted = new Array<number>(slots.length);
        for (let i = 0; i < slots.length; i += 2) {
            const topY = slots[i];
            const bottomY = slots[i + 1];
            let j = i;
            while (j > 0 && sorted[j - 2] > topY) {
                sorted[j] = sorted[j - 2];
                sorted[j + 1] = sorted[j - 1];
                j -= 2;
            }
            sorted[j] = topY;
            sorted[j + 1] = bottomY;
        }
        return sorted;
    }

    public addSlot(topY: number, bottomY: number) {
        if (this.slots.length === 0) {
            this.slots = [topY, bottomY];
        } else {
            this.slots.push(topY);
            this.slots.push(bottomY);
        }
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
 * @internal
 */
export class BarCollisionHelper {
    public reservedLayoutAreasByDisplayTime: Map<number, ReservedLayoutArea> | null = null;
    public restDurationsByDisplayTime: Map<number /*start*/, Map<number /*duration*/, number /*beat id*/>> | null =
        null;

    public getBeatMinMaxY(): number[] {
        let minY = -1000;
        let maxY = -1000;
        const reservedAreas = this.reservedLayoutAreasByDisplayTime;
        if (reservedAreas) {
            for (const v of reservedAreas.values()) {
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
        }

        if (minY === -1000) {
            return [0, 0];
        }
        return [minY, maxY];
    }

    public reserveBeatSlot(beat: Beat, topY: number, bottomY: number): void {
        if (topY === bottomY) {
            return;
        }
        let reservedAreas = this.reservedLayoutAreasByDisplayTime;
        if (!reservedAreas) {
            reservedAreas = new Map<number, ReservedLayoutArea>();
            this.reservedLayoutAreasByDisplayTime = reservedAreas;
        }
        if (!reservedAreas.has(beat.displayStart)) {
            reservedAreas.set(beat.displayStart, new ReservedLayoutArea(beat));
        }
        reservedAreas.get(beat.displayStart)!.addSlot(topY, bottomY);
        if (beat.isRest) {
            this.registerRest(beat);
        }
    }

    public registerRest(beat: Beat) {
        let restDurations = this.restDurationsByDisplayTime;
        if (!restDurations) {
            restDurations = new Map<number, Map<number, number>>();
            this.restDurationsByDisplayTime = restDurations;
        }
        if (!restDurations.has(beat.displayStart)) {
            restDurations.set(beat.displayStart, new Map<number, number>());
        }
        if (!restDurations.get(beat.displayStart)!.has(beat.playbackDuration)) {
            restDurations.get(beat.displayStart)!.set(beat.playbackDuration, beat.id);
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
            const reservedAreas = this.reservedLayoutAreasByDisplayTime;
            if (reservedAreas !== null && reservedAreas.has(beat.playbackStart)) {
                // do check for collisions we need to obtain the range on which the
                // restglyph is placed
                // rest glyphs have their ancor
                const restSizes = BeamingHelper.computeLineHeightsForRest(beat.duration).map(i => i * linesToPixel);
                const oldRestTopY = currentY - restSizes[0];
                const oldRestBottomY = currentY + restSizes[1];
                let newRestTopY = oldRestTopY;

                const reservedSlots = reservedAreas.get(beat.playbackStart)!;
                const slots = reservedSlots.slots;
                let hasCollision = false;
                for (let i = 0; i < slots.length; i += 2) {
                    const slotTopY = slots[i];
                    const slotBottomY = slots[i + 1];
                    if (
                        (oldRestTopY >= slotTopY && oldRestTopY <= slotBottomY) ||
                        (oldRestBottomY >= slotTopY && oldRestBottomY <= slotBottomY)
                    ) {
                        hasCollision = true;
                        break;
                    }
                }

                if (hasCollision) {
                    // second voice above, the others below
                    if (beat.voice.index === 1) {
                        // move rest above top position
                        // TODO: rest must align with note lines
                        newRestTopY = reservedSlots.topY - restSizes[1] - restSizes[0];
                    } else {
                        // move rest above top position
                        // TODO: rest must align with note lines
                        newRestTopY = reservedSlots.bottomY;
                    }

                    const newRestBottomY = newRestTopY + restSizes[0] + restSizes[1];

                    // moving always happens in full stave spaces
                    const staveSpace = linesToPixel * 2;
                    const distanceInLines = Math.ceil(Math.abs(newRestTopY - oldRestTopY) / staveSpace);

                    // register new min/max offsets
                    reservedSlots.addSlot(newRestTopY, newRestBottomY);

                    if (newRestTopY < oldRestTopY) {
                        return distanceInLines * -staveSpace;
                    }
                    return distanceInLines * staveSpace;
                }
            }
        }

        return 0;
    }
}
