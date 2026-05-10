import ts from 'typescript';
import type AstTransformer from '../AstTransformer';
import * as cs from '../ir/Ir';
import * as csf from '../ir/IrFactory';
import { createLazyTypeRef, createVarTypeNode, shouldSkip } from '../TransformerHelpers';
import { visitFunctionDeclaration } from './Functions';

export function visitStatement(state: AstTransformer, parent: cs.Node, s: ts.Statement): cs.Statement | null {
    if (shouldSkip(s, true, state.context.targetTag)) {
        return null;
    }

    switch (s.kind) {
        case ts.SyntaxKind.EmptyStatement:
            return visitEmptyStatement(parent, s as ts.EmptyStatement);
        case ts.SyntaxKind.DebuggerStatement:
            return visitDebuggerStatement(state, s as ts.DebuggerStatement);
        case ts.SyntaxKind.Block:
            return visitBlock(state, parent, s as ts.Block);
        case ts.SyntaxKind.VariableStatement:
            return visitVariableStatement(state, parent, s as ts.VariableStatement);
        case ts.SyntaxKind.ExpressionStatement:
            return visitExpressionStatement(state, parent, s as ts.ExpressionStatement);
        case ts.SyntaxKind.IfStatement:
            return visitIfStatement(state, parent, s as ts.IfStatement);
        case ts.SyntaxKind.DoStatement:
            return visitDoStatement(state, parent, s as ts.DoStatement);
        case ts.SyntaxKind.WhileStatement:
            return visitWhileStatement(state, parent, s as ts.WhileStatement);
        case ts.SyntaxKind.ForStatement:
            return visitForStatement(state, parent, s as ts.ForStatement);
        case ts.SyntaxKind.ForOfStatement:
            return visitForOfStatement(state, parent, s as ts.ForOfStatement);
        case ts.SyntaxKind.ForInStatement:
            return visitForInStatement(state, s as ts.ForInStatement);
        case ts.SyntaxKind.BreakStatement:
            return visitBreakStatement(parent, s as ts.BreakStatement);
        case ts.SyntaxKind.ContinueStatement:
            return visitContinueStatement(parent, s as ts.ContinueStatement);
        case ts.SyntaxKind.ReturnStatement:
            return visitReturnStatement(state, parent, s as ts.ReturnStatement);
        case ts.SyntaxKind.WithStatement:
            state.context.addTsNodeDiagnostics(s, 'With statement is not supported', ts.DiagnosticCategory.Error);
            return null;
        case ts.SyntaxKind.SwitchStatement:
            return visitSwitchStatement(state, parent, s as ts.SwitchStatement);
        case ts.SyntaxKind.LabeledStatement:
            state.context.addTsNodeDiagnostics(s, 'Labeled statement is not supported', ts.DiagnosticCategory.Error);
            return null;
        case ts.SyntaxKind.ThrowStatement:
            return visitThrowStatement(state, parent, s as ts.ThrowStatement);
        case ts.SyntaxKind.TryStatement:
            return visitTryStatement(state, parent, s as ts.TryStatement);
        case ts.SyntaxKind.FunctionDeclaration:
            return visitFunctionDeclaration(state, parent, s as ts.FunctionDeclaration);
    }
    return null;
}

export function visitEmptyStatement(parent: cs.Node, s: ts.EmptyStatement): cs.EmptyStatement {
    return { nodeType: cs.SyntaxKind.EmptyStatement, parent, tsNode: s };
}

function visitDebuggerStatement(state: AstTransformer, _s: ts.DebuggerStatement): null {
    void state;
    return null;
}

export function visitBlock(state: AstTransformer, parent: cs.Node, block: ts.Block): cs.Block {
    const csBlock = csf.block(parent, [], block);

    for (const s of block.statements) {
        const csStatement = state.visitStatement(csBlock, s);
        if (csStatement) {
            csBlock.statements.push(csStatement);
        }
    }

    return csBlock;
}

