import { IReadable } from '@src/io/IReadable';
import { TypeConversions } from '@src/io/TypeConversions';
import { Environment } from '@src/Environment';
import { IWriteable } from './IWriteable';

export class IOHelper {
    public static readInt32BE(input: IReadable): number {
        let ch1: number = input.readByte();
        let ch2: number = input.readByte();
        let ch3: number = input.readByte();
        let ch4: number = input.readByte();
        return (ch1 << 24) | (ch2 << 16) | (ch3 << 8) | ch4;
    }

    public static readInt32LE(input: IReadable): number {
        let ch1: number = input.readByte();
        let ch2: number = input.readByte();
        let ch3: number = input.readByte();
        let ch4: number = input.readByte();
        return (ch4 << 24) | (ch3 << 16) | (ch2 << 8) | ch1;
    }

    public static readUInt32LE(input: IReadable): number {
        let ch1: number = input.readByte();
        let ch2: number = input.readByte();
        let ch3: number = input.readByte();
        let ch4: number = input.readByte();
        return (ch4 << 24) | (ch3 << 16) | (ch2 << 8) | ch1;
    }

    public static readUInt16LE(input: IReadable): number {
        let ch1: number = input.readByte();
        let ch2: number = input.readByte();
        return TypeConversions.int32ToUint16((ch2 << 8) | ch1);
    }

    public static readInt16LE(input: IReadable): number {
        let ch1: number = input.readByte();
        let ch2: number = input.readByte();
        return TypeConversions.int32ToInt16((ch2 << 8) | ch1);
    }

    public static readUInt32BE(input: IReadable): number {
        let ch1: number = input.readByte();
        let ch2: number = input.readByte();
        let ch3: number = input.readByte();
        let ch4: number = input.readByte();
        return TypeConversions.int32ToUint32((ch1 << 24) | (ch2 << 16) | (ch3 << 8) | ch4);
    }

    public static readUInt16BE(input: IReadable): number {
        let ch1: number = input.readByte();
        let ch2: number = input.readByte();
        return TypeConversions.int32ToInt16((ch1 << 8) | ch2);
    }

    public static readInt16BE(input: IReadable): number {
        let ch1: number = input.readByte();
        let ch2: number = input.readByte();
        return TypeConversions.int32ToInt16((ch1 << 8) | ch2);
    }

    public static readByteArray(input: IReadable, length: number): Uint8Array {
        let v: Uint8Array = new Uint8Array(length);
        input.read(v, 0, length);
        return v;
    }

    public static read8BitChars(input: IReadable, length: number): string {
        let b: Uint8Array = new Uint8Array(length);
        input.read(b, 0, b.length);
        return IOHelper.toString(b, 'utf-8');
    }

    public static read8BitString(input: IReadable): string {
        let s: string = '';
        let c: number = input.readByte();
        while (c !== 0) {
            s += String.fromCharCode(c);
            c = input.readByte();
        }
        return s;
    }

    public static read8BitStringLength(input: IReadable, length: number): string {
        let s: string = '';
        let z: number = -1;
        for (let i: number = 0; i < length; i++) {
            let c: number = input.readByte();
            if (c === 0 && z === -1) {
                z = i;
            }
            s += String.fromCharCode(c);
        }
        let t: string = s;
        if (z >= 0) {
            return t.substr(0, z);
        }
        return t;
    }

    public static readSInt8(input: IReadable): number {
        let v: number = input.readByte();
        return ((v & 255) >> 7) * -256 + (v & 255);
    }

    public static readInt24(input: Uint8Array, index: number): number {
        let i: number = input[index] | (input[index + 1] << 8) | (input[index + 2] << 16);
        if ((i & 0x800000) === 0x800000) {
            i = i | (0xff << 24);
        }
        return i;
    }

    public static readInt16(input: Uint8Array, index: number): number {
        return TypeConversions.int32ToInt16(input[index] | (input[index + 1] << 8));
    }

