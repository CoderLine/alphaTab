import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import type AstTransformer from '../AstTransformer';
import { toIdentifier } from '../casing';
import * as cs from '../ir/Ir';
import * as csf from '../ir/IrFactory';
import { hasTag, JsDocTag } from '../jsDocTags';
import { createLazyTypeRef, mapVisibility, shouldSkip } from '../TransformerHelpers';
import { makeParameter } from './Members';

export function visitTestClass(state: AstTransformer, d: ts.CallExpression, registerInNamespace: boolean = true) {
    const testClassName = (d.arguments[0] as ts.StringLiteral).text;
    const csClass: cs.ClassDeclaration = csf.classDeclaration(
        state.csharpFile.namespace,
        {
            visibility: cs.Visibility.Public,
            name: state.context.toTypeNameCase(toIdentifier(testClassName)),
            isAbstract: false,
            partial: false,
            members: [],
            hasVirtualMembersOrSubClasses: false
        },
        d
    );

    if (state.attributeNames.testClassAttribute.length > 0) {
        csClass.attributes ??= [];
        const testClassAttr = csf.attribute(csClass, null!, undefined);
        testClassAttr.type = csf.typeReference(
            testClassAttr,
            state.context.makeTypeName(state.attributeNames.testClassAttribute)
        );
        testClassAttr.arguments = [csf.stringLiteral(testClassAttr, testClassName)];
        csClass.attributes.push(testClassAttr);
    }

    for (const s of ((d.arguments![1] as ts.ArrowFunction).body as ts.Block).statements) {
        if (ts.isExpressionStatement(s)) {
            if (ts.isCallExpression(s.expression)) {
                if (ts.isIdentifier(s.expression.expression) && s.expression.expression.text === 'it') {
                    visitTestMethod(state, csClass, s.expression);
                } else if (ts.isIdentifier(s.expression.expression) && s.expression.expression.text === 'describe') {
                    const nested = visitTestClass(state, s.expression, false);
                    nested.parent = csClass;
                    csClass.members.push(nested);
                } else {
                    state.context.addTsNodeDiagnostics(
                        s,
                        `Unsupported test method function call ${s.expression.expression.getText()}`,
                        ts.DiagnosticCategory.Error
                    );
                }
            } else {
                state.context.addTsNodeDiagnostics(
                    s,
                    `Unsupported test class member ${ts.SyntaxKind[s.expression.kind]}`,
                    ts.DiagnosticCategory.Error
                );
            }
        } else if (ts.isVariableStatement(s)) {
            visitTestClassProperty(state, csClass, s);
        } else if (ts.isFunctionDeclaration(s)) {
            visitTestClassMethod(state, csClass, s);
        } else {
            state.context.addTsNodeDiagnostics(
                s,
                `Unsupported test class member ${ts.SyntaxKind[s.kind]}`,
                ts.DiagnosticCategory.Error
            );
        }
    }

    if (registerInNamespace) {
        state.csharpFile.namespace.declarations.push(csClass);
    }

    return csClass;
}

export function visitTestClassMethod(state: AstTransformer, parent: cs.ClassDeclaration, d: ts.FunctionDeclaration) {
    if (state.visitTestClassMethodWrapper) {
        return state.visitTestClassMethodWrapper(parent, d, (p, fn) => _visitTestClassMethodBase(state, p, fn));
    }
    return _visitTestClassMethodBase(state, parent, d);
}

