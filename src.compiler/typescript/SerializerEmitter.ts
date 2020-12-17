/**
 * This file contains an emitter which generates classes to serialize
 * any data models to and from JSON following certain rules.
 */

import * as path from 'path';
import * as ts from 'typescript';
import createEmitter from './EmitterBase'
import { addNewLines } from '../BuilderHelpers';
import { isPrimitiveType } from '../BuilderHelpers';
import { getTypeWithNullableInfo } from '../BuilderHelpers';
import { isTypedArray } from '../BuilderHelpers';
import { unwrapArrayItemType } from '../BuilderHelpers';
import { isMap } from '../BuilderHelpers';
import { isEnumType } from '../BuilderHelpers';
import { isNumberType } from '../BuilderHelpers';
import { wrapToNonNull } from '../BuilderHelpers';

interface JsonProperty {
    property: ts.PropertyDeclaration;
    jsonNames: string[];
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
// FromJson
function generateFromJsonBody(input: ts.ClassDeclaration) {
    const statements: ts.Statement[] = [];
    // const obj = new Type();
    statements.push(
        ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList([
                ts.factory.createVariableDeclaration(
                    'obj',
                    undefined,
                    undefined,
                    ts.factory.createNewExpression(ts.factory.createIdentifier(input.name!.text), [], [])
                )
            ], ts.NodeFlags.Const)
        )
    );

    // this.fillFromJson(obj, json);
    statements.push(
        ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'fillFromJson'),
                [],
                [
                    ts.factory.createIdentifier('obj'),
                    ts.factory.createIdentifier('json'),
                ]
            )
        )
    );

    // return obj;
    statements.push(
        // return json;
        ts.factory.createReturnStatement(ts.factory.createIdentifier('obj'))
    );

    return ts.factory.createBlock(addNewLines(statements));
}

function createFromJsonMethod(input: ts.ClassDeclaration) {
    return ts.factory.createMethodDeclaration(
        undefined,
        [
            ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
            ts.factory.createModifier(ts.SyntaxKind.StaticKeyword),
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
                'json',
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                undefined
            )
        ],
        ts.factory.createTypeReferenceNode(
            input.name!.text,
            undefined
        ),
        generateFromJsonBody(input)
    );
}

//
// fillFromJson
function generateFillFromJsonBody() {
    return ts.factory.createBlock(addNewLines([
        ts.factory.createIfStatement(
            // if(json) for($k in json) { this.setProperty(obj, $k.toLowerCase(), json[$k]) }
            ts.factory.createIdentifier('json'),
            ts.factory.createBlock([
                ts.factory.createForInStatement(
                    ts.factory.createVariableDeclarationList([ts.factory.createVariableDeclaration('$k')], ts.NodeFlags.Const),
                    ts.factory.createIdentifier('json'),
                    ts.factory.createBlock([
                        ts.factory.createExpressionStatement(
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'setProperty'),
                                [],
                                [
                                    // obj
                                    ts.factory.createIdentifier('obj'),
                                    // $k.toLowerCase(),
                                    ts.factory.createCallExpression(ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('$k'), 'toLowerCase'), [], []),
                                    // json[$k]
                                    ts.factory.createElementAccessExpression(ts.factory.createIdentifier('json'), ts.factory.createIdentifier('$k'))
                                ]
                            )
                        )
                    ])
                )
            ])
        )
    ]));
}

function createFillFromJsonMethod(input: ts.ClassDeclaration) {
    return ts.factory.createMethodDeclaration(
        undefined,
        [
            ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
            ts.factory.createModifier(ts.SyntaxKind.StaticKeyword)
        ],
        undefined,
        'fillFromJson',
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
                'json',
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
            )
        ],
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
        generateFillFromJsonBody()
    )
}

