import * as cs from './CSharpAst';
import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import CSharpEmitterContext from './CSharpEmitterContext';

export default class CSharpAstPrinter {
    private _sourceFile: cs.SourceFile;
    private _fileHandle!: number;
    private _isStartOfLine: boolean = true;
    private _indent: number = 0;
    private _context: CSharpEmitterContext;

    public diagnostics: ts.Diagnostic[] = [];

    public constructor(sourceFile: cs.SourceFile, context: CSharpEmitterContext) {
        this._sourceFile = sourceFile;
        this._context = context;
    }

    public print() {
        fs.mkdirSync(path.dirname(this._sourceFile.fileName), { recursive: true });
        this._fileHandle = fs.openSync(this._sourceFile.fileName, 'w');
        try {
            this.writeSourceFile(this._sourceFile);
        } finally {
            fs.closeSync(this._fileHandle);
        }
    }

    private writeSourceFile(sourceFile: cs.SourceFile) {
        for (const using of sourceFile.usings) {
            this.writeUsing(using);
        }
        this.writeLine();
        this.writeNamespace(sourceFile.namespace);
    }

    private writeNamespace(namespace: cs.NamespaceDeclaration) {
        this.writeLine(`namespace ${namespace.namespace}`);
        this.beginBlock();

        for (const declaration of namespace.declarations) {
            switch (declaration.nodeType) {
                case cs.SyntaxKind.ClassDeclaration:
                    this.writeClassDeclaration(declaration as cs.ClassDeclaration);
                    break;
                case cs.SyntaxKind.EnumDeclaration:
                    this.writeEnumDeclaration(declaration as cs.EnumDeclaration);
                    break;
                case cs.SyntaxKind.InterfaceDeclaration:
                    this.writeInterfaceDeclaration(declaration as cs.InterfaceDeclaration);
                    break;
                case cs.SyntaxKind.DelegateDeclaration:
                    this.writeDelegateDeclaration(declaration as cs.DelegateDeclaration);
                    break;
            }
        }

        this.endBlock();
    }

    private writeDelegateDeclaration(d: cs.DelegateDeclaration) {
        this.writeDocumentation(d);
        this.writeVisibility(d.visibility);
        this.writeType(d.returnType);
        this.write(` ${d.name}`);
        this.writeTypeParameters(d.typeParameters);
        this.writeParameters(d.parameters);
        this.writeLine(';');
    }

    private writeDocumentation(d: cs.DocumentedElement) {
        if (d.documentation) {
            this.writeLine('/* TODO: Xml docs');
            d.documentation.split('\n').forEach(line => this.writeLine(` * ${line}`));
            this.writeLine('*/');
        }
    }

    private writeParameters(parameters: cs.ParameterDeclaration[]) {
        this.write('(');
        this.writeCommaSeparated(parameters, p => this.writeParameter(p));
        this.write(')');
    }
    private writeCommaSeparated<T>(values: T[], write: (p: T) => void) {
        values.forEach((v, i) => {
            if (i > 0) {
                this.write(', ');
            }
            write(v);
        });
    }

    private writeParameter(p: cs.ParameterDeclaration) {
        this.writeType(p.type);
        this.write(` ${p.name}`);

        if (p.initializer) {
            this.write(' = ');
            this.writeExpression(p.initializer);
        } else if (p.type.isOptional) {
            this.write(' = default');
        }
    }

    private writeInterfaceDeclaration(d: cs.InterfaceDeclaration) {
        this.writeVisibility(d.visibility);
        this.write(`interface ${d.name}`);
        this.writeTypeParameters(d.typeParameters);

        if (d.interfaces && d.interfaces.length > 0) {
            this.write(': ');
            this.writeCommaSeparated(d.interfaces, i => this.writeType(i));
        }

        this.writeLine();
        this.beginBlock();

        d.members.forEach(m => this.writeMember(m));

        this.endBlock();
    }

    private writeEnumDeclaration(d: cs.EnumDeclaration) {
        this.writeVisibility(d.visibility);
        this.write(`enum ${d.name}`);
        this.writeLine();
        this.beginBlock();

        d.members.forEach(m => this.writeEnumMember(m));

        this.endBlock();
    }
    private writeEnumMember(m: cs.EnumMember): void {
        this.writeDocumentation(m);
        this.write(m.name);
        if (m.initializer) {
            this.write(' = ');
            this.writeExpression(m.initializer);
        }
        this.writeLine(',');
    }

