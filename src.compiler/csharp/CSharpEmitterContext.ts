import * as cs from './CSharpAst';
import * as ts from 'typescript';

export default class CSharpEmitterContext {
    private _fileLookup: Map<ts.SourceFile, cs.SourceFile> = new Map();
    private _symbolLookup: Map<ts.Symbol, cs.Node> = new Map();

    private _diagnostics: ts.Diagnostic[] = [];
    private _program: ts.Program;
    private _typeChecker: ts.TypeChecker;

    public csharpFiles: cs.SourceFile[] = [];
    public get compilerOptions(): ts.CompilerOptions {
        return this._program.getCompilerOptions();
    }
    public get diagnostics(): readonly ts.Diagnostic[] {
        return this._diagnostics;
    }
    public hasErrors: boolean = false;

    public getType(n: ts.Node): ts.Type {
        return this._typeChecker.getTypeAtLocation(n);
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
        this._typeChecker = program.getTypeChecker();
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
        return <cs.TypeReference>{
            tsNode: node.tsNode,
            nodeType: cs.SyntaxKind.TypeReference,
            parent: node.parent,
            reference: <cs.PrimitiveTypeNode>{
                isNullable: false,
                nodeType: cs.SyntaxKind.PrimitiveTypeNode,
                parent: null,
                type: cs.PrimitiveType.Number
            }
        };
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

    public registerSymbol(node: cs.Node) {
        if (node.tsNode) {
            const symbol = this._typeChecker.getSymbolAtLocation(node.tsNode);
            if (symbol) {
                this._symbolLookup.set(symbol, node);
            }
        }
    }
}