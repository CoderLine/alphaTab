import { Score } from '@src/model/Score';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { IOHelper } from '@src/io/IOHelper';
import { GpBinaryHelpers } from '@src/importer/Gp3To5Importer';
import { BendPoint } from '@src/model/BendPoint';
import { Bounds } from '@src/rendering/utils/Bounds';
import { Color } from '@src/model/Color';

enum DataType {
    Boolean,
    Integer,
    Float,
    String,
    Point,
    Size,
    Rectangle,
    Color
}

/**
 * A BinaryStylesheet from Guitar Pro 6 and 7 files.
 * The BinaryStylesheet is a simple binary key-value store for additional settings
 * related to the display of the music sheet.
 *
 * File:
 *     int32 (big endian) | Number of KeyValuePairs
 *     KeyValuePair[]     | The raw records
 *
 * KeyValuePair:
 *     1 Byte  | length of the key
 *     n Bytes | key as utf8 encoded string
 *     1 Byte  | Data Type
 *     n Bytes | Value
 *
 * Values based on Data Type:
 *     0 = bool
 *         0===false
 *     1 = int32 (big endian)
 *     2 = float (big endian, IEEE)
 *     3 = string
 *       int16 (big endian) | length of string
 *       n bytes            | utf-8 encoded string
 *     4 = point
 *       int32 (big endian) | X-coordinate
 *       int32 (big endian) | Y-coordinate
 *     5 = size
 *       int32 (big endian) | Width
 *       int32 (big endian) | Height
 *     6 = rectangle
 *       int32 (big endian) | X-coordinate
 *       int32 (big endian) | Y-coordinate
 *       int32 (big endian) | Width
 *       int32 (big endian) | Height
 *     7 = color
 *       1 byte | Red
 *       1 byte | Green
 *       1 byte | Blue
 *       1 byte | Alpha
 */
export class BinaryStylesheet {
    public readonly raw: Map<string, unknown> = new Map();

    public constructor(data: Uint8Array) {
        // BinaryStylesheet apears to be big-endien
        let readable: ByteBuffer = ByteBuffer.fromBuffer(data);
        let entryCount: number = IOHelper.readInt32BE(readable);
        for (let i: number = 0; i < entryCount; i++) {
            let key: string = GpBinaryHelpers.gpReadString(readable, readable.readByte(), 'utf-8');
            let type: DataType = readable.readByte() as DataType;
            switch (type) {
                case DataType.Boolean:
                    let flag: boolean = readable.readByte() === 1;
                    this.addValue(key, flag);
                    break;
                case DataType.Integer:
                    let ivalue: number = IOHelper.readInt32BE(readable);
                    this.addValue(key, ivalue);
                    break;
                case DataType.Float:
                    let fvalue: number = GpBinaryHelpers.gpReadFloat(readable);
                    this.addValue(key, fvalue);
                    break;
                case DataType.String:
                    let s: string = GpBinaryHelpers.gpReadString(readable, IOHelper.readInt16BE(readable), 'utf-8');
                    this.addValue(key, s);
                    break;
                case DataType.Point:
                    let x: number = IOHelper.readInt32BE(readable);
                    let y: number = IOHelper.readInt32BE(readable);
                    this.addValue(key, new BendPoint(x, y));
                    break;
                case DataType.Size:
                    let width: number = IOHelper.readInt32BE(readable);
                    let height: number = IOHelper.readInt32BE(readable);
                    this.addValue(key, new BendPoint(width, height));
                    break;
                case DataType.Rectangle:
                    let rect = new Bounds();
                    rect.x = IOHelper.readInt32BE(readable);
                    rect.y = IOHelper.readInt32BE(readable);
                    rect.w = IOHelper.readInt32BE(readable);
                    rect.h = IOHelper.readInt32BE(readable);
                    this.addValue(key, rect);
                    break;
                case DataType.Color:
                    let color: Color = GpBinaryHelpers.gpReadColor(readable, true);
                    this.addValue(key, color);
                    break;
            }
        }
    }

    public apply(score: Score): void {
        for(const [key, value] of this.raw) {
            switch (key) {
                case 'StandardNotation/hideDynamics':
                    score.stylesheet.hideDynamics = value as boolean;
                    break;
            }
        }
    }

    public addValue(key: string, value: unknown): void {
        this.raw.set(key, value);
    }

    public static writeForScore(score: Score): Uint8Array {
        const writer = ByteBuffer.withCapacity(128);
        IOHelper.writeInt32BE(writer, 1); // entry count

        BinaryStylesheet.writeBooleanEntry(writer, 'StandardNotation/hideDynamics', score.stylesheet.hideDynamics);

        return writer.toArray();
    }

    private static writeBooleanEntry(writer: ByteBuffer, key: string, value: boolean) {
        GpBinaryHelpers.gpWriteString(writer, key);
        writer.writeByte(DataType.Boolean as number);
        writer.writeByte(value ? 1 : 0);
    }
}