    private writeClassDeclaration(d: cs.ClassDeclaration) {
        this.writeVisibility(d.visibility);
        this.write(`class ${d.name}`);
        this.writeTypeParameters(d.typeParameters);

        if (d.baseClass) {
            this.write(': ');
            this.writeType(d.baseClass);
        }

        if (d.interfaces && d.interfaces.length > 0) {
            if (d.baseClass) {
                this.write(', ');
            } else {
                this.write(': ');
            }

            this.writeCommaSeparated(d.interfaces, i => this.writeType(i));
        }

        this.writeLine();
        this.beginBlock();

        d.members.forEach(m => this.writeMember(m));

        this.endBlock();
    }

    private writeMember(member: cs.Node) {
        switch (member.nodeType) {
            case cs.SyntaxKind.FieldDeclaration:
                this.writeFieldDeclarat1on(member as cs.FieldDeclaration);
                break;
            case cs.SyntaxKind.PropertyDeclaration:
                this.writePropertyDeclaration(member as cs.PropertyDeclaration);
                break;
            case cs.SyntaxKind.ConstructorDeclaration:
                this.writeConstructorDeclaration(member as cs.ConstructorDeclaration);
                break;
            case cs.SyntaxKind.MethodDeclaration:
                this.writeMethodDeclaration(member as cs.MethodDeclaration);
                break;
            case cs.SyntaxKind.EventDeclaration:
                this.writeEventDeclaration(member as cs.EventDeclaration);
                break;
            case cs.SyntaxKind.ClassDeclaration:
                this.writeClassDeclaration(member as cs.ClassDeclaration);
                break;
            case cs.SyntaxKind.EnumDeclaration:
                this.writeEnumDeclaration(member as cs.EnumDeclaration);
                break;
            case cs.SyntaxKind.InterfaceDeclaration:
                this.writeInterfaceDeclaration(member as cs.InterfaceDeclaration);
                break;
            case cs.SyntaxKind.DelegateDeclaration:
                this.writeDelegateDeclaration(member as cs.DelegateDeclaration);
                break;
        }
        this.writeLine();
    }

    private writeEventDeclaration(d: cs.EventDeclaration) {
        throw new Error('Method not implemented.');
    }

    private writeMethodDeclaration(d: cs.MethodDeclaration) {
        this.writeVisibility(d.visibility);

        if (d.isStatic) {
            this.write('static ');
        }

        if (d.isAbstract) {
            this.write('abstract ');
        }

        if (d.isVirtual) {
            this.write('virtual ');
        }

        if (d.isOverride) {
            this.write('override ');
        }

        this.writeType(d.returnType);
        this.write(` ${d.name}`);
        this.writeTypeParameters(d.typeParameters);
        this.writeParameters(d.parameters);

        this.writeBody(d.body);
    }
    private writeBody(body: cs.Expression | cs.Block | undefined) {
        if (body) {
            if (body.nodeType == cs.SyntaxKind.Block) {
                this.writeLine();
                this.writeBlock(body as cs.Block);
            } else {
                this.write(' => ');
                this.writeExpression(body as cs.Expression);
            }
        } else {
            this.writeLine(';');
        }
    }

    private writeConstructorDeclaration(d: cs.ConstructorDeclaration) {
        this.writeVisibility(d.visibility);
        this.write(`${(d.parent as cs.ClassDeclaration).name}`);
        this.writeParameters(d.parameters);

        if (d.baseConstructorArguments) {
            this.write(' : base (');
            this.writeCommaSeparated(d.baseConstructorArguments, e => this.writeExpression(e));
            this.write(')');
        }

        this.writeBody(d.body);
    }

    private writePropertyDeclaration(d: cs.PropertyDeclaration) {
        this.writeVisibility(d.visibility);

        if (d.isStatic) {
            this.write('static ');
        }

        if (d.isAbstract) {
            this.write('abstract ');
        }

        if (d.isVirtual) {
            this.write('virtual ');
        }

        if (d.isOverride) {
            this.write('override ');
        }

        this.writeType(d.type);
        this.writeLine(` ${d.name}`);
        this.beginBlock();

        if (d.getAccessor) {
            this.writePropertyAccessor(d.getAccessor);
        }

        if (d.setAccessor) {
            this.writePropertyAccessor(d.setAccessor);
        }

        if(d.initializer) {
            this.write(' = ');
            this.writeExpression(d.initializer);
            this.writeLine(';');
        }

        this.endBlock();
    }

    private writePropertyAccessor(accessor: cs.PropertyAccessorDeclaration) {
        this.write(accessor.keyword);
        this.writeBody(accessor.body);
    }

