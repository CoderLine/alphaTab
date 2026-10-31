import ts from 'typescript';
import type EmitterContextBase from './EmitterContextBase';
import * as cs from './ir/Ir';
import { TsBuiltin } from './typeRegistry';

/**
 * Encapsulates the six-strategy `getTypeFromTsType` cascade that maps a
 * TypeScript `ts.Type` (plus optional symbol / type-arguments / source
 * node) onto an IR `cs.TypeNode`. The resolver is pure type lookup:
 *  - `tsType` in, IR `TypeNode` out;
 *  - no symbol-cache writes, no IR mutations beyond constructing nodes,
 *    no buffer maintenance;
 *  - all callbacks into context-only helpers (`buildCoreNamespace`,
 *    `addNodeDiagnostics`, `makeIterableType`, ...) go through the
 *    bound `_ctx` reference.
 *
 * Behaviour is preserved verbatim from the original methods on
 * `CSharpEmitterContext` (now `EmitterContextBase`). The class mirrors
 * the `SmartCastResolver` pattern: bound to a context at construction
 * time so per-target overrides (Kotlin's `makeIterableType` etc.)
 * dispatch correctly through the strategy hooks.
 */
export default class TypeResolver {
    private readonly _ctx: EmitterContextBase;

    public constructor(ctx: EmitterContextBase) {
        this._ctx = ctx;
    }

    private get _typeChecker(): ts.TypeChecker {
        return this._ctx.typeChecker;
    }

    /**
     * Top-level dispatch. Six strategies are tried in order:
     *  1. known-symbol lookup (resolves to a previously registered type),
     *  2. type-parameter shortcut,
     *  3. type-operator shortcut (`keyof T` collapses to string),
     *  4. primitive resolution (number/string/boolean/...),
     *  5. union/intersection resolution,
     *  6. unknown-symbol resolution (builtins + external/core types).
     *
     * Nullability is derived structurally at every IR-type construction
     * site via `checker.getNonNullableType(t) !== t`; no post-pass is
     * needed.
     */
    public getTypeFromTsType(
        node: cs.Node,
        tsType: ts.Type,
        tsSymbol?: ts.Symbol,
        typeArguments?: cs.LazyTypeRef[],
        typeNode?: ts.Node
    ): cs.TypeNode | null {
        let csType: cs.TypeNode | null = this.resolveKnownTypeSymbol(node, tsType, typeArguments);
        if (csType) {
            return csType;
        }

        if (tsType.isTypeParameter()) {
            return {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: node.parent,
                tsNode: node.tsNode,
                reference: tsType.symbol.name
            } as cs.TypeReference;
        }

        if (typeNode && ts.isTypeOperatorNode(typeNode)) {
            if (typeNode.operator === ts.SyntaxKind.KeyOfKeyword) {
                // `keyof typeof EnumType` is consumed by the special-case
                // enum bracket-access path in CSharpAstTransformer
                // (Enum[string] -> TypeHelper.parseEnum); the synthesized
                // keyof type itself is never emitted there. For every
                // other shape, emitting `string` silently is wrong (TS
                // would have narrowed to a string-literal union).
                const operand = typeNode.type;
                const isKeyofTypeofEnum =
                    ts.isTypeQueryNode(operand) &&
                    (() => {
                        const operandType = this._typeChecker.getTypeAtLocation(operand.exprName);
                        return (
                            (operandType.flags & ts.TypeFlags.Object) !== 0 &&
                            operandType.symbol !== undefined &&
                            (operandType.symbol.flags & ts.SymbolFlags.Enum) !== 0
                        );
                    })();

                if (!isKeyofTypeofEnum && this.isNodeEmitted(node)) {
                    this._ctx.addNodeDiagnostics(
                        node,
                        'keyof T type operator is not supported. See SYNTAX.md for the workaround.',
                        ts.DiagnosticCategory.Error
                    );
                }
                return {
                    nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                    type: cs.PrimitiveType.String,
                    isNullable: false
                } as cs.PrimitiveTypeNode;
            }
            return null;
        }

        csType = this.resolvePrimitiveType(node, tsType);
        if (csType) {
            return csType;
        }

        csType = this.resolveUnionType(node, tsType, typeArguments);
        if (csType) {
            return csType;
        }

        csType = this.resolveIntersectionType(node, tsType, typeArguments);
        if (csType) {
            return csType;
        }

        return this.resolveUnknownTypeSymbol(node, tsType, tsSymbol, typeArguments);
    }

