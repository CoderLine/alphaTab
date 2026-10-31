/**
 * Idiomatic JS expresses a dynamic string-keyed object via an index
 * signature. The transpiler rejects the inline `{ [k: string]: T }` type
 * literal because the target languages have no equivalent — callers must
 * either use `Map<string, T>` or model the object as a `@record` interface.
 *
 * @public
 */
export class DynamicIndexer {
    public read(o: { [k: string]: unknown }, key: string): unknown {
        return o[key];
    }
}
