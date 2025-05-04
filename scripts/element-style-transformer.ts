import ts from 'typescript';

export function isElementStyleHelper(node: ts.Statement): boolean {
    return !!(
        ts.isVariableStatement(node) &&
        node.declarationList.flags & ts.NodeFlags.Using &&
        node.declarationList.declarations.length === 1 &&
        node.declarationList.declarations[0].initializer &&
        node.declarationList.declarations[0].initializer.getText().includes('ElementStyleHelper')
    );
};


export function elementStyleUsingTransformer() {
    return (context: ts.TransformationContext) => {
        return (source: ts.SourceFile) => {
            // a transformer for a more lightweight "using" declaration. the built-in TS using declarations
            // allocate a stack of scopes to register and free stuff. this is way too much overhead for our ElementStyleHelper
            // which is called on very low level (e.g. on notes)
            // here we convert it to a simple try->finally with some trade-off on variable scopes.
            const rewriteElementStyleHelper = (block: ts.Block): ts.Block => {
                const newStatements: ts.Statement[] = [];

                for (let i = 0; i < block.statements.length; i++) {
                    const node = block.statements[i];

                    // using s = ElementStyleHelper.track(...);
                    // ->
                    // const s = ElementStyleHelper.track(...);
                    // try { following statements } finally { s?.[Symbol.Dispose](); }
                    if (isElementStyleHelper(node)) {
                        const vs = node as ts.VariableStatement;
                        // lower using to a simple const
                        newStatements.push(
                            ts.factory.createVariableStatement(
                                vs.modifiers,
                                ts.factory.createVariableDeclarationList(
                                    [
                                        ts.factory.createVariableDeclaration(
                                            vs.declarationList.declarations[0].name,
                                            undefined,
                                            undefined,
                                            vs.declarationList.declarations[0].initializer
                                        )
                                    ],
                                    ts.NodeFlags.Const
                                )
                            )
                        );

                        // wrap all upcoming statements into a try->finally
                        // note that this might break variable scopes if not used properly in code
                        // we do not pull (yet?) any declarations to the outer scope
                        const tryStatements: ts.Statement[] = [];

                        i++;
                        for (; i < block.statements.length; i++) {
                            if (isElementStyleHelper(block.statements[i])) {
                                i--;
                                break;
                            } else {
                                tryStatements.push(visitor(block.statements[i]) as ts.Statement);
                            }
                        }

                        // s?.[Symbol.dispose]?.();
                        const freeResource = ts.factory.createExpressionStatement(
                            ts.factory.createCallChain(
                                ts.factory.createElementAccessChain(
                                    ts.factory.createIdentifier(
                                        (vs.declarationList.declarations[0].name as ts.Identifier).text
                                    ),
                                    ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier('Symbol'),
                                        ts.factory.createIdentifier('dispose')
                                    )
                                ),
                                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                undefined,
                                undefined
                            )
                        );
                        newStatements.push(
                            ts.factory.createTryStatement(
                                ts.factory.createBlock(tryStatements),
                                undefined,
                                ts.factory.createBlock([freeResource])
                            )
                        );
                    } else {
                        newStatements.push(visitor(node) as ts.Statement);
                    }
                }

                return ts.factory.createBlock(newStatements, true);
            };

            const visitor = (node: ts.Node) => {
                if (ts.isBlock(node)) {
                    return rewriteElementStyleHelper(node);
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitEachChild(source, visitor, context);
        };
    };
}

