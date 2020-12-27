import { JsonHelper } from '@src/io/JsonHelper';

/**
 * A very basic font parser which parses the fields according to 
 * https://www.w3.org/TR/CSS21/fonts.html#propdef-font
 */
class FontParserToken {
    public startPos: number;
    public endPos: number;
    public text: string;
    public constructor(text: string, startPos: number, endPos: number) {
        this.text = text;
        this.startPos = startPos;
        this.endPos = endPos;
    }
}

class FontParser {
    public style: string = 'normal';
    public variant: string = 'normal';
    public weight: string = 'normal';
    public stretch: string = 'normal';
    public lineHeight: string = 'normal';
    public size: string = '1rem';
    public families: string[] = [];

    private _tokens: FontParserToken[];
    private _currentTokenIndex: number = -1;
    private _input: string = '';
    private _currentToken: FontParserToken | null = null;

    public constructor(input: string) {
        this._input = input;
        this._tokens = this.splitToTokens(input);;
    }

    private splitToTokens(input: string): FontParserToken[] {
        const tokens: FontParserToken[] = [];

        let startPos = 0;
        while (startPos < input.length) {
            let endPos = startPos;
            while (endPos < input.length && input.charAt(endPos) !== ' ') {
                endPos++;
            }

            if (endPos > startPos) {
                tokens.push(new FontParserToken(input.substring(startPos, endPos), startPos, endPos));
            }

            startPos = endPos + 1;;
        }

        return tokens;
    }

    public parse() {
        this.reset();
        // default font flags
        if (this._tokens.length === 1) {
            switch (this._currentToken?.text) {
                case 'caption':
                case 'icon':
                case 'menu':
                case 'message-box':
                case 'small-caption':
                case 'status-bar':
                case 'inherit':
                    return;
            }
        }

        this.fontStyleVariantWeight();
        this.fontSizeLineHeight();
        this.fontFamily();
    }

    private fontFamily() {
        if (!this._currentToken) {
            throw new Error(`Missing font list`);
        }

        const familyListInput = this._input.substr(this._currentToken.startPos).trim();
        let pos = 0;
        while (pos < familyListInput.length) {
            let c = familyListInput.charAt(pos);
            if (c === ' ' || c == ',') {
                // skip whitespace and quotes
                pos++;
            } else if (c === '"' || c === "'") {
                // quoted 
                const endOfString = this.findEndOfQuote(familyListInput, pos + 1, c);
                this.families.push(familyListInput.substring(pos + 1, endOfString).split("\\" + c).join(c));
                pos = endOfString + 1;
            } else {
                // until comma
                const endOfString = this.findEndOfQuote(familyListInput, pos + 1, ',');
                this.families.push(familyListInput.substring(pos, endOfString).trim());
                pos = endOfString + 1;
            }
        }
    }

    private findEndOfQuote(s: string, pos: number, quoteChar: string): number {
        let escaped = false;
        while (pos < s.length) {
            const c = s.charAt(pos);

            if (!escaped && c === quoteChar) {
                return pos;
            }

            if (!escaped && c === '\\') {
                escaped = true;
            } else {
                escaped = false;
            }
            pos++;
        }

        return s.length;
    }

    private fontSizeLineHeight() {
        if (!this._currentToken) {
            throw new Error(`Missing font size`);
        }

        const parts = this._currentToken.text.split('/');
        if (parts.length >= 3) {
            throw new Error(`Invalid font size '${this._currentToken}' specified`);
        }

        this.nextToken();

        if (parts.length >= 2) {
            if (parts[1] === '/') {
                // size/ line-height (space after slash)
                if (!this._currentToken) {
                    throw new Error('Missing line-height after font size');
                }
                this.lineHeight = this._currentToken.text;
                this.nextToken();
            } else {
                // size/line-height (no spaces)
                this.size = parts[0];
                this.lineHeight = parts[1];
            }
        } else if (parts.length >= 1) {
            this.size = parts[0];
            if (this._currentToken?.text.indexOf('/') === 0) {
                // size / line-height (with spaces befor and after slash)
                if (this._currentToken.text === '/') {
                    this.nextToken();
                    if (!this._currentToken) {
                        throw new Error('Missing line-height after font size');
                    }
                    this.lineHeight = this._currentToken.text;
                    this.nextToken();
                } else {
                    this.lineHeight = this._currentToken.text.substr(1);
                    this.nextToken();
                }
            }
        } else {
            throw new Error(`Missing font size`);
        }
    }