function _visitTestClassMethodBase(state: AstTransformer, parent: cs.ClassDeclaration, d: ts.FunctionDeclaration) {
    const signature = state.context.typeChecker.getSignatureFromDeclaration(d);
    const returnType = state.context.typeChecker.getReturnTypeOfSignature(signature!);

    const csMethod: cs.MethodDeclaration = csf.methodDeclaration(
        parent,
        {
            isAbstract: false,
            isOverride: false,
            isStatic: true,
            isVirtual: false,
            isGeneratorFunction: false,
            partial: hasTag(d, JsDocTag.partial),
            name: state.context.toMethodNameCase((d.name as ts.Identifier).text),
            parameters: [],
            returnType: createLazyTypeRef(state.context, null, d.type ?? d, returnType),
            visibility: mapVisibility(state.context, d, cs.Visibility.Private),
            skipEmit: shouldSkip(d, true, state.context.targetTag),
            isTestMethod: false
        },
        d
    );
    csMethod.isAsync = !!d.modifiers && !!d.modifiers.find(m => m.kind === ts.SyntaxKind.AsyncKeyword);

    const type = state.context.typeChecker.getTypeAtLocation(d.name!);
    csMethod.returnType.parent = csMethod;

    for (const p of d.parameters) {
        csMethod.parameters.push(makeParameter(state, csMethod, p));
    }
    state.declarationOrAssignmentTypeStack.push(type);
    csMethod.body = state.visitBlock(csMethod, d.body as ts.Block);
    state.declarationOrAssignmentTypeStack.pop();

    parent.members.push(csMethod);
    state.context.symbols.register(csMethod);

    return csMethod;
}

export function visitTestMethod(state: AstTransformer, parent: cs.ClassDeclaration, d: ts.CallExpression) {
    // kebab-case and "spaced name" to camelCase
    const parts = (d.arguments[0] as ts.StringLiteral).text.split(/[ -]/g);
    let name = '';
    for (let i = 0; i < parts.length; i++) {
        if (i > 0) {
            name += parts[i].substring(0, 1).toUpperCase() + parts[i].substring(1);
        } else {
            name += parts[i];
        }
    }

    // vitest signature: it(name, options?, fn). Options object is optional.
    const fnArgIndex = d.arguments.length >= 3 && ts.isObjectLiteralExpression(d.arguments[1]) ? 2 : 1;

    name = state.context.toMethodNameCase(name);
    const csMethod: cs.MethodDeclaration = csf.methodDeclaration(
        parent,
        {
            isAbstract: false,
            isOverride: false,
            isStatic: false,
            isVirtual: false,
            isTestMethod: true,
            isGeneratorFunction: false,
            partial: hasTag(d, JsDocTag.partial),
            name,
            parameters: [],
            returnType: csf.primitiveType(null!, cs.PrimitiveType.Void, d.arguments[fnArgIndex]),
            visibility: cs.Visibility.Public,
            skipEmit: shouldSkip(d, true, state.context.targetTag)
        },
        d
    );

    if (csMethod.name.match(/^[^a-zA-Z].*/)) {
        csMethod.name = `Test${csMethod.name}`;
    }

    csMethod.attributes ??= [];
    const testMethodAttr = csf.attribute(csMethod, null!, undefined);
    testMethodAttr.type = csf.typeReference(
        testMethodAttr,
        state.context.makeTypeName(state.attributeNames.testMethodAttribute)
    );
    testMethodAttr.arguments = [csf.stringLiteral(testMethodAttr, (d.arguments[0] as ts.StringLiteral).text)];
    csMethod.attributes.push(testMethodAttr);

    const testFunction = d.arguments![fnArgIndex] as ts.ArrowFunction;
    csMethod.isAsync =
        !!testFunction.modifiers && !!testFunction.modifiers.find(m => m.kind === ts.SyntaxKind.AsyncKeyword);

    if (csMethod.isAsync) {
        const asyncReturnType = csf.typeReference(
            csMethod,
            csf.primitiveType(null!, cs.PrimitiveType.Void),
            d.arguments[fnArgIndex]
        );
        asyncReturnType.isAsync = true;
        asyncReturnType.typeArguments = [];
        csMethod.returnType = asyncReturnType;
    }

    if (ts.isBlock(testFunction.body)) {
        csMethod.body = state.visitBlock(csMethod, testFunction.body as ts.Block);
    } else if (ts.isExpression(testFunction.body)) {
        csMethod.body = csf.block(csMethod, []);

        const stmt = csf.expressionStatement(csMethod.body, null!);
        (csMethod.body as cs.Block).statements.push(stmt);

        const expr = state.visitExpression(stmt, testFunction.body as ts.Expression);
        stmt.expression = expr!;
    }

    parent.members.push(csMethod);

    const sourcePath = d.getSourceFile().fileName;
    const snapshotFilePath = path.resolve(sourcePath, '..', '__snapshots__', `${path.basename(sourcePath)}.snap`);
    if (fs.existsSync(snapshotFilePath)) {
        const relative = path.relative(
            path.dirname(state.context.compilerOptions.configFilePath as string),
            snapshotFilePath
        );
        const snapshotAttr = csf.attribute(csMethod, null!, undefined);
        snapshotAttr.type = csf.typeReference(
            snapshotAttr,
            state.context.makeTypeName(state.attributeNames.snapshotFileAttribute)
        );
        snapshotAttr.arguments = [csf.stringLiteral(snapshotAttr, relative.replaceAll('\\', '/'))];
        csMethod.attributes.push(snapshotAttr);
    }
}

