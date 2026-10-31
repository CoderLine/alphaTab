/**
 * Top-level async generic function. Verifies the wrapper's static method
 * picks up both the async-rewrite pass and type-parameter handling.
 *
 * @public
 */
export async function identity<T>(value: T): Promise<T> {
    return value;
}
