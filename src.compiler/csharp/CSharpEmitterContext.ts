import * as cs from './CSharpAst';
import * as ts from 'typescript';
import * as path from 'path';
import { indexOf } from 'lodash';

type SymbolKey = string;

export default class CSharpEmitterContext {
    private _fileLookup: Map<ts.SourceFile, cs.SourceFile> = new Map();
    private _symbolLookup: Map<SymbolKey, cs.NamedElement & cs.Node> = new Map();
    private _exportedSymbols: Map<SymbolKey, boolean> = new Map();
    private _symbolConst: Map<SymbolKey, boolean> = new Map();

    private _diagnostics: ts.Diagnostic[] = [];
    private _unresolvedTypeNodes: cs.UnresolvedTypeNode[] = [];
    private _program: ts.Program;
    public typeChecker: ts.TypeChecker;

    public csharpFiles: cs.SourceFile[] = [];
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

    public isTypeAssignable(targetType: ts.Type, actualType: ts.Type) {
        if (targetType.flags === ts.TypeFlags.Any || targetType.flags === ts.TypeFlags.Unknown) {
            return true;
        }
        if (actualType.isClassOrInterface()) {
            return (this.typeChecker as any).isTypeAssignableTo(actualType, targetType);
        }
        return false;
    }

    public registerUnresolvedTypeNode(unresolved: cs.UnresolvedTypeNode) {
        this._unresolvedTypeNodes.push(unresolved);
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
                    case cs.SyntaxKind.DelegateDeclaration:
                        return this.getFullName(csSymbol as cs.NamedTypeDeclaration);
                }
                return csSymbol.name;
            } else if (
                expr.tsSymbol.flags & ts.SymbolFlags.Class ||
                expr.tsSymbol.flags & ts.SymbolFlags.Interface ||
                expr.tsSymbol.flags & ts.SymbolFlags.ConstEnum ||
                expr.tsSymbol.flags & ts.SymbolFlags.RegularEnum
            ) {
                return this.buildCoreNamespace(expr.tsSymbol) + expr.tsSymbol.name;
            } else if (expr.tsSymbol.flags & ts.SymbolFlags.Function) {
                if (this.isTestFunction(expr.tsSymbol)) {
                    return 'AlphaTab.Test.Globals.' + this.toPascalCase(expr.tsSymbol.name);
                }
                return 'AlphaTab.Core.Globals.' + this.toPascalCase(expr.tsSymbol.name);
            } else if (
                (expr.tsSymbol.flags & ts.SymbolFlags.FunctionScopedVariable && this.isGlobalVariable(expr.tsSymbol)) ||
                (expr.tsSymbol.flags & ts.SymbolFlags.NamespaceModule && this.isKnownModule(expr.tsSymbol))
            ) {
                return 'AlphaTab.Core.Globals.' + this.toPascalCase(expr.tsSymbol.name);
            }
        }
        return undefined;
    }
    private isTestFunction(tsSymbol: ts.Symbol): boolean {
        return tsSymbol.valueDeclaration?.getSourceFile().fileName.indexOf('jasmine') !== -1 ?? false;
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

    public getFullName(type: cs.NamedTypeDeclaration): string {
        if (!type.parent) {
            return '';
        }
        switch (type.parent.nodeType) {
            case cs.SyntaxKind.ClassDeclaration:
            case cs.SyntaxKind.InterfaceDeclaration:
            case cs.SyntaxKind.EnumDeclaration:
            case cs.SyntaxKind.DelegateDeclaration:
                return this.getFullName(type.parent as cs.NamedTypeDeclaration) + '.' + type.name;
            case cs.SyntaxKind.NamespaceDeclaration:
                return (type.parent as cs.NamespaceDeclaration).namespace + '.' + type.name;
        }
        return '';
    }

    public resolveAllUnresolvedTypeNodes() {
        for (let node of this._unresolvedTypeNodes) {
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
            code: 1,
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
        this._fileLookup.set(csharpFile.tsNode as ts.SourceFile, csharpFile);
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
            resolved = this.getTypeFromTsType(node, node.tsType, node.tsSymbol, node.typeArguments);
        }

        if (resolved) {
            const wasOptional = node.isOptional;
            const wasNullable = node.isNullable;
            for (const prop of Object.getOwnPropertyNames(node)) {
                delete (node as any)[prop];
            }
            for (const prop of Object.getOwnPropertyNames(resolved)) {
                (node as any)[prop] = (resolved as any)[prop];
            }
            if (wasOptional) {
                node.isOptional = true;
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
        typeArguments?: cs.UnresolvedTypeNode[]
    ): cs.TypeNode | null {
        let csType: cs.TypeNode | null = this.resolveKnownTypeSymbol(node, tsType, typeArguments);
        if (csType) {
            return csType;
        }

        csType = this.resolvePrimitiveType(node, tsType);
        if (csType) {
            return csType;
        }

        csType = this.resolveUnionType(node, tsType, typeArguments);
        if (csType) {
            return csType;
        }

        csType = this.resolveUnknownTypeSymbol(node, tsType, tsSymbol, typeArguments);

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

        // some built in type handling
        switch (tsSymbol.name) {
            case 'Promise':
                const promiseType = tsType as ts.TypeReference;
                if (typeArguments) {
                    return typeArguments[0];
                } else if (promiseType.typeArguments) {
                    return this.getTypeFromTsType(node, promiseType.typeArguments[0]);
                }
                return null;
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

                let isValueType = false;
                if (mapValueType) {
                    switch (mapValueType.nodeType) {
                        case cs.SyntaxKind.PrimitiveTypeNode:
                            switch ((mapValueType as cs.PrimitiveTypeNode).type) {
                                case cs.PrimitiveType.Bool:
                                case cs.PrimitiveType.Int:
                                case cs.PrimitiveType.Double:
                                    isValueType = true;
                                    break;
                            }
                            break;
                        case cs.SyntaxKind.TypeReference:
                            const ref = (mapValueType as cs.TypeReference).reference;
                            if (typeof ref !== 'string') {
                                switch (ref.nodeType) {
                                    case cs.SyntaxKind.EnumDeclaration:
                                        isValueType = true;
                                        break;
                                }
                            }
                            break;
                    }
                }

                return {
                    nodeType: cs.SyntaxKind.TypeReference,
                    parent: node.parent,
                    tsNode: node.tsNode,
                    reference: this.buildCoreNamespace(tsSymbol) + (isValueType ? 'ValueTypeMap' : 'Map'),
                    typeArguments: [mapKeyType, mapValueType]
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

                return {
                    nodeType: cs.SyntaxKind.ArrayTypeNode,
                    parent: node.parent,
                    tsNode: node.tsNode,
                    elementType: arrayElementType
                } as cs.ArrayTypeNode;

            case ts.InternalSymbolName.Type:
                let csType: cs.TypeNode | null = null;

                csType = this.resolveFunctionTypeFromTsType(node, tsType);

                return csType;

            default:
                return {
                    nodeType: cs.SyntaxKind.TypeReference,
                    parent: node.parent,
                    tsNode: node.tsNode,
                    reference: this.buildCoreNamespace(tsSymbol) + tsSymbol.name,
                    typeArguments: typeArguments
                } as cs.TypeReference;
        }
    }

    private resolveFunctionTypeFromTsType(node: cs.Node, tsType: ts.Type): cs.TypeNode | null {
        // typescript compiler API somehow does not provide proper type symbols
        // for function types, we need to attempt resolving the types via the function type declaration

        if (!tsType.symbol || !tsType.symbol.declarations) {
            return null;
        }

        let functionTypeNode: ts.FunctionTypeNode | null = null;
        for (const declaration of tsType.symbol.declarations) {
            if (ts.isFunctionTypeNode(declaration)) {
                functionTypeNode = declaration;
                break;
            }
        }

        if (!functionTypeNode) {
            return null;
        }

        const typeNodeToCsType = (typeNode: ts.TypeNode) => {
            const nodeTsType = this.typeChecker.getTypeAtLocation(typeNode);
            if (!nodeTsType) {
                return null;
            }

            const nodeType = this.getTypeFromTsType(node, nodeTsType);
            if (!nodeType) {
                return null;
            }

            return nodeType;
        };

        const returnType = typeNodeToCsType(functionTypeNode.type);
        if (!returnType) {
            this.addTsNodeDiagnostics(
                functionTypeNode.type,
                'Could not resolve return type',
                ts.DiagnosticCategory.Error
            );
            return null;
        }

        const parameterTypes: cs.TypeNode[] = [];
        for (const p of functionTypeNode.parameters) {
            const symbol = this.typeChecker.getSymbolAtLocation(p.name);
            if (!symbol) {
                this.addTsNodeDiagnostics(p, 'Could not resolve symbol for parameter', ts.DiagnosticCategory.Error);
                return null;
            }

            const pTsType = this.typeChecker.getTypeOfSymbolAtLocation(symbol, p);
            if (!pTsType) {
                this.addTsNodeDiagnostics(p, 'Could not resolve type for parameter', ts.DiagnosticCategory.Error);
                return null;
            }

            const pType = this.getTypeFromTsType(node, pTsType);
            if (!pType) {
                this.addTsNodeDiagnostics(p, 'Could not map type for parameter', ts.DiagnosticCategory.Error);
                return null;
            }

            parameterTypes.push(pType);
        }

        let typeParameters: cs.TypeNode[] | undefined = undefined;
        if (functionTypeNode.typeParameters) {
            typeParameters = [];
            for (const tp of functionTypeNode.typeParameters) {
                const tpTsType = this.typeChecker.getTypeAtLocation(tp);
                if (!tpTsType) {
                    this.addTsNodeDiagnostics(tp, 'Could not resolve type parameter', ts.DiagnosticCategory.Error);
                    return null;
                }

                const tpType = this.getTypeFromTsType(node, tpTsType);
                if (!tpType) {
                    this.addTsNodeDiagnostics(tp, 'Could not map type parameter', ts.DiagnosticCategory.Error);
                    return null;
                }

                typeParameters.push(tpType);
            }
        }

        if (
            returnType.nodeType === cs.SyntaxKind.PrimitiveTypeNode &&
            (returnType as cs.PrimitiveTypeNode).type === cs.PrimitiveType.Void
        ) {
            return {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: node.parent,
                tsNode: node.tsNode,
                reference: 'System.Action',
                typeArguments: parameterTypes
            } as cs.TypeReference;
        } else {
            parameterTypes.push(returnType);
            return {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: node.parent,
                tsNode: node.tsNode,
                reference: 'System.Func',
                typeArguments: parameterTypes
            } as cs.TypeReference;
        }
    }

    private resolveUnionType(parent: cs.Node, tsType: ts.Type, typeArguments?: cs.UnresolvedTypeNode[]): cs.TypeNode | null {
        if (!tsType.isUnion()) {
            return null;
        }

        // external union type alias, refer by name
        if (!tsType.symbol && tsType.aliasSymbol) {
            let isNullable = false;
            let isOptional = false;
            for (let t of tsType.types) {
                if ((t.flags & ts.TypeFlags.Null) !== 0) {
                    isNullable = true;
                } else if ((t.flags & ts.TypeFlags.Undefined) !== 0) {
                    isOptional = true;
                }
            }

            return {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: parent,
                reference: this.buildCoreNamespace(tsType.aliasSymbol) + tsType.aliasSymbol.name,
                isNullable: isNullable,
                isOptional: isOptional
            } as cs.TypeReference;
        }

        let isNullable = false;
        let isOptional = false;
        let actualType: ts.Type | null = null;
        let fallbackToObject = false;
        for (let t of tsType.types) {
            if (t.isLiteral()) {
                t = this.typeChecker.getBaseTypeOfLiteralType(t);
            }

            if ((t.flags & ts.TypeFlags.Null) !== 0) {
                isNullable = true;
            } else if ((t.flags & ts.TypeFlags.Undefined) !== 0) {
                isOptional = true;
            } else if (actualType == null) {
                actualType = t;
            } else if (actualType != null && actualType.flags !== t.flags) {
                let isEmitted = this.isNodeEmitted(parent);
                if (isEmitted) {
                    this.addCsNodeDiagnostics(
                        parent,
                        'Union type covering multiple types detected, fallback to dynamic',
                        ts.DiagnosticCategory.Warning
                    );
                }
                fallbackToObject = true;
            } else {
                actualType = t;
            }
        }

        if (fallbackToObject) {
            return {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                parent: parent,
                type: cs.PrimitiveType.Dynamic,
                isNullable: isNullable,
                isOptional: isOptional
            } as cs.PrimitiveTypeNode;
        }

        if (!actualType) {
            return null;
        }
        const type = this.getTypeFromTsType(parent, actualType, undefined, typeArguments);
        return {
            nodeType: cs.SyntaxKind.TypeReference,
            parent: parent,
            reference: type,
            isNullable: isNullable,
            isOptional: isOptional
        } as cs.TypeReference;
    }
    
    private isNodeEmitted(node: cs.Node): boolean {
        if ('skipEmit' in node && node.skipEmit as boolean) {
            return false;
        } else if (node.parent) {
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
            let isOptional = false;
            if (tsType.isUnion()) {
                for (const t of tsType.types) {
                    if ((t.flags & ts.TypeFlags.Null) !== 0) {
                        isNullable = true;
                    } else if ((t.flags & ts.TypeFlags.Undefined) !== 0) {
                        isOptional = true;
                    }
                }
            }

            return {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                type: type,
                isNullable: isNullable,
                isOptional: isOptional
            } as cs.PrimitiveTypeNode;
        };

        // raw object without symbol -> dynamic
        if ((tsType.flags & ts.TypeFlags.Object) !== 0 && !tsType.symbol) {
            return handleNullablePrimitive(cs.PrimitiveType.Dynamic);
        }

        // any -> dynamic
        if ((tsType.flags & ts.TypeFlags.Any) !== 0) {
            return handleNullablePrimitive(cs.PrimitiveType.Dynamic);
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

        // never -> dynamic
        // (actually it would be void for usages on return values, but we rather have it as array element type on empty arrays)
        if ((tsType.flags & ts.TypeFlags.Never) !== 0) {
            return {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                type: cs.PrimitiveType.Dynamic
            } as cs.PrimitiveTypeNode;
        }

        return null;
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
                typeArguments.forEach(a => {
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
                });
            } else {
                const tsTypeArguments = (tsType as ts.TypeReference).typeArguments;
                if (tsTypeArguments) {
                    reference.typeArguments = [];
                    tsTypeArguments.forEach(a => {
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
                    });
                }
            }

            return reference;
        } else if (tsType.isTypeParameter()) {
            return {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: node.parent,
                tsNode: node.tsNode,
                reference: tsType.symbol.name
            } as cs.TypeReference;
        }

        return null;
    }

    private buildCoreNamespace(aliasSymbol: ts.Symbol) {
        let suffix = '';
        for (const decl of aliasSymbol.declarations) {
            let fileName = path.basename(decl.getSourceFile().fileName).toLowerCase();
            if (fileName.startsWith('lib.') && fileName.endsWith('.d.ts')) {
                fileName = fileName.substring(4, fileName.length - 5);
                if (fileName.length) {
                    suffix = fileName.split('.').map(s => {
                        if (s.match(/es[0-9]{4}/)) {
                            return '.EcmaScript';
                        }
                        if (s.match(/es[0-9]{1}/)) {
                            return '.EcmaScript';
                        }
                        return '.' + this.toPascalCase(s);
                    })[0];
                }
            }
        }
        return `AlphaTab.Core${suffix}.`;
    }

    public toPascalCase(text: string): string {
        if (text.indexOf('-') >= 0) {
            return this.kebabCaseToPascalCase(text);
        }

        return text ? text.substr(0, 1).toUpperCase() + text.substr(1) : '';
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
            return symbol.name + '_' + declaration.getSourceFile().fileName + '_' + declaration.pos;
        } else {
            return symbol.name;
        }
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
        if (!symbol || !symbol.declarations || symbol.declarations.length === 0) {
            return undefined;
        }
        if (symbol.flags & ts.SymbolFlags.Alias) {
            symbol = this.typeChecker.getAliasedSymbol(symbol);
        }
        if (symbol.flags & ts.SymbolFlags.Interface || symbol.flags & ts.SymbolFlags.Class) {
            return undefined;
        }

        // declared type must be nullable
        let declaredType = this.typeChecker.getTypeAtLocation(symbol.declarations[0]);
        if (!this.isNullableType(declaredType)) {
            return undefined;
        }

        // actual type at location must be non nullable
        let declaredTypeNonNull = this.typeChecker.getNonNullableType(declaredType);
        let contextualType = this.typeChecker.getTypeOfSymbolAtLocation(symbol, expression);
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

    public getSmartCastType(expression: ts.Expression): ts.Type | null {
        // if the parent is already casting, we have no "smart" cast.
        if (expression.parent.kind === ts.SyntaxKind.AsExpression) {
            return null;
        }

        // For Enum[value] we do not smart cast value to a number
        if (ts.isElementAccessExpression(expression.parent) &&
            expression.parent.argumentExpression === expression) {
            return null;
        }

        // we consider the expression as smart casted if the declared symbol has a different
        // contextual type than the declared type.
        let symbol = this.typeChecker.getSymbolAtLocation(expression);
        if (!symbol || !symbol.declarations || symbol.declarations.length === 0) {
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

        let declaredType = this.typeChecker.getTypeAtLocation(symbol.declarations[0]);

        let contextualTypeNullable = contextualType;
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

        return contextualType !== declaredType && !this.isTypeAssignable(contextualType, declaredType)
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

    public isOverride(classElement: ts.ClassElement): boolean {
        let parent: ts.Node = classElement;
        while (parent.kind !== ts.SyntaxKind.ClassDeclaration) {
            if (parent.parent) {
                parent = parent.parent;
            } else {
                return false;
            }
        }

        let classDecl = parent as ts.ClassDeclaration;
        let classSymbol = this.typeChecker.getSymbolAtLocation(classDecl.name!);
        if (!classSymbol) {
            return false;
        }

        let classType = this.typeChecker.getDeclaredTypeOfSymbol(classSymbol);
        if (!classType || !classType.isClass()) {
            return false;
        }

        if (this.hasAnyBaseTypeClassMember(classType, classElement.name!.getText())) {
            return true;
        }

        return false;
    }
    private hasAnyBaseTypeClassMember(classType: ts.InterfaceType, memberName: string) {
        const baseTypes = classType.getBaseTypes();
        if (!baseTypes) {
            return false;
        }

        for (const baseType of baseTypes) {
            if (baseType.isClass() && this.hasClassMember(baseType, memberName)) {
                return true;
            }
        }

        return false;
    }

    private hasClassMember(baseType: ts.InterfaceType, name: string): boolean {
        if (
            baseType.symbol &&
            baseType.symbol.members &&
            baseType.symbol.members.has(ts.escapeLeadingUnderscores(name))
        ) {
            return true;
        }

        return this.hasAnyBaseTypeClassMember(baseType, name);
    }

    public isValueTypeExpression(expression: ts.NonNullExpression) {
        const tsType = this.typeChecker.getTypeAtLocation(expression);
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

        // enums
        if (tsType.symbol && tsType.symbol.flags & ts.SymbolFlags.Enum) {
            return true;
        }

        return false;
    }

    public rewriteVisibilities() {
        const visited: Set<SymbolKey> = new Set();
        for (const kvp of this._symbolLookup) {
            const symbolKey = this.getSymbolKey(kvp[1].tsSymbol!);
            switch (kvp[1].nodeType) {
                case cs.SyntaxKind.ClassDeclaration:
                case cs.SyntaxKind.DelegateDeclaration:
                case cs.SyntaxKind.EnumDeclaration:
                case cs.SyntaxKind.InterfaceDeclaration:
                    if (!visited.has(symbolKey)) {
                        const csType = kvp[1] as cs.NamedTypeDeclaration;
                        const shouldBePublic = !!ts.getJSDocTags(csType.tsNode!).find(t => t.tagName.text === 'csharp_public');
                        if (csType.visibility === cs.Visibility.Public || shouldBePublic) {
                            if (this._exportedSymbols.has(symbolKey) || shouldBePublic) {
                                this.makePublic(csType, visited);
                            } else {
                                csType.visibility = cs.Visibility.Internal;
                            }
                        }
                    }
                    break;
            }
        }
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
                    csClass.interfaces.forEach(i => this.makePublic(i, visited));
                }

                csClass.members.forEach(m => {
                    if (m.visibility == cs.Visibility.Public || m.visibility == cs.Visibility.Protected) {
                        this.makePublic(m, visited)
                    }
                });
                break;
            case cs.SyntaxKind.EnumDeclaration:
                const csEnum = node as cs.EnumDeclaration;
                csEnum.visibility = cs.Visibility.Public;
                break;
            case cs.SyntaxKind.InterfaceDeclaration:
                const csInterface = node as cs.InterfaceDeclaration;
                csInterface.visibility = cs.Visibility.Public;

                if (csInterface.interfaces) {
                    csInterface.interfaces.forEach(i => this.makePublic(i, visited));
                }

                csInterface.members.forEach(m => {
                    this.makePublic(m, visited)
                });

                break;

            case cs.SyntaxKind.ConstructorDeclaration:
                const csConstructor = node as cs.ConstructorDeclaration;
                csConstructor.parameters.forEach(p => this.makePublic(p, visited));
                break;
            case cs.SyntaxKind.MethodDeclaration:
                const csMethod = node as cs.MethodDeclaration;
                csMethod.parameters.forEach(p => this.makePublic(p, visited));
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
                    csTypeRef.typeArguments.forEach(r => this.makePublic(r, visited));
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
        }
    }

    public isStaticSymbol(tsSymbol: ts.Symbol) {
        return !!tsSymbol.declarations.find(d => d.modifiers &&
            !!d.modifiers.find(m => m.kind === ts.SyntaxKind.StaticKeyword)
        );
    }

    public isNullableString(type: ts.Type) {
        if (type.isUnion()) {
            type = this.typeChecker.getNonNullableType(type);
        }
        return ((type.flags & ts.TypeFlags.String) || (type.flags & ts.TypeFlags.StringLiteral));
    }
}