export function visitVariableStatement(
    state: AstTransformer,
    parent: cs.Node,
    s: ts.VariableStatement
): cs.VariableStatement {
    const variableStatement: cs.VariableStatement = {
        nodeType: cs.SyntaxKind.VariableStatement,
        parent,
        tsNode: s,
        declarationList: {} as cs.VariableDeclarationList,
        variableStatementKind: cs.VariableStatementKind.Normal
    };

    variableStatement.declarationList = visitVariableDeclarationList(state, variableStatement, s.declarationList);

    if ((s.declarationList.flags & ts.NodeFlags.Const) !== 0) {
        variableStatement.variableStatementKind = cs.VariableStatementKind.Const;
    } else if ((s.declarationList.flags & ts.NodeFlags.Using) !== 0) {
        variableStatement.variableStatementKind = cs.VariableStatementKind.Using;
    } else if ((s.declarationList.flags & ts.NodeFlags.AwaitUsing) !== 0) {
        variableStatement.variableStatementKind = cs.VariableStatementKind.AwaitUsing;
    }

    return variableStatement;
}

export function visitVariableDeclarationList(
    state: AstTransformer,
    parent: cs.Node,
    s: ts.VariableDeclarationList
): cs.VariableDeclarationList {
    const variableStatement: cs.VariableDeclarationList = {
        nodeType: cs.SyntaxKind.VariableDeclarationList,
        parent,
        tsNode: s,
        declarations: [],
        isConst: (s.flags & ts.NodeFlags.Const) !== 0
    };

    for (const d of s.declarations) {
        variableStatement.declarations.push(visitVariableDeclaration(state, variableStatement, d));
    }

    return variableStatement;
}

export function visitVariableDeclaration(
    state: AstTransformer,
    parent: cs.Node,
    s: ts.VariableDeclaration
): cs.VariableDeclaration {
    const variableStatement: cs.VariableDeclaration = {
        nodeType: cs.SyntaxKind.VariableDeclaration,
        parent,
        tsNode: s,
        name: '',
        type: {} as cs.TypeNode
    };

    if (ts.isIdentifier(s.name)) {
        const symbol = state.context.typeChecker.getSymbolAtLocation(s.name);
        const type = state.context.typeChecker.getTypeOfSymbolAtLocation(symbol!, s);

        variableStatement.name = s.name.text;
        if (cs.isCatchClause(parent)) {
            variableStatement.type = csf.typeReference(variableStatement, state.context.makeExceptionType(), s);
        } else {
            variableStatement.type = createLazyTypeRef(state.context, variableStatement, s.type ?? s, type);
        }

        variableStatement.type.parent = variableStatement;

        if (s.initializer) {
            state.declarationOrAssignmentTypeStack.push(type);
            variableStatement.initializer = state.visitExpression(variableStatement, s.initializer) ?? undefined;
            state.declarationOrAssignmentTypeStack.pop();
        }
    } else if (ts.isArrayBindingPattern(s.name)) {
        const hasRest = s.name.elements.some(el => ts.isBindingElement(el) && el.dotDotDotToken !== undefined);
        if (hasRest) {
            state.context.addTsNodeDiagnostics(
                s,
                'Rest binding in array destructuring ([, ...rest] = arr) is not supported. See SYNTAX.md for the workaround.',
                ts.DiagnosticCategory.Error
            );
            variableStatement.type = createVarTypeNode(variableStatement, s.type ?? s);
            return variableStatement;
        }

        if (s.initializer) {
            const initType = state.context.typeChecker.getTypeAtLocation(s.initializer);
            if (!state.context.typeChecker.isTupleType(initType)) {
                state.context.addTsNodeDiagnostics(
                    s,
                    'Array destructuring of a non-tuple source ([a, b] = arr) is not supported. See SYNTAX.md for the workaround.',
                    ts.DiagnosticCategory.Error
                );
                variableStatement.type = createVarTypeNode(variableStatement, s.type ?? s);
                return variableStatement;
            }
        }

        variableStatement.type = createVarTypeNode(variableStatement, s.type ?? s);
        variableStatement.deconstructNames = [];
        for (const el of s.name.elements) {
            if (ts.isOmittedExpression(el)) {
                variableStatement.deconstructNames.push('_');
            } else if (ts.isBindingElement(el)) {
                variableStatement.deconstructNames.push((el.name as ts.Identifier).text);
            }
        }

        if (s.initializer) {
            const type = state.context.typeChecker.getTypeAtLocation(s);
            state.declarationOrAssignmentTypeStack.push(type);
            variableStatement.initializer = state.visitExpression(variableStatement, s.initializer) ?? undefined;
            state.declarationOrAssignmentTypeStack.pop();
        }
    } else if (ts.isObjectBindingPattern(s.name)) {
        state.context.addTsNodeDiagnostics(
            s,
            'Object destructuring binding ({ x, y } = obj) is not supported. See SYNTAX.md for the workaround.',
            ts.DiagnosticCategory.Error
        );
        variableStatement.type = createVarTypeNode(variableStatement, s.type ?? s);
    }

    return variableStatement;
}

