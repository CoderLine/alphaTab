import type { Note } from '@coderline/alphatab/model/Note';
import { TabTieGlyph } from '@coderline/alphatab/rendering/glyphs/TabTieGlyph';
import { TieGlyphLabels, type TieGlyphLabel } from '@coderline/alphatab/rendering/glyphs/TieGlyphLabel';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class TabSlurGlyph extends TabTieGlyph {
    private _forSlide: boolean;
    private _labels: TieGlyphLabel[] | null = null;

    public constructor(slurEffectId: string, startNote: Note, endNote: Note, forSlide: boolean, forEnd: boolean) {
        super(slurEffectId, startNote, endNote, forEnd);
        this._forSlide = forSlide;
    }

    public override getTieHeight(startX: number, _startY: number, endX: number, _endY: number): number {
        return (Math.log(endX - startX + 1) * this.renderer.settings.notation.slurHeight) / 2;
    }

    protected override getSlurLabels(): TieGlyphLabel[] | null {
        if (this._labels === null) {
            this._labels = [];
            const slur = this.startNote.effectSlur;
            if (slur !== null) {
                const notationSettings = this.renderer.settings.notation;
                for (const s of slur.segments) {
                    const label = TieGlyphLabels.build(s, s.toNote.fret >= s.fromNote.fret);
                    if (notationSettings.isNotationElementVisible(label.element)) {
                        this._labels.push(label);
                    }
                }
            }
        }
        return this._labels.length > 0 ? this._labels : null;
    }

    public tryExpand(startNote: Note, endNote: Note, forSlide: boolean, forEnd: boolean): boolean {
        // same type required
        if (this._forSlide !== forSlide) {
            return false;
        }
        // same start and endbeat
        if (this.startNote.beat.id !== startNote.beat.id) {
            return false;
        }
        if (this.endNote.beat.id !== endNote.beat.id) {
            return false;
        }
        const isForEnd = this.renderer === this.lookupEndBeatRenderer();
        if (isForEnd !== forEnd) {
            return false;
        }
        // same draw direction
        if (this.tieDirection !== TabTieGlyph.getBeamDirectionForNote(startNote)) {
            return false;
        }
        // if we can expand, expand in correct direction
        switch (this.tieDirection) {
            case BeamDirection.Up:
                if (startNote.realValue > this.startNote.realValue) {
                    this.startNote = startNote;
                    this._labels = null; // invalidate cache — labels live on startNote
                }
                if (endNote.realValue > this.endNote.realValue) {
                    this.endNote = endNote;
                }
                break;
            case BeamDirection.Down:
                if (startNote.realValue < this.startNote.realValue) {
                    this.startNote = startNote;
                    this._labels = null;
                }
                if (endNote.realValue < this.endNote.realValue) {
                    this.endNote = endNote;
                }
                break;
        }
        return true;
    }
}
