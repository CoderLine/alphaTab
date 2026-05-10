import type EmitterContextBase from '../EmitterContextBase';
import type * as cs from '../ir/Ir';

/**
 * A named transformation step that runs after the initial TS->IR
 * transform and before the printer. Passes operate on the entire set
 * of source files at once (which makes whole-program analyses like
 * override-marking natural) and have full read/write access to the
 * shared `EmitterContextBase` for symbol tables, type checker,
 * diagnostics, and the target strategy.
 *
 * Per-file passes can simply iterate `files` themselves; the interface
 * is intentionally shaped at the program level so that whole-program
 * passes (override propagation, inheritance flag rewriting, etc.) are
 * first-class.
 *
 * Passes must be idempotent across re-runs against an already-resolved
 * IR — fixture goldens would otherwise be unstable. They should not
 * throw on missing data; instead they should record diagnostics via
 * `context.addDiagnostic`.
 */
export interface IrPass {
    /** Short stable identifier surfaced in logs and diagnostics. */
    readonly name: string;

    run(files: readonly cs.SourceFile[], context: EmitterContextBase): void;
}

/**
 * Runs a list of passes in order. Logs each pass's start via the
 * supplied logger so the pipeline shows up in the emitter's console
 * output the same way the implicit `Resolving types` line did before.
 *
 * The pipeline is intentionally minimal — no cycle detection, no
 * dependency resolution, no parallelism. The caller owns the order.
 */
export class PassPipeline {
    public constructor(
        private readonly _passes: readonly IrPass[],
        private readonly _log: (msg: string) => void = () => {}
    ) {}

    public run(files: readonly cs.SourceFile[], context: EmitterContextBase): void {
        for (const pass of this._passes) {
            this._log(`[pass] ${pass.name}`);
            pass.run(files, context);
        }
    }
}
