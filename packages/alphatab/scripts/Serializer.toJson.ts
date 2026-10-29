import { createNodeFromSource, setMethodBody } from '@coderline/alphatab-transpiler/src/BuilderHelpers';
import * as ts from 'typescript';
import { findSerializerModule } from './Serializer.common';
import type { TypeSchema } from './TypeSchema';

/**
 * The shape a generated `toJson`-style method writes its records in. Records of `@json` types become
 * `Map`s (`toJson`, all targets) or object literals (`toJsObject`, web only). Map-typed properties stay
 * `Map`s in both, so their key order survives a structured clone, and `@json_immutable` types use their own
 * `toJson` in both, because their `fromJson` (e.g. `Font.fromJson`) reads Maps only.
 */
interface ToJsonFlavor {
    readonly method: string;
    readonly objects: boolean;
}

const mapFlavor: ToJsonFlavor = { method: 'toJson', objects: false };
const objectFlavor: ToJsonFlavor = { method: 'toJsObject', objects: true };

function generateToJsonBody(
    serializable: TypeSchema,
    importer: (name: string, module: string) => void,
    flavor: ToJsonFlavor
) {
    const statements: ts.Statement[] = [];
    const set = (jsonName: string, value: string) =>
        flavor.objects ? `o[${JSON.stringify(jsonName)}] = ${value}` : `o.set(${JSON.stringify(jsonName)}, ${value})`;
    // object flavor: the leading unconditional properties form the object literal, the rest is assigned in order
    const literal: string[] = [];
    let inLiteral = flavor.objects;

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

    if (!flavor.objects) {
        statements.push(
            createNodeFromSource<ts.VariableStatement>(
                `
            const o = new Map<string, unknown>();
        `,
                ts.SyntaxKind.VariableStatement
            )
        );
    }
    const objectDeclarationIndex = statements.length;

    for (const prop of serializable.properties) {
        const fieldName = prop.name;
        const jsonName = prop.jsonNames.filter(n => n !== '')[0];

        if (!jsonName || prop.isJsonReadOnly) {
            continue;
        }
        if (flavor.objects && prop.target && prop.target !== 'web') {
            continue;
        }

        let propertyStatements: ts.Statement[] = [];
        let simpleValue: string | null = null;

        if (prop.asRaw || prop.type.isPrimitiveType) {
            simpleValue = `obj.${fieldName}`;
        } else if (prop.type.isEnumType) {
            if (prop.type.isNullable) {
                simpleValue = `obj.${fieldName} as number|null`;
            } else if (prop.type.isOptional) {
                simpleValue = `obj.${fieldName} as number|undefined`;
            } else {
                simpleValue = `obj.${fieldName} as number`;
            }
        } else if (prop.type.isArray) {
            const arrayItemType = prop.type.arrayItemType!;
            if (arrayItemType.isOwnType && !arrayItemType.isEnumType) {
                const itemSerializer = `${arrayItemType.typeAsString}Serializer`;
                importer(itemSerializer, findSerializerModule(arrayItemType));
                if (prop.type.isNullable) {
                    propertyStatements.push(
                        createNodeFromSource<ts.IfStatement>(
                            `if(obj.${fieldName} !== null) {
                            ${set(jsonName, `obj.${fieldName}?.map(i => ${itemSerializer}.${flavor.method}(i))`)};
                        }`,
                            ts.SyntaxKind.IfStatement
                        )
                    );
                } else if (prop.type.isOptional) {
                    propertyStatements.push(
                        createNodeFromSource<ts.IfStatement>(
                            `if(obj.${fieldName} !== undefined) {
                            ${set(jsonName, `obj.${fieldName}?.map(i => ${itemSerializer}.${flavor.method}(i))`)};
                        }`,
                            ts.SyntaxKind.IfStatement
                        )
                    );
                } else {
                    simpleValue = `obj.${fieldName}.map(i => ${itemSerializer}.${flavor.method}(i))`;
                }
            } else {
                simpleValue = `obj.${fieldName}`;
            }
        } else if (prop.type.isMap) {
            let serializeBlock: ts.Block;
            if (prop.type.typeArguments![1].isPrimitiveType) {
                serializeBlock = createNodeFromSource<ts.Block>(
                    `{
                    const m = new Map<string, unknown>();
                    ${set(jsonName, `m`)};
                    for(const [k, v] of obj.${fieldName}!) {
                        m.set(k.toString(), v);
                    }
                }`,
                    ts.SyntaxKind.Block
                );
            } else if (prop.type.typeArguments![1].isEnumType) {
                serializeBlock = createNodeFromSource<ts.Block>(
                    `{
                    const m = new Map<string, unknown>();
                    ${set(jsonName, `m`)};
                    for(const [k, v] of obj.${fieldName}!) {
                        m.set(k.toString(), v as number);
                    }
                }`,
                    ts.SyntaxKind.Block
                );
            } else if (prop.type.typeArguments![1].isJsonImmutable) {
                const notNull = !prop.type.typeArguments![1].isNullable ? '!' : '';
                serializeBlock = createNodeFromSource<ts.Block>(
                    `{
                    const m = new Map<string, unknown>();
                    ${set(jsonName, `m`)};
                    for(const [k, v] of obj.${fieldName}!) {
                        m.set(k.toString(), ${prop.type.typeArguments![1].typeAsString}.toJson(v)${notNull});
                    }
                }`,
                    ts.SyntaxKind.Block
                );
            } else if(prop.type.typeArguments![1].isArray && prop.type.typeArguments![1].arrayItemType!.isPrimitiveType) {
                serializeBlock = createNodeFromSource<ts.Block>(
                    `{
                        const m = new Map<string, unknown>();
                        ${set(jsonName, `m`)};
                        for(const [k, v] of obj.${fieldName}!) {
                            m.set(k.toString(), v);
                        }
                    }`,
                    ts.SyntaxKind.Block
                );
            } else {
                const itemSerializer = `${prop.type.typeArguments![1].typeAsString}Serializer`;
                importer(itemSerializer, findSerializerModule(prop.type.typeArguments![1]));

                serializeBlock = createNodeFromSource<ts.Block>(
                    `{
                    const m = new Map<string, unknown>();
                    ${set(jsonName, `m`)};
                    for(const [k, v] of obj.${fieldName}!) {
                        m.set(k.toString(), ${itemSerializer}.${flavor.method}(v));
                    }
                }`,
                    ts.SyntaxKind.Block
                );
            }

            if (prop.type.isNullable || prop.type.isOptional) {
                const nullOrUndefined = prop.type.isNullable
                    ? ts.factory.createNull()
                    : ts.factory.createIdentifier('undefined');
                propertyStatements.push(
                    ts.factory.createIfStatement(
                        ts.factory.createBinaryExpression(
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                            ts.SyntaxKind.ExclamationEqualsEqualsToken,
                            nullOrUndefined
                        ),
                        serializeBlock
                    )
                );
            } else {
                propertyStatements.push(serializeBlock);
            }
        } else if (prop.type.isSet) {
            let serializeBlock: ts.Block;
            if (prop.type.typeArguments![0].isPrimitiveType) {
                serializeBlock = createNodeFromSource<ts.Block>(
                    `{
                        const a:${prop.type.typeArguments![0].typeAsString}[] = [];
                        ${set(jsonName, `a`)};
                        for(const v of obj.${fieldName}!) {
                            a.push(v);
                        }
                    }`,
                    ts.SyntaxKind.Block
                );
            } else if (prop.type.typeArguments![0].isEnumType) {
                serializeBlock = createNodeFromSource<ts.Block>(
                    `{
                        const a:number[] = [];
                        ${set(jsonName, `a`)};
                        for(const v of obj.${fieldName}!) {
                            a.push(v as number);
                        }
                    }`,
                    ts.SyntaxKind.Block
                );
            } else {
                throw new Error(
                    `only Set<Primitive> and Set<Enum> sets are supported, extend if needed! Found ${prop.type.typeAsString}`
                );
            }

            if (prop.type.isNullable || prop.type.isOptional) {
                const nullOrUndefined = prop.type.isNullable
                    ? ts.factory.createNull()
                    : ts.factory.createIdentifier('undefined');
                propertyStatements.push(
                    ts.factory.createIfStatement(
                        ts.factory.createBinaryExpression(
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('obj'), fieldName),
                            ts.SyntaxKind.ExclamationEqualsEqualsToken,
                            nullOrUndefined
                        ),
                        serializeBlock
                    )
                );
            } else {
                propertyStatements.push(serializeBlock);
            }
        } else if (prop.type.isJsonImmutable) {
            importer(prop.type.typeAsString, prop.type.modulePath);
            const notNull = prop.type.isNullable || prop.type.isOptional ? '' : '!';
            simpleValue = `${prop.type.typeAsString}.toJson(obj.${fieldName})${notNull}`;
        } else if (serializable.isStrict) {
            const itemSerializer = `${prop.type.typeAsString}Serializer`;
            importer(itemSerializer, findSerializerModule(prop.type));

            if (prop.type.isNullable || prop.type.isOptional) {
                propertyStatements.push(
                    createNodeFromSource<ts.IfStatement>(
                        `
                        if(obj.${fieldName}) {
                            ${set(jsonName, `${itemSerializer}.${flavor.method}(obj.${fieldName})`)};
                        }
                    `,
                        ts.SyntaxKind.IfStatement
                    )
                );
            } else {
                simpleValue = `${itemSerializer}.${flavor.method}(obj.${fieldName})`;
            }
        } else {
            const itemSerializer = `${prop.type.typeAsString}Serializer`;
            importer(itemSerializer, findSerializerModule(prop.type));
            if (prop.type.isRecord && (prop.type.isNullable || prop.type.isOptional)) {
                // @record-typed optional / nullable fields skip emission when unset, so the JSON
                // output omits null entries rather than carrying a Map value the C# JS-style
                // TypeOf shim would render as `undefined` (TypeHelper.cs:606+).
                propertyStatements.push(
                    createNodeFromSource<ts.IfStatement>(
                        `
                        if(obj.${fieldName}) {
                            ${set(jsonName, `${itemSerializer}.${flavor.method}(obj.${fieldName})`)};
                        }
                    `,
                        ts.SyntaxKind.IfStatement
                    )
                );
            } else {
                simpleValue = `${itemSerializer}.${flavor.method}(obj.${fieldName})`;
            }
        }

        if (simpleValue !== null) {
            if (inLiteral) {
                literal.push(`${JSON.stringify(jsonName)}: ${simpleValue}`);
            } else {
                propertyStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `${set(jsonName, simpleValue)};`,
                        ts.SyntaxKind.ExpressionStatement
                    )
                );
            }
        } else {
            inLiteral = false;
        }

        if (prop.target && !flavor.objects) {
            propertyStatements = propertyStatements.map(s =>
                ts.addSyntheticLeadingComment(s, ts.SyntaxKind.MultiLineCommentTrivia, `@target ${prop.target}`, true)
            );
        }

        statements.push(...propertyStatements);
    }

    if (serializable.hasToJsonExtension) {
        statements.push(
            createNodeFromSource<ts.ExpressionStatement>(
                `obj.${flavor.method}(o);`,
                ts.SyntaxKind.ExpressionStatement
            )
        );
    }

    if (flavor.objects) {
        statements.splice(
            objectDeclarationIndex,
            0,
            createNodeFromSource<ts.VariableStatement>(
                `const o: Record<string, unknown> = {${literal.join(', ')}};`,
                ts.SyntaxKind.VariableStatement
            )
        );
    }

    statements.push(ts.factory.createReturnStatement(ts.factory.createIdentifier('o')));

    return ts.factory.createBlock(statements, true);
}

