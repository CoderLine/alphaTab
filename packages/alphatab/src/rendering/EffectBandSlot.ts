import type { Beat } from '@coderline/alphatab/model/Beat';
import type { EffectBand } from '@coderline/alphatab/rendering/EffectBand';

/**
 * @internal
 */
export class EffectBandSlotShared {
    public uniqueEffectId: string | null = null;
    public y: number = 0;
    public height: number = 0;
    public firstBeat: Beat | null = null;
    public lastBeat: Beat | null = null;
}

/**
 * @internal
 */
export class EffectBandSlot {
    public bands: EffectBand[];

    public shared: EffectBandSlotShared;

    public constructor() {
        this.bands = [];
        this.shared = new EffectBandSlotShared();
    }

    public update(effectBand: EffectBand): void {
        // lock band to particular effect if needed
        if (!effectBand.info.canShareBand) {
            this.shared.uniqueEffectId = effectBand.info.effectId;
        }
        effectBand.slot = this;
        this.bands.push(effectBand);
        if (effectBand.height > this.shared.height) {
            this.shared.height = effectBand.height;
        }
        if (!this.shared.firstBeat || effectBand.firstBeat!.isBefore(this.shared.firstBeat)) {
            this.shared.firstBeat = effectBand.firstBeat;
        }
        if (!this.shared.lastBeat || effectBand.lastBeat!.isAfter(this.shared.lastBeat)) {
            this.shared.lastBeat = effectBand.lastBeat;
        }
    }

    public canBeUsed(band: EffectBand): boolean {
        const canShareBand =
            (!this.shared.uniqueEffectId && band.info.canShareBand) ||
            band.info.effectId === this.shared.uniqueEffectId;
        if (!canShareBand) {
            return false;
        }

        // first beat in slot
        if (!this.shared.firstBeat) {
            return true;
        }

        // beat is already added and this is an "extended" band connecting to the previous bar
        if(this.shared.lastBeat === band.firstBeat){
            return true;
        }

        // newly added band is after current beat
        if (this.shared.lastBeat!.isBefore(band.firstBeat!)) {
            return true;
        }

        // historical case, doesn't make much sense, but let's keep it for now
        if (this.shared.lastBeat!.isBefore(this.shared.firstBeat)) {
            return true;
        }

        return false;
    }
}
