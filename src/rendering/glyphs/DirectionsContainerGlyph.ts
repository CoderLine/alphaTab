import { Direction } from '@src/model/Direction';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { type ICanvas, TextBaseline, TextAlign } from '@src/platform/ICanvas';

class TargetDirectionGlyph extends Glyph {
    private _symbols: MusicFontSymbol[];

    constructor(symbols: MusicFontSymbol[]) {
        super(0, 0);
        this._symbols = symbols;
    }

    public override doLayout(): void {
        this.height = 27 /* glyph */;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        canvas.fillMusicFontSymbols(cx + this.x, cy + this.y + this.height, 0.8, this._symbols, true);
    }
}

class JumpDirectionGlyph extends Glyph {
    private _text: string;

    constructor(text: string) {
        super(0, 0);
        this._text = text;
    }

    public override doLayout(): void {
        this.height = this.renderer.resources.directionsFont.size * 1.5;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const font = canvas.font;
        const baseline = canvas.textBaseline;
        const align = canvas.textAlign;

        canvas.font = this.renderer.resources.directionsFont;
        canvas.textBaseline = TextBaseline.Middle;
        canvas.textAlign = TextAlign.Right;

        canvas.fillText(this._text, cx + this.x, cy + this.y + this.height / 2);

        canvas.font = font;
        canvas.textBaseline = baseline;
        canvas.textAlign = align;
    }
}

export class DirectionsContainerGlyph extends EffectGlyph {
    private _directions: Set<Direction>;

    private _barBeginGlyphs: Glyph[] = [];
    private _barEndGlyphs: Glyph[] = [];

    public constructor(x: number, y: number, directions: Set<Direction>) {
        super(x, y);
        this._directions = directions;
    }

    public override doLayout(): void {
        const d = this._directions;
        if (d.has(Direction.TargetSegnoSegno)) {
            this._barBeginGlyphs.push(new TargetDirectionGlyph([MusicFontSymbol.Segno, MusicFontSymbol.Segno]));
        }
        if (d.has(Direction.TargetSegno)) {
            this._barBeginGlyphs.push(new TargetDirectionGlyph([MusicFontSymbol.Segno]));
        }
        if (d.has(Direction.TargetDoubleCoda)) {
            this._barBeginGlyphs.push(new TargetDirectionGlyph([MusicFontSymbol.Coda, MusicFontSymbol.Coda]));
        }
        if (d.has(Direction.TargetCoda)) {
            this._barBeginGlyphs.push(new TargetDirectionGlyph([MusicFontSymbol.Coda]));
        }

        if (d.has(Direction.TargetFine)) {
            this._barEndGlyphs.push(new JumpDirectionGlyph('Fine'));
        }
        if (d.has(Direction.JumpDaDoubleCoda)) {
            this._barEndGlyphs.push(new JumpDirectionGlyph('To Double Coda'));
        }
        if (d.has(Direction.JumpDaCoda)) {
            this._barEndGlyphs.push(new JumpDirectionGlyph('To Coda'));
        }

        if (d.has(Direction.JumpDalSegnoSegno)) {
            this._barEndGlyphs.push(new JumpDirectionGlyph('D.S.S.'));
        }
        if (d.has(Direction.JumpDalSegnoSegnoAlCoda)) {
            this._barEndGlyphs.push(new JumpDirectionGlyph('D.S.S. al Coda'));
        }
        if (d.has(Direction.JumpDalSegnoSegnoAlDoubleCoda)) {
            this._barEndGlyphs.push(new JumpDirectionGlyph('D.S.S. al Double Coda'));
        }
        if (d.has(Direction.JumpDalSegnoSegnoAlFine)) {
            this._barEndGlyphs.push(new JumpDirectionGlyph('D.S.S. al Fine'));
        }

        if (d.has(Direction.JumpDalSegno)) {
            this._barEndGlyphs.push(new JumpDirectionGlyph('D.S.'));
        }
        if (d.has(Direction.JumpDalSegnoAlCoda)) {
            this._barEndGlyphs.push(new JumpDirectionGlyph('D.S. al Coda'));
        }
        if (d.has(Direction.JumpDalSegnoAlDoubleCoda)) {
            this._barEndGlyphs.push(new JumpDirectionGlyph('D.S. al Double Coda'));
        }
        if (d.has(Direction.JumpDalSegnoAlFine)) {
            this._barEndGlyphs.push(new JumpDirectionGlyph('D.S. al Fine'));
        }

        if (d.has(Direction.JumpDaCapo)) {
            this._barEndGlyphs.push(new JumpDirectionGlyph('D.C.'));
        }
        if (d.has(Direction.JumpDaCapoAlCoda)) {
            this._barEndGlyphs.push(new JumpDirectionGlyph('D.C. al Coda'));
        }
        if (d.has(Direction.JumpDaCapoAlDoubleCoda)) {
            this._barEndGlyphs.push(new JumpDirectionGlyph('D.C. al Double Coda'));
        }
        if (d.has(Direction.JumpDaCapoAlFine)) {
            this._barEndGlyphs.push(new JumpDirectionGlyph('D.C. al Fine'));
        }

        const beginHeight = this.doSideLayout(this._barBeginGlyphs);
        const endHeight = this.doSideLayout(this._barEndGlyphs);

        this.height = Math.max(beginHeight, endHeight);
    }

    private doSideLayout(glyphs: Glyph[]): number {
        let y = 0;

        const padding = 3;

        for (const g of glyphs) {
            g.y = y;
            g.renderer = this.renderer;
            g.doLayout();

            y += g.height + padding;
        }

        return y;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        for (const begin of this._barBeginGlyphs) {
            begin.paint(cx + this.x, cy + this.y, canvas);
        }

        for (const end of this._barEndGlyphs) {
            end.paint(cx + this.x + this.width, cy + this.y, canvas);
        }
    }
}
