/**
 * This file contains an emitter which generates classes to serialize
 * any data models to and from JSON following certain rules.
 */

import * as path from 'path';
import * as ts from 'typescript';
import createEmitter from './EmitterBase'
import { addNewLines } from '../BuilderHelpers';
import { isPrimitiveType } from '../BuilderHelpers';
import { hasFlag } from '../BuilderHelpers';
import { getTypeWithNullableInfo } from '../BuilderHelpers';
import { isTypedArray } from '../BuilderHelpers';
import { unwrapArrayItemType } from '../BuilderHelpers';
import { isMap } from '../BuilderHelpers';
import { isEnumType } from '../BuilderHelpers';
import { isNumberType } from '../BuilderHelpers';
import { wrapToNonNull } from '../BuilderHelpers';

interface JsonProperty {
    partialNames: boolean;
    property: ts.PropertyDeclaration;
    jsonNames: string[];
    target?: string;
}

function isImmutable(type: ts.Type | null): boolean {
    if (!type || !type.symbol) {
        return false;
    }

    const declaration = type.symbol.valueDeclaration;
    if (declaration) {
        return !!ts.getJSDocTags(declaration).find(t => t.tagName.text === 'json_immutable');
    }

    return false;
}

function removeExtension(fileName: string) {
    return fileName.substring(0, fileName.lastIndexOf('.'));
}

function toImportPath(fileName: string) {
    return "@" + removeExtension(fileName).split('\\').join('/');
}

function findModule(type: ts.Type, options: ts.CompilerOptions) {
    if (type.symbol) {
        for (const decl of type.symbol.declarations) {
            const file = decl.getSourceFile();
            if (file) {
                const relative = path.relative(
                    path.join(path.resolve(options.baseUrl!)),
                    path.resolve(file.fileName)
                );
                return toImportPath(relative);
            }
        }

        return './' + type.symbol.name;
    }

    return '';
}

function findSerializerModule(type: ts.Type, options: ts.CompilerOptions) {
    let module = findModule(type, options);
    const importPath = module.split('/');
    importPath.splice(1, 0, 'generated');
    return importPath.join('/') + 'Serializer';
}

//
// fromJson
function generateFromJsonBody() {
    return ts.factory.createBlock(addNewLines([
        ts.factory.createIfStatement(
            ts.factory.createBinaryExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('r'), 'currentValueType'),
                ts.SyntaxKind.EqualsEqualsEqualsToken,
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('JsonValueType'), 'Null'),
            ),
            ts.factory.createBlock([
                ts.factory.createReturnStatement()
            ])
        ),
        ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('r'), 'startObject'),
                undefined,
                []
            )
        ),
        ts.factory.createWhileStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('r'), 'nextProp'),
                undefined,
                []
            ),
            ts.factory.createBlock([
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'setProperty'),
                        undefined,
                        [
                            ts.factory.createIdentifier('obj'),
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('r'), 'prop'),
                                        undefined,
                                        []
                                    ),
                                    'toLowerCase'
                                ),
                                undefined,
                                []
                            ),
                            ts.factory.createIdentifier('r'),
                        ]
                    )
                )
            ])
        ),
        ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('r'), 'endObject'),
                undefined,
                []
            )
        ),
    ]));
}

function createFromJsonMethod(input: ts.ClassDeclaration,
    importer: (name: string, module: string) => void) {
    importer('IJsonReader', '@src/io/IJsonReader');
    importer('JsonValueType', '@src/io/IJsonReader');
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
                ts.factory.createTypeReferenceNode(
                    input.name!.text,
                    undefined
                ),
            ),
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                'r',
                undefined,
                ts.factory.createTypeReferenceNode('IJsonReader')
            )
        ],
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
        generateFromJsonBody()
    )
}

//
// toJson
function getWriteMethodNameForPrimitive(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (!type) {
        return null;
    }

    const isArray = isTypedArray(type);
    const arrayItemType = unwrapArrayItemType(type, typeChecker);

    if (hasFlag(type, ts.TypeFlags.Unknown)) {
        return "unknown";
    }
    if (hasFlag(type, ts.TypeFlags.Number)) {
        return "number";
    }
    if (hasFlag(type, ts.TypeFlags.String)) {
        return "string";
    }
    if (hasFlag(type, ts.TypeFlags.Boolean)) {
        return "boolean";
    }

    if (isEnumType(type)) {
        return 'enum';
    }

    if (arrayItemType) {
        if (isArray && hasFlag(arrayItemType, ts.TypeFlags.Number)) {
            return "numberArray";
        }
        if (isArray && hasFlag(arrayItemType, ts.TypeFlags.String)) {
            return "stringArray";
        }
        if (isArray && hasFlag(arrayItemType, ts.TypeFlags.Boolean)) {
            return "booleanArray";
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
                return type.symbol.name.substring(0, 1).toLowerCase() + type.symbol.name.substring(1);
        }
    }

    return null;
}

