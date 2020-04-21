import * as cs from './CSharpAst';
import * as ts from 'typescript';
import * as path from 'path';

export default class CSharpEmitterContext {
    private _fileLookup: Map<ts.SourceFile, cs.SourceFile> = new Map();
    private _symbolLookup: Map<ts.Symbol, cs.Node> = new Map();

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

    public registerUnresolvedTypeNode(unresolved: cs.UnresolvedTypeNode) {
        this._unresolvedTypeNodes.push(unresolved);
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
        if(node.nodeType !== cs.SyntaxKind.UnresolvedTypeNode){
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
            for (const prop of Object.getOwnPropertyNames(node)) {
                delete (node as any)[prop];
            }
            for (const prop of Object.getOwnPropertyNames(resolved)) {
                (node as any)[prop] = (resolved as any)[prop];
            }
            node.isOptional = wasOptional;
            return node;
        }

        return null;
    }

    private getTypeFromTsType(node: cs.Node, tsType: ts.Type, tsSymbol?: ts.Symbol, typeArguments?: cs.UnresolvedTypeNode[]): cs.TypeNode | null {
        let csType: cs.TypeNode | null = this.resolveKnownTypeSymbol(node, tsType);
        if (csType) {
            return csType;
        }

        csType = this.resolvePrimitiveType(node, tsType);
        if (csType) {
            return csType;
        }

        csType = this.resolveUnionType(node, tsType);
        if (csType) {
            return csType;
        }

        csType = this.resolveUnknownTypeSymbol(node, tsType, tsSymbol, typeArguments);

        return csType;
    }

    private resolveUnknownTypeSymbol(node: cs.Node, tsType: ts.Type, tsSymbol?: ts.Symbol, typeArguments?: cs.UnresolvedTypeNode[]): cs.TypeNode | null {
        if (!tsSymbol) {
            tsSymbol = tsType.symbol;
        }

        if (!tsSymbol) {
            return null;
        }

        // some built in type handling
        switch (tsSymbol.name) {
            case 'Error':
                return {
                    nodeType: cs.SyntaxKind.TypeReference,
                    parent: node.parent,
                    tsNode: node.tsNode,
                    reference: 'System.Exception'
                } as cs.TypeReference;

            case 'Array':
                const arrayType = tsType as ts.TypeReference;
                let arrayElementType: cs.TypeNode | null = null;
                if(typeArguments) {
                    arrayElementType = this.resolveType(typeArguments[0]);
                } else if(arrayType.typeArguments) {
                    arrayElementType = this.getTypeFromTsType(node, arrayType.typeArguments[0]);
                }

                if(!arrayElementType) {
                    return null;
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
                    reference: this.buildCoreNamespace(tsSymbol) + tsSymbol.name
                } as cs.TypeReference;
        }
    }

    private resolveFunctionTypeFromTsType(node: cs.Node, tsType: ts.Type): cs.TypeNode | null {
        // typescript compiler API somehow does not provide proper type symbols
        // for function types, we need to attempt resolving the types via the function type declaration

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

    private resolveUnionType(parent: cs.Node, tsType: ts.Type): cs.TypeNode | null {
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
                this.addCsNodeDiagnostics(
                    parent,
                    'Union type covering multiple types detected, fallback to dynamic',
                    ts.DiagnosticCategory.Warning
                );
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
        const type = this.getTypeFromTsType(parent, actualType);
        return {
            nodeType: cs.SyntaxKind.TypeReference,
            parent: parent,
            reference: type,
            isNullable: isNullable,
            isOptional: isOptional
        } as cs.TypeReference;
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

        // unknown -> object
        if ((tsType.flags & ts.TypeFlags.Unknown) !== 0) {
            return handleNullablePrimitive(cs.PrimitiveType.Object);
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

        return null;
    }

    private resolveKnownTypeSymbol(node: cs.Node, tsType: ts.Type): cs.TypeNode | null {
        if (tsType.symbol && this._symbolLookup.has(tsType.symbol)) {
            const declaration = this._symbolLookup.get(tsType.symbol)!;
            const reference = {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: node.parent,
                tsNode: node.tsNode,
                reference: declaration
            } as cs.TypeReference;

            const typeArguments = (tsType as ts.TypeReference).typeArguments;
            if (typeArguments) {
                reference.typeArguments = [];
                typeArguments.forEach(a => {
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

            return reference;
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
                    suffix = fileName
                        .split('.')
                        .map(s => '.' + this.toPascalCase(s))
                        .join('');
                }
            }
        }
        return `AlphaTab.Core${suffix}.`;
    }

    public toPascalCase(text: string): string {
        return text ? text.substr(0, 1).toUpperCase() + text.substr(1) : '';
    }

    public registerSymbol(node: cs.Node, declaration: ts.Declaration) {
        if (node.tsNode) {
            const symbol = this.getSymbolForDeclaration(declaration);
            if (symbol) {
                this._symbolLookup.set(symbol, node);
            }
        }
    }

    private getSymbolForDeclaration(declaration: ts.Declaration): ts.Symbol | undefined {
        let symbol = this.typeChecker.getSymbolAtLocation(declaration);
        if (!symbol) {
            symbol = this.typeChecker.getSymbolAtLocation(ts.getNameOfDeclaration(declaration)!);
        }
        return symbol;
    }
}
