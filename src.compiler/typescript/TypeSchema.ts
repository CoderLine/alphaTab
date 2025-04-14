import path from 'node:path';
import ts from 'typescript';
import url from 'node:url';
import { isEnumType, isNumberType, isPrimitiveType } from '../BuilderHelpers';

export type TypeWithNullableInfo = {
    readonly isNullable: boolean;
    readonly isOptional: boolean;
    readonly isUnionType: boolean;
    readonly isPrimitiveType: boolean;
    readonly isEnumType: boolean;
    readonly isOwnType: boolean;
    readonly isTypedArray: boolean;
    readonly typeAsString: string;
    readonly modulePath: string;
    readonly isCloneable: boolean;
    readonly isJsonImmutable: boolean;
    readonly isNumberType: boolean;
    readonly isMap: boolean;
    readonly isSet: boolean;
    readonly isArray: boolean;
    readonly arrayItemType?: TypeWithNullableInfo;
    readonly typeArguments?: readonly TypeWithNullableInfo[];
    readonly unionTypes?: readonly TypeWithNullableInfo[];
    readonly jsDocTags?: readonly ts.JSDocTag[];
    createTypeNode(): ts.TypeNode;
};

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export function buildTypeSchema(program: ts.Program, input: ts.ClassDeclaration) {
    const schema: TypeSchema = {
        properties: [],
        isStrict: !!ts.getJSDocTags(input).find(t => t.tagName.text === 'json_strict'),
        hasToJsonExtension: false,
        hasSetPropertyExtension: false
    };

    const handleMember = (
        member: ts.ClassDeclaration['members'][0],
        typeArgumentMapping: Map<string, ts.Type> | undefined
    ) => {
        if (ts.isPropertyDeclaration(member)) {
            const propertyDeclaration = member as ts.PropertyDeclaration;
            if (
                !propertyDeclaration.modifiers!.find(
                    m => m.kind === ts.SyntaxKind.StaticKeyword || m.kind === ts.SyntaxKind.PrivateKeyword
                )
            ) {
                const jsonNames = [(member.name as ts.Identifier).text.toLowerCase()];
                const jsDoc = ts.getJSDocTags(member);

                if (jsDoc.find(t => t.tagName.text === 'json_on_parent')) {
                    jsonNames.push('');
                }

                if (!jsDoc.find(t => t.tagName.text === 'json_ignore')) {
                    const asRaw = !!jsDoc.find(t => t.tagName.text === 'json_raw');
                    const isReadonly = !!jsDoc.find(t => t.tagName.text === 'json_read_only');
                    schema.properties.push({
                        jsonNames: jsonNames,
                        asRaw,
                        partialNames: !!jsDoc.find(t => t.tagName.text === 'json_partial_names'),
                        target: jsDoc.find(t => t.tagName.text === 'target')?.comment as string,
                        isReadOnly: !!jsDoc.find(t => t.tagName.text === 'json_read_only'),
                        name: (member.name as ts.Identifier).text,
                        jsDocTags: jsDoc,
                        type: getTypeWithNullableInfo(
                            program,
                            member.type!,
                            asRaw || isReadonly,
                            !!member.questionToken,
                            typeArgumentMapping
                        )
                    });
                }
            }
        } else if (ts.isMethodDeclaration(member)) {
            switch ((member.name as ts.Identifier).text) {
                case 'toJson':
                    schema.hasToJsonExtension = true;
                    break;
                case 'setProperty':
                    schema.hasSetPropertyExtension = true;
                    break;
            }
        }
    };

    let hierarchy: ts.ClassDeclaration | undefined = input;
    let typeArgumentMapping: Map<string, ts.Type> | undefined;
    const checker = program.getTypeChecker();
    while (hierarchy) {
        for (const x of hierarchy.members) {
            handleMember(x, typeArgumentMapping);
        }

        const extendsClause = hierarchy.heritageClauses?.find(c => c.token === ts.SyntaxKind.ExtendsKeyword);
        if (extendsClause?.types.length === 1) {
            const baseType = checker.getTypeAtLocation(extendsClause.types[0]);
            if (baseType.symbol?.valueDeclaration && ts.isClassDeclaration(baseType.symbol?.valueDeclaration)) {
                hierarchy = baseType.symbol?.valueDeclaration;

                if (extendsClause.types[0].typeArguments) {
                    typeArgumentMapping = new Map<string, ts.Type>();

                    const typeArgs = extendsClause.types[0].typeArguments;
                    for (let i = 0; i < typeArgs.length; i++) {
                        typeArgumentMapping.set(
                            hierarchy.typeParameters![i].name.text,
                            checker.getTypeAtLocation(typeArgs[i])
                        );
                    }
                } else {
                    typeArgumentMapping = undefined;
                }
            } else {
                hierarchy = undefined;
            }
        } else {
            hierarchy = undefined;
        }
    }

    return schema;
}