function generateToJsonBody(
    program: ts.Program,
    propertiesToSerialize: JsonProperty[],
    importer: (name: string, module: string) => void) {

    const statements: ts.Statement[] = [];

    statements.push(ts.factory.createIfStatement(
        ts.factory.createPrefixUnaryExpression(
            ts.SyntaxKind.ExclamationToken,
            ts.factory.createIdentifier('obj')
        ),
        ts.factory.createBlock([
            ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('w'), 'null'),
                undefined, []
            )),
            ts.factory.createReturnStatement()
        ])
    ))

    statements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('w'), 'startObject'),
        undefined, []
    )));

    for (let prop of propertiesToSerialize) {
        const fieldName = (prop.property.name as ts.Identifier).text;
        const jsonName = prop.jsonNames.filter(n => n !== '')[0];

        if (!jsonName) {
            continue;
        }
        const typeChecker = program.getTypeChecker();
        const type = getTypeWithNullableInfo(typeChecker, prop.property.type!);
        const isArray = isTypedArray(type.type!);

        let writeValueMethodName: string | null = getWriteMethodNameForPrimitive(type.type!, typeChecker);

        let propertyStatements: ts.Statement[] = [];

        if (writeValueMethodName) {
            propertyStatements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('w'), writeValueMethodName),
                undefined,
                [
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                    ts.factory.createStringLiteral(jsonName),
                ]
            )));
        } else if (isArray) {
            // NOTE: nullable Object arrays are not yet supported
            propertyStatements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('w'), 'prop'),
                undefined,
                [
                    ts.factory.createStringLiteral(jsonName)
                ]
            )));

            const arrayItemType = unwrapArrayItemType(type.type!, typeChecker)!;

            let itemSerializer = arrayItemType.symbol.name + "Serializer";
            importer(itemSerializer, findSerializerModule(arrayItemType, program.getCompilerOptions()));

            propertyStatements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('w'), 'startArray'),
                undefined,
                []
            )));

            propertyStatements.push(ts.factory.createForOfStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [ts.factory.createVariableDeclaration('i')],
                    ts.NodeFlags.Const
                ),
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                ts.factory.createBlock([
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'toJson'),
                            undefined,
                            [
                                ts.factory.createIdentifier('i'),
                                ts.factory.createIdentifier('w')
                            ]
                        )
                    )
                ])
            ));

            propertyStatements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('w'), 'endArray'),
                undefined,
                []
            )));
        }
        else if (isMap(type.type)) {
            propertyStatements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('w'), 'prop'),
                undefined,
                [
                    ts.factory.createStringLiteral(jsonName)
                ]
            )));

            const mapType = type.type as ts.TypeReference;
            if (!isPrimitiveType(mapType.typeArguments![0])) {
                throw new Error('only Map<Primitive, *> maps are supported extend if needed!');
            }

            let itemSerializer: string;
            let writeValue: ts.Expression;
            if (isPrimitiveType(mapType.typeArguments![1])) {
                itemSerializer = '';
                writeValue = ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier('w'),
                        getWriteMethodNameForPrimitive(mapType.typeArguments![1], typeChecker)!
                    ),
                    undefined,
                    [ts.factory.createIdentifier('v')]
                );
            } else {
                itemSerializer = mapType.typeArguments![1].symbol.name + "Serializer";
                importer(itemSerializer, findSerializerModule(mapType.typeArguments![1], program.getCompilerOptions()));
                writeValue = ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'toJson'),
                    undefined,
                    [
                        ts.factory.createIdentifier('v'),
                        ts.factory.createIdentifier('w')
                    ]
                );
            }

            propertyStatements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('w'), 'startObject'),
                undefined,
                []
            )));

            propertyStatements.push(
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(ts.factory.createPropertyAccessExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName)
                        , 'forEach'), undefined, [
                        ts.factory.createArrowFunction(
                            undefined,
                            undefined,
                            [
                                ts.factory.createParameterDeclaration(undefined, undefined, undefined, 'v'),
                                ts.factory.createParameterDeclaration(undefined, undefined, undefined, 'k')
                            ],
                            undefined,
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.factory.createBlock([
                                ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('w'), 'prop'),
                                    undefined,
                                    [ts.factory.createIdentifier('k')]
                                )),
                                ts.factory.createExpressionStatement(writeValue)
                            ])
                        )
                    ])
                )
            );

            propertyStatements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('w'), 'endObject'),
                undefined,
                []
            )));

        } else if (isImmutable(type.type)) {
            propertyStatements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('w'), 'prop'),
                undefined,
                [
                    ts.factory.createStringLiteral(jsonName)
                ]
            )));

            let itemSerializer = type.type.symbol.name;
            importer(itemSerializer, findModule(type.type, program.getCompilerOptions()));
            propertyStatements.push(
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'toJson'),
                        [],
                        [
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                            ts.factory.createIdentifier('w')
                        ]
                    )
                )
            );
        } else {
            propertyStatements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('w'), 'prop'),
                undefined,
                [
                    ts.factory.createStringLiteral(jsonName)
                ]
            )));

            let itemSerializer = type.type.symbol.name + "Serializer";
            importer(itemSerializer, findSerializerModule(type.type, program.getCompilerOptions()));

            const writeValue: ts.Statement = ts.factory.createExpressionStatement(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'toJson'),
                    [],
                    [
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                        ts.factory.createIdentifier('w'),
                    ]
                ));

            if (type.isNullable) {
                propertyStatements.push(ts.factory.createIfStatement(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                    ts.factory.createBlock([
                        writeValue
                    ]),
                    ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('w'), 'null'),
                        undefined,
                        []
                    ))
                ));
            } else {
                propertyStatements.push(writeValue);
            }
        }

        if (prop.target) {
            propertyStatements = propertyStatements.map(s => ts.addSyntheticLeadingComment(s, ts.SyntaxKind.MultiLineCommentTrivia, `@target ${prop.target}`, true));
        }

        statements.push(...propertyStatements);
    }

    statements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('w'), 'endObject'),
        undefined, []
    )));

    return ts.factory.createBlock(addNewLines(statements))
}

