import { EffectBand } from '@src/rendering/EffectBand';
import { EffectBandSlot } from '@src/rendering/EffectBandSlot';

export class EffectBandSizingInfo {
    private _effectSlot: Map<string, EffectBandSlot>;
    public slots: EffectBandSlot[];

    public constructor() {
        this.slots = [];
        this._effectSlot = new Map<string, EffectBandSlot>();
    }

    public getOrCreateSlot(band: EffectBand): EffectBandSlot {
        // first check preferrable slot depending on type
        if (this._effectSlot.has(band.info.effectId)) {
            let slot: EffectBandSlot = this._effectSlot.get(band.info.effectId)!;
            if (slot.canBeUsed(band)) {
                return slot;
            }
        }
        // find any slot that can be used
        for (let slot of this.slots) {
            if (slot.canBeUsed(band)) {
                return slot;
            }
        }
        // create a new slot if required
        let newSlot: EffectBandSlot = new EffectBandSlot();
        this.slots.push(newSlot);
        return newSlot;
    }

    public register(effectBand: EffectBand): void {
        let freeSlot: EffectBandSlot = this.getOrCreateSlot(effectBand);
        freeSlot.update(effectBand);
        this._effectSlot.set(effectBand.info.effectId, freeSlot);
    }
}
