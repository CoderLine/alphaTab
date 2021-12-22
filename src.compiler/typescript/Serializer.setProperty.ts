import * as ts from 'typescript';
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
import { createStringUnknownMapNode, findModule, findSerializerModule, isImmutable, JsonProperty } from './Serializer.common';

function isPrimitiveFromJson(type: ts.Type, typeChecker: ts.TypeChecker) {
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

    return null;
}

function createEnumMapping(type: ts.Type): ts.Expression {
    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('JsonHelper'), 'parseEnum'),
        [ts.factory.createTypeReferenceNode(type.symbol.name)],
        [ts.factory.createIdentifier('v'), ts.factory.createIdentifier(type.symbol.name)]
    );
}

function cloneTypeNode(node: ts.TypeNode): ts.TypeNode {
    if(ts.isUnionTypeNode(node)) {
        return ts.factory.createUnionTypeNode(node.types.map(cloneTypeNode));
    } else if(node.kind === ts.SyntaxKind.StringKeyword 
        || node.kind === ts.SyntaxKind.NumberKeyword
        || node.kind === ts.SyntaxKind.BooleanKeyword
        || node.kind === ts.SyntaxKind.UnknownKeyword
        || node.kind === ts.SyntaxKind.AnyKeyword
        || node.kind === ts.SyntaxKind.VoidKeyword) {
        return ts.factory.createKeywordTypeNode(node.kind);
    } else if(ts.isLiteralTypeNode(node)) {
        return ts.factory.createLiteralTypeNode(node.literal);
    } else if(ts.isArrayTypeNode(node)) {
        return ts.factory.createArrayTypeNode(cloneTypeNode(node.elementType));
    }

    throw new Error(`Unsupported TypeNode: '${ts.SyntaxKind[node.kind]}' extend type node cloning`);
}