function createToJsonMethod(program: ts.Program,
    input: ts.ClassDeclaration,
    propertiesToSerialize: JsonProperty[],
    importer: (name: string, module: string) => void
) {
    importer('IJsonWriter', '@src/io/IJsonWriter');
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
                    ts.factory.createTypeReferenceNode(
                        input.name!.text,
                        undefined
                    ),
                    ts.factory.createLiteralTypeNode(ts.factory.createNull())
                ])
            ),
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                'w',
                undefined,
                ts.factory.createTypeReferenceNode('IJsonWriter')
            )
        ],
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
        generateToJsonBody(program, propertiesToSerialize, importer)
    )
}

//
// setProperty

function getReadMethodNameForPrimitive(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (!type) {
        return null;
    }

    const isArray = isTypedArray(type);
    const arrayItemType = unwrapArrayItemType(type, typeChecker);

    if (hasFlag(type, ts.TypeFlags.Unknown)) {
        return "unknown";
    }
    if (hasFlag(type, ts.TypeFlags.Number)) {
        return "number";
    }
    if (hasFlag(type, ts.TypeFlags.String)) {
        return "string";
    }
    if (hasFlag(type, ts.TypeFlags.Boolean)) {
        return "boolean";
    }

    if (arrayItemType) {
        if (isArray && hasFlag(arrayItemType, ts.TypeFlags.Number)) {
            return "numberArray";
        }
        if (isArray && hasFlag(arrayItemType, ts.TypeFlags.String)) {
            return "stringArray";
        }
        if (isArray && hasFlag(arrayItemType, ts.TypeFlags.Boolean)) {
            return "booleanArray";
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
                return type.symbol.name.substr(0, 1).toLowerCase() + type.symbol.name.substr(1);
        }
    }

    return null;

}

function createEnumMapping(type: ts.Type): ts.Expression {
    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('r'),
            'enum'
        ),
        [ts.factory.createTypeReferenceNode(type.symbol.name)],
        [
            ts.factory.createIdentifier(type.symbol.name)
        ]
    );
}

