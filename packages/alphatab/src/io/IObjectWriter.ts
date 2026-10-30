/**
 * A streaming writer for the JSON-like object model of the generated serializers: records and maps (keyed
 * containers), arrays, numbers, booleans, strings, null and undefined.
 * Inside a record or map every value is preceded by exactly one {@link prop} call, array elements are not.
 * Containers nest strictly.
 * @internal
 */
export interface IObjectWriter {
    /**
     * Starts a record with static keys (a serialized class).
     */
    startObject(): void;
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
     * the name or the id; ids are only meaningful to the readers of the same generator output.
     * @param id The field's id, unique within its class.
     * @param name The field's key.
     */
    field(id: number, name: string): void;
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