//
// toJson
function generateToJsonBody() {
    return ts.factory.createBlock(addNewLines([
        // if(!obj) { return null; }
        ts.factory.createIfStatement(
            ts.factory.createPrefixUnaryExpression(
                ts.SyntaxKind.ExclamationToken,
                ts.factory.createIdentifier('obj')
            ),
            ts.factory.createBlock([
                ts.factory.createReturnStatement(ts.factory.createNull())
            ])
        ),

        // const json:any = {};
        ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList([
                ts.factory.createVariableDeclaration(
                    'json',
                    undefined,
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                    ts.factory.createObjectLiteralExpression()
                )
            ], ts.NodeFlags.Const)
        ),

        // this.fillToJson(obj, json)
        ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'fillToJson'),
                [],
                [
                    ts.factory.createIdentifier('obj'),
                    ts.factory.createIdentifier('json')
                ]
            )
        ),

        // return json;
        ts.factory.createReturnStatement(ts.factory.createIdentifier('json'))
    ]));
}

function createToJsonMethod(input: ts.ClassDeclaration) {
    return ts.factory.createMethodDeclaration(
        undefined,
        [
            ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
            ts.factory.createModifier(ts.SyntaxKind.StaticKeyword),
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
                ]),
                undefined
            )
        ],
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
        generateToJsonBody()
    );
}

