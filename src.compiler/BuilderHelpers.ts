import * as ts from 'typescript';

export function setMethodBody(m: ts.MethodDeclaration, body: ts.FunctionBody): ts.MethodDeclaration {
    return ts.factory.updateMethodDeclaration(
        m,
        m.modifiers,
        m.asteriskToken,
        m.name,
        m.questionToken,
        m.typeParameters,
        m.parameters,
        m.type,
        body
    );
}

export function createNodeFromSource<T extends ts.Node>(source: string, kind: ts.SyntaxKind): T {
    const sourceFile = ts.createSourceFile(
        'temp.ts',
        source.trim(),
        ts.ScriptTarget.Latest,
        /*setParentNodes */ true,
        ts.ScriptKind.TS
    );
    const node = findNode(sourceFile, kind);
    if (!node) {
        throw new Error(
            `Could not parse TS source to ${ts.SyntaxKind[kind]}, node count was ${sourceFile.getChildCount()}`
        );
    }
    return markNodeSynthesized(node) as T;
}

function findNode(node: ts.Node, kind: ts.SyntaxKind): ts.Node | null {
    if (node.kind === kind) {
        return node;
    }

    for (const c of node.getChildren()) {
        const f = findNode(c, kind);
        if (f) {
            return f;
        }
    }

    return null;
}

export function addNewLines(stmts: ts.Statement[]) {
    return stmts.map(stmt => ts.addSyntheticTrailingComment(stmt, ts.SyntaxKind.SingleLineCommentTrivia, '', true));
}
export function getTypeWithNullableInfo(
    checker: ts.TypeChecker,
    node: ts.TypeNode | undefined,
    allowUnionAsPrimitive: boolean
) {
    if (!node) {
        return {
            isNullable: false,
            isUnionType: false,
            type: {} as ts.Type
        };
    }

    let isNullable = false;
    let isUnionType = false;
    let type: ts.Type | null = null;
    if (ts.isUnionTypeNode(node)) {
        for (const t of node.types) {
            if (t.kind === ts.SyntaxKind.NullKeyword) {
                isNullable = true;
            } else if (ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.NullKeyword) {
                isNullable = true;
            } else if (type !== null) {
                if (allowUnionAsPrimitive) {
                    isUnionType = true;
                    type = checker.getTypeAtLocation(node);
                    break;
                } else {
                    throw new Error(
                        'Multi union types on JSON settings not supported: ' +
                            node.getSourceFile().fileName +
                            ':' +
                            node.getText()
                    );
                }
            } else {
                type = checker.getTypeAtLocation(t);
            }
        }
    } else {
        type = checker.getTypeAtLocation(node);
    }

    return {
        isNullable,
        isUnionType,
        type: type as ts.Type
    };
}

export function unwrapArrayItemType(type: ts.Type, typeChecker: ts.TypeChecker): ts.Type | null {
    if (type.symbol && type.symbol.name === 'Array') {
        return (type as ts.TypeReference).typeArguments![0];
    }

    if (isPrimitiveType(type)) {
        return null;
    }

    if (type.isUnion()) {
        const nonNullable = typeChecker.getNonNullableType(type);
        if (type === nonNullable) {
            return null;
        }
        return unwrapArrayItemType(nonNullable, typeChecker);
    }

    return null;
}

export function isPrimitiveType(type: ts.Type | null) {
    if (!type) {
        return false;
    }

    if (hasFlag(type, ts.TypeFlags.Number)) {
        return true;
    }
    if (hasFlag(type, ts.TypeFlags.String)) {
        return true;
    }
    if (hasFlag(type, ts.TypeFlags.Boolean)) {
        return true;
    }
    if (hasFlag(type, ts.TypeFlags.BigInt)) {
        return true;
    }
    if (hasFlag(type, ts.TypeFlags.Unknown)) {
        return true;
    }

    return isEnumType(type);
}

export function isNumberType(type: ts.Type | null) {
    if (!type) {
        return false;
    }

    if (hasFlag(type, ts.TypeFlags.Number)) {
        return true;
    }

    return false;
}

export function isEnumType(type: ts.Type) {
    // if for some reason this returns true...
    if (hasFlag(type, ts.TypeFlags.Enum)) return true;
    // it's not an enum type if it's an enum literal type
    if (hasFlag(type, ts.TypeFlags.EnumLiteral) && !type.isUnion()) return false;
    // get the symbol and check if its value declaration is an enum declaration
    const symbol = type.getSymbol();
    if (!symbol) return false;
    const { valueDeclaration } = symbol;

    return valueDeclaration && valueDeclaration.kind === ts.SyntaxKind.EnumDeclaration;
}

export function wrapToNonNull(isNullableType: boolean, expr: ts.Expression, factory: ts.NodeFactory) {
    return isNullableType ? expr : factory.createNonNullExpression(expr);
}

export function isTypedArray(type: ts.Type) {
    return !!type.symbol?.members?.has(ts.escapeLeadingUnderscores('slice'));
}

export function hasFlag(type: ts.Type, flag: ts.TypeFlags): boolean {
    return (type.flags & flag) === flag;
}

export function isMap(type: ts.Type | null): boolean {
    return !!(type && type.symbol?.name === 'Map');
}

function markNodeSynthesized(node: ts.Node): ts.Node {
    for (const c of node.getChildren()) {
        markNodeSynthesized(c);
    }
    ts.setTextRange(node, {
        pos: -1,
        end: -1
    });
    return node;
}
