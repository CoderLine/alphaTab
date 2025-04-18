import type { IReadable } from '@src/io/IReadable';
import { TypeConversions } from '@src/io/TypeConversions';
import type { IWriteable } from '@src/io/IWriteable';

export class IOHelper {
    public static readInt32BE(input: IReadable): number {
        const ch1: number = input.readByte();
        const ch2: number = input.readByte();
        const ch3: number = input.readByte();
        const ch4: number = input.readByte();
        return (ch1 << 24) | (ch2 << 16) | (ch3 << 8) | ch4;
    }

    public static readFloat32BE(readable: IReadable): number {
        const bits = new Uint8Array(4);
        readable.read(bits, 0, bits.length);
        bits.reverse();
        return TypeConversions.bytesToFloat32LE(bits);
    }

    public static readFloat64BE(readable: IReadable): number {
        const bits = new Uint8Array(8);
        readable.read(bits, 0, bits.length);
        bits.reverse();
        return TypeConversions.bytesToFloat64LE(bits);
    }

    public static readInt32LE(input: IReadable): number {
        const ch1: number = input.readByte();
        const ch2: number = input.readByte();
        const ch3: number = input.readByte();
        const ch4: number = input.readByte();
        return (ch4 << 24) | (ch3 << 16) | (ch2 << 8) | ch1;
    }

    public static readInt64LE(input: IReadable): number {
        const b = new Uint8Array(8);
        input.read(b, 0, b.length);
        return TypeConversions.bytesToInt64LE(b);
    }

    public static readUInt32LE(input: IReadable): number {
        const ch1: number = input.readByte();
        const ch2: number = input.readByte();
        const ch3: number = input.readByte();
        const ch4: number = input.readByte();
        return (ch4 << 24) | (ch3 << 16) | (ch2 << 8) | ch1;
    }

    public static decodeUInt32LE(data: Uint8Array, index: number): number {
        const ch1: number = data[index];
        const ch2: number = data[index + 1];
        const ch3: number = data[index + 2];
        const ch4: number = data[index + 3];
        return (ch4 << 24) | (ch3 << 16) | (ch2 << 8) | ch1;
    }

    public static readUInt16LE(input: IReadable): number {
        const ch1: number = input.readByte();
        const ch2: number = input.readByte();
        return TypeConversions.int32ToUint16((ch2 << 8) | ch1);
    }

    public static readInt16LE(input: IReadable): number {
        const ch1: number = input.readByte();
        const ch2: number = input.readByte();
        return TypeConversions.int32ToInt16((ch2 << 8) | ch1);
    }

    public static readUInt32BE(input: IReadable): number {
        const ch1: number = input.readByte();
        const ch2: number = input.readByte();
        const ch3: number = input.readByte();
        const ch4: number = input.readByte();
        return TypeConversions.int32ToUint32((ch1 << 24) | (ch2 << 16) | (ch3 << 8) | ch4);
    }

    public static readUInt16BE(input: IReadable): number {
        const ch1: number = input.readByte();
        const ch2: number = input.readByte();
        return TypeConversions.int32ToInt16((ch1 << 8) | ch2);
    }

    public static readInt16BE(input: IReadable): number {
        const ch1: number = input.readByte();
        const ch2: number = input.readByte();
        return TypeConversions.int32ToInt16((ch1 << 8) | ch2);
    }

    public static readByteArray(input: IReadable, length: number): Uint8Array {
        const v: Uint8Array = new Uint8Array(length);
        input.read(v, 0, length);
        return v;
    }

    public static read8BitChars(input: IReadable, length: number): string {
        const b: Uint8Array = new Uint8Array(length);
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
            const c: number = input.readByte();
            if (c === 0 && z === -1) {
                z = i;
            }
            s += String.fromCharCode(c);
        }
        const t: string = s;
        if (z >= 0) {
            return t.substr(0, z);
        }
        return t;
    }

    public static readSInt8(input: IReadable): number {
        const v: number = input.readByte();
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
        const detectedEncoding: string | null = IOHelper.detectEncoding(data);
        if (detectedEncoding) {
            encoding = detectedEncoding;
        }
        if (!encoding) {
            encoding = 'utf-8';
        }
        const decoder: TextDecoder = new TextDecoder(encoding);
        return decoder.decode(data.buffer as ArrayBuffer);
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
        const decoder: TextEncoder = new TextEncoder();
        return decoder.encode(str);
    }

    public static writeInt32BE(o: IWriteable, v: number) {
        o.writeByte((v >> 24) & 0xff);
        o.writeByte((v >> 16) & 0xff);
        o.writeByte((v >> 8) & 0xff);
        o.writeByte((v >> 0) & 0xff);
    }

    public static writeInt32LE(o: IWriteable, v: number) {
        o.writeByte((v >> 0) & 0xff);
        o.writeByte((v >> 8) & 0xff);
        o.writeByte((v >> 16) & 0xff);
        o.writeByte((v >> 24) & 0xff);
    }

    public static writeUInt16LE(o: IWriteable, v: number) {
        o.writeByte((v >> 0) & 0xff);
        o.writeByte((v >> 8) & 0xff);
    }

    public static writeInt16LE(o: IWriteable, v: number) {
        o.writeByte((v >> 0) & 0xff);
        o.writeByte((v >> 8) & 0xff);
    }

    public static writeInt16BE(o: IWriteable, v: number) {
        o.writeByte((v >> 8) & 0xff);
        o.writeByte((v >> 0) & 0xff);
    }

    public static writeFloat32BE(o: IWriteable, v: number) {
        const b = TypeConversions.float32BEToBytes(v);
        o.write(b, 0, b.length);
    }
}