//
// fillToJson
function generateFillToJsonBody(
    program: ts.Program,
    propertiesToSerialize: JsonProperty[],
    importer: (name: string, module: string) => void) {

    const statements: ts.Statement[] = [];

    for (let prop of propertiesToSerialize) {
        const fieldName = (prop.property.name as ts.Identifier).text;
        const jsonName = prop.jsonNames.filter(n => n !== '')[0];

        const accessJsonName = function (): ts.Expression {
            return ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('json'), jsonName);
        };
        const accessField = function (): ts.Expression {
            return ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), ts.factory.createIdentifier(fieldName));
        };

        const assignToJsonName = function (value: ts.Expression): ts.Statement {
            return ts.factory.createExpressionStatement(ts.factory.createAssignment(accessJsonName(), value));
        };

        if (jsonName) {
            const typeChecker = program.getTypeChecker();
            const type = getTypeWithNullableInfo(typeChecker, prop.property.type!);
            if (isPrimitiveType(type.type!)) {
                // json.jsonName = obj.fieldName
                statements.push(assignToJsonName(accessField()));
            } else if (isTypedArray(type.type!)) {
                const arrayItemType = unwrapArrayItemType(type.type!, typeChecker);
                if (!arrayItemType || isPrimitiveType(arrayItemType)) {
                    // json.jsonName = obj.fieldName ? obj.fieldName.slice() : null
                    if (type.isNullable) {
                        statements.push(
                            assignToJsonName(
                                ts.factory.createConditionalExpression(
                                    accessField(),
                                    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                    ts.factory.createCallExpression(ts.factory.createPropertyAccessExpression(accessField(), 'slice'), [], []),
                                    ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                    ts.factory.createNull()
                                )
                            )
                        );
                    } else {
                        statements.push(
                            assignToJsonName(ts.factory.createCallExpression(ts.factory.createPropertyAccessExpression(accessField(), 'slice'), [], []))
                        );
                    }
                } else {
                    // json.jsonName = obj.fieldName ? obj.fieldName.map($li => TypeNameSerializer.toJson($li)) : null
                    let itemSerializer = arrayItemType.symbol.name + "Serializer";
                    importer(itemSerializer, findSerializerModule(arrayItemType, program.getCompilerOptions()));

                    const mapCall = ts.factory.createCallExpression(ts.factory.createPropertyAccessExpression(accessField(), 'map'), undefined, [
                        ts.factory.createArrowFunction(
                            undefined,
                            undefined,
                            [ts.factory.createParameterDeclaration(undefined, undefined, undefined, '$li')],
                            undefined, ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'toJson'),
                                undefined,
                                [ts.factory.createIdentifier('$li')]
                            )
                        ),
                    ]);
                    if (type.isNullable) {
                        statements.push(
                            assignToJsonName(
                                ts.factory.createConditionalExpression(
                                    accessField(),
                                    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                    mapCall,
                                    ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                    ts.factory.createNull()
                                )
                            )
                        );
                    } else {
                        statements.push(
                            assignToJsonName(mapCall)
                        );
                    }
                }
            } else if (isMap(type.type)) {
                const mapType = type.type as ts.TypeReference;
                if (!isPrimitiveType(mapType.typeArguments![0])) {
                    throw new Error('only Map<Primitive, *> maps are supported extend if needed!');
                }
                // json.jsonName = { } as any;
                // this.fieldName.forEach((val, key) => (json.jsonName as any)[key] = val))
                statements.push(
                    assignToJsonName(
                        ts.factory.createAsExpression(
                            ts.factory.createObjectLiteralExpression(),
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                        )
                    )
                );

                // json.jsonName = obj.fieldName ? obj.fieldName.map($li => TypeNameSerializer.toJson($li)) : null
                let itemSerializer: string = '';
                if (!isPrimitiveType(mapType.typeArguments![1])) {
                    itemSerializer = mapType.typeArguments![1].symbol.name + "Serializer";
                    importer(itemSerializer, findSerializerModule(mapType.typeArguments![1], program.getCompilerOptions()));
                }

                const mapValue = isPrimitiveType(mapType.typeArguments![1])
                    ? ts.factory.createIdentifier('$mv')
                    : ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'toJson'),
                        undefined,
                        [ts.factory.createIdentifier('$mv')]
                    );

                statements.push(
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(ts.factory.createPropertyAccessExpression(accessField(), 'forEach'), undefined, [
                            ts.factory.createArrowFunction(
                                undefined,
                                undefined,
                                [
                                    ts.factory.createParameterDeclaration(undefined, undefined, undefined, '$mv'),
                                    ts.factory.createParameterDeclaration(undefined, undefined, undefined, '$mk')
                                ],
                                undefined,
                                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                ts.factory.createBlock([
                                    ts.factory.createExpressionStatement(
                                        ts.factory.createAssignment(
                                            ts.factory.createElementAccessExpression(
                                                ts.factory.createAsExpression(
                                                    accessJsonName(),
                                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                                                ),
                                                ts.factory.createIdentifier('$mk')
                                            ),
                                            mapValue
                                        )
                                    )
                                ])
                            )
                        ])
                    )
                );
            } else if (isImmutable(type.type)) {
                let itemSerializer = type.type.symbol.name;
                importer(itemSerializer, findModule(type.type, program.getCompilerOptions()));

                // json.jsonName = TypeName.toJson(this.fieldName);
                statements.push(
                    assignToJsonName(
                        wrapToNonNull(
                            type.isNullable,
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'toJson'),
                                [],
                                [accessField()]
                            ),
                            ts.factory
                        )
                    )
                );
            } else {
                // not nullable:
                // if(json.jsonName) {
                //   FieldSerializer.fillToJson(obj.fieldName, json.jsonName)
                // } else {
                //   json.jsonName = FieldSerializer.toJson(obj.fieldName)!;
                // }

                // nullable:
                // if(json.jsonName) {
                //   if(obj.fieldName) FieldSerializer.fillToJson(obj.fieldName, json.jsonName)
                // } else {
                //   json.jsonName = FieldSerializer.toJson(obj.fieldName);
                // }

                let itemSerializer = type.type.symbol.name + "Serializer";
                importer(itemSerializer, findSerializerModule(type.type, program.getCompilerOptions()));

                // this.field.fillToJson(json.jsonName)
                let fillToJsonStatent: ts.Statement = ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'fillToJson'),
                        [],
                        [
                            accessField(),
                            accessJsonName()
                        ]
                    )
                );
                if (type.isNullable) {
                    fillToJsonStatent = ts.factory.createIfStatement(accessField(), ts.factory.createBlock([fillToJsonStatent]));
                }

                statements.push(
                    ts.factory.createIfStatement(
                        // if(json.jsonName)
                        accessJsonName(),
                        // TypeSerializer.fillToJson(obj.fieldName, json.jsonName)
                        ts.factory.createBlock([fillToJsonStatent]),
                        // else json.jsonName = ...
                        ts.factory.createBlock([
                            assignToJsonName(
                                wrapToNonNull(
                                    type.isNullable,
                                    ts.factory.createCallExpression(
                                        // TypeName.toJson
                                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'toJson'),
                                        [],
                                        [accessField()]
                                    ),
                                    ts.factory
                                ),
                            )
                        ])
                    )
                );
            }
        }
    }

    return ts.factory.createBlock(addNewLines(statements))
}