function generateSetPropertyBody(
    program: ts.Program,
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
                ts.factory.createAssignment(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                    expr
                )
            );
        };

        if (isPrimitiveFromJson(type.type!, typeChecker)) {
            caseStatements.push(
                assignField(
                    ts.factory.createAsExpression(
                        type.isNullable
                            ? ts.factory.createIdentifier('v')
                            : ts.factory.createNonNullExpression(ts.factory.createIdentifier('v')),
                            cloneTypeNode(prop.property.type!)
                    )
                )
            );
            caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
        } else if (isEnumType(type.type)) {
            // obj.fieldName = enummapping
            // return true;
            importer(type.type.symbol!.name, findModule(type.type, program.getCompilerOptions()));
            importer('JsonHelper', '@src/io/JsonHelper');
            const read = createEnumMapping(type.type);
            if (type.isNullable) {
                caseStatements.push(assignField(read));
            } else {
                caseStatements.push(assignField(ts.factory.createNonNullExpression(read)));
            }
            caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
        } else if (isTypedArray(type.type!)) {
            const arrayItemType = unwrapArrayItemType(type.type!, typeChecker)!;
            const collectionAddMethod = ts
                .getJSDocTags(prop.property)
                .filter(t => t.tagName.text === 'json_add')
                .map(t => t.comment ?? '')[0] as string;

            // obj.fieldName = [];
            // for(const i of value) {
            //    obj.addFieldName(Type.FromJson(i));
            // }
            // or
            // for(const __li of value) {
            //    obj.fieldName.push(Type.FromJson(__li));
            // }

            let itemSerializer = arrayItemType.symbol.name + 'Serializer';
            importer(itemSerializer, findSerializerModule(arrayItemType, program.getCompilerOptions()));
            importer(arrayItemType.symbol.name, findModule(arrayItemType, program.getCompilerOptions()));

            const loopItems = [
                assignField(ts.factory.createArrayLiteralExpression(undefined)),
                ts.factory.createForOfStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [ts.factory.createVariableDeclaration('o')],
                        ts.NodeFlags.Const
                    ),
                    ts.factory.createAsExpression(
                        ts.factory.createIdentifier('v'),
                        ts.factory.createArrayTypeNode(
                            ts.factory.createUnionTypeNode([
                                createStringUnknownMapNode(),
                                ts.factory.createLiteralTypeNode(ts.factory.createNull())
                            ])
                        )
                    ),
                    ts.factory.createBlock(
                        [
                            ts.factory.createVariableStatement(
                                undefined,
                                ts.factory.createVariableDeclarationList(
                                    [
                                        ts.factory.createVariableDeclaration(
                                            'i',
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
                                    'fromJson'
                                ),
                                undefined,
                                [ts.factory.createIdentifier('i'), ts.factory.createIdentifier('o')]
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
                                          [ts.factory.createIdentifier('i')]
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
                                          [ts.factory.createIdentifier('i')]
                                      )
                            )
                        ].filter(s => !!s) as ts.Statement[]
                    )
                )
            ];

            if (type.isNullable) {
                caseStatements.push(
                    ts.factory.createIfStatement(ts.factory.createIdentifier('v'), ts.factory.createBlock(loopItems))
                );
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
                importer(
                    mapType.typeArguments![0].symbol!.name,
                    findModule(mapType.typeArguments![0], program.getCompilerOptions())
                );
                importer('JsonHelper', '@src/io/JsonHelper');
                mapKey = ts.factory.createNonNullExpression(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier('JsonHelper'),
                            'parseEnum'
                        ),
                        [ts.factory.createTypeReferenceNode(mapType.typeArguments![0].symbol!.name)],
                        [
                            ts.factory.createIdentifier('k'),
                            ts.factory.createIdentifier(mapType.typeArguments![0].symbol!.name)
                        ]
                    )
                );
            } else if (isNumberType(mapType.typeArguments![0])) {
                mapKey = ts.factory.createCallExpression(ts.factory.createIdentifier('parseInt'), undefined, [
                    ts.factory.createIdentifier('k')
                ]);
            } else {
                mapKey = ts.factory.createIdentifier('k');
            }

            let mapValue;
            let itemSerializer: string = '';
            if (isPrimitiveFromJson(mapType.typeArguments![1], typeChecker)) {
                // const isNullable = mapType.typeArguments![1].flags & ts.TypeFlags.Union
                //     && !!(mapType.typeArguments![1] as ts.UnionType).types.find(t => t.flags & ts.TypeFlags.Null);

                mapValue = ts.factory.createAsExpression(
                    ts.factory.createIdentifier('v'),
                    ts.isTypeReferenceNode(prop.property.type!) && prop.property.type.typeArguments
                        ? cloneTypeNode(prop.property.type.typeArguments[1])
                        : ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                );
            } else {
                itemSerializer = mapType.typeArguments![1].symbol.name + 'Serializer';
                importer(itemSerializer, findSerializerModule(mapType.typeArguments![1], program.getCompilerOptions()));
                importer(
                    mapType.typeArguments![1]!.symbol.name,
                    findModule(mapType.typeArguments![1], program.getCompilerOptions())
                );
                mapValue = ts.factory.createIdentifier('i');
            }

            const collectionAddMethod = ts
                .getJSDocTags(prop.property)
                .filter(t => t.tagName.text === 'json_add')
                .map(t => t.comment ?? '')[0] as string;

            caseStatements.push(
                assignField(
                    ts.factory.createNewExpression(
                        ts.factory.createIdentifier('Map'),
                        [
                            typeChecker.typeToTypeNode(mapType.typeArguments![0], undefined, undefined)!,
                            typeChecker.typeToTypeNode(mapType.typeArguments![1], undefined, undefined)!
                        ],
                        []
                    )
                )
            );

            caseStatements.push(
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('JsonHelper'), 'forEach'),
                        undefined,
                        [
                            ts.factory.createIdentifier('v'),
                            ts.factory.createArrowFunction(
                                undefined,
                                undefined,
                                [
                                    ts.factory.createParameterDeclaration(undefined, undefined, undefined, 'v'),
                                    ts.factory.createParameterDeclaration(undefined, undefined, undefined, 'k')
                                ],
                                undefined,
                                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                ts.factory.createBlock(
                                    addNewLines(
                                        [
                                            itemSerializer.length > 0 &&
                                                ts.factory.createVariableStatement(
                                                    undefined,
                                                    ts.factory.createVariableDeclarationList(
                                                        [
                                                            ts.factory.createVariableDeclaration(
                                                                'i',
                                                                undefined,
                                                                undefined,
                                                                ts.factory.createNewExpression(
                                                                    ts.factory.createIdentifier(
                                                                        mapType.typeArguments![1].symbol.name
                                                                    ),
                                                                    undefined,
                                                                    []
                                                                )
                                                            )
                                                        ],
                                                        ts.NodeFlags.Const
                                                    )
                                                ),
                                            itemSerializer.length > 0 &&
                                                ts.factory.createExpressionStatement(
                                                    ts.factory.createCallExpression(
                                                        ts.factory.createPropertyAccessExpression(
                                                            ts.factory.createIdentifier(itemSerializer),
                                                            'fromJson'
                                                        ),
                                                        undefined,
                                                        [
                                                            ts.factory.createIdentifier('i'),
                                                            ts.factory.createAsExpression(
                                                                ts.factory.createIdentifier('v'),
                                                                createStringUnknownMapNode()
                                                            )
                                                        ]
                                                    )
                                                ),
                                            ts.factory.createExpressionStatement(
                                                ts.factory.createCallExpression(
                                                    collectionAddMethod
                                                        ? ts.factory.createPropertyAccessExpression(
                                                              ts.factory.createIdentifier('obj'),
                                                              collectionAddMethod
                                                          )
                                                        : ts.factory.createPropertyAccessExpression(
                                                              ts.factory.createPropertyAccessExpression(
                                                                  ts.factory.createIdentifier('obj'),
                                                                  ts.factory.createIdentifier(fieldName)
                                                              ),
                                                              ts.factory.createIdentifier('set')
                                                          ),
                                                    undefined,
                                                    [mapKey, mapValue]
                                                )
                                            )
                                        ].filter(s => !!s) as ts.Statement[]
                                    )
                                )
                            )
                        ]
                    )
                )
            );

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
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(itemSerializer),
                                'fromJson'
                            ),
                            [],
                            [ts.factory.createIdentifier('v')]
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
            const jsonNameArray = ts.factory.createArrayLiteralExpression(
                jsonNames.map(n => ts.factory.createStringLiteral(n))
            );

            let itemSerializer = type.type.symbol.name + 'Serializer';
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
                                          ts.factory.createPropertyAccessExpression(
                                              ts.factory.createIdentifier(itemSerializer),
                                              'fromJson'
                                          ),
                                          [],
                                          [
                                              ts.factory.createPropertyAccessExpression(
                                                  ts.factory.createIdentifier('obj'),
                                                  fieldName
                                              ),
                                              ts.factory.createAsExpression(
                                                  ts.factory.createIdentifier('v'),
                                                  createStringUnknownMapNode()
                                              )
                                          ]
                                      )
                                  ),
                                  ts.factory.createReturnStatement(ts.factory.createTrue())
                              ]
                            : [
                                  ts.factory.createIfStatement(
                                      ts.factory.createIdentifier('v'),
                                      ts.factory.createBlock([
                                          assignField(
                                              ts.factory.createNewExpression(
                                                  ts.factory.createIdentifier(type.type.symbol.name),
                                                  undefined,
                                                  []
                                              )
                                          ),
                                          ts.factory.createExpressionStatement(
                                              ts.factory.createCallExpression(
                                                  // TypeName.fromJson
                                                  ts.factory.createPropertyAccessExpression(
                                                      ts.factory.createIdentifier(itemSerializer),
                                                      'fromJson'
                                                  ),
                                                  [],
                                                  [
                                                      ts.factory.createPropertyAccessExpression(
                                                          ts.factory.createIdentifier('obj'),
                                                          fieldName
                                                      ),
                                                      ts.factory.createAsExpression(
                                                          ts.factory.createIdentifier('v'),
                                                          createStringUnknownMapNode()
                                                      )
                                                  ]
                                              )
                                          )
                                      ]),
                                      ts.factory.createBlock([assignField(ts.factory.createNull())])
                                  ),
                                  ts.factory.createReturnStatement(ts.factory.createTrue())
                              ]
                    ),
                    !prop.partialNames
                        ? undefined
                        : ts.factory.createBlock([
                              // for(const candidate of ["", "core"]) {
                              //   if(candidate.indexOf(property) === 0) {
                              //     if(!this.field) { this.field = new FieldType(); }
                              //     if(this.field.setProperty(property.substring(candidate.length), value)) return true;
                              //   }
                              // }
                              ts.factory.createForOfStatement(
                                  undefined,
                                  ts.factory.createVariableDeclarationList(
                                      [ts.factory.createVariableDeclaration('c')],
                                      ts.NodeFlags.Const
                                  ),
                                  jsonNameArray,
                                  ts.factory.createBlock([
                                      ts.factory.createIfStatement(
                                          ts.factory.createBinaryExpression(
                                              ts.factory.createCallExpression(
                                                  ts.factory.createPropertyAccessExpression(
                                                      ts.factory.createIdentifier('property'),
                                                      'indexOf'
                                                  ),
                                                  [],
                                                  [ts.factory.createIdentifier('c')]
                                              ),
                                              ts.SyntaxKind.EqualsEqualsEqualsToken,
                                              ts.factory.createNumericLiteral('0')
                                          ),
                                          ts.factory.createBlock(
                                              [
                                                  type.isNullable &&
                                                      ts.factory.createIfStatement(
                                                          ts.factory.createPrefixUnaryExpression(
                                                              ts.SyntaxKind.ExclamationToken,
                                                              ts.factory.createPropertyAccessExpression(
                                                                  ts.factory.createIdentifier('obj'),
                                                                  fieldName
                                                              )
                                                          ),
                                                          ts.factory.createBlock([
                                                              assignField(
                                                                  ts.factory.createNewExpression(
                                                                      ts.factory.createIdentifier(
                                                                          type.type!.symbol!.name
                                                                      ),
                                                                      [],
                                                                      []
                                                                  )
                                                              )
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
                                                              ts.factory.createPropertyAccessExpression(
                                                                  ts.factory.createIdentifier('obj'),
                                                                  fieldName
                                                              ),
                                                              ts.factory.createCallExpression(
                                                                  ts.factory.createPropertyAccessExpression(
                                                                      ts.factory.createIdentifier('property'),
                                                                      'substring'
                                                                  ),
                                                                  [],
                                                                  [
                                                                      ts.factory.createPropertyAccessExpression(
                                                                          ts.factory.createIdentifier('c'),
                                                                          'length'
                                                                      )
                                                                  ]
                                                              ),
                                                              ts.factory.createIdentifier('v')
                                                          ]
                                                      ),
                                                      ts.factory.createBlock([
                                                          ts.factory.createReturnStatement(ts.factory.createTrue())
                                                      ])
                                                  )
                                              ].filter(s => !!s) as ts.Statement[]
                                          )
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
                    caseClause = ts.addSyntheticLeadingComment(
                        caseClause,
                        ts.SyntaxKind.MultiLineCommentTrivia,
                        `@target ${prop.target}`,
                        true
                    );
                }
                cases.push(caseClause);
            }
        }
    }

    if (cases.length > 0) {
        const switchExpr = ts.factory.createSwitchStatement(
            ts.factory.createIdentifier('property'),
            ts.factory.createCaseBlock(cases)
        );
        statements.unshift(switchExpr);
    }

    statements.push(ts.factory.createReturnStatement(ts.factory.createFalse()));

    return ts.factory.createBlock(addNewLines(statements));
}

export function createSetPropertyMethod(
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
                ts.factory.createTypeReferenceNode(input.name!.text, undefined)
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
                'v',
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
            )
        ],
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
        generateSetPropertyBody(program, propertiesToSerialize, importer)
    );
}