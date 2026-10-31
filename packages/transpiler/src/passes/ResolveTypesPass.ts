import type EmitterContextBase from '../EmitterContextBase';
import * as cs from '../ir/Ir';
import type { IrPass } from './IrPass';

/**
 * Resolves every `LazyTypeRef` placeholder allocated by the transformer
 * into a concrete `cs.TypeNode`. Each placeholder carries its own
 * `resolve()` closure and mutates in place, so the pass is simply a
 * depth-first walk that calls `.resolve()` on every reachable
 * `LazyTypeRef`. Without this prime walk, on-demand resolution would
 * happen mid-print (the printer would be the first reader of an
 * unprimed slot) which makes diagnostic attribution harder. The pass
 * therefore stays as the explicit "resolve everything before the
 * printer" gate that IR invariant 1 (in `src/ir/README.md`) demands.
 */
export class ResolveTypesPass implements IrPass {
    public readonly name = 'resolve-types';

    public run(files: readonly cs.SourceFile[], _context: EmitterContextBase): void {
        for (const file of files) {
            this._primeLazyTypeRefs(file);
        }
    }

    private _primeLazyTypeRefs(root: cs.Node): void {
        // Depth-first walk over the IR. Visits every value reachable
        // through own object/array properties on each Node; recurses
        // into anything that looks like a Node (has a `nodeType`
        // field). Skips back-edges (`parent`) and the TypeScript
        // compiler interop fields (`tsNode`, `tsType`, `tsSymbol`)
        // to avoid stepping outside the IR.
        const stack: cs.Node[] = [root];
        const seen = new Set<cs.Node>();

        while (stack.length > 0) {
            const node = stack.pop()!;
            if (seen.has(node)) {
                continue;
            }
            seen.add(node);

            // If this node is a LazyTypeRef, resolve it now. After
            // resolution `nodeType` flips to its resolved kind, but
            // the in-place merge leaves any child arrays
            // (typeArguments etc.) reachable so the walk continues
            // into them on the next iteration.
            if (cs.isLazyTypeRef(node)) {
                node.resolve();
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
}