    /**
     * Typed-array and DataView symbol names whose type arguments must be
     * stripped because the C#/Kotlin targets don't carry the underlying
     * ArrayBuffer generic.
     */
    private static readonly _typedArraySymbolNames: ReadonlySet<string> = new Set([
        'Uint8Array',
        'Int16Array',
        'Uint16Array',
        'Int32Array',
        'Uint32Array',
        'Float32Array',
        'Float64Array',
        'DataView'
    ]);

    private resolveKnownTypeSymbol(
        node: cs.Node,
        tsType: ts.Type,
        typeArguments?: cs.LazyTypeRef[]
    ): cs.TypeNode | null {
        const tsSymbol = tsType.aliasSymbol ?? tsType.symbol;
        if (!tsSymbol) {
            return null;
        }
        const declaration = this._ctx.symbols.resolve(tsSymbol);
        if (!declaration) {
            return null;
        }

        const reference = {
            nodeType: cs.SyntaxKind.TypeReference,
            parent: node.parent,
            tsNode: node.tsNode,
            reference: declaration
        } as cs.TypeReference;

        if (typeArguments) {
            reference.typeArguments = [];
            for (const a of typeArguments) {
                const parameterType = this._ctx.resolveLazyTypeRef(a);
                if (!parameterType) {
                    this._ctx.addTsNodeDiagnostics(
                        node.tsNode!,
                        'Could not resolve type parameter',
                        ts.DiagnosticCategory.Error
                    );
                } else {
                    reference.typeArguments!.push(parameterType);
                }
            }
        } else {
            const tsTypeArguments = (tsType as ts.TypeReference).typeArguments ?? tsType.aliasTypeArguments;
            if (tsTypeArguments) {
                reference.typeArguments = [];
                for (const a of tsTypeArguments) {
                    const parameterType = this.getTypeFromTsType(node, a);
                    if (!parameterType) {
                        this._ctx.addTsNodeDiagnostics(
                            node.tsNode!,
                            'Could not resolve type parameter',
                            ts.DiagnosticCategory.Error
                        );
                    } else {
                        reference.typeArguments!.push(parameterType);
                    }
                }
            }
        }

        // union type alias with nullable?
        if (cs.isUsingDeclaration(declaration)) {
            const nonNullable = this._typeChecker.getNonNullableType(tsType);
            if (nonNullable !== tsType) {
                reference.isNullable = true;
            }
        }

        return reference;
    }

