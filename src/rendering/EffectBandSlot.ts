import { Beat } from '@src/model/Beat';
import { EffectBand } from '@src/rendering/EffectBand';

export class EffectBandSlotShared {
    public uniqueEffectId: string | null = null;
    public y: number = 0;
    public height: number = 0;
    public firstBeat: Beat | null = null;
    public lastBeat: Beat | null = null;
}

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
        return (
            ((!this.shared.uniqueEffectId && band.info.canShareBand) ||
                band.info.effectId === this.shared.uniqueEffectId) &&
            (!this.shared.firstBeat ||
                this.shared.lastBeat!.isBefore(band.firstBeat!) ||
                this.shared.lastBeat!.isBefore(this.shared.firstBeat))
        );
    }
}