export function visitTestClassProperty(state: AstTransformer, parent: cs.ClassDeclaration, s: ts.VariableStatement) {
    for (const d of s.declarationList.declarations) {
        const type = state.context.typeChecker.getTypeAtLocation(d.name);
        if (state.context.isFunctionType(type) && d.initializer && ts.isArrowFunction(d.initializer)) {
            const csMethod: cs.MethodDeclaration = csf.methodDeclaration(
                parent,
                {
                    isAbstract: false,
                    isOverride: false,
                    isStatic: true,
                    isVirtual: false,
                    isTestMethod: false,
                    isGeneratorFunction: false,
                    partial: hasTag(d, JsDocTag.partial),
                    name: state.context.toMethodNameCase(d.name.getText()),
                    returnType: {} as cs.TypeNode,
                    visibility: cs.Visibility.Private,
                    parameters: []
                },
                d
            );
            csMethod.isAsync =
                !!d.initializer.modifiers && !!d.initializer.modifiers.find(m => m.kind === ts.SyntaxKind.AsyncKeyword);

            const functionType = type.symbol.declarations!.find(d => ts.isFunctionTypeNode(d)) as ts.FunctionTypeNode;

            if (csMethod.isAsync) {
                const mapped = createLazyTypeRef(state.context, csMethod, functionType.type);
                if (mapped.tsType && state.context.globals.isPromise(mapped.tsType)) {
                    csMethod.returnType = mapped.typeArguments![0];
                } else {
                    csMethod.returnType = mapped;
                }
            } else {
                csMethod.returnType = createLazyTypeRef(state.context, csMethod, functionType.type);
            }

            csMethod.returnType.parent = csMethod;

            for (const p of d.initializer.parameters) {
                csMethod.parameters.push(makeParameter(state, csMethod, p));
            }
            state.declarationOrAssignmentTypeStack.push(type);
            csMethod.body = state.visitBlock(csMethod, d.initializer.body as ts.Block);
            state.declarationOrAssignmentTypeStack.pop();

            parent.members.push(csMethod);
            state.context.symbols.register(csMethod);
        } else {
            const csProperty: cs.PropertyDeclaration = csf.propertyDeclaration(
                parent,
                {
                    isAbstract: false,
                    isOverride: false,
                    isStatic: true,
                    isVirtual: false,
                    name: state.context.toPropertyNameCase(d.name.getText()),
                    type: createLazyTypeRef(state.context, null, d.type ?? d, type),
                    visibility: cs.Visibility.Private
                },
                d
            );

            csProperty.type.parent = csProperty;
            csProperty.getAccessor = csf.propertyAccessor(csProperty, 'get');

            if (d.initializer) {
                state.declarationOrAssignmentTypeStack.push(type);
                csProperty.initializer = state.visitExpression(csProperty, d.initializer) ?? undefined;
                state.declarationOrAssignmentTypeStack.pop();
            }

            parent.members.push(csProperty);
            state.context.symbols.register(csProperty);
        }
    }
}
