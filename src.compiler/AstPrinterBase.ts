import * as cs from './csharp/CSharpAst';
import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import CSharpEmitterContext from './csharp/CSharpEmitterContext';

export default abstract class AstPrinterBase {
    protected _sourceFile: cs.SourceFile;
    private _source = '';
    protected _context: CSharpEmitterContext;
    protected _isStartOfLine: boolean = true;
    protected _indent: number = 0;

    public diagnostics: ts.Diagnostic[] = [];

    public constructor(sourceFile: cs.SourceFile, context: CSharpEmitterContext) {
        this._sourceFile = sourceFile;
        this._context = context;
    }

    public print() {
        fs.mkdirSync(path.dirname(this._sourceFile.fileName), { recursive: true });
        try {
            this._source = '';
            this.writeSourceFile(this._sourceFile);
        } finally {
            fs.writeFileSync(this._sourceFile.fileName, this._source);
        }
    }

    protected abstract writeSourceFile(sourceFile: cs.SourceFile);

    protected writeSemicolon() {
        this.writeLine(';');
    }

    protected writeLine(txt?: string) {
        this.writeIndent();
        if (txt) {
            this.write(txt);
        }
        this.write(ts.sys.newLine);
        this._isStartOfLine = true;
    }

    protected write(txt: string) {
        this.writeIndent();
        this._source += txt;
        this._isStartOfLine = false;
    }

    protected writeIndent() {
        if (this._isStartOfLine && this._indent > 0) {
            this._source += this._indent === 1 ? '    ' : '    '.repeat(this._indent);
            this._isStartOfLine = false;
        }
    }

    protected beginBlock() {
        this.writeLine('{');
        this._indent++;
    }

    protected endBlock() {
        this._indent--;
        this.writeLine('}');
    }

    protected writeNamespaceMembers(members: cs.NamespaceMember[]) {
        for (const declaration of members) {
            this.writeMember(declaration);
        }
    }

    protected writeCommaSeparated<T>(values: T[], write: (p: T) => void, newLine:boolean = false) {
        values.forEach((v, i) => {
            if (i > 0) {
                this.write(', ');
                if(newLine) {
                    this.writeLine();
                }
            }
            write(v);
        });
    }

    protected abstract writeClassDeclaration(d: cs.ClassDeclaration);
    protected abstract writeEnumDeclaration(d: cs.EnumDeclaration);
    protected abstract writeInterfaceDeclaration(d: cs.InterfaceDeclaration);
    protected abstract writeParameter(p: cs.ParameterDeclaration);

    protected writeParameters(parameters: cs.ParameterDeclaration[]) {
        this.write('(');
        this.writeCommaSeparated(parameters, p => this.writeParameter(p));
        this.write(')');
    }

    protected writeAttributes(d: cs.AttributedElement) {
        if (d.attributes) {
            d.attributes.forEach(a => this.writeAttribute(a));
        }
    }

    protected abstract writeAttribute(a: cs.Attribute);

    protected abstract writeMethodDeclaration(d: cs.MethodDeclaration);
    protected abstract writeFieldDeclarat1on(d: cs.FieldDeclaration);
    protected abstract writePropertyDeclaration(d: cs.PropertyDeclaration);
    protected abstract writeConstructorDeclaration(d: cs.ConstructorDeclaration);

