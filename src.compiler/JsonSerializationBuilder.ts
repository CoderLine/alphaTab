import * as ts from 'typescript';
interface JsonProperty {
    property: ts.PropertyDeclaration;
    jsonNames: string[];
}

function wrapToNonNull(isNullableType: boolean, expr: ts.Expression) {
    return isNullableType ? expr : ts.createNonNullExpression(expr);
}

function getTypeWithNullableInfo(checker: ts.TypeChecker, node: ts.TypeNode) {
    let isNullable = false;
    let type: ts.Type | null = null;
    if (ts.isUnionTypeNode(node)) {
        for (const t of node.types) {
            if (t.kind === ts.SyntaxKind.NullKeyword) {
                isNullable = true;
            } else if (type !== null) {
                throw new Error('Multi union types on JSON settings not supported!');
            } else {
                type = checker.getTypeAtLocation(t);
            }
        }
    } else {
        type = checker.getTypeAtLocation(node);
    }

    return {
        isNullable,
        type
    };
}

function isPrimitiveType(type: ts.Type) {
    if (hasFlag(type, ts.TypeFlags.Number)) {
        return true;
    }
    if (hasFlag(type, ts.TypeFlags.String)) {
        return true;
    }
    if (hasFlag(type, ts.TypeFlags.Boolean)) {
        return true;
    }
    if (hasFlag(type, ts.TypeFlags.BigInt)) {
        return true;
    }
    if (hasFlag(type, ts.TypeFlags.Unknown)) {
        return true;
    }

    return isEnumType(type);
}

function isEnumType(type: ts.Type) {
    // if for some reason this returns true...
    if (hasFlag(type, ts.TypeFlags.Enum)) return true;
    // it's not an enum type if it's an enum literal type
    if (hasFlag(type, ts.TypeFlags.EnumLiteral) && !type.isUnion()) return false;
    // get the symbol and check if its value declaration is an enum declaration
    const symbol = type.getSymbol();
    if (!symbol) return false;
    const { valueDeclaration } = symbol;

    return valueDeclaration && valueDeclaration.kind === ts.SyntaxKind.EnumDeclaration;
}

function isTypedArray(type: ts.Type) {
    return type.symbol.members.has(ts.escapeLeadingUnderscores('slice'));
}

function hasFlag(type: ts.Type, flag: ts.TypeFlags): boolean {
    return (type.flags & flag) === flag;
}

function isImmutable(type: ts.Type): boolean {
    const declaration = type.symbol.valueDeclaration;
    if (declaration) {
        return !!ts.getJSDocTags(declaration).find(t => t.tagName.text === 'json_immutable');
    }

    return false;
}

function isMap(type: ts.Type): boolean {
    return type.symbol.name === 'Map';
}

