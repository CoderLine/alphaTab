import * as ts from 'typescript';
import { addNewLines, createNodeFromSource, setMethodBody } from '../BuilderHelpers';
import { isPrimitiveType } from '../BuilderHelpers';
import { hasFlag } from '../BuilderHelpers';
import { getTypeWithNullableInfo } from '../BuilderHelpers';
import { isTypedArray } from '../BuilderHelpers';
import { unwrapArrayItemType } from '../BuilderHelpers';
import { isMap } from '../BuilderHelpers';
import { isEnumType } from '../BuilderHelpers';
import { isNumberType } from '../BuilderHelpers';
import { wrapToNonNull } from '../BuilderHelpers';
import {
    createStringUnknownMapNode,
    findModule,
    findSerializerModule,
    isImmutable,
    JsonProperty,
    JsonSerializable
} from './Serializer.common';

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

function cloneTypeNode<T extends ts.Node>(node: T): T {
    if (ts.isUnionTypeNode(node)) {
        return ts.factory.createUnionTypeNode(node.types.map(cloneTypeNode)) as any as T;
    } else if (
        node.kind === ts.SyntaxKind.StringKeyword ||
        node.kind === ts.SyntaxKind.NumberKeyword ||
        node.kind === ts.SyntaxKind.BooleanKeyword ||
        node.kind === ts.SyntaxKind.UnknownKeyword ||
        node.kind === ts.SyntaxKind.AnyKeyword ||
        node.kind === ts.SyntaxKind.VoidKeyword
    ) {
        return ts.factory.createKeywordTypeNode(node.kind) as any as T;
    } else if (ts.isLiteralTypeNode(node)) {
        return ts.factory.createLiteralTypeNode(node.literal) as any as T;
    } else if (ts.isArrayTypeNode(node)) {
        return ts.factory.createArrayTypeNode(cloneTypeNode(node.elementType)) as any as T;
    } else if (ts.isTypeReferenceNode(node)) {
        return ts.factory.createTypeReferenceNode(cloneTypeNode(node.typeName)) as any as T;
    } else if (ts.isIdentifier(node)) {
        return ts.factory.createIdentifier(node.text) as any as T;
    } else if (ts.isQualifiedName(node)) {
        if (typeof node.right === 'string') {
            return ts.factory.createQualifiedName(cloneTypeNode(node.left), node.right) as any as T;
        } else {
            return ts.factory.createQualifiedName(cloneTypeNode(node.left), cloneTypeNode(node.right)) as any as T;
        }
    }

    throw new Error(`Unsupported TypeNode: '${ts.SyntaxKind[node.kind]}' extend type node cloning`);
}