function createFillToJsonMethod(program: ts.Program,
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
        'fillToJson',
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
                'json',
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
            )
        ],
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
        generateFillToJsonBody(program, propertiesToSerialize, importer)
    )
}

//
// setProperty
function createEnumMapping(value: string, type: ts.Type): ts.Expression {
    // isNan(parseInt(value)) ? Enum[Object.keys(Enum).find($k => $k.toLowerCase() === value.toLowerCase()] : parseInt(value)
    return ts.factory.createConditionalExpression(
        ts.factory.createCallExpression(ts.factory.createIdentifier('isNaN'), undefined, [
            ts.factory.createCallExpression(ts.factory.createIdentifier('parseInt'), undefined, [ts.factory.createIdentifier(value)])
        ]),
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        ts.factory.createElementAccessExpression(
            ts.factory.createIdentifier(type.symbol.name),
            ts.factory.createAsExpression(
                ts.factory.createCallExpression(
                    // Object.keys(EnumName).find
                    ts.factory.createPropertyAccessExpression(
                        // Object.keys(EnumName)
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('Object'), 'keys'),
                            [],
                            [ts.factory.createIdentifier(type.symbol.name)]
                        ),
                        'find'
                    ),
                    [],
                    [
                        ts.factory.createArrowFunction(
                            [],
                            [],
                            [ts.factory.createParameterDeclaration(undefined, undefined, undefined, '$k')],
                            undefined,
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.factory.createBinaryExpression(
                                ts.factory.createCallExpression(
                                    // $.toLowerCase()
                                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('$k'), 'toLowerCase'),
                                    [],
                                    []
                                ),
                                // ===
                                ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                                // value.toLowerCase()
                                ts.factory.createCallExpression(
                                    // $.toLowerCase()
                                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(value), 'toLowerCase'),
                                    [],
                                    []
                                )
                            )
                        )
                    ]
                ),
                ts.factory.createTypeOperatorNode(
                    ts.SyntaxKind.KeyOfKeyword,
                    ts.factory.createTypeQueryNode(ts.factory.createIdentifier(type.symbol.name))
                )
            )
        ),
        ts.factory.createToken(ts.SyntaxKind.ColonToken),
        ts.factory.createCallExpression(ts.factory.createIdentifier('parseInt'), undefined, [ts.factory.createIdentifier(value)])
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

        if (isEnumType(type.type)) {
            // obj.fieldName = enummapping
            // return true;
            importer(type.type.symbol!.name, findModule(type.type, program.getCompilerOptions()))
            if (type.isNullable) {
                caseStatements.push(assignField(
                    ts.factory.createConditionalExpression(
                        ts.factory.createBinaryExpression(
                            ts.factory.createIdentifier('value'),
                            ts.SyntaxKind.EqualsEqualsEqualsToken,
                            ts.factory.createNull()
                        ),
                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                        ts.factory.createNull(),
                        ts.factory.createToken(ts.SyntaxKind.ColonToken),
                        createEnumMapping('value', type.type)
                    )
                ));
            } else {
                caseStatements.push(assignField(createEnumMapping('value', type.type)));
            }
            caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
        } else if (isPrimitiveType(type.type)) {
            // obj.fieldName = value
            // return true;
            caseStatements.push(assignField(ts.factory.createIdentifier('value')));
            caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
        } else if (isTypedArray(type.type!)) {
            const arrayItemType = unwrapArrayItemType(type.type!, typeChecker);
            if (!arrayItemType || isPrimitiveType(arrayItemType)) {
                // nullable:
                // obj.fieldName = value ? value.slice() : null
                // return true;

                // not nullable:
                // obj.fieldName = value.slice()
                // return true;
                const sliceCall = ts.factory.createCallExpression(ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('value'), 'slice'), [], []);
                if (type.isNullable) {
                    caseStatements.push(
                        assignField(
                            ts.factory.createConditionalExpression(
                                ts.factory.createIdentifier('value'),
                                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                sliceCall,
                                ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                ts.factory.createNull()
                            )
                        )
                    );
                } else {
                    caseStatements.push(
                        assignField(sliceCall)
                    );
                }
                caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
            } else {
                const collectionAddMethod = ts.getJSDocTags(prop.property)
                    .filter(t => t.tagName.text === 'json_add')
                    .map(t => t.comment ?? "")[0];

                // obj.fieldName = [];
                // for(const $li of value) {
                //    obj.addFieldName(Type.FromJson($li));
                // }
                // or
                // for(const $li of value) {
                //    obj.fieldName.push(Type.FromJson($li));
                // }

                let itemSerializer = arrayItemType.symbol.name + "Serializer";
                importer(itemSerializer, findSerializerModule(arrayItemType, program.getCompilerOptions()));

                const itemFromJson = ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'fromJson'),
                    [],
                    [ts.factory.createIdentifier('$li')]
                );

                const loopItems = [
                    assignField(ts.factory.createArrayLiteralExpression(undefined)),
                    ts.factory.createForOfStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [ts.factory.createVariableDeclaration('$li')],
                            ts.NodeFlags.Const
                        ),
                        ts.factory.createIdentifier('value'),
                        ts.factory.createExpressionStatement(
                            collectionAddMethod
                                // obj.addFieldName(ItemTypeSerializer.FromJson($li))
                                ? ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier('obj'),
                                        collectionAddMethod
                                    ),
                                    undefined,
                                    [itemFromJson]
                                )
                                // obj.fieldName.push(ItemTypeSerializer.FromJson($li))
                                : ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier('obj'),
                                            fieldName
                                        ),
                                        'push'
                                    ),
                                    undefined,
                                    [itemFromJson]
                                )
                        )
                    )];

                if (type.isNullable) {
                    caseStatements.push(ts.factory.createIfStatement(
                        ts.factory.createIdentifier('value'),
                        ts.factory.createBlock(loopItems)
                    ));
                } else {
                    caseStatements.push(...loopItems);
                }
                caseStatements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));
            }

        } else if (isMap(type.type)) {
            // this.fieldName = new Map();
            // for(let key in value) {
            //   if(value.hasOwnProperty(key) obj.fieldName.set(<enummapping>, value[key]);
            // }
            // or 
            // for(let key in value) {
            //   if(value.hasOwnProperty(key) obj.addFieldName(<enummapping>, value[key]);
            // }
            // return true;

            const mapType = type.type as ts.TypeReference;
            if (!isPrimitiveType(mapType.typeArguments![0])) {
                throw new Error('only Map<EnumType, *> maps are supported extend if needed!');
            }

            const mapKey = isEnumType(mapType.typeArguments![0])
                ? createEnumMapping('$mk', mapType.typeArguments![0])
                : isNumberType(mapType.typeArguments![0])
                    ? ts.factory.createCallExpression(
                        ts.factory.createIdentifier('parseInt'),
                        undefined,
                        [ts.factory.createIdentifier('$mk')]
                    )
                    : ts.factory.createIdentifier('$mk');

            if (isEnumType(mapType.typeArguments![0])) {
                importer(mapType.typeArguments![0].symbol!.name, findModule(mapType.typeArguments![0], program.getCompilerOptions()));
            }

            let mapValue: ts.Expression = ts.factory.createElementAccessExpression(ts.factory.createIdentifier('value'), ts.factory.createIdentifier('$mk'));
            let itemSerializer: string = '';
            if (!isPrimitiveType(mapType.typeArguments![1])) {
                itemSerializer = mapType.typeArguments![1].symbol.name + "Serializer";
                importer(itemSerializer, findSerializerModule(mapType.typeArguments![1], program.getCompilerOptions()));
                importer(mapType.typeArguments![1]!.symbol.name, findModule(mapType.typeArguments![1], program.getCompilerOptions()));
                mapValue = ts.factory.createCallExpression(
                    // TypeName.fromJson
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'fromJson'),
                    [],
                    [mapValue]
                );
            }

            const collectionAddMethod = ts.getJSDocTags(prop.property)
                .filter(t => t.tagName.text === 'json_add')
                .map(t => t.comment ?? "")[0];

            caseStatements.push(assignField(ts.factory.createNewExpression(ts.factory.createIdentifier('Map'), [
                typeChecker.typeToTypeNode(mapType.typeArguments![0], undefined, undefined)!,
                typeChecker.typeToTypeNode(mapType.typeArguments![1], undefined, undefined)!,
            ], [])));
            caseStatements.push(
                ts.factory.createForInStatement(
                    ts.factory.createVariableDeclarationList(
                        [ts.factory.createVariableDeclaration(ts.factory.createIdentifier('$mk'), undefined, undefined)],
                        ts.NodeFlags.Let
                    ),
                    ts.factory.createIdentifier('value'),
                    ts.factory.createIfStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('value'), 'hasOwnProperty'),
                            undefined,
                            [ts.factory.createIdentifier('$mk')]
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
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'fromJson'),
                            [],
                            [ts.factory.createIdentifier('value')]
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
            importer(type.type.symbol!.name, findModule(type.type, program.getCompilerOptions()));

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
                    ts.factory.createBlock([
                        // if(obj.field) {
                        //    TypeNameSerializer.fillFromJson(obj.field, value);
                        // } else {
                        //    obj.field = TypeNameSerializer.fromJson(value);
                        //    or
                        //    obj.field = value ? TypeNameSerializer.fromJson(value) : null;
                        // }
                        // return true;
                        ts.factory.createIfStatement(
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                            ts.factory.createExpressionStatement(
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier(itemSerializer),
                                        'fillFromJson'
                                    ),
                                    [],
                                    [
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier('obj'),
                                            fieldName
                                        ),
                                        ts.factory.createIdentifier('value')
                                    ]
                                )
                            ),
                            assignField(
                                type.isNullable
                                    ? ts.factory.createConditionalExpression(
                                        ts.factory.createIdentifier('value'),
                                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                        ts.factory.createCallExpression(
                                            // TypeName.fromJson
                                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'fromJson'),
                                            [],
                                            [
                                                ts.factory.createIdentifier('value')
                                            ]
                                        ),
                                        ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                        ts.factory.createNull()
                                    )
                                    : ts.factory.createCallExpression(
                                        // TypeName.fromJson
                                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'fromJson'),
                                        [],
                                        [
                                            ts.factory.createIdentifier('value')
                                        ]
                                    )
                            )
                        ),
                        ts.factory.createReturnStatement(ts.factory.createTrue())
                    ]),
                    ts.factory.createBlock([
                        // for(const candidate of ["", "core"]) {
                        //   if(candidate.indexOf(property) === 0) {
                        //     if(!this.field) { this.field = new FieldType(); }
                        //     if(this.field.setProperty(property.substring(candidate.length), value)) return true;
                        //   }
                        // }
                        ts.factory.createForOfStatement(
                            undefined,
                            ts.factory.createVariableDeclarationList([ts.factory.createVariableDeclaration('$c')], ts.NodeFlags.Const),
                            jsonNameArray,
                            ts.factory.createIfStatement(
                                ts.factory.createBinaryExpression(
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('property'), 'indexOf'),
                                        [],
                                        [ts.factory.createIdentifier('$c')]
                                    ),
                                    ts.SyntaxKind.EqualsEqualsEqualsToken,
                                    ts.factory.createNumericLiteral('0')
                                ),
                                ts.factory.createBlock([
                                    ts.factory.createIfStatement(
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
                                                    [ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('$c'), 'length')]
                                                ),
                                                ts.factory.createIdentifier('value')
                                            ]
                                        ),
                                        ts.factory.createBlock([
                                            ts.factory.createReturnStatement(ts.factory.createTrue())
                                        ])
                                    )
                                ])
                            )
                        )
                    ])
                )
            );
        }

        if (caseStatements.length > 0) {
            for (let i = 0; i < caseValues.length; i++) {
                cases.push(
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(caseValues[i]),
                        // last case gets the statements, others are fall through
                        i < caseValues.length - 1 ? [] : caseStatements
                    )
                );
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
                'value',
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
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
                        jsonNames: jsonNames
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
            createFromJsonMethod(input),
            createFillFromJsonMethod(input),
            createToJsonMethod(input),
            createFillToJsonMethod(program, input, propertiesToSerialize, importer),
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