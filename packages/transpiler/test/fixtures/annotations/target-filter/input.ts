/**
 * Covers per-target JSDoc filtering: members tagged for one specific
 * output language are only emitted into that target. The untagged
 * `common()` method must appear in both goldens, while `csharpOnly()`
 * appears only in the C# golden and `kotlinOnly()` only in the Kotlin
 * golden.
 *
 * @public
 */
export class TargetFilter {
    public common(): number {
        return 0;
    }

    /**
     * @target csharp
     */
    public csharpOnly(): number {
        return 1;
    }

    /**
     * @target kotlin
     */
    public kotlinOnly(): number {
        return 2;
    }
}
