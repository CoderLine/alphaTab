import * as cs from './CSharpAst';
import ts from 'typescript';
import path from 'node:path';

type SymbolKey = string;

export default class CSharpEmitterContext {
    private _symbolLookup: Map<SymbolKey, cs.NamedElement & cs.Node> = new Map();
    private _exportedSymbols: Map<SymbolKey, boolean> = new Map();
    private _virtualSymbols: Map<SymbolKey, boolean> = new Map();
    private _symbolConst: Map<SymbolKey, boolean> = new Map();

    private _diagnostics: ts.Diagnostic[] = [];
    private _unresolvedTypeNodes: cs.UnresolvedTypeNode[] = [];
    private _program: ts.Program;
    public typeChecker: ts.TypeChecker;
    public noPascalCase: boolean = false;

    public csharpFiles: cs.SourceFile[] = [];
    public processingSkippedElement: boolean = false;
    public get compilerOptions(): ts.CompilerOptions {
        return this._program.getCompilerOptions();
    }
    public get diagnostics(): readonly ts.Diagnostic[] {
        return this._diagnostics;
    }
    public hasErrors: boolean = false;

    public getType(n: ts.Node): ts.Type {
        return this.typeChecker.getTypeAtLocation(n);
    }

    public toMethodName(text: string): string {
        return this.toPascalCase(this.toIdentifier(text));
    }

    public toPropertyName(text: string): string {
        return this.toPascalCase(this.toIdentifier(text));
    }

    public toIdentifier(text: string): string {
        return text.replace(/[^a-zA-Z0-9_]/g, m => {
            return (
                {
                    '#': 'Hash',
                    '@': 'At'
                }[m] ?? '_'
            );
        });
    }

    public isMethodSymbol(tsSymbol: ts.Symbol) {
        return (tsSymbol.flags & ts.SymbolFlags.Method) !== 0;
    }

    public isPropertySymbol(tsSymbol: ts.Symbol) {
        return (tsSymbol.flags & ts.SymbolFlags.Property) !== 0;
    }

    public isTypeAssignable(targetType: ts.Type, contextualTypeNullable: ts.Type, actualType: ts.Type) {
        if (
            contextualTypeNullable.flags === ts.TypeFlags.Any ||
            contextualTypeNullable.flags === ts.TypeFlags.Unknown
        ) {
            return true;
        }
        if (targetType.flags === ts.TypeFlags.Any || targetType.flags === ts.TypeFlags.Unknown) {
            return true;
        }
        if (actualType.isClassOrInterface()) {
            return (this.typeChecker as any).isTypeAssignableTo(actualType, targetType);
        }
        return false;
    }

    public registerUnresolvedTypeNode(unresolved: cs.UnresolvedTypeNode) {
        if (this.processingSkippedElement) {
            return;
        }
        this._unresolvedTypeNodes.push(unresolved);
    }

    public removeUnresolvedTypeNode(unresolved: cs.UnresolvedTypeNode) {
        if (this.processingSkippedElement) {
            return;
        }
        this._unresolvedTypeNodes = this._unresolvedTypeNodes.filter(n => n !== unresolved);
    }

    public getSymbolName(expr: cs.Node): string | undefined {
        const symbolKey = this.getSymbolKey(expr.tsSymbol);
        if (expr.tsSymbol) {
            if (this._symbolLookup.has(symbolKey)) {
                const csSymbol = this._symbolLookup.get(symbolKey)!;
                switch (csSymbol.nodeType) {
                    case cs.SyntaxKind.ClassDeclaration:
                    case cs.SyntaxKind.InterfaceDeclaration:
                    case cs.SyntaxKind.EnumDeclaration:
                        return this.getFullName(csSymbol as cs.NamedTypeDeclaration, expr);
                }
                return csSymbol.name;
            }

            if (
                expr.tsSymbol.flags & ts.SymbolFlags.Class ||
                expr.tsSymbol.flags & ts.SymbolFlags.Interface ||
                expr.tsSymbol.flags & ts.SymbolFlags.ConstEnum ||
                expr.tsSymbol.flags & ts.SymbolFlags.RegularEnum
            ) {
                switch (expr.tsSymbol.name) {
                    case 'Error':
                        return this.makeExceptionType();
                    case 'Iterable':
                        return this.makeIterableType();
                    case 'Iterator':
                        return this.makeIteratorType();
                    case 'Generator':
                        return this.makeGeneratorType();
                    case 'Disposable':
                        return 'Disposable';
                }

                return this.buildCoreNamespace(expr.tsSymbol) + this.toCoreTypeName(expr.tsSymbol.name);
            }

            if (expr.tsSymbol.flags & ts.SymbolFlags.Function) {
                if (this.isTestFunction(expr.tsSymbol)) {
                    return `${this.toPascalCase('alphaTab.test')}.Globals.${this.toPascalCase(expr.tsSymbol.name)}`;
                }

                if (expr.tsSymbol.valueDeclaration && expr.tsNode) {
                    const sourceFile = expr.tsSymbol.valueDeclaration.getSourceFile();
                    if (sourceFile === expr.tsNode.getSourceFile()) {
                        return expr.tsSymbol.name;
                    }
                }

                return `${this.toPascalCase('alphaTab.core')}.Globals.${this.toPascalCase(expr.tsSymbol.name)}`;
            }

            if (
                (expr.tsSymbol.flags & ts.SymbolFlags.FunctionScopedVariable && this.isGlobalVariable(expr.tsSymbol)) ||
                (expr.tsSymbol.flags & ts.SymbolFlags.NamespaceModule && this.isKnownModule(expr.tsSymbol))
            ) {
                return `${this.toPascalCase('alphaTab.core')}.Globals.${this.toPascalCase(expr.tsSymbol.name)}`;
            }

            if (expr.tsSymbol) {
                const externalModule = this.resolveExternalModuleOfType(expr.tsSymbol);
                if (externalModule) {
                    return externalModule + this.toPascalCase(expr.tsSymbol.name);
                }
            }
        }
        return undefined;
    }
    private isTestFunction(tsSymbol: ts.Symbol): boolean {
        return tsSymbol.valueDeclaration?.getSourceFile().fileName.indexOf('jasmine') !== -1;
    }
    private isKnownModule(tsSymbol: ts.Symbol): boolean {
        switch (tsSymbol.name) {
            case 'globalThis':
                return true;
            default:
                return false;
        }
    }
    public isGlobalVariable(symbol: ts.Symbol) {
        if ((symbol.flags & ts.SymbolFlags.FunctionScopedVariable) === 0 || !symbol.valueDeclaration) {
            return false;
        }

        if (
            symbol.valueDeclaration.parent.kind === ts.SyntaxKind.VariableDeclarationList &&
            symbol.valueDeclaration.parent.parent.kind === ts.SyntaxKind.VariableStatement &&
            symbol.valueDeclaration.parent.parent.parent.kind === ts.SyntaxKind.SourceFile
        ) {
            return true;
        }

        return false;
    }

    public getFullName(type: cs.NamedTypeDeclaration, expr?: cs.Node): string {
        if (!type.parent) {
            return '';
        }
        switch (type.parent.nodeType) {
            case cs.SyntaxKind.ClassDeclaration:
            case cs.SyntaxKind.InterfaceDeclaration:
            case cs.SyntaxKind.EnumDeclaration:
                return `${this.getFullName(type.parent as cs.NamedTypeDeclaration)}.${this.getClassName(type, expr)}`;
            case cs.SyntaxKind.NamespaceDeclaration:
                return `${(type.parent as cs.NamespaceDeclaration).namespace}.${this.getClassName(type, expr)}`;
        }
        return '';
    }

