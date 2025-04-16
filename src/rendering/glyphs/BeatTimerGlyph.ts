import { type ICanvas, TextBaseline, TextAlign } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';

export class BeatTimerGlyph extends EffectGlyph {
    private static readonly PaddingX = 2;
    private static readonly PaddingY = 2;
    private static readonly MarginY = 2;

    private _timer: number;
    private _text: string = '';
    private _textWidth: number = 0;
    private _textHeight: number = 0;
    public constructor(timer: number) {
        super(0, 0);
        this._timer = timer;
    }

    public override doLayout(): void {
        const minutes = (this._timer / 60000) | 0;
        const seconds = ((this._timer - minutes * 60000) / 1000) | 0;
        this._text = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        const c = this.renderer.scoreRenderer.canvas!;
        c.font = this.renderer.resources.timerFont;

        const size = c.measureText(this._text);

        this._textHeight = c.font.size + BeatTimerGlyph.PaddingY * 2;
        this._textWidth = size.width + BeatTimerGlyph.PaddingX * 2;

        this.height = this._textHeight + BeatTimerGlyph.MarginY * 2;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const halfWidth = (this._textWidth / 2) | 0;
        canvas.strokeRect(
            cx + this.x - halfWidth,
            cy + this.y + BeatTimerGlyph.MarginY,
            this._textWidth,
            this._textHeight
        );
        const f = canvas.font;
        const b = canvas.textBaseline;
        const a = canvas.textAlign;
        canvas.font = this.renderer.resources.timerFont;
        canvas.textBaseline = TextBaseline.Middle;
        canvas.textAlign = TextAlign.Center;
        canvas.fillText(this._text, cx + this.x, cy + this.y + this.height / 2);
        canvas.font = f;
        canvas.textBaseline = b;
        canvas.textAlign = a;
    }
}
