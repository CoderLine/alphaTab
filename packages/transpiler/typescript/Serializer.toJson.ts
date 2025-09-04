import * as ts from 'typescript';
import { createNodeFromSource, setMethodBody } from '../BuilderHelpers';
import { findSerializerModule } from './Serializer.common';
import type { TypeSchema } from './TypeSchema';

function generateToJsonBody(serializable: TypeSchema, importer: (name: string, module: string) => void) {
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

    for (const prop of serializable.properties) {
        const fieldName = prop.name;
        const jsonName = prop.jsonNames.filter(n => n !== '')[0];

        if (!jsonName || prop.isReadOnly) {
            continue;
        }

        let propertyStatements: ts.Statement[] = [];

        if (prop.asRaw || prop.type.isPrimitiveType) {
            propertyStatements.push(
                createNodeFromSource<ts.ExpressionStatement>(
                    `
                    o.set(${JSON.stringify(jsonName)}, obj.${fieldName});
                `,
                    ts.SyntaxKind.ExpressionStatement
                )
            );
        } else if (prop.type.isEnumType) {
            if (prop.type.isNullable) {
                propertyStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `
                        o.set(${JSON.stringify(jsonName)}, obj.${fieldName} as number|null);
                    `,
                        ts.SyntaxKind.ExpressionStatement
                    )
                );
            } else if (prop.type.isOptional) {
                propertyStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `
                        o.set(${JSON.stringify(jsonName)}, obj.${fieldName} as number|undefined);
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
        } else if (prop.type.isArray) {
            const arrayItemType = prop.type.arrayItemType!;
            if (arrayItemType.isOwnType && !arrayItemType.isEnumType) {
                const itemSerializer = `${arrayItemType.typeAsString}Serializer`;
                importer(itemSerializer, findSerializerModule(arrayItemType));
                if (prop.type.isNullable) {
                    propertyStatements.push(
                        createNodeFromSource<ts.IfStatement>(
                            `if(obj.${fieldName} !== null) {
                            o.set(${JSON.stringify(jsonName)}, obj.${fieldName}?.map(i => ${itemSerializer}.toJson(i)));
                        }`,
                            ts.SyntaxKind.IfStatement
                        )
                    );
                } else if (prop.type.isOptional) {
                    propertyStatements.push(
                        createNodeFromSource<ts.IfStatement>(
                            `if(obj.${fieldName} !== undefined) {
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
            } else {
                propertyStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `
                    o.set(${JSON.stringify(jsonName)}, obj.${fieldName});
                `,
                        ts.SyntaxKind.ExpressionStatement
                    )
                );
            }
        } else if (prop.type.isMap) {
            let serializeBlock: ts.Block;
            if (prop.type.typeArguments![1].isPrimitiveType) {
                serializeBlock = createNodeFromSource<ts.Block>(
                    `{
                    const m = new Map<string, unknown>();
                    o.set(${JSON.stringify(jsonName)}, m);
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
                    o.set(${JSON.stringify(jsonName)}, m);
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
                    o.set(${JSON.stringify(jsonName)}, m);
                    for(const [k, v] of obj.${fieldName}!) {
                        m.set(k.toString(), ${prop.type.typeArguments![1].typeAsString}.toJson(v)${notNull});
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
                    o.set(${JSON.stringify(jsonName)}, m);
                    for(const [k, v] of obj.${fieldName}!) {
                        m.set(k.toString(), ${itemSerializer}.toJson(v));
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
                        o.set(${JSON.stringify(jsonName)}, a);
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
                        o.set(${JSON.stringify(jsonName)}, a);
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
            propertyStatements.push(
                createNodeFromSource<ts.ExpressionStatement>(
                    `
                    o.set(${JSON.stringify(jsonName)}, ${prop.type.typeAsString}.toJson(obj.${fieldName})${notNull});
                `,
                    ts.SyntaxKind.ExpressionStatement
                )
            );
        } else if (serializable.isStrict) {
            const itemSerializer = `${prop.type.typeAsString}Serializer`;
            importer(itemSerializer, findSerializerModule(prop.type));

            if (prop.type.isNullable || prop.type.isOptional) {
                propertyStatements.push(
                    createNodeFromSource<ts.IfStatement>(
                        `
                        if(obj.${fieldName}) {
                            o.set(${JSON.stringify(jsonName)}, ${itemSerializer}.toJson(obj.${fieldName}));
                        }
                    `,
                        ts.SyntaxKind.IfStatement
                    )
                );
            } else {
                propertyStatements.push(
                    createNodeFromSource<ts.ExpressionStatement>(
                        `
                        o.set(${JSON.stringify(jsonName)}, ${itemSerializer}.toJson(obj.${fieldName}));
                    `,
                        ts.SyntaxKind.ExpressionStatement
                    )
                );
            }
        } else {
            const itemSerializer = `${prop.type.typeAsString}Serializer`;
            importer(itemSerializer, findSerializerModule(prop.type));
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

    if (serializable.hasToJsonExtension) {
        statements.push(
            createNodeFromSource<ts.ExpressionStatement>('obj.toJson(o);', ts.SyntaxKind.ExpressionStatement)
        );
    }

    statements.push(ts.factory.createReturnStatement(ts.factory.createIdentifier('o')));

    return ts.factory.createBlock(statements, true);
}

export function createToJsonMethod(
    input: ts.ClassDeclaration,
    serializable: TypeSchema,
    importer: (name: string, module: string) => void
) {
    const methodDecl = createNodeFromSource<ts.MethodDeclaration>(
        `public class Serializer {
            public static toJson(obj: ${input.name!.text} | null): Map<string, unknown> | null {
            }
        }`,
        ts.SyntaxKind.MethodDeclaration
    );
    return setMethodBody(methodDecl, generateToJsonBody(serializable, importer));
}
