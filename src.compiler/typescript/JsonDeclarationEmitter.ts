/**
 * This file contains an emitter which generates classes to clone
 * any data models following certain rules.
 */

import * as ts from 'typescript';
import createEmitter, { generateFile } from './EmitterBase';
import { getTypeWithNullableInfo, type TypeWithNullableInfo } from './TypeSchema';

function createDefaultJsonTypeNode(checker: ts.TypeChecker, type: TypeWithNullableInfo, isNullable: boolean) {
    if (isNullable) {
        const notNullable = createDefaultJsonTypeNode(checker, type, false);
        return ts.factory.createUnionTypeNode([notNullable, ts.factory.createLiteralTypeNode(ts.factory.createNull())]);
    }

    return type.createTypeNode();
}

function createJsonTypeNode(
    checker: ts.TypeChecker,
    typeInfo: TypeWithNullableInfo,
    importer: (name: string, module: string) => void
): ts.TypeNode | undefined {
    if (typeInfo.isEnumType) {
        importer(typeInfo.typeAsString, typeInfo.modulePath);

        return ts.factory.createUnionTypeNode([
            typeInfo.createTypeNode(),
            ts.factory.createTypeOperatorNode(
                ts.SyntaxKind.KeyOfKeyword,
                ts.factory.createTypeQueryNode(ts.factory.createIdentifier(typeInfo.typeAsString))
            ),
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Lowercase'), [
                ts.factory.createTypeOperatorNode(
                    ts.SyntaxKind.KeyOfKeyword,
                    ts.factory.createTypeQueryNode(ts.factory.createIdentifier(typeInfo.typeAsString))
                )
            ])
        ]);
    }

    if (typeInfo.isArray) {
        const arrayItemType = typeInfo.arrayItemType;
        if (arrayItemType) {
            const result = createJsonTypeNode(checker, arrayItemType, importer);
            if (result) {
                return ts.factory.createArrayTypeNode(result);
            }
            return ts.factory.createArrayTypeNode(createDefaultJsonTypeNode(checker, arrayItemType, false));
        }
        return undefined;
    }

    if (!typeInfo.isPrimitiveType && typeInfo.isUnionType) {
        const types: ts.TypeNode[] = [];
        for (const type of typeInfo.unionTypes!) {
            const mapped = createJsonTypeNode(checker, type, importer);
            if (mapped) {
                types.push(mapped);
            } else {
                types.push(createDefaultJsonTypeNode(checker, type, false));
            }
        }
        return ts.factory.createUnionTypeNode(types);
    }
    if (typeInfo.modulePath) {
        const isOwnType = typeInfo.isOwnType;

        if (isOwnType) {
            const isGeneratedJsonDeclaration = typeInfo.jsDocTags?.some(t => t.tagName.text === 'json_declaration');
            if (isGeneratedJsonDeclaration) {
                importer(`${typeInfo.typeAsString}Json`, `@src/generated/${typeInfo.typeAsString}Json`);
            } else {
                importer(`${typeInfo.typeAsString}Json`, typeInfo.modulePath);
            }
        }

        let args: ts.TypeNode[] | undefined = undefined;
        if (typeInfo.typeArguments) {
            args = [];
            for (const arg of typeInfo.typeArguments) {
                const mapped = createJsonTypeNode(checker, arg, importer);

                if (mapped) {
                    args.push(mapped);
                } else {
                    args.push(createDefaultJsonTypeNode(checker, arg, arg.isNullable));
                }
            }
        }

        const symbolType: ts.TypeNode = ts.factory.createTypeReferenceNode(
            typeInfo.typeAsString + (isOwnType ? 'Json' : ''),
            args
        );

        return symbolType;
    }
    return undefined;
}

function cloneJsDoc<T extends ts.Node>(node: T, source: ts.Node, additionalTags: string[]): T {
    const docs = ts
        .getJSDocCommentsAndTags(source)
        .filter(s => ts.isJSDoc(s))
        .map(s => s.getText()) as string[];

    for (let text of docs) {
        if (text.startsWith('/**')) {
            text = text
                .substring(2, text.length - 2)
                .split('\n')
                .map(l => ` ${l.trimStart()}`)
                .join('\n')
                .trimStart();

            for (const tag of additionalTags) {
                if (!text.includes(tag)) {
                    text += `* ${tag}\n `;
                }
            }
        }

        node = ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, text, true);
    }

    return node;
}

function createJsonMember(
    program: ts.Program,
    input: ts.PropertyDeclaration,
    importer: (name: string, module: string) => void
): ts.TypeElement {
    const typeInfo = getTypeWithNullableInfo(program, input.type!, true, false, undefined);
    const type = createJsonTypeNode(program.getTypeChecker(), typeInfo, importer) ?? typeInfo.createTypeNode();

    const prop = ts.factory.createPropertySignature(
        undefined,
        input.name,
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        type
    );

    return cloneJsDoc(prop, input, []);
}

function createJsonMembers(
    program: ts.Program,
    input: ts.ClassDeclaration,
    importer: (name: string, module: string) => void
): ts.TypeElement[] {
    return input.members
        .filter(
            m =>
                ts.isPropertyDeclaration(m) &&
                m.modifiers &&
                !m.modifiers.find(m => m.kind === ts.SyntaxKind.StaticKeyword)
        )
        .map(m => createJsonMember(program, m as ts.PropertyDeclaration, importer));
}

let allJsonTypes: Map<string, string> = new Map<string, string>();
const emit = createEmitter('json_declaration', (program, input) => {
    console.log(`Writing JSON Type Declaration for ${input.name!.text}`);
    const statements: ts.Statement[] = [];

    const imported = new Set<string>();
    function importer(name: string, module: string) {
        if (imported.has(name)) {
            return;
        }
        imported.add(name);

        if (name.endsWith('Json')) {
            allJsonTypes.set(name, module);
        }

        statements.push(
            ts.factory.createImportDeclaration(
                undefined,
                ts.factory.createImportClause(
                    false,
                    undefined,
                    ts.factory.createNamedImports([
                        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name))
                    ])
                ),
                ts.factory.createStringLiteral(module)
            )
        );
    }

    statements.push(
        cloneJsDoc(
            ts.factory.createInterfaceDeclaration(
                [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
                `${input.name!.text}Json`,
                undefined,
                undefined,
                createJsonMembers(program, input, importer)
            ),
            input,
            ['@target web']
        )
    );

    allJsonTypes.set(`${input.name!.text}Json`, `@src/generated/${input.name!.text}Json`);
    const sourceFile = ts.factory.createSourceFile(
        [...statements],
        ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None
    );

    return sourceFile;
});
export default function emitWithIndex(program: ts.Program, _diagnostics: ts.Diagnostic[]) {
    allJsonTypes = new Map<string, string>();

    emit(program, _diagnostics);

    const statements = Array.from(allJsonTypes.entries()).map(type =>
        ts.factory.createExportDeclaration(
            undefined,
            true,
            ts.factory.createNamedExports([
                ts.factory.createExportSpecifier(false, undefined, ts.factory.createIdentifier(type[0]))
            ]),
            ts.factory.createStringLiteral(type[1])
        )
    );

    const sourceFile = ts.factory.createSourceFile(
        [...statements],
        ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None
    );

    generateFile(program, sourceFile, '_jsonbarrel.ts');
}
