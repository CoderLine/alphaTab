import { Note } from '@src/model/Note';
import { ICanvas } from '@src/platform/ICanvas';
import { GhostParenthesisGlyph } from '@src/rendering/glyphs/GhostParenthesisGlyph';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { NotationElement } from '@src/NotationSettings';

export class GhostNoteInfo {
    public line: number = 0;
    public isGhost: boolean;

    public constructor(line: number, isGhost: boolean) {
        this.line = line;
        this.isGhost = isGhost;
    }
}

export class GhostNoteContainerGlyph extends Glyph {
    private _isOpen: boolean;
    private _infos: GhostNoteInfo[] = [];
    private _glyphs: Glyph[] = [];
    public isEmpty: boolean = true;

    public constructor(isOpen: boolean) {
        super(0, 0);
        this._isOpen = isOpen;
    }

    public addParenthesis(n: Note): void {
        let sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        let line: number = sr.getNoteLine(n);
        let hasParenthesis: boolean =
            n.isGhost || (this.isTiedBend(n) && sr.settings.notation.isNotationElementVisible(NotationElement.ParenthesisOnTiedBends));
        this.addParenthesisOnLine(line, hasParenthesis);
    }

    public addParenthesisOnLine(line: number, hasParenthesis: boolean): void {
        let info: GhostNoteInfo = new GhostNoteInfo(line, hasParenthesis);
        this._infos.push(info);
        if (hasParenthesis) {
            this.isEmpty = false;
        }
    }

    private isTiedBend(note: Note): boolean {
        if (note.isTieDestination) {
            if (note.tieOrigin!.hasBend) {
                return true;
            }
            return this.isTiedBend(note.tieOrigin!);
        }
        return false;
    }

    public doLayout(): void {
        let sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        this._infos.sort((a, b) => {
            return a.line - b.line;
        });
        let previousGlyph: GhostParenthesisGlyph | null = null;
        let sizePerLine: number = sr.getScoreHeight(1);
        for (let i: number = 0, j: number = this._infos.length; i < j; i++) {
            let g: GhostParenthesisGlyph;
            if (!this._infos[i].isGhost) {
                previousGlyph = null;
            } else if (!previousGlyph) {
                g = new GhostParenthesisGlyph(this._isOpen);
                g.renderer = this.renderer;
                g.y = sr.getScoreY(this._infos[i].line) - sizePerLine;
                g.height = sizePerLine * 2;
                g.doLayout();
                this._glyphs.push(g);
                previousGlyph = g;
            } else {
                let y: number = sr.getScoreY(this._infos[i].line) + sizePerLine;
                previousGlyph.height = y - previousGlyph.y;
            }
        }
        this.width = this._glyphs.length > 0 ? this._glyphs[0].width : 0;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy, canvas);
        for (let g of this._glyphs) {
            g.paint(cx + this.x, cy + this.y, canvas);
        }
    }
}
