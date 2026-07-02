import type EmitterContextBase from '../EmitterContextBase';
import * as cs from '../ir/Ir';
import { hasTag, JsDocTag } from '../jsDocTags';
import type KotlinEmitterContext from '../kotlin/KotlinEmitterContext';
import type { IrPass } from './IrPass';

/**
 * Materialises the Kotlin `Partials` class-name suffix as a pass-time
 * decision on the IR.
 *
 * Background — Kotlin emits a separate `…Partials` companion type for
 * any TypeScript declaration tagged `@partial`. The old call site in
 * `KotlinTargetStrategy.getClassName` re-derived this at every name
 * lookup by inspecting `expr.parent` (the consuming member access) and
 * its TS symbol. That kept type-system reasoning inside the printer,
 * which IR README invariant 5 forbids: printers must do no type
 * inference of their own.
 *
 * This pass walks every IR node once, looks for `MemberAccessExpression`
 * nodes whose `tsSymbol` is `@partial`-tagged, and records the child
 * expression (the one whose class name needs the suffix) on the
 * Kotlin-only `partialSuffixExpressions` set.
 * `KotlinTargetStrategy.getClassName` then becomes a constant-time set
 * lookup — no `expr.parent` walk, no `hasTag` call at print time.
 *
 * The pass is wired into the Kotlin pipeline only; C# has no equivalent
 * suffix. The `IrPass` interface hands us an `EmitterContextBase`, so
 * we downcast to `KotlinEmitterContext` to reach the Kotlin-only state
 * — safe by configuration because this pass runs only in `KOTLIN_PASSES`.
 */
export class PartialsPass implements IrPass {
    public readonly name = 'partials';

    public run(files: readonly cs.SourceFile[], context: EmitterContextBase): void {
        // PartialsPass runs in KOTLIN_PASSES only — the cast is safe by configuration.
        const kotlinContext = context as KotlinEmitterContext;
        for (const file of files) {
            this._walk(file, kotlinContext);
        }
    }

    private _walk(root: cs.Node, context: KotlinEmitterContext): void {
        // Depth-first walk over the IR. Same shape as ResolveTypesPass.
        // Skips back-edges (`parent`) and TS-compiler interop fields
        // (`tsNode`, `tsType`, `tsSymbol`) so we stay inside the IR.
        const stack: cs.Node[] = [root];
        const seen = new Set<cs.Node>();

        while (stack.length > 0) {
            const node = stack.pop()!;
            if (seen.has(node)) {
                continue;
            }
            seen.add(node);

            if (cs.isMemberAccessExpression(node) && node.tsSymbol && this._isSymbolPartial(node.tsSymbol)) {
                // The class name on the left of the `.` is the one that
                // needs the suffix; record the IR node holding it.
                context.partialSuffixExpressions.add(node.expression);
            }

            for (const key of Object.getOwnPropertyNames(node)) {
                if (
                    key === 'parent' ||
                    key === 'tsNode' ||
                    key === 'tsType' ||
                    key === 'tsSymbol' ||
                    key === 'resolved' ||
                    key === 'resolve'
                ) {
                    continue;
                }
                const value = (node as unknown as Record<string, unknown>)[key];
                if (!value) {
                    continue;
                }
                if (Array.isArray(value)) {
                    for (const item of value) {
                        if (item && typeof item === 'object' && 'nodeType' in item) {
                            stack.push(item as cs.Node);
                        }
                    }
                } else if (typeof value === 'object' && 'nodeType' in (value as object)) {
                    stack.push(value as cs.Node);
                }
            }
        }
    }

    private _isSymbolPartial(tsSymbol: import('typescript').Symbol): boolean {
        if (!tsSymbol.valueDeclaration) {
            return false;
        }
        return hasTag(tsSymbol.valueDeclaration, JsDocTag.partial);
    }
}
