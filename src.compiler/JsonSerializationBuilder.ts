import { slice } from 'lodash';
import * as ts from 'typescript';
import { getTypeWithNullableInfo } from './BuilderHelpers';
import { isPrimitiveType } from './BuilderHelpers';
import { isEnumType } from './BuilderHelpers';
import { wrapToNonNull } from './BuilderHelpers';
import { isTypedArray } from './BuilderHelpers';
import { isMap } from './BuilderHelpers';
import { unwrapArrayItemType } from './BuilderHelpers';
;
interface JsonProperty {
    property: ts.PropertyDeclaration;
    jsonNames: string[];
}

function isImmutable(type: ts.Type): boolean {
    const declaration = type.symbol.valueDeclaration;
    if (declaration) {
        return !!ts.getJSDocTags(declaration).find(t => t.tagName.text === 'json_immutable');
    }

    return false;
}

function generateToJsonBodyForClass(
    factory: ts.NodeFactory
): ts.Block {
    return factory.createBlock([
        // const json:any = {};
        factory.createVariableStatement(
            [factory.createModifier(ts.SyntaxKind.ConstKeyword)],
            [
                factory.createVariableDeclaration(
                    'json',
                    undefined,
                    factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                    factory.createObjectLiteralExpression()
                )
            ]
        ),

        // obj.fillToJson(json)
        factory.createExpressionStatement(
            factory.createCallExpression(
                factory.createPropertyAccessExpression(factory.createIdentifier('obj'), 'fillToJson'),
                [],
                [factory.createIdentifier('json')]
            )
        ),

        // return json;
        factory.createReturnStatement(factory.createIdentifier('json'))
    ]);
}
function generateFillToJsonBodyForClass(
    program: ts.Program,
    propertiesToSerialize: JsonProperty[],
    factory: ts.NodeFactory
): ts.Block {
    const statements: ts.Statement[] = [];

    for (let prop of propertiesToSerialize) {
        const fieldName = (prop.property.name as ts.Identifier).text;
        const jsonName = prop.jsonNames.filter(n => n !== '')[0];

        const accessJsonName = function (): ts.Expression {
            return factory.createPropertyAccessExpression(factory.createIdentifier('json'), jsonName);
        };
        const accessField = function (): ts.Expression {
            return factory.createPropertyAccessExpression(factory.createThis(), factory.createIdentifier(fieldName));
        };

        const assignToJsonName = function (value: ts.Expression): ts.Statement {
            return factory.createExpressionStatement(factory.createAssignment(accessJsonName(), value));
        };

        if (jsonName) {
            const typeChecker = program.getTypeChecker();
            const type = getTypeWithNullableInfo(typeChecker, prop.property.type);
            if (isPrimitiveType(type.type)) {
                // json.jsonName = this.fieldName
                statements.push(assignToJsonName(accessField()));
            } else if (isTypedArray(type.type)) {
                const arrayItemType = unwrapArrayItemType(type.type, typeChecker);
                if (!arrayItemType || isPrimitiveType(arrayItemType)) {
                    // json.jsonName = this.fieldName ? this.fieldName.slice() : null
                    if (type.isNullable) {
                        statements.push(
                            assignToJsonName(
                                factory.createConditionalExpression(
                                    accessField(),
                                    factory.createToken(ts.SyntaxKind.QuestionToken),
                                    factory.createCallExpression(factory.createPropertyAccessExpression(accessField(), 'slice'), [], []),
                                    factory.createToken(ts.SyntaxKind.ColonToken),
                                    factory.createNull()
                                )
                            )
                        );
                    } else {
                        statements.push(
                            assignToJsonName(factory.createCallExpression(factory.createPropertyAccessExpression(accessField(), 'slice'), [], []))
                        );
                    }
                } else {
                    // json.jsonName = this.fieldName ? this.fieldName.map($li => $li.toJson()) : null
                    const mapCall = factory.createCallExpression(factory.createPropertyAccessExpression(accessField(), 'map'), undefined, [
                        factory.createArrowFunction(
                            undefined,
                            undefined,
                            [factory.createParameterDeclaration(undefined, undefined, undefined, '$li')],
                            undefined, factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            factory.createCallExpression(
                                factory.createPropertyAccessExpression(
                                    factory.createIdentifier('$li'),
                                    'toJson'
                                ),
                                undefined, []
                            )
                        ),
                    ]);
                    if (type.isNullable) {
                        statements.push(
                            assignToJsonName(
                                factory.createConditionalExpression(
                                    accessField(),
                                    factory.createToken(ts.SyntaxKind.QuestionToken),
                                    mapCall,
                                    factory.createToken(ts.SyntaxKind.ColonToken),
                                    factory.createNull()
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
                if (!isPrimitiveType(mapType.typeArguments[0])) {
                    throw new Error('only Map<Primitive, *> maps are supported extend if needed!');
                }
                // json.jsonName = { } as any;
                // this.fieldName.forEach((val, key) => (json.jsonName as any)[key] = val))
                statements.push(
                    assignToJsonName(
                        factory.createAsExpression(
                            factory.createObjectLiteralExpression(),
                            factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                        )
                    )
                );
                const mapValue = isPrimitiveType(mapType.typeArguments[1])
                    ? factory.createIdentifier('$mv')
                    : factory.createCallExpression(
                        factory.createPropertyAccessExpression(
                            factory.createIdentifier('$mv'),
                            'toJson'
                        ),
                        undefined,
                        []
                    );

                statements.push(
                    factory.createExpressionStatement(
                        factory.createCallExpression(factory.createPropertyAccessExpression(accessField(), 'forEach'), undefined, [
                            factory.createArrowFunction(
                                undefined,
                                undefined,
                                [
                                    factory.createParameterDeclaration(undefined, undefined, undefined, '$mv'),
                                    factory.createParameterDeclaration(undefined, undefined, undefined, '$mk')
                                ],
                                undefined,
                                factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                factory.createBlock([
                                    factory.createExpressionStatement(
                                        factory.createAssignment(
                                            factory.createElementAccessExpression(
                                                factory.createAsExpression(
                                                    accessJsonName(),
                                                    factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                                                ),
                                                factory.createIdentifier('$mk')
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
                // json.jsonName = TypeName.toJson(this.fieldName);
                statements.push(
                    assignToJsonName(
                        wrapToNonNull(
                            type.isNullable,
                            factory.createCallExpression(
                                factory.createPropertyAccessExpression(factory.createIdentifier(type.type.symbol.name), 'toJson'),
                                [],
                                [accessField()]
                            ),
                            factory
                        )
                    )
                );
            } else {
                // not nullable:
                // if(json.jsonName) {
                //   this.fieldName.fillToJson(json.jsonName)
                // } else {
                //   json.jsonName = TypeName.toJson(this.fieldName)!;
                // }

                // nullable:
                // if(json.jsonName) {
                //   if(this.fieldName) this.fieldName.fillToJson(json.jsonName)
                // } else {
                //   json.jsonName = TypeName.toJson(this.fieldName);
                // }

                // this.field.fillToJson(json.jsonName)
                let fillToJsonStatent: ts.Statement = factory.createExpressionStatement(
                    factory.createCallExpression(
                        // this.field.fillToJson
                        factory.createPropertyAccessExpression(accessField(), 'fillToJson'),
                        [],
                        [accessJsonName()]
                    )
                );
                if (type.isNullable) {
                    fillToJsonStatent = factory.createIfStatement(accessField(), fillToJsonStatent);
                }

                statements.push(
                    factory.createIfStatement(
                        // if(json.jsonName)
                        accessJsonName(),
                        // this.field.fillToJson(json.jsonName)
                        fillToJsonStatent,
                        // else json.jsonName = ...
                        assignToJsonName(
                            wrapToNonNull(
                                type.isNullable,
                                factory.createCallExpression(
                                    // TypeName.toJson
                                    factory.createPropertyAccessExpression(factory.createIdentifier(type.type.symbol.name), 'toJson'),
                                    [],
                                    [accessField()]
                                ),
                                factory
                            ),
                        )
                    )
                );
            }
        }
    }

    return factory.createBlock(statements);
}
function generateFromJsonBodyForClass(
    classDeclaration: ts.ClassDeclaration,
    factory: ts.NodeFactory
): ts.Block {
    const statements: ts.Statement[] = [];
    // if(!json) return null;
    statements.push(
        factory.createIfStatement(
            factory.createPrefixUnaryExpression(ts.SyntaxKind.ExclamationToken, factory.createIdentifier('json')),
            factory.createReturnStatement(factory.createNull())
        )
    );

    // const obj = new Type();
    statements.push(
        factory.createVariableStatement(
            [factory.createModifier(ts.SyntaxKind.ConstKeyword)],
            [
                factory.createVariableDeclaration(
                    'obj',
                    undefined,
                    undefined,
                    factory.createNewExpression(factory.createIdentifier(classDeclaration.name.text), [], [])
                )
            ]
        )
    );

    // obj.fillFromJson(json);
    statements.push(
        factory.createExpressionStatement(
            factory.createCallExpression(
                factory.createPropertyAccessExpression(factory.createIdentifier('obj'), 'fillFromJson'),
                [],
                [factory.createIdentifier('json')]
            )
        )
    );

    // return obj;
    statements.push(
        // return json;
        factory.createReturnStatement(factory.createIdentifier('obj'))
    );

    return factory.createBlock(statements);
}
function generateFillFromJsonBodyForClass(
    factory: ts.NodeFactory
): ts.Block {
    return factory.createBlock([
        factory.createIfStatement(
            // if(json) for($k in json) { this.setProperty($k.toLowerCase(), json[$k]) }
            factory.createIdentifier('json'),
            factory.createForInStatement(
                factory.createVariableDeclarationList([factory.createVariableDeclaration('$k')], ts.NodeFlags.Const),
                factory.createIdentifier('json'),
                factory.createExpressionStatement(
                    factory.createCallExpression(
                        factory.createPropertyAccessExpression(factory.createThis(), 'setProperty'),
                        [],
                        [
                            // $k.toLowerCase(),
                            factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier('$k'), 'toLowerCase'), [], []),
                            // json[$k]
                            factory.createElementAccessExpression(factory.createIdentifier('json'), factory.createIdentifier('$k'))
                        ]
                    )
                )
            )
        )
    ]);
}

function createEnumMapping(value: string, type: ts.Type, factory: ts.NodeFactory): ts.Expression {
    // isNan(parseInt(value)) ? Enum[Object.keys(Enum).find($k => $k.toLowerCase() === value.toLowerCase()] : parseInt(value)
    return factory.createConditionalExpression(
        factory.createCallExpression(factory.createIdentifier('isNaN'), undefined, [
            factory.createCallExpression(factory.createIdentifier('parseInt'), undefined, [factory.createIdentifier(value)])
        ]),
        factory.createToken(ts.SyntaxKind.QuestionToken),
        factory.createElementAccessExpression(
            factory.createIdentifier(type.symbol.name),
            factory.createCallExpression(
                // Object.keys(EnumName).find
                factory.createPropertyAccessExpression(
                    // Object.keys(EnumName)
                    factory.createCallExpression(
                        factory.createPropertyAccessExpression(factory.createIdentifier('Object'), 'keys'),
                        [],
                        [factory.createIdentifier(type.symbol.name)]
                    ),
                    'find'
                ),
                [],
                [
                    factory.createArrowFunction(
                        [],
                        [],
                        [factory.createParameterDeclaration(undefined, undefined, undefined, '$k')],
                        undefined,
                        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                        factory.createBinaryExpression(
                            factory.createCallExpression(
                                // $.toLowerCase()
                                factory.createPropertyAccessExpression(factory.createIdentifier('$k'), 'toLowerCase'),
                                [],
                                []
                            ),
                            // ===
                            factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                            // value.toLowerCase()
                            factory.createCallExpression(
                                // $.toLowerCase()
                                factory.createPropertyAccessExpression(factory.createIdentifier(value), 'toLowerCase'),
                                [],
                                []
                            )
                        )
                    )
                ]
            )
        ),
        factory.createToken(ts.SyntaxKind.ColonToken),
        factory.createCallExpression(factory.createIdentifier('parseInt'), undefined, [factory.createIdentifier(value)])
    );
}

function generateSetPropertyMethodBodyForClass(
    program: ts.Program,
    propertiesToSerialize: JsonProperty[],
    factory: ts.NodeFactory
): ts.Block {
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
            return factory.createExpressionStatement(
                factory.createAssignment(factory.createPropertyAccessExpression(factory.createThis(), fieldName), expr)
            );
        };

        if (isEnumType(type.type)) {
            // this.fieldName = enummapping
            // return true;
            caseStatements.push(assignField(createEnumMapping('value', type.type, factory)));
            caseStatements.push(factory.createReturnStatement(factory.createTrue()));
        } else if (isPrimitiveType(type.type)) {
            // this.fieldName = value
            // return true;
            caseStatements.push(assignField(factory.createIdentifier('value')));
            caseStatements.push(factory.createReturnStatement(factory.createTrue()));
        } else if (isTypedArray(type.type)) {
            const arrayItemType = unwrapArrayItemType(type.type, typeChecker);
            if (!arrayItemType || isPrimitiveType(arrayItemType)) {
                // nullable:
                // this.fieldName = value ? value.slice() : null
                // return true;

                // not nullable:
                // this.fieldName = value.slice()
                // return true;
                const sliceCall = factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier('value'), 'slice'), [], []);
                if (type.isNullable) {
                    caseStatements.push(
                        assignField(
                            factory.createConditionalExpression(
                                factory.createIdentifier('value'),
                                factory.createToken(ts.SyntaxKind.QuestionToken),
                                sliceCall,
                                factory.createToken(ts.SyntaxKind.ColonToken),
                                factory.createNull()
                            )
                        )
                    );
                } else {
                    caseStatements.push(
                        assignField(sliceCall)
                    );
                }
                caseStatements.push(factory.createReturnStatement(factory.createTrue()));
            } else {
                const collectionAddMethod = ts.getJSDocTags(prop.property)
                    .filter(t => t.tagName.text === 'json_add')
                    .map(t => t.comment ?? "")[0];

                // this.fieldName = [];
                // for(const $li of value) {
                //    this.addFieldName(Type.FromJson($li));
                // }
                // or
                // for(const $li of value) {
                //    this.fieldName.push(Type.FromJson($li));
                // }
                const loopItems = [
                    assignField(factory.createArrayLiteralExpression(undefined)),
                    factory.createForOfStatement(
                        undefined,
                        factory.createVariableDeclarationList(
                            [factory.createVariableDeclaration('$li')],
                            ts.NodeFlags.Const
                        ),
                        factory.createIdentifier('value'),
                        factory.createExpressionStatement(
                            collectionAddMethod
                                // this.addFieldName(TypeName.FromJson($li))
                                ? factory.createCallExpression(
                                    factory.createPropertyAccessExpression(
                                        factory.createThis(),
                                        collectionAddMethod
                                    ),
                                    undefined,
                                    [factory.createCallExpression(
                                        factory.createPropertyAccessExpression(factory.createIdentifier(arrayItemType.symbol.name), 'fromJson'),
                                        [],
                                        [factory.createIdentifier('$li')]
                                    )]
                                )
                                // this.fieldName.push(TypeName.FromJson($li))
                                : factory.createCallExpression(
                                    factory.createPropertyAccessExpression(
                                        factory.createPropertyAccessExpression(
                                            factory.createThis(),
                                            fieldName
                                        ),
                                        'push'
                                    ),
                                    undefined,
                                    [factory.createCallExpression(
                                        factory.createPropertyAccessExpression(factory.createIdentifier(arrayItemType.symbol.name), 'fromJson'),
                                        [],
                                        [factory.createIdentifier('$li')]
                                    )]
                                )
                        )
                    )];

                if (type.isNullable) {
                    caseStatements.push(factory.createIfStatement(
                        factory.createIdentifier('value'),
                        factory.createBlock(loopItems)
                    ));
                } else {
                    caseStatements.push(...loopItems);
                }
            }

        } else if (isMap(type.type)) {
            // this.fieldName = new Map();
            // for(let key in value) {
            //   if(value.hasOwnProperty(key) this.fieldName.set(<enummapping>, value[key]);
            // }
            // or 
            // for(let key in value) {
            //   if(value.hasOwnProperty(key) this.addFieldName(<enummapping>, value[key]);
            // }
            // return true;

            const mapType = type.type as ts.TypeReference;
            if (!isPrimitiveType(mapType.typeArguments[0])) {
                throw new Error('only Map<EnumType, *> maps are supported extend if needed!');
            }

            const mapKey = isEnumType(mapType.typeArguments[0])
                ? createEnumMapping('$mk', mapType.typeArguments![0], factory)
                : factory.createIdentifier('$mk');

            let mapValue: ts.Expression = factory.createElementAccessExpression(factory.createIdentifier('value'), factory.createIdentifier('$mk'));
            if (!isPrimitiveType(mapType.typeArguments[1])) {
                mapValue = factory.createCallExpression(
                    // TypeName.fromJson
                    factory.createPropertyAccessExpression(factory.createIdentifier(mapType.typeArguments[1].symbol.name), 'fromJson'),
                    [],
                    [factory.createIdentifier('value')]
                );
            }

            const collectionAddMethod = ts.getJSDocTags(prop.property)
                .filter(t => t.tagName.text === 'json_add')
                .map(t => t.comment ?? "")[0];

            caseStatements.push(assignField(factory.createNewExpression(factory.createIdentifier('Map'), undefined, [])));
            caseStatements.push(
                factory.createForInStatement(
                    factory.createVariableDeclarationList(
                        [factory.createVariableDeclaration(factory.createIdentifier('$mk'), undefined, undefined)],
                        ts.NodeFlags.Let
                    ),
                    factory.createIdentifier('value'),
                    factory.createIfStatement(
                        factory.createCallExpression(
                            factory.createPropertyAccessExpression(factory.createIdentifier('value'), 'hasOwnProperty'),
                            undefined,
                            [factory.createIdentifier('$mk')]
                        ),
                        factory.createExpressionStatement(
                            factory.createCallExpression(
                                collectionAddMethod
                                    ? factory.createPropertyAccessExpression(factory.createThis(), collectionAddMethod)
                                    : factory.createPropertyAccessExpression(
                                        factory.createPropertyAccessExpression(factory.createThis(), factory.createIdentifier(fieldName)),
                                        factory.createIdentifier('set')
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
            caseStatements.push(factory.createReturnStatement(factory.createTrue()));
        } else if (isImmutable(type.type)) {
            // this.fieldName = TypeName.fromJson(value)!
            // return true;
            caseStatements.push(
                assignField(
                    wrapToNonNull(
                        type.isNullable,
                        factory.createCallExpression(
                            // TypeName.fromJson
                            factory.createPropertyAccessExpression(factory.createIdentifier(type.type.symbol.name), 'fromJson'),
                            [],
                            [factory.createIdentifier('value')]
                        ),
                        factory
                    )
                )
            );
            caseStatements.push(factory.createReturnStatement(factory.createTrue()));
        } else {
            // for complex types it is a bit more tricky
            // if the property matches exactly, we use fromJson
            // if the property starts with the field name, we try to set a sub-property
            const jsonNameArray = factory.createArrayLiteralExpression(jsonNames.map(n => factory.createStringLiteral(n)));

            statements.push(
                factory.createIfStatement(
                    // if(["", "core"].indexOf(property) >= 0)
                    factory.createBinaryExpression(
                        factory.createCallExpression(
                            factory.createPropertyAccessExpression(jsonNameArray, 'indexOf'),
                            [],
                            [factory.createIdentifier('property')]
                        ),
                        ts.SyntaxKind.GreaterThanEqualsToken,
                        factory.createNumericLiteral('0')
                    ),
                    factory.createBlock([
                        // if(this.field) {
                        //    this.field.fillFromJson(value);
                        // } else {
                        //    this.field = TypeName.fromJson(value);
                        // }
                        // return true;
                        factory.createIfStatement(
                            factory.createPropertyAccessExpression(factory.createThis(), fieldName),
                            factory.createExpressionStatement(
                                factory.createCallExpression(
                                    factory.createPropertyAccessExpression(
                                        factory.createPropertyAccessExpression(factory.createThis(), fieldName),
                                        'fillFromJson'
                                    ),
                                    [],
                                    [factory.createIdentifier('value')]
                                )
                            ),
                            assignField(
                                wrapToNonNull(
                                    type.isNullable,
                                    factory.createCallExpression(
                                        // TypeName.fromJson
                                        factory.createPropertyAccessExpression(factory.createIdentifier(type.type.symbol.name), 'fromJson'),
                                        [],
                                        [factory.createIdentifier('value')]
                                    ),
                                    factory
                                )
                            )
                        ),
                        factory.createReturnStatement(factory.createTrue())
                    ]),
                    factory.createBlock([
                        // for(const candidate of ["", "core"]) {
                        //   if(candidate.indexOf(property) === 0) {
                        //     if(!this.field) { this.field = new FieldType(); }
                        //     if(this.field.setProperty(property.substring(candidate.length), value)) return true;
                        //   }
                        // }
                        factory.createForOfStatement(
                            undefined,
                            factory.createVariableDeclarationList([factory.createVariableDeclaration('$c')], ts.NodeFlags.Const),
                            jsonNameArray,
                            factory.createIfStatement(
                                factory.createBinaryExpression(
                                    factory.createCallExpression(
                                        factory.createPropertyAccessExpression(factory.createIdentifier('property'), 'indexOf'),
                                        [],
                                        [factory.createIdentifier('$c')]
                                    ),
                                    ts.SyntaxKind.EqualsEqualsEqualsToken,
                                    factory.createNumericLiteral('0')
                                ),
                                factory.createBlock([
                                    factory.createIfStatement(
                                        factory.createPrefixUnaryExpression(
                                            ts.SyntaxKind.ExclamationToken,
                                            factory.createPropertyAccessExpression(factory.createThis(), fieldName)
                                        ),
                                        assignField(factory.createNewExpression(factory.createIdentifier(type.type.symbol.name), [], []))
                                    ),
                                    factory.createIfStatement(
                                        factory.createCallExpression(
                                            factory.createPropertyAccessExpression(
                                                factory.createPropertyAccessExpression(factory.createThis(), fieldName),
                                                'setProperty'
                                            ),
                                            [],
                                            [
                                                factory.createCallExpression(
                                                    factory.createPropertyAccessExpression(
                                                        factory.createIdentifier('property'),
                                                        'substring'
                                                    ),
                                                    [],
                                                    [factory.createPropertyAccessExpression(factory.createIdentifier('$c'), 'length')]
                                                ),
                                                factory.createIdentifier('value')
                                            ]
                                        ),
                                        factory.createReturnStatement(factory.createTrue())
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
                    factory.createCaseClause(
                        factory.createStringLiteral(caseValues[i]),
                        // last case gets the statements, others are fall through
                        i < caseValues.length - 1 ? [] : caseStatements
                    )
                );
            }
        }
    }

    const switchExpr = factory.createSwitchStatement(factory.createIdentifier('property'), factory.createCaseBlock(cases));
    statements.unshift(switchExpr);
    statements.push(factory.createReturnStatement(factory.createFalse()));

    return factory.createBlock(statements);
}

function rewriteClassForJsonSerialization(
    program: ts.Program,
    classDeclaration: ts.ClassDeclaration,
    sourceFile: ts.SourceFile,
    factory: ts.NodeFactory
): ts.ClassDeclaration {
    console.debug(`Rewriting ${classDeclaration.name.escapedText} for JSON serialization`);
    let toJsonMethod: ts.MethodDeclaration = undefined;
    let fromJsonMethod: ts.MethodDeclaration = undefined;
    let fillToJsonMethod: ts.MethodDeclaration = undefined;
    let fillFromJsonMethod: ts.MethodDeclaration = undefined;
    let setPropertyMethod: ts.MethodDeclaration = undefined;

    let propertiesToSerialize: JsonProperty[] = [];

    var newMembers = [];

    // collect class state
    classDeclaration.members.forEach(member => {
        if (ts.isPropertyDeclaration(member)) {
            const propertyDeclaration = member as ts.PropertyDeclaration;
            if (!propertyDeclaration.modifiers.find(m => m.kind === ts.SyntaxKind.StaticKeyword || m.kind == ts.SyntaxKind.PrivateKeyword)) {
                const jsonNames = [member.name.getText(sourceFile)];

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
            newMembers.push(member);
        } else if (ts.isMethodDeclaration(member)) {
            if (ts.isIdentifier(member.name)) {
                const methodName = (member.name as ts.Identifier).escapedText;
                switch (methodName) {
                    case 'toJson':
                        toJsonMethod = member;
                        break;
                    case 'fromJson':
                        fromJsonMethod = member;
                        break;
                    case 'fillToJson':
                        fillToJsonMethod = member;
                        break;
                    case 'fillFromJson':
                        fillFromJsonMethod = member;
                        break;
                    case 'setProperty':
                        setPropertyMethod = member;
                        break;
                    default:
                        newMembers.push(member);
                        break;
                }
            }
        } else {
            newMembers.push(member);
        }
    });

    if (!toJsonMethod) {
        toJsonMethod = factory.createMethodDeclaration(
            undefined,
            [factory.createModifier(ts.SyntaxKind.PublicKeyword), factory.createModifier(ts.SyntaxKind.StaticKeyword)],
            undefined,
            'toJson',
            undefined,
            undefined,
            [
                factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    'obj',
                    undefined,
                    factory.createTypeReferenceNode(classDeclaration.name, [])
                )
            ],
            factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
            undefined
        );
    }

    if (!fillToJsonMethod) {
        fillToJsonMethod = factory.createMethodDeclaration(
            undefined,
            [factory.createModifier(ts.SyntaxKind.PublicKeyword)],
            undefined,
            'fillToJson',
            undefined,
            undefined,
            [
                factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    'json',
                    undefined,
                    factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                )
            ],
            factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
            factory.createBlock([factory.createThrowStatement(factory.createStringLiteral('todo'))])
        );
    }

    if (!fromJsonMethod) {
        fromJsonMethod = factory.createMethodDeclaration(
            undefined,
            [factory.createModifier(ts.SyntaxKind.PublicKeyword), factory.createModifier(ts.SyntaxKind.StaticKeyword)],
            undefined,
            'fromJson',
            undefined,
            undefined,
            [
                factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    'json',
                    undefined,
                    factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                )
            ],
            factory.createTypeReferenceNode(classDeclaration.name, []),
            factory.createBlock([factory.createThrowStatement(factory.createStringLiteral('todo'))])
        );
    }

    if (!fillFromJsonMethod) {
        fillFromJsonMethod = factory.createMethodDeclaration(
            undefined,
            [factory.createModifier(ts.SyntaxKind.PublicKeyword)],
            undefined,
            'fillFromJson',
            undefined,
            undefined,
            [
                factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    'json',
                    undefined,
                    factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                )
            ],
            factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
            factory.createBlock([factory.createThrowStatement(factory.createStringLiteral('todo'))])
        );
    }

    if (!setPropertyMethod) {
        setPropertyMethod = factory.createMethodDeclaration(
            undefined,
            [factory.createModifier(ts.SyntaxKind.PublicKeyword)],
            undefined,
            'setProperty',
            undefined,
            undefined,
            [
                factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    'property',
                    undefined,
                    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                ),
                factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    'value',
                    undefined,
                    factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                )
            ],
            factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
            factory.createBlock([factory.createThrowStatement(factory.createStringLiteral('todo'))])
        );
    }

    function updateMethodBody(
        method: ts.MethodDeclaration,
        paramNames: string[],
        body: ts.Block,
        factory: ts.NodeFactory
    ): ts.MethodDeclaration {
        if (!method) {
            return;
        }
        const parameters = method.parameters.map((v, i) =>
            factory.createParameterDeclaration(
                method.parameters[i].decorators,
                method.parameters[i].modifiers,
                method.parameters[i].dotDotDotToken,
                i < paramNames.length ? paramNames[i] : method.parameters[0].name,
                method.parameters[i].questionToken,
                method.parameters[i].type,
                method.parameters[i].initializer
            )
        );

        return factory.updateMethodDeclaration(
            method,
            method.decorators,
            method.modifiers,
            method.asteriskToken,
            method.name,
            method.questionToken,
            method.typeParameters,
            parameters,
            method.type,
            body
        );
    }

    toJsonMethod = updateMethodBody(
        toJsonMethod,
        ['obj'],
        generateToJsonBodyForClass(factory),
        factory
    );

    fillToJsonMethod = updateMethodBody(
        fillToJsonMethod,
        ['json'],
        generateFillToJsonBodyForClass(program, propertiesToSerialize, factory),
        factory
    );

    fromJsonMethod = updateMethodBody(
        fromJsonMethod,
        ['json'],
        generateFromJsonBodyForClass(classDeclaration, factory),
        factory
    );

    fillFromJsonMethod = updateMethodBody(
        fillFromJsonMethod,
        ['json'],
        generateFillFromJsonBodyForClass(factory),
        factory
    );

    setPropertyMethod = updateMethodBody(
        setPropertyMethod,
        ['property', 'value'],
        generateSetPropertyMethodBodyForClass(program, propertiesToSerialize, factory),
        factory
    );

    newMembers.push(toJsonMethod);
    newMembers.push(fillToJsonMethod);
    newMembers.push(fromJsonMethod);
    newMembers.push(fillFromJsonMethod);
    newMembers.push(setPropertyMethod);

    console.debug(`Rewriting ${classDeclaration.name.escapedText} done`);

    return factory.updateClassDeclaration(
        classDeclaration,
        classDeclaration.decorators,
        classDeclaration.modifiers,
        classDeclaration.name,
        classDeclaration.typeParameters,
        classDeclaration.heritageClauses,
        newMembers
    );
}

export default function (program: ts.Program) {
    return (ctx: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            function visitor(node: ts.Node): ts.Node {
                if (ts.isClassDeclaration(node)) {
                    if (ts.getJSDocTags(node).find(t => t.tagName.text === 'json')) {
                        return rewriteClassForJsonSerialization(program, node, sourceFile, ctx.factory);
                    }
                }

                return node;
            }

            return ts.visitEachChild(sourceFile, visitor, ctx);
        };
    };
}
