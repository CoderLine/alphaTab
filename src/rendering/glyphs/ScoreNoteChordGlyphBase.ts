import { EventEmitter, IEventEmitter } from '@src/EventEmitter';
import { Color } from '@src/model/Color';
import { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { ScoreNoteGlyphInfo } from '@src/rendering/glyphs/ScoreNoteGlyphInfo';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';

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
        let info: ScoreNoteGlyphInfo = new ScoreNoteGlyphInfo(noteGlyph, noteLine);
        this._infos.push(info);
        if (!this.minNote || this.minNote.line > info.line) {
            this.minNote = info;
        }
        if (!this.maxNote || this.maxNote.line < info.line) {
            this.maxNote = info;
        }
    }

    public get hasTopOverflow(): boolean {
        return !!this.minNote && this.minNote.line <= 0;
    }

    public get hasBottomOverflow(): boolean {
        return !!this.maxNote && this.maxNote.line > 8;
    }

    public doLayout(): void {
        this._infos.sort((a, b) => {
            return b.line - a.line;
        });
        let displacedX: number = 0;
        let lastDisplaced: boolean = false;
        let lastLine: number = 0;
        let anyDisplaced: boolean = false;
        let direction: BeamDirection = this.direction;
        let w: number = 0;
        for (let i: number = 0, j: number = this._infos.length; i < j; i++) {
            let g: Glyph = this._infos[i].glyph;
            g.renderer = this.renderer;
            g.doLayout();
            let displace: boolean = false;
            if (i === 0) {
                displacedX = g.width;
            } else {
                // check if note needs to be repositioned
                if (Math.abs(lastLine - this._infos[i].line) <= 1) {
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
            lastLine = this._infos[i].line;
            w = Math.max(w, g.x + g.width);
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

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        cx += this.x;
        cy += this.y;
        // TODO: this method seems to be quite heavy according to the profiler, why?
        let scoreRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        // TODO: Take care of beateffects in overflow
        let linePadding: number = 3 * this.scale;
        let lineWidth: number = this.width - this.noteStartX + linePadding * 2;
        if (this.hasTopOverflow) {
            let color: Color = canvas.color;
            canvas.color = scoreRenderer.resources.staffLineColor;
            let l: number = -2;
            while (l >= this.minNote!.line) {
                // + 1 Because we want to place the line in the center of the note, not at the top
                let lY: number = cy + scoreRenderer.getScoreY(l);
                canvas.fillRect(cx - linePadding + this.noteStartX, lY, lineWidth, this.scale);
                l -= 2;
            }
            canvas.color = color;
        }
        if (this.hasBottomOverflow) {
            let color: Color = canvas.color;
            canvas.color = scoreRenderer.resources.staffLineColor;
            let l: number = 10;
            while (l <= this.maxNote!.line) {
                let lY: number = cy + scoreRenderer.getScoreY(l);
                canvas.fillRect(cx - linePadding + this.noteStartX, lY, lineWidth, this.scale);
                l += 2;
            }
            canvas.color = color;
        }
        let infos: ScoreNoteGlyphInfo[] = this._infos;
        let x: number = cx + this._noteHeadPadding;
        for (let g of infos) {
            g.glyph.renderer = this.renderer;
            g.glyph.paint(x, cy, canvas);
        }
    }
}
