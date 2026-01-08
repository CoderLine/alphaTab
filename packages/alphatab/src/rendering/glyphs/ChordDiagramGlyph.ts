import type { Chord } from '@coderline/alphatab/model/Chord';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { CanvasHelper, type ICanvas, TextAlign, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import type { RenderingResources } from '@coderline/alphatab/RenderingResources';
import { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';

/**
 * @internal
 */
export class ChordDiagramGlyph extends EffectGlyph {
    private static readonly _frets: number = 5;

    private _chord: Chord;
    private _textRow: number = 0;
    private _fretRow: number = 0;
    private _firstFretSpacing: number = 0;
    private _center: boolean;
    private _fontElement: NotationElement;

    public constructor(x: number, y: number, chord: Chord, fontElement: NotationElement, center: boolean = false) {
        super(x, y);
        this._chord = chord;
        this._center = center;
        this._fontElement = fontElement;
    }

    public override doLayout(): void {
        super.doLayout();
        const res: RenderingResources = this.renderer.resources;
        const font = res.elementFonts.get(this._fontElement)!;
        this._textRow = font.size * 1.5;
        this._fretRow = font.size * 1.5;
        this.height = this._textRow;
        this.width = 2 * this.renderer.smuflMetrics.chordDiagramPaddingX;

        if (this.renderer.settings.notation.isNotationElementVisible(NotationElement.ChordDiagramFretboardNumbers)) {
            if (this._chord.firstFret > 1) {
                this._firstFretSpacing = this.renderer.smuflMetrics.chordDiagramFretSpacing;
            } else {
                this._firstFretSpacing = 0;
            }
            this.height +=
                this._fretRow +
                ChordDiagramGlyph._frets * this.renderer.smuflMetrics.chordDiagramFretSpacing +
                2 * this.renderer.smuflMetrics.chordDiagramPaddingY;
            this.width +=
                this._firstFretSpacing +
                (this._chord.strings.length - 1) * this.renderer.smuflMetrics.chordDiagramStringSpacing;
        } else if (this._chord.showName) {
            const canvas = this.renderer.scoreRenderer.canvas!;
            canvas.font = font;
            this.width += canvas.measureText(this._chord.name).width;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        cx += this.x + this.renderer.smuflMetrics.chordDiagramPaddingX + this._firstFretSpacing;
        cy += this.y;
        if (this._center) {
            cx -= this.width / 2;
        }

        const res: RenderingResources = this.renderer.resources;
        const lineWidth = res.engravingSettings.chordDiagramLineWidth;
        const w: number =
            this.width - 2 * this.renderer.smuflMetrics.chordDiagramPaddingX - this._firstFretSpacing + lineWidth;

        const align: TextAlign = canvas.textAlign;
        const baseline: TextBaseline = canvas.textBaseline;
        const font = res.elementFonts.get(this._fontElement)!;
        canvas.font = font;
        canvas.textAlign = TextAlign.Center;
        canvas.textBaseline = TextBaseline.Top;
        if (this._chord.showName) {
            canvas.fillText(this._chord.name, cx + w / 2, cy + font.size / 2);
        }

        if (this.renderer.settings.notation.isNotationElementVisible(NotationElement.ChordDiagramFretboardNumbers)) {
            this._paintFretboard(cx, cy, canvas, w);
        }

        canvas.textAlign = align;
        canvas.textBaseline = baseline;
    }
    private _paintFretboard(cx: number, cy: number, canvas: ICanvas, w: number) {
        cy += this._textRow;

        const res: RenderingResources = this.renderer.resources;
        const stringSpacing: number = this.renderer.smuflMetrics.chordDiagramStringSpacing;
        const fretSpacing: number = this.renderer.smuflMetrics.chordDiagramFretSpacing;
        const circleHeight = res.engravingSettings.glyphHeights.get(MusicFontSymbol.FretboardFilledCircle)!;
        const circleTopOffset = res.engravingSettings.glyphTop.get(MusicFontSymbol.FretboardFilledCircle)!;
        const xTopOffset = res.engravingSettings.glyphHeights.get(MusicFontSymbol.FretboardX)! / 2;
        const oTopOffset = res.engravingSettings.glyphHeights.get(MusicFontSymbol.FretboardO)! / 2;
        const lineWidth = res.engravingSettings.chordDiagramLineWidth;

        canvas.font = res.elementFonts.get(NotationElement.ChordDiagramFretboardNumbers)!;
        canvas.textBaseline = TextBaseline.Middle;
        for (let i: number = 0; i < this._chord.strings.length; i++) {
            const x: number = cx + i * stringSpacing;
            const y: number = cy + this._fretRow / 2;
            let fret: number = this._chord.strings[this._chord.strings.length - i - 1];
            if (fret < 0) {
                CanvasHelper.fillMusicFontSymbolSafe(canvas, x, y + xTopOffset, 1, MusicFontSymbol.FretboardX, true);
            } else if (fret === 0) {
                CanvasHelper.fillMusicFontSymbolSafe(canvas, x, y + oTopOffset, 1, MusicFontSymbol.FretboardO, true);
            } else {
                fret -= this._chord.firstFret - 1;
                canvas.fillText(fret.toString(), x, y);
            }
        }

        cy += this._fretRow;
        for (let i: number = 0; i < this._chord.strings.length; i++) {
            const x: number = cx + i * stringSpacing;
            canvas.fillRect(x, cy, lineWidth, fretSpacing * ChordDiagramGlyph._frets + 1);
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

        for (let i: number = 0; i <= ChordDiagramGlyph._frets; i++) {
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
                CanvasHelper.fillMusicFontSymbolSafe(
                    canvas,
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
    }
}