function generateSetPropertyBody(program: ts.Program,
    propertiesToSerialize: JsonProperty[],
    importer: (name: string, module: string) => void
) {
    const statements: ts.Statement[] = [];
    const cases: ts.CaseOrDefaultClause[] = [];

    const typeChecker = program.getTypeChecker();
    for (const prop of propertiesToSerialize) {
        const jsonNames = prop.jsonNames.map(j => j.toLowerCase());
        const caseValues: string[] = jsonNames.filter(j => j !== '');
        const fieldName = (prop.property.name as ts.Identifier).text;

        const caseStatements: ts.Statement[] = [];

        const type = getTypeWithNullableInfo(typeChecker, prop.property.type);

        const assignField = function (expr: ts.Expression): ts.Statement {
            return ts.factory.createExpressionStatement(
                ts.factory.createAssignment(ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName), expr)
            );
        };

        const primitiveRead = getReadMethodNameForPrimitive(type.type!, typeChecker);
        if (primitiveRead) {
            const read = ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier('r'),
                    primitiveRead
                ),
                undefined,
                []
            );
            if (type.isNullable) {
                caseStatements.push(assignField(read));
            } else {
                caseStatements.push(assignField(ts.factory.createNonNullExpression(read)));
            }
            caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
        } else if (isEnumType(type.type)) {
            // obj.fieldName = enummapping
            // return true;
            importer(type.type.symbol!.name, findModule(type.type, program.getCompilerOptions()));
            const read = createEnumMapping(type.type);
            if (type.isNullable) {
                caseStatements.push(assignField(read));
            } else {
                caseStatements.push(assignField(ts.factory.createNonNullExpression(read)));
            }
            caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
        } else if (isTypedArray(type.type!)) {
            const arrayItemType = unwrapArrayItemType(type.type!, typeChecker)!;
            const collectionAddMethod = ts.getJSDocTags(prop.property)
                .filter(t => t.tagName.text === 'json_add')
                .map(t => t.comment ?? "")[0];

            // obj.fieldName = [];
            // for(const i of value) {
            //    obj.addFieldName(Type.FromJson(i));
            // }
            // or
            // for(const __li of value) {
            //    obj.fieldName.push(Type.FromJson(__li));
            // }

            let itemSerializer = arrayItemType.symbol.name + "Serializer";
            importer(itemSerializer, findSerializerModule(arrayItemType, program.getCompilerOptions()));
            importer(arrayItemType.symbol.name, findModule(arrayItemType, program.getCompilerOptions()));

            const loopItems = [
                assignField(ts.factory.createArrayLiteralExpression(undefined)),
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('r'), 'startArray'),
                        undefined,
                        []
                    )
                ),
                ts.factory.createWhileStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('r'), 'nextItem'),
                        undefined,
                        []
                    ),
                    ts.factory.createBlock([
                        ts.factory.createVariableStatement(
                            undefined,
                            ts.factory.createVariableDeclarationList([
                                ts.factory.createVariableDeclaration('i',
                                    undefined,
                                    undefined,
                                    ts.factory.createNewExpression(
                                        ts.factory.createIdentifier(arrayItemType.symbol.name),
                                        undefined,
                                        []
                                    ))
                            ], ts.NodeFlags.Const)
                        ),
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'fromJson'),
                            undefined,
                            [
                                ts.factory.createIdentifier('i'),
                                ts.factory.createIdentifier('r')
                            ]
                        ),
                        ts.factory.createExpressionStatement(
                            collectionAddMethod
                                // obj.addFieldName(i)
                                ? ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier('obj'),
                                        collectionAddMethod
                                    ),
                                    undefined,
                                    [ts.factory.createIdentifier('i')]
                                )
                                // obj.fieldName.push(i)
                                : ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier('obj'),
                                            fieldName
                                        ),
                                        'push'
                                    ),
                                    undefined,
                                    [ts.factory.createIdentifier('i')]
                                )
                        )
                    ].filter(s => !!s) as ts.Statement[])
                ),
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('r'), 'endArray'),
                        undefined,
                        []
                    )
                ),
            ];

            if (type.isNullable) {
                caseStatements.push(ts.factory.createIfStatement(
                    ts.factory.createIdentifier('value'),
                    ts.factory.createBlock(loopItems)
                ));
            } else {
                caseStatements.push(...loopItems);
            }
            caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));

        } else if (isMap(type.type)) {
            const mapType = type.type as ts.TypeReference;
            if (!isPrimitiveType(mapType.typeArguments![0])) {
                throw new Error('only Map<EnumType, *> maps are supported extend if needed!');
            }

            let mapKey;
            if (isEnumType(mapType.typeArguments![0])) {
                importer(mapType.typeArguments![0].symbol!.name, findModule(mapType.typeArguments![0], program.getCompilerOptions()));
                mapKey = ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('r'), 'enumProp'),
                    [ts.factory.createTypeReferenceNode(mapType.typeArguments![0].symbol!.name)],
                    [ts.factory.createIdentifier(mapType.typeArguments![0].symbol!.name)]
                );
            } else if (isNumberType(mapType.typeArguments![0])) {
                mapKey = ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('r'), 'numberProp'),
                    undefined,
                    []
                );
            } else {
                mapKey = ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('r'), 'prop'),
                    undefined,
                    []
                );
            }

            let mapValue;
            let itemSerializer: string = '';
            const primitiveReadForValue = getReadMethodNameForPrimitive(mapType.typeArguments![1], typeChecker);
            if (primitiveReadForValue) {
                mapValue = ts.factory.createNonNullExpression(ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier('r'),
                        primitiveReadForValue
                    ),
                    undefined,
                    []
                ));
            } else {
                itemSerializer = mapType.typeArguments![1].symbol.name + "Serializer";
                importer(itemSerializer, findSerializerModule(mapType.typeArguments![1], program.getCompilerOptions()));
                importer(mapType.typeArguments![1]!.symbol.name, findModule(mapType.typeArguments![1], program.getCompilerOptions()));
                mapValue = ts.factory.createIdentifier('i');
            }

            const collectionAddMethod = ts.getJSDocTags(prop.property)
                .filter(t => t.tagName.text === 'json_add')
                .map(t => t.comment ?? "")[0];

            caseStatements.push(assignField(ts.factory.createNewExpression(ts.factory.createIdentifier('Map'), [
                typeChecker.typeToTypeNode(mapType.typeArguments![0], undefined, undefined)!,
                typeChecker.typeToTypeNode(mapType.typeArguments![1], undefined, undefined)!,
            ], [])));

            caseStatements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('r'), 'startObject'),
                undefined, []
            )));

            caseStatements.push(ts.factory.createWhileStatement(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('r'), 'nextProp'),
                    undefined,
                    []
                ),
                ts.factory.createBlock([
                    !primitiveReadForValue && ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList([
                            ts.factory.createVariableDeclaration('i',
                                undefined, undefined,
                                ts.factory.createNewExpression(ts.factory.createIdentifier(mapType.typeArguments![1].symbol.name), undefined, [])
                            )
                        ], ts.NodeFlags.Const),
                    ),
                    !primitiveReadForValue && ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(itemSerializer),
                                'fromJson'
                            ),
                            undefined,
                            [
                                ts.factory.createIdentifier('i'),
                                ts.factory.createIdentifier('r'),
                            ]
                        )
                    ),
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(
                            collectionAddMethod
                                ? ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), collectionAddMethod)
                                : ts.factory.createPropertyAccessExpression(
                                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), ts.factory.createIdentifier(fieldName)),
                                    ts.factory.createIdentifier('set')
                                ),
                            undefined,
                            [
                                mapKey,
                                mapValue
                            ]
                        )
                    )
                ].filter(s => !!s) as ts.Statement[])
            ));

            caseStatements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('r'), 'endObject'),
                undefined, []
            )));

            caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
        } else if (isImmutable(type.type)) {
            let itemSerializer = type.type.symbol.name;
            importer(itemSerializer, findModule(type.type, program.getCompilerOptions()));

            // obj.fieldName = TypeName.fromJson(value)!
            // return true;
            caseStatements.push(
                assignField(
                    wrapToNonNull(
                        type.isNullable,
                        ts.factory.createCallExpression(
                            // TypeName.fromJson
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'fromJson'),
                            [],
                            [
                                ts.factory.createIdentifier('r')
                            ]
                        ),
                        ts.factory
                    )
                )
            );
            caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
        } else {
            // for complex types it is a bit more tricky
            // if the property matches exactly, we use fromJson
            // if the property starts with the field name, we try to set a sub-property
            const jsonNameArray = ts.factory.createArrayLiteralExpression(jsonNames.map(n => ts.factory.createStringLiteral(n)));

            let itemSerializer = type.type.symbol.name + "Serializer";
            importer(itemSerializer, findSerializerModule(type.type, program.getCompilerOptions()));
            if (type.isNullable) {
                importer(type.type.symbol!.name, findModule(type.type, program.getCompilerOptions()));
            }

            // TODO if no partial name support, simply generate cases
            statements.push(
                ts.factory.createIfStatement(
                    // if(["", "core"].indexOf(property) >= 0)
                    ts.factory.createBinaryExpression(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(jsonNameArray, 'indexOf'),
                            [],
                            [ts.factory.createIdentifier('property')]
                        ),
                        ts.SyntaxKind.GreaterThanEqualsToken,
                        ts.factory.createNumericLiteral('0')
                    ),
                    ts.factory.createBlock(
                        !type.isNullable
                            ? [
                                ts.factory.createExpressionStatement(
                                    ts.factory.createCallExpression(
                                        // TypeName.fromJson
                                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'fromJson'),
                                        [],
                                        [
                                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                                            ts.factory.createIdentifier('r')
                                        ]
                                    )
                                ),
                                ts.factory.createReturnStatement(ts.factory.createTrue())
                            ]
                            : [
                                ts.factory.createIfStatement(
                                    ts.factory.createBinaryExpression(
                                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('r'), 'currentValueType'),
                                        ts.SyntaxKind.ExclamationEqualsEqualsToken,
                                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('JsonValueType'), 'Null'),
                                    ),
                                    ts.factory.createBlock([
                                        assignField(ts.factory.createNewExpression(
                                            ts.factory.createIdentifier(type.type.symbol.name),
                                            undefined,
                                            []
                                        )),
                                        ts.factory.createExpressionStatement(
                                            ts.factory.createCallExpression(
                                                // TypeName.fromJson
                                                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'fromJson'),
                                                [],
                                                [
                                                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                                                    ts.factory.createIdentifier('r')
                                                ]
                                            )
                                        )
                                    ]),
                                    ts.factory.createBlock([
                                        assignField(ts.factory.createNull())
                                    ])
                                ),
                                ts.factory.createReturnStatement(ts.factory.createTrue())
                            ]),
                    !prop.partialNames ? undefined :
                        ts.factory.createBlock([
                            // for(const candidate of ["", "core"]) {
                            //   if(candidate.indexOf(property) === 0) {
                            //     if(!this.field) { this.field = new FieldType(); }
                            //     if(this.field.setProperty(property.substring(candidate.length), value)) return true;
                            //   }
                            // }
                            ts.factory.createForOfStatement(
                                undefined,
                                ts.factory.createVariableDeclarationList([ts.factory.createVariableDeclaration('c')], ts.NodeFlags.Const),
                                jsonNameArray,
                                ts.factory.createBlock([
                                    ts.factory.createIfStatement(
                                        ts.factory.createBinaryExpression(
                                            ts.factory.createCallExpression(
                                                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('property'), 'indexOf'),
                                                [],
                                                [ts.factory.createIdentifier('c')]
                                            ),
                                            ts.SyntaxKind.EqualsEqualsEqualsToken,
                                            ts.factory.createNumericLiteral('0')
                                        ),
                                        ts.factory.createBlock([
                                            type.isNullable && ts.factory.createIfStatement(
                                                ts.factory.createPrefixUnaryExpression(
                                                    ts.SyntaxKind.ExclamationToken,
                                                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName)
                                                ),
                                                ts.factory.createBlock([
                                                    assignField(ts.factory.createNewExpression(ts.factory.createIdentifier(type.type!.symbol!.name), [], []))
                                                ])
                                            ),
                                            ts.factory.createIfStatement(
                                                ts.factory.createCallExpression(
                                                    ts.factory.createPropertyAccessExpression(
                                                        ts.factory.createIdentifier(itemSerializer),
                                                        'setProperty'
                                                    ),
                                                    [],
                                                    [
                                                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                                                        ts.factory.createCallExpression(
                                                            ts.factory.createPropertyAccessExpression(
                                                                ts.factory.createIdentifier('property'),
                                                                'substring'
                                                            ),
                                                            [],
                                                            [ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('c'), 'length')]
                                                        ),
                                                        ts.factory.createIdentifier('r')
                                                    ]
                                                ),
                                                ts.factory.createBlock([
                                                    ts.factory.createReturnStatement(ts.factory.createTrue())
                                                ])
                                            )
                                        ].filter(s => !!s) as ts.Statement[])
                                    )
                                ])
                            )
                        ])
                )
            );
        }

        if (caseStatements.length > 0) {
            for (let i = 0; i < caseValues.length; i++) {
                let caseClause = ts.factory.createCaseClause(
                    ts.factory.createStringLiteral(caseValues[i]),
                    // last case gets the statements, others are fall through
                    i < caseValues.length - 1 ? [] : caseStatements
                );
                if (prop.target && i === 0) {
                    caseClause = ts.addSyntheticLeadingComment(caseClause, ts.SyntaxKind.MultiLineCommentTrivia, `@target ${prop.target}`, true);
                }
                cases.push(caseClause);
            }
        }
    }

    const switchExpr = ts.factory.createSwitchStatement(ts.factory.createIdentifier('property'), ts.factory.createCaseBlock(cases));
    statements.unshift(switchExpr);
    statements.push(ts.factory.createReturnStatement(ts.factory.createFalse()));

    return ts.factory.createBlock(addNewLines(statements));
}

