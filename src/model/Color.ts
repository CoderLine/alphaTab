import { FormatError } from '@src/FormatError';
import { ModelUtils } from './ModelUtils';

/**
 * @json_immutable
 */
export class Color {
    public static readonly BlackRgb: string = '#000000';

    /**
     * Initializes a new instance of the {@link Color} class.
     * @param r The red component.
     * @param g The green component.
     * @param b The blue component.
     * @param a The alpha component.
     */
    public constructor(r: number, g: number, b: number, a: number = 0xff) {
        this.raw = 0;
        this.raw = ((a & 0xff) << 24) | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
        this.updateRgba();
    }

    public updateRgba(): void {
        if (this.a === 0xff) {
            this.rgba =
                '#' +
                ModelUtils.toHexString(this.r, 2) +
                ModelUtils.toHexString(this.g, 2) +
                ModelUtils.toHexString(this.b, 2);
        } else {
            this.rgba = `rgba(${this.r},${this.g},${this.b},${this.a / 255.0})`;
        }
    }

    /**
     * Gets or sets the raw RGBA value.
     */
    public raw: number = 0;

    public get a(): number {
        return (this.raw >> 24) & 0xff;
    }

    public get r(): number {
        return (this.raw >> 16) & 0xff;
    }

    public get g(): number {
        return (this.raw >> 8) & 0xff;
    }

    public get b(): number {
        return this.raw & 0xff;
    }

    /**
     * Gets the RGBA hex string to use in CSS areas.
     */
    public rgba!: string;

    public static random(opacity: number = 100): Color {
        return new Color((Math.random() * 255) | 0, (Math.random() * 255) | 0, (Math.random() * 255) | 0, opacity);
    }

    public static fromJson(v: unknown): Color | null {
        switch (typeof v) {
            case 'number':
                {
                    const c = new Color(0, 0, 0, 0);
                    c.raw = v as number;
                    c.updateRgba();
                    return c;
                }
            case 'string':
                {
                    const json = v as string;
                    if (json.startsWith('#')) {
                        if (json.length === 4) {
                            // #RGB
                            return new Color(
                                parseInt(json.substring(1, 1), 16) * 17,
                                parseInt(json.substring(2, 1), 16) * 17,
                                parseInt(json.substring(3, 1), 16) * 17
                            );
                        }

                        if (json.length === 5) {
                            // #RGBA
                            return new Color(
                                parseInt(json.substring(1, 1), 16) * 17,
                                parseInt(json.substring(2, 1), 16) * 17,
                                parseInt(json.substring(3, 1), 16) * 17,
                                parseInt(json.substring(4, 1), 16) * 17
                            );
                        }

                        if (json.length === 7) {
                            // #RRGGBB
                            return new Color(
                                parseInt(json.substring(1, 2), 16),
                                parseInt(json.substring(3, 2), 16),
                                parseInt(json.substring(5, 2), 16)
                            );
                        }

                        if (json.length === 9) {
                            // #RRGGBBAA
                            return new Color(
                                parseInt(json.substring(1, 2), 16),
                                parseInt(json.substring(3, 2), 16),
                                parseInt(json.substring(5, 2), 16),
                                parseInt(json.substring(7, 2), 16)
                            );
                        }
                    } else if (json.startsWith('rgba') || json.startsWith('rgb')) {
                        const start = json.indexOf('(');
                        const end = json.lastIndexOf(')');
                        if (start === -1 || end === -1) {
                            throw new FormatError('No values specified for rgb/rgba function');
                        }

                        const numbers = json.substring(start + 1, end - start - 1).split(',');
                        if (numbers.length === 3) {
                            return new Color(parseInt(numbers[0]), parseInt(numbers[1]), parseInt(numbers[2]));
                        }

                        if (numbers.length === 4) {
                            return new Color(
                                parseInt(numbers[0]),
                                parseInt(numbers[1]),
                                parseInt(numbers[2]),
                                parseFloat(numbers[3]) * 255
                            );
                        }
                    }
                    return null;
                }
        }

        throw new FormatError('Unsupported format for color');
    }

    public static toJson(obj: Color): number {
        return obj.raw;
    }
}
