import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import { VoiceContainerGlyph } from '@src/rendering/glyphs/VoiceContainerGlyph';
import { NumberedTieGlyph } from './glyphs/NumberedTieGlyph';
import { NumberedSlurGlyph } from './glyphs/NumberedSlurGlyph';

export class NumberedBeatContainerGlyph extends BeatContainerGlyph {
    private _effectSlurs: NumberedSlurGlyph[] = [];

    public constructor(beat: Beat, voiceContainer: VoiceContainerGlyph) {
        super(beat, voiceContainer);
    }

    protected override createTies(n: Note): void {
        // create a tie if any effect requires it
        if (!n.isVisible) {
            return;
        }

        if (n.isTieOrigin && n.tieDestination!.isVisible) {
            let tie = new NumberedTieGlyph(n, n.tieDestination!, false);
            this.addTie(tie);
        }
        if (n.isTieDestination) {
            let tie = new NumberedTieGlyph(n.tieOrigin!, n, true);
            this.addTie(tie);
        }
        if (n.isLeftHandTapped && !n.isHammerPullDestination) {
            let tapSlur = new NumberedTieGlyph(n, n, false);
            this.addTie(tapSlur);
        }
        // start effect slur on first beat
        if (n.isEffectSlurOrigin && n.effectSlurDestination) {
            let expanded: boolean = false;
            for (let slur of this._effectSlurs) {
                if (slur.tryExpand(n, n.effectSlurDestination, false, false)) {
                    expanded = true;
                    break;
                }
            }
            if (!expanded) {
                let effectSlur = new NumberedSlurGlyph(n, n.effectSlurDestination, false, false);
                this._effectSlurs.push(effectSlur);
                this.addTie(effectSlur);
            }
        }
        // end effect slur on last beat
        if (n.isEffectSlurDestination && n.effectSlurOrigin) {
            let expanded: boolean = false;
            for (let slur of this._effectSlurs) {
                if (slur.tryExpand(n.effectSlurOrigin, n, false, true)) {
                    expanded = true;
                    break;
                }
            }
            if (!expanded) {
                let effectSlur = new NumberedSlurGlyph(n.effectSlurOrigin, n, false, true);
                this._effectSlurs.push(effectSlur);
                this.addTie(effectSlur);
            }
        }
    }
}