function generateSetPropertyBody(
    program: ts.Program,
    serializable: JsonSerializable,
    importer: (name: string, module: string) => void
) {
    const statements: ts.Statement[] = [];
    const cases: ts.CaseOrDefaultClause[] = [];

    const typeChecker = program.getTypeChecker();
    for (const prop of serializable.properties) {
        const jsonNames = prop.jsonNames.map(j => j.toLowerCase());
        const caseValues: string[] = jsonNames.filter(j => j !== '');
        const fieldName = (prop.property.name as ts.Identifier).text;

        const caseStatements: ts.Statement[] = [];

        const type = getTypeWithNullableInfo(typeChecker, prop.property.type, true);

        const assignField = function (expr: ts.Expression): ts.Statement {
            return ts.factory.createExpressionStatement(
                ts.factory.createAssignment(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                    expr
                )
            );
        };

        if (type.isUnionType) {
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
        } else if (isPrimitiveFromJson(type.type!, typeChecker)) {
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
            importer(type.type.symbol!.name, findModule(type.type, program.getCompilerOptions()));
            importer('JsonHelper', '@src/io/JsonHelper');
            if (type.isNullable) {
                caseStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `obj.${fieldName} = JsonHelper.parseEnum<${type.type.symbol.name}>(v, ${type.type.symbol.name});`,
                        ts.SyntaxKind.ExpressionStatement
                    )
                );
            } else {
                caseStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `obj.${fieldName} = JsonHelper.parseEnum<${type.type.symbol.name}>(v, ${type.type.symbol.name})!;`,
                        ts.SyntaxKind.ExpressionStatement
                    )
                );
            }
            caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
        } else if (isTypedArray(type.type!)) {
            const arrayItemType = unwrapArrayItemType(type.type!, typeChecker)!;
            const collectionAddMethod =
                (ts
                    .getJSDocTags(prop.property)
                    .filter(t => t.tagName.text === 'json_add')
                    .map(t => t.comment ?? '')[0] as string) ?? `${fieldName}.push`;

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
                createNodeFromSource<ts.ExpressionStatement>(
                    `obj.${fieldName} = [];`,
                    ts.SyntaxKind.ExpressionStatement
                ),
                createNodeFromSource<ts.ForOfStatement>(
                    `for(const o of (v as (Map<string, unknown> | null)[])) {
                        const i = new ${arrayItemType.symbol.name}();
                        ${itemSerializer}.fromJson(i, o);
                        obj.${collectionAddMethod}(i)
                    }`,
                    ts.SyntaxKind.ForOfStatement
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

            let mapKey: ts.Expression;
            if (isEnumType(mapType.typeArguments![0])) {
                importer(
                    mapType.typeArguments![0].symbol!.name,
                    findModule(mapType.typeArguments![0], program.getCompilerOptions())
                );
                importer('JsonHelper', '@src/io/JsonHelper');
                mapKey = createNodeFromSource<ts.NonNullExpression>(
                    `JsonHelper.parseEnum<${mapType.typeArguments![0].symbol!.name}>(k, ${
                        mapType.typeArguments![0].symbol!.name
                    })!`,
                    ts.SyntaxKind.NonNullExpression
                );
            } else if (isNumberType(mapType.typeArguments![0])) {
                mapKey = createNodeFromSource<ts.CallExpression>(`parseInt(k)`, ts.SyntaxKind.CallExpression);
            } else {
                mapKey = ts.factory.createIdentifier('k');
            }

            let mapValue;
            let itemSerializer: string = '';
            if (isPrimitiveFromJson(mapType.typeArguments![1], typeChecker)) {
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

            const collectionAddMethod =
                (ts
                    .getJSDocTags(prop.property)
                    .filter(t => t.tagName.text === 'json_add')
                    .map(t => t.comment ?? '')[0] as string) || fieldName + '.set';

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
                                                createNodeFromSource<ts.VariableStatement>(
                                                    `const i = new ${mapType.typeArguments![1].symbol.name}();`,
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
                createNodeFromSource<ts.ExpressionStatement>(
                    `obj.${fieldName} = ${itemSerializer}.fromJson(v)!;`,
                    ts.SyntaxKind.ExpressionStatement
                )
            );
            caseStatements.push(
                createNodeFromSource<ts.ReturnStatement>(`return true;`, ts.SyntaxKind.ReturnStatement)
            );
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

    if (serializable.hasSetPropertyExtension) {
        statements.push(
            ts.factory.createReturnStatement(
                createNodeFromSource<ts.CallExpression>(`obj.setProperty(property, v);`, ts.SyntaxKind.CallExpression)
            )
        );
    } else {
        statements.push(ts.factory.createReturnStatement(ts.factory.createFalse()));
    }

    return ts.factory.createBlock(addNewLines(statements));
}

export function createSetPropertyMethod(
    program: ts.Program,
    input: ts.ClassDeclaration,
    serializable: JsonSerializable,
    importer: (name: string, module: string) => void
) {
    const methodDecl = createNodeFromSource<ts.MethodDeclaration>(
        `public class Serializer {
            public static setProperty(obj: ${input.name!.text}, property: string, v: unknown): boolean {
            }
        }`,
        ts.SyntaxKind.MethodDeclaration
    );
    return setMethodBody(methodDecl, generateSetPropertyBody(program, serializable, importer));
}
