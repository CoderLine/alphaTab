import EmitterContextBase from '../EmitterContextBase';
import type * as cs from '../ir/Ir';

/**
 * Kotlin-specific emitter context. Holds state that exists only in the
 * Kotlin pipeline (currently just `partialSuffixExpressions`, populated
 * by `PartialsPass` and consumed by `KotlinTargetStrategy.getClassName`).
 *
 * Extends `EmitterContextBase` directly — the shared base used by both
 * target pipelines. The C# pipeline uses `CSharpEmitterContext`, a
 * sibling subclass; both subclasses exist so future target-specific
 * overrides can land without re-introducing a refactor.
 */
export default class KotlinEmitterContext extends EmitterContextBase {
    /**
     * Populated by `PartialsPass`: the set of IR expression nodes whose
     * resolved class name must receive the `Partials` suffix.
     * `KotlinTargetStrategy.getClassName` reads this set instead of
     * re-deriving the decision by walking `expr.parent` at print time.
     */
    public readonly partialSuffixExpressions: Set<cs.Node> = new Set();
}