    protected getClassName(type: cs.NamedTypeDeclaration, expr?: cs.Node) {
        return type.name;
    }

    public resolveAllUnresolvedTypeNodes() {
        for (const node of this._unresolvedTypeNodes) {
            let resolved = this.resolveType(node);
            if (!resolved) {
                resolved = this.resolveType(node);
                this.addCsNodeDiagnostics(node, 'Could not resolve type', ts.DiagnosticCategory.Error);
            }
        }
    }

    public addCsNodeDiagnostics(node: cs.Node, message: string, category: ts.DiagnosticCategory) {
        if (node.tsNode) {
            this.addTsNodeDiagnostics(node.tsNode, message, category);
        } else {
            this.addDiagnostic({
                category: category,
                code: 1,
                file: undefined,
                messageText: message,
                start: undefined,
                length: undefined
            });
        }
    }

    public addTsNodeDiagnostics(node: ts.Node, message: string, category: ts.DiagnosticCategory) {
        const file = this.findTsSourceFile(node);
        const start = node.getStart(file);
        const end = node.getEnd();
        this.addDiagnostic({
            category: category,
            code: 4000,
            file: file,
            messageText: message,
            start: start,
            length: end - start
        });
    }

    private findTsSourceFile(tsNode: ts.Node): ts.SourceFile {
        if (ts.isSourceFile(tsNode)) {
            return tsNode;
        }
        return this.findTsSourceFile(tsNode.parent);
    }

    public constructor(program: ts.Program) {
        this._program = program;
        this.typeChecker = program.getTypeChecker();
    }

    public addDiagnostic(diagnostics: ts.Diagnostic) {
        this._diagnostics.push(diagnostics);
        if (diagnostics.category === ts.DiagnosticCategory.Error) {
            this.hasErrors = true;
        }
    }

    public addSourceFile(csharpFile: cs.SourceFile) {
        this.csharpFiles.push(csharpFile);
    }

    public resolveType(node: cs.UnresolvedTypeNode): cs.TypeNode | null {
        if (node.nodeType !== cs.SyntaxKind.UnresolvedTypeNode) {
            return node;
        }

        if (!node.tsNode) {
            throw new Error('Node must be set for all types');
        }

        let resolved: cs.TypeNode | null = null;
        if (!node.tsType) {
            node.tsType = this.typeChecker.getTypeAtLocation(node.tsNode);
        }

        if (node.tsType) {
            resolved = this.getTypeFromTsType(node, node.tsType, node.tsSymbol, node.typeArguments, node.tsNode);
        }

        if (resolved) {
            const wasNullable = node.isNullable;
            for (const prop of Object.getOwnPropertyNames(node)) {
                delete (node as any)[prop];
            }
            for (const prop of Object.getOwnPropertyNames(resolved)) {
                (node as any)[prop] = (resolved as any)[prop];
            }
            if (wasNullable) {
                node.isNullable = true;
            }
            return node;
        }

        return null;
    }

    public isBooleanType(type: ts.Type) {
        if (!type) {
            return false;
        }
        return type.symbol && type.symbol.name === 'Boolean';
    }

    public getArrayElementType(type: ts.Type | undefined): ts.Type | null {
        if (!type) {
            return null;
        }

        if (type.symbol && type.symbol.name === 'Array') {
            return (type as ts.TypeReference).typeArguments![0];
        }

        if (type.isUnion()) {
            const nonNullable = this.typeChecker.getNonNullableType(type);
            return this.getArrayElementType(nonNullable);
        }

        return null;
    }

