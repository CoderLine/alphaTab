/**
 * Covers Number(s: string) -> double.Parse(s, InvariantCulture) in C#
 * and s.toDouble() in Kotlin.
 *
 * @public
 */
export class NumberFromString {
    public toNum(s: string): number {
        return Number(s);
    }
}
