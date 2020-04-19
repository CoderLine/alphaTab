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
        if (!node.tsNode) {
            throw new Error('Node must be set for all types');
        }

        let resolved: cs.TypeNode | null = null;
        if (node.tsType) {
            resolved = this.getTypeFromTsType(node, node.tsType);
        }

        if (!resolved) {
            resolved = this.getTypeFromTsNode(node.parent!, node.tsNode);
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
    private getTypeFromTsType(parent: cs.Node, tsType: ts.Type, handleUnion: boolean = false): cs.TypeNode | null {
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

        if (tsType.symbol && this._symbolLookup.has(tsType.symbol)) {
            const declaration = this._symbolLookup.get(tsType.symbol)!;
            return {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: parent,
                reference: declaration
            } as cs.TypeReference;
        } else if ((tsType.flags & ts.TypeFlags.Object) !== 0) {
            return handleNullablePrimitive(cs.PrimitiveType.Dynamic);
        } else if ((tsType.flags & ts.TypeFlags.Any) !== 0) {
            return handleNullablePrimitive(cs.PrimitiveType.Dynamic);
        } else if ((tsType.flags & ts.TypeFlags.Unknown) !== 0) {
            return handleNullablePrimitive(cs.PrimitiveType.Dynamic);
        } else if ((tsType.flags & ts.TypeFlags.Number) !== 0 || (tsType.flags & ts.TypeFlags.NumberLiteral) !== 0) {
            return handleNullablePrimitive(cs.PrimitiveType.Number);
        } else if ((tsType.flags & ts.TypeFlags.String) !== 0 || (tsType.flags & ts.TypeFlags.StringLiteral) !== 0) {
            return handleNullablePrimitive(cs.PrimitiveType.String);
        } else if ((tsType.flags & ts.TypeFlags.Boolean) !== 0 || (tsType.flags & ts.TypeFlags.BooleanLiteral) !== 0) {
            return handleNullablePrimitive(cs.PrimitiveType.Boolean);
        } else if (tsType.isUnion() && handleUnion) {
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
            } else {
                let isNullable = false;
                let isOptional = false;
                let actualType: ts.Type | null = null;
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
                    } else if (actualType != null && actualType !== t) {
                        this.addCsNodeDiagnostics(
                            parent,
                            'Union types are only allowed if they flag another type as nullable',
                            ts.DiagnosticCategory.Error
                        );
                    } else {
                        actualType = t;
                    }
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
        } else if ((tsType.flags & ts.TypeFlags.Void) !== 0) {
            return {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                type: cs.PrimitiveType.Void
            } as cs.PrimitiveTypeNode;
        } else if (tsType.symbol) {
            // some built in type handling
            switch (tsType.symbol.name) {
                case 'Error':
                    return {
                        nodeType: cs.SyntaxKind.TypeReference,
                        parent: parent,
                        reference: 'System.Exception'
                    } as cs.TypeReference;
                case 'Array':
                    return null;
                case ts.InternalSymbolName.Type:
                    return null;
                default:
                    return {
                        nodeType: cs.SyntaxKind.TypeReference,
                        parent: parent,
                        reference: this.buildCoreNamespace(tsType.symbol) + tsType.symbol.name
                    } as cs.TypeReference;
            }
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

    private getTypeFromTsNode(parent: cs.Node, tsNode: ts.Node): cs.TypeNode | null {
        if (ts.isArrayTypeNode(tsNode)) {
            return {
                nodeType: cs.SyntaxKind.ArrayTypeNode,
                parent: parent,
                tsNode: tsNode,
                elementType: this.getTypeFromTsNode(parent, tsNode.elementType)
            } as cs.ArrayTypeNode;
        }

        if (ts.isTypeReferenceNode(tsNode)) {
            if (ts.isIdentifier(tsNode.typeName) && tsNode.typeName.text === 'Array' && tsNode.typeArguments) {
                return {
                    nodeType: cs.SyntaxKind.ArrayTypeNode,
                    parent: parent,
                    tsNode: tsNode,
                    elementType: this.getTypeFromTsNode(parent, tsNode.typeArguments[0])
                } as cs.ArrayTypeNode;
            }
        }

        if (ts.isExpressionWithTypeArguments(tsNode)) {
            if (ts.isIdentifier(tsNode.expression) && tsNode.expression.text === 'Array' && tsNode.typeArguments) {
                return {
                    nodeType: cs.SyntaxKind.ArrayTypeNode,
                    parent: parent,
                    tsNode: tsNode,
                    elementType: this.getTypeFromTsNode(parent, tsNode.typeArguments[0])
                } as cs.ArrayTypeNode;
            }
        }

        if (ts.isParenthesizedTypeNode(tsNode)) {
            return this.getTypeFromTsNode(parent, tsNode.type);
        }

        if (ts.isUnionTypeNode(tsNode)) {
            let isNullable = false;
            let isOptional = false;
            let actualType: ts.TypeNode | null = null;
            for (const t of tsNode.types) {
                if (t.kind === ts.SyntaxKind.NullKeyword) {
                    isNullable = true;
                } else if (t.kind === ts.SyntaxKind.UndefinedKeyword) {
                    isOptional = true;
                } else if (actualType == null) {
                    actualType = t;
                } else if (actualType != null) {
                    this.addCsNodeDiagnostics(
                        parent,
                        'Union types are only allowed if they flag another type as nullable',
                        ts.DiagnosticCategory.Error
                    );
                } else {
                    actualType = t;
                }
            }

            if (!actualType) {
                return null;
            }

            const type = this.getTypeFromTsNode(parent, actualType);
            return {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: parent,
                reference: type,
                isNullable: isNullable,
                isOptional: isOptional
            } as cs.TypeReference;
        }

        if (ts.isFunctionTypeNode(tsNode)) {
            const returnType = this.getTypeFromTsNode(parent, tsNode.type);
            if (!returnType) {
                return null;
            }

            const parameterTypes = tsNode.parameters.map(p => {
                const symbol = this.typeChecker.getSymbolAtLocation(p.name);
                const tsType = symbol ? this.typeChecker.getTypeOfSymbolAtLocation(symbol!, p) : null;
                let type: cs.TypeNode | null = null;
                if (tsType) {
                    type = this.getTypeFromTsType(parent, tsType);
                }
                type = this.getTypeFromTsNode(parent, p.type ?? p);
                if (!type) {
                    console.log('err');
                }
                return type;
            });

            if (
                returnType.nodeType === cs.SyntaxKind.PrimitiveTypeNode &&
                (returnType as cs.PrimitiveTypeNode).type === cs.PrimitiveType.Void
            ) {
                return {
                    nodeType: cs.SyntaxKind.TypeReference,
                    parent: parent,
                    tsNode: tsNode.type,
                    reference: 'System.Action',
                    typeArguments: parameterTypes
                } as cs.TypeReference;
            } else {
                parameterTypes.push(returnType);
                return {
                    nodeType: cs.SyntaxKind.TypeReference,
                    parent: parent,
                    tsNode: tsNode.type,
                    reference: 'System.Func',
                    typeArguments: parameterTypes
                } as cs.TypeReference;
            }
        }

        const tsType = this.typeChecker.getTypeAtLocation(tsNode);
        if (tsType) {
            const tsTypeResolved = this.getTypeFromTsType(parent, tsType, true);
            if (tsTypeResolved) {
                return tsTypeResolved;
            }
        }

        return null;
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