function createSetPropertyMethod(
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
        'setProperty',
        undefined,
        undefined,
        [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                'obj',
                undefined,
                ts.factory.createTypeReferenceNode(
                    input.name!.text,
                    undefined
                )
            ),
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                'property',
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
            ),
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                'r',
                undefined,
                ts.factory.createTypeReferenceNode('IJsonReader')
            )
        ],
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
        generateSetPropertyBody(program, propertiesToSerialize, importer)
    )
}

export default createEmitter('json', (program, input) => {
    console.log(`Writing Serializer for ${input.name!.text}`);
    const sourceFileName = path.relative(
        path.join(path.resolve(program.getCompilerOptions().baseUrl!)),
        path.resolve(input.getSourceFile().fileName)
    );

    let propertiesToSerialize: JsonProperty[] = [];
    input.members.forEach(member => {
        if (ts.isPropertyDeclaration(member)) {
            const propertyDeclaration = member as ts.PropertyDeclaration;
            if (!propertyDeclaration.modifiers!.find(m =>
                m.kind === ts.SyntaxKind.StaticKeyword ||
                m.kind === ts.SyntaxKind.PrivateKeyword ||
                m.kind === ts.SyntaxKind.ReadonlyKeyword)) {
                const jsonNames = [(member.name as ts.Identifier).text];

                if (ts.getJSDocTags(member).find(t => t.tagName.text === 'json_on_parent')) {
                    jsonNames.push('');
                }

                if (!ts.getJSDocTags(member).find(t => t.tagName.text === 'json_ignore')) {
                    propertiesToSerialize.push({
                        property: propertyDeclaration,
                        jsonNames: jsonNames,
                        partialNames: !!ts.getJSDocTags(member).find(t => t.tagName.text === 'json_partial_names'),
                        target: ts.getJSDocTags(member).find(t => t.tagName.text === 'target')?.comment
                    });
                }
            }
        }
    });

    const statements: ts.Statement[] = [];

    const importedNames = new Set();
    function importer(name: string, module: string) {
        if (importedNames.has(name)) {
            return;
        }
        importedNames.add(name);
        statements.push(ts.factory.createImportDeclaration(
            undefined,
            undefined,
            ts.factory.createImportClause(
                false,
                undefined,
                ts.factory.createNamedImports([ts.factory.createImportSpecifier(
                    undefined,
                    ts.factory.createIdentifier(name)
                )])
            ),
            ts.factory.createStringLiteral(module)
        ))
    }

    statements.push(ts.factory.createClassDeclaration(
        [],
        [
            ts.factory.createModifier(ts.SyntaxKind.ExportKeyword),
        ],
        input.name!.text + 'Serializer',
        undefined,
        undefined,
        [
            createFromJsonMethod(input, importer),
            createToJsonMethod(program, input, propertiesToSerialize, importer),
            createSetPropertyMethod(program, input, propertiesToSerialize, importer)
        ]
    ));

    const sourceFile = ts.factory.createSourceFile([
        ts.factory.createImportDeclaration(
            undefined,
            undefined,
            ts.factory.createImportClause(false,
                undefined,
                ts.factory.createNamedImports([ts.factory.createImportSpecifier(
                    undefined,
                    ts.factory.createIdentifier(input.name!.text)
                )])
            ),
            ts.factory.createStringLiteral(toImportPath(sourceFileName))
        ),
        ...statements
    ], ts.factory.createToken(ts.SyntaxKind.EndOfFileToken), ts.NodeFlags.None);

    return sourceFile;
});