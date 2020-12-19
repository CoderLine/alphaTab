export interface IJsonWriter {
    startObject(): void;
    endObject(): void;

    startArray(): void;
    endArray(): void;

    prop(name: any): void;

    string(value: string | null): void;
    number(value: number | null): void;
    boolean(value: boolean | null): void;
    enum<T>(value: T): void;
    null(): void;
    stringArray(value: string[] | null): void;
    numberArray(value: number[] | null): void;
    booleanArray(value: boolean[] | null): void;

    uint8Array(value: Uint8Array | null): void;
    uint16Array(value: Uint16Array | null): void;
    uint32Array(value: Uint32Array | null): void;
    int8Array(value: Int8Array | null): void;
    int16Array(value: Int16Array | null): void;
    int32Array(value: Int32Array | null): void;
    float32Array(value: Float32Array | null): void;
    float64Array(value: Float64Array | null): void;
}