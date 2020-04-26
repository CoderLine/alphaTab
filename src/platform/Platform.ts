/**
 * @partial
 */
export class Platform {
    /**
     * @target web
     */
    public static get isRunningInWorker(): boolean {
        return 'WorkerGlobalScope' in globalThis;
    }

    /**
     * @target web
     */
    public static get supportsFontsApi(): boolean {
        return 'fonts' in document && 'load' in (document as any).fonts;
    }

    /**
     * @target web
     */
    public static get supportsTextDecoder(): boolean {
        return 'TextDecoder' in globalThis;
    }

    /**
     * @target web
     */
    public static toString(data: Uint8Array, encoding: string): string {
        if (Platform.supportsTextDecoder) {
            let detectedEncoding: string | null = Platform.detectEncoding(data);
            if (detectedEncoding) {
                encoding = detectedEncoding;
            }
            if (!encoding) {
                encoding = 'utf-8';
            }
            let decoder: TextDecoder = new TextDecoder(encoding);
            return decoder.decode(data as ArrayBuffer);
        } else {
            // manual UTF8 decoding for older browsers
            let s: string = '';
            let i: number = 0;
            while (i < data.length) {
                let c: number = data[i++];
                if (c < 0x80) {
                    if (c === 0) {
                        break;
                    }
                    s += String.fromCharCode(c);
                } else if (c < 0xe0) {
                    s += String.fromCharCode(((c & 0x3f) << 6) | (data[i++] & 0x7f));
                } else if (c < 0xf0) {
                    s += String.fromCharCode(((c & 0x1f) << 12) | ((data[i++] & 0x7f) << 6) | (data[i++] & 0x7f));
                } else {
                    let u: number =
                        ((c & 0x0f) << 18) |
                        ((data[i++] & 0x7f) << 12) |
                        ((data[i++] & 0x7f) << 6) |
                        (data[i++] & 0x7f);
                    s += String.fromCharCode((u >> 18) + 0xd7c0);
                    s += String.fromCharCode((u & 0x3ff) | 0xdc00);
                }
            }
            return s;
        }
    }

    public static stringToByteArray(contents: string): Uint8Array {
        let byteArray: Uint8Array = new Uint8Array(contents.length);
        for (let i: number = 0; i < contents.length; i++) {
            byteArray[i] = contents.charCodeAt(i);
        }
        return byteArray;
    }

    public static newGuid(): string {
        return (
            Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1) +
            Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1) +
            '-' +
            Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1) +
            '-' +
            Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1) +
            '-' +
            Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1) +
            '-' +
            Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1) +
            Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1) +
            Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1)
        );
    }

    public static toDouble(bytes: Uint8Array): number {
        let array: Float64Array = new Float64Array(bytes.buffer);
        return array[0];
    }

    public static toFloat(bytes: Uint8Array): number {
        let array: Float32Array = new Float32Array(bytes.buffer);
        return array[0];
    }

    /**
     * @target web
     */
    public static throttle(action: () => void, delay: number): () => void {
        let timeoutId: number = 0;
        return () => {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(action, delay);
        };
    }

    public static isCharNumber(c: number, allowSign: boolean = true): boolean {
        return (allowSign && c === 0x2d) || (c >= 0x30 && c <= 0x39);
    }

    public static isWhiteSpace(c: number): boolean {
        return c === 0x20 || c === 0x0b || c === 0x0d || c === 0x0a || c === 0x09;
    }

    public static isAlmostEqualTo(a: number, b: number): boolean {
        return Math.abs(a - b) < 0.00001;
    }

    public static toHexString(n: number, digits: number = 0): string {
        let s: string = '';
        let hexChars: string = '0123456789ABCDEF';
        do {
            s = String.fromCharCode(hexChars.charCodeAt(n & 15)) + s;
            n = n >> 4;
        } while (n > 0);
        while (s.length < digits) {
            s = '0' + s;
        }
        return s;
    }

    private static detectEncoding(data: Uint8Array): string | null {
        if (data.length > 2 && data[0] === 0xfe && data[1] === 0xff) {
            return 'utf-16be';
        }
        if (data.length > 2 && data[0] === 0xff && data[1] === 0xfe) {
            return 'utf-16le';
        }
        if (data.length > 4 && data[0] === 0x00 && data[1] === 0x00 && data[2] === 0xfe && data[3] === 0xff) {
            return 'utf-32be';
        }
        if (data.length > 4 && data[0] === 0xff && data[1] === 0xfe && data[2] === 0x00 && data[3] === 0x00) {
            return 'utf-32le';
        }
        return null;
    }
}