    public static toString(data: Uint8Array, encoding: string): string {
        if (Environment.supportsTextDecoder) {
            let detectedEncoding: string | null = IOHelper.detectEncoding(data);
            if (detectedEncoding) {
                encoding = detectedEncoding;
            }
            if (!encoding) {
                encoding = 'utf-8';
            }
            let decoder: TextDecoder = new TextDecoder(encoding);
            return decoder.decode(data.buffer);
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

    public static stringToBytes(str: string): Uint8Array {
        if (Environment.supportsTextDecoder) {
            let decoder: TextEncoder = new TextEncoder();
            return decoder.encode(str);
        } else {
            // manual UTF8 decoding for older browsers
            // https://developer.mozilla.org/de/docs/Web/API/TextEncoder
            const Len = str.length;
            let resPos = -1;
            const resArr = new Uint8Array(Len * 3);

            for (let point = 0, nextcode = 0, i = 0; i !== Len; ) {
                point = str.charCodeAt(i);
                i += 1;
                if (point >= 0xd800 && point <= 0xdbff) {
                    if (i === Len) {
                        resArr[(resPos += 1)] = 0xef /*0b11101111*/;
                        resArr[(resPos += 1)] = 0xbf /*0b10111111*/;
                        resArr[(resPos += 1)] = 0xbd /*0b10111101*/;
                        break;
                    }
                    // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                    nextcode = str.charCodeAt(i);
                    if (nextcode >= 0xdc00 && nextcode <= 0xdfff) {
                        point = (point - 0xd800) * 0x400 + nextcode - 0xdc00 + 0x10000;
                        i += 1;
                        if (point > 0xffff) {
                            resArr[(resPos += 1)] = (0x1e /*0b11110*/ << 3) | (point >>> 18);
                            resArr[(resPos += 1)] = (0x2 /*0b10*/ << 6) | ((point >>> 12) & 0x3f) /*0b00111111*/;
                            resArr[(resPos += 1)] = (0x2 /*0b10*/ << 6) | ((point >>> 6) & 0x3f) /*0b00111111*/;
                            resArr[(resPos += 1)] = (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
                            continue;
                        }
                    } else {
                        resArr[(resPos += 1)] = 0xef /*0b11101111*/;
                        resArr[(resPos += 1)] = 0xbf /*0b10111111*/;
                        resArr[(resPos += 1)] = 0xbd /*0b10111101*/;
                        continue;
                    }
                }
                if (point <= 0x007f) {
                    resArr[(resPos += 1)] = (0x0 /*0b0*/ << 7) | point;
                } else if (point <= 0x07ff) {
                    resArr[(resPos += 1)] = (0x6 /*0b110*/ << 5) | (point >>> 6);
                    resArr[(resPos += 1)] = (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
                } else {
                    resArr[(resPos += 1)] = (0xe /*0b1110*/ << 4) | (point >>> 12);
                    resArr[(resPos += 1)] = (0x2 /*0b10*/ << 6) | ((point >>> 6) & 0x3f) /*0b00111111*/;
                    resArr[(resPos += 1)] = (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
                }
            }
            return resArr.subarray(0, resPos + 1);
        }
    }

    public static writeInt32BE(o: IWriteable, v: number) {
        o.writeByte((v >> 24) & 0xFF);
        o.writeByte((v >> 16) & 0xFF);
        o.writeByte((v >> 8) & 0xFF);
        o.writeByte((v >> 0) & 0xFF);
    }

    public static writeInt32LE(o: IWriteable, v: number) {
        o.writeByte((v >> 0) & 0xFF);    
        o.writeByte((v >> 8) & 0xFF);
        o.writeByte((v >> 16) & 0xFF);
        o.writeByte((v >> 24) & 0xFF);
    }

    public static writeUInt16LE(o: IWriteable, v: number) {
        o.writeByte((v >> 0) & 0xFF);    
        o.writeByte((v >> 8) & 0xFF);
    }

    public static writeInt16LE(o: IWriteable, v: number) {
        o.writeByte((v >> 0) & 0xFF);
        o.writeByte((v >> 8) & 0xFF);
    }
}