    protected writeMember(member: cs.Node) {
        if (member.skipEmit) {
            return;
        }

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
            case cs.SyntaxKind.ClassDeclaration:
                this.writeClassDeclaration(member as cs.ClassDeclaration);
                break;
            case cs.SyntaxKind.EnumDeclaration:
                this.writeEnumDeclaration(member as cs.EnumDeclaration);
                break;
            case cs.SyntaxKind.InterfaceDeclaration:
                this.writeInterfaceDeclaration(member as cs.InterfaceDeclaration);
                break;
        }
        this.writeLine();
    }

    protected canBeConstant(d: cs.PropertyDeclaration): boolean {
        return (
            d.isStatic &&
            !d.setAccessor &&
            cs.isPrimitiveTypeNode(d.type) &&
            !!d.initializer &&
            (!d.getAccessor || !d.getAccessor.body)
        );
    }

    protected writePropertyAsField(d: cs.PropertyDeclaration) {
        if (
            cs.isClassDeclaration(d.parent!) &&
            d.visibility === cs.Visibility.Private &&
            (!d.getAccessor || !d.getAccessor.body)
        ) {
            return true;
        }
        return this.canBeConstant(d);
    }

    protected abstract writeType(
        type: cs.TypeNode,
        forNew?: boolean,
        asNativeArray?: boolean,
        forTypeConstraint?: boolean
    );

    protected abstract writePrefixUnaryExpression(expr: cs.PrefixUnaryExpression);
    protected abstract writeBaseLiteralExpression(expr: cs.BaseLiteralExpression);
    protected abstract writeAwaitExpression(expr: cs.AwaitExpression);
    protected abstract writeBinaryExpression(expr: cs.BinaryExpression);
    protected abstract writeConditionalExpression(expr: cs.ConditionalExpression);
    protected abstract writeLambdaExpression(expr: cs.LambdaExpression);
    protected abstract writeNumericLiteral(expr: cs.NumericLiteral);
    protected abstract writeStringTemplateExpression(expr: cs.StringTemplateExpression);
    protected abstract writeArrayCreationExpression(expr: cs.ArrayCreationExpression);
    protected abstract writeTypeOfExpression(expr: cs.TypeOfExpression);
    protected abstract writeMemberAccessExpression(expr: cs.MemberAccessExpression);
    protected abstract writeElementAccessExpression(expr: cs.ElementAccessExpression);
    protected abstract writeNewExpression(expr: cs.NewExpression);
    protected abstract writeCastExpression(expr: cs.CastExpression);
    protected abstract writeNonNullExpression(expr: cs.NonNullExpression);

    protected writeToDoExpression(expr: cs.ToDoExpression) {
        this.write('/* TODO */');
    }

    protected writeIdentifier(expr: cs.Identifier) {
        const name = this._context.getSymbolName(expr) ?? expr.text;
        this.write(name);
    }

    protected writeNullSafeExpression(expr: cs.NullSafeExpression) {
        this.writeExpression(expr.expression);
        this.write('?');
    }

    protected writeInvocationExpression(expr: cs.InvocationExpression) {
        this.writeExpression(expr.expression);
        if (expr.typeArguments) {
            this.write('<');
            this.writeCommaSeparated(expr.typeArguments, t => this.writeType(t));
            this.write('>');
        }
        this.write('(');
        if (expr.arguments.length > 5) {
            this.writeLine();
            this._indent++;
            this.writeCommaSeparated(expr.arguments, a => {
                this.writeExpression(a);
                this.writeLine();
            }, true);
            this._indent--;
            this.writeLine();
        } else {
            this.writeCommaSeparated(expr.arguments, a => this.writeExpression(a));
        }
        this.write(')');
    }

    protected writeNullLiteral(expr: cs.NullLiteral) {
        this.write('null');
    }

    protected writeBooleanLiteral(expr: cs.BooleanLiteral) {
        this.write(cs.isTrueLiteral(expr) ? 'true' : 'false');
    }

    protected writeThisLiteral(expr: cs.ThisLiteral) {
        this.write('this');
    }

    protected writeStringLiteral(expr: cs.StringLiteral) {
        this.write(JSON.stringify(expr.text));
    }

    protected writeIsExpression(expr: cs.IsExpression) {
        this.writeExpression(expr.expression);
        this.write(' is ');
        this.writeType(expr.type);
    }

    protected writeParenthesizedExpression(expr: cs.ParenthesizedExpression) {
        this.write('(');
        this.writeExpression(expr.expression);
        this.write(')');
    }

    protected writeTypeParameter(p: cs.TypeParameterDeclaration) {
        this.write(p.name);
    }

    protected writeTypeParameterConstraints(typeParameters: cs.TypeParameterDeclaration[] | undefined) {
        if (typeParameters) {
            this._indent++;
            typeParameters.forEach(p => {
                if (p.constraint) {
                    this.writeLine();
                    this.write('where ');
                    this.write(p.name);
                    this.write(' : ');
                    this.writeType(p.constraint, false, false, true);
                }
            });
            this._indent--;
        }
    }

    protected writeTypeParameters(typeParameters: cs.TypeParameterDeclaration[] | undefined) {
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

    protected writeExpression(expr: cs.Expression) {
        switch (expr.nodeType) {
            case cs.SyntaxKind.PrefixUnaryExpression:
                this.writePrefixUnaryExpression(expr as cs.PrefixUnaryExpression);
                break;
            case cs.SyntaxKind.PostfixUnaryExpression:
                this.writePostfixUnaryExpression(expr as cs.PostfixUnaryExpression);
                break;
            case cs.SyntaxKind.NullLiteral:
                this.writeNullLiteral(expr as cs.NullLiteral);
                break;
            case cs.SyntaxKind.FalseLiteral:
            case cs.SyntaxKind.TrueLiteral:
                this.writeBooleanLiteral(expr as cs.BooleanLiteral);
                break;
            case cs.SyntaxKind.ThisLiteral:
                this.writeThisLiteral(expr as cs.ThisLiteral);
                break;
            case cs.SyntaxKind.BaseLiteralExpression:
                this.writeBaseLiteralExpression(expr as cs.BaseLiteralExpression);
                break;
            case cs.SyntaxKind.StringLiteral:
                this.writeStringLiteral(expr as cs.StringLiteral);
                break;
            case cs.SyntaxKind.AwaitExpression:
                this.writeAwaitExpression(expr as cs.AwaitExpression);
                break;
            case cs.SyntaxKind.BinaryExpression:
                this.writeBinaryExpression(expr as cs.BinaryExpression);
                break;
            case cs.SyntaxKind.ConditionalExpression:
                this.writeConditionalExpression(expr as cs.ConditionalExpression);
                break;
            case cs.SyntaxKind.LambdaExpression:
                this.writeLambdaExpression(expr as cs.LambdaExpression);
                break;
            case cs.SyntaxKind.NumericLiteral:
                this.writeNumericLiteral(expr as cs.NumericLiteral);
                break;
            case cs.SyntaxKind.StringTemplateExpression:
                this.writeStringTemplateExpression(expr as cs.StringTemplateExpression);
                break;
            case cs.SyntaxKind.IsExpression:
                this.writeIsExpression(expr as cs.IsExpression);
                break;
            case cs.SyntaxKind.ParenthesizedExpression:
                this.writeParenthesizedExpression(expr as cs.ParenthesizedExpression);
                break;
            case cs.SyntaxKind.ArrayCreationExpression:
                this.writeArrayCreationExpression(expr as cs.ArrayCreationExpression);
                break;
            case cs.SyntaxKind.MemberAccessExpression:
                this.writeMemberAccessExpression(expr as cs.MemberAccessExpression);
                break;
            case cs.SyntaxKind.AnonymousObjectCreationExpression:
                this.writeAnonymousObjectCreationExpression(expr as cs.AnonymousObjectCreationExpression);
                break;
            case cs.SyntaxKind.AnonymousObjectProperty:
                this.writeAnonymousObjectProperty(expr as cs.AnonymousObjectProperty);
                break;
            case cs.SyntaxKind.ElementAccessExpression:
                this.writeElementAccessExpression(expr as cs.ElementAccessExpression);
                break;
            case cs.SyntaxKind.InvocationExpression:
                this.writeInvocationExpression(expr as cs.InvocationExpression);
                break;
            case cs.SyntaxKind.NewExpression:
                this.writeNewExpression(expr as cs.NewExpression);
                break;
            case cs.SyntaxKind.CastExpression:
                this.writeCastExpression(expr as cs.CastExpression);
                break;
            case cs.SyntaxKind.NonNullExpression:
                this.writeNonNullExpression(expr as cs.NonNullExpression);
                break;
            case cs.SyntaxKind.NullSafeExpression:
                this.writeNullSafeExpression(expr as cs.NullSafeExpression);
                break;
            case cs.SyntaxKind.Identifier:
                this.writeIdentifier(expr as cs.Identifier);
                break;
            case cs.SyntaxKind.ToDoExpression:
                this.writeToDoExpression(expr as cs.ToDoExpression);
                break;
            case cs.SyntaxKind.DefaultExpression:
                this.writeDefaultExpression(expr as cs.DefaultExpression);
                break;
            case cs.SyntaxKind.TypeOfExpression:
                this.writeTypeOfExpression(expr as cs.TypeOfExpression);
                break;
            case cs.SyntaxKind.TypeReference:
                this.writeType(expr as cs.TypeReference);
                break;
            default:
                throw new Error(`Unhandled expression type: ${cs.SyntaxKind[expr.nodeType]}`);
        }
    }

    protected writeStatement(s: cs.Statement) {
        switch (s.nodeType) {
            case cs.SyntaxKind.EmptyStatement:
                this.writeEmptyStatement(s as cs.EmptyStatement);
                break;
            case cs.SyntaxKind.Block:
                this.writeBlock(s as cs.Block);
                break;
            case cs.SyntaxKind.VariableStatement:
                this.writeVariableStatement(s as cs.VariableStatement);
                break;
            case cs.SyntaxKind.ExpressionStatement:
                this.writeExpressionStatement(s as cs.ExpressionStatement);
                break;
            case cs.SyntaxKind.IfStatement:
                this.writeIfStatement(s as cs.IfStatement);
                break;
            case cs.SyntaxKind.DoStatement:
                this.writeDoStatement(s as cs.DoStatement);
                break;
            case cs.SyntaxKind.WhileStatement:
                this.writeWhileStatement(s as cs.WhileStatement);
                break;
            case cs.SyntaxKind.ForStatement:
                this.writeForStatement(s as cs.ForStatement);
                break;
            case cs.SyntaxKind.ForEachStatement:
                this.writeForEachStatement(s as cs.ForEachStatement);
                break;
            case cs.SyntaxKind.BreakStatement:
                this.writeBreakStatement(s as cs.BreakStatement);
                break;
            case cs.SyntaxKind.ContinueStatement:
                this.writeContinueStatement(s as cs.ContinueStatement);
                break;
            case cs.SyntaxKind.ReturnStatement:
                this.writeReturnStatement(s as cs.ReturnStatement);
                break;
            case cs.SyntaxKind.SwitchStatement:
                this.writeSwitchStatement(s as cs.SwitchStatement);
                break;
            case cs.SyntaxKind.ThrowStatement:
                this.writeThrowStatement(s as cs.ThrowStatement);
                break;
            case cs.SyntaxKind.TryStatement:
                this.writeTryStatement(s as cs.TryStatement);
                break;
        }
    }

    protected writeTryStatement(s: cs.TryStatement) {
        this.writeLine('try');
        this.writeBlock(s.tryBlock);
        if (s.catchClauses) {
            s.catchClauses.forEach(c => this.writeCatchClause(c));
        }
        if (s.finallyBlock) {
            this.writeLine('finally');
            this.writeBlock(s.finallyBlock);
        }
    }

    protected writeThrowStatement(s: cs.ThrowStatement) {
        this.write('throw');
        if (s.expression) {
            this.write(' ');
            this.writeExpression(s.expression);
        }
        this.writeSemicolon();
    }

    protected writeReturnStatement(r: cs.ReturnStatement) {
        this.write('return');
        if (r.expression) {
            this.write(' ');
            this.writeExpression(r.expression);
        }
        this.writeSemicolon();
    }

    protected writeContinueStatement(_: cs.ContinueStatement) {
        this.write('continue');
        this.writeSemicolon();
    }

    protected writeBreakStatement(_: cs.BreakStatement) {
        this.write('break');
        this.writeSemicolon();
    }

    protected abstract writeCatchClause(c: cs.CatchClause): void;
    protected abstract writeSwitchStatement(s: cs.SwitchStatement);
    protected abstract writeForEachStatement(s: cs.ForEachStatement);
    protected abstract writeForStatement(s: cs.ForStatement);

    protected writeWhileStatement(s: cs.WhileStatement) {
        this.write('while (');
        this.writeExpression(s.expression);
        this.writeLine(')');
        if (cs.isBlock(s.statement)) {
            this.writeStatement(s.statement);
        } else {
            this._indent++;
            this.writeStatement(s.statement);
            this._indent--;
        }
    }

    protected writeDoStatement(s: cs.DoStatement) {
        this.writeLine('do');
        this.writeStatement(s.statement);
        this.write('while (');
        this.writeExpression(s.expression);
        this.write(')');
        this.writeSemicolon();
    }

    protected writeIfStatement(s: cs.IfStatement) {
        this.write('if (');
        this.writeExpression(s.expression);
        this.writeLine(')');
        if (cs.isBlock(s.thenStatement)) {
            this.writeStatement(s.thenStatement);
        } else {
            this._indent++;
            this.writeStatement(s.thenStatement);
            this._indent--;
        }

        if (s.elseStatement) {
            this.write('else ');
            if (cs.isIfStatement(s.elseStatement)) {
                this.writeStatement(s.elseStatement);
            } else if (cs.isBlock(s.elseStatement)) {
                this.writeLine();
                this.writeStatement(s.elseStatement);
            } else {
                this.writeLine();
                this._indent++;
                this.writeStatement(s.elseStatement);
                this._indent--;
            }
        }
    }

    protected writeExpressionStatement(s: cs.ExpressionStatement) {
        this.writeExpression(s.expression);
        this.writeSemicolon();
    }

    protected writeVariableStatement(v: cs.VariableStatement) {
        this.writeVariableDeclarationList(v.declarationList);
        this.writeSemicolon();
    }

    protected writeEmptyStatement(_: cs.EmptyStatement) {
        this.writeSemicolon();
    }

    protected abstract writeVariableDeclarationList(declarationList: cs.VariableDeclarationList);
    protected abstract writeBlock(b: cs.Block);

    protected writeVisibility(visibility: cs.Visibility) {
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

    protected writeDefaultExpression(expr: cs.DefaultExpression) {
        this.write('default');
        if (expr.type) {
            this.write('(');
            this.writeType(expr.type);
            this.write(')');
        }
    }

    protected writePostfixUnaryExpression(expr: cs.PostfixUnaryExpression) {
        this.writeExpression(expr.operand);
        this.write(expr.operator);
    }

    protected writeAnonymousObjectCreationExpression(expr: cs.AnonymousObjectCreationExpression) {
        this.write('new');
        this.beginBlock();

        expr.properties.forEach(p => this.writeAnonymousObjectProperty(p));

        this.endBlock();
    }

    protected writeAnonymousObjectProperty(expr: cs.AnonymousObjectProperty) {
        this.write(expr.name);
        this.write(' = ');
        this.writeExpression(expr.value);
        this.writeLine(',');
    }
}
