import { type Note, NoteSubElement } from '@src/model/Note';
import type { ICanvas } from '@src/platform/ICanvas';
import { GhostParenthesisGlyph } from '@src/rendering/glyphs/GhostParenthesisGlyph';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import type { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { NotationElement } from '@src/NotationSettings';
import type { Color } from '@src/model/Color';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';

export class GhostNoteInfo {
    public line: number = 0;
    public isGhost: boolean;
    public color: Color | undefined;

    public constructor(line: number, isGhost: boolean, color: Color | undefined) {
        this.line = line;
        this.isGhost = isGhost;
        this.color = color;
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
        const sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        const line: number = sr.getNoteLine(n);
        const hasParenthesis: boolean =
            n.isGhost ||
            (this.isTiedBend(n) &&
                sr.settings.notation.isNotationElementVisible(NotationElement.ParenthesisOnTiedBends));

        const color = ElementStyleHelper.noteColor(sr.resources, NoteSubElement.Effects, n);

        this.add(new GhostNoteInfo(line, hasParenthesis, color));
    }

    public addParenthesisOnLine(line: number, hasParenthesis: boolean): void {
        const info: GhostNoteInfo = new GhostNoteInfo(line, hasParenthesis, undefined);
        this.add(info);
    }

    private add(info: GhostNoteInfo): void {
        this._infos.push(info);
        if (info.isGhost) {
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

    public override doLayout(): void {
        const sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        this._infos.sort((a, b) => {
            return a.line - b.line;
        });
        let previousGlyph: GhostParenthesisGlyph | null = null;
        const sizePerLine: number = sr.getScoreHeight(1);

        for (let i: number = 0, j: number = this._infos.length; i < j; i++) {
            let g: GhostParenthesisGlyph;
            if (!this._infos[i].isGhost) {
                previousGlyph = null;
            } else if (!previousGlyph) {
                g = new GhostParenthesisGlyph(this._isOpen);
                g.colorOverride = this._infos[i].color;
                g.renderer = this.renderer;
                g.y = sr.getScoreY(this._infos[i].line) - sizePerLine;
                g.height = sizePerLine * 2;
                g.doLayout();
                this._glyphs.push(g);
                previousGlyph = g;
            } else {
                const y: number = sr.getScoreY(this._infos[i].line) + sizePerLine;
                previousGlyph.height = y - previousGlyph.y;
            }
        }
        this.width = this._glyphs.length > 0 ? this._glyphs[0].width : 0;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy, canvas);
        for (const g of this._glyphs) {
            g.paint(cx + this.x, cy + this.y, canvas);
        }
    }
}
