/**
 * Covers building a `Record<string, number>` via an object literal.
 * The transformer rewrites the property assignments as key/value tuple
 * pairs feeding a Map-style initializer.
 *
 * @public
 */
export class RecordLiteral {
    public scores(): Record<string, number> {
        return {
            alice: 95,
            bob: 80
        };
    }
}