    private resolvePrimitiveType(parent: cs.Node, tsType: ts.Type): cs.TypeNode | null {
        const handleNullablePrimitive = (type: cs.PrimitiveType) => {
            const isNullable = this._typeChecker.getNonNullableType(tsType) !== tsType;

            return {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                type: type,
                isNullable: isNullable
            } as cs.PrimitiveTypeNode;
        };

        // raw object without symbol -> dynamic
        if ((tsType.flags & ts.TypeFlags.Object) !== 0 && !tsType.symbol) {
            if (this._typeChecker.isTupleType(tsType)) {
                // Note: named tuples here if we start using it
                if (tsType.aliasSymbol) {
                    const type = this._typeChecker.getTypeOfSymbol(tsType.aliasSymbol);
                    const aliasTuple = this.getTypeFromTsType(parent, type, tsType.aliasSymbol);
                    // nullable?
                    if (this._typeChecker.getNonNullableType(type) !== type) {
                        aliasTuple!.isNullable = true;
                    }
                    return aliasTuple;
                }

                // Array style tuples: [unknown,unknown]
                return this._ctx.makeArrayTupleType(
                    parent,
                    this._typeChecker.getTypeArguments(tsType as ts.TypeReference)
                );
            }

            this._ctx.addNodeDiagnostics(
                parent,
                `Could not translate type ${this._typeChecker.typeToString(tsType)}, fallback to object`,
                ts.DiagnosticCategory.Warning
            );
            return handleNullablePrimitive(cs.PrimitiveType.Object);
        }

        // undefined -> nullable object
        if ((tsType.flags & ts.TypeFlags.Undefined) === ts.TypeFlags.Undefined) {
            const undefinedType = handleNullablePrimitive(cs.PrimitiveType.Object);
            undefinedType.isNullable = true;
            return undefinedType;
        }

        // any -> dynamic
        if ((tsType.flags & ts.TypeFlags.Any) !== 0) {
            return handleNullablePrimitive(cs.PrimitiveType.Object);
        }

        // object -> object
        if (tsType.flags === ts.TypeFlags.NonPrimitive && 'objectFlags' in tsType && 'intrinsicName' in tsType) {
            const unknown = handleNullablePrimitive(cs.PrimitiveType.Object);
            unknown.isNullable = true;
            return unknown;
        }

        // unknown -> object
        if ((tsType.flags & ts.TypeFlags.Unknown) !== 0) {
            const unknown = handleNullablePrimitive(cs.PrimitiveType.Object);
            unknown.isNullable = true;
            return unknown;
        }

        // bigint -> long
        if ((tsType.flags & ts.TypeFlags.BigInt) !== 0 || (tsType.flags & ts.TypeFlags.BigIntLiteral) !== 0) {
            return handleNullablePrimitive(cs.PrimitiveType.Long);
        }

        // number or number literal -> double
        if ((tsType.flags & ts.TypeFlags.Number) !== 0 || (tsType.flags & ts.TypeFlags.NumberLiteral) !== 0) {
            return handleNullablePrimitive(cs.PrimitiveType.Double);
        }

        // string or string literal -> string
        if ((tsType.flags & ts.TypeFlags.String) !== 0 || (tsType.flags & ts.TypeFlags.StringLiteral) !== 0) {
            return handleNullablePrimitive(cs.PrimitiveType.String);
        }

        // boolean or boolean literal -> bool
        if ((tsType.flags & ts.TypeFlags.Boolean) !== 0 || (tsType.flags & ts.TypeFlags.BooleanLiteral) !== 0) {
            return handleNullablePrimitive(cs.PrimitiveType.Bool);
        }

        // void -> void
        if ((tsType.flags & ts.TypeFlags.Void) !== 0) {
            return {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                type: cs.PrimitiveType.Void
            } as cs.PrimitiveTypeNode;
        }

        // never -> void
        if ((tsType.flags & ts.TypeFlags.Never) !== 0) {
            return {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                type: cs.PrimitiveType.Void
            } as cs.PrimitiveTypeNode;
        }

        return null;
    }

    private resolveUnionType(parent: cs.Node, tsType: ts.Type, typeArguments?: cs.LazyTypeRef[]): cs.TypeNode | null {
        if (!tsType.isUnion()) {
            return null;
        }

        // external union type alias, refer by name
        if (!tsType.symbol && tsType.aliasSymbol) {
            const isNullable = this._typeChecker.getNonNullableType(tsType) !== tsType;

            return {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: parent,
                reference: this._ctx.buildCoreNamespace(tsType.aliasSymbol) + tsType.aliasSymbol.name,
                isNullable: isNullable
            } as cs.TypeReference;
        }

        const isNullable = this._typeChecker.getNonNullableType(tsType) !== tsType;
        let actualType: ts.Type | null = null;
        let fallbackToObject = false;
        for (let t of tsType.types) {
            if (t.isLiteral()) {
                t = this._typeChecker.getBaseTypeOfLiteralType(t);
            }

            if ((t.flags & ts.TypeFlags.Null) !== 0) {
                // already accounted for in isNullable above
            } else if ((t.flags & ts.TypeFlags.Undefined) !== 0) {
                // already accounted for in isNullable above
            } else if (actualType == null) {
                actualType = t;
            } else if (actualType != null && actualType.flags !== t.flags) {
                const isEmitted = this.isNodeEmitted(parent);
                if (isEmitted && !this._ctx.globals.isPromiseLike(t)) {
                    this._ctx.addNodeDiagnostics(
                        parent,
                        'Union type covering multiple types detected, fallback to object',
                        ts.DiagnosticCategory.Warning
                    );
                }
                fallbackToObject = true;
            } else if (actualType !== t) {
                if (this._ctx.globals.isPromiseLike(t)) {
                    this._ctx.addNodeDiagnostics(
                        parent,
                        'Union type with promise detected, ignoring',
                        ts.DiagnosticCategory.Warning
                    );
                } else {
                    actualType = t;
                }
            }
        }

        if (fallbackToObject) {
            return {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                parent: parent,
                type: cs.PrimitiveType.Object,
                isNullable: isNullable
            } as cs.PrimitiveTypeNode;
        }

        if (!actualType) {
            return null;
        }

        let type: cs.TypeNode | null;
        if (actualType === tsType) {
            type = {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: parent,
                reference: tsType.symbol.name,
                isNullable: isNullable
            } as cs.TypeReference;
        } else {
            type = this.getTypeFromTsType(parent, actualType, undefined, typeArguments);
        }

        return {
            nodeType: cs.SyntaxKind.TypeReference,
            parent: parent,
            reference: type,
            isNullable: isNullable
        } as cs.TypeReference;
    }

