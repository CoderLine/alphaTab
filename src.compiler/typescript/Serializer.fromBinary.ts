import * as ts from 'typescript';
import { addNewLines, getTypeWithNullableInfo, hasFlag, isEnumType, isMap, isTypedArray, unwrapArrayItemType } from '../BuilderHelpers';
import { findModule, findSerializerModule, JsonProperty } from './Serializer.common';

export function createFromBinaryMethod(
    program: ts.Program,
    input: ts.ClassDeclaration,
    propertiesToSerialize: JsonProperty[],
    importer: (name: string, module: string) => void
) {
    importer('IReadable', '@src/io/IReadable');
    return ts.factory.createMethodDeclaration(
        undefined,
        [
            ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
            ts.factory.createModifier(ts.SyntaxKind.StaticKeyword)
        ],
        undefined,
        'fromBinary',
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
                'r',
                undefined,
                ts.factory.createTypeReferenceNode('IReadable', undefined),
            )
        ],
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
        generateFromBinaryBody(program, propertiesToSerialize, importer)
    );
}

function generateFromBinaryBody(program: ts.Program, propertiesToSerialize: JsonProperty[], importer: (name: string, module: string) => void) {
    const statements: ts.Statement[] = [];

    statements.push(
        ts.factory.createIfStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier('IOHelper'),
                    'readNull'
                ),
                undefined,
                [ts.factory.createIdentifier('r')]
            ),
            ts.factory.createBlock([
                ts.factory.createReturnStatement()
            ])
        )
    );

    for (let prop of propertiesToSerialize) {
        const fieldName = (prop.property.name as ts.Identifier).text;
        const jsonName = prop.jsonNames.filter(n => n !== '')[0];
        if (!jsonName) {
            continue;
        }

        const typeChecker = program.getTypeChecker();
        const type = getTypeWithNullableInfo(typeChecker, prop.property.type!);
        const isArray = isTypedArray(type.type!);

        let propertyStatements: ts.Statement[] = [];

        function assign(expr: ts.Expression): ts.Statement {
            return ts.factory.createExpressionStatement(ts.factory.createAssignment(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                expr
            ));
        }

        let primitiveRead = getPrimitiveReadMethod(type.type!, typeChecker);
        if (primitiveRead) {
            if (type.isNullable) {
                propertyStatements.push(
                    ts.factory.createIfStatement(
                        ts.factory.createPrefixUnaryExpression(ts.SyntaxKind.ExclamationToken,
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier('IOHelper'),
                                    'readNull'
                                ),
                                undefined,
                                [ts.factory.createIdentifier('r')]
                            )
                        ),
                        ts.factory.createBlock([
                            assign(ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('IOHelper'), primitiveRead),
                                undefined,
                                [
                                    ts.factory.createIdentifier('r'),
                                ]
                            ))
                        ])
                    )
                );
            } else {
                propertyStatements.push(
                    assign(ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('IOHelper'), primitiveRead),
                        undefined,
                        [
                            ts.factory.createIdentifier('r'),
                        ]
                    ))
                );
            }
        } else if (isEnumType(type.type!)) {
            if (type.isNullable) {
                propertyStatements.push(
                    ts.factory.createIfStatement(
                        ts.factory.createPrefixUnaryExpression(ts.SyntaxKind.ExclamationToken,
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier('IOHelper'),
                                    'readNull'
                                ),
                                undefined,
                                [ts.factory.createIdentifier('r')]
                            )
                        ),
                        ts.factory.createBlock([
                            assign(ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('JsonHelper'), 'parseEnum'),
                                [ts.factory.createTypeReferenceNode(type.type.symbol.name)],
                                [
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier('IOHelper'),
                                            'readInt32LE'
                                        ),
                                        undefined,
                                        [ts.factory.createIdentifier('r')]
                                    ),
                                    ts.factory.createIdentifier(type.type.symbol.name)
                                ]
                            )
                            )
                        ])
                    )
                );
            } else {
                propertyStatements.push(
                    assign(ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('JsonHelper'), 'parseEnum'),
                        [ts.factory.createTypeReferenceNode(type.type.symbol.name)],
                        [
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier('IOHelper'),
                                    'readInt32LE'
                                ),
                                undefined,
                                [ts.factory.createIdentifier('r')]
                            ),
                            ts.factory.createIdentifier(type.type.symbol.name)
                        ]
                    ))
                );
            }
        } else if (isArray) {
            const arrayItemType = unwrapArrayItemType(type.type!, typeChecker)!;
            const collectionAddMethod = ts
                .getJSDocTags(prop.property)
                .filter(t => t.tagName.text === 'json_add')
                .map(t => t.comment ?? '')[0] as string;

            let itemSerializer = arrayItemType.symbol.name + 'Serializer';
            importer(itemSerializer, findSerializerModule(arrayItemType, program.getCompilerOptions()));
            importer(arrayItemType.symbol.name, findModule(arrayItemType, program.getCompilerOptions()));

            const loopItems = [
                assign(ts.factory.createArrayLiteralExpression(undefined)),
                ts.factory.createVariableStatement(undefined, ts.factory.createVariableDeclarationList([
                    ts.factory.createVariableDeclaration('length', undefined, undefined,
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier('IOHelper'),
                                'readInt32LE'
                            ),
                            undefined,
                            [ts.factory.createIdentifier('r')]
                        )
                    )
                ], ts.NodeFlags.Const)),
                ts.factory.createForStatement(
                    ts.factory.createVariableDeclarationList([
                        ts.factory.createVariableDeclaration('i', undefined, undefined, ts.factory.createNumericLiteral("0"))
                    ], ts.NodeFlags.Let),
                    ts.factory.createBinaryExpression(ts.factory.createIdentifier('i'), ts.SyntaxKind.LessThanToken, ts.factory.createIdentifier('length')),
                    ts.factory.createPostfixIncrement(ts.factory.createIdentifier('i')),
                    ts.factory.createBlock(
                        [
                            ts.factory.createVariableStatement(
                                undefined,
                                ts.factory.createVariableDeclarationList(
                                    [
                                        ts.factory.createVariableDeclaration(
                                            'it',
                                            undefined,
                                            undefined,
                                            ts.factory.createNewExpression(
                                                ts.factory.createIdentifier(arrayItemType.symbol.name),
                                                undefined,
                                                []
                                            )
                                        )
                                    ],
                                    ts.NodeFlags.Const
                                )
                            ),
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(itemSerializer),
                                    'fromBinary'
                                ),
                                undefined,
                                [
                                    ts.factory.createIdentifier('it'), 
                                    ts.factory.createIdentifier('r')
                                ]
                            ),
                            ts.factory.createExpressionStatement(
                                collectionAddMethod
                                    ? // obj.addFieldName(i)
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier('obj'),
                                            collectionAddMethod
                                        ),
                                        undefined,
                                        [ts.factory.createIdentifier('it')]
                                    )
                                    : // obj.fieldName.push(i)
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createIdentifier('obj'),
                                                fieldName
                                            ),
                                            'push'
                                        ),
                                        undefined,
                                        [ts.factory.createIdentifier('it')]
                                    )
                            )
                        ].filter(s => !!s) as ts.Statement[]
                    )
                )
            ];

            if (type.isNullable) {
                propertyStatements.push(
                    ts.factory.createIfStatement(ts.factory.createIdentifier('v'), ts.factory.createBlock(loopItems))
                );
            } else {
                propertyStatements.push(ts.factory.createBlock(loopItems));
            }
        } else if (isMap(type.type)) {
            
        }

        if (prop.target) {
            propertyStatements = propertyStatements.map(s =>
                ts.addSyntheticLeadingComment(s, ts.SyntaxKind.MultiLineCommentTrivia, `@target ${prop.target}`, true)
            );
        }

        statements.push(...propertyStatements);
    }


    return ts.factory.createBlock(addNewLines(statements));
}