export function visitExpressionStatement(
    state: AstTransformer,
    parent: cs.Node,
    s: ts.ExpressionStatement
): cs.Statement | null {
    const expressionStatement = csf.expressionStatement(parent, {} as cs.Expression, s);

    expressionStatement.expression = state.visitExpression(expressionStatement, s.expression)!;
    if (!expressionStatement.expression) {
        return null;
    }

    return expressionStatement;
}

function visitIfStatement(state: AstTransformer, parent: cs.Node, s: ts.IfStatement): cs.Statement | null {
    const ifStatement: cs.IfStatement = {
        nodeType: cs.SyntaxKind.IfStatement,
        parent,
        tsNode: s,
        expression: {} as cs.Expression,
        thenStatement: {} as cs.Statement
    };

    ifStatement.expression = state.visitExpression(ifStatement, s.expression)!;
    if (!ifStatement.expression) {
        return null;
    }
    ifStatement.thenStatement = state.visitStatement(ifStatement, s.thenStatement)!;
    if (!ifStatement.thenStatement) {
        return null;
    }

    if (s.elseStatement) {
        ifStatement.elseStatement = state.visitStatement(ifStatement, s.elseStatement)!;
        if (!ifStatement.elseStatement) {
            return null;
        }
    }

    return ifStatement;
}

function visitDoStatement(state: AstTransformer, parent: cs.Node, s: ts.DoStatement): cs.Statement | null {
    const doStatement: cs.DoStatement = {
        nodeType: cs.SyntaxKind.DoStatement,
        parent,
        tsNode: s,
        expression: {} as cs.Expression,
        statement: {} as cs.Statement
    };

    doStatement.expression = state.visitExpression(doStatement, s.expression)!;
    if (!doStatement.expression) {
        return null;
    }
    doStatement.statement = state.visitStatement(doStatement, s.statement)!;
    if (!doStatement.statement) {
        return null;
    }

    return doStatement;
}

function visitWhileStatement(state: AstTransformer, parent: cs.Node, s: ts.WhileStatement): cs.Statement | null {
    const whileStatement: cs.WhileStatement = {
        nodeType: cs.SyntaxKind.WhileStatement,
        parent,
        tsNode: s,
        expression: {} as cs.Expression,
        statement: {} as cs.Statement
    };

    whileStatement.expression = state.visitExpression(whileStatement, s.expression)!;
    if (!whileStatement.expression) {
        return null;
    }
    whileStatement.statement = state.visitStatement(whileStatement, s.statement)!;
    if (!whileStatement.statement) {
        return null;
    }

    return whileStatement;
}

