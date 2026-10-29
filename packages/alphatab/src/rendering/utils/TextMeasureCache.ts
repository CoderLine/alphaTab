import type { Font, FontStyle, FontWeight } from '@coderline/alphatab/model/Font';
import type { ICanvas, MeasuredText } from '@coderline/alphatab/platform/ICanvas';

/**
 * The measured texts of one font, valid while the font keeps the recorded properties.
 * @internal
 */
class FontTextMeasures {
    public readonly font: Font;
    public readonly texts: Map<string, MeasuredText> = new Map<string, MeasuredText>();
    private _families: string[];
    private _size: number;
    private _style: FontStyle;
    private _weight: FontWeight;

    public constructor(font: Font) {
        this.font = font;
        this._families = font.families;
        this._size = font.size;
        this._style = font.style;
        this._weight = font.weight;
    }

    public matches(font: Font): boolean {
        return (
            this.font === font &&
            this._families === font.families &&
            this._size === font.size &&
            this._style === font.style &&
            this._weight === font.weight
        );
    }
}

/**
 * Text measurements of a canvas by its current font and the text. Switching to another canvas
 * drops all entries. The returned {@link MeasuredText} instances are shared and must not be modified.
 * @internal
 */
export class TextMeasureCache {
    private _canvas: ICanvas | null = null;
    private _fonts: FontTextMeasures[] = [];
    private _last: FontTextMeasures | null = null;

    public clear(): void {
        this._canvas = null;
        this._last = null;
        if (this._fonts.length > 0) {
            this._fonts = [];
        }
    }

    public measureText(canvas: ICanvas, text: string): MeasuredText {
        if (this._canvas !== canvas) {
            this.clear();
            this._canvas = canvas;
        }

        const font = canvas.font;
        let entry = this._last;
        if (!entry || !entry.matches(font)) {
            entry = null;
            for (const f of this._fonts) {
                if (f.matches(font)) {
                    entry = f;
                    break;
                }
            }
            if (!entry) {
                entry = new FontTextMeasures(font);
                this._fonts.push(entry);
            }
            this._last = entry;
        }

        const cached = entry.texts.get(text);
        if (cached) {
            return cached;
        }
        const measured = canvas.measureText(text);
        entry.texts.set(text, measured);
        return measured;
    }
}
