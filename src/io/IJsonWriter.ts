export interface IJsonWriter {
    writeStartObject(): void;
    writeEndObject(): void;

    writeStartArray(): void;
    writeEndArray(): void;

    writePropertyName(name: any): void;

    writeString(value: string | null): void;
    writeNumber(value: number | null): void;
    writeBoolean(value: boolean | null): void;
    writeEnum<T>(value: T): void;
    writeNull(): void;
    writeStringArray(value: string[] | null): void;
    writeNumberArray(value: number[] | null): void;
    writeBooleanArray(value: boolean[] | null): void;

    writeUint8Array(value: Uint8Array | null): void;
    writeUint16Array(value: Uint16Array | null): void;
    writeUint32Array(value: Uint32Array | null): void;
    writeInt8Array(value: Int8Array | null): void;
    writeInt16Array(value: Int16Array | null): void;
    writeInt32Array(value: Int32Array | null): void;
    writeFloat32Array(value: Float32Array | null): void;
    writeFloat64Array(value: Float64Array | null): void;
}