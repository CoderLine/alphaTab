import * as ts from 'typescript';
import { addNewLines } from '../BuilderHelpers';
import { isPrimitiveType } from '../BuilderHelpers';
import { hasFlag } from '../BuilderHelpers';
import { getTypeWithNullableInfo } from '../BuilderHelpers';
import { isTypedArray } from '../BuilderHelpers';
import { unwrapArrayItemType } from '../BuilderHelpers';
import { isMap } from '../BuilderHelpers';
import { isEnumType } from '../BuilderHelpers';
import { createStringUnknownMapNode, findModule, findSerializerModule, isImmutable, JsonProperty } from './Serializer.common';

function isPrimitiveToJson(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (!type) {
        return false;
    }

    const isArray = isTypedArray(type);
    const arrayItemType = unwrapArrayItemType(type, typeChecker);

    if (hasFlag(type, ts.TypeFlags.Unknown)) {
        return true;
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

    if (arrayItemType) {
        if (isArray && hasFlag(arrayItemType, ts.TypeFlags.Number)) {
            return true;
        }
        if (isArray && hasFlag(arrayItemType, ts.TypeFlags.String)) {
            return true;
        }
        if (isArray && hasFlag(arrayItemType, ts.TypeFlags.Boolean)) {
            return true;
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
                return true;
        }
    }

    return false;
}

function generateToJsonBody(
    program: ts.Program,
    propertiesToSerialize: JsonProperty[],
    importer: (name: string, module: string) => void
) {
    const statements: ts.Statement[] = [];

    statements.push(
        ts.factory.createIfStatement(
            ts.factory.createPrefixUnaryExpression(ts.SyntaxKind.ExclamationToken, ts.factory.createIdentifier('obj')),
            ts.factory.createBlock([ts.factory.createReturnStatement(ts.factory.createNull())])
        )
    );

    statements.push(
        ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        'o',
                        undefined,
                        undefined,
                        ts.factory.createNewExpression(
                            ts.factory.createIdentifier('Map'),
                            [
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                            ],
                            []
                        )
                    )
                ],
                ts.NodeFlags.Const
            )
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

        if (isPrimitiveToJson(type.type!, typeChecker)) {
            propertyStatements.push(
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('o'), 'set'),
                        undefined,
                        [
                            ts.factory.createStringLiteral(jsonName),
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName)
                        ]
                    )
                )
            );
        } else if (isEnumType(type.type!)) {
            propertyStatements.push(
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('o'), 'set'),
                        undefined,
                        [
                            ts.factory.createStringLiteral(jsonName),
                            ts.factory.createAsExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier('obj'),
                                    fieldName
                                ),
                                type.isNullable
                                    ? ts.factory.createUnionTypeNode([
                                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                                        ts.factory.createLiteralTypeNode(ts.factory.createNull())
                                    ])
                                    : ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
                            )
                        ]
                    )
                )
            );
        } else if (isArray) {
            const arrayItemType = unwrapArrayItemType(type.type!, typeChecker)!;
            let itemSerializer = arrayItemType.symbol.name + 'Serializer';
            importer(itemSerializer, findSerializerModule(arrayItemType, program.getCompilerOptions()));

            propertyStatements.push(
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('o'), 'set'),
                        undefined,
                        [
                            ts.factory.createStringLiteral(jsonName),
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier('obj'),
                                        fieldName
                                    ),
                                    'map'
                                ),
                                undefined,
                                [
                                    ts.factory.createArrowFunction(
                                        undefined,
                                        undefined,
                                        [ts.factory.createParameterDeclaration(undefined, undefined, undefined, 'i')],
                                        undefined,
                                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                        ts.factory.createCallExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createIdentifier(itemSerializer),
                                                'toJson'
                                            ),
                                            undefined,
                                            [ts.factory.createIdentifier('i')]
                                        )
                                    )
                                ]
                            )
                        ]
                    )
                )
            );
        } else if (isMap(type.type)) {
            const mapType = type.type as ts.TypeReference;
            if (!isPrimitiveType(mapType.typeArguments![0])) {
                throw new Error('only Map<Primitive, *> maps are supported extend if needed!');
            }

            let writeValue: ts.Expression;
            if (isPrimitiveToJson(mapType.typeArguments![1], typeChecker)) {
                writeValue = ts.factory.createIdentifier('v');
            } else if (isEnumType(mapType.typeArguments![1])) {
                writeValue = ts.factory.createAsExpression(
                    ts.factory.createIdentifier('v'),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
                );
            } else {
                const itemSerializer = mapType.typeArguments![1].symbol.name + 'Serializer';
                importer(itemSerializer, findSerializerModule(mapType.typeArguments![1], program.getCompilerOptions()));

                writeValue = ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'toJson'),
                    undefined,
                    [ts.factory.createIdentifier('v')]
                );
            }

            propertyStatements.push(
                ts.factory.createBlock([
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    'm',
                                    undefined,
                                    undefined,
                                    ts.factory.createNewExpression(
                                        ts.factory.createIdentifier('Map'),
                                        [
                                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                                        ],
                                        []
                                    )
                                )
                            ],
                            ts.NodeFlags.Const
                        )
                    ),
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('o'), 'set'),
                            undefined,
                            [ts.factory.createStringLiteral(jsonName), ts.factory.createIdentifier('m')]
                        )
                    ),

                    ts.factory.createForOfStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    ts.factory.createArrayBindingPattern([
                                        ts.factory.createBindingElement(undefined, undefined, 'k'),
                                        ts.factory.createBindingElement(undefined, undefined, 'v')
                                    ])
                                )
                            ],
                            ts.NodeFlags.Const
                        ),
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                        ts.factory.createBlock([
                            ts.factory.createExpressionStatement(
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('m'), 'set'),
                                    undefined,
                                    [
                                        // todo: key to string
                                        ts.factory.createCallExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createIdentifier('k'),
                                                'toString'
                                            ),
                                            undefined,
                                            []
                                        ),
                                        writeValue
                                    ]
                                )
                            )
                        ])
                    )
                ])
            );
        } else if (isImmutable(type.type)) {
            let itemSerializer = type.type.symbol.name;
            importer(itemSerializer, findModule(type.type, program.getCompilerOptions()));
            propertyStatements.push(
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('o'), 'set'),
                        undefined,
                        [
                            ts.factory.createStringLiteral(jsonName),
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(itemSerializer),
                                    'toJson'
                                ),
                                [],
                                [
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier('obj'),
                                        fieldName
                                    )
                                ]
                            )
                        ]
                    )
                )
            );
        } else {
            let itemSerializer = type.type.symbol.name + 'Serializer';
            importer(itemSerializer, findSerializerModule(type.type, program.getCompilerOptions()));
            propertyStatements.push(
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('o'), 'set'),
                        undefined,
                        [
                            ts.factory.createStringLiteral(jsonName),
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(itemSerializer),
                                    'toJson'
                                ),
                                [],
                                [
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier('obj'),
                                        fieldName
                                    )
                                ]
                            )
                        ]
                    )
                )
            );
        }

        if (prop.target) {
            propertyStatements = propertyStatements.map(s =>
                ts.addSyntheticLeadingComment(s, ts.SyntaxKind.MultiLineCommentTrivia, `@target ${prop.target}`, true)
            );
        }

        statements.push(...propertyStatements);
    }

    statements.push(ts.factory.createReturnStatement(ts.factory.createIdentifier('o')));

    return ts.factory.createBlock(addNewLines(statements));
}

export function createToJsonMethod(
    program: ts.Program,
    input: ts.ClassDeclaration,
    propertiesToSerialize: JsonProperty[],
    importer: (name: string, module: string) => void
) {
    return ts.factory.createMethodDeclaration(
        undefined,
        [
            ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
            ts.factory.createModifier(ts.SyntaxKind.StaticKeyword)
        ],
        undefined,
        'toJson',
        undefined,
        undefined,
        [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                'obj',
                undefined,
                ts.factory.createUnionTypeNode([
                    ts.factory.createTypeReferenceNode(input.name!.text, undefined),
                    ts.factory.createLiteralTypeNode(ts.factory.createNull())
                ])
            )
        ],
        ts.factory.createUnionTypeNode([
            createStringUnknownMapNode(),
            ts.factory.createLiteralTypeNode(ts.factory.createNull())
        ]),
        generateToJsonBody(program, propertiesToSerialize, importer)
    );
}
