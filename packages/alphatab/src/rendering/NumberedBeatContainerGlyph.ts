import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import { NumberedTieGlyph } from '@coderline/alphatab/rendering//glyphs/NumberedTieGlyph';
import type { BarBounds } from '@coderline/alphatab/rendering/_barrel';
import { BeatContainerGlyph } from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import { NumberedBeatGlyph, NumberedBeatPreNotesGlyph } from '@coderline/alphatab/rendering/glyphs/NumberedBeatGlyph';
import {
    type INumberedBeatDashGlyph,
    type NumberedDashBeatContainerGlyph,
    NumberedNoteBeatContainerGlyphBase
} from '@coderline/alphatab/rendering/glyphs/NumberedDashBeatContainerGlyph';
import { NumberedSlurGlyph } from '@coderline/alphatab/rendering/glyphs/NumberedSlurGlyph';
import type { TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';

/**
 * @internal
 */
export class NumberedBeatContainerGlyph extends BeatContainerGlyph {
    private _slurs: Map<string, TieGlyph> = new Map<string, TieGlyph>();
    private _effectSlurs: NumberedSlurGlyph[] = [];
    private _dashes?: INumberedBeatDashGlyph[];

    public hasAdditionalNumbers = false;
    public *iterateAdditionalNumbers() {
        const dashes = this._dashes;
        if (!dashes) {
            return;
        }
        for (const d of dashes) {
            if (d instanceof NumberedNoteBeatContainerGlyphBase) {
                yield d as NumberedNoteBeatContainerGlyphBase;
            }
        }
    }

    public constructor(beat: Beat) {
        super(beat);
        this.preNotes = new NumberedBeatPreNotesGlyph();
        this.onNotes = new NumberedBeatGlyph();
    }

    public addDash(dash: NumberedDashBeatContainerGlyph) {
        let dashes = this._dashes;
        if (!dashes) {
            dashes = [];
            this._dashes = dashes;
        }
        dashes.push(dash);
    }

    public addNotes(dash: NumberedNoteBeatContainerGlyphBase) {
        let dashes = this._dashes;
        if (!dashes) {
            dashes = [];
            this._dashes = dashes;
        }
        dashes.push(dash);
        this.hasAdditionalNumbers = true;
    }

    public override doLayout(): void {
        this._slurs.clear();
        this._effectSlurs = [];
        super.doLayout();
    }

    public override buildBoundingsLookup(barBounds: BarBounds, cx: number, cy: number) {
        super.buildBoundingsLookup(barBounds, cx, cy);
        // extend bounds to include dashes
        const dashes = this._dashes;
        if (dashes) {
            const beatBounds = barBounds.beats[barBounds.beats.length - 1];
            const lastDash = dashes[dashes.length - 1];
            const visualEndX = lastDash.x + lastDash.contentWidth;
            beatBounds.visualBounds.w = visualEndX - beatBounds.visualBounds.x;

            const realEnd = lastDash.x + lastDash.width;
            beatBounds.realBounds.w = realEnd - beatBounds.realBounds.x;
        }
    }

    protected override createTies(n: Note): void {
        // create a tie if any effect requires it
        if (!n.isVisible) {
            return;
        }

        if (n.isTieOrigin && n.tieDestination!.isVisible && !this._slurs.has('numbered.tie')) {
            const tie = new NumberedTieGlyph(`numbered.tie.${n.beat.id}`, n, n.tieDestination!, false);
            this.addTie(tie);
            this._slurs.set(tie.slurEffectId, tie);
        }
        if (n.isTieDestination) {
            const tie = new NumberedTieGlyph(`numbered.tie.${n.tieOrigin!.beat.id}`, n.tieOrigin!, n, true);
            this.addTie(tie);
        }
        if (
            n.isLeftHandTapped &&
            !n.isHammerPullDestination &&
            !this._slurs.has(`numbered.tie.leftHandTap.${n.beat.id}`)
        ) {
            const tapSlur = new NumberedTieGlyph(`numbered.tie.leftHandTap.${n.beat.id}`, n, n, false);
            this.addTie(tapSlur);
            this._slurs.set(tapSlur.slurEffectId, tapSlur);
        }
        // start effect slur on first beat
        if (n.isEffectSlurOrigin && n.effectSlurDestination) {
            let expanded: boolean = false;
            for (const slur of this._effectSlurs) {
                if (slur.tryExpand(n, n.effectSlurDestination, false, false)) {
                    expanded = true;
                    break;
                }
            }

            if (!expanded) {
                const effectSlur = new NumberedSlurGlyph(
                    `numbered.slur.effect`,
                    n,
                    n.effectSlurDestination,
                    false,
                    false
                );
                this._effectSlurs.push(effectSlur);
                this.addTie(effectSlur);
                this._slurs.set(effectSlur.slurEffectId, effectSlur);
                this._slurs.set('numbered.slur.effect', effectSlur);
            }
        }

        // end effect slur on last beat
        if (n.isEffectSlurDestination && n.effectSlurOrigin) {
            let expanded: boolean = false;
            for (const slur of this._effectSlurs) {
                if (slur.tryExpand(n.effectSlurOrigin, n, false, true)) {
                    expanded = true;
                    break;
                }
            }
            if (!expanded) {
                const effectSlur = new NumberedSlurGlyph(`numbered.slur.effect`, n.effectSlurOrigin, n, false, true);
                this._effectSlurs.push(effectSlur);
                this.addTie(effectSlur);
                this._slurs.set(effectSlur.slurEffectId, effectSlur);
                this._slurs.set('numbered.slur.effect', effectSlur);
            }
        }
    }
}
