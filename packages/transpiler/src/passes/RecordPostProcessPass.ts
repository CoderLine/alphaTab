import ts from 'typescript';
import type EmitterContextBase from '../EmitterContextBase';
import * as cs from '../ir/Ir';
import type { IrPass } from './IrPass';

/**
 * Kotlin-only post-processing for record-shaped classes (those created
 * by `visitRecordDeclaration` / `createDiscriminatedUnionClass`). Their
 * properties never get visited as `ts.PropertyDeclaration`, so the
 * @target / Members wraps don't fire on them. This pass restores the
 * two Kotlin-specific fixups that have to happen on record properties:
 *
 *  - Properties whose name appears on any implemented interface get
 *    `isOverride = true` (Kotlin requires explicit `override`).
 *  - Non-optional, non-initialized properties get a default initializer
 *    (`0` / `false` for value types, `null!` -> `lateinit` for reference
 *    types) so Kotlin's flow analysis sees them as definitely-assigned.
 *
 * Crucially this runs **after** `ResolveTypesPass`. Doing the work
 * during the InterfaceDeclaration wrap (the previous shape) forced
 * `resolveLazyTypeRef` on the interface refs of every record class
 * mid-transform — before all cross-file interface symbols were
 * registered. That premature resolve fell through to the
 * external-or-core fallback and baked the wrong namespace
 * (`alphaTab.core.IAlphaTexArgumentValue`) into the IR. Because
 * `resolveLazyTypeRef` caches its result, the later `ResolveTypesPass`
 * walk could not undo the mistake. Running as a pass guarantees every
 * `cs.TypeReference` we read here already carries the correct namespace.
 */
export class RecordPostProcessPass implements IrPass {
    public readonly name = 'record-post-process';

    public run(files: readonly cs.SourceFile[], context: EmitterContextBase): void {
        for (const file of files) {
            for (const decl of file.namespace.declarations) {
                if (cs.isClassDeclaration(decl) && decl.isRecord) {
                    this._processRecordClass(decl, file, context);
                }
            }
        }
    }

    private _processRecordClass(decl: cs.ClassDeclaration, file: cs.SourceFile, context: EmitterContextBase): void {
        // Collect the IR interface declarations implemented by this
        // record class. `ResolveTypesPass` has already turned every
        // LazyTypeRef in `decl.interfaces` into a concrete
        // `TypeReference` whose `reference` slot either points
        // directly at the resolved IR declaration (cross-file lookup
        // via SymbolRegistry) or carries a fully qualified string name
        // (external/core fallback path, also used by
        // `createDiscriminatedUnionClass` which writes the base
        // interface name as a plain string).
        const implementedInterfaces: cs.InterfaceDeclaration[] = [];
        for (const iface of decl.interfaces ?? []) {
            if (!cs.isTypeReference(iface)) {
                continue;
            }
            const ref = iface.reference;
            // Path 1: reference is the IR declaration itself.
            if (typeof ref === 'object' && ref && 'nodeType' in (ref as object)) {
                if (cs.isInterfaceDeclaration(ref as cs.Node)) {
                    implementedInterfaces.push(ref as cs.InterfaceDeclaration);
                }
                continue;
            }
            // Path 2: tsSymbol set -> look up in registry.
            if (iface.tsSymbol) {
                const resolved = context.symbols.resolve(iface.tsSymbol);
                if (resolved && cs.isInterfaceDeclaration(resolved)) {
                    implementedInterfaces.push(resolved);
                    continue;
                }
            }
            // Path 3: reference is a string -> find a same-file
            // interface declaration with a matching simple name.
            // Used by `createDiscriminatedUnionClass` where the base
            // interface is sibling-emitted into the same file.
            if (typeof ref === 'string') {
                const simpleName = ref.split('.').pop();
                const sibling = file.namespace.declarations.find(
                    d => cs.isInterfaceDeclaration(d) && d.name === simpleName
                ) as cs.InterfaceDeclaration | undefined;
                if (sibling) {
                    implementedInterfaces.push(sibling);
                }
            }
        }

        for (const member of decl.members) {
            if (!cs.isPropertyDeclaration(member)) {
                continue;
            }

            const isInterfaceOverride = implementedInterfaces.some(iface =>
                iface.members.some(im => cs.isPropertyDeclaration(im) && im.name === member.name)
            );
            if (isInterfaceOverride) {
                member.isOverride = true;
            }

            // Record classes only emit secondary constructors. Kotlin's
            // definite-assignment analysis does not cross secondary
            // constructors, so every non-abstract property still needs an
            // inline initializer or `lateinit`, even when the constructor
            // body sets it.
            if (!member.initializer && !member.isAbstract) {
                const propType = member.tsNode ? context.typeChecker.getTypeAtLocation(member.tsNode) : undefined;
                if (propType && context.isEnum(propType)) {
                    // Kotlin enums cannot be default-initialized with `0`; the
                    // KotlinAstPrinter renders `null!` initializers as
                    // `lateinit var`, which is the right shape for an
                    // uninitialized enum-typed property.
                    member.initializer = {
                        parent: member,
                        nodeType: cs.SyntaxKind.NonNullExpression,
                        expression: { nodeType: cs.SyntaxKind.NullLiteral } as cs.NullLiteral
                    } as cs.NonNullExpression;
                } else if (propType && context.isValueType(propType)) {
                    const isBool =
                        (propType.flags & ts.TypeFlags.Boolean) !== 0 ||
                        (propType.flags & ts.TypeFlags.BooleanLiteral) !== 0;
                    member.initializer = isBool
                        ? ({
                              parent: member,
                              nodeType: cs.SyntaxKind.FalseLiteral
                          } as cs.BooleanLiteral)
                        : ({
                              parent: member,
                              nodeType: cs.SyntaxKind.NumericLiteral,
                              value: '0'
                          } as cs.NumericLiteral);
                } else if (propType && propType === context.typeChecker.getNonNullableType(propType)) {
                    member.initializer = {
                        parent: member,
                        nodeType: cs.SyntaxKind.NonNullExpression,
                        expression: { nodeType: cs.SyntaxKind.NullLiteral } as cs.NullLiteral
                    } as cs.NonNullExpression;
                }
            }
        }
    }
}