function visitForStatement(state: AstTransformer, parent: cs.Node, s: ts.ForStatement): cs.Statement | null {
    const forStatement: cs.ForStatement = {
        nodeType: cs.SyntaxKind.ForStatement,
        parent,
        tsNode: s,
        statement: {} as cs.Statement
    };

    if (s.initializer) {
        if (ts.isVariableDeclarationList(s.initializer)) {
            forStatement.initializer = visitVariableDeclarationList(state, forStatement, s.initializer);
        } else {
            forStatement.initializer = state.visitExpression(forStatement, s.initializer)!;
            if (!forStatement.initializer) {
                return null;
            }
        }
    }
    if (s.condition) {
        forStatement.condition = state.visitExpression(forStatement, s.condition)!;
        if (!forStatement.condition) {
            return null;
        }
    }
    if (s.incrementor) {
        forStatement.incrementor = state.visitExpression(forStatement, s.incrementor)!;
        if (!forStatement.incrementor) {
            return null;
        }
    }

    forStatement.statement = state.visitStatement(forStatement, s.statement)!;
    if (!forStatement.statement) {
        return null;
    }

    return forStatement;
}

function visitForOfStatement(state: AstTransformer, parent: cs.Node, s: ts.ForOfStatement): cs.Statement | null {
    const forEachStatement: cs.ForEachStatement = {
        nodeType: cs.SyntaxKind.ForEachStatement,
        parent,
        tsNode: s,
        statement: {} as cs.Statement,
        expression: {} as cs.Expression,
        initializer: {} as cs.VariableDeclaration
    };

    if (ts.isVariableDeclarationList(s.initializer)) {
        forEachStatement.initializer = visitVariableDeclarationList(state, forEachStatement, s.initializer);
    } else {
        forEachStatement.initializer = state.visitExpression(forEachStatement, s.initializer)!;
        if (!forEachStatement.initializer) {
            return null;
        }
    }

    forEachStatement.expression = state.visitExpression(forEachStatement, s.expression)!;
    if (!forEachStatement.expression) {
        return null;
    }
    forEachStatement.statement = state.visitStatement(forEachStatement, s.statement)!;
    if (!forEachStatement.statement) {
        return null;
    }

    return forEachStatement;
}

function visitForInStatement(state: AstTransformer, s: ts.ForInStatement): null {
    state.context.addTsNodeDiagnostics(
        s,
        'for...in statement is not supported. See SYNTAX.md for the workaround.',
        ts.DiagnosticCategory.Error
    );
    return null;
}

function visitBreakStatement(parent: cs.Node, s: ts.BreakStatement): cs.BreakStatement {
    return { nodeType: cs.SyntaxKind.BreakStatement, parent, tsNode: s };
}

function visitContinueStatement(parent: cs.Node, s: ts.ContinueStatement): cs.ContinueStatement {
    return { nodeType: cs.SyntaxKind.ContinueStatement, parent, tsNode: s };
}

export function visitReturnStatement(
    state: AstTransformer,
    parent: cs.Node,
    s: ts.ReturnStatement
): cs.Statement | null {
    if (
        state.currentClassElement &&
        ts.isMethodDeclaration(state.currentClassElement) &&
        state.currentClassElement.asteriskToken
    ) {
        const yieldExpressionStmt = csf.expressionStatement(parent, null!, s);
        const yieldExpression = csf.yieldExpression(yieldExpressionStmt, null, s);
        yieldExpressionStmt.expression = yieldExpression;
        return yieldExpressionStmt;
    }

    const returnStatement: cs.ReturnStatement = {
        nodeType: cs.SyntaxKind.ReturnStatement,
        parent,
        tsNode: s
    };

    if (s.expression) {
        returnStatement.expression = state.visitExpression(returnStatement, s.expression)!;
        if (!returnStatement.expression) {
            return null;
        }
    }

    return returnStatement;
}

