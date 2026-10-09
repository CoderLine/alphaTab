import { describe, expect, it } from 'vitest';
import { FormatError } from '@coderline/alphatab/FormatError';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import { type IReadable, ThrowingReadable } from '@coderline/alphatab/io/IReadable';
import { Crc32 } from '@coderline/alphatab/zip/Crc32';
import { Inflater } from '@coderline/alphatab/zip/Inflater';

const words = ['<Note>', 'alphaTab', ' ', 'Beat', '</Note>', 'Rhythm', '\n', 'Voice', '="1"', 'Bar'];

/**
 * Deterministic text-like test data (the same generator produced the zlib reference streams).
 */
function text(size: number, seed: number): Uint8Array {
    const data = new Uint8Array(size);
    let x = seed;
    let pos = 0;
    while (pos < size) {
        x = (x * 75 + 74) % 65537;
        const word = words[x % words.length];
        for (let i = 0; i < word.length && pos < size; i++) {
            data[pos++] = word.charCodeAt(i);
        }
    }
    return data;
}

function expectBytes(actual: Uint8Array | null, expected: Uint8Array) {
    expect(actual).toBeTruthy();
    expect(actual!.length).toBe(expected.length);
    let mismatch = -1;
    for (let i = 0; i < expected.length; i++) {
        if (actual![i] !== expected[i]) {
            mismatch = i;
            break;
        }
    }
    expect(mismatch).toBe(-1);
}

function inflate(input: IReadable, maxSize: number = 100000000): Uint8Array | null {
    return new Inflater(input).inflate(0, maxSize);
}

describe('Crc32Tests', () => {
    function crc(data: Uint8Array): number {
        const c = new Crc32();
        c.update(data, 0, data.length);
        return c.value;
    }

    // check values of CRC-32/ISO-HDLC (as used by ZIP), as signed 32-bit integers
    it('empty', () => {
        expect(crc(new Uint8Array(0))).toBe(0);
    });

    it('check-value', () => {
        // 0xCBF43926
        expect(crc(IOHelper.stringToBytes('123456789'))).toBe(-873187034);
    });

    it('high-bytes', () => {
        const data = new Uint8Array(256);
        for (let i = 0; i < data.length; i++) {
            data[i] = 255 - i;
        }
        // 0xDA3BA10A
        expect(crc(data)).toBe(-633626358);
    });

    it('incremental', () => {
        const data = IOHelper.stringToBytes('123456789');
        const c = new Crc32();
        c.update(data, 0, 4);
        c.update(data, 4, 5);
        expect(c.value).toBe(-873187034);
        c.reset();
        c.update(data, 0, data.length);
        expect(c.value).toBe(-873187034);
    });
});

