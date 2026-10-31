import type EmitterContextBase from '../EmitterContextBase';
import * as cs from '../ir/Ir';
import type { IrPass } from './IrPass';

/**
 * Whole-program override propagation. Walks every registered top-level
 * type and:
 *
 *  - marks methods and properties that override a virtual base as
 *    `isVirtual`,
 *  - propagates `hasVirtualMembersOrSubClasses = true` up the
 *    inheritance chain for every class that contains a virtual member
 *    or is itself subclassed elsewhere.
 *
 * The pass uses a visited set keyed by TS symbol to avoid infinite
 * recursion through cyclic AST references (e.g. baseClass back-edges
 * after type resolution).
 */
export class RewriteVisibilitiesPass implements IrPass {
    public readonly name = 'rewrite-visibilities';

    public run(_files: readonly cs.SourceFile[], context: EmitterContextBase): void {
        const visited = new Map<string, boolean>();
        for (const csType of context.symbols.iterateRegisteredTypes()) {
            if (this._markVirtual(csType, visited, context)) {
                csType.hasVirtualMembersOrSubClasses = true;
            }
        }
    }

    private _markVirtual(node: cs.Node, visited: Map<string, boolean>, context: EmitterContextBase): boolean {
        const key = context.symbols.keyOf(context.symbols.getSymbolForDeclaration(node.tsNode!));
        if (visited.has(key)) {
            return visited.get(key)!;
        }

        let hasVirtualMember = false;

        switch (node.nodeType) {
            case cs.SyntaxKind.ClassDeclaration:
                const csClass = node as cs.ClassDeclaration;
                for (const m of csClass.members) {
                    if (this._markVirtual(m, visited, context)) {
                        hasVirtualMember = true;
                    }
                }

                let baseClass = csClass.baseClass;
                while (baseClass != null) {
                    if (cs.isTypeReference(baseClass)) {
                        const ref = baseClass.reference;
                        if (cs.isNode(ref) && cs.isClassDeclaration(ref)) {
                            ref.hasVirtualMembersOrSubClasses = true;
                            baseClass = ref;
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }

                break;

            case cs.SyntaxKind.MethodDeclaration:
                const csMethod = node as cs.MethodDeclaration;
                if (!csMethod.isOverride && context.symbols.isMarkedVirtual(csMethod.tsSymbol)) {
                    csMethod.isVirtual = true;
                    hasVirtualMember = true;
                }
                break;

            case cs.SyntaxKind.PropertyDeclaration:
                const csProperty = node as cs.PropertyDeclaration;
                if (!csProperty.isOverride && context.symbols.isMarkedVirtual(csProperty.tsSymbol)) {
                    csProperty.isVirtual = true;
                    hasVirtualMember = true;
                }
                break;
        }

        visited.set(key, hasVirtualMember);
        return hasVirtualMember;
    }
}
