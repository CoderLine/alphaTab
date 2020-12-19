export enum JsonValueType {
    String,
    Number,
    Boolean,
    Null,
    Object
}

export interface IJsonReader {
    readonly currentProperty: string;
    readonly currentValueType: JsonValueType;

    readPropertyName(): string;
    nextProperty(): boolean;

    readString(): string | null;
    readEnum<T>(enumType: any): T | null;
    readNumber(): number | null;
    readBoolean(): boolean | null;

    readStringArray(): string[] | null;
    readEnumArray<T>(enumType: any): T[] | null;
    readNumberArray(): number[] | null;
    readBooleanArray(): boolean[] | null;

    readUint8Array(): Uint8Array | null;
    readUint16Array(): Uint16Array | null;
    readUint32Array(): Uint32Array | null;
    readInt8Array(): Int8Array | null;
    readInt16Array(): Int16Array | null;
    readInt32Array(): Int32Array | null;
    readFloat32Array(): Float32Array | null;
    readFloat64Array(): Float64Array | null;
}