    private resolveIntersectionType(
        parent: cs.Node,
        tsType: ts.Type,
        typeArguments?: cs.LazyTypeRef[]
    ): cs.TypeNode | null {
        if (!tsType.isIntersection()) {
            return null;
        }

        let isNonNullable = false;
        let actualType: ts.Type | null = null;
        let fallbackToObject = false;
        let multiOperandRefused = false;
        for (let t of tsType.types) {
            if (t.isLiteral()) {
                t = this._typeChecker.getBaseTypeOfLiteralType(t);
            }

            // NonNullable (e.g. type Y = X & {})
            if ((t.flags & ts.TypeFlags.Object) !== 0 && (t as ts.ObjectType).getProperties().length === 0) {
                isNonNullable = true;
            } else if (actualType == null) {
                actualType = t;
            } else if (actualType != null && actualType.flags !== t.flags) {
                const isEmitted = this.isNodeEmitted(parent);
                if (isEmitted && !this._ctx.globals.isPromiseLike(t)) {
                    this._ctx.addNodeDiagnostics(
                        parent,
                        'Intersection type with multiple distinct operands (A & B) is not supported. See SYNTAX.md for the workaround.',
                        ts.DiagnosticCategory.Error
                    );
                    multiOperandRefused = true;
                }
                fallbackToObject = true;
            } else if (actualType !== t) {
                if (this._ctx.globals.isPromiseLike(t)) {
                    this._ctx.addNodeDiagnostics(
                        parent,
                        'Intersection type with promise detected, ignoring',
                        ts.DiagnosticCategory.Warning
                    );
                } else {
                    if (this.isNodeEmitted(parent)) {
                        this._ctx.addNodeDiagnostics(
                            parent,
                            'Intersection type with multiple distinct operands (A & B) is not supported. See SYNTAX.md for the workaround.',
                            ts.DiagnosticCategory.Error
                        );
                        multiOperandRefused = true;
                    }
                    actualType = t;
                }
            }
        }

        if (fallbackToObject || multiOperandRefused) {
            return {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                parent: parent,
                type: cs.PrimitiveType.Object,
                isNullable: isNonNullable
            } as cs.PrimitiveTypeNode;
        }

        if (!actualType) {
            return null;
        }

        let type: cs.TypeNode | null;
        if (actualType === tsType) {
            type = {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: parent,
                reference: tsType.symbol.name,
                isNullable: isNonNullable
            } as cs.TypeReference;
        } else {
            type = this.getTypeFromTsType(parent, actualType, undefined, typeArguments);
        }

        return {
            nodeType: cs.SyntaxKind.TypeReference,
            parent: parent,
            reference: type,
            isNullable: isNonNullable
        } as cs.TypeReference;
    }

