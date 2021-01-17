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

function createStringUnknownMapNode(): ts.TypeNode {
    return ts.factory.createTypeReferenceNode('Map',
        [
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        ]);
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
    importPath[importPath.length - 1] = type.symbol!.name + 'Serializer';
    return importPath.join('/');
}

//
// fromJson
function generateFromJsonBody(importer: (name: string, module: string) => void) {
    importer('JsonHelper', '@src/io/JsonHelper');
    return ts.factory.createBlock(addNewLines([
        ts.factory.createIfStatement(
            ts.factory.createPrefixUnaryExpression(
                ts.SyntaxKind.ExclamationToken,
                ts.factory.createIdentifier('m'),
            ),
            ts.factory.createBlock([
                ts.factory.createReturnStatement()
            ])
        ),
        ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier('JsonHelper'),
                    'forEach'
                ),
                undefined,
                [
                    ts.factory.createIdentifier('m'),
                    ts.factory.createArrowFunction(
                        undefined,
                        undefined,
                        [
                            ts.factory.createParameterDeclaration(undefined, undefined, undefined, 'v'),
                            ts.factory.createParameterDeclaration(undefined, undefined, undefined, 'k')
                        ],
                        undefined,
                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'setProperty'),
                            undefined,
                            [
                                ts.factory.createIdentifier('obj'),
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier('k'),
                                        'toLowerCase'
                                    ),
                                    undefined,
                                    []
                                ),
                                ts.factory.createIdentifier('v'),
                            ]
                        )

                    )
                ]
            )
        ),
    ]));
}

function createFromJsonMethod(input: ts.ClassDeclaration,
    importer: (name: string, module: string) => void) {
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
                'm',
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
            )
        ],
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
        generateFromJsonBody(importer)
    )
}
//
// toJson
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
        return "val";
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
    importer: (name: string, module: string) => void) {

    const statements: ts.Statement[] = [];

    statements.push(ts.factory.createIfStatement(
        ts.factory.createPrefixUnaryExpression(
            ts.SyntaxKind.ExclamationToken,
            ts.factory.createIdentifier('obj')
        ),
        ts.factory.createBlock([
            ts.factory.createReturnStatement(ts.factory.createNull())
        ])
    ))

    statements.push(ts.factory.createVariableStatement(
        undefined,
        ts.factory.createVariableDeclarationList(
            [
                ts.factory.createVariableDeclaration('o',
                    undefined,
                    undefined,
                    ts.factory.createNewExpression(ts.factory.createIdentifier('Map'),
                        [
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
                        ],
                        []
                    ))
            ],
            ts.NodeFlags.Const
        )
    ));

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
            propertyStatements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('o'), 'set'),
                undefined,
                [
                    ts.factory.createStringLiteral(jsonName),
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                ]
            )));
        } else if (isEnumType(type.type!)) {
            propertyStatements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('o'), 'set'),
                undefined,
                [
                    ts.factory.createStringLiteral(jsonName),
                    ts.factory.createAsExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                        type.isNullable
                            ? ts.factory.createUnionTypeNode([
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                                ts.factory.createLiteralTypeNode(ts.factory.createNull())
                            ])
                            : ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
                    )
                ]
            )));
        } else if (isArray) {
            const arrayItemType = unwrapArrayItemType(type.type!, typeChecker)!;
            let itemSerializer = arrayItemType.symbol.name + "Serializer";
            importer(itemSerializer, findSerializerModule(arrayItemType, program.getCompilerOptions()));

            propertyStatements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('o'), 'set'),
                undefined,
                [
                    ts.factory.createStringLiteral(jsonName),
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
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
                                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'toJson'),
                                    undefined,
                                    [
                                        ts.factory.createIdentifier('i'),
                                    ]
                                )
                            )
                        ]
                    )
                ]
            )));
        }
        else if (isMap(type.type)) {
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
            }
            else {
                const itemSerializer = mapType.typeArguments![1].symbol.name + "Serializer";
                importer(itemSerializer, findSerializerModule(mapType.typeArguments![1], program.getCompilerOptions()));

                writeValue = ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'toJson'),
                    undefined,
                    [
                        ts.factory.createIdentifier('v'),
                    ]
                );
            }

            propertyStatements.push(ts.factory.createBlock([
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList([
                        ts.factory.createVariableDeclaration('m',
                            undefined,
                            undefined,
                            ts.factory.createNewExpression(ts.factory.createIdentifier('Map'),
                                [
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                                ],
                                []))
                    ], ts.NodeFlags.Const)
                ),
                ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('o'), 'set'),
                    undefined,
                    [
                        ts.factory.createStringLiteral(jsonName),
                        ts.factory.createIdentifier('m')
                    ]
                )),

                ts.factory.createForOfStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList([
                        ts.factory.createVariableDeclaration(
                            ts.factory.createArrayBindingPattern([
                                ts.factory.createBindingElement(
                                    undefined,
                                    undefined,
                                    'k'
                                ),
                                ts.factory.createBindingElement(
                                    undefined,
                                    undefined,
                                    'v'
                                ),
                            ])
                        )],
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
            ]));
        } else if (isImmutable(type.type)) {
            let itemSerializer = type.type.symbol.name;
            importer(itemSerializer, findModule(type.type, program.getCompilerOptions()));
            propertyStatements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('o'), 'set'),
                undefined,
                [
                    ts.factory.createStringLiteral(jsonName),
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'toJson'),
                        [],
                        [
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                        ]
                    ),
                ]
            )));
        } else {
            let itemSerializer = type.type.symbol.name + "Serializer";
            importer(itemSerializer, findSerializerModule(type.type, program.getCompilerOptions()));
            propertyStatements.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('o'), 'set'),
                undefined,
                [
                    ts.factory.createStringLiteral(jsonName),
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'toJson'),
                        [],
                        [
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                        ]
                    ),
                ]
            )));
        }

        if (prop.target) {
            propertyStatements = propertyStatements.map(s => ts.addSyntheticLeadingComment(s, ts.SyntaxKind.MultiLineCommentTrivia, `@target ${prop.target}`, true));
        }

        statements.push(...propertyStatements);
    }

    statements.push(ts.factory.createReturnStatement(ts.factory.createIdentifier('o')));

    return ts.factory.createBlock(addNewLines(statements))
}