function generateToJsonBodyForClass(
    classDeclaration: ts.ClassDeclaration,
    propertiesToSerialize: JsonProperty[]
): ts.Block {
    return ts.createBlock([
        // const json:any = {};
        ts.createVariableStatement(
            [ts.createModifier(ts.SyntaxKind.ConstKeyword)],
            [
                ts.createVariableDeclaration(
                    'json',
                    ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                    ts.createObjectLiteral()
                )
            ]
        ),

        // obj.fillToJson(json)
        ts.createExpressionStatement(
            ts.createCall(
                ts.createPropertyAccess(ts.createIdentifier('obj'), 'fillToJson'),
                [],
                [ts.createIdentifier('json')]
            )
        ),

        // return json;
        ts.createReturn(ts.createIdentifier('json'))
    ]);
}
function generateFillToJsonBodyForClass(
    program: ts.Program,
    classDeclaration: ts.ClassDeclaration,
    propertiesToSerialize: JsonProperty[]
): ts.Block {
    const statements: ts.Statement[] = [];

    for (let prop of propertiesToSerialize) {
        const fieldName = (prop.property.name as ts.Identifier).text;
        const jsonName = prop.jsonNames.filter(n => n !== '')[0];

        const accessJsonName = function (): ts.Expression {
            return ts.createPropertyAccess(ts.createIdentifier('json'), jsonName);
        };
        const accessField = function (): ts.Expression {
            return ts.createPropertyAccess(ts.createThis(), ts.createIdentifier(fieldName));
        };

        const assignToJsonName = function (value: ts.Expression): ts.Statement {
            return ts.createExpressionStatement(ts.createAssignment(accessJsonName(), value));
        };

        if (jsonName) {
            const type = getTypeWithNullableInfo(program.getTypeChecker(), prop.property.type);
            if (isPrimitiveType(type.type)) {
                // json.jsonName = this.fieldName
                statements.push(assignToJsonName(accessField()));
            } else if (isTypedArray(type.type)) {
                // json.jsonName = this.fieldName ? this.fieldName.slice() : null
                if (type.isNullable) {
                    statements.push(
                        assignToJsonName(
                            ts.createConditional(
                                accessField(),
                                ts.createToken(ts.SyntaxKind.QuestionToken),
                                ts.createCall(ts.createPropertyAccess(accessField(), 'slice'), [], []),
                                ts.createToken(ts.SyntaxKind.ColonToken),
                                ts.createNull()
                            )
                        )
                    );
                } else {
                    statements.push(
                        assignToJsonName(ts.createCall(ts.createPropertyAccess(accessField(), 'slice'), [], []))
                    );
                }
            } else if (isMap(type.type)) {
                const mapType = type.type as ts.TypeReference;
                if (!isEnumType(mapType.typeArguments[0]) || !isPrimitiveType(mapType.typeArguments[1])) {
                    throw new Error('only Map<EnumType, Primitive> maps are supported extend if needed!');
                }
                // json.jsonName = { } as any;
                // this.fieldName.forEach((val, key) => (json.jsonName as any)[key] = val))
                statements.push(
                    assignToJsonName(
                        ts.createAsExpression(
                            ts.createObjectLiteral(),
                            ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                        )
                    )
                );
                statements.push(
                    ts.createExpressionStatement(
                        ts.createCall(ts.createPropertyAccess(accessField(), 'forEach'), undefined, [
                            ts.createArrowFunction(
                                undefined,
                                undefined,
                                [
                                    ts.createParameter(undefined, undefined, undefined, '$mv'),
                                    ts.createParameter(undefined, undefined, undefined, '$mk')
                                ],
                                undefined,
                                ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                ts.createBlock([
                                    ts.createExpressionStatement(
                                        ts.createAssignment(
                                            ts.createElementAccess(
                                                ts.createAsExpression(
                                                    accessJsonName(),
                                                    ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                                                ),
                                                ts.createIdentifier('$mk')
                                            ),
                                            ts.createIdentifier('$mv')
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
                            ts.createCall(
                                ts.createPropertyAccess(ts.createIdentifier(type.type.symbol.name), 'toJson'),
                                [],
                                [accessField()]
                            )
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
                let fillToJsonStatent: ts.Statement = ts.createExpressionStatement(
                    ts.createCall(
                        // this.field.fillToJson
                        ts.createPropertyAccess(accessField(), 'fillToJson'),
                        [],
                        [accessJsonName()]
                    )
                );
                if (type.isNullable) {
                    fillToJsonStatent = ts.createIf(accessField(), fillToJsonStatent);
                }

                statements.push(
                    ts.createIf(
                        // if(json.jsonName)
                        accessJsonName(),
                        // this.field.fillToJson(json.jsonName)
                        fillToJsonStatent,
                        // else json.jsonName = ...
                        assignToJsonName(
                            wrapToNonNull(
                                type.isNullable,
                                ts.createCall(
                                    // TypeName.toJson
                                    ts.createPropertyAccess(ts.createIdentifier(type.type.symbol.name), 'toJson'),
                                    [],
                                    [accessField()]
                                )
                            )
                        )
                    )
                );
            }
        }
    }

    return ts.createBlock(statements);
}
function generateFromJsonBodyForClass(
    classDeclaration: ts.ClassDeclaration,
    propertiesToSerialize: JsonProperty[]
): ts.Block {
    const statements: ts.Statement[] = [];
    // if(!json) return null;
    statements.push(
        ts.createIf(
            ts.createPrefix(ts.SyntaxKind.ExclamationToken, ts.createIdentifier('json')),
            ts.createReturn(ts.createNull())
        )
    );

    // const obj = new Type();
    statements.push(
        ts.createVariableStatement(
            [ts.createModifier(ts.SyntaxKind.ConstKeyword)],
            [
                ts.createVariableDeclaration(
                    'obj',
                    undefined,
                    ts.createNew(ts.createIdentifier(classDeclaration.name.text), [], [])
                )
            ]
        )
    );

    // obj.fillFromJson(json);
    statements.push(
        ts.createExpressionStatement(
            ts.createCall(
                ts.createPropertyAccess(ts.createIdentifier('obj'), 'fillFromJson'),
                [],
                [ts.createIdentifier('json')]
            )
        )
    );

    // return obj;
    statements.push(
        // return json;
        ts.createReturn(ts.createIdentifier('obj'))
    );

    return ts.createBlock(statements);
}
function generateFillFromJsonBodyForClass(
    classDeclaration: ts.ClassDeclaration,
    propertiesToSerialize: JsonProperty[]
): ts.Block {
    return ts.createBlock([
        ts.createIf(
            // if(json) for($k in json) { this.setProperty($k.toLowerCase(), json[$k]) }
            ts.createIdentifier('json'),
            ts.createForIn(
                ts.createVariableDeclarationList([ts.createVariableDeclaration('$k')], ts.NodeFlags.Const),
                ts.createIdentifier('json'),
                ts.createExpressionStatement(
                    ts.createCall(
                        ts.createPropertyAccess(ts.createThis(), 'setProperty'),
                        [],
                        [
                            // $k.toLowerCase(),
                            ts.createCall(ts.createPropertyAccess(ts.createIdentifier('$k'), 'toLowerCase'), [], []),
                            // json[$k]
                            ts.createElementAccess(ts.createIdentifier('json'), ts.createIdentifier('$k'))
                        ]
                    )
                )
            )
        )
    ]);
}

function createEnumMapping(value: string, type: ts.Type): ts.Expression {
    // isNan(parseInt(value)) ? Enum[Object.keys(Enum).find($k => $k.toLowerCase() === value.toLowerCase()] : parseInt(value)
    return ts.createConditional(
        ts.createCall(ts.createIdentifier('isNaN'), undefined, [
            ts.createCall(ts.createIdentifier('parseInt'), undefined, [ts.createIdentifier(value)])
        ]),
        ts.createToken(ts.SyntaxKind.QuestionToken),
        ts.createElementAccess(
            ts.createIdentifier(type.symbol.name),
            ts.createCall(
                // Object.keys(EnumName).find
                ts.createPropertyAccess(
                    // Object.keys(EnumName)
                    ts.createCall(
                        ts.createPropertyAccess(ts.createIdentifier('Object'), 'keys'),
                        [],
                        [ts.createIdentifier(type.symbol.name)]
                    ),
                    'find'
                ),
                [],
                [
                    ts.createArrowFunction(
                        [],
                        [],
                        [ts.createParameter(undefined, undefined, undefined, '$k')],
                        undefined,
                        ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                        ts.createBinary(
                            ts.createCall(
                                // $.toLowerCase()
                                ts.createPropertyAccess(ts.createIdentifier('$k'), 'toLowerCase'),
                                [],
                                []
                            ),
                            // ===
                            ts.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                            // value.toLowerCase()
                            ts.createCall(
                                // $.toLowerCase()
                                ts.createPropertyAccess(ts.createIdentifier(value), 'toLowerCase'),
                                [],
                                []
                            )
                        )
                    )
                ]
            )
        ),
        ts.createToken(ts.SyntaxKind.ColonToken),
        ts.createCall(ts.createIdentifier('parseInt'), undefined, [ts.createIdentifier(value)])
    );
}

function generateSetPropertyMethodBodyForClass(
    program: ts.Program,
    classDeclaration: ts.ClassDeclaration,
    propertiesToSerialize: JsonProperty[]
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
            return ts.createExpressionStatement(
                ts.createAssignment(ts.createPropertyAccess(ts.createThis(), fieldName), expr)
            );
        };

        if (isEnumType(type.type)) {
            // this.fieldName = enummapping
            // return true;
            caseStatements.push(assignField(createEnumMapping('value', type.type)));
            caseStatements.push(ts.createReturn(ts.createTrue()));
        } else if (isPrimitiveType(type.type)) {
            // this.fieldName = value
            // return true;
            caseStatements.push(assignField(ts.createIdentifier('value')));
            caseStatements.push(ts.createReturn(ts.createTrue()));
        } else if (isTypedArray(type.type)) {
            // nullable:
            // this.fieldName = value ? value.slice() : null
            // return true;

            // not nullable:
            // this.fieldName = value.slice()
            // return true;

            if (type.isNullable) {
                caseStatements.push(
                    assignField(
                        ts.createConditional(
                            ts.createIdentifier('value'),
                            ts.createToken(ts.SyntaxKind.QuestionToken),
                            ts.createCall(ts.createPropertyAccess(ts.createIdentifier('value'), 'slice'), [], []),
                            ts.createToken(ts.SyntaxKind.ColonToken),
                            ts.createNull()
                        )
                    )
                );
            } else {
                caseStatements.push(
                    assignField(ts.createCall(ts.createPropertyAccess(ts.createIdentifier('value'), 'slice'), [], []))
                );
            }

            caseStatements.push(ts.createReturn(ts.createTrue()));
        } else if (isMap(type.type)) {
            // this.fieldName = new Map();
            // for(let key in value) {
            //   if(value.hasOwnProperty(key) this.fieldName.set(<enummapping>, value[key]);
            // }
            // return true;

            const mapType = type.type as ts.TypeReference;
            if (!isEnumType(mapType.typeArguments[0]) || !isPrimitiveType(mapType.typeArguments[1])) {
                throw new Error('only Map<EnumType, Primitive> maps are supported extend if needed!');
            }

            caseStatements.push(assignField(ts.createNew(ts.createIdentifier('Map'), undefined, [])));
            caseStatements.push(
                ts.createForIn(
                    ts.createVariableDeclarationList(
                        [ts.createVariableDeclaration(ts.createIdentifier('$mk'), undefined, undefined)],
                        ts.NodeFlags.Let
                    ),
                    ts.createIdentifier('value'),
                    ts.createIf(
                        ts.createCall(
                            ts.createPropertyAccess(ts.createIdentifier('value'), 'hasOwnProperty'),
                            undefined,
                            [ts.createIdentifier('$mk')]
                        ),
                        ts.createExpressionStatement(
                            ts.createCall(
                                ts.createPropertyAccess(
                                    ts.createPropertyAccess(ts.createThis(), ts.createIdentifier(fieldName)),
                                    ts.createIdentifier('set')
                                ),
                                undefined,
                                [
                                    createEnumMapping('$mk', mapType.typeArguments![0]),
                                    ts.createElementAccess(ts.createIdentifier('value'), ts.createIdentifier('$mk'))
                                ]
                            )
                        )
                    )
                )
            );
            caseStatements.push(ts.createReturn(ts.createTrue()));
        } else if (isImmutable(type.type)) {
            // this.fieldName = TypeName.fromJson(value)!
            // return true;
            caseStatements.push(
                assignField(
                    wrapToNonNull(
                        type.isNullable,
                        ts.createCall(
                            // TypeName.fromJson
                            ts.createPropertyAccess(ts.createIdentifier(type.type.symbol.name), 'fromJson'),
                            [],
                            [ts.createIdentifier('value')]
                        )
                    )
                )
            );
            caseStatements.push(ts.createReturn(ts.createTrue()));
        } else {
            // for complex types it is a bit more tricky
            // if the property matches exactly, we use fromJson
            // if the property starts with the field name, we try to set a sub-property
            const jsonNameArray = ts.createArrayLiteral(jsonNames.map(n => ts.createStringLiteral(n)));

            statements.push(
                ts.createIf(
                    // if(["", "core"].indexOf(property) >= 0)
                    ts.createBinary(
                        ts.createCall(
                            ts.createPropertyAccess(jsonNameArray, 'indexOf'),
                            [],
                            [ts.createIdentifier('property')]
                        ),
                        ts.SyntaxKind.GreaterThanEqualsToken,
                        ts.createNumericLiteral('0')
                    ),
                    ts.createBlock([
                        // if(this.field) {
                        //    this.field.fillFromJson(value);
                        // } else {
                        //    this.field = TypeName.fromJson(value);
                        // }
                        // return true;
                        ts.createIf(
                            ts.createPropertyAccess(ts.createThis(), fieldName),
                            ts.createExpressionStatement(
                                ts.createCall(
                                    ts.createPropertyAccess(
                                        ts.createPropertyAccess(ts.createThis(), fieldName),
                                        'fillFromJson'
                                    ),
                                    [],
                                    [ts.createIdentifier('value')]
                                )
                            ),
                            assignField(
                                wrapToNonNull(
                                    type.isNullable,
                                    ts.createCall(
                                        // TypeName.fromJson
                                        ts.createPropertyAccess(ts.createIdentifier(type.type.symbol.name), 'fromJson'),
                                        [],
                                        [ts.createIdentifier('value')]
                                    )
                                )
                            )
                        ),
                        ts.createReturn(ts.createTrue())
                    ]),
                    ts.createBlock([
                        // for(const candidate of ["", "core"]) {
                        //   if(candidate.indexOf(property) === 0) {
                        //     if(!this.field) { this.field = new FieldType(); }
                        //     if(this.field.setProperty(property.substring(candidate.length), value)) return true;
                        //   }
                        // }
                        ts.createForOf(
                            undefined,
                            ts.createVariableDeclarationList([ts.createVariableDeclaration('$c')], ts.NodeFlags.Const),
                            jsonNameArray,
                            ts.createIf(
                                ts.createBinary(
                                    ts.createCall(
                                        ts.createPropertyAccess(ts.createIdentifier('property'), 'indexOf'),
                                        [],
                                        [ts.createIdentifier('$c')]
                                    ),
                                    ts.SyntaxKind.EqualsEqualsEqualsToken,
                                    ts.createNumericLiteral('0')
                                ),
                                ts.createBlock([
                                    ts.createIf(
                                        ts.createPrefix(
                                            ts.SyntaxKind.ExclamationToken,
                                            ts.createPropertyAccess(ts.createThis(), fieldName)
                                        ),
                                        assignField(ts.createNew(ts.createIdentifier(type.type.symbol.name), [], []))
                                    ),
                                    ts.createIf(
                                        ts.createCall(
                                            ts.createPropertyAccess(
                                                ts.createPropertyAccess(ts.createThis(), fieldName),
                                                'setProperty'
                                            ),
                                            [],
                                            [
                                                ts.createCall(
                                                    ts.createPropertyAccess(
                                                        ts.createIdentifier('property'),
                                                        'substring'
                                                    ),
                                                    [],
                                                    [ts.createPropertyAccess(ts.createIdentifier('$c'), 'length')]
                                                ),
                                                ts.createIdentifier('value')
                                            ]
                                        ),
                                        ts.createReturn(ts.createTrue())
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
                    ts.createCaseClause(
                        ts.createStringLiteral(caseValues[i]),
                        // last case gets the statements, others are fall through
                        i < caseValues.length - 1 ? [] : caseStatements
                    )
                );
            }
        }
    }

    const switchExpr = ts.createSwitch(ts.createIdentifier('property'), ts.createCaseBlock(cases));
    statements.unshift(switchExpr);
    statements.push(ts.createReturn(ts.createFalse()));

    return ts.createBlock(statements);
}

function rewriteClassForJsonSerialization(
    program: ts.Program,
    classDeclaration: ts.ClassDeclaration,
    sourceFile: ts.SourceFile
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
            if (!propertyDeclaration.modifiers.find(m => m.kind === ts.SyntaxKind.StaticKeyword)) {
                const jsonNames = [member.name.getText(sourceFile)];

                if (ts.getJSDocTags(member).find(t => t.tagName.text === 'json_on_parent')) {
                    jsonNames.push('');
                }

                propertiesToSerialize.push({
                    property: propertyDeclaration,
                    jsonNames: jsonNames
                });
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
        toJsonMethod = ts.createMethod(
            undefined,
            [ts.createModifier(ts.SyntaxKind.PublicKeyword), ts.createModifier(ts.SyntaxKind.StaticKeyword)],
            undefined,
            'toJson',
            undefined,
            undefined,
            [
                ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    'obj',
                    undefined,
                    ts.createTypeReferenceNode(classDeclaration.name, [])
                )
            ],
            ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
            undefined
        );
    }

    if (!fillToJsonMethod) {
        fillToJsonMethod = ts.createMethod(
            undefined,
            [ts.createModifier(ts.SyntaxKind.PublicKeyword)],
            undefined,
            'fillToJson',
            undefined,
            undefined,
            [
                ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    'json',
                    undefined,
                    ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                )
            ],
            ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
            ts.createBlock([ts.createThrow(ts.createStringLiteral('todo'))])
        );
    }

    if (!fromJsonMethod) {
        fromJsonMethod = ts.createMethod(
            undefined,
            [ts.createModifier(ts.SyntaxKind.PublicKeyword), ts.createModifier(ts.SyntaxKind.StaticKeyword)],
            undefined,
            'fromJson',
            undefined,
            undefined,
            [
                ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    'json',
                    undefined,
                    ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                )
            ],
            ts.createTypeReferenceNode(classDeclaration.name, []),
            ts.createBlock([ts.createThrow(ts.createStringLiteral('todo'))])
        );
    }

    if (!fillFromJsonMethod) {
        fillFromJsonMethod = ts.createMethod(
            undefined,
            [ts.createModifier(ts.SyntaxKind.PublicKeyword)],
            undefined,
            'fillFromJson',
            undefined,
            undefined,
            [
                ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    'json',
                    undefined,
                    ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                )
            ],
            ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
            ts.createBlock([ts.createThrow(ts.createStringLiteral('todo'))])
        );
    }

    if (!setPropertyMethod) {
        setPropertyMethod = ts.createMethod(
            undefined,
            [ts.createModifier(ts.SyntaxKind.PublicKeyword)],
            undefined,
            'setProperty',
            undefined,
            undefined,
            [
                ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    'property',
                    undefined,
                    ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                ),
                ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    'value',
                    undefined,
                    ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                )
            ],
            ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
            ts.createBlock([ts.createThrow(ts.createStringLiteral('todo'))])
        );
    }

    function updateMethodBody(
        method: ts.MethodDeclaration,
        paramNames: string[],
        body: ts.Block
    ): ts.MethodDeclaration {
        if (!method) {
            return;
        }
        const parameters = method.parameters.map((v, i) =>
            ts.createParameter(
                method.parameters[i].decorators,
                method.parameters[i].modifiers,
                method.parameters[i].dotDotDotToken,
                i < paramNames.length ? paramNames[i] : method.parameters[0].name,
                method.parameters[i].questionToken,
                method.parameters[i].type,
                method.parameters[i].initializer
            )
        );

        return ts.updateMethod(
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
        generateToJsonBodyForClass(classDeclaration, propertiesToSerialize)
    );

    fillToJsonMethod = updateMethodBody(
        fillToJsonMethod,
        ['json'],
        generateFillToJsonBodyForClass(program, classDeclaration, propertiesToSerialize)
    );

    fromJsonMethod = updateMethodBody(
        fromJsonMethod,
        ['json'],
        generateFromJsonBodyForClass(classDeclaration, propertiesToSerialize)
    );

    fillFromJsonMethod = updateMethodBody(
        fillFromJsonMethod,
        ['json'],
        generateFillFromJsonBodyForClass(classDeclaration, propertiesToSerialize)
    );

    setPropertyMethod = updateMethodBody(
        setPropertyMethod,
        ['property', 'value'],
        generateSetPropertyMethodBodyForClass(program, classDeclaration, propertiesToSerialize)
    );

    newMembers.push(toJsonMethod);
    newMembers.push(fillToJsonMethod);
    newMembers.push(fromJsonMethod);
    newMembers.push(fillFromJsonMethod);
    newMembers.push(setPropertyMethod);

    console.debug(`Rewriting ${classDeclaration.name.escapedText} done`);

    return ts.updateClassDeclaration(
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
                        return rewriteClassForJsonSerialization(program, node, sourceFile);
                    }
                }

                return node;
            }

            return ts.visitEachChild(sourceFile, visitor, ctx);
        };
    };
}