    private resolveUnknownTypeSymbol(
        node: cs.Node,
        tsType: ts.Type,
        tsSymbol?: ts.Symbol,
        typeArguments?: cs.LazyTypeRef[]
    ): cs.TypeNode | null {
        if (tsType.aliasSymbol) {
            tsSymbol = tsType.aliasSymbol;
        } else if (!tsSymbol) {
            tsSymbol = tsType.symbol;
        }

        if (!tsSymbol) {
            return null;
        }
        if (tsType.isTypeParameter()) {
            return {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: node.parent,
                tsNode: node.tsNode,
                isAsync: false,
                reference: tsType.symbol.name
            } as cs.TypeReference;
        }

        // some built in type handling
        let symbolName = tsSymbol.name;
        if (symbolName.endsWith('Constructor')) {
            symbolName = symbolName.substring(0, symbolName.length - 'Constructor'.length);
        }

        // Prefer symbol-identity via the cached global type for Promise.
        if (this._ctx.globals.isPromise(tsType)) {
            return this._resolvePromiseType(node, tsType, typeArguments);
        }

        switch (symbolName) {
            case TsBuiltin.Map:
                return this._resolveMapType(node, tsType, tsSymbol, typeArguments);
            case TsBuiltin.Iterable:
                return this._resolveIterableLikeType(node, tsType, typeArguments, this._ctx.makeIterableType());
            case TsBuiltin.Generator:
                return this._resolveIterableLikeType(node, tsType, typeArguments, this._ctx.makeGeneratorType());
            case TsBuiltin.Iterator:
                return this._resolveIterableLikeType(node, tsType, typeArguments, this._ctx.makeIteratorType());
            case TsBuiltin.Disposable:
                return {
                    nodeType: cs.SyntaxKind.TypeReference,
                    isAsync: false,
                    isNullable: false,
                    reference: TsBuiltin.Disposable
                } as cs.TypeReference;
            case TsBuiltin.Error:
                return {
                    nodeType: cs.SyntaxKind.TypeReference,
                    isAsync: false,
                    isNullable: false,
                    reference: this._ctx.makeExceptionType()
                } as cs.TypeReference;
            case TsBuiltin.Array:
                return this._resolveArrayType(node, tsType, tsSymbol, typeArguments);
            case ts.InternalSymbolName.Type:
                return this.resolveTypeFromInternalType(node, tsType);
            case ts.InternalSymbolName.Function:
                return this.resolveFunctionTypeFromTsType(node, tsType);
            default:
                return this._resolveExternalOrCoreType(node, tsType, tsSymbol, symbolName, typeArguments);
        }
    }

    private _resolvePromiseType(node: cs.Node, tsType: ts.Type, typeArguments?: cs.LazyTypeRef[]): cs.TypeReference {
        const promiseType = tsType as ts.TypeReference;

        let promiseReturnType: cs.TypeNode | null = null;
        if (typeArguments) {
            promiseReturnType = typeArguments[0];
        } else if (promiseType.typeArguments) {
            promiseReturnType = this.getTypeFromTsType(node, promiseType.typeArguments[0]);
        }

        if (
            promiseReturnType != null &&
            cs.isPrimitiveTypeNode(promiseReturnType) &&
            promiseReturnType.type === cs.PrimitiveType.Void
        ) {
            promiseReturnType = null;
        }

        return {
            nodeType: cs.SyntaxKind.TypeReference,
            parent: node.parent,
            tsNode: node.tsNode,
            isAsync: true,
            reference:
                promiseReturnType != null
                    ? promiseReturnType
                    : ({
                          nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                          type: cs.PrimitiveType.Void
                      } as cs.PrimitiveTypeNode)
        } as cs.TypeReference;
    }

    private _resolveMapType(
        node: cs.Node,
        tsType: ts.Type,
        tsSymbol: ts.Symbol,
        typeArguments?: cs.LazyTypeRef[]
    ): cs.TypeNode {
        const mapType = tsType as ts.TypeReference;
        let mapKeyType: cs.TypeNode | null = null;
        let mapValueType: cs.TypeNode | null = null;
        if (typeArguments && typeArguments.length === 2) {
            mapKeyType = this._ctx.resolveLazyTypeRef(typeArguments[0]);
            mapValueType = this._ctx.resolveLazyTypeRef(typeArguments[1]);
        } else if (mapType.aliasTypeArguments && mapType.aliasTypeArguments.length === 2) {
            mapKeyType = this.getTypeFromTsType(node, mapType.aliasTypeArguments[0]);
            mapValueType = this.getTypeFromTsType(node, mapType.aliasTypeArguments[1]);
        } else if (mapType.typeArguments && mapType.typeArguments.length === 2) {
            mapKeyType = this.getTypeFromTsType(node, mapType.typeArguments[0]);
            mapValueType = this.getTypeFromTsType(node, mapType.typeArguments[1]);
        } else {
            const inferredType = this._typeChecker.getTypeAtLocation(node.parent!.tsNode!);
            const args = (inferredType as ts.TypeReference).typeArguments;
            if (args?.length === 2) {
                mapKeyType = this.getTypeFromTsType(node, args[0]);
                mapValueType = this.getTypeFromTsType(node, args[1]);
            }
        }

        return this._ctx.createMapType(tsSymbol, node, mapKeyType, mapValueType);
    }

