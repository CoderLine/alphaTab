import type { Note } from '@coderline/alphatab/model/Note';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import type { NumberedNoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/NumberedNoteHeadGlyph';
import type { NumberedBarRenderer } from '@coderline/alphatab/rendering/NumberedBarRenderer';

/**
 * The numbers of a chord in numbered notation, stacked vertically with the lowest note at y=0:
 * on the chord slots of the voice row, grace chords right above the octave dots of the note below.
 * @internal
 */
export class NumberedNoteChordGlyph extends Glyph {
    /**
     * The note numbers ordered from the lowest (bottom) to the highest (top) note.
     */
    public readonly heads: NumberedNoteHeadGlyph[];

    private _voiceIndex: number;
    private _isGrace: boolean;

    public constructor(x: number, y: number, heads: NumberedNoteHeadGlyph[], voiceIndex: number, isGrace: boolean) {
        super(x, y);
        NumberedNoteChordGlyph._sortBottomUp(heads);
        this.heads = heads;
        this._voiceIndex = voiceIndex;
        this._isGrace = isGrace;
    }

    private static _sortBottomUp(heads: NumberedNoteHeadGlyph[]) {
        for (let i = 1, j = heads.length; i < j; i++) {
            const head = heads[i];
            let k = i - 1;
            while (k >= 0 && NumberedNoteChordGlyph._isAbove(heads[k], head)) {
                heads[k + 1] = heads[k];
                k--;
            }
            heads[k + 1] = head;
        }
    }

    private static _isAbove(a: NumberedNoteHeadGlyph, b: NumberedNoteHeadGlyph): boolean {
        if (a.step !== b.step) {
            return a.step > b.step;
        }
        return a.note!.displayValue > b.note!.displayValue;
    }

    public getHead(note: Note): NumberedNoteHeadGlyph | null {
        for (const h of this.heads) {
            if (h.note === note) {
                return h;
            }
        }
        return null;
    }

    public get lowestHead(): NumberedNoteHeadGlyph {
        return this.heads[0];
    }

    public get highestHead(): NumberedNoteHeadGlyph {
        return this.heads[this.heads.length - 1];
    }

    public override getBoundingBoxTop(): number {
        return this.y + this.highestHead.getBoundingBoxTop();
    }

    public override getBoundingBoxBottom(): number {
        return this.y + this.lowestHead.getBoundingBoxBottom();
    }

    public override doLayout(): void {
        let width = 0;
        for (const h of this.heads) {
            h.renderer = this.renderer;
            h.doLayout();
            if (h.width > width) {
                width = h.width;
            }
        }
        for (const h of this.heads) {
            h.x = (width - h.width) / 2;
        }
        this.width = width;
        this.placeHeads();
    }

    /**
     * Places the numbers above the lowest one on the chord positions of the row, grace numbers right above
     * the number below. The numbers must be laid out.
     */
    public placeHeads(): void {
        const sr = this.renderer as NumberedBarRenderer;
        const gap = sr.resources.engravingSettings.numberedChordNoteGap;
        const baseY = sr.getNumberY(this._voiceIndex, 0);
        const heads = this.heads;
        heads[0].y = 0;
        for (let index = 1; index < heads.length; index++) {
            const h = heads[index];
            if (this._isGrace) {
                // grace numbers are small and do not line up with other chords
                const previous = heads[index - 1];
                h.y = 0;
                h.y = previous.y - (previous.y - previous.getBoundingBoxTop() + gap + h.getBoundingBoxBottom());
            } else {
                h.y = sr.getNumberY(this._voiceIndex, index) - baseY;
            }
        }
        this.height = this.lowestHead.getBoundingBoxBottom() - this.highestHead.getBoundingBoxTop();
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        for (const h of this.heads) {
            h.paint(cx + this.x, cy + this.y, canvas);
        }
    }
}
