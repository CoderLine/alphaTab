import { Score } from '@src/model/Score';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { IOHelper } from '@src/io/IOHelper';
import { GpBinaryHelpers } from '@src/importer/Gp3To5Importer';
import { BendPoint } from '@src/model/BendPoint';
import { Bounds } from '@src/rendering/utils/Bounds';
import { Color } from '@src/model/Color';
import { BracketExtendMode, TrackNameMode, TrackNameOrientation, TrackNamePolicy } from '@src/model/RenderStylesheet';
import { IWriteable } from '@src/io/IWriteable';
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';

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
    public readonly _types: Map<string, DataType> = new Map();
    public readonly raw: Map<string, unknown> = new Map();

    public constructor(data?: Uint8Array) {
        if (data) {
            this.read(data);
        }
    }

    private read(data: Uint8Array) {
        // BinaryStylesheet apears to be big-endien
        let readable: ByteBuffer = ByteBuffer.fromBuffer(data);
        let entryCount: number = IOHelper.readInt32BE(readable);
        for (let i: number = 0; i < entryCount; i++) {
            let key: string = GpBinaryHelpers.gpReadString(readable, readable.readByte(), 'utf-8');
            let type: DataType = readable.readByte() as DataType;
            this._types.set(key, type);
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
                    let fvalue: number = IOHelper.readFloat32BE(readable);
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
        for (const [key, value] of this.raw) {
            switch (key) {
                case 'StandardNotation/hideDynamics':
                    score.stylesheet.hideDynamics = value as boolean;
                    break;
                case 'System/bracketExtendMode':
                    score.stylesheet.bracketExtendMode = value as number as BracketExtendMode;
                    break;
                case 'Global/useSystemSignSeparator':
                    score.stylesheet.useSystemSignSeparator = value as boolean;
                    break;
                case 'Global/DisplayTuning':
                    score.stylesheet.globalDisplayTuning = value as boolean;
                    break;
                case 'Global/DrawChords':
                    score.stylesheet.globalDisplayChordDiagramsOnTop = value as boolean;
                    break;
                case 'System/showTrackNameSingle':
                    if (!(value as boolean)) {
                        score.stylesheet.singleTrackTrackNamePolicy = TrackNamePolicy.Hidden;
                    }
                    break;
                case 'System/showTrackNameMulti':
                    if (!(value as boolean)) {
                        score.stylesheet.multiTrackTrackNamePolicy = TrackNamePolicy.Hidden;
                    }
                    break;
                case 'System/trackNameModeSingle':
                    if (score.stylesheet.singleTrackTrackNamePolicy !== TrackNamePolicy.Hidden) {
                        switch (value as number) {
                            case 0: // First System
                                score.stylesheet.singleTrackTrackNamePolicy = TrackNamePolicy.FirstSystem;
                                break;
                            case 1: // First System of Each Page
                                score.stylesheet.singleTrackTrackNamePolicy = TrackNamePolicy.FirstSystem;
                                break;
                            case 2: // All Systems
                                score.stylesheet.singleTrackTrackNamePolicy = TrackNamePolicy.AllSystems;
                                break;
                        }
                    }
                    break;
                case 'System/trackNameModeMulti':
                    if (score.stylesheet.multiTrackTrackNamePolicy !== TrackNamePolicy.Hidden) {
                        switch (value as number) {
                            case 0: // First System
                                score.stylesheet.multiTrackTrackNamePolicy = TrackNamePolicy.FirstSystem;
                                break;
                            case 1: // First System of Each Page
                                score.stylesheet.multiTrackTrackNamePolicy = TrackNamePolicy.FirstSystem;
                                break;
                            case 2: // All Systems
                                score.stylesheet.multiTrackTrackNamePolicy = TrackNamePolicy.AllSystems;
                                break;
                        }
                    }
                    break;
                case 'System/shortTrackNameOnFirstSystem':
                    if (value as boolean) {
                        score.stylesheet.firstSystemTrackNameMode = TrackNameMode.ShortName;
                    } else {
                        score.stylesheet.firstSystemTrackNameMode = TrackNameMode.FullName;
                    }
                    break;
                case 'System/shortTrackNameOnOtherSystems':
                    if (value as boolean) {
                        score.stylesheet.otherSystemsTrackNameMode = TrackNameMode.ShortName;
                    } else {
                        score.stylesheet.otherSystemsTrackNameMode = TrackNameMode.FullName;
                    }
                    break;
                case 'System/horizontalTrackNameOnFirstSystem':
                    if (value as boolean) {
                        score.stylesheet.firstSystemTrackNameOrientation = TrackNameOrientation.Horizontal;
                    } else {
                        score.stylesheet.firstSystemTrackNameOrientation = TrackNameOrientation.Vertical;
                    }
                    break;
                case 'System/horizontalTrackNameOnOtherSystems':
                    if (value as boolean) {
                        score.stylesheet.otherSystemsTrackNameOrientation = TrackNameOrientation.Horizontal;
                    } else {
                        score.stylesheet.otherSystemsTrackNameOrientation = TrackNameOrientation.Vertical;
                    }
                    break;
            }
        }
    }

    public addValue(key: string, value: unknown, type?: DataType): void {
        this.raw.set(key, value);
        if (type !== undefined) {
            this._types.set(key, type);
        }
    }

    public writeTo(writer: IWriteable) {
        IOHelper.writeInt32BE(writer, this.raw.size); // entry count

        for (const [k, v] of this.raw) {
            const dataType = this.getDataType(k, v);

            GpBinaryHelpers.gpWriteString(writer, k);
            writer.writeByte(dataType as number);

            switch (dataType) {
                case DataType.Boolean:
                    writer.writeByte((v as boolean) ? 1 : 0);
                    break;
                case DataType.Integer:
                    IOHelper.writeInt32BE(writer, v as number);
                    break;
                case DataType.Float:
                    IOHelper.writeFloat32BE(writer, v as number);
                    break;
                case DataType.String:
                    const encoded = IOHelper.stringToBytes(v as string);
                    IOHelper.writeInt16BE(writer, encoded.length);
                    writer.write(encoded, 0, encoded.length);
                    break;
                case DataType.Point:
                    IOHelper.writeInt32BE(writer, (v as BendPoint).offset);
                    IOHelper.writeInt32BE(writer, (v as BendPoint).value);
                    break;
                case DataType.Size:
                    IOHelper.writeInt32BE(writer, (v as BendPoint).offset);
                    IOHelper.writeInt32BE(writer, (v as BendPoint).value);
                    break;
                case DataType.Rectangle:
                    IOHelper.writeInt32BE(writer, (v as Bounds).x);
                    IOHelper.writeInt32BE(writer, (v as Bounds).y);
                    IOHelper.writeInt32BE(writer, (v as Bounds).w);
                    IOHelper.writeInt32BE(writer, (v as Bounds).h);
                    break;
                case DataType.Color:
                    writer.writeByte((v as Color).r);
                    writer.writeByte((v as Color).g);
                    writer.writeByte((v as Color).b);
                    writer.writeByte((v as Color).a);
                    break;
            }
        }
    }
    private getDataType(key: string, value: unknown): DataType {
        if (this._types.has(key)) {
            return this._types.get(key)!;
        }

        const type = typeof value;
        switch (typeof value) {
            case 'string':
                return DataType.String;
            case 'number':
                return (value as number) == ((value as number) | 0) ? DataType.Integer : DataType.Float;
            case 'object':
                if (value instanceof BendPoint) {
                    return DataType.Point;
                }
                if (value instanceof Bounds) {
                    return DataType.Rectangle;
                }
                if (value instanceof Color) {
                    return DataType.Color;
                }
                break;
        }

        throw new AlphaTabError(AlphaTabErrorType.General, `Unknown value type in BinaryStylesheet: ${type}`);
    }

    public static writeForScore(score: Score): Uint8Array {
        const binaryStylesheet = new BinaryStylesheet();
        binaryStylesheet.addValue('StandardNotation/hideDynamics', score.stylesheet.hideDynamics, DataType.Boolean);
        binaryStylesheet.addValue(
            'System/bracketExtendMode',
            score.stylesheet.bracketExtendMode as number,
            DataType.Integer
        );
        binaryStylesheet.addValue(
            'Global/useSystemSignSeparator',
            score.stylesheet.useSystemSignSeparator,
            DataType.Boolean
        );
        binaryStylesheet.addValue('Global/DisplayTuning', score.stylesheet.globalDisplayTuning, DataType.Boolean);
        binaryStylesheet.addValue(
            'Global/DrawChords',
            score.stylesheet.globalDisplayChordDiagramsOnTop,
            DataType.Boolean
        );

        switch (score.stylesheet.singleTrackTrackNamePolicy) {
            case TrackNamePolicy.Hidden:
                binaryStylesheet.addValue('System/showTrackNameSingle', false, DataType.Boolean);
                break;
            case TrackNamePolicy.FirstSystem:
                binaryStylesheet.addValue('System/trackNameModeSingle', 0, DataType.Integer);
                break;
            case TrackNamePolicy.AllSystems:
                binaryStylesheet.addValue('System/trackNameModeSingle', 2, DataType.Integer);
                break;
        }

        switch (score.stylesheet.multiTrackTrackNamePolicy) {
            case TrackNamePolicy.Hidden:
                binaryStylesheet.addValue('System/trackNameModeMulti', false, DataType.Boolean);
                break;
            case TrackNamePolicy.FirstSystem:
                binaryStylesheet.addValue('System/trackNameModeMulti', 0, DataType.Integer);
                break;
            case TrackNamePolicy.AllSystems:
                binaryStylesheet.addValue('System/trackNameModeMulti', 2, DataType.Integer);
                break;
        }

        switch (score.stylesheet.firstSystemTrackNameMode) {
            case TrackNameMode.FullName:
                binaryStylesheet.addValue('System/shortTrackNameOnFirstSystem', false, DataType.Boolean);
                break;
            case TrackNameMode.ShortName:
                binaryStylesheet.addValue('System/shortTrackNameOnFirstSystem', true, DataType.Boolean);
                break;
        }

        switch (score.stylesheet.otherSystemsTrackNameMode) {
            case TrackNameMode.FullName:
                binaryStylesheet.addValue('System/shortTrackNameOnOtherSystems', false, DataType.Boolean);
                break;
            case TrackNameMode.ShortName:
                binaryStylesheet.addValue('System/shortTrackNameOnOtherSystems', true, DataType.Boolean);
                break;
        }

        switch (score.stylesheet.firstSystemTrackNameOrientation) {
            case TrackNameOrientation.Horizontal:
                binaryStylesheet.addValue('System/horizontalTrackNameOnFirstSystem', true, DataType.Boolean);
                break;
            case TrackNameOrientation.Vertical:
                binaryStylesheet.addValue('System/horizontalTrackNameOnFirstSystem', false, DataType.Boolean);
                break;
        }

        switch (score.stylesheet.otherSystemsTrackNameOrientation) {
            case TrackNameOrientation.Horizontal:
                binaryStylesheet.addValue('System/horizontalTrackNameOnOtherSystems', true, DataType.Boolean);
                break;
            case TrackNameOrientation.Vertical:
                binaryStylesheet.addValue('System/horizontalTrackNameOnOtherSystems', false, DataType.Boolean);
                break;
        }

        const writer = ByteBuffer.withCapacity(128);
        binaryStylesheet.writeTo(writer);
        return writer.toArray();
    }
}
