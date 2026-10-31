import type { RecordFields } from '@coderline/alphatab/io/RecordFields';

/**
 * A streaming writer for the JSON-like object model of the generated serializers: records and maps (keyed
 * containers), arrays, numbers, booleans, strings, null and undefined.
 * Inside a record or map every value is preceded by exactly one {@link field} or {@link prop} call, array
 * elements are not; the `...Field` methods combine {@link field} with the value call and write the same output.
 * Containers nest strictly.
 * @internal
 */
export interface IObjectWriter {
    /**
     * Starts a record with static keys (a serialized class).
     * @param fields The generated fields of the record's class, which {@link field} refers to.
     */
    startObject(fields: RecordFields): void;
    endObject(): void;
    /**
     * Starts a map with dynamic keys (a serialized `Map` property).
     */
    startMap(): void;
    endMap(): void;
    /**
     * Starts an array.
     * @param length The number of elements that will be written.
     */
    startArray(length: number): void;
    endArray(): void;
    /**
     * Sets the key of the next value within a record or map.
     */
    prop(name: string): void;
    /**
     * Sets the key of the next value within a record to one of its generated fields. Realisations write either
     * the field's key or its id; ids are only meaningful to the readers of the same generator output.
     * @param id The field's id within the fields passed to {@link startObject}.
     */
    field(id: number): void;
    /**
     * {@link field} followed by {@link writeNumber}.
     */
    numberField(id: number, v: number): void;
    /**
     * {@link field} followed by {@link writeBoolean}.
     */
    booleanField(id: number, v: boolean): void;
    /**
     * {@link field} followed by {@link writeString}.
     */
    stringField(id: number, v: string): void;
    /**
     * {@link field} followed by {@link writeValue}.
     */
    valueField(id: number, v: unknown): void;
    /**
     * {@link field} followed by {@link startArray}.
     */
    arrayField(id: number, length: number): void;
    /**
     * {@link field} followed by {@link startMap}.
     */
    mapField(id: number): void;
    writeNumber(v: number): void;
    writeBoolean(v: boolean): void;
    writeString(v: string): void;
    writeNull(): void;
    /**
     * Writes undefined, or null on platforms without undefined.
     */
    writeUndefined(): void;
    /**
     * Writes a value of unknown shape: primitives including null and undefined, arrays of values,
     * `Map<string, unknown>` trees and typed arrays.
     */
    writeValue(v: unknown): void;
}
