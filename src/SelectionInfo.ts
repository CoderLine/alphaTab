import { Beat } from '@src/model/Beat';
import { BeatBounds } from '@src/rendering/utils/BeatBounds';

export class SelectionInfo {
    public beat: Beat;
    public bounds: BeatBounds | null = null;

    public constructor(beat: Beat) {
        this.beat = beat;
    }
}