function createToJsonMethod(program: ts.Program,
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
                    ts.factory.createTypeReferenceNode(
                        input.name!.text,
                        undefined
                    ),
                    ts.factory.createLiteralTypeNode(ts.factory.createNull())
                ])
            )
        ],
        ts.factory.createUnionTypeNode([
            createStringUnknownMapNode(),
            ts.factory.createLiteralTypeNode(ts.factory.createNull())
        ]),
        generateToJsonBody(program, propertiesToSerialize, importer)
    )
}

//
// setProperty

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
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('JsonHelper'),
            'parseEnum'
        ),
        [ts.factory.createTypeReferenceNode(type.symbol.name)],
        [
            ts.factory.createIdentifier('v'),
            ts.factory.createIdentifier(type.symbol.name)
        ]
    );
}

function stripRanges<T extends ts.Node>(node: T) {
    (node as any).pos = -1;
    (node as any).end = -1;
    return node;
}

function getDeepMutableClone<T extends ts.Node>(node: T): T {
    return ts.transform(node, [
        context => node => deepCloneWithContext(node, context)
    ]).transformed[0];

    function deepCloneWithContext<T extends ts.Node>(
        node: T,
        context: ts.TransformationContext
    ): T {
        const clonedNode = ts.visitEachChild(
            stripRanges(ts.getMutableClone(node)),
            child => deepCloneWithContext(child, context),
            context
        );
        (clonedNode as any).parent = undefined as any;
        ts.forEachChild(clonedNode, child => { (child as any).parent = clonedNode; });
        return clonedNode;
    }
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

        if (isPrimitiveFromJson(type.type!, typeChecker)) {
            caseStatements.push(assignField(ts.factory.createAsExpression(
                ts.factory.createIdentifier('v'),
                getDeepMutableClone(prop.property.type!)
            )));
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
                ts.factory.createForOfStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList([ts.factory.createVariableDeclaration('o')], ts.NodeFlags.Const),
                    ts.factory.createAsExpression(
                        ts.factory.createIdentifier('v'),
                        ts.factory.createArrayTypeNode(
                            ts.factory.createUnionTypeNode([
                                createStringUnknownMapNode(),
                                ts.factory.createLiteralTypeNode(ts.factory.createNull())
                            ])
                        )
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
                                ts.factory.createIdentifier('o')
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
            ];

            if (type.isNullable) {
                caseStatements.push(ts.factory.createIfStatement(
                    ts.factory.createIdentifier('v'),
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
                importer('JsonHelper', '@src/io/JsonHelper');
                mapKey = ts.factory.createNonNullExpression(ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('JsonHelper'), 'parseEnum'),
                    [ts.factory.createTypeReferenceNode(mapType.typeArguments![0].symbol!.name)],
                    [
                        ts.factory.createIdentifier('k'),
                        ts.factory.createIdentifier(mapType.typeArguments![0].symbol!.name),
                    ]
                ));
            } else if (isNumberType(mapType.typeArguments![0])) {
                mapKey = ts.factory.createCallExpression(
                    ts.factory.createIdentifier('parseInt'),
                    undefined,
                    [
                        ts.factory.createIdentifier('k')
                    ]
                );
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
                        ? getDeepMutableClone(prop.property.type.typeArguments[1])
                        : ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                );
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

            caseStatements.push(
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier('JsonHelper'),
                            'forEach'
                        ),
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
                                ts.factory.createBlock(addNewLines([
                                    itemSerializer.length > 0 && ts.factory.createVariableStatement(
                                        undefined,
                                        ts.factory.createVariableDeclarationList([
                                            ts.factory.createVariableDeclaration('i',
                                                undefined, undefined,
                                                ts.factory.createNewExpression(ts.factory.createIdentifier(mapType.typeArguments![1].symbol.name), undefined, [])
                                            )
                                        ], ts.NodeFlags.Const),
                                    ),
                                    itemSerializer.length > 0 && ts.factory.createExpressionStatement(
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
                                                ),
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
                                ].filter(s => !!s) as ts.Statement[]))
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
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(itemSerializer), 'fromJson'),
                            [],
                            [
                                ts.factory.createIdentifier('v')
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
                                                    ts.factory.createAsExpression(
                                                        ts.factory.createIdentifier('v'),
                                                        createStringUnknownMapNode()
                                                    )
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
                                                        ts.factory.createIdentifier('v')
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

    if (cases.length > 0) {
        const switchExpr = ts.factory.createSwitchStatement(ts.factory.createIdentifier('property'), ts.factory.createCaseBlock(cases));
        statements.unshift(switchExpr);
    }

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
                'v',
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
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
                m.kind === ts.SyntaxKind.PrivateKeyword)) {
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