import { type HeaderFooterStyle, type Score, ScoreSubElement } from '@src/model/Score';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { IOHelper } from '@src/io/IOHelper';
import { GpBinaryHelpers } from '@src/importer/Gp3To5Importer';
import { BendPoint } from '@src/model/BendPoint';
import { Bounds } from '@src/rendering/utils/Bounds';
import { Color } from '@src/model/Color';
import {
    type BracketExtendMode,
    TrackNameMode,
    TrackNameOrientation,
    TrackNamePolicy
} from '@src/model/RenderStylesheet';
import type { IWriteable } from '@src/io/IWriteable';
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { ModelUtils } from '@src/model/ModelUtils';
import { TextAlign } from '@src/platform/ICanvas';

enum DataType {
    Boolean = 0,
    Integer = 1,
    Float = 2,
    String = 3,
    Point = 4,
    Size = 5,
    Rectangle = 6,
    Color = 7
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
        const readable: ByteBuffer = ByteBuffer.fromBuffer(data);
        const entryCount: number = IOHelper.readInt32BE(readable);
        for (let i: number = 0; i < entryCount; i++) {
            const key: string = GpBinaryHelpers.gpReadString(readable, readable.readByte(), 'utf-8');
            const type: DataType = readable.readByte() as DataType;
            this._types.set(key, type);
            switch (type) {
                case DataType.Boolean:
                    const flag: boolean = readable.readByte() === 1;
                    this.addValue(key, flag);
                    break;
                case DataType.Integer:
                    const ivalue: number = IOHelper.readInt32BE(readable);
                    this.addValue(key, ivalue);
                    break;
                case DataType.Float:
                    const fvalue: number = IOHelper.readFloat32BE(readable);
                    this.addValue(key, fvalue);
                    break;
                case DataType.String:
                    const s: string = GpBinaryHelpers.gpReadString(readable, IOHelper.readInt16BE(readable), 'utf-8');
                    this.addValue(key, s);
                    break;
                case DataType.Point:
                    const x: number = IOHelper.readInt32BE(readable);
                    const y: number = IOHelper.readInt32BE(readable);
                    this.addValue(key, new BendPoint(x, y));
                    break;
                case DataType.Size:
                    const width: number = IOHelper.readInt32BE(readable);
                    const height: number = IOHelper.readInt32BE(readable);
                    this.addValue(key, new BendPoint(width, height));
                    break;
                case DataType.Rectangle:
                    const rect = new Bounds();
                    rect.x = IOHelper.readInt32BE(readable);
                    rect.y = IOHelper.readInt32BE(readable);
                    rect.w = IOHelper.readInt32BE(readable);
                    rect.h = IOHelper.readInt32BE(readable);
                    this.addValue(key, rect);
                    break;
                case DataType.Color:
                    const color: Color = GpBinaryHelpers.gpReadColor(readable, true);
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
                case 'Header/Title':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Title).template = value as string;
                    break;
                case 'Header/TitleAlignment':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Title).textAlign = this.toTextAlign(
                        value as number
                    );
                    break;
                case 'Header/drawTitle':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Title).isVisible = value as boolean;
                    break;

                case 'Header/Subtitle':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.SubTitle).template = value as string;
                    break;
                case 'Header/SubtitleAlignment':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.SubTitle).textAlign =
                        this.toTextAlign(value as number);
                    break;
                case 'Header/drawSubtitle':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.SubTitle).isVisible =
                        value as boolean;
                    break;

                case 'Header/Artist':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Artist).template = value as string;
                    break;
                case 'Header/ArtistAlignment':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Artist).textAlign = this.toTextAlign(
                        value as number
                    );
                    break;
                case 'Header/drawArtist':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Artist).isVisible = value as boolean;
                    break;

                case 'Header/Album':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Album).template = value as string;
                    break;
                case 'Header/AlbumAlignment':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Album).textAlign = this.toTextAlign(
                        value as number
                    );
                    break;
                case 'Header/drawAlbum':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Album).isVisible = value as boolean;
                    break;

                case 'Header/Words':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Words).template = value as string;
                    break;
                case 'Header/WordsAlignment':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Words).textAlign = this.toTextAlign(
                        value as number
                    );
                    break;
                case 'Header/drawWords':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Words).isVisible = value as boolean;
                    break;

                case 'Header/Music':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Music).template = value as string;
                    break;
                case 'Header/MusicAlignment':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Music).textAlign = this.toTextAlign(
                        value as number
                    );
                    break;
                case 'Header/drawMusic':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Music).isVisible = value as boolean;
                    break;

                case 'Header/WordsAndMusic':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.WordsAndMusic).template =
                        value as string;
                    break;
                case 'Header/WordsAndMusicAlignment':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.WordsAndMusic).textAlign =
                        this.toTextAlign(value as number);
                    break;
                case 'Header/drawWordsAndMusic':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.WordsAndMusic).isVisible =
                        value as boolean;
                    break;

                case 'Header/Tabber':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Transcriber).template =
                        value as string;
                    break;
                case 'Header/TabberAlignment':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Transcriber).textAlign =
                        this.toTextAlign(value as number);
                    break;
                case 'Header/drawTabber':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Transcriber).isVisible =
                        value as boolean;
                    break;

                case 'Footer/Copyright':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Copyright).template =
                        value as string;
                    break;
                case 'Footer/CopyrightAlignment':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Copyright).textAlign =
                        this.toTextAlign(value as number);
                    break;
                case 'Footer/drawCopyright':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.Copyright).isVisible =
                        value as boolean;
                    break;

                case 'Footer/Copyright2':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.CopyrightSecondLine).template =
                        value as string;
                    break;
                case 'Footer/Copyright2Alignment':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.CopyrightSecondLine).textAlign =
                        this.toTextAlign(value as number);
                    break;
                case 'Footer/drawCopyright2':
                    ModelUtils.getOrCreateHeaderFooterStyle(score, ScoreSubElement.CopyrightSecondLine).isVisible =
                        value as boolean;
                    break;
            }
        }
    }
    private toTextAlign(value: number): TextAlign {
        switch (value) {
            case 0:
                return TextAlign.Left;
            case 1:
                return TextAlign.Center;
            case 2:
                return TextAlign.Right;
        }
        return TextAlign.Left;
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
                const withoutFraction: number = (value as number) | 0;
                return (value as number) === withoutFraction ? DataType.Integer : DataType.Float;
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
                binaryStylesheet.addValue('System/showTrackNameMulti', false, DataType.Boolean);
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

        const scoreStyle = score.style;
        if (scoreStyle) {
            for (const [k, v] of scoreStyle.headerAndFooter) {
                switch (k) {
                    case ScoreSubElement.Title:
                        BinaryStylesheet.addHeaderAndFooter(binaryStylesheet, v, 'Header/', 'Title');
                        break;
                    case ScoreSubElement.SubTitle:
                        BinaryStylesheet.addHeaderAndFooter(binaryStylesheet, v, 'Header/', 'Subtitle');
                        break;
                    case ScoreSubElement.Artist:
                        BinaryStylesheet.addHeaderAndFooter(binaryStylesheet, v, 'Header/', 'Artist');
                        break;
                    case ScoreSubElement.Album:
                        BinaryStylesheet.addHeaderAndFooter(binaryStylesheet, v, 'Header/', 'Album');
                        break;
                    case ScoreSubElement.Words:
                        BinaryStylesheet.addHeaderAndFooter(binaryStylesheet, v, 'Header/', 'Words');
                        break;
                    case ScoreSubElement.Music:
                        BinaryStylesheet.addHeaderAndFooter(binaryStylesheet, v, 'Header/', 'Music');
                        break;
                    case ScoreSubElement.WordsAndMusic:
                        BinaryStylesheet.addHeaderAndFooter(binaryStylesheet, v, 'Header/', 'WordsAndMusic');
                        break;
                    case ScoreSubElement.Transcriber:
                        BinaryStylesheet.addHeaderAndFooter(binaryStylesheet, v, 'Header/', 'Tabber');
                        break;
                    case ScoreSubElement.Copyright:
                        BinaryStylesheet.addHeaderAndFooter(binaryStylesheet, v, 'Footer/', 'Copyright');
                        break;
                    case ScoreSubElement.CopyrightSecondLine:
                        BinaryStylesheet.addHeaderAndFooter(binaryStylesheet, v, 'Footer/', 'Copyright2');
                        break;
                }
            }
        }

        const writer = ByteBuffer.withCapacity(128);
        binaryStylesheet.writeTo(writer);
        return writer.toArray();
    }

    private static addHeaderAndFooter(
        binaryStylesheet: BinaryStylesheet,
        style: HeaderFooterStyle,
        prefix: string,
        name: string
    ) {
        binaryStylesheet.addValue(`${prefix}${name}`, style.template!, DataType.String);

        binaryStylesheet.addValue(`${prefix}${name}Alignment`, style.textAlign as number, DataType.Integer);

        if (style.isVisible !== undefined) {
            binaryStylesheet.addValue(`${prefix}draw${name}`, style.isVisible! as boolean, DataType.Boolean);
        }
    }
}
