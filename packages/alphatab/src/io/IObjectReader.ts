import type { RecordFields } from '@coderline/alphatab/io/RecordFields';

/**
 * A forward-only reader for the JSON-like object model of the generated serializers, positioned on one value.
 * Every read and {@link skip} consumes the current value.
 * @internal
 */
export interface IObjectReader {
    /**
     * Whether the current value is null or undefined. Does not consume the value.
     */
    isNullish(): boolean;
    readNumber(): number;
    readBoolean(): boolean;
    readString(): string;
    /**
     * Reads the current value with its natural shape: primitives, arrays of values, records and maps as
     * `Map<string, unknown>` trees (or plain objects, depending on the source).
     */
    readValue(): unknown;
    /**
     * Reads a record or map by calling the handler for every entry with the reader positioned on the value.
     * Values the handler does not consume are skipped. Null and undefined are consumed without calls.
     * @param handler Receives the key and the reader, returns whether it consumed the value.
     */
    readObject(handler: (name: string, r: IObjectReader) => boolean): void;
    /**
     * Reads a record like {@link readObject}, passing the field id of every entry that is one of the given fields:
     * entries written with {@link IObjectWriter.field}, or keys of the fields.
     * @param fields The fields whose keys are matched, or null to pass every key-only entry with id -1.
     * @param handler Receives the field id (or -1) and the key (empty for entries written as id only); returns
     * whether it consumed the value.
     */
    readRecord(fields: RecordFields | null, handler: (id: number, name: string, r: IObjectReader) => boolean): void;
    /**
     * Reads an array by calling the handler for every element with the reader positioned on the element.
     */
    readArray(handler: (r: IObjectReader) => void): void;
    skip(): void;
}