    private nextToken() {
        this._currentTokenIndex++;
        if (this._currentTokenIndex < this._tokens.length) {
            this._currentToken = this._tokens[this._currentTokenIndex];
        } else {
            this._currentToken = null;
        }
    }

    private fontStyleVariantWeight() {
        let hasStyle = false;
        let hasVariant = false;
        let hasWeight = false;
        let valuesNeeded = 3;
        let ambiguous: string[] = [];

        while (true) {
            switch (this._currentToken?.text) {
                // ambiguous
                case 'normal':
                case 'inherit':
                    ambiguous.push(this._currentToken?.text);
                    valuesNeeded--;
                    this.nextToken();
                    break;

                // style
                case 'italic':
                case 'oblique':
                    this.style = this._currentToken?.text;
                    hasStyle = true;
                    valuesNeeded--;
                    this.nextToken();
                    break;
                // variant
                case 'small-caps':
                    this.variant = this._currentToken?.text;
                    hasVariant = true;
                    valuesNeeded--;
                    this.nextToken();
                    break;

                // weight
                case 'bold':
                case 'bolder':
                case 'lighter':
                case '100':
                case '200':
                case '300':
                case '400':
                case '500':
                case '600':
                case '700':
                case '800':
                case '900':
                    this.weight = this._currentToken?.text;
                    hasWeight = true;
                    valuesNeeded--;
                    this.nextToken();
                    break;
                default:
                    // unknown token -> done with this part
                    return;
            }

            if (valuesNeeded === 0) {
                break;
            }
        }

        while (ambiguous.length > 0) {
            const v = ambiguous.pop()!;
            if (!hasWeight) {
                this.weight = v;
            }
            else if (!hasVariant) {
                this.variant = v;
            }
            else if (!hasStyle) {
                this.style = v;
            }
        }
    }

    private reset() {
        this._currentTokenIndex = -1;
        this.nextToken();
    }
}

/**
 * Lists all flags for font styles.
 */
export enum FontStyle {
    /**
     * No flags.
     */
    Plain = 0,
    /**
     * Font is bold
     */
    Bold = 1,
    /**
     * Font is italic.
     */
    Italic = 2
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

    public static fromJson(v:unknown): Font | null {
        switch (typeof v) {
            case 'undefined':
                return null;
            case 'object':
                {
                    const m = v as Map<string, unknown>;
                    let family = m.get('family') as string;
                    let size = m.get('size') as number;
                    let style = JsonHelper.parseEnum<FontStyle>(m.get('style'), FontStyle)!;
                    return new Font(family, size, style);
                }
            case 'string':
                {
                    const parser = new FontParser(v as string);
                    parser.parse();

                    let family: string = parser.families[0];
                    if ((family.startsWith("'") && family.endsWith("'")) || (family.startsWith('"') && family.endsWith('"'))) {
                        family = family.substr(1, family.length - 2);
                    }

                    let fontSizeString: string = parser.size.toLowerCase();
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
                    if (parser.style === 'italic') {
                        fontStyle |= FontStyle.Italic;
                    }
                    let fontWeightString: string = parser.weight.toLowerCase();
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
            default:
                return null;
        }
    }

    public static toJson(font: Font): Map<string, unknown> {
        const o = new Map<string, unknown>();
        o.set('family', font.family);
        o.set('size', font.size);
        o.set('style', font.style as number);
        return o;
    }
}