function getPrimitiveReadMethod(type: ts.Type, typeChecker: ts.TypeChecker): string | null {
    if (!type) {
        return null;
    }

    const isArray = isTypedArray(type);
    const arrayItemType = unwrapArrayItemType(type, typeChecker);

    if (hasFlag(type, ts.TypeFlags.Unknown)) {
        return 'readUnknown';
    }
    if (hasFlag(type, ts.TypeFlags.Number)) {
        return 'readNumber';
    }
    if (hasFlag(type, ts.TypeFlags.String)) {
        return 'readString';
    }
    if (hasFlag(type, ts.TypeFlags.Boolean)) {
        return 'readBoolean';
    }

    if (arrayItemType) {
        if (isArray && hasFlag(arrayItemType, ts.TypeFlags.Number)) {
            return 'readNumberArray';
        }
        if (isArray && hasFlag(arrayItemType, ts.TypeFlags.String)) {
            return 'readStringArray';
        }
        if (isArray && hasFlag(arrayItemType, ts.TypeFlags.Boolean)) {
            return 'readBooleanArray';
        }
    } else if (type.symbol) {
        switch (type.symbol.name) {
            case 'Uint8Array':
            case 'Uint16Array':
            case 'Uint32Array':
            case 'Int8Array':
            case 'Int16Array':
            case 'Int32Array':
            case 'Float32Array':
            case 'Float64Array':
                return 'read' + type.symbol.name;
        }
    }

    return null;
}