describe('InflaterTests', () => {
    // zlib level 0 strategy 0 of text(200, 1)
    const storedStream = new Uint8Array([1, 200, 0, 55, 255, 66, 97, 114, 66, 97, 114, 82, 104, 121, 116, 104, 109, 60, 47, 78, 111, 116, 101, 62, 66, 101, 97, 116, 66, 97, 114, 66, 101, 97, 116, 66, 97, 114, 32, 97, 108, 112, 104, 97, 84, 97, 98, 32, 10, 32, 10, 61, 34, 49, 34, 60, 47, 78, 111, 116, 101, 62, 60, 78, 111, 116, 101, 62, 32, 60, 47, 78, 111, 116, 101, 62, 82, 104, 121, 116, 104, 109, 61, 34, 49, 34, 66, 101, 97, 116, 82, 104, 121, 116, 104, 109, 82, 104, 121, 116, 104, 109, 60, 47, 78, 111, 116, 101, 62, 32, 60, 47, 78, 111, 116, 101, 62, 60, 47, 78, 111, 116, 101, 62, 66, 97, 114, 66, 101, 97, 116, 32, 86, 111, 105, 99, 101, 60, 78, 111, 116, 101, 62, 97, 108, 112, 104, 97, 84, 97, 98, 61, 34, 49, 34, 32, 61, 34, 49, 34, 10, 66, 101, 97, 116, 66, 97, 114, 32, 60, 78, 111, 116, 101, 62, 86, 111, 105, 99, 101, 60, 78, 111, 116, 101, 62, 97, 108, 112, 104, 97, 84, 97, 98, 97, 108, 112, 104, 97, 84, 97, 98, 66, 101, 97]);
    // zlib level 6 strategy 4 of text(400, 1)
    const fixedStream = new Uint8Array([115, 74, 44, 114, 74, 44, 10, 202, 168, 44, 201, 200, 181, 209, 247, 203, 47, 73, 181, 115, 74, 77, 44, 113, 74, 44, 130, 82, 10, 137, 57, 5, 25, 137, 33, 137, 73, 10, 92, 10, 92, 182, 74, 134, 74, 80, 85, 54, 96, 82, 1, 202, 131, 24, 0, 146, 6, 105, 131, 240, 80, 12, 133, 41, 132, 217, 1, 49, 95, 33, 44, 63, 51, 57, 21, 98, 20, 204, 30, 144, 33, 10, 32, 130, 11, 230, 2, 136, 60, 22, 165, 48, 26, 108, 20, 212, 100, 116, 57, 144, 73, 96, 173, 92, 78, 137, 69, 54, 72, 78, 135, 115, 193, 174, 134, 113, 20, 16, 62, 129, 10, 32, 217, 11, 243, 51, 178, 79, 192, 210, 48, 203, 80, 56, 96, 63, 216, 192, 131, 20, 170, 158, 75, 65, 1, 69, 149, 2, 216, 151, 32, 121, 176, 52, 0]);
    // zlib level 9 strategy 0 of text(3000, 1)
    const dynamicStream = new Uint8Array([117, 86, 49, 110, 28, 49, 12, 236, 249, 10, 194, 31, 56, 164, 87, 82, 220, 3, 92, 24, 129, 251, 117, 112, 192, 5, 136, 97, 195, 184, 38, 191, 207, 138, 34, 197, 25, 74, 41, 110, 111, 181, 146, 200, 33, 103, 72, 233, 122, 124, 93, 143, 175, 151, 251, 223, 199, 253, 189, 93, 158, 63, 30, 183, 31, 215, 219, 241, 56, 191, 249, 159, 30, 127, 62, 239, 199, 207, 227, 77, 69, 229, 251, 211, 183, 39, 95, 213, 236, 169, 62, 26, 6, 250, 116, 223, 54, 70, 100, 52, 22, 134, 143, 97, 95, 95, 63, 126, 255, 186, 13, 83, 225, 167, 27, 209, 254, 144, 64, 48, 230, 55, 75, 227, 223, 76, 185, 229, 58, 215, 45, 217, 86, 57, 77, 53, 128, 62, 135, 134, 58, 6, 154, 145, 248, 7, 240, 27, 49, 99, 36, 54, 29, 206, 104, 96, 49, 180, 153, 82, 95, 47, 170, 180, 74, 45, 202, 62, 15, 238, 236, 113, 98, 202, 220, 83, 74, 33, 229, 19, 56, 65, 16, 69, 46, 217, 129, 193, 138, 213, 68, 230, 76, 85, 62, 164, 208, 54, 24, 177, 41, 93, 50, 60, 233, 56, 57, 11, 41, 168, 164, 107, 6, 202, 2, 114, 18, 144, 107, 237, 177, 145, 251, 134, 218, 233, 191, 177, 110, 205, 202, 120, 106, 64, 53, 221, 2, 29, 186, 77, 143, 243, 227, 169, 214, 224, 64, 196, 66, 72, 69, 48, 38, 147, 107, 215, 86, 46, 64, 60, 62, 129, 92, 130, 160, 224, 51, 110, 45, 236, 0, 29, 146, 239, 89, 73, 2, 102, 136, 136, 141, 190, 135, 131, 97, 102, 188, 215, 87, 99, 109, 181, 128, 196, 64, 27, 112, 166, 206, 61, 195, 102, 100, 58, 185, 243, 116, 146, 123, 193, 228, 165, 64, 166, 5, 138, 166, 173, 117, 6, 1, 155, 9, 114, 117, 18, 166, 209, 95, 212, 177, 248, 24, 131, 152, 206, 122, 6, 21, 195, 105, 165, 165, 133, 150, 155, 11, 164, 235, 116, 233, 152, 84, 183, 185, 87, 150, 42, 161, 38, 146, 102, 163, 104, 6, 100, 143, 4, 240, 202, 212, 106, 136, 58, 94, 166, 176, 84, 35, 215, 151, 98, 124, 46, 65, 105, 98, 152, 202, 181, 207, 163, 168, 12, 172, 45, 71, 34, 165, 235, 178, 187, 138, 176, 113, 182, 88, 39, 131, 165, 25, 166, 98, 115, 159, 91, 144, 166, 158, 49, 129, 253, 93, 131, 179, 155, 130, 170, 130, 190, 255, 86, 149, 165, 189, 246, 125, 176, 138, 138, 76, 114, 136, 93, 156, 142, 168, 185, 150, 39, 100, 208, 46, 180, 29, 40, 192, 181, 137, 232, 121, 246, 114, 1, 85, 191, 88, 146, 1, 185, 86, 140, 83, 198, 176, 98, 49, 38, 40, 254, 37, 38, 50, 85, 92, 152, 151, 232, 166, 120, 116, 82, 147, 78, 110, 91, 73, 122, 9, 132, 14, 88, 4, 19, 0, 43, 63, 84, 128, 212, 16, 59, 251, 171, 206, 41, 150, 51, 161, 187, 72, 138, 152, 77, 96, 53, 139, 43, 69, 217, 135, 137, 75, 118, 155, 61, 3, 174, 74, 172, 4, 19, 148, 59, 84, 77, 172, 92, 66, 151, 60, 197, 167, 120, 119, 167, 36, 53, 158, 86, 238, 94, 124, 158, 18, 79, 0, 24, 241, 178, 106, 176, 34, 242, 30, 146, 249, 223, 8, 28, 168, 157, 161, 69, 151, 219, 221, 49, 240, 20, 86, 199, 21, 216, 208, 125, 58, 22, 252, 12, 211, 177, 19, 74, 172, 52, 202, 173, 74, 33, 177, 51, 217, 188, 109, 87, 224, 118, 19, 29, 161, 150, 184, 116, 105, 168, 123, 103, 203, 117, 124, 142, 97, 83, 251, 7]);
    // zlib level 6 strategy 3 of text(400, 1)
    const rleStream = new Uint8Array([5, 193, 49, 10, 133, 48, 16, 5, 192, 222, 83, 132, 92, 32, 216, 175, 91, 228, 0, 91, 136, 216, 63, 229, 193, 10, 145, 13, 178, 205, 191, 253, 159, 233, 248, 58, 190, 221, 127, 233, 175, 52, 139, 164, 118, 34, 59, 190, 78, 100, 199, 87, 48, 166, 227, 192, 85, 150, 178, 108, 117, 173, 210, 44, 146, 42, 22, 73, 45, 210, 44, 146, 186, 251, 47, 253, 221, 234, 90, 59, 145, 187, 255, 210, 223, 221, 127, 233, 175, 52, 139, 164, 22, 105, 22, 73, 149, 102, 145, 212, 142, 175, 19, 89, 206, 120, 110, 138, 69, 82, 49, 166, 227, 192, 181, 213, 181, 150, 173, 174, 117, 233, 68, 118, 124, 69, 44, 146, 122, 198, 115, 83, 44, 146, 138, 49, 29, 7, 46, 140, 233, 56, 112, 117, 34, 139, 52, 139, 164, 98, 76, 199, 129, 11, 99, 58, 14, 92, 91, 93, 235, 25, 207, 205, 165, 227, 19, 139, 164, 138, 69, 82, 59, 62, 177, 72, 234, 86, 215, 218, 241, 137, 69, 82, 203, 238, 191, 244, 119, 171, 107, 21, 139, 164, 150, 51, 158, 155, 98, 145, 84, 177, 72, 106, 17, 139, 164, 74, 179, 72, 234, 25, 207, 77, 140, 233, 56, 112, 157, 241, 220, 196, 152, 142, 3, 215, 86, 215, 186, 136, 69, 82, 59, 145, 210, 44, 146, 186, 148, 114, 198, 115, 19, 99, 58, 14, 92, 165, 19, 217, 137, 20, 139, 164, 254, 1]);
    // zlib level 6 strategy 2 of text(400, 1)
    const huffmanOnlyStream = new Uint8Array([5, 193, 49, 10, 133, 48, 16, 5, 192, 222, 83, 132, 92, 32, 216, 175, 91, 228, 0, 91, 136, 216, 63, 229, 193, 10, 145, 13, 178, 205, 191, 253, 159, 233, 248, 58, 190, 221, 127, 233, 175, 52, 139, 164, 118, 34, 59, 190, 78, 100, 199, 87, 48, 166, 227, 192, 85, 150, 178, 108, 117, 173, 210, 44, 146, 42, 22, 73, 45, 210, 44, 146, 186, 251, 47, 253, 221, 234, 90, 59, 145, 187, 255, 210, 223, 221, 127, 233, 175, 52, 139, 164, 22, 105, 22, 73, 149, 102, 145, 212, 142, 175, 19, 89, 206, 120, 110, 138, 69, 82, 49, 166, 227, 192, 181, 213, 181, 150, 173, 174, 117, 233, 68, 118, 124, 69, 44, 146, 122, 198, 115, 83, 44, 146, 138, 49, 29, 7, 46, 140, 233, 56, 112, 117, 34, 139, 52, 139, 164, 98, 76, 199, 129, 11, 99, 58, 14, 92, 91, 93, 235, 25, 207, 205, 165, 227, 19, 139, 164, 138, 69, 82, 59, 62, 177, 72, 234, 86, 215, 218, 241, 137, 69, 82, 203, 238, 191, 244, 119, 171, 107, 21, 139, 164, 150, 51, 158, 155, 98, 145, 84, 177, 72, 106, 17, 139, 164, 74, 179, 72, 234, 25, 207, 77, 140, 233, 56, 112, 157, 241, 220, 196, 152, 142, 3, 215, 86, 215, 186, 136, 69, 82, 59, 145, 210, 44, 146, 186, 148, 114, 198, 115, 19, 99, 58, 14, 92, 165, 19, 217, 137, 20, 139, 164, 254, 1]);
    // zlib with a sync flush after 200 bytes of text(400, 1)
    const syncFlushStream = new Uint8Array([114, 74, 44, 114, 74, 44, 10, 202, 168, 44, 201, 200, 181, 209, 247, 203, 47, 73, 181, 115, 74, 77, 44, 113, 74, 44, 130, 82, 10, 137, 57, 5, 25, 137, 33, 137, 73, 10, 92, 10, 92, 182, 74, 134, 74, 80, 85, 54, 96, 82, 1, 202, 131, 24, 0, 146, 6, 105, 131, 240, 80, 12, 133, 41, 132, 217, 1, 49, 95, 33, 44, 63, 51, 57, 21, 98, 20, 204, 30, 144, 33, 10, 32, 130, 11, 230, 2, 136, 60, 22, 165, 48, 218, 41, 53, 17, 0, 0, 0, 255, 255, 43, 129, 89, 128, 46, 7, 50, 9, 172, 149, 203, 41, 177, 200, 6, 201, 233, 112, 46, 216, 213, 48, 142, 2, 194, 39, 80, 1, 36, 123, 97, 126, 70, 246, 9, 88, 26, 102, 25, 10, 7, 236, 7, 27, 120, 144, 66, 213, 115, 41, 40, 160, 168, 82, 0, 251, 18, 36, 15, 150, 6, 0]);
    // dynamicStream block with a single distance code of length 1, decodes to b'abaabaaba'
    const singleDistanceCodeStream = new Uint8Array([13, 194, 1, 9, 0, 0, 0, 128, 160, 173, 245, 127, 68, 129, 200, 22]);
    // dynamicStream block without distance codes and max code length 2, decodes to b'xyyx'
    const noDistanceCodesStream = new Uint8Array([5, 192, 1, 9, 0, 0, 0, 128, 160, 219, 245, 94, 250, 0]);
    // dynamicStream block whose code length repeat crosses into the distance code lengths, decodes to b'pqpqqqqpqpqq'
    const repeatAcrossBoundaryStream = new Uint8Array([29, 134, 183, 9, 0, 0, 0, 131, 94, 54, 255, 47, 166, 163, 132, 52, 12, 2]);
    const invalidStreams: [string, Uint8Array][] = [
        ['blockType3', new Uint8Array([7, 0])],
        ['storedLengthMismatch', new Uint8Array([1, 5, 0, 0, 0, 1, 2, 3, 4, 5])],
        ['distanceTooFar', new Uint8Array([3, 2, 0])],
        ['invalidLengthSymbol', new Uint8Array([75, 28, 3, 0])],
        ['invalidDistanceSymbol', new Uint8Array([75, 4, 62, 0])],
        ['oversubscribedCodeLengthCode', new Uint8Array([5, 224, 147, 36, 73, 146, 36, 73, 146, 0, 0, 0])],
        ['tooManyLiteralCodes', new Uint8Array([245, 0, 0, 0, 0])],
        ['repeatWithoutPrevious', new Uint8Array([5, 0, 2, 36, 0, 0])],
        ['missingEndOfBlock', new Uint8Array([5, 192, 129, 0, 0, 0, 0, 0, 144, 86, 254, 43, 0, 0, 0])],
        ['incompleteLiteralCode', new Uint8Array([5, 128, 1, 5, 0, 0, 0, 128, 182, 246, 255, 68, 16])],
        ['truncated', new Uint8Array([115, 74, 44, 114, 74, 44, 10, 202, 168, 44, 201, 200, 181, 209, 247, 203, 47, 73, 181, 115, 74, 77, 44, 113, 74, 44, 130, 82, 10, 137, 57, 5, 25, 137, 33, 137, 73, 10, 92, 10, 92, 182, 74, 134, 74, 80, 85, 54, 96, 82, 1, 202, 131, 24, 0, 146, 6, 105, 131, 240, 80, 12, 133, 41, 132, 217, 1, 49, 95, 33, 44, 63, 51, 57, 21, 98, 20, 204, 30, 144, 33, 10, 32, 130, 11, 230, 2, 136, 60, 22, 165, 48, 26, 108, 20, 212, 100, 116, 57, 144, 73, 96, 173, 92, 78, 137, 69, 54, 72, 78, 135, 115, 193, 174, 134, 113, 20, 16, 62, 129, 10, 32, 217, 11, 243, 51, 178, 79, 192, 210, 48, 203, 80, 56, 96, 63, 216, 192, 131, 20, 170, 158, 75, 65, 1, 69, 149, 2, 216, 151, 32, 121])],
    ];

    it('zlib-streams', () => {
        expectBytes(inflate(ByteBuffer.fromBuffer(storedStream)), text(200, 1));
        expectBytes(inflate(ByteBuffer.fromBuffer(fixedStream)), text(400, 1));
        expectBytes(inflate(ByteBuffer.fromBuffer(dynamicStream)), text(3000, 1));
        expectBytes(inflate(ByteBuffer.fromBuffer(rleStream)), text(400, 1));
        expectBytes(inflate(ByteBuffer.fromBuffer(huffmanOnlyStream)), text(400, 1));
    });

    it('sync-flush', () => {
        expectBytes(inflate(ByteBuffer.fromBuffer(syncFlushStream)), text(400, 1));
    });

    it('single-distance-code', () => {
        expectBytes(inflate(ByteBuffer.fromBuffer(singleDistanceCodeStream)), IOHelper.stringToBytes('abaabaaba'));
    });

    it('no-distance-codes', () => {
        expectBytes(inflate(ByteBuffer.fromBuffer(noDistanceCodesStream)), IOHelper.stringToBytes('xyyx'));
    });

    it('repeat-across-boundary', () => {
        expectBytes(inflate(ByteBuffer.fromBuffer(repeatAcrossBoundaryStream)), IOHelper.stringToBytes('pqpqqqqpqpqq'));
    });

    it('size-hint', () => {
        const expected = text(3000, 1);
        // exact, too small and too large hints all give the same data
        expectBytes(new Inflater(ByteBuffer.fromBuffer(dynamicStream)).inflate(3000, 100000), expected);
        expectBytes(new Inflater(ByteBuffer.fromBuffer(dynamicStream)).inflate(10, 100000), expected);
        expectBytes(new Inflater(ByteBuffer.fromBuffer(dynamicStream)).inflate(5000, 100000), expected);
    });

    it('max-size', () => {
        expect(inflate(ByteBuffer.fromBuffer(dynamicStream), 2999)).toBeNull();
        expect(inflate(ByteBuffer.fromBuffer(storedStream), 199)).toBeNull();
        expectBytes(inflate(ByteBuffer.fromBuffer(dynamicStream), 3000), text(3000, 1));
    });

    it('stops-at-stream-end', () => {
        for (const stream of [storedStream, fixedStream, dynamicStream, syncFlushStream, singleDistanceCodeStream]) {
            // the inflater must not consume any of the bytes following the stream
            const data = new Uint8Array(stream.length + 3);
            data.set(stream, 0);
            data[stream.length] = 0xaa;
            data[stream.length + 1] = 0xbb;
            data[stream.length + 2] = 0xcc;

            const buffer = ByteBuffer.fromBuffer(data);
            expect(inflate(buffer)).toBeTruthy();
            expect(buffer.position).toBe(stream.length);

            // also when the stream ends with the data
            const throwing = new ThrowingReadable(ByteBuffer.fromBuffer(stream));
            expect(inflate(throwing)).toBeTruthy();
            expect(throwing.position).toBe(stream.length);
        }
    });

    it('reuse', () => {
        const data = new Uint8Array(fixedStream.length + dynamicStream.length + fixedStream.length);
        data.set(fixedStream, 0);
        data.set(dynamicStream, fixedStream.length);
        data.set(fixedStream, fixedStream.length + dynamicStream.length);
        const inflater = new Inflater(ByteBuffer.fromBuffer(data));
        expectBytes(inflater.inflate(0, 100000), text(400, 1));
        expectBytes(inflater.inflate(0, 100000), text(3000, 1));
        expectBytes(inflater.inflate(0, 100000), text(400, 1));
    });

    it('invalid-data', () => {
        for (const invalid of invalidStreams) {
            const stream = invalid[1];
            expect(() => {
                inflate(ByteBuffer.fromBuffer(stream));
            }, invalid[0]).toThrow(FormatError);
        }
    });
});

