import type { Chord } from '@src/model/Chord';
import { CanvasHelper, type ICanvas, TextAlign, TextBaseline } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { RenderingResources } from '@src/RenderingResources';

export class ChordDiagramGlyph extends EffectGlyph {
    private static readonly Frets: number = 5;

    private _chord: Chord;
    private _textRow: number = 0;
    private _fretRow: number = 0;
    private _firstFretSpacing: number = 0;

    public constructor(x: number, y: number, chord: Chord) {
        super(x, y);
        this._chord = chord;
    }

    public override doLayout(): void {
        super.doLayout();
        const res: RenderingResources = this.renderer.resources;
        this._textRow = res.effectFont.size * 1.5;
        this._fretRow = res.effectFont.size * 1.5;
        if (this._chord.firstFret > 1) {
            this._firstFretSpacing = this.renderer.smuflMetrics.chordDiagramFretSpacing;
        } else {
            this._firstFretSpacing = 0;
        }
        this.height =
            this._textRow +
            this._fretRow +
            ChordDiagramGlyph.Frets * this.renderer.smuflMetrics.chordDiagramFretSpacing +
            2 * this.renderer.smuflMetrics.chordDiagramPaddingY;
        this.width =
            this._firstFretSpacing +
            (this._chord.strings.length - 1) * this.renderer.smuflMetrics.chordDiagramStringSpacing +
            2 * this.renderer.smuflMetrics.chordDiagramPaddingX;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        cx += this.x + this.renderer.smuflMetrics.chordDiagramPaddingX + this._firstFretSpacing;
        cy += this.y;
        const stringSpacing: number = this.renderer.smuflMetrics.chordDiagramStringSpacing;
        const fretSpacing: number = this.renderer.smuflMetrics.chordDiagramFretSpacing;
        const res: RenderingResources = this.renderer.resources;
        const lineWidth = res.smuflMetrics.chordDiagramLineWidth;
        const w: number =
            this.width - 2 * this.renderer.smuflMetrics.chordDiagramPaddingX - this._firstFretSpacing + lineWidth;
        const circleHeight = res.smuflMetrics.glyphHeights.get(MusicFontSymbol.FretboardFilledCircle)!;
        const circleTopOffset = res.smuflMetrics.glyphTop.get(MusicFontSymbol.FretboardFilledCircle)!;
        const xTopOffset = res.smuflMetrics.glyphHeights.get(MusicFontSymbol.FretboardX)! / 2;
        const oTopOffset = res.smuflMetrics.glyphHeights.get(MusicFontSymbol.FretboardO)! / 2;

        const align: TextAlign = canvas.textAlign;
        const baseline: TextBaseline = canvas.textBaseline;
        canvas.font = res.effectFont;
        canvas.textAlign = TextAlign.Center;
        canvas.textBaseline = TextBaseline.Top;
        if (this._chord.showName) {
            canvas.fillText(this._chord.name, cx + w / 2, cy + res.effectFont.size / 2);
        }

        cy += this._textRow;
        canvas.font = res.fretboardNumberFont;
        canvas.textBaseline = TextBaseline.Middle;
        for (let i: number = 0; i < this._chord.strings.length; i++) {
            const x: number = cx + i * stringSpacing;
            const y: number = cy + this._fretRow / 2;
            let fret: number = this._chord.strings[this._chord.strings.length - i - 1];
            if (fret < 0) {
                CanvasHelper.fillMusicFontSymbolSafe(canvas,x, y + xTopOffset, 1, MusicFontSymbol.FretboardX, true);
            } else if (fret === 0) {
                CanvasHelper.fillMusicFontSymbolSafe(canvas,x, y + oTopOffset, 1, MusicFontSymbol.FretboardO, true);
            } else {
                fret -= this._chord.firstFret - 1;
                canvas.fillText(fret.toString(), x, y);
            }
        }

        cy += this._fretRow;
        for (let i: number = 0; i < this._chord.strings.length; i++) {
            const x: number = cx + i * stringSpacing;
            canvas.fillRect(x, cy, lineWidth, fretSpacing * ChordDiagramGlyph.Frets + 1);
        }

        if (this._chord.firstFret > 1) {
            canvas.textAlign = TextAlign.Left;
            canvas.fillText(this._chord.firstFret.toString(), cx - this._firstFretSpacing, cy + fretSpacing / 2);
            canvas.fillRect(cx, cy, w, lineWidth);
        } else {
            canvas.fillRect(
                cx,
                cy - this.renderer.smuflMetrics.chordDiagramNutHeight / 2,
                w,
                this.renderer.smuflMetrics.chordDiagramNutHeight
            );
        }

        for (let i: number = 0; i <= ChordDiagramGlyph.Frets; i++) {
            const y: number = cy + i * fretSpacing;
            canvas.fillRect(cx, y, w, this.renderer.smuflMetrics.chordDiagramFretHeight);
        }

        const barreLookup = new Map<number, number[]>();
        for (const barreFret of this._chord.barreFrets) {
            const strings: number[] = [-1, -1];
            barreLookup.set(barreFret - this._chord.firstFret, strings);
        }

        for (let guitarString: number = 0; guitarString < this._chord.strings.length; guitarString++) {
            let fret: number = this._chord.strings[guitarString];
            if (fret > 0) {
                fret -= this._chord.firstFret;
                if (barreLookup.has(fret)) {
                    const info = barreLookup.get(fret)!;
                    if (info[0] === -1 || guitarString < info[0]) {
                        info[0] = guitarString;
                    }
                    if (info[1] === -1 || guitarString > info[1]) {
                        info[1] = guitarString;
                    }
                }
                const y: number = cy + fret * fretSpacing + fretSpacing / 2 + 0.5;
                const x: number = cx + (this._chord.strings.length - guitarString - 1) * stringSpacing + lineWidth / 2;
                CanvasHelper.fillMusicFontSymbolSafe(canvas,
                    x,
                    y + circleTopOffset - circleHeight / 2,
                    1,
                    MusicFontSymbol.FretboardFilledCircle,
                    true
                );
            }
        }

        for (const [fret, strings] of barreLookup) {
            const y: number = cy + fret * fretSpacing + fretSpacing / 2 + 0.5;
            const xLeft: number = cx + (this._chord.strings.length - strings[1] - 1) * stringSpacing;
            const xRight: number = cx + (this._chord.strings.length - strings[0] - 1) * stringSpacing;
            canvas.fillRect(xLeft, y - circleHeight / 2, xRight - xLeft, circleHeight);
        }

        canvas.textAlign = align;
        canvas.textBaseline = baseline;
    }
}
