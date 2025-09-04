import * as ts from 'typescript';
import { createNodeFromSource, setMethodBody } from '../BuilderHelpers';
import { findSerializerModule } from './Serializer.common';
import type { TypeSchema, TypeWithNullableInfo } from './TypeSchema';

export function createStringUnknownMapNode(): ts.TypeNode {
    return ts.factory.createTypeReferenceNode('Map', [
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
    ]);
}

function isPrimitiveForSerialization(type: TypeWithNullableInfo) {
    if (type.isPrimitiveType) {
        return true;
    }
    if (type.arrayItemType?.isPrimitiveType) {
        return true;
    }
    if (type.isTypedArray) {
        return true;
    }

    return false;
}

function generateSetPropertyBody(serializable: TypeSchema, importer: (name: string, module: string) => void) {
    const statements: ts.Statement[] = [];
    const cases: ts.CaseOrDefaultClause[] = [];

    for (const prop of serializable.properties) {
        const jsonNames = prop.jsonNames.map(j => j.toLowerCase());
        const caseValues: string[] = jsonNames.filter(j => j !== '');
        const fieldName = prop.name;

        const caseStatements: ts.Statement[] = [];

        const assignField = (expr: ts.Expression): ts.Statement =>
            ts.factory.createExpressionStatement(
                ts.factory.createAssignment(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                    expr
                )
            );

        if (!prop.asRaw && prop.type.isUnionType) {
            caseStatements.push(
                assignField(
                    ts.factory.createAsExpression(
                        prop.type.isNullable || prop.type.isOptional
                            ? ts.factory.createIdentifier('v')
                            : ts.factory.createNonNullExpression(ts.factory.createIdentifier('v')),
                        prop.type.createTypeNode()
                    )
                )
            );
            caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
        } else if (prop.asRaw || isPrimitiveForSerialization(prop.type)) {
            caseStatements.push(
                assignField(
                    ts.factory.createAsExpression(
                        prop.type.isNullable || prop.type.isOptional
                            ? ts.factory.createIdentifier('v')
                            : ts.factory.createNonNullExpression(ts.factory.createIdentifier('v')),
                        prop.type.createTypeNode()
                    )
                )
            );
            caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
        } else if (prop.type.isEnumType) {
            importer(prop.type.typeAsString, prop.type.modulePath);
            importer('JsonHelper', '@src/io/JsonHelper');
            if (prop.type.isNullable) {
                caseStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `obj.${fieldName} = JsonHelper.parseEnum<${prop.type.typeAsString}>(v, ${prop.type.typeAsString}) ?? null;`,
                        ts.SyntaxKind.ExpressionStatement
                    )
                );
            } else if (prop.type.isOptional) {
                caseStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `obj.${fieldName} = JsonHelper.parseEnum<${prop.type.typeAsString}>(v, ${prop.type.typeAsString});`,
                        ts.SyntaxKind.ExpressionStatement
                    )
                );
            } else {
                caseStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `obj.${fieldName} = JsonHelper.parseEnum<${prop.type.typeAsString}>(v, ${prop.type.typeAsString})!;`,
                        ts.SyntaxKind.ExpressionStatement
                    )
                );
            }
            caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
        } else if (prop.type.isArray) {
            const arrayItemType = prop.type.arrayItemType!;
            const collectionAddMethod =
                (prop.jsDocTags.filter(t => t.tagName.text === 'json_add').map(t => t.comment ?? '')[0] as string) ??
                `${fieldName}.push`;

            // obj.fieldName = [];
            // for(const i of value) {
            //    obj.addFieldName(Type.FromJson(i));
            // }
            // or
            // for(const __li of value) {
            //    obj.fieldName.push(Type.FromJson(__li));
            // }

            const itemSerializer = `${arrayItemType.typeAsString}Serializer`;
            importer(itemSerializer, findSerializerModule(arrayItemType));
            importer(arrayItemType.typeAsString, arrayItemType.modulePath);

            const loopItems = [
                createNodeFromSource<ts.ExpressionStatement>(
                    `obj.${fieldName} = [];`,
                    ts.SyntaxKind.ExpressionStatement
                ),
                createNodeFromSource<ts.ForOfStatement>(
                    `for(const o of (v as (Map<string, unknown> | null)[])) {
                        const i = new ${arrayItemType.typeAsString}();
                        ${itemSerializer}.fromJson(i, o);
                        obj.${collectionAddMethod}(i)
                    }`,
                    ts.SyntaxKind.ForOfStatement
                )
            ];

            if (prop.type.isNullable || prop.type.isOptional) {
                caseStatements.push(
                    ts.factory.createIfStatement(
                        ts.factory.createIdentifier('v'),
                        ts.factory.createBlock(loopItems, true)
                    )
                );
            } else {
                caseStatements.push(...loopItems);
            }
            caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
        } else if (prop.type.isMap) {
            let mapKey: ts.Expression;
            if (prop.type.typeArguments![0].isEnumType) {
                importer(prop.type.typeArguments![0].typeAsString, prop.type.typeArguments![0].modulePath);
                importer('JsonHelper', '@src/io/JsonHelper');
                mapKey = createNodeFromSource<ts.NonNullExpression>(
                    `JsonHelper.parseEnum<${prop.type.typeArguments![0].typeAsString}>(k, ${
                        prop.type.typeArguments![0].typeAsString
                    })!`,
                    ts.SyntaxKind.NonNullExpression
                );
            } else if (prop.type.typeArguments![0].isNumberType) {
                mapKey = createNodeFromSource<ts.CallExpression>('Number.parseInt(k)', ts.SyntaxKind.CallExpression);
            } else {
                mapKey = ts.factory.createIdentifier('k');
            }

            const mapValueTypeInfo = prop.type.typeArguments![1];

            let mapValue: ts.Expression;
            let itemSerializer: string = '';
            if (isPrimitiveForSerialization(mapValueTypeInfo)) {
                mapValue = ts.factory.createAsExpression(
                    ts.factory.createIdentifier('v'),
                    mapValueTypeInfo.createTypeNode()
                );
            } else if (mapValueTypeInfo.isJsonImmutable) {
                importer(mapValueTypeInfo.typeAsString, mapValueTypeInfo.modulePath);
                mapValue = createNodeFromSource<ts.CallExpression>(
                    `${mapValueTypeInfo.typeAsString}.fromJson(v)`,
                    ts.SyntaxKind.CallExpression
                );
            } else {
                itemSerializer = `${mapValueTypeInfo.typeAsString}Serializer`;
                importer(itemSerializer, findSerializerModule(mapValueTypeInfo));
                importer(mapValueTypeInfo.typeAsString, mapValueTypeInfo.modulePath);
                mapValue = ts.factory.createIdentifier('i');
            }

            const collectionAddMethod = prop.jsDocTags
                .filter(t => t.tagName.text === 'json_add')
                .map(t => t.comment ?? '')[0] as string;

            caseStatements.push(
                assignField(
                    ts.factory.createNewExpression(
                        ts.factory.createIdentifier('Map'),
                        prop.type.typeArguments!.map(t => t.createTypeNode()),
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
                                    ts.factory.createParameterDeclaration(undefined, undefined, 'v'),
                                    ts.factory.createParameterDeclaration(undefined, undefined, 'k')
                                ],
                                undefined,
                                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                ts.factory.createBlock(
                                    [
                                        itemSerializer.length > 0 &&
                                            createNodeFromSource<ts.VariableStatement>(
                                                `const i = new ${mapValueTypeInfo.typeAsString}();`,
                                                ts.SyntaxKind.VariableStatement
                                            ),
                                        itemSerializer.length > 0 &&
                                            createNodeFromSource<ts.ExpressionStatement>(
                                                `${itemSerializer}.fromJson(i, v as Map<string, unknown>)`,
                                                ts.SyntaxKind.ExpressionStatement
                                            ),
                                        ts.factory.createExpressionStatement(
                                            ts.factory.createCallExpression(
                                                collectionAddMethod
                                                    ? ts.factory.createPropertyAccessExpression(
                                                          ts.factory.createIdentifier('obj'),
                                                          collectionAddMethod
                                                      )
                                                    : ts.factory.createPropertyAccessExpression(
                                                          prop.type.isNullable || prop.type.isOptional
                                                              ? ts.factory.createNonNullExpression(
                                                                    ts.factory.createPropertyAccessExpression(
                                                                        ts.factory.createIdentifier('obj'),
                                                                        ts.factory.createIdentifier(fieldName)
                                                                    )
                                                                )
                                                              : ts.factory.createPropertyAccessExpression(
                                                                    ts.factory.createIdentifier('obj'),
                                                                    ts.factory.createIdentifier(fieldName)
                                                                ),
                                                          ts.factory.createIdentifier('set')
                                                      ),
                                                undefined,
                                                [mapKey, mapValue]
                                            )
                                        )
                                    ].filter(s => !!s) as ts.Statement[],
                                    true
                                )
                            )
                        ]
                    )
                )
            );

            caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
        } else if (prop.type.isSet) {
            const collectionAddMethod = prop.jsDocTags
                .filter(t => t.tagName.text === 'json_add')
                .map(t => t.comment ?? '')[0] as string;

            if (isPrimitiveForSerialization(prop.type.typeArguments![0])) {
                const elementTypeName = prop.type.typeArguments![0].typeAsString;

                if (collectionAddMethod) {
                    caseStatements.push(
                        createNodeFromSource<ts.ForOfStatement>(
                            `for (const i of (v as ${elementTypeName}[])) {
                                obj.${collectionAddMethod}(i);
                            }`,
                            ts.SyntaxKind.ForOfStatement
                        )
                    );
                } else {
                    caseStatements.push(
                        assignField(
                            createNodeFromSource<ts.NewExpression>(
                                `new Set<${elementTypeName}>(v as ${elementTypeName}[])!`,
                                ts.SyntaxKind.NewExpression
                            )
                        )
                    );
                }
            } else if (prop.type.typeArguments![0].isEnumType) {
                importer(prop.type.typeArguments![0].typeAsString, prop.type.typeArguments![0].modulePath);
                importer('JsonHelper', '@src/io/JsonHelper');

                if (collectionAddMethod) {
                    caseStatements.push(
                        createNodeFromSource<ts.ForOfStatement>(
                            `for (const i of (v as number[]) ) {
                                obj.${collectionAddMethod}(JsonHelper.parseEnum<${
                                    prop.type.typeArguments![0].typeAsString
                                }>(i, ${prop.type.typeArguments![0].typeAsString})!);
                            }`,
                            ts.SyntaxKind.ForOfStatement
                        )
                    );
                } else {
                    // obj.field = new Set<EnumType>((v! as number[]).map(i => JsonHelper.parseEnum<EnumType>(v!, EnumType)));
                    caseStatements.push(
                        assignField(
                            createNodeFromSource<ts.NewExpression>(
                                `new Set<${
                                    prop.type.typeArguments![0].typeAsString
                                }>( (v! as number[]).map(i => JsonHelper.parseEnum<${
                                    prop.type.typeArguments![0].typeAsString
                                }>(v,  ${prop.type.typeArguments![0].typeAsString})!`,
                                ts.SyntaxKind.NewExpression
                            )
                        )
                    );
                }
            } else {
                throw new Error(`Unsupported set type: ${prop.type.typeAsString}`);
            }

            caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
        } else if (prop.type.isJsonImmutable) {
            importer(prop.type.typeAsString, prop.type.modulePath);

            // obj.fieldName = TypeName.fromJson(value)!
            // return true;
            const notNull =  prop.type.isNullable || prop.type.isOptional ? '' : '!';
            caseStatements.push(
                createNodeFromSource<ts.ExpressionStatement>(
                    `obj.${fieldName} = ${prop.type.typeAsString}.fromJson(v)${notNull};`,
                    ts.SyntaxKind.ExpressionStatement
                )
            );
            caseStatements.push(
                createNodeFromSource<ts.ReturnStatement>('return true;', ts.SyntaxKind.ReturnStatement)
            );
        } else if (serializable.isStrict) {
            const itemSerializer = `${prop.type.typeAsString}Serializer`;
            importer(itemSerializer, findSerializerModule(prop.type));

            if (prop.type.isNullable || prop.type.isOptional) {
                importer(prop.type.typeAsString, prop.type.modulePath);
                caseStatements.push(
                    createNodeFromSource<ts.IfStatement>(
                        `
                        if (v) { 
                            obj.${fieldName} = new ${prop.type.typeAsString}(); 
                            ${itemSerializer}.fromJson(obj.${fieldName}, v); 
                        } else {
                            obj.${fieldName} = ${prop.type.isNullable ? 'null' : 'undefined'}
                        }`,
                        ts.SyntaxKind.IfStatement
                    )
                );
                caseStatements.push(
                    createNodeFromSource<ts.ReturnStatement>('return true;', ts.SyntaxKind.ReturnStatement)
                );
            } else {
                caseStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `${itemSerializer}.fromJson(obj.${fieldName},v);`,
                        ts.SyntaxKind.ExpressionStatement
                    )
                );
                caseStatements.push(
                    createNodeFromSource<ts.ReturnStatement>('return true;', ts.SyntaxKind.ReturnStatement)
                );
            }
        } else {
            // for complex types in non-strict mode it is a bit more tricky
            // if the property matches exactly, we use fromJson
            // if the property starts with the field name, we try to set a sub-property
            const jsonNameArray = ts.factory.createArrayLiteralExpression(
                jsonNames.map(n => ts.factory.createStringLiteral(n))
            );

            const itemSerializer = `${prop.type.typeAsString}Serializer`;
            importer(itemSerializer, findSerializerModule(prop.type));
            if (prop.type.isNullable || prop.type.isOptional) {
                importer(prop.type.typeAsString, prop.type.modulePath);
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
                        !prop.type.isNullable && !prop.type.isOptional
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
                                      ts.factory.createBlock(
                                          [
                                              assignField(
                                                  ts.factory.createNewExpression(
                                                      ts.factory.createIdentifier(prop.type.typeAsString),
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
                                          ],
                                          true
                                      ),
                                      ts.factory.createBlock([assignField(ts.factory.createNull())], true)
                                  ),
                                  ts.factory.createReturnStatement(ts.factory.createTrue())
                              ],
                        true
                    )
                )
            );

            if (prop.partialNames) {
                statements.push(
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
                        ts.factory.createBlock(
                            [
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
                                            prop.type.isNullable ||
                                                (prop.type.isOptional &&
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
                                                                    ts.factory.createIdentifier(prop.type.typeAsString),
                                                                    [],
                                                                    []
                                                                )
                                                            )
                                                        ])
                                                    )),
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
                                                ts.factory.createBlock(
                                                    [ts.factory.createReturnStatement(ts.factory.createTrue())],
                                                    true
                                                )
                                            )
                                        ].filter(s => !!s) as ts.Statement[],
                                        true
                                    )
                                )
                            ],
                            true
                        )
                    )
                );
            }
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

    if (serializable.hasSetPropertyExtension) {
        statements.push(
            ts.factory.createReturnStatement(
                createNodeFromSource<ts.CallExpression>('obj.setProperty(property, v);', ts.SyntaxKind.CallExpression)
            )
        );
    } else {
        statements.push(ts.factory.createReturnStatement(ts.factory.createFalse()));
    }

    return ts.factory.createBlock(statements, true);
}

export function createSetPropertyMethod(
    input: ts.ClassDeclaration,
    serializable: TypeSchema,
    importer: (name: string, module: string) => void
) {
    const methodDecl = createNodeFromSource<ts.MethodDeclaration>(
        `public class Serializer {
            public static setProperty(obj: ${input.name!.text}, property: string, v: unknown): boolean {
            }
        }`,
        ts.SyntaxKind.MethodDeclaration
    );
    return setMethodBody(methodDecl, generateSetPropertyBody(serializable, importer));
}