    /**
     * Resolves an iterable-like single-type-argument generic (Iterable,
     * Iterator, Generator) into a TypeReference with the target-specific
     * collection name. Historically Iterable required exactly one
     * typeArgument while Iterator/Generator accepted any non-empty
     * length; that asymmetry had no recorded explanation and the
     * snapshot net showed no observable case for it (S2.C6).
     */
    private _resolveIterableLikeType(
        node: cs.Node,
        tsType: ts.Type,
        typeArguments: cs.LazyTypeRef[] | undefined,
        reference: string
    ): cs.TypeReference {
        const refType = tsType as ts.TypeReference;
        let itemType: cs.TypeNode | null = null;
        if (typeArguments) {
            itemType = typeArguments[0];
        } else if (refType.typeArguments) {
            itemType = this.getTypeFromTsType(node, refType.typeArguments[0]);
        }
        return {
            nodeType: cs.SyntaxKind.TypeReference,
            parent: node.parent,
            tsNode: node.tsNode,
            reference: reference,
            typeArguments: [itemType]
        } as cs.TypeReference;
    }

    private _resolveArrayType(
        node: cs.Node,
        tsType: ts.Type,
        tsSymbol: ts.Symbol,
        typeArguments?: cs.LazyTypeRef[]
    ): cs.TypeNode {
        const arrayType = tsType as ts.TypeReference;
        let arrayElementType: cs.TypeNode | null = null;
        if (typeArguments && typeArguments.length > 0) {
            arrayElementType = this._ctx.resolveLazyTypeRef(typeArguments[0]);
        } else if (arrayType.typeArguments && arrayType.typeArguments.length > 0) {
            arrayElementType = this.getTypeFromTsType(node, arrayType.typeArguments[0]);
        } else {
            this._ctx.addNodeDiagnostics(node, 'Could not resolve array type', ts.DiagnosticCategory.Error);
        }

        if (!arrayElementType) {
            arrayElementType = {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                parent: node.parent,
                tsNode: node.tsNode,
                type: cs.PrimitiveType.Object
            } as cs.PrimitiveTypeNode;
        }

        return this._ctx.createArrayListType(tsSymbol, node, arrayElementType);
    }

    private _resolveExternalOrCoreType(
        node: cs.Node,
        tsType: ts.Type,
        tsSymbol: ts.Symbol,
        symbolName: string,
        typeArguments?: cs.LazyTypeRef[]
    ): cs.TypeReference {
        let externalModule = this._ctx.resolveExternalModuleOfType(tsSymbol);
        if (!externalModule) {
            externalModule = this._ctx.buildCoreNamespace(tsSymbol);
        }

        const typeRef = {
            nodeType: cs.SyntaxKind.TypeReference,
            parent: node.parent,
            tsNode: node.tsNode,
            tsSymbol: tsSymbol,
            reference: externalModule + symbolName,
            typeArguments: typeArguments
        } as cs.TypeReference;

        if (symbolName === 'Int8Array' && this.isNodeEmitted(node)) {
            this._ctx.addNodeDiagnostics(
                node,
                'Int8Array is not supported. The C# runtime has no Int8Array class. Use Uint8Array or a custom sbyte[] wrapper instead.',
                ts.DiagnosticCategory.Error
            );
        }

        // Typed arrays (Int8Array, ..., DataView) wrap an ArrayBuffer that
        // does not exist as a generic on the target type.
        if (TypeResolver._typedArraySymbolNames.has(symbolName)) {
            typeRef.typeArguments = [];
            typeRef.tsSymbol = undefined;
        }

        if (!typeRef.typeArguments && tsType.aliasTypeArguments) {
            typeRef.typeArguments = tsType.aliasTypeArguments.map(a => this.getTypeFromTsType(typeRef, a)!);
        }

        return typeRef;
    }

    private entityNameToString(e: ts.EntityName): string {
        if (ts.isIdentifier(e)) {
            return e.text;
        }
        if (ts.isQualifiedName(e)) {
            return `${this.entityNameToString(e.left)}.${e.right}`;
        }
        return '';
    }