export function createToJsonMethod(
    input: ts.ClassDeclaration | ts.InterfaceDeclaration,
    serializable: TypeSchema,
    importer: (name: string, module: string) => void
) {
    const methodDecl = createNodeFromSource<ts.MethodDeclaration>(
        `public class Serializer {
            public static toJson(obj: ${input.name!.text} | null | undefined): Map<string, unknown> | null {
            }
        }`,
        ts.SyntaxKind.MethodDeclaration
    );
    return setMethodBody(methodDecl, generateToJsonBody(serializable, importer, mapFlavor));
}

export function createToJsObjectMethod(
    input: ts.ClassDeclaration | ts.InterfaceDeclaration,
    serializable: TypeSchema,
    importer: (name: string, module: string) => void
) {
    const methodDecl = createNodeFromSource<ts.MethodDeclaration>(
        `public class Serializer {
            public static toJsObject(obj: ${input.name!.text} | null | undefined): Record<string, unknown> | null {
            }
        }`,
        ts.SyntaxKind.MethodDeclaration
    );
    return ts.addSyntheticLeadingComment(
        setMethodBody(methodDecl, generateToJsonBody(serializable, importer, objectFlavor)),
        ts.SyntaxKind.MultiLineCommentTrivia,
        '*\n * @target web\n ',
        true
    );
}
