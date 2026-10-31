import path from 'node:path';
import ts from 'typescript';
import type { LanguageDescriptor } from '../AstTransformer';
import type EmitterContextBase from '../EmitterContextBase';
import type { HandlerRegistry } from '../HandlerRegistry';
import * as Decls from '../transforms/Declarations';
import * as Exprs from '../transforms/Expressions';
import * as Stmts from '../transforms/Statements';
import * as Tests from '../transforms/Tests';

export const CSharpLanguage: LanguageDescriptor = {
    fileExtension: '.cs',

    attributeNames: {
        testClassAttribute: 'alphaTab.test.TestClass',
        testMethodAttribute: 'alphaTab.test.TestMethod',
        snapshotFileAttribute: 'alphaTab.test.SnapshotFile',
        deprecatedAttributeName: 'system.ObsoleteAttribute'
    },

    buildFileName(fileName: string, context: EmitterContextBase, isTestFile: boolean): string {
        const ext = '.cs';
        const firstDir = fileName.indexOf(path.sep);
        const base = fileName.substring(firstDir + 1).replace(/\.[^/.]+$/, '');
        return path.join(isTestFile ? context.testOutDir : context.srcOutDir, base + ext);
    },

    registerHandlers(registry: HandlerRegistry): void {
        // ── Expressions ───────────────────────────────────────────────────────
        registry.register(ts.SyntaxKind.PrefixUnaryExpression, Exprs.visitPrefixUnaryExpression);
        registry.register(ts.SyntaxKind.PostfixUnaryExpression, Exprs.visitPostfixUnaryExpression);
        registry.register(ts.SyntaxKind.NullKeyword, Exprs.visitNullLiteral);
        registry.register(ts.SyntaxKind.TrueKeyword, Exprs.visitBooleanLiteral);
        registry.register(ts.SyntaxKind.FalseKeyword, Exprs.visitBooleanLiteral);
        registry.register(ts.SyntaxKind.ThisKeyword, Exprs.visitThisExpression);
        registry.register(ts.SyntaxKind.SuperKeyword, Exprs.visitSuperLiteralExpression);
        registry.register(ts.SyntaxKind.TypeOfExpression, Exprs.visitTypeOfExpression);
        registry.register(ts.SyntaxKind.AwaitExpression, Exprs.visitAwaitExpression);
        registry.register(ts.SyntaxKind.BinaryExpression, Exprs.visitBinaryExpression);
        registry.register(ts.SyntaxKind.ConditionalExpression, Exprs.visitConditionalExpression);
        registry.register(ts.SyntaxKind.FunctionExpression, Exprs.visitFunctionExpression);
        registry.register(ts.SyntaxKind.ArrowFunction, Exprs.visitArrowExpression);
        registry.register(ts.SyntaxKind.RegularExpressionLiteral, Exprs.visitRegularExpressionLiteral);
        registry.register(ts.SyntaxKind.NumericLiteral, Exprs.visitNumericLiteral);
        registry.register(ts.SyntaxKind.BigIntLiteral, Exprs.visitBigIntLiteral);
        registry.register(ts.SyntaxKind.TemplateExpression, Exprs.visitTemplateExpression);
        registry.register(ts.SyntaxKind.NoSubstitutionTemplateLiteral, Exprs.visitNoSubstitutionTemplateLiteral);
        registry.register(ts.SyntaxKind.TypeAssertionExpression, Exprs.visitTypeAssertionExpression);
        registry.register(ts.SyntaxKind.ParenthesizedExpression, Exprs.visitParenthesizedExpression);
        registry.register(ts.SyntaxKind.ArrayLiteralExpression, Exprs.visitArrayLiteralExpression);
        registry.register(ts.SyntaxKind.PropertyAccessExpression, Exprs.visitPropertyAccessExpression);
        registry.register(ts.SyntaxKind.ObjectLiteralExpression, Exprs.visitObjectLiteralExpression);
        registry.register(ts.SyntaxKind.ElementAccessExpression, Exprs.visitElementAccessExpression);
        registry.register(ts.SyntaxKind.CallExpression, (t, p, n) => {
            const call = n as ts.CallExpression;
            if (ts.isIdentifier(call.expression) && call.expression.text === 'describe') {
                Tests.visitTestClass(t, call);
                return null;
            }
            return Exprs.visitCallExpression(t, p, call);
        });
        registry.register(ts.SyntaxKind.NewExpression, Exprs.visitNewExpression);
        registry.register(ts.SyntaxKind.AsExpression, Exprs.visitAsExpression);
        registry.register(ts.SyntaxKind.NonNullExpression, Exprs.visitNonNullExpression);
        registry.register(ts.SyntaxKind.Identifier, Exprs.visitIdentifier);
        registry.register(ts.SyntaxKind.StringLiteral, Exprs.visitStringLiteral);
        registry.register(ts.SyntaxKind.SpreadElement, Exprs.visitSpreadElement);
        registry.register(ts.SyntaxKind.YieldExpression, Exprs.visitYieldExpression);

        // ── Statements ────────────────────────────────────────────────────────
        // The main statement routing switch lives in Stmts.visitStatement, which
        // applies the @target skip filter. Statements registered via specialised
        // handlers must perform the same skip check themselves; otherwise nodes
        // with /*@target web*/ markers leak through and emit on non-web targets.
        registry.register(ts.SyntaxKind.Block, (t, p, n) => Stmts.visitStatement(t, p, n as ts.Statement));
        registry.register(ts.SyntaxKind.VariableStatement, (t, p, n) =>
            Stmts.visitStatement(t, p, n as ts.Statement)
        );
        registry.register(ts.SyntaxKind.ExpressionStatement, (t, p, n) =>
            Stmts.visitStatement(t, p, n as ts.Statement)
        );
        registry.register(ts.SyntaxKind.IfStatement, (t, p, n) => Stmts.visitStatement(t, p, n as ts.Statement));
        registry.register(ts.SyntaxKind.DoStatement, (t, p, n) => Stmts.visitStatement(t, p, n as ts.Statement));
        registry.register(ts.SyntaxKind.WhileStatement, (t, p, n) => Stmts.visitStatement(t, p, n as ts.Statement));
        registry.register(ts.SyntaxKind.ForStatement, (t, p, n) => Stmts.visitStatement(t, p, n as ts.Statement));
        registry.register(ts.SyntaxKind.ForOfStatement, (t, p, n) => Stmts.visitStatement(t, p, n as ts.Statement));
        registry.register(ts.SyntaxKind.ForInStatement, (t, p, n) => Stmts.visitStatement(t, p, n as ts.Statement));
        registry.register(ts.SyntaxKind.BreakStatement, (t, p, n) => Stmts.visitStatement(t, p, n as ts.Statement));
        registry.register(ts.SyntaxKind.ContinueStatement, (t, p, n) => Stmts.visitStatement(t, p, n as ts.Statement));
        registry.register(ts.SyntaxKind.ReturnStatement, (t, p, n) => Stmts.visitStatement(t, p, n as ts.Statement));
        registry.register(ts.SyntaxKind.WithStatement, (t, p, n) => Stmts.visitStatement(t, p, n as ts.Statement));
        registry.register(ts.SyntaxKind.SwitchStatement, (t, p, n) => Stmts.visitStatement(t, p, n as ts.Statement));
        registry.register(ts.SyntaxKind.LabeledStatement, (t, p, n) => Stmts.visitStatement(t, p, n as ts.Statement));
        registry.register(ts.SyntaxKind.ThrowStatement, (t, p, n) => Stmts.visitStatement(t, p, n as ts.Statement));
        registry.register(ts.SyntaxKind.TryStatement, (t, p, n) => Stmts.visitStatement(t, p, n as ts.Statement));
        registry.register(ts.SyntaxKind.FunctionDeclaration, Exprs.visitFunctionDeclaration);

        // ── Class elements ────────────────────────────────────────────────────
        registry.register(ts.SyntaxKind.Constructor, (t, p, n) => {
            return Decls.visitConstructorDeclaration(t, p as any, n as ts.ConstructorDeclaration);
        });
        registry.register(ts.SyntaxKind.MethodSignature, (t, p, n) => {
            return Decls.visitMethodSignature(t, p as any, n as ts.MethodSignature);
        });
        registry.register(ts.SyntaxKind.MethodDeclaration, (t, p, n) => {
            return Decls.visitMethodDeclaration(t, p as any, n as ts.MethodDeclaration);
        });
        registry.register(ts.SyntaxKind.PropertySignature, (t, p, n) => {
            Decls.visitPropertySignature(t, p as any, n as ts.PropertySignature);
            return null;
        });
        registry.register(ts.SyntaxKind.PropertyDeclaration, (t, p, n) => {
            return Decls.visitPropertyDeclaration(t, p as any, n as ts.PropertyDeclaration);
        });
        registry.register(ts.SyntaxKind.GetAccessor, (t, p, n) => {
            Decls.visitGetAccessor(t, p as any, n as ts.GetAccessorDeclaration);
            return null;
        });
        registry.register(ts.SyntaxKind.SetAccessor, (t, p, n) => {
            Decls.visitSetAccessor(t, p as any, n as ts.SetAccessorDeclaration);
            return null;
        });

        // ── Top-level declarations ────────────────────────────────────────────
        registry.register(ts.SyntaxKind.ClassDeclaration, (t, _p, n) => {
            Decls.visitClassDeclaration(
                t,
                n as ts.ClassDeclaration,
                t._pendingNestedExports,
                t._pendingNestedNonExports,
                t._pendingGlobalStatements
            );
            return null;
        });
        registry.register(ts.SyntaxKind.EnumDeclaration, (t, _p, n) => {
            Decls.visitEnumDeclaration(t, n as ts.EnumDeclaration);
            return null;
        });
        registry.register(ts.SyntaxKind.InterfaceDeclaration, (t, _p, n) => {
            Decls.visitInterfaceDeclaration(t, n as ts.InterfaceDeclaration);
            return null;
        });
        registry.register(ts.SyntaxKind.TypeAliasDeclaration, (t, _p, n) => {
            Decls.visitTypeAliasDeclaration(t, n as ts.TypeAliasDeclaration);
            return null;
        });
    }
};
