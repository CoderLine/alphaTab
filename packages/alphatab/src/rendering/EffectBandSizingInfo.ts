import type { EffectBand } from '@coderline/alphatab/rendering/EffectBand';
import { EffectBandSlot } from '@coderline/alphatab/rendering/EffectBandSlot';

/**
 * @internal
 */
export class EffectBandSizingInfo {
    private _effectSlot: Map<string, EffectBandSlot>;
    private _assignedSlots: Map<EffectBand, EffectBandSlot>;
    public slots: EffectBandSlot[];

    public constructor() {
        this.slots = [];
        this._effectSlot = new Map<string, EffectBandSlot>();
        this._assignedSlots = new Map<EffectBand, EffectBandSlot>();
    }

    public getOrCreateSlot(band: EffectBand): EffectBandSlot {
        // check if we have already a slot
        if (this._assignedSlots.has(band)) {
            return this._assignedSlots.get(band)!;
        }

        // first check preferrable slot depending on type
        if (this._effectSlot.has(band.info.effectId)) {
            const slot: EffectBandSlot = this._effectSlot.get(band.info.effectId)!;
            if (slot.canBeUsed(band)) {
                this._assignedSlots.set(band, slot);
                return slot;
            }
        }
        // find any slot that can be used
        for (const slot of this.slots) {
            if (slot.canBeUsed(band)) {
                this._assignedSlots.set(band, slot);
                return slot;
            }
        }
        // create a new slot if required
        const newSlot: EffectBandSlot = new EffectBandSlot();
        this.slots.push(newSlot);
        this._assignedSlots.set(band, newSlot);

        return newSlot;
    }

    public register(effectBand: EffectBand): void {
        const freeSlot: EffectBandSlot = this.getOrCreateSlot(effectBand);
        freeSlot.update(effectBand);
        this._effectSlot.set(effectBand.info.effectId, freeSlot);
    }
}
