import * as ts from 'typescript';
import { addNewLines } from '../BuilderHelpers';

function generateFromJsonBody(isStrict:boolean, importer: (name: string, module: string) => void) {
    importer('JsonHelper', '@src/io/JsonHelper');
    return ts.factory.createBlock(
        addNewLines([
            ts.factory.createIfStatement(
                ts.factory.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    ts.factory.createIdentifier('m')
                ),
                ts.factory.createBlock([ts.factory.createReturnStatement()])
            ),
            ts.factory.createExpressionStatement(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('JsonHelper'), 'forEach'),
                    undefined,
                    [
                        ts.factory.createIdentifier('m'),
                        ts.factory.createArrowFunction(
                            undefined,
                            undefined,
                            [
                                ts.factory.createParameterDeclaration(undefined, undefined, undefined, 'v'),
                                ts.factory.createParameterDeclaration(undefined, undefined, undefined, 'k')
                            ],
                            undefined,
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'setProperty'),
                                undefined,
                                [
                                    ts.factory.createIdentifier('obj'),
                                    isStrict ? ts.factory.createIdentifier('k') :
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier('k'),
                                            'toLowerCase'
                                        ),
                                        undefined,
                                        []
                                    ),
                                    ts.factory.createIdentifier('v')
                                ]
                            )
                        )
                    ]
                )
            )
        ])
    );
}

export function createFromJsonMethod(input: ts.ClassDeclaration, isStrict: boolean, importer: (name: string, module: string) => void) {
    return ts.factory.createMethodDeclaration(
        undefined,
        [
            ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
            ts.factory.createModifier(ts.SyntaxKind.StaticKeyword)
        ],
        undefined,
        'fromJson',
        undefined,
        undefined,
        [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                'obj',
                undefined,
                ts.factory.createTypeReferenceNode(input.name!.text, undefined)
            ),
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                'm',
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
            )
        ],
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
        generateFromJsonBody(isStrict, importer)
    );
}