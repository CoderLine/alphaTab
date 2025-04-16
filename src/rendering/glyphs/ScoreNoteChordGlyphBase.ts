import { EventEmitter, type IEventEmitter } from '@src/EventEmitter';
import { BarSubElement } from '@src/model/Bar';
import type { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { ScoreNoteGlyphInfo } from '@src/rendering/glyphs/ScoreNoteGlyphInfo';
import type { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export abstract class ScoreNoteChordGlyphBase extends Glyph {
    private _infos: ScoreNoteGlyphInfo[] = [];
    protected _noteHeadPadding: number = 0;

    public minNote: ScoreNoteGlyphInfo | null = null;
    public maxNote: ScoreNoteGlyphInfo | null = null;
    public spacingChanged: IEventEmitter = new EventEmitter();
    public upLineX: number = 0;
    public downLineX: number = 0;
    public displacedX: number = 0;
    public noteStartX: number = 0;

    public constructor() {
        super(0, 0);
    }

    public abstract get direction(): BeamDirection;

    protected add(noteGlyph: Glyph, noteLine: number): void {
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
        let displacedX: number = 0;
        let lastDisplaced: boolean = false;
        let lastStep: number = 0;
        let anyDisplaced: boolean = false;
        const direction: BeamDirection = this.direction;
        let w: number = 0;
        for (let i: number = 0, j: number = this._infos.length; i < j; i++) {
            const g: Glyph = this._infos[i].glyph;
            g.renderer = this.renderer;
            g.doLayout();
            let displace: boolean = false;
            if (i === 0) {
                displacedX = g.width;
            } else {
                // check if note needs to be repositioned
                if (Math.abs(lastStep - this._infos[i].steps) <= 1) {
                    // reposition if needed
                    if (!lastDisplaced) {
                        displace = true;
                        g.x = displacedX;
                        anyDisplaced = true;
                        lastDisplaced = true; // let next iteration know we are displace now
                    } else {
                        lastDisplaced = false; // let next iteration know that we weren't displaced now
                    }
                } else {
                    lastDisplaced = false;
                }
            }
            // for beat direction down we invert the displacement.
            // this means: displaced is on the left side of the stem and not displaced is right
            if (direction === BeamDirection.Down) {
                g.x = displace ? 0 : displacedX;
            } else {
                g.x = displace ? displacedX : 0;
            }
            g.x += this.noteStartX;
            lastStep = this._infos[i].steps;
            w = Math.max(w, g.x + g.width);

            // after size calculation, re-align glyph to stem if needed
            if (g instanceof NoteHeadGlyph && (g as NoteHeadGlyph).centerOnStem) {
                g.x = displacedX;
            }
        }
        if (anyDisplaced) {
            this._noteHeadPadding = 0;
            this.upLineX = displacedX;
            this.downLineX = displacedX;
        } else {
            this._noteHeadPadding = direction === BeamDirection.Down ? -displacedX : 0;
            w += this._noteHeadPadding;
            this.upLineX = w;
            this.downLineX = 0;
        }
        this.displacedX = displacedX;
        this.width = w;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        cx += this.x;
        cy += this.y;
        // TODO: this method seems to be quite heavy according to the profiler, why?
        // TODO: Take care of beateffects in overflow
        this.paintLedgerLines(cx, cy, canvas);
        const infos: ScoreNoteGlyphInfo[] = this._infos;
        const x: number = cx + this._noteHeadPadding;
        for (const g of infos) {
            g.glyph.renderer = this.renderer;
            g.glyph.paint(x, cy, canvas);
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
                BarRendererBase.StaffLineThickness
            );
            y -= lineSpacing;
        }

        y = firstBottomLedgerY;
        while (y <= maxNoteLineY) {
            canvas.fillRect(
                cx - linePadding + this.noteStartX,
                (cy + y) | 0,
                lineWidth,
                BarRendererBase.StaffLineThickness
            );
            y += lineSpacing;
        }
    }
}