function visitSwitchStatement(state: AstTransformer, parent: cs.Node, s: ts.SwitchStatement): cs.Statement | null {
    const switchStatement: cs.SwitchStatement = {
        nodeType: cs.SyntaxKind.SwitchStatement,
        parent,
        tsNode: s,
        expression: {} as cs.Expression,
        caseClauses: []
    };

    switchStatement.expression = state.visitExpression(switchStatement, s.expression)!;
    if (!switchStatement.expression) {
        return null;
    }

    for (const c of s.caseBlock.clauses) {
        if (ts.isDefaultClause(c)) {
            switchStatement.caseClauses.push(visitDefaultClause(state, switchStatement, c));
        } else {
            const cl = visitCaseClause(state, switchStatement, c);
            if (cl) {
                switchStatement.caseClauses.push(cl);
            }
        }
    }

    return switchStatement;
}

export function visitDefaultClause(
    state: AstTransformer,
    parent: cs.SwitchStatement,
    s: ts.DefaultClause
): cs.DefaultClause {
    const defaultClause: cs.DefaultClause = {
        nodeType: cs.SyntaxKind.DefaultClause,
        parent,
        tsNode: s,
        statements: []
    };

    for (const c of s.statements) {
        const statement = state.visitStatement(defaultClause, c);
        if (statement) {
            defaultClause.statements.push(statement);
        }
    }

    return defaultClause;
}

export function visitCaseClause(
    state: AstTransformer,
    parent: cs.SwitchStatement,
    s: ts.CaseClause
): cs.CaseClause | null {
    if (shouldSkip(s, true, state.context.targetTag)) {
        return null;
    }

    const caseClause: cs.CaseClause = {
        nodeType: cs.SyntaxKind.CaseClause,
        parent,
        tsNode: s,
        expression: {} as cs.Expression,
        statements: []
    };

    caseClause.expression = state.visitExpression(caseClause, s.expression)!;
    if (!caseClause.expression) {
        return null;
    }

    for (const c of s.statements) {
        const statement = state.visitStatement(caseClause, c);
        if (statement) {
            caseClause.statements.push(statement);
        }
    }

    return caseClause;
}

function visitThrowStatement(state: AstTransformer, parent: cs.Node, s: ts.ThrowStatement): cs.Statement | null {
    const throwStatement: cs.ThrowStatement = {
        nodeType: cs.SyntaxKind.ThrowStatement,
        parent,
        tsNode: s
    };

    if (s.expression) {
        throwStatement.expression = state.visitExpression(throwStatement, s.expression)!;
        if (!throwStatement.expression) {
            return null;
        }
    }

    return throwStatement;
}

function visitTryStatement(state: AstTransformer, parent: cs.Node, s: ts.TryStatement): cs.TryStatement {
    const tryStatement: cs.TryStatement = {
        nodeType: cs.SyntaxKind.TryStatement,
        parent,
        tsNode: s,
        tryBlock: {} as cs.Block
    };

    tryStatement.tryBlock = visitBlock(state, tryStatement, s.tryBlock);
    if (s.catchClause) {
        tryStatement.catchClauses = [visitCatchClause(state, tryStatement, s.catchClause)];
    }
    if (s.finallyBlock) {
        tryStatement.finallyBlock = visitBlock(state, tryStatement, s.finallyBlock);
    }

    return tryStatement;
}

export function visitCatchClause(state: AstTransformer, parent: cs.TryStatement, s: ts.CatchClause): cs.CatchClause {
    const catchClause: cs.CatchClause = {
        nodeType: cs.SyntaxKind.CatchClause,
        parent,
        tsNode: s,
        block: {} as cs.Block
    };

    if (s.variableDeclaration) {
        catchClause.variableDeclaration = visitVariableDeclaration(state, catchClause, s.variableDeclaration!);
    }
    catchClause.block = visitBlock(state, catchClause, s.block);

    return catchClause;
}
