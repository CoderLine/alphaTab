import * as ts from 'typescript';
import {
    addNewLines,
    createNodeFromSource,
    getTypeWithNullableInfo,
    hasFlag,
    isEnumType,
    isMap,
    isTypedArray,
    setMethodBody,
    unwrapArrayItemType
} from '../BuilderHelpers';
import { findModule, findSerializerModule, isImmutable, JsonProperty } from './Serializer.common';

export function createToBinaryMethod(
    program: ts.Program,
    input: ts.ClassDeclaration,
    propertiesToSerialize: JsonProperty[],
    importer: (name: string, module: string) => void
) {
    importer('IWriteable', '@src/io/IWriteable');
    importer('IOHelper', '@src/io/IOHelper');
    const methodDecl = createNodeFromSource<ts.MethodDeclaration>(
        `public class Serializer {
            public static toBinary(obj: ${input.name!.text} | null, w: IWriteable): void {
            }
        }`,
        ts.SyntaxKind.MethodDeclaration
    );
    return setMethodBody(methodDecl, generateToBinaryBody(program, propertiesToSerialize, importer));
}

function generateToBinaryBody(
    program: ts.Program,
    propertiesToSerialize: JsonProperty[],
    importer: (name: string, module: string) => void
): ts.Block {
    const statements: ts.Statement[] = [];

    statements.push(
        createNodeFromSource<ts.IfStatement>(
            `if(!obj) {
                IOHelper.writeNull(w);
                return;
            }`,
            ts.SyntaxKind.IfStatement
        ),
        createNodeFromSource<ts.ExpressionStatement>(`IOHelper.writeNotNull(w);`, ts.SyntaxKind.ExpressionStatement)
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
            if (type.isNullable) {
                propertyStatements.push(createNodeFromSource<ts.IfStatement>(
                    `if ( obj.${fieldName} !== null ) {
                        IOHelper.writeNotNull(w);
                        IOHelper.${primitiveWrite}(w, obj.${fieldName}!);
                    } else {
                        IOHelper.writeNull(w);
                    }`,
                    ts.SyntaxKind.IfStatement
                ));
            } else {
                propertyStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `IOHelper.${primitiveWrite}(w, obj.${fieldName});`,
                        ts.SyntaxKind.ExpressionStatement
                    )
                );
            }
        } else if (isEnumType(type.type!)) {
            if (type.isNullable) {
                propertyStatements.push(
                    createNodeFromSource<ts.IfStatement>(
                        `if( obj.${fieldName} !== null ) {
                            IOHelper.writeNotNull(w);
                            IOHelper.writeInt32LE(w, obj.${fieldName}! as number);
                        } else {
                            IOHelper.writeNull(w);
                        }`,
                        ts.SyntaxKind.IfStatement
                    )
                );
            } else {
                propertyStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `IOHelper.writeInt32LE(w, obj.${fieldName} as number);`,
                        ts.SyntaxKind.ExpressionStatement
                    )
                );
            }
        } else if (isArray) {
            const arrayItemType = unwrapArrayItemType(type.type!, typeChecker)!;
            let itemSerializer = arrayItemType.symbol.name + 'Serializer';
            importer(itemSerializer, findSerializerModule(arrayItemType, program.getCompilerOptions()));

            if (type.isNullable) {
                propertyStatements.push(
                    createNodeFromSource<ts.IfStatement>(
                        `if(obj.${fieldName} !== null) {
                            IOHelper.writeNotNull(w);
                            IOHelper.writeInt32LE(w, obj.${fieldName}!.length);
                            for(const i of obj.${fieldName}!) {
                                ${itemSerializer}.toBinary(i, w)
                            }
                        } else {
                            IOHelper.writeNull(w);
                        }`,
                        ts.SyntaxKind.IfStatement
                    )
                );
            } else {
                propertyStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `IOHelper.writeInt32LE(w, obj.${fieldName}.length);`,
                        ts.SyntaxKind.ExpressionStatement
                    )
                );

                propertyStatements.push(
                    createNodeFromSource<ts.ForOfStatement>(
                        `for(const i of obj.${fieldName}) {
                            ${itemSerializer}.toBinary(i, w)
                        }`,
                        ts.SyntaxKind.ForOfStatement
                    )
                );
            }
        } else if (isMap(type.type)) {
            const mapType = type.type as ts.TypeReference;

            let writeKey: ts.Expression;
            const primitiveKeyWrite = getPrimitiveWriteMethod(mapType.typeArguments![0], typeChecker);
            if (primitiveKeyWrite) {
                writeKey = createNodeFromSource<ts.CallExpression>(
                    `IOHelper.${primitiveKeyWrite}(w, k)`,
                    ts.SyntaxKind.CallExpression
                );
            } else if (isEnumType(mapType.typeArguments![0])) {
                writeKey = createNodeFromSource<ts.CallExpression>(
                    `IOHelper.writeInt32LE(w, k as number)`,
                    ts.SyntaxKind.CallExpression
                );
            } else {
                throw new Error(
                    'only Map<Primitive, *> maps are supported extend if needed: ' +
                    mapType.typeArguments![0].symbol.name
                );
            }


            let writeValue: ts.Expression;
            const primitiveValueWrite = getPrimitiveWriteMethod(mapType.typeArguments![1], typeChecker);
            if (primitiveValueWrite) {
                writeValue = createNodeFromSource<ts.CallExpression>(
                    `IOHelper.${primitiveValueWrite}(w, v)`,
                    ts.SyntaxKind.CallExpression
                );
            } else if (isEnumType(mapType.typeArguments![1])) {
                writeValue = createNodeFromSource<ts.CallExpression>(
                    `IOHelper.writeInt32LE(w, v as number)`,
                    ts.SyntaxKind.CallExpression
                );
            } else {
                const itemSerializer = mapType.typeArguments![1].symbol.name + 'Serializer';
                importer(itemSerializer, findSerializerModule(mapType.typeArguments![1], program.getCompilerOptions()));

                writeValue = createNodeFromSource<ts.CallExpression>(
                    `${itemSerializer}.toBinary(v, w)`,
                    ts.SyntaxKind.CallExpression
                );
            }

            const writeLength = createNodeFromSource<ts.ExpressionStatement>(
                `IOHelper.writeInt32LE(w, obj.${fieldName}.size)`,
                ts.SyntaxKind.ExpressionStatement
            );
            const writeItems = ts.factory.createForOfStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createArrayBindingPattern([
                                ts.factory.createBindingElement(undefined, undefined, 'k', undefined),
                                ts.factory.createBindingElement(undefined, undefined, 'v', undefined)
                            ])
                        )
                    ],
                    ts.NodeFlags.Const
                ),
                ts.factory.createNonNullExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName)
                ),
                ts.factory.createBlock([
                    ts.factory.createExpressionStatement(writeKey),

                    ts.factory.createExpressionStatement(writeValue)
                ])
            );

            if (type.isNullable) {
                const conditional = createNodeFromSource<ts.IfStatement>(
                    `if(obj.${fieldName} !== null) {
                        
                    } else {
                        IOHelper.writeNull(w);
                    }`,
                    ts.SyntaxKind.IfStatement
                );
                propertyStatements.push(
                    ts.factory.updateIfStatement(conditional, conditional.expression, ts.factory.createBlock([
                        createNodeFromSource<ts.ExpressionStatement>(
                            `IOHelper.writeNotNull(w);`,
                            ts.SyntaxKind.ExpressionStatement
                        ),
                        writeLength,
                        writeItems
                    ]), conditional.thenStatement)
                );
            } else {
                propertyStatements.push(writeLength);
                propertyStatements.push(writeItems);
            }

        } else if (isImmutable(type.type)) {
            let itemSerializer = type.type.symbol.name;
            importer(itemSerializer, findModule(type.type, program.getCompilerOptions()));
            propertyStatements.push(
                createNodeFromSource<ts.ExpressionStatement>(
                    `${itemSerializer}.toBinary(obj.${fieldName}, w);`,
                    ts.SyntaxKind.ExpressionStatement
                )
            );
        } else {
            let itemSerializer = type.type.symbol.name + 'Serializer';
            importer(itemSerializer, findSerializerModule(type.type, program.getCompilerOptions()));
            propertyStatements.push(
                createNodeFromSource<ts.ExpressionStatement>(
                    `${itemSerializer}.toBinary(obj.${fieldName}, w);`,
                    ts.SyntaxKind.ExpressionStatement
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
