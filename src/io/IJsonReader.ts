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

    prop(): string;
    enumProp<T>(enumType: any): T;
    numberProp(): number;

    nextProp(): boolean;
    nextItem(): boolean;

    string(): string | null;
    enum<T>(enumType: any): T | null;
    number(): number | null;
    boolean(): boolean | null;

    stringArray(): string[] | null;
    enumArray<T>(enumType: any): T[] | null;
    numberArray(): number[] | null;
    booleanArray(): boolean[] | null;

    uint8Array(): Uint8Array | null;
    uint16Array(): Uint16Array | null;
    uint32Array(): Uint32Array | null;
    int8Array(): Int8Array | null;
    int16Array(): Int16Array | null;
    int32Array(): Int32Array | null;
    float32Array(): Float32Array | null;
    float64Array(): Float64Array | null;
}