import { MidiUtils } from '@coderline/alphatab/midi/MidiUtils';
import type { Duration } from '@coderline/alphatab/model/Duration';
import type { MasterBar } from '@coderline/alphatab/model/MasterBar';

/**
 * @internal
 */
export class BeamingRuleLookup {
    private _division: number = 0;
    private _slots: number[] = [];
    private _barDuration: number;

    public constructor(barDuration: number, division: number, slots: number[]) {
        this._division = division;
        this._slots = slots;
        this._barDuration = barDuration;
    }

    public calculateGroupIndex(beatStartTime: number) {
        // no slots -> all have their own group based (use the start time as index)
        if (this._slots.length === 0) {
            return beatStartTime;
        }

        // rollover within the bar.
        beatStartTime = beatStartTime % this._barDuration;

        const slotIndex = Math.floor(beatStartTime / this._division);
        return this._slots[slotIndex];
    }

    public static build(masterBar: MasterBar, ruleDuration: Duration, ruleGroups: number[]): BeamingRuleLookup {
        const totalDuration = masterBar.calculateDuration(false);
        const division = MidiUtils.toTicks(ruleDuration);
        const slotCount = totalDuration / division;

        // should only happen in case of improper data.
        if (slotCount < 0 || ruleGroups.length === 0) {
            return new BeamingRuleLookup(0, 0, []);
        }

        let groupIndex = 0;
        let remainingSlots = ruleGroups[groupIndex];

        const slots: number[] = [];

        for (let i = 0; i < slotCount; i++) {
            if (groupIndex < ruleGroups.length) {
                slots.push(groupIndex);
                remainingSlots--;

                if (remainingSlots <= 0) {
                    groupIndex++;
                    if (groupIndex < ruleGroups.length) {
                        remainingSlots = ruleGroups[groupIndex];
                    }
                }
            } else {
                // no groups defined for the remaining slots: all slots are treated
                // as unjoined
                slots.push(groupIndex);
                groupIndex++;
            }
        }

        return new BeamingRuleLookup(totalDuration, division, slots);
    }
}
