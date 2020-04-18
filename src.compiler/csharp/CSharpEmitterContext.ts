import * as cs from './CSharpAst';
import * as ts from 'typescript';

export default class CSharpEmitterContext {
    private _fileLookup: Map<ts.SourceFile, cs.SourceFile> = new Map();
    private _symbolLookup: Map<ts.Symbol, cs.Node> = new Map();

    private _diagnostics: ts.Diagnostic[] = [];
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
        if (diagnostics.category == ts.DiagnosticCategory.Error) {
            this.hasErrors = true;
        }
    }

    public addSourceFile(csharpFile: cs.SourceFile) {
        this.csharpFiles.push(csharpFile);
        this._fileLookup.set(csharpFile.tsNode as ts.SourceFile, csharpFile);
    }

    public resolveType(node: cs.UnresolvedTypeNode): cs.TypeNode | null {
        // TODO: proper mapping of typescript types to c# types considering generics

        if (!node.tsNode) {
            throw new Error('Node must be set for all types');
        }

        if (node.tsType) {
            const resolvedType = this.getTypeFromTsType(node, node.tsType);
            if (resolvedType) {
                return resolvedType;
            }
        }

        return this.getTypeFromTsNode(node.parent, node.tsNode);
    }
    private getTypeFromTsType(parent: cs.Node, tsType: ts.Type): cs.TypeNode | null {
        if (tsType.symbol && this._symbolLookup.has(tsType.symbol)) {
            const declaration = this._symbolLookup.get(tsType.symbol)!;
            return {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: parent,
                reference: declaration
            } as cs.TypeReference;
        } else if ((tsType.flags & ts.TypeFlags.Any) !== 0) {
            return {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                isNullable: false,
                type: cs.PrimitiveType.Dynamic
            } as cs.PrimitiveTypeNode;
        } else if ((tsType.flags & ts.TypeFlags.Unknown) !== 0) {
            return {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                isNullable: false,
                type: cs.PrimitiveType.Object
            } as cs.PrimitiveTypeNode;
        } else if ((tsType.flags & ts.TypeFlags.Number) !== 0) {
            return {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                isNullable: false,
                type: cs.PrimitiveType.Number
            } as cs.PrimitiveTypeNode;
        } else if ((tsType.flags & ts.TypeFlags.String) !== 0) {
            return {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                isNullable: false,
                type: cs.PrimitiveType.String
            } as cs.PrimitiveTypeNode;
        } else if ((tsType.flags & ts.TypeFlags.Boolean) !== 0) {
            return {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                isNullable: false,
                type: cs.PrimitiveType.Boolean
            } as cs.PrimitiveTypeNode;
        } else if ((tsType.flags & ts.TypeFlags.Void) !== 0) {
            return {
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                isNullable: false,
                type: cs.PrimitiveType.Void
            } as cs.PrimitiveTypeNode;
        } else if ((tsType.flags & ts.TypeFlags.Union) !== 0) {
            const unionType: ts.UnionType = tsType as ts.UnionType;

            let isNullable = false;
            let actualType: ts.Type | null = null;
            for (const t of unionType.types) {
                if ((t.flags & ts.TypeFlags.Null) !== 0 || (t.flags & ts.TypeFlags.Undefined) !== 0) {
                    isNullable = true;
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

            if (!actualType || !actualType.symbol) {
                this.addCsNodeDiagnostics(parent, 'Error resolving type', ts.DiagnosticCategory.Error);
                return {
                    nodeType: cs.SyntaxKind.TypeReference,
                    parent: parent,
                    reference: 'RESOLVE_ERROR',
                } as cs.TypeReference;
            }

            const type = this.getTypeFromTsType(parent, actualType);

            return {
                nodeType: cs.SyntaxKind.TypeReference,
                parent: parent,
                reference: type,
            } as cs.TypeReference;
        }

        return null;
    }
    private getTypeFromTsNode(parent: cs.Node | null, tsNode: ts.Node): cs.TypeNode | null {
        if (ts.isArrayTypeNode(tsNode)) {
            return {
                nodeType: cs.SyntaxKind.ArrayTypeNode,
                parent: parent,
                tsNode: tsNode,
                elementType: this.getTypeFromTsNode(parent, tsNode.elementType)
            } as cs.ArrayTypeNode;
        }

        const tsType = this.typeChecker.getTypeAtLocation(tsNode);
        if (tsType && tsType.symbol && this._symbolLookup.has(tsType.symbol)) {
            return this.resolveType({
                nodeType: cs.SyntaxKind.UnresolvedTypeNode,
                parent: parent,
                tsNode: tsNode,
                tsType: tsType
            });
        }

        return {
            nodeType: cs.SyntaxKind.TypeReference,
            parent: parent,
            reference: 'RESOLVE_ERROR',
            tsNode: tsNode
        } as cs.TypeReference;

        // if (node.tsNode) {
        //     const symbol = this._typeChecker.getSymbolAtLocation(node.tsNode);
        //     if (symbol) {
        //         const node = this._symbolLookup.get(symbol);
        //         if (node) {
        //             switch (node.nodeType) {
        //                 case cs.SyntaxKind.ClassDeclaration:
        //                 case cs.SyntaxKind.EnumDeclaration:
        //                 case cs.SyntaxKind.InterfaceDeclaration:
        //                 case cs.SyntaxKind.:
        //                     break;
        //             }
        //         }
        //     }
        // }
        // return null;
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