    private writeFieldDeclarat1on(d: cs.FieldDeclaration) {
        this.writeVisibility(d.visibility);

        if (d.isStatic) {
            this.write('static ');
        }

        if (d.isReadonly) {
            this.write('abstract ');
        }

        this.writeType(d.type);
        this.write(` ${d.name}`);
        if (d.initializer) {
            this.write(' = ');
            this.writeExpression(d.initializer);
        }
        this.writeLine(';');
    }

    private writeType(type: cs.TypeNode) {
        if (!type) {
            console.log('ERR');
        }
        switch (type.nodeType) {
            case cs.SyntaxKind.PrimitiveTypeNode:
                switch ((type as cs.PrimitiveTypeNode).type) {
                    case cs.PrimitiveType.Boolean:
                        this.write('bool');
                        break;
                    case cs.PrimitiveType.Dynamic:
                        this.write('dynamic');
                        break;
                    case cs.PrimitiveType.Number:
                        this.write('double');
                        break;
                    case cs.PrimitiveType.Object:
                        this.write('object');
                        break;
                    case cs.PrimitiveType.String:
                        this.write('string');
                        break;
                    case cs.PrimitiveType.Void:
                        this.write('void');
                        break;
                }
                break;
            case cs.SyntaxKind.ArrayTypeNode:
                const arrayType = type as cs.ArrayTypeNode;
                this.write('System.Collections.Generic.IList<');
                this.writeType(arrayType.elementType);
                this.write('>');
                break;
            case cs.SyntaxKind.TypeReference:
                const typeReference = type as cs.TypeReference;
                const targetType = (type as cs.TypeReference).reference;
                if (typeof targetType === 'string') {
                    this.write(targetType);
                } else {
                    this.writeType(targetType);
                }

                if (typeReference.typeArguments) {
                    this.write('<');
                    this.writeCommaSeparated(typeReference.typeArguments, p => this.writeType(p));
                    this.write('>');
                }
                break;
            case cs.SyntaxKind.ClassDeclaration:
            case cs.SyntaxKind.InterfaceDeclaration:
            case cs.SyntaxKind.EnumDeclaration:
            case cs.SyntaxKind.DelegateDeclaration:
                this.write(this.getFullName(type as cs.NamedTypeDeclaration));
                break;
            case cs.SyntaxKind.TypeParameterDeclaration:
                this.write((type as cs.TypeParameterDeclaration).name);
                break;
            default:
                this.write('TODO');
                break;
        }
        if (type.isNullable) {
            this.write('?');
        }
    }

    private getFullName(type: cs.NamedTypeDeclaration): string {
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

    private writeTypeParameters(typeParameters: cs.TypeParameterDeclaration[] | undefined) {
        if (typeParameters && typeParameters.length > 0) {
            this.write('<');
            typeParameters.forEach((p, i) => {
                if (i > 0) {
                    this.write(', ');
                }
                this.writeTypeParameter(p);
            });
            this.write('>');
        }
    }

    private writeTypeParameter(p: cs.TypeParameterDeclaration) {
        this.write(p.name);
    }

    private writeExpression(expr: cs.Expression) {
        this.write('/* TODO */');
    }

    private writeStatement(stmt: cs.Statement) {
        this.write('/* TODO */');
    }

    private writeBlock(b: cs.Block) {
        this.beginBlock();
        b.statements.forEach(s => this.writeStatement(s));
        this.endBlock();
    }

    private writeVisibility(visibility: cs.Visibility) {
        switch (visibility) {
            case cs.Visibility.Public:
                this.write('public ');
                break;
            case cs.Visibility.Private:
                this.write('private ');
                break;
            case cs.Visibility.Protected:
                this.write('protected ');
                break;
            case cs.Visibility.Internal:
                this.write('internal ');
                break;
        }
    }

    private writeUsing(using: cs.UsingDeclaration) {
        if (using.typeAlias) {
            this.writeLine(`using ${using.typeAlias} = ${using.namespaceOrTypeName};`);
        } else {
            this.writeLine(`using ${using.namespaceOrTypeName};`);
        }
    }

    private writeLine(txt?: string) {
        this.writeIndent();
        if (txt) {
            this.write(txt);
        }
        this.write(ts.sys.newLine);
        this._isStartOfLine = true;
    }

    private write(txt: string) {
        this.writeIndent();
        fs.writeSync(this._fileHandle, txt);
        this._isStartOfLine = false;
    }

    private writeIndent() {
        if (this._isStartOfLine && this._indent > 0) {
            fs.writeSync(this._fileHandle, this._indent === 1 ? '    ' : '    '.repeat(this._indent));
            this._isStartOfLine = false;
        }
    }

    private beginBlock() {
        this.writeLine('{');
        this._indent++;
    }

    private endBlock() {
        this._indent--;
        this.writeLine('}');
    }
}
