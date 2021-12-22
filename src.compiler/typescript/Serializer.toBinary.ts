import * as ts from 'typescript';
import { addNewLines, getTypeWithNullableInfo, hasFlag, isEnumType, isMap, isTypedArray, unwrapArrayItemType } from '../BuilderHelpers';
import { findModule, findSerializerModule, isImmutable, JsonProperty } from './Serializer.common';

export function createToBinaryMethod(
    program: ts.Program,
    input: ts.ClassDeclaration,
    propertiesToSerialize: JsonProperty[],
    importer: (name: string, module: string) => void
) {
    importer('IWriteable', '@src/io/IWriteable');
    importer('IOHelper', '@src/io/IOHelper');
    return ts.factory.createMethodDeclaration(
        undefined,
        [
            ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
            ts.factory.createModifier(ts.SyntaxKind.StaticKeyword)
        ],
        undefined,
        'toBinary',
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
            ),
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                'w',
                undefined,
                ts.factory.createTypeReferenceNode('IWritable', undefined),
            )
        ],
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
        generateToBinaryBody(program, propertiesToSerialize, importer)
    );
}

function generateToBinaryBody(program: ts.Program, propertiesToSerialize: JsonProperty[], importer: (name: string, module: string) => void): ts.Block {
    const statements: ts.Statement[] = [];

    statements.push(
        ts.factory.createIfStatement(
            ts.factory.createPrefixUnaryExpression(ts.SyntaxKind.ExclamationToken, ts.factory.createIdentifier('obj')),
            ts.factory.createBlock([
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier('IOHelper'),
                            'writeNull'
                        ),
                        undefined,
                        [ts.factory.createIdentifier('w')]
                    )
                ),
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

        const primitiveWrite = getPrimitiveWriteMethod(type.type!, typeChecker);
        if (primitiveWrite) {
            propertyStatements.push(
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('IOHelper'), primitiveWrite),
                        undefined,
                        [
                            ts.factory.createIdentifier('w'),
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName)
                        ]
                    )
                )
            );
        } else if (isEnumType(type.type!)) {
            if (type.isNullable) {
                propertyStatements.push(
                    ts.factory.createIfStatement(
                        ts.factory.createBinaryExpression(
                            ts.factory.createTypeOfExpression(ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName)),
                            ts.SyntaxKind.EqualsEqualsEqualsToken,
                            ts.factory.createStringLiteral('number')
                        ),
                        ts.factory.createBlock([
                            ts.factory.createExpressionStatement(
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('IOHelper'), 'writeInt32LE'),
                                    undefined,
                                    [
                                        ts.factory.createIdentifier('w'),
                                        ts.factory.createAsExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createIdentifier('obj'),
                                                fieldName
                                            ),
                                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
                                        )
                                    ]
                                )
                            )
                        ]),
                        ts.factory.createBlock([
                            ts.factory.createExpressionStatement(
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier('IOHelper'),
                                        'writeNull'
                                    ),
                                    undefined,
                                    [ts.factory.createIdentifier('w')]
                                )
                            )
                        ])
                    )
                );
            }
            else {
                propertyStatements.push(
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('IOHelper'), 'writeInt32LE'),
                            undefined,
                            [
                                ts.factory.createIdentifier('w'),
                                ts.factory.createAsExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier('obj'),
                                        fieldName
                                    ),
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
                                )
                            ]
                        )
                    )
                );
            }
        } else if (isArray) {
            const arrayItemType = unwrapArrayItemType(type.type!, typeChecker)!;
            let itemSerializer = arrayItemType.symbol.name + 'Serializer';
            importer(itemSerializer, findSerializerModule(arrayItemType, program.getCompilerOptions()));

            propertyStatements.push(
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('IOHelper'), 'writeInt32LE'),
                        undefined,
                        [
                            ts.factory.createIdentifier('w'),
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier('obj'),
                                    fieldName
                                ),
                                'length'
                            ),
                        ]
                    )
                )
            );

            propertyStatements.push(
                ts.factory.createForOfStatement(undefined,
                    ts.factory.createVariableDeclarationList(
                        [ts.factory.createVariableDeclaration('o')],
                        ts.NodeFlags.Const
                    ),
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier('obj'),
                        fieldName
                    ),
                    ts.factory.createBlock([
                        ts.factory.createExpressionStatement(
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(itemSerializer),
                                    'toBinary'
                                ),
                                undefined,
                                [
                                    ts.factory.createIdentifier('w'),
                                    ts.factory.createIdentifier('i')
                                ]
                            )
                        )
                    ])
                )
            );
        } else if (isMap(type.type)) {
            const mapType = type.type as ts.TypeReference;

            let writeKey: ts.Expression;
            const primitiveKeyWrite = getPrimitiveWriteMethod(mapType.typeArguments![0], typeChecker);
            if (primitiveKeyWrite) {
                writeKey = ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("IOHelper"),
                        primitiveKeyWrite
                    ),
                    undefined,
                    [
                        ts.factory.createIdentifier('w'),
                        ts.factory.createIdentifier('k')
                    ]
                );
            } else if (isEnumType(mapType.typeArguments![0])) {
                writeKey = ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('IOHelper'), 'writeInt32LE'),
                    undefined,
                    [
                        ts.factory.createIdentifier('w'),
                        ts.factory.createAsExpression(
                            ts.factory.createIdentifier('k'),
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
                        )
                    ]
                );
            } else {
                throw new Error('only Map<Primitive, *> maps are supported extend if needed: ' + mapType.typeArguments![0].symbol.name);
            }

            propertyStatements.push(
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('IOHelper'), 'writeInt32LE'),
                        undefined,
                        [
                            ts.factory.createIdentifier('w'),
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier('obj'),
                                    fieldName
                                ),
                                'size'
                            ),
                        ]
                    )
                )
            );

            let writeValue: ts.Expression;
            const primitiveValueWrite = getPrimitiveWriteMethod(mapType.typeArguments![1], typeChecker);
            if (primitiveValueWrite) {
                writeValue = ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("IOHelper"),
                        primitiveValueWrite
                    ),
                    undefined,
                    [
                        ts.factory.createIdentifier('w'),
                        ts.factory.createIdentifier('v')
                    ]
                );
            } else if (isEnumType(mapType.typeArguments![1])) {
                writeValue = ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('IOHelper'), 'writeInt32LE'),
                    undefined,
                    [
                        ts.factory.createIdentifier('w'),
                        ts.factory.createAsExpression(
                            ts.factory.createIdentifier('v'),
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
                        )
                    ]
                );
            } else {
                const itemSerializer = mapType.typeArguments![1].symbol.name + 'Serializer';
                importer(itemSerializer, findSerializerModule(mapType.typeArguments![1], program.getCompilerOptions()));

                writeValue = ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'toBinary'),
                    undefined,
                    [
                        ts.factory.createIdentifier('w'),
                        ts.factory.createIdentifier('v'),
                    ]
                );
            }

            propertyStatements.push(
                ts.factory.createForOfStatement(undefined,
                    ts.factory.createVariableDeclarationList(
                        [ts.factory.createVariableDeclaration(
                            ts.factory.createArrayBindingPattern([
                                ts.factory.createBindingElement(undefined, undefined, 'k', undefined),
                                ts.factory.createBindingElement(undefined, undefined, 'v', undefined),
                            ])
                        )],
                        ts.NodeFlags.Const
                    ),
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier('obj'),
                        fieldName
                    ),
                    ts.factory.createBlock([
                        ts.factory.createExpressionStatement(
                            writeKey
                        ),

                        ts.factory.createExpressionStatement(
                            writeValue
                        )
                    ])
                )
            );
        } else if (isImmutable(type.type)) {
            let itemSerializer = type.type.symbol.name;
            importer(itemSerializer, findModule(type.type, program.getCompilerOptions()));
            propertyStatements.push(
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(itemSerializer),
                            'toBinary'
                        ),
                        [],
                        [
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier('obj'),
                                fieldName
                            ),
                            ts.factory.createIdentifier('w')
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
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(itemSerializer),
                            'toBinary'
                        ),
                        [],
                        [
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier('obj'),
                                fieldName
                            ),
                            ts.factory.createIdentifier('w')
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

    return ts.factory.createBlock(addNewLines(statements));
}

function getPrimitiveWriteMethod(type: ts.Type, typeChecker: ts.TypeChecker): string | null {
    if (!type) {
        return null;
    }

    const isArray = isTypedArray(type);
    const arrayItemType = unwrapArrayItemType(type, typeChecker);

    if (hasFlag(type, ts.TypeFlags.Unknown)) {
        return 'writeUnknown';
    }
    if (hasFlag(type, ts.TypeFlags.Number)) {
        return 'writeNumber';
    }
    if (hasFlag(type, ts.TypeFlags.String)) {
        return 'writeString';
    }
    if (hasFlag(type, ts.TypeFlags.Boolean)) {
        return 'writeBoolean';
    }

    if (arrayItemType) {
        if (isArray && hasFlag(arrayItemType, ts.TypeFlags.Number)) {
            return 'writeNumberArray';
        }
        if (isArray && hasFlag(arrayItemType, ts.TypeFlags.String)) {
            return 'writeStringArray';
        }
        if (isArray && hasFlag(arrayItemType, ts.TypeFlags.Boolean)) {
            return 'writeBooleanArray';
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
                return 'write' + type.symbol.name;
        }
    }

    return null;
}