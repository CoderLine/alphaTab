import { EventEmitter, type IEventEmitter } from '@src/EventEmitter';
import { BarSubElement } from '@src/model/Bar';
import type { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { ScoreNoteGlyphInfo } from '@src/rendering/glyphs/ScoreNoteGlyphInfo';
import type { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import type { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';

export abstract class ScoreNoteChordGlyphBase extends Glyph {
    private _infos: ScoreNoteGlyphInfo[] = [];

    public minNote: ScoreNoteGlyphInfo | null = null;
    public maxNote: ScoreNoteGlyphInfo | null = null;
    public spacingChanged: IEventEmitter = new EventEmitter();
    public upLineX: number = 0;
    public downLineX: number = 0;
    public noteStartX: number = 0;

    public constructor() {
        super(0, 0);
    }

    public abstract get direction(): BeamDirection;

    protected add(noteGlyph: MusicFontGlyph, noteLine: number): void {
        const info: ScoreNoteGlyphInfo = new ScoreNoteGlyphInfo(noteGlyph, noteLine);
        this._infos.push(info);
        if (!this.minNote || this.minNote.steps > info.steps) {
            this.minNote = info;
        }
        if (!this.maxNote || this.maxNote.steps < info.steps) {
            this.maxNote = info;
        }
    }

    public override doLayout(): void {
        this._infos.sort((a, b) => {
            return b.steps - a.steps;
        });
        let stemUpX: number = 0;
        let stemDownX: number = 0;
        let lastDisplaced: boolean = true;
        let lastStep: number = 0;
        const direction: BeamDirection = this.direction;

        // first get stem position on the right side (displacedX)
        // to align all note heads accordingly (they might have different widths)
        const smufl = this.renderer.smuflMetrics;
        for (const i of this._infos) {
            const g = i.glyph;
            g.renderer = this.renderer;
            g.doLayout();

            if (smufl.stemUp.has(g.symbol)) {
                const stemInfo = smufl.stemUp.get(g.symbol)!;
                if (stemInfo.topX > stemUpX) {
                    stemUpX = stemInfo.topX;
                }
            }

            if (smufl.stemDown.has(g.symbol)) {
                const stemInfo = smufl.stemDown.get(g.symbol)!;
                if (stemInfo.topX > stemDownX) {
                    const diff = stemInfo.topX - stemDownX;
                    stemDownX = stemInfo.topX;
                    stemUpX += diff; // shift right accordingly
                }
            }
        }

        // align all notes so that they align with the stem positions
        let w: number = 0;
        for (let i: number = 0, j: number = this._infos.length; i < j; i++) {
            const g = this._infos[i].glyph;
            let alignDisplaced: boolean = false;

            if (i > 0 && Math.abs(lastStep - this._infos[i].steps) <= 1) {
                if (!lastDisplaced) {
                    alignDisplaced = true;
                    lastDisplaced = true;
                } else {
                    lastDisplaced = false;
                }
            } else {
                lastDisplaced = false;
            }

            // for beat direction down we invert the displacement.
            // this means: displaced is on the left side of the stem and not displaced is right
            if (direction === BeamDirection.Down) {
                if (alignDisplaced) {
                    g.x = stemUpX;
                } else {
                    g.x = stemDownX;
                }

                if (smufl.stemDown.has(g.symbol)) {
                    g.x -= smufl.stemDown.get(g.symbol)!.topX;
                }
            } else {
                if (alignDisplaced) {
                    g.x = stemDownX;
                } else {
                    g.x = stemUpX;
                }

                if (smufl.stemUp.has(g.symbol)) {
                    g.x -= smufl.stemUp.get(g.symbol)!.topX;
                }
            }

            g.x += this.noteStartX;
            lastStep = this._infos[i].steps;
            w = Math.max(w, g.x + g.width);

            // after size calculation, re-align glyph to stem if needed
            if (g instanceof NoteHeadGlyph && (g as NoteHeadGlyph).centerOnStem) {
                g.x = stemUpX;
            }
        }

        this.upLineX = stemUpX;
        this.downLineX = stemDownX;
        this.width = w;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        cx += this.x;
        cy += this.y;
        this.paintLedgerLines(cx, cy, canvas);
        const infos: ScoreNoteGlyphInfo[] = this._infos;
        for (const g of infos) {
            g.glyph.renderer = this.renderer;
            g.glyph.paint(cx, cy, canvas);
        }
    }
    private paintLedgerLines(cx: number, cy: number, canvas: ICanvas) {
        if (!this.minNote) {
            return;
        }

        const scoreRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;

        using _ = ElementStyleHelper.bar(canvas, BarSubElement.StandardNotationStaffLine, scoreRenderer.bar, true);

        const linePadding: number = 3;
        const lineWidth: number = this.width - this.noteStartX + linePadding * 2;

        const lineSpacing = scoreRenderer.getLineHeight(1);
        const firstTopLedgerY = scoreRenderer.getLineY(-1);
        const firstBottomLedgerY = scoreRenderer.getLineY(scoreRenderer.drawnLineCount);
        const minNoteLineY = scoreRenderer.getLineY(this.minNote!.steps / 2);
        const maxNoteLineY = scoreRenderer.getLineY(this.maxNote!.steps / 2);

        let y = firstTopLedgerY;
        while (y >= minNoteLineY) {
            canvas.fillRect(
                cx - linePadding + this.noteStartX,
                (cy + y) | 0,
                lineWidth,
                this.renderer.smuflMetrics.staffLineThickness
            );
            y -= lineSpacing;
        }

        y = firstBottomLedgerY;
        while (y <= maxNoteLineY) {
            canvas.fillRect(
                cx - linePadding + this.noteStartX,
                (cy + y) | 0,
                lineWidth,
                this.renderer.smuflMetrics.staffLineThickness
            );
            y += lineSpacing;
        }
    }
}