export function getTypeWithNullableInfo(
    program: ts.Program,
    node: ts.TypeNode | ts.Type,
    allowUnion: boolean,
    isOptionalFromDeclaration: boolean,
    typeArgumentMapping: Map<string, ts.Type> | undefined
): TypeWithNullableInfo {
    const checker = program.getTypeChecker();

    let typeInfo: Writeable<TypeWithNullableInfo> = {
        isNullable: false,
        isOptional: isOptionalFromDeclaration,
        isUnionType: false,
        isPrimitiveType: false,
        isEnumType: false,
        isTypedArray: false,
        isOwnType: false,
        typeAsString: '',
        modulePath: '',
        isJsonImmutable: false,
        isNumberType: false,
        isMap: false,
        isSet: false,
        isArray: false,
        isCloneable: false,
        createTypeNode() {
            return undefined!;
        }
    };
    let mainType: ts.Type | undefined;

    const fillBaseInfoFrom = (tsType: ts.Type) => {
        const valueDeclaration = tsType.symbol?.valueDeclaration;
        mainType = tsType;

        typeInfo.typeAsString = checker.typeToString(tsType, undefined, undefined);
        typeInfo.modulePath = findModule(tsType, program.getCompilerOptions());
        typeInfo.isOwnType =
            !!typeInfo.modulePath && !typeInfo.modulePath.includes('node_modules') && !!valueDeclaration;

        if (isEnumType(tsType)) {
            typeInfo.isEnumType = true;
        } else if (isPrimitiveType(tsType)) {
            typeInfo.isNumberType = isNumberType(tsType);
            typeInfo.isPrimitiveType = true;
        } else if (typeInfo.isOwnType) {
            typeInfo.jsDocTags = valueDeclaration ? ts.getJSDocTags(valueDeclaration) : undefined;
            if (typeInfo.jsDocTags) {
                typeInfo.isJsonImmutable = !!typeInfo.jsDocTags.find(t => t.tagName.text === 'json_immutable');
                typeInfo.isCloneable = !!typeInfo.jsDocTags.find(t => t.tagName.text === 'cloneable');
            }

            if (tsType.flags & ts.ObjectFlags.Reference) {
                typeInfo.typeArguments = (tsType as ts.TypeReference).typeArguments?.map(p =>
                    getTypeWithNullableInfo(program, p, allowUnion, false, typeArgumentMapping)
                );
            }
        } else if (checker.isArrayType(tsType)) {
            typeInfo.isArray = true;
            typeInfo.arrayItemType = getTypeWithNullableInfo(
                program,
                (tsType as ts.TypeReference).typeArguments![0],
                allowUnion,
                false,
                typeArgumentMapping
            );
        } else if (tsType.symbol) {
            typeInfo.typeAsString = tsType.symbol.name;
            switch (tsType.symbol.name) {
                case 'Uint8Array':
                case 'Uint16Array':
                case 'Uint32Array':
                case 'Int8Array':
                case 'Int16Array':
                case 'Int32Array':
                case 'Float32Array':
                case 'Float64Array':
                    typeInfo.isTypedArray = true;
                    typeInfo.arrayItemType = {
                        isNullable: false,
                        isOptional: false,
                        isUnionType: false,
                        isPrimitiveType: true,
                        isEnumType: false,
                        isOwnType: false,
                        isTypedArray: false,
                        typeAsString: 'number',
                        modulePath: '',
                        isCloneable: false,
                        isJsonImmutable: false,
                        isNumberType: true,
                        isMap: false,
                        isSet: false,
                        isArray: false,
                        createTypeNode(): ts.TypeNode {
                            return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
                        }
                    };
                    break;
                case 'Map':
                    typeInfo.isMap = true;
                    typeInfo.typeArguments = (tsType as ts.TypeReference).typeArguments!.map(p =>
                        getTypeWithNullableInfo(program, p, allowUnion, false, typeArgumentMapping)
                    );
                    break;
                case 'Set':
                    typeInfo.isSet = true;
                    typeInfo.typeArguments = (tsType as ts.TypeReference).typeArguments!.map(p =>
                        getTypeWithNullableInfo(program, p, allowUnion, false, typeArgumentMapping)
                    );
                    break;
                default:
                    if (tsType.isTypeParameter()) {
                        if (typeArgumentMapping?.has(typeInfo.typeAsString)) {
                            typeInfo = getTypeWithNullableInfo(
                                program,
                                typeArgumentMapping.get(typeInfo.typeAsString)!,
                                allowUnion,
                                false,
                                typeArgumentMapping
                            );
                        } else {
                            throw new Error(`Unresolved type parameters ${typeInfo.typeAsString}`);
                        }
                    } else if ((tsType as ts.Type).flags & ts.ObjectFlags.Reference) {
                        typeInfo.typeArguments = (tsType as ts.TypeReference).typeArguments?.map(p =>
                            getTypeWithNullableInfo(program, p, allowUnion, false, typeArgumentMapping)
                        );
                    }
                    break;
            }
        }
    };

    if ('kind' in node) {
        if (ts.isUnionTypeNode(node)) {
            for (const t of node.types) {
                if (t.kind === ts.SyntaxKind.NullKeyword) {
                    typeInfo.isNullable = true;
                } else if (ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.NullKeyword) {
                    typeInfo.isNullable = true;
                } else if (t.kind === ts.SyntaxKind.UndefinedKeyword) {
                    typeInfo.isOptional = true;
                } else if (ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.UndefinedKeyword) {
                    typeInfo.isOptional = true;
                } else if (!mainType) {
                    mainType = checker.getTypeFromTypeNode(t);
                } else if (allowUnion) {
                    if (!typeInfo.unionTypes) {
                        typeInfo.unionTypes = [
                            getTypeWithNullableInfo(program, mainType, false, false, typeArgumentMapping)
                        ];
                    }

                    (typeInfo.unionTypes as TypeWithNullableInfo[]).push(
                        getTypeWithNullableInfo(program, t, false, false, typeArgumentMapping)
                    );
                } else {
                    throw new Error(
                        `Multi union types on not supported at this location: ${node.getSourceFile().fileName}:${node.getText()}`
                    );
                }
            }

            if (!typeInfo.unionTypes && mainType) {
                fillBaseInfoFrom(mainType);
            }
        } else {
            fillBaseInfoFrom(checker.getTypeFromTypeNode(node));
        }
    } else {
        // use typeArgumentMapping
        if (isPrimitiveType(node) || isEnumType(node)) {
            fillBaseInfoFrom(node);
        } else if (node.isUnion()) {
            for (const t of node.types) {
                if ((t.flags & ts.TypeFlags.Null) !== 0) {
                    typeInfo.isNullable = true;
                } else if ((t.flags & ts.TypeFlags.Undefined) !== 0) {
                    typeInfo.isOptional = true;
                } else if (!mainType) {
                    fillBaseInfoFrom(t);
                } else if (allowUnion) {
                    typeInfo.unionTypes ??= [];
                    (typeInfo.unionTypes as TypeWithNullableInfo[]).push(
                        getTypeWithNullableInfo(program, t, false, false, typeArgumentMapping)
                    );
                } else {
                    throw new Error(`Multi union types on not supported at this location: ${typeInfo.typeAsString}`);
                }
            }
        } else {
            fillBaseInfoFrom(node);
        }
    }

    const applyNullableAndUndefined = (type: ts.TypeNode): ts.TypeNode => {
        if (typeInfo.isNullable || typeInfo.isOptional) {
            const types: ts.TypeNode[] = [type];

            if (typeInfo.isNullable) {
                types.push(ts.factory.createLiteralTypeNode(ts.factory.createNull()));
            }
            if (typeInfo.isOptional) {
                types.push(ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword));
            }

            return ts.factory.createUnionTypeNode(types);
        }

        return type;
    };

    if (typeInfo.unionTypes) {
        typeInfo.createTypeNode = () => {
            const types: ts.TypeNode[] = typeInfo.unionTypes!.map(t => t.createTypeNode());
            if (typeInfo.isNullable) {
                types.push(ts.factory.createLiteralTypeNode(ts.factory.createNull()));
            }
            if (typeInfo.isOptional) {
                types.push(ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword));
            }
            return ts.factory.createUnionTypeNode(types);
        };
    } else if (typeInfo.isPrimitiveType) {
        typeInfo.createTypeNode = () => {
            return applyNullableAndUndefined(checker.typeToTypeNode(mainType!, undefined, undefined)!);
        };
    } else if (typeInfo.isArray) {
        typeInfo.createTypeNode = () => {
            return applyNullableAndUndefined(ts.factory.createArrayTypeNode(typeInfo.arrayItemType!.createTypeNode()));
        };
    } else {
        typeInfo.createTypeNode = () => {
            return applyNullableAndUndefined(
                ts.factory.createTypeReferenceNode(
                    ts.factory.createIdentifier(typeInfo.typeAsString),
                    typeInfo.typeArguments?.map(t => t.createTypeNode())
                )
            );
        };
    }

    return typeInfo;
}

export interface TypeProperty {
    partialNames: boolean;
    name: string;
    jsDocTags: readonly ts.JSDocTag[];
    type: TypeWithNullableInfo;
    jsonNames: string[];
    asRaw: boolean;
    target?: string;
    isReadOnly: boolean;
}

export interface TypeSchema {
    isStrict: boolean;
    hasToJsonExtension: boolean;
    hasSetPropertyExtension: boolean;
    properties: TypeProperty[];
}

function removeExtension(fileName: string) {
    return fileName.substring(0, fileName.lastIndexOf('.'));
}

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const root = path.resolve(__dirname, '..', '..');

export function toImportPath(fileName: string) {
    return `@${removeExtension(path.relative(root, fileName)).split('\\').join('/')}`;
}

function findModule(type: ts.Type, options: ts.CompilerOptions) {
    if (type.symbol && type.symbol.declarations) {
        for (const decl of type.symbol.declarations) {
            const file = decl.getSourceFile();
            if (file) {
                const relative = path.relative(path.join(path.resolve(options.baseUrl!)), path.resolve(file.fileName));
                return toImportPath(relative);
            }
        }

        return `./${type.symbol.name}`;
    }

    return '';
}
