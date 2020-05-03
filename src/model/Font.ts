import { Environment } from '@src/Environment';

/**
 * Lists all flags for font styles.
 */
export enum FontStyle {
    /**
     * No flags.
     */
    Plain,
    /**
     * Font is bold
     */ Bold,
    /**
     * Font is italic.
     */ Italic
}

/**
 * @json_immutable
 */
export class Font {
    private _css: string;
    private _cssScale: number = 0.0;

    /**
     * Gets or sets the font family name.
     */
    public family: string;

    /**
     * Gets or sets the font size in pixels.
     */
    public size: number;

    /**
     * Gets or sets the font style.
     */
    public style: FontStyle;

    public get isBold(): boolean {
        return (this.style & FontStyle.Bold) !== 0;
    }

    public get isItalic(): boolean {
        return (this.style & FontStyle.Italic) !== 0;
    }

    /**
     * Initializes a new instance of the {@link Font} class.
     * @param family The family.
     * @param size The size.
     * @param style The style.
     */
    public constructor(family: string, size: number, style: FontStyle = FontStyle.Plain) {
        this.family = family;
        this.size = size;
        this.style = style;
        this._css = this.toCssString(1);
    }

    public clone(): Font {
        return new Font(this.family, this.size, this.style);
    }

    public toCssString(scale: number): string {
        if (!this._css || !(Math.abs(scale - this._cssScale) < 0.01)) {
            let buf: string = '';
            if (this.isBold) {
                buf += 'bold ';
            }
            if (this.isItalic) {
                buf += 'italic ';
            }
            buf += this.size * scale;
            buf += 'px ';
            buf += "'";
            buf += this.family;
            buf += "'";
            this._css = buf;
            this._cssScale = scale;
        }
        return this._css;
    }

    /**
     * @target web
     */
    public static fromJson(value: unknown): Font | null {
        if (!value) {
            return null;
        }

        if (value instanceof Font) {
            return value;
        }

        if (typeof value === 'object' && (value as any).family) {
            return new Font((value as any).family, (value as any).size, (value as any).style);
        }

        if (typeof value === 'string' && !Environment.isRunningInWorker) {
            let el: HTMLElement = document.createElement('span');
            el.setAttribute('style', 'font: ' + value);
            let style: CSSStyleDeclaration = el.style;
            if (!style.fontFamily) {
                style.fontFamily = 'sans-serif';
            }

            let family: string = style.fontFamily;
            if ((family.startsWith("'") && family.endsWith("'")) || (family.startsWith('"') && family.endsWith('"'))) {
                family = family.substr(1, family.length - 2);
            }

            let fontSizeString: string = style.fontSize.toLowerCase();
            let fontSize: number = 0;
            // as per https://websemantics.uk/articles/font-size-conversion/
            switch (fontSizeString) {
                case 'xx-small':
                    fontSize = 7;
                    break;
                case 'x-small':
                    fontSize = 10;
                    break;
                case 'small':
                case 'smaller':
                    fontSize = 13;
                    break;
                case 'medium':
                    fontSize = 16;
                    break;
                case 'large':
                case 'larger':
                    fontSize = 18;
                    break;
                case 'x-large':
                    fontSize = 24;
                    break;
                case 'xx-large':
                    fontSize = 32;
                    break;
                default:
                    try {
                        if (fontSizeString.endsWith('em')) {
                            fontSize = parseFloat(fontSizeString.substr(0, fontSizeString.length - 2)) * 16;
                        } else if (fontSizeString.endsWith('pt')) {
                            fontSize = (parseFloat(fontSizeString.substr(0, fontSizeString.length - 2)) * 16.0) / 12.0;
                        } else if (fontSizeString.endsWith('px')) {
                            fontSize = parseFloat(fontSizeString.substr(0, fontSizeString.length - 2));
                        } else {
                            fontSize = 12;
                        }
                    } catch (e) {
                        fontSize = 12;
                    }
                    break;
            }

            let fontStyle: FontStyle = FontStyle.Plain;
            if (style.fontStyle === 'italic') {
                fontStyle |= FontStyle.Italic;
            }
            let fontWeightString: string = style.fontWeight.toLowerCase();
            switch (fontWeightString) {
                case 'normal':
                case 'lighter':
                    break;
                default:
                    fontStyle |= FontStyle.Bold;
                    break;
            }

            return new Font(family, fontSize, fontStyle);
        }

        return null;
    }
    
    /**
     * @target web
     */
    public static toJson(font: Font): unknown {
        return {
            family: font.family,
            size: font.size,
            style: font.style
        };
    }
}
