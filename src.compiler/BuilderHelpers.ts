import * as ts from 'typescript';

export function addNewLines(stmts: ts.Statement[]) {
    return stmts.map(stmt => ts.addSyntheticTrailingComment(stmt, ts.SyntaxKind.SingleLineCommentTrivia, '', true));
}
export function getTypeWithNullableInfo(checker: ts.TypeChecker, node: ts.TypeNode | undefined) {
    if(!node) {
        return {
            isNullable: false,
            type: {} as ts.Type
        };
    }

    let isNullable = false;
    let type: ts.Type | null = null;
    if (ts.isUnionTypeNode(node)) {
        for (const t of node.types) {
            if (t.kind === ts.SyntaxKind.NullKeyword) {
                isNullable = true;
            } else if (ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.NullKeyword) {
                isNullable = true;
            } else if (type !== null) {
                throw new Error('Multi union types on JSON settings not supported: ' + node.getSourceFile().fileName + ':' + node.getText());
            } else {
                type = checker.getTypeAtLocation(t);
            }
        }
    } else {
        type = checker.getTypeAtLocation(node);
    }

    return {
        isNullable,
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