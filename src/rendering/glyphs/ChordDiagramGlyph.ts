import { Chord } from '@src/model/Chord';
import { ICanvas, TextAlign, TextBaseline } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { RenderingResources } from '@src/RenderingResources';

export class ChordDiagramGlyph extends EffectGlyph {
    private static readonly Padding: number = 5;
    private static readonly Frets: number = 5;
    private static readonly CircleRadius: number = 2.5;
    private static readonly StringSpacing: number = 10;
    private static readonly FretSpacing: number = 12;

    private _chord: Chord;
    private _textRow: number = 0;
    private _fretRow: number = 0;
    private _firstFretSpacing: number = 0;

    public constructor(x: number, y: number, chord: Chord) {
        super(x, y);
        this._chord = chord;
    }

    public doLayout(): void {
        super.doLayout();
        const scale = this.scale;
        let res: RenderingResources = this.renderer.resources;
        this._textRow = res.effectFont.size * 1.5 * scale;
        this._fretRow = res.effectFont.size * 1.5 * scale;
        if (this._chord.firstFret > 1) {
            this._firstFretSpacing = ChordDiagramGlyph.FretSpacing * scale;
        } else {
            this._firstFretSpacing = 0;
        }
        this.height =
            this._textRow +
            this._fretRow +
            (ChordDiagramGlyph.Frets - 1) * ChordDiagramGlyph.FretSpacing * scale +
            2 * ChordDiagramGlyph.Padding * scale;
        this.width =
            this._firstFretSpacing +
            (this._chord.staff.tuning.length - 1) * ChordDiagramGlyph.StringSpacing * scale +
            2 * ChordDiagramGlyph.Padding * scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        cx += this.x + ChordDiagramGlyph.Padding * this.scale + this._firstFretSpacing;
        cy += this.y;
        let w: number = this.width - 2 * ChordDiagramGlyph.Padding * this.scale + this.scale - this._firstFretSpacing;
        let stringSpacing: number = ChordDiagramGlyph.StringSpacing * this.scale;
        let fretSpacing: number = ChordDiagramGlyph.FretSpacing * this.scale;
        let res: RenderingResources = this.renderer.resources;
        let circleRadius: number = ChordDiagramGlyph.CircleRadius * this.scale;

        let align: TextAlign = canvas.textAlign;
        let baseline: TextBaseline = canvas.textBaseline;
        canvas.font = res.effectFont;
        canvas.textAlign = TextAlign.Center;
        canvas.textBaseline = TextBaseline.Top;
        if (this._chord.showName) {
            canvas.fillText(this._chord.name, cx + this.width / 2, cy + res.effectFont.size / 2);
        }

        cy += this._textRow;
        cx += stringSpacing / 2;
        canvas.font = res.fretboardNumberFont;
        canvas.textBaseline = TextBaseline.Middle;
        for (let i: number = 0; i < this._chord.staff.tuning.length; i++) {
            let x: number = cx + i * stringSpacing;
            let y: number = cy + this._fretRow / 2;
            let fret: number = this._chord.strings[this._chord.staff.tuning.length - i - 1];
            if (fret < 0) {
                canvas.fillMusicFontSymbol(x, y, this.scale, MusicFontSymbol.FretboardX, true);
            } else if (fret === 0) {
                canvas.fillMusicFontSymbol(x, y, this.scale, MusicFontSymbol.FretboardO, true);
            } else {
                fret -= this._chord.firstFret - 1;
                canvas.fillText(fret.toString(), x, y);
            }
        }

        cy += this._fretRow;
        for (let i: number = 0; i < this._chord.staff.tuning.length; i++) {
            let x: number = cx + i * stringSpacing;
            canvas.fillRect(x, cy, 1, fretSpacing * ChordDiagramGlyph.Frets + this.scale);
        }

        if (this._chord.firstFret > 1) {
            canvas.textAlign = TextAlign.Left;
            canvas.fillText(this._chord.firstFret.toString(), cx - this._firstFretSpacing, cy + fretSpacing / 2);
        }

        canvas.fillRect(cx, cy - this.scale, w, 2 * this.scale);
        for (let i: number = 0; i <= ChordDiagramGlyph.Frets; i++) {
            let y: number = cy + i * fretSpacing;
            canvas.fillRect(cx, y, w, this.scale);
        }

        let barreLookup = new Map<number, number[]>();
        for (let barreFret of this._chord.barreFrets) {
            let strings: number[] = [-1, -1];
            barreLookup.set(barreFret - this._chord.firstFret, strings);
        }

        for (let guitarString: number = 0; guitarString < this._chord.strings.length; guitarString++) {
            let fret: number = this._chord.strings[guitarString];
            if (fret > 0) {
                fret -= this._chord.firstFret;
                if (barreLookup.has(fret)) {
                    let info = barreLookup.get(fret)!;
                    if (info[0] === -1 || guitarString < info[0]) {
                        info[0] = guitarString;
                    }
                    if (info[1] === -1 || guitarString > info[1]) {
                        info[1] = guitarString;
                    }
                }
                let y: number = cy + fret * fretSpacing + fretSpacing / 2 + 0.5 * this.scale;
                let x: number = cx + (this._chord.strings.length - guitarString - 1) * stringSpacing;
                canvas.fillCircle(x, y, circleRadius);
            }
        }

        for(const [fret, strings] of barreLookup) {
            let y: number = cy + fret * fretSpacing + fretSpacing / 2 + 0.5 * this.scale;
            let xLeft: number = cx + (this._chord.strings.length - strings[1] - 1) * stringSpacing;
            let xRight: number = cx + (this._chord.strings.length - strings[0] - 1) * stringSpacing;
            canvas.fillRect(xLeft, y - circleRadius, xRight - xLeft, circleRadius * 2);
        }

        canvas.textAlign = align;
        canvas.textBaseline = baseline;
    }
}
