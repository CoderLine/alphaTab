/**
 * Logical compound assignment on non-boolean types (e.g. nullable string)
 * is not supported by the transpiler.
 *
 * @public
 */
export class LogicalCompound {
    public coalesce(a: string | null, b: string): string {
        let f: string | null = a;
        f ||= b;
        return f!;
    }
}
