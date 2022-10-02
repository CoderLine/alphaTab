import * as ts from 'typescript';
import {
    addNewLines,
    createNodeFromSource,
    setMethodBody,
    isPrimitiveType,
    hasFlag,
    getTypeWithNullableInfo,
    isTypedArray,
    unwrapArrayItemType,
    isMap,
    isEnumType
} from '../BuilderHelpers';
import { findModule, findSerializerModule, isImmutable, JsonProperty, JsonSerializable } from './Serializer.common';

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

    return false;
}

function generateToJsonBody(
    program: ts.Program,
    serializable: JsonSerializable,
    importer: (name: string, module: string) => void
) {
    const statements: ts.Statement[] = [];

    statements.push(
        createNodeFromSource<ts.IfStatement>(
            `
            if(!obj) {
                return null;
            }
        `,
            ts.SyntaxKind.IfStatement
        )
    );

    statements.push(
        createNodeFromSource<ts.VariableStatement>(
            `
            const o = new Map<string, unknown>();
        `,
            ts.SyntaxKind.VariableStatement
        )
    );

    for (let prop of serializable.properties) {
        const fieldName = (prop.property.name as ts.Identifier).text;
        const jsonName = prop.jsonNames.filter(n => n !== '')[0];

        if (!jsonName || prop.isReadOnly) {
            continue;
        }
        const typeChecker = program.getTypeChecker();
        const type = getTypeWithNullableInfo(typeChecker, prop.property.type!, false);
        const isArray = isTypedArray(type.type!);

        let propertyStatements: ts.Statement[] = [];

        if (isPrimitiveToJson(type.type!, typeChecker)) {
            propertyStatements.push(
                createNodeFromSource<ts.ExpressionStatement>(
                    `
                    o.set(${JSON.stringify(jsonName)}, obj.${fieldName});
                `,
                    ts.SyntaxKind.ExpressionStatement
                )
            );
        } else if (isEnumType(type.type!)) {
            if (type.isNullable) {
                propertyStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `
                        o.set(${JSON.stringify(jsonName)}, obj.${fieldName} as number|null);
                    `,
                        ts.SyntaxKind.ExpressionStatement
                    )
                );
            } else {
                propertyStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `
                        o.set(${JSON.stringify(jsonName)}, obj.${fieldName} as number);
                    `,
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
                            o.set(${JSON.stringify(jsonName)}, obj.${fieldName}?.map(i => ${itemSerializer}.toJson(i)));
                        }`,
                        ts.SyntaxKind.IfStatement
                    )
                );
            } else {
                propertyStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `
                        o.set(${JSON.stringify(jsonName)}, obj.${fieldName}.map(i => ${itemSerializer}.toJson(i)));
                    `,
                        ts.SyntaxKind.ExpressionStatement
                    )
                );
            }

        } else if (isMap(type.type)) {
            const mapType = type.type as ts.TypeReference;
            if (!isPrimitiveType(mapType.typeArguments![0])) {
                throw new Error('only Map<Primitive, *> maps are supported extend if needed!');
            }

            let serializeBlock: ts.Block;
            if (isPrimitiveToJson(mapType.typeArguments![1], typeChecker)) {
                serializeBlock = createNodeFromSource<ts.Block>(
                    `{
                    const m = new Map<string, unknown>();
                    o.set(${JSON.stringify(jsonName)}, m);
                    for(const [k, v] of obj.${fieldName}!) {
                        m.set(k.toString(), v);
                    }
                }`, ts.SyntaxKind.Block);
            } else if (isEnumType(mapType.typeArguments![1])) {
                serializeBlock = createNodeFromSource<ts.Block>(
                    `{
                    const m = new Map<string, unknown>();
                    o.set(${JSON.stringify(jsonName)}, m);
                    for(const [k, v] of obj.${fieldName}!) {
                        m.set(k.toString(), v as number);
                    }
                }`, ts.SyntaxKind.Block);
            } else {
                const itemSerializer = mapType.typeArguments![1].symbol.name + 'Serializer';
                importer(itemSerializer, findSerializerModule(mapType.typeArguments![1], program.getCompilerOptions()));

                serializeBlock = createNodeFromSource<ts.Block>(
                    `{
                    const m = new Map<string, unknown>();
                    o.set(${JSON.stringify(jsonName)}, m);
                    for(const [k, v] of obj.${fieldName}!) {
                        m.set(k.toString(), ${itemSerializer}.toJson(v));
                    }
                }`, ts.SyntaxKind.Block);
            }

            if (type.isNullable) {
                propertyStatements.push(ts.factory.createIfStatement(
                    ts.factory.createBinaryExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier('obj'),
                            fieldName
                        ),
                        ts.SyntaxKind.ExclamationEqualsEqualsToken,
                        ts.factory.createNull()
                    ),
                    serializeBlock)
                );
            } else {
                propertyStatements.push(serializeBlock);
            }
        } else if (isImmutable(type.type)) {
            let itemSerializer = type.type.symbol.name;
            importer(itemSerializer, findModule(type.type, program.getCompilerOptions()));
            propertyStatements.push(
                createNodeFromSource<ts.ExpressionStatement>(
                    `
                    o.set(${JSON.stringify(jsonName)}, ${itemSerializer}.toJson(obj.${fieldName}));
                `,
                    ts.SyntaxKind.ExpressionStatement
                )
            );
        } else {
            let itemSerializer = type.type.symbol.name + 'Serializer';
            importer(itemSerializer, findSerializerModule(type.type, program.getCompilerOptions()));
            propertyStatements.push(
                createNodeFromSource<ts.ExpressionStatement>(
                    `
                    o.set(${JSON.stringify(jsonName)}, ${itemSerializer}.toJson(obj.${fieldName}));
                `,
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

    if(serializable.hasToJsonExtension) {
        statements.push( createNodeFromSource<ts.ExpressionStatement>(
            `obj.toJson(o);`,
            ts.SyntaxKind.ExpressionStatement
        ));
    }
    
    statements.push(ts.factory.createReturnStatement(ts.factory.createIdentifier('o')));

    return ts.factory.createBlock(addNewLines(statements));
}

export function createToJsonMethod(
    program: ts.Program,
    input: ts.ClassDeclaration,
    serializable: JsonSerializable,
    importer: (name: string, module: string) => void
) {
    const methodDecl = createNodeFromSource<ts.MethodDeclaration>(
        `public class Serializer {
            public static toJson(obj: ${input.name!.text} | null): Map<string, unknown> | null {
            }
        }`,
        ts.SyntaxKind.MethodDeclaration
    );
    return setMethodBody(methodDecl, generateToJsonBody(program, serializable, importer));
}