    private resolveTypeFromInternalType(node: cs.Node, tsType: ts.Type): cs.TypeNode | null {
        const typeNode = this._typeChecker.typeToTypeNode(tsType, node.tsNode, undefined);
        if (typeNode) {
            switch (typeNode.kind) {
                case ts.SyntaxKind.FunctionType:
                    return this.resolveFunctionTypeFromTsType(node, tsType);
                case ts.SyntaxKind.TypeReference:
                    const reference = typeNode as ts.TypeReferenceNode;

                    const externalModule = this._ctx.buildCoreNamespace(tsType.symbol);
                    const symbolName = this.entityNameToString(reference.typeName);

                    const ref = {
                        nodeType: cs.SyntaxKind.TypeReference,
                        parent: node.parent,
                        tsNode: node.tsNode,
                        reference: externalModule + symbolName
                    } as cs.TypeReference;

                    return ref;

                default:
                    this._ctx.addNodeDiagnostics(
                        node,
                        `Unsupported internal type of kind ${ts.SyntaxKind[typeNode.kind]}: ${this._typeChecker.typeToString(tsType)}`,
                        ts.DiagnosticCategory.Error
                    );
                    return null;
            }
        }

        this._ctx.addNodeDiagnostics(
            node,
            `Unsupported internal type ${this._typeChecker.typeToString(tsType)}`,
            ts.DiagnosticCategory.Error
        );

        return null;
    }

    private resolveFunctionTypeFromTsType(node: cs.Node, tsType: ts.Type): cs.TypeNode | null {
        // typescript compiler API somehow does not provide proper type symbols
        // for function types, we need to attempt resolving the types via the function type declaration

        if (!tsType.symbol || !tsType.symbol.declarations) {
            return null;
        }

        const signatures = tsType.getCallSignatures();
        if (signatures.length === 0) {
            return null;
        }

        const returnType = this.getTypeFromTsType(node, signatures[0].getReturnType());
        if (!returnType) {
            this._ctx.addNodeDiagnostics(node, 'Could not resolve return type', ts.DiagnosticCategory.Error);
            return null;
        }

        const parameterTypes: cs.TypeNode[] = [];
        for (const p of signatures[0].parameters) {
            const pTsType = this._typeChecker.getTypeOfSymbol(p);
            if (!pTsType) {
                this._ctx.addTsNodeDiagnostics(
                    p.declarations![0],
                    'Could not resolve type for parameter',
                    ts.DiagnosticCategory.Error
                );
                return null;
            }

            const pType = this.getTypeFromTsType(node, pTsType);
            if (!pType) {
                this._ctx.addTsNodeDiagnostics(
                    p.declarations![0],
                    'Could not map type for parameter',
                    ts.DiagnosticCategory.Error
                );
                return null;
            }

            if (!TypeResolver._typedArraySymbolNames.has(pTsType.symbol?.name ?? '')
                && 'typeArguments' in pTsType && cs.isTypeReference(pType)) {
                const args = this._typeChecker.getTypeArguments(pTsType as ts.TypeReference);
                if (args.length > 0) {
                    pType.typeArguments = args.map(a => this.getTypeFromTsType(pType, a)!);
                }
            }

            parameterTypes.push(pType);
        }

        let typeParameters: cs.TypeNode[] | undefined = undefined;
        if (signatures[0].typeParameters) {
            typeParameters = [];
            for (const tp of signatures[0].typeParameters) {
                const tpTsType = this._typeChecker.getTypeOfSymbol(tp.symbol);
                if (!tpTsType) {
                    this._ctx.addTsNodeDiagnostics(
                        tp.symbol.declarations![0],
                        'Could not resolve type parameter',
                        ts.DiagnosticCategory.Error
                    );
                    return null;
                }

                const tpType = this.getTypeFromTsType(node, tpTsType);
                if (!tpType) {
                    this._ctx.addTsNodeDiagnostics(
                        tp.symbol.declarations![0],
                        'Could not map type parameter',
                        ts.DiagnosticCategory.Error
                    );
                    return null;
                }

                typeParameters.push(tpType);
            }
        }

        return this._ctx.createBasicFunctionType(node, returnType, parameterTypes);
    }

    private isNodeEmitted(node: cs.Node): boolean {
        if ('skipEmit' in node && (node.skipEmit as boolean)) {
            return false;
        }

        if (node.parent) {
            return this.isNodeEmitted(node.parent);
        }
        return true;
    }
}