    private getTypeFromTsType(
        node: cs.Node,
        tsType: ts.Type,
        tsSymbol?: ts.Symbol,
        typeArguments?: cs.UnresolvedTypeNode[],
        typeNode?: ts.Node
    ): cs.TypeNode | null {
        let csType: cs.TypeNode | null = this.resolveKnownTypeSymbol(node, tsType, typeArguments);
        if (csType) {
            return this.applyNullable(csType, typeNode);
        }

        if (typeNode && ts.isTypeOperatorNode(typeNode)) {
            if (typeNode.operator === ts.SyntaxKind.KeyOfKeyword) {
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
            return this.applyNullable(csType, typeNode);
        }

        csType = this.resolveUnionType(node, tsType, typeArguments);
        if (csType) {
            return this.applyNullable(csType, typeNode);
        }

        csType = this.resolveIntersectionType(node, tsType, typeArguments);
        if (csType) {
            return this.applyNullable(csType, typeNode);
        }

        csType = this.resolveUnknownTypeSymbol(node, tsType, tsSymbol, typeArguments);

        return this.applyNullable(csType, typeNode);
    }

    private applyNullable(csType: cs.TypeNode | null, typeNode: ts.Node | undefined): cs.TypeNode | null {
        if (!csType || !typeNode || ts.isTypeNode(typeNode)) {
            return csType;
        }

        if (ts.isUnionTypeNode(typeNode)) {
            for (const t of typeNode.types) {
                if (
                    t.kind === ts.SyntaxKind.NullKeyword ||
                    (ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.NullKeyword) ||
                    t.kind === ts.SyntaxKind.UndefinedKeyword ||
                    (ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.UndefinedKeyword)
                ) {
                    csType.isNullable = true;
                }
            }
        }

        return csType;
    }

    private resolveUnknownTypeSymbol(
        node: cs.Node,
        tsType: ts.Type,
        tsSymbol?: ts.Symbol,
        typeArguments?: cs.UnresolvedTypeNode[]
    ): cs.TypeNode | null {
        if (!tsSymbol) {
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

        switch (symbolName) {
            case 'Promise':
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
            case 'Map':
                const mapType = tsType as ts.TypeReference;
                let mapKeyType: cs.TypeNode | null = null;
                let mapValueType: cs.TypeNode | null = null;
                if (typeArguments) {
                    mapKeyType = this.resolveType(typeArguments[0]);
                    mapValueType = this.resolveType(typeArguments[1]);
                } else if (mapType.typeArguments) {
                    mapKeyType = this.getTypeFromTsType(node, mapType.typeArguments[0]);
                    mapValueType = this.getTypeFromTsType(node, mapType.typeArguments[1]);
                }

                return this.createMapType(tsSymbol, node, mapKeyType, mapValueType);
            case 'Iterable':
                const iterableType = tsType as ts.TypeReference;

                let iterableItemType: cs.TypeNode | null = null;

                if (typeArguments) {
                    iterableItemType = typeArguments[0];
                } else if (iterableType.typeArguments) {
                    iterableItemType = this.getTypeFromTsType(node, iterableType.typeArguments[0]);
                }

                return {
                    nodeType: cs.SyntaxKind.TypeReference,
                    parent: node.parent,
                    tsNode: node.tsNode,
                    reference: this.makeIterableType(),
                    typeArguments: [iterableItemType]
                } as cs.TypeReference;

            case 'Generator':
                const generatorType = tsType as ts.TypeReference;

                let generatorItemType: cs.TypeNode | null = null;

                if (typeArguments) {
                    generatorItemType = typeArguments[0];
                } else if (generatorType.typeArguments) {
                    generatorItemType = this.getTypeFromTsType(node, generatorType.typeArguments[0]);
                }

                return {
                    nodeType: cs.SyntaxKind.TypeReference,
                    parent: node.parent,
                    tsNode: node.tsNode,
                    reference: this.makeGeneratorType(),
                    typeArguments: [generatorItemType]
                } as cs.TypeReference;

            case 'Iterator':
                const iteratorType = tsType as ts.TypeReference;

                let iteratorItemType: cs.TypeNode | null = null;

                if (typeArguments) {
                    iteratorItemType = typeArguments[0];
                } else if (iteratorType.typeArguments) {
                    iteratorItemType = this.getTypeFromTsType(node, iteratorType.typeArguments[0]);
                }

                return {
                    nodeType: cs.SyntaxKind.TypeReference,
                    parent: node.parent,
                    tsNode: node.tsNode,
                    reference: this.makeIteratorType(),
                    typeArguments: [iteratorItemType]
                } as cs.TypeReference;

            case 'Disposable':
                return {
                    nodeType: cs.SyntaxKind.TypeReference,
                    isAsync: false,
                    isNullable: false,
                    reference: 'Disposable'
                } as cs.TypeReference;
            case 'Error':
                return {
                    nodeType: cs.SyntaxKind.TypeReference,
                    isAsync: false,
                    isNullable: false,
                    reference: this.makeExceptionType()
                } as cs.TypeReference;
            case 'Array':
                const arrayType = tsType as ts.TypeReference;
                let arrayElementType: cs.TypeNode | null = null;
                if (typeArguments) {
                    arrayElementType = this.resolveType(typeArguments[0]);
                } else if (arrayType.typeArguments) {
                    arrayElementType = this.getTypeFromTsType(node, arrayType.typeArguments[0]);
                }

                if (!arrayElementType) {
                    arrayElementType = {
                        nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                        parent: node.parent,
                        tsNode: node.tsNode,
                        type: cs.PrimitiveType.Object
                    } as cs.PrimitiveTypeNode;
                }

                return this.createArrayListType(tsSymbol, node, arrayElementType);
            case ts.InternalSymbolName.Type:
                return this.resolveFunctionTypeFromTsType(node, tsType);
            case ts.InternalSymbolName.Function:
                return this.resolveFunctionTypeFromTsType(node, tsType);

            default:
                let externalModule = this.resolveExternalModuleOfType(tsSymbol);
                if (!externalModule) {
                    externalModule = this.buildCoreNamespace(tsSymbol);
                }

                // remove ArrayBuffer type arguments
                switch (symbolName) {
                    case 'Int8Array':
                    case 'Uint8Array':
                    case 'Int16Array':
                    case 'Uint16Array':
                    case 'Int32Array':
                    case 'Uint32Array':
                    case 'Float32Array':
                    case 'Float64Array':
                    case 'DataView':
                        typeArguments = [];
                        tsSymbol = undefined;
                        break;
                }

                return {
                    nodeType: cs.SyntaxKind.TypeReference,
                    parent: node.parent,
                    tsNode: node.tsNode,
                    tsSymbol: tsSymbol,
                    reference: externalModule + symbolName,
                    typeArguments: typeArguments
                } as cs.TypeReference;
        }
    }

    private resolveExternalModuleOfType(tsSymbol: ts.Symbol): string | undefined {
        // TODO: the future goal here is to find the import statement which brought the type into the current module
        // and then do a semi-automatic mapping of external libraries
        // unfortunately we haven't found yet a good TS Compiler API to do so, hence we map manually some specific symbols we know
        // check if the type as imported from an external module/package and then map the name accordingly.

        switch (tsSymbol.name) {
            case 'AlphaSkiaCanvas':
            case 'AlphaSkiaImage':
            case 'AlphaSkiaTextAlign':
            case 'AlphaSkiaTextBaseline':
            case 'AlphaSkiaTypeface':
            case 'AlphaSkiaTextStyle':
            case 'AlphaSkiaTextMetrics':
                return `${this.alphaSkiaModule()}.`;
        }

        return undefined;
    }

    protected alphaSkiaModule(): string {
        return 'AlphaTab.Platform.Skia.AlphaSkiaBridge';
    }

    protected createArrayListType(tsSymbol: ts.Symbol, node: cs.Node, arrayElementType: cs.TypeNode): cs.TypeNode {
        return {
            nodeType: cs.SyntaxKind.ArrayTypeNode,
            parent: node.parent,
            tsNode: node.tsNode,
            elementType: arrayElementType
        } as cs.ArrayTypeNode;
    }

    protected createMapType(
        symbol: ts.Symbol,
        node: cs.Node,
        mapKeyType: cs.TypeNode | null,
        mapValueType: cs.TypeNode | null
    ): cs.TypeNode {
        return {
            nodeType: cs.SyntaxKind.MapTypeNode,
            parent: node.parent,
            tsNode: node.tsNode,
            keyType: mapKeyType,
            valueType: mapValueType,
            valueIsValueType: this.isCsValueType(mapValueType),
            keyIsValueType: this.isCsValueType(mapKeyType)
        } as cs.MapTypeNode;
    }

    protected isCsValueType(mapValueType: cs.TypeNode | null) {
        if (mapValueType) {
            switch (mapValueType.nodeType) {
                case cs.SyntaxKind.PrimitiveTypeNode:
                    switch ((mapValueType as cs.PrimitiveTypeNode).type) {
                        case cs.PrimitiveType.Bool:
                        case cs.PrimitiveType.Int:
                        case cs.PrimitiveType.Double:
                            return true;
                    }
                    break;
                case cs.SyntaxKind.TypeReference:
                    const ref = (mapValueType as cs.TypeReference).reference;
                    if (typeof ref !== 'string') {
                        switch (ref.nodeType) {
                            case cs.SyntaxKind.EnumDeclaration:
                                return true;
                        }
                    }
                    break;
                case cs.SyntaxKind.ArrayTupleNode:
                    return true;
            }
        }
        return false;
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
            this.addCsNodeDiagnostics(node, 'Could not resolve return type', ts.DiagnosticCategory.Error);
            return null;
        }

        const parameterTypes: cs.TypeNode[] = [];
        for (const p of signatures[0].parameters) {
            const pTsType = this.typeChecker.getTypeOfSymbol(p);
            if (!pTsType) {
                this.addTsNodeDiagnostics(
                    p.declarations![0],
                    'Could not resolve type for parameter',
                    ts.DiagnosticCategory.Error
                );
                return null;
            }

            const pType = this.getTypeFromTsType(node, pTsType);
            if (!pType) {
                this.addTsNodeDiagnostics(
                    p.declarations![0],
                    'Could not map type for parameter',
                    ts.DiagnosticCategory.Error
                );
                return null;
            }

            parameterTypes.push(pType);
        }

        let typeParameters: cs.TypeNode[] | undefined = undefined;
        if (signatures[0].typeParameters) {
            typeParameters = [];
            for (const tp of signatures[0].typeParameters) {
                const tpTsType = this.typeChecker.getTypeOfSymbol(tp.symbol);
                if (!tpTsType) {
                    this.addTsNodeDiagnostics(
                        tp.symbol.declarations![0],
                        'Could not resolve type parameter',
                        ts.DiagnosticCategory.Error
                    );
                    return null;
                }

                const tpType = this.getTypeFromTsType(node, tpTsType);
                if (!tpType) {
                    this.addTsNodeDiagnostics(
                        tp.symbol.declarations![0],
                        'Could not map type parameter',
                        ts.DiagnosticCategory.Error
                    );
                    return null;
                }

                typeParameters.push(tpType);
            }
        }

        return this.createBasicFunctionType(node, returnType, parameterTypes);
    }

    protected createBasicFunctionType(
        node: cs.Node,
        returnType: cs.TypeNode,
        parameterTypes: cs.TypeNode[]
    ): cs.TypeNode {
        return {
            nodeType: cs.SyntaxKind.FunctionTypeNode,
            parent: node.parent,
            tsNode: node.tsNode,
            parameterTypes: parameterTypes,
            returnType: returnType
        } as cs.FunctionTypeNode;
    }

    private resolveUnionType(
        parent: cs.Node,
        tsType: ts.Type,
        typeArguments?: cs.UnresolvedTypeNode[]
    ): cs.TypeNode | null {
        if (!tsType.isUnion()) {
            return null;
        }

        // external union type alias, refer by name
        if (!tsType.symbol && tsType.aliasSymbol) {
            let isNullable = false;
            for (const t of tsType.types) {
                if ((t.flags & ts.TypeFlags.Null) !== 0) {
                    isNullable = true;
                } else if ((t.flags & ts.TypeFlags.Undefined) !== 0) {
                    isNullable = true;
                }
            }

            return {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: parent,
                reference: this.buildCoreNamespace(tsType.aliasSymbol) + tsType.aliasSymbol.name,
                isNullable: isNullable
            } as cs.TypeReference;
        }

        let isNullable = false;
        let actualType: ts.Type | null = null;
        let fallbackToObject = false;
        for (let t of tsType.types) {
            if (t.isLiteral()) {
                t = this.typeChecker.getBaseTypeOfLiteralType(t);
            }

            if ((t.flags & ts.TypeFlags.Null) !== 0) {
                isNullable = true;
            } else if ((t.flags & ts.TypeFlags.Undefined) !== 0) {
                isNullable = true;
            } else if (actualType == null) {
                actualType = t;
            } else if (actualType != null && actualType.flags !== t.flags) {
                const isEmitted = this.isNodeEmitted(parent);
                if (isEmitted && t.symbol.name !== 'PromiseLike') {
                    this.addCsNodeDiagnostics(
                        parent,
                        'Union type covering multiple types detected, fallback to object',
                        ts.DiagnosticCategory.Warning
                    );
                }
                fallbackToObject = true;
            } else if (actualType !== t) {
                if (t.symbol?.name === 'PromiseLike') {
                    this.addCsNodeDiagnostics(
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
        typeArguments?: cs.UnresolvedTypeNode[]
    ): cs.TypeNode | null {
        if (!tsType.isIntersection()) {
            return null;
        }

        let isNonNullable = false;
        let actualType: ts.Type | null = null;
        let fallbackToObject = false;
        for (let t of tsType.types) {
            if (t.isLiteral()) {
                t = this.typeChecker.getBaseTypeOfLiteralType(t);
            }

            // NonNullable (e.g. type Y = X & {})
            if ((t.flags & ts.TypeFlags.Object) !== 0 && (t as ts.ObjectType).getProperties().length === 0) {
                isNonNullable = true;
            } else if (actualType == null) {
                actualType = t;
            } else if (actualType != null && actualType.flags !== t.flags) {
                const isEmitted = this.isNodeEmitted(parent);
                if (isEmitted && t.symbol.name !== 'PromiseLike') {
                    this.addCsNodeDiagnostics(
                        parent,
                        'Intersection type covering multiple types detected, fallback to object',
                        ts.DiagnosticCategory.Warning
                    );
                }
                fallbackToObject = true;
            } else if (actualType !== t) {
                if (t.symbol?.name === 'PromiseLike') {
                    this.addCsNodeDiagnostics(
                        parent,
                        'Intersection type with promise detected, ignoring',
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

    private isNodeEmitted(node: cs.Node): boolean {
        if ('skipEmit' in node && (node.skipEmit as boolean)) {
            return false;
        }

        if (node.parent) {
            return this.isNodeEmitted(node.parent);
        }
        return true;
    }

    public isDefaultValueNull(tsType: ts.Type): boolean {
        tsType = this.typeChecker.getNonNullableType(tsType);
        if ((tsType.flags & ts.TypeFlags.Number) !== 0 || (tsType.flags & ts.TypeFlags.NumberLiteral) !== 0) {
            return false;
        }
        if ((tsType.flags & ts.TypeFlags.Boolean) !== 0 || (tsType.flags & ts.TypeFlags.BooleanLiteral) !== 0) {
            return false;
        }
        return true;
    }

    private resolvePrimitiveType(parent: cs.Node, tsType: ts.Type): cs.TypeNode | null {
        const handleNullablePrimitive = (type: cs.PrimitiveType) => {
            let isNullable = false;
            if (tsType.isUnion()) {
                for (const t of tsType.types) {
                    if ((t.flags & ts.TypeFlags.Null) !== 0) {
                        isNullable = true;
                    } else if ((t.flags & ts.TypeFlags.Undefined) !== 0) {
                        isNullable = true;
                    }
                }
            }

            return {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                type: type,
                isNullable: isNullable
            } as cs.PrimitiveTypeNode;
        };

        // raw object without symbol -> dynamic
        if ((tsType.flags & ts.TypeFlags.Object) !== 0 && !tsType.symbol) {
            if (this.typeChecker.isTupleType(tsType)) {
                // Note: named tuples here if we start using it

                // Array style tuples: [unknown,unknown]
                return this.makeArrayTupleType(parent, this.typeChecker.getTypeArguments(tsType as ts.TypeReference));
            }

            this.addCsNodeDiagnostics(
                parent,
                `Could not translate type ${this.typeChecker.typeToString(tsType)}, fallback to object`,
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

    public makeArrayTupleType(parent: cs.Node, typeArguments: readonly ts.Type[]): cs.ArrayTupleNode {
        const ref = {
            parent,
            nodeType: cs.SyntaxKind.ArrayTupleNode
        } as cs.ArrayTupleNode;

        ref.types = typeArguments.map(x => this.getTypeFromTsType(ref, x)!);

        return ref;
    }

    private resolveKnownTypeSymbol(
        node: cs.Node,
        tsType: ts.Type,
        typeArguments?: cs.UnresolvedTypeNode[]
    ): cs.TypeNode | null {
        const symbolKey = this.getSymbolKey(tsType.symbol);
        if (tsType.symbol && this._symbolLookup.has(symbolKey)) {
            const declaration = this._symbolLookup.get(symbolKey)!;
            const reference = {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: node.parent,
                tsNode: node.tsNode,
                reference: declaration
            } as cs.TypeReference;

            if (typeArguments) {
                reference.typeArguments = [];
                for (const a of typeArguments) {
                    const parameterType = this.resolveType(a);
                    if (!parameterType) {
                        this.addTsNodeDiagnostics(
                            node.tsNode!,
                            'Could not resolve type parameter',
                            ts.DiagnosticCategory.Error
                        );
                    } else {
                        reference.typeArguments!.push(parameterType);
                    }
                }
            } else {
                const tsTypeArguments = (tsType as ts.TypeReference).typeArguments;
                if (tsTypeArguments) {
                    reference.typeArguments = [];
                    for (const a of tsTypeArguments) {
                        const parameterType = this.getTypeFromTsType(node, a);
                        if (!parameterType) {
                            this.addTsNodeDiagnostics(
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

            return reference;
        }

        if (tsType.isTypeParameter()) {
            return {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: node.parent,
                tsNode: node.tsNode,
                reference: tsType.symbol.name
            } as cs.TypeReference;
        }

        return null;
    }

    public makeExceptionType(): string {
        // global alias
        return this.makeTypeName('Error');
    }

    public makeIterableType(): string {
        return this.makeTypeName('System.Collections.Generic.IEnumerable');
    }

    public makeIteratorType(): string {
        return this.makeTypeName('System.Collections.Generic.IEnumerator');
    }

    public makeGeneratorType(): string {
        return this.makeTypeName('System.Collections.Generic.IEnumerator');
    }

    public makeTypeName(tsName: string): string {
        const parts = tsName.split('.');
        let result = '';
        for (let i = 0; i < parts.length; i++) {
            if (i > 0) {
                result += '.';
            }
            if (i === parts.length - 1) {
                result += parts[i];
            } else {
                result += this.toPascalCase(parts[i]);
            }
        }
        return result;
    }

    protected buildCoreNamespace(aliasSymbol?: ts.Symbol) {
        let suffix = '';

        if (aliasSymbol) {
            if (aliasSymbol.name === 'Map') {
                return `${this.toPascalCase('alphaTab.collections') + suffix}.`;
            }

            if (aliasSymbol.name === 'Error') {
                return '';
            }

            if (aliasSymbol.declarations) {
                for (const decl of aliasSymbol.declarations) {
                    let fileName = path.basename(decl.getSourceFile().fileName).toLowerCase();
                    if (fileName.startsWith('lib.') && fileName.endsWith('.d.ts')) {
                        fileName = fileName.substring(4, fileName.length - 5);
                        if (fileName.length) {
                            suffix = fileName.split('.').map(s => {
                                if (s.match(/es[0-9]{4}/)) {
                                    return `.${this.toPascalCase('ecmaScript')}`;
                                }
                                if (s.match(/es[0-9]{1}/)) {
                                    return `.${this.toPascalCase('ecmaScript')}`;
                                }
                                return `.${this.toPascalCase(s)}`;
                            })[0];
                        }
                    }
                }
            }
        }

        return `${this.toPascalCase('alphaTab.core') + suffix}.`;
    }
    protected toCoreTypeName(s: string) {
        if (s === 'Map') {
            return 'IMap';
        }
        return s;
    }

    public toPascalCase(text: string): string {
        if (text.indexOf('-') >= 0) {
            return this.kebabCaseToPascalCase(text);
        }

        if (this.noPascalCase) {
            return text;
        }

        if (!text) {
            return '';
        }

        return text
            .split('.')
            .map(p => p.substr(0, 1).toUpperCase() + p.substr(1))
            .join('.');
    }

    private kebabCaseToPascalCase(text: string): string {
        return text
            .split('-')
            .map(w => this.toPascalCase(w))
            .join('');
    }

    public registerSymbolAsExported(symbol: ts.Symbol) {
        const symbolKey = this.getSymbolKey(symbol);
        this._exportedSymbols.set(symbolKey, true);
    }

    public registerSymbol(node: cs.NamedElement & cs.Node) {
        const symbol = this.getSymbolForDeclaration(node.tsNode!);
        if (symbol) {
            const symbolKey = this.getSymbolKey(symbol);
            this._symbolLookup.set(symbolKey, node);
        } else {
            this.addCsNodeDiagnostics(node, 'Could not register symbol', ts.DiagnosticCategory.Error);
        }
    }

    public resolveSymbol(symbol: ts.Symbol): (cs.NamedElement & cs.Node) | undefined {
        const symbolKey = this.getSymbolKey(symbol);
        return this._symbolLookup.get(symbolKey);
    }

    public isConst(declaration: cs.FieldDeclaration) {
        const symbolKey = this.getSymbolKey(declaration.tsSymbol!);
        return this._symbolConst.has(symbolKey);
    }

    public registerSymbolAsConst(symbol: ts.Symbol) {
        const symbolKey = this.getSymbolKey(symbol);
        this._symbolConst.set(symbolKey, true);
    }

    private getSymbolKey(symbol: ts.Symbol | undefined): SymbolKey {
        if (!symbol) {
            return '';
        }

        if (symbol.flags & ts.SymbolFlags.Alias) {
            symbol = this.typeChecker.getAliasedSymbol(symbol);
        }

        const declaration = symbol.valueDeclaration
            ? symbol.valueDeclaration
            : symbol.declarations && symbol.declarations.length > 0
              ? symbol.declarations[0]
              : undefined;

        if (declaration) {
            return `${symbol.name}_${declaration.getSourceFile().fileName}_${declaration.pos}`;
        }
        return symbol.name;
    }

    public getSymbolForDeclaration(node: ts.Node): ts.Symbol | undefined {
        let symbol = this.typeChecker.getSymbolAtLocation(node);
        if (!symbol) {
            const name = (node as any).name;
            if (name) {
                symbol = this.typeChecker.getSymbolAtLocation(name);
            }
        }
        return symbol;
    }

    public getMethodNameFromSymbol(symbol: ts.Symbol): string {
        const parent = 'parent' in symbol ? (symbol.parent as ts.Symbol) : undefined;

        if (symbol.name === 'dispose' && (!parent || parent.name === 'SymbolConstructor')) {
            return symbol.name;
        }

        if (symbol.name === 'iterator' && (!parent || parent.name === 'SymbolConstructor')) {
            return this.toMethodName('getEnumerator');
        }

        return '';
    }

    public isUnknownSmartCast(expression: ts.Expression) {
        const smartCastType = this.getSmartCastType(expression);
        return (
            smartCastType &&
            ((smartCastType.flags & ts.TypeFlags.Any) !== 0 || (smartCastType.flags & ts.TypeFlags.Unknown) !== 0)
        );
    }

    public isIterable(type: ts.Type) {
        if (type.isUnion()) {
            for (const t of type.types) {
                if ((t.flags & ts.TypeFlags.Null) !== 0) {
                    // nullable
                } else if ((t.flags & ts.TypeFlags.Undefined) !== 0) {
                    // optional
                } else if (this.isIterable(t)) {
                    return true;
                }
            }

            return false;
        }

        if (type.symbol != null && type.symbol.name === 'Iterable') {
            return true;
        }

        return false;
    }

    public isBooleanSmartCast(tsNode: ts.Node) {
        let tsParent = tsNode.parent;
        if (!tsParent) {
            return false;
        }

        while (tsParent.kind === ts.SyntaxKind.ParenthesizedExpression) {
            tsNode = tsParent;
            tsParent = tsParent.parent!;
        }
        switch (tsParent.kind) {
            case ts.SyntaxKind.ConditionalExpression:
                if ((tsParent as ts.ConditionalExpression).condition !== tsNode) {
                    return false;
                }
                break;
            case ts.SyntaxKind.PrefixUnaryExpression:
                if ((tsParent as ts.PrefixUnaryExpression).operator !== ts.SyntaxKind.ExclamationToken) {
                    return false;
                }
                break;
            case ts.SyntaxKind.IfStatement:
                if ((tsParent as ts.IfStatement).expression !== tsNode) {
                    return false;
                }
                break;
            case ts.SyntaxKind.WhileStatement:
                if ((tsParent as ts.WhileStatement).expression !== tsNode) {
                    return false;
                }
                break;
            case ts.SyntaxKind.ForStatement:
                if ((tsParent as ts.ForStatement).condition !== tsNode) {
                    return false;
                }
                break;
            case ts.SyntaxKind.BinaryExpression:
                switch ((tsParent as ts.BinaryExpression).operatorToken.kind) {
                    case ts.SyntaxKind.AmpersandAmpersandToken:
                    case ts.SyntaxKind.BarBarToken:
                        break;
                    default:
                        return false;
                }
                break;
            default:
                return false;
        }

        // check if expression results in bool
        const type = this.typeChecker.getTypeAtLocation(tsNode);
        if (!type || this.isBooleanType(type)) {
            return true;
        }

        return true;
    }

    public isValueTypeNotNullSmartCast(expression: ts.Expression): boolean | undefined {
        if (
            expression.parent.kind === ts.SyntaxKind.AsExpression || // already a cast
            expression.parent.kind === ts.SyntaxKind.NonNullExpression || // explicit non null expression
            this.isBooleanSmartCast(expression) ||
            (ts.isBinaryExpression(expression.parent) &&
                expression.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
                expression.parent.left === expression) // left hand side assignment
        ) {
            return undefined;
        }

        // unwrap symbol of expression to get declared type
        let symbol = this.typeChecker.getSymbolAtLocation(expression);
        if (!symbol) {
            return undefined;
        }
        const declarations = symbol.declarations;
        if (!declarations || declarations.length === 0) {
            return undefined;
        }

        if (symbol.flags & ts.SymbolFlags.Alias) {
            symbol = this.typeChecker.getAliasedSymbol(symbol);
        }
        if (symbol.flags & ts.SymbolFlags.Interface || symbol.flags & ts.SymbolFlags.Class) {
            return undefined;
        }

        // declared type must be nullable
        const declaredType = this.typeChecker.getTypeAtLocation(declarations[0]);
        if (!this.isNullableType(declaredType)) {
            return undefined;
        }

        // actual type at location must be non nullable
        const declaredTypeNonNull = this.typeChecker.getNonNullableType(declaredType);
        const contextualType = this.typeChecker.getTypeOfSymbolAtLocation(symbol, expression);
        if (!contextualType || this.isNullableType(contextualType)) {
            return undefined;
        }

        // actual type must match non nullable declaration
        if (declaredTypeNonNull === contextualType) {
            return this.isValueType(declaredTypeNonNull);
        }

        return undefined;
    }

    public isNullableType(declaredType: ts.Type): boolean {
        return (
            declaredType.isUnion() &&
            !!declaredType.types.find(t => t.flags & ts.TypeFlags.Null || t.flags & ts.TypeFlags.Undefined)
        );
    }

    public isNonNullSmartCast(expression: ts.Expression): boolean {
        // if the parent is already casting, we have no "smart" cast.
        if (
            expression.parent.kind === ts.SyntaxKind.AsExpression ||
            (ts.isBinaryExpression(expression.parent) &&
                expression.parent.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)
        ) {
            return false;
        }

        const contextualType = this.typeChecker.getTypeAtLocation(expression);
        if (!contextualType) {
            return false;
        }

        // we consider the expression as smart casted if the declared symbol has a different
        // contextual type than the declared type.
        let symbol = this.typeChecker.getSymbolAtLocation(expression);
        if (!symbol) {
            return false;
        }
        const declarations = symbol.declarations;
        if (!declarations || declarations.length === 0) {
            return false;
        }

        if (symbol.flags & ts.SymbolFlags.Alias) {
            symbol = this.typeChecker.getAliasedSymbol(symbol);
        }

        if (symbol.flags & ts.SymbolFlags.Interface || symbol.flags & ts.SymbolFlags.Class) {
            return false;
        }

        const declaredType = this.typeChecker.getTypeAtLocation(declarations[0]);
        if (!this.isNullableType(declaredType)) {
            return false;
        }

        return (
            this.typeChecker.getNonNullableType(declaredType) === this.typeChecker.getNonNullableType(contextualType) &&
            this.isNullableType(declaredType) &&
            !this.isNullableType(contextualType)
        );
    }

    public getSmartCastType(expression: ts.Expression): ts.Type | null {
        // if the parent is already casting, we have no "smart" cast.
        if (expression.parent.kind === ts.SyntaxKind.AsExpression) {
            return null;
        }

        // no smartcast on assignments
        if (
            ts.isBinaryExpression(expression.parent) &&
            (expression.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken ||
                expression.parent.operatorToken.kind === ts.SyntaxKind.QuestionQuestionEqualsToken) &&
            expression.parent.left === expression
        ) {
            return null;
        }

        if (
            expression.parent.kind === ts.SyntaxKind.NonNullExpression &&
            expression.parent.parent.kind === ts.SyntaxKind.AsExpression
        ) {
            return null;
        }

        // For Enum[value] we do not smart cast value to a number
        if (ts.isElementAccessExpression(expression.parent) && expression.parent.argumentExpression === expression) {
            return null;
        }

        // we consider the expression as smart casted if the declared symbol has a different
        // contextual type than the declared type.
        let symbol = this.typeChecker.getSymbolAtLocation(expression);
        if (!symbol) {
            // smartcast to unknown?
            const contextualType = this.typeChecker.getContextualType(expression);
            if (
                contextualType &&
                ((contextualType.flags & ts.TypeFlags.Any) !== 0 || (contextualType.flags & ts.TypeFlags.Unknown) !== 0)
            ) {
                return contextualType;
            }

            return null;
        }
        const declarations = symbol.declarations;
        if (!declarations || declarations.length === 0) {
            return null;
        }

        if (symbol.flags & ts.SymbolFlags.Alias) {
            symbol = this.typeChecker.getAliasedSymbol(symbol);
        }

        if (symbol.flags & ts.SymbolFlags.Interface || symbol.flags & ts.SymbolFlags.Class) {
            return null;
        }

        let contextualType = this.typeChecker.getContextualType(expression);
        if (!contextualType) {
            contextualType = this.typeChecker.getTypeOfSymbolAtLocation(symbol, expression);
            if (!contextualType) {
                return null;
            }
        }

        let declaredType = this.typeChecker.getTypeAtLocation(declarations[0]);

        const contextualTypeNullable = contextualType;
        contextualType = this.typeChecker.getNonNullableType(contextualType);
        declaredType = this.typeChecker.getNonNullableType(declaredType);

        if (this.shouldSkipSmartCast(contextualType)) {
            return null;
        }

        // cast enums to numbers in arithmetic operations
        if (
            expression.parent &&
            (contextualType.flags & ts.TypeFlags.Enum || contextualType.flags & ts.TypeFlags.EnumLiteral)
        ) {
            if (ts.isBinaryExpression(expression.parent)) {
                switch (expression.parent.operatorToken.kind) {
                    case ts.SyntaxKind.AsteriskToken:
                    case ts.SyntaxKind.PlusToken:
                    case ts.SyntaxKind.MinusEqualsToken:
                    case ts.SyntaxKind.SlashToken:
                        return (this.typeChecker as any).getNumberType();
                    case ts.SyntaxKind.EqualsEqualsToken:
                    case ts.SyntaxKind.EqualsEqualsEqualsToken:
                    case ts.SyntaxKind.ExclamationEqualsToken:
                    case ts.SyntaxKind.ExclamationEqualsEqualsToken:
                    case ts.SyntaxKind.GreaterThanEqualsToken:
                    case ts.SyntaxKind.GreaterThanToken:
                    case ts.SyntaxKind.LessThanEqualsToken:
                    case ts.SyntaxKind.LessThanToken:
                        const otherExpr =
                            expression.parent.left === expression ? expression.parent.right : expression.parent.left;
                        const otherExprType = this.typeChecker.getTypeAtLocation(otherExpr);
                        if (otherExprType && otherExprType.flags & ts.TypeFlags.Number) {
                            return (this.typeChecker as any).getNumberType();
                        }
                        break;
                }
            } else if (
                ts.isElementAccessExpression(expression.parent) &&
                expression.parent.argumentExpression === expression
            ) {
                return (this.typeChecker as any).getNumberType();
            }
        }

        // enum literal to same enum type
        if (
            contextualType.flags & ts.TypeFlags.EnumLiteral &&
            (declaredType.symbol as any)?.parent === contextualType.symbol
        ) {
            return null;
        }

        return contextualType !== declaredType &&
            !this.isTypeAssignable(contextualType, contextualTypeNullable, declaredType)
            ? contextualTypeNullable
            : null;
    }
    shouldSkipSmartCast(contextualType: ts.Type) {
        // unions that are no enums
        if (contextualType.isUnion() && (contextualType.flags & (ts.TypeFlags.Enum | ts.TypeFlags.EnumLiteral)) === 0) {
            return true;
        }

        // no function types
        if (this.isFunctionType(contextualType)) {
            return true;
        }

        // no casts to "object"
        if (
            'objectFlags' in contextualType &&
            'intrinsicName' in contextualType &&
            contextualType.intrinsicName === 'object'
        ) {
            return true;
        }

        // some core types
        if (contextualType.symbol) {
            switch (contextualType.symbol.name) {
                case 'ArrayLike':
                case '__type':
                    return true;
            }
        }

        return false;
    }

    public isFunctionType(contextualType: ts.Type): boolean {
        if (!contextualType.symbol || !contextualType.symbol.declarations) {
            return false;
        }
        for (const declaration of contextualType.symbol.declarations) {
            if (ts.isFunctionTypeNode(declaration)) {
                return true;
            }
        }

        return false;
    }

    public markAsSubclassed(classElement: ts.Symbol) {
        const key = this.getSymbolKey(classElement);
        this._virtualSymbols.set(key, true);
    }

    public markOverride(classElement: ts.ClassElement): (ts.ClassElement | ts.TypeElement)[] {
        let parent: ts.Node = classElement;
        while (parent.kind !== ts.SyntaxKind.ClassDeclaration) {
            if (parent.parent) {
                parent = parent.parent;
            } else {
                return [];
            }
        }

        const classDecl = parent as ts.ClassDeclaration;
        const overridden = this.getOverriddenMembers(classDecl, classElement);
        if (overridden.length > 0) {
            const member =
                this.typeChecker.getSymbolAtLocation(classElement) ??
                this.typeChecker.getSymbolAtLocation(classElement.name!);
            this._virtualSymbols.set(this.getSymbolKey(member), true);

            for (const s of overridden) {
                const overriddenMember =
                    this.typeChecker.getSymbolAtLocation(s) ?? this.typeChecker.getSymbolAtLocation(s.name!);
                const symbolKey = this.getSymbolKey(overriddenMember);
                this._virtualSymbols.set(symbolKey, true);
            }
        }

        return overridden;
    }

    protected getOverriddenMembers(
        classType: ts.ClassDeclaration | ts.InterfaceDeclaration,
        classElement: ts.ClassElement
    ): (ts.ClassElement | ts.TypeElement)[] {
        const overriddenItems: (ts.ClassElement | ts.TypeElement)[] = [];
        this.collectOverriddenMembersByName(overriddenItems, classType, classElement.name!.getText(), false, false);
        return overriddenItems;
    }

    protected collectOverriddenMembersByName(
        overriddenItems: (ts.ClassElement | ts.TypeElement)[],
        classType: ts.ClassDeclaration | ts.InterfaceDeclaration,
        memberName: string,
        includeOwnMembers: boolean = false,
        allowInterfaces: boolean = false
    ) {
        const member = classType.members.find(m => m.name?.getText() === memberName);
        if (includeOwnMembers && member) {
            overriddenItems.push(member);
        }

        if (classType.heritageClauses) {
            for (const implementsClause of classType.heritageClauses) {
                for (const typeSyntax of implementsClause.types) {
                    const declarations = this.typeChecker.getTypeFromTypeNode(typeSyntax)?.symbol.declarations;
                    if (declarations) {
                        for (const decl of declarations) {
                            if (ts.isClassDeclaration(decl) || (allowInterfaces && ts.isInterfaceDeclaration(decl))) {
                                this.collectOverriddenMembersByName(overriddenItems, decl, memberName, true, true);
                            }
                        }
                    }
                }
            }
        }
    }

    public isValueTypeExpression(expression: ts.NonNullExpression) {
        let tsType: ts.Type;
        if (ts.isIdentifier(expression.expression)) {
            const symbol = this.typeChecker.getSymbolAtLocation(expression.expression);
            if (symbol?.valueDeclaration) {
                tsType = this.typeChecker.getTypeAtLocation(symbol.valueDeclaration);
            } else {
                tsType = this.typeChecker.getTypeAtLocation(expression);
            }
        } else {
            tsType = this.typeChecker.getTypeAtLocation(expression);
        }

        tsType = this.typeChecker.getNonNullableType(tsType);

        return this.isValueType(tsType);
    }

    public isValueType(tsType: ts.Type) {
        // primitives
        if ((tsType.flags & ts.TypeFlags.Number) !== 0 || (tsType.flags & ts.TypeFlags.NumberLiteral) !== 0) {
            return true;
        }
        if ((tsType.flags & ts.TypeFlags.Boolean) !== 0 || (tsType.flags & ts.TypeFlags.BooleanLiteral) !== 0) {
            return true;
        }

        return this.isEnum(tsType) || this.typeChecker.isTupleType(tsType);
    }

    public isEnum(tsType: ts.Type) {
        // enums
        if (tsType.symbol && tsType.symbol.flags & ts.SymbolFlags.Enum) {
            return true;
        }
        if (tsType.symbol && tsType.symbol.flags & ts.SymbolFlags.EnumMember) {
            return true;
        }
        if (tsType.flags & ts.TypeFlags.EnumLiteral) {
            return true;
        }

        // enums disguised as union
        if (tsType.isUnion() && (tsType as ts.UnionType).types.length > 0) {
            let isEnum = true;
            for (const t of (tsType as ts.UnionType).types) {
                if (
                    !t.symbol ||
                    (!(t.symbol.flags & ts.SymbolFlags.Enum) && !(t.symbol.flags & ts.SymbolFlags.EnumMember))
                ) {
                    isEnum = false;
                    break;
                }
            }
            if (isEnum) {
                return true;
            }
        }

        return false;
    }

    public isInternal(node: ts.Node) {
        return !!ts.getJSDocTags(node).find(t => t.tagName.text === 'internal');
    }

    public getDelegatedName(tsSymbol: ts.Symbol | undefined): string | null {
        if (!tsSymbol || !tsSymbol.declarations) {
            return null;
        }

        for (const declaration of tsSymbol.declarations) {
            const delegation = ts
                .getJSDocTags(declaration)
                .find(t => t.tagName.text === 'delegated' && (t.comment as string)?.indexOf(this.targetTag) >= 0);
            if (delegation) {
                return (delegation.comment as string).substring(this.targetTag.length + 1);
            }
        }

        return null;
    }

    public get targetTag(): string {
        return 'csharp';
    }

    public rewriteVisibilities() {
        const visitedVisibility: Set<SymbolKey> = new Set();
        const visitedVirtual: Map<SymbolKey, boolean> = new Map();
        for (const kvp of this._symbolLookup) {
            const symbolKey = this.getSymbolKey(kvp[1].tsSymbol!);
            switch (kvp[1].nodeType) {
                case cs.SyntaxKind.ClassDeclaration:
                case cs.SyntaxKind.EnumDeclaration:
                case cs.SyntaxKind.InterfaceDeclaration:
                    const csType = kvp[1] as cs.NamedTypeDeclaration;
                    if (!visitedVisibility.has(symbolKey)) {
                        const shouldBePublic = !!ts
                            .getJSDocTags(csType.tsNode!)
                            .find(t => t.tagName.text === 'csharp_public');
                        if (csType.visibility === cs.Visibility.Public || shouldBePublic) {
                            if (this._exportedSymbols.has(symbolKey) || shouldBePublic) {
                                this.makePublic(csType, visitedVisibility);
                            } else {
                                csType.visibility = cs.Visibility.Internal;
                            }
                        }
                    }

                    if (this.makeVirtual(csType, visitedVirtual)) {
                        csType.hasVirtualMembersOrSubClasses = true;
                    }

                    break;
            }
        }
    }

    private makeVirtual(node: cs.Node, visited: Map<SymbolKey, boolean>): boolean {
        const x = this.getSymbolKey(this.getSymbolForDeclaration(node.tsNode!));
        if (visited.has(x)) {
            return visited.get(x)!;
        }

        let hasVirtualMember = false;

        switch (node.nodeType) {
            case cs.SyntaxKind.ClassDeclaration:
                const csClass = node as cs.ClassDeclaration;
                for (const m of csClass.members) {
                    if (this.makeVirtual(m, visited)) {
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

                const methodKey = this.getSymbolKey(csMethod.tsSymbol!);
                if (!csMethod.isOverride && this._virtualSymbols.has(methodKey)) {
                    csMethod.isVirtual = true;
                    hasVirtualMember = true;
                }

                break;

            case cs.SyntaxKind.PropertyDeclaration:
                const csProperty = node as cs.PropertyDeclaration;

                const propKey = this.getSymbolKey(csProperty.tsSymbol!);
                if (!csProperty.isOverride && this._virtualSymbols.has(propKey)) {
                    csProperty.isVirtual = true;
                    hasVirtualMember = true;
                }

                break;
        }

        visited.set(x, hasVirtualMember);

        return hasVirtualMember;
    }

    private makePublic(node: cs.Node, visited: Set<SymbolKey>) {
        if (node.tsSymbol) {
            const x = this.getSymbolKey(node.tsSymbol);
            if (visited.has(x)) {
                return;
            }
            visited.add(x);
        }

        switch (node.nodeType) {
            case cs.SyntaxKind.ClassDeclaration:
                const csClass = node as cs.ClassDeclaration;
                csClass.visibility = cs.Visibility.Public;

                if (csClass.baseClass) {
                    this.makePublic(csClass.baseClass, visited);
                }

                if (csClass.interfaces) {
                    for (const i of csClass.interfaces) {
                        this.makePublic(i, visited);
                    }
                }

                for (const m of csClass.members) {
                    if (m.visibility === cs.Visibility.Public || m.visibility === cs.Visibility.Protected) {
                        this.makePublic(m, visited);
                    }
                }
                break;
            case cs.SyntaxKind.EnumDeclaration:
                const csEnum = node as cs.EnumDeclaration;
                csEnum.visibility = cs.Visibility.Public;
                break;
            case cs.SyntaxKind.InterfaceDeclaration:
                const csInterface = node as cs.InterfaceDeclaration;
                csInterface.visibility = cs.Visibility.Public;

                if (csInterface.interfaces) {
                    for (const i of csInterface.interfaces) {
                        this.makePublic(i, visited);
                    }
                }

                for (const m of csInterface.members) {
                    this.makePublic(m, visited);
                }

                break;

            case cs.SyntaxKind.ConstructorDeclaration:
                const csConstructor = node as cs.ConstructorDeclaration;
                for (const p of csConstructor.parameters) {
                    this.makePublic(p, visited);
                }
                break;
            case cs.SyntaxKind.MethodDeclaration:
                const csMethod = node as cs.MethodDeclaration;
                for (const p of csMethod.parameters) {
                    this.makePublic(p, visited);
                }
                this.makePublic(csMethod.returnType, visited);
                break;
            case cs.SyntaxKind.PropertyDeclaration:
                const csProperty = node as cs.PropertyDeclaration;
                this.makePublic(csProperty.type, visited);
                break;
            case cs.SyntaxKind.ParameterDeclaration:
                const csParameter = node as cs.ParameterDeclaration;
                if (csParameter.type) {
                    this.makePublic(csParameter.type, visited);
                }
                break;
            case cs.SyntaxKind.TypeReference:
                const csTypeRef = node as cs.TypeReference;
                if (csTypeRef.typeArguments) {
                    for (const r of csTypeRef.typeArguments) {
                        this.makePublic(r, visited);
                    }
                }
                if (typeof csTypeRef.reference !== 'string') {
                    this.makePublic(csTypeRef.reference, visited);
                }

                break;
            case cs.SyntaxKind.ArrayTypeNode:
                const csArrayType = node as cs.ArrayTypeNode;
                if (csArrayType.elementType) {
                    this.makePublic(csArrayType.elementType, visited);
                }
                break;
            case cs.SyntaxKind.MapTypeNode:
                const mapType = node as cs.MapTypeNode;
                if (mapType.keyType) {
                    this.makePublic(mapType.keyType, visited);
                }
                if (mapType.valueType) {
                    this.makePublic(mapType.valueType, visited);
                }
                break;
        }
    }

    public isStaticSymbol(tsSymbol: ts.Symbol) {
        return (
            (tsSymbol.flags & ts.SymbolFlags.EnumMember) !== 0 ||
            !!tsSymbol.declarations?.find(
                d =>
                    'modifiers' in d &&
                    d.modifiers &&
                    !!(d.modifiers as ts.NodeArray<ts.Modifier>).find(m => m.kind === ts.SyntaxKind.StaticKeyword)
            )
        );
    }

    public isNullableString(type: ts.Type) {
        if (type.isUnion()) {
            type = this.typeChecker.getNonNullableType(type);
        }
        return type.flags & ts.TypeFlags.String || type.flags & ts.TypeFlags.StringLiteral;
    }

    public getDefaultUsings(): string[] {
        return [this.toPascalCase('system'), `${this.toPascalCase('alphaTab')}.${this.toPascalCase('core')}`];
    }

    public buildMethodName(propertyName: ts.PropertyName) {
        let methodName: string = '';
        if (ts.isIdentifier(propertyName)) {
            methodName = propertyName.text;
        } else if (ts.isComputedPropertyName(propertyName)) {
            if (ts.isPropertyAccessExpression(propertyName.expression)) {
                const symbol = this.getSymbolForDeclaration(propertyName.expression);
                if (symbol) {
                    methodName = this.getMethodNameFromSymbol(symbol);
                }
            } else if (ts.isStringLiteral(propertyName)) {
                methodName = (propertyName as ts.StringLiteral).text;
            } else {
                methodName = `<invalid method name ${propertyName.getText()}>`;
                this.addTsNodeDiagnostics(propertyName, 'Unsupported method name syntax', ts.DiagnosticCategory.Error);
            }
        } else if (ts.isStringLiteral(propertyName)) {
            methodName = propertyName.text;
        } else if (ts.isPrivateIdentifier(propertyName)) {
            methodName = propertyName.text.substring(1);
        }

        if (!methodName) {
            methodName = `<invalid method name ${propertyName.getText()}>`;
            this.addTsNodeDiagnostics(propertyName, 'Unsupported method name syntax', ts.DiagnosticCategory.Error);
        }

        return this.toMethodName(methodName);
    }
}
