import type { Note } from '@coderline/alphatab/model/Note';
import { NumberedTieGlyph } from '@coderline/alphatab/rendering//glyphs/NumberedTieGlyph';
import { BeatContainerGlyph } from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import { NumberedSlurGlyph } from '@coderline/alphatab/rendering/glyphs/NumberedSlurGlyph';

/**
 * @internal
 */
export class NumberedBeatContainerGlyph extends BeatContainerGlyph {
    private _effectSlurs: NumberedSlurGlyph[] = [];

    protected override createTies(n: Note): void {
        // create a tie if any effect requires it
        if (!n.isVisible) {
            return;
        }

        if (n.isTieOrigin && n.tieDestination!.isVisible) {
            const tie = new NumberedTieGlyph('numbered.tie', n, n.tieDestination!);
            this.addTie(tie);
        }
        if (n.isTieDestination) {
            


            // TODO: multisystem slurs
            // const tie = new NumberedTieGlyph(n.tieOrigin!, n, true);
            // this.addTie(tie);
        }
        if (n.isLeftHandTapped && !n.isHammerPullDestination) {
            const tapSlur = new NumberedTieGlyph('numbered.tie.leftHandTap', n, n);
            this.addTie(tapSlur);
        }
        // start effect slur on first beat
        if (n.isEffectSlurOrigin && n.effectSlurDestination) {
            // TODO: ensure we have only one effect slur per start<->destination beat. 
            let expanded: boolean = false;
            for (const slur of this._effectSlurs) {
                if (slur.tryExpand(n, n.effectSlurDestination, false)) {
                    expanded = true;
                    break;
                }
            }
            if (!expanded) {
                const effectSlur = new NumberedSlurGlyph('numbered.slur.effect', n, n.effectSlurDestination, false);
                this._effectSlurs.push(effectSlur);
                this.addTie(effectSlur);
            }
        }

        // TODO: multisystem slurs
        // // end effect slur on last beat
        // if (n.isEffectSlurDestination && n.effectSlurOrigin) {
        //     let expanded: boolean = false;
        //     for (const slur of this._effectSlurs) {
        //         if (slur.tryExpand(n.effectSlurOrigin, n, false, true)) {
        //             expanded = true;
        //             break;
        //         }
        //     }
        //     if (!expanded) {
        //         const effectSlur = new NumberedSlurGlyph(n.effectSlurOrigin, n, false, true);
        //         this._effectSlurs.push(effectSlur);
        //         this.addTie(effectSlur);
        //     }
        // }
    }
}
