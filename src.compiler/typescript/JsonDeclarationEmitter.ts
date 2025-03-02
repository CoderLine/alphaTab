/**
 * This file contains an emitter which generates classes to clone
 * any data models following certain rules.
 */
import * as path from 'path';
import * as url from 'url';
import * as ts from 'typescript';
import createEmitter, { generateFile } from './EmitterBase';
import {
    cloneTypeNode,
    getTypeWithNullableInfo,
    isEnumType,
    isPrimitiveType,
    unwrapArrayItemType
} from '../BuilderHelpers';

function removeExtension(fileName: string) {
    return fileName.substring(0, fileName.lastIndexOf('.'));
}

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const root = path.resolve(__dirname, '..', '..');

function toImportPath(fileName: string) {
    return '@' + removeExtension(path.relative(root, fileName)).split('\\').join('/');
}

function createDefaultJsonTypeNode(checker: ts.TypeChecker, type: ts.Type, isNullable: boolean) {
    if (isNullable) {
        const notNullable = createDefaultJsonTypeNode(checker, type, false);
        return ts.factory.createUnionTypeNode([notNullable, ts.factory.createLiteralTypeNode(ts.factory.createNull())]);
    }

    if (isPrimitiveType(type)) {
        if ('intrinsicName' in type) {
            return ts.factory.createTypeReferenceNode(type.intrinsicName as string);
        } else {
            return ts.factory.createTypeReferenceNode('TODO');
        }
    } else if (checker.isArrayType(type)) {
        return ts.factory.createTypeReferenceNode(type.symbol.name);
    } else if (type.symbol) {
        return ts.factory.createTypeReferenceNode(type.symbol.name);
    } else if (type.isStringLiteral()) {
        return ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(type.value));
    } else if (type.isLiteral()) {
        if (typeof type.value === 'string') {
            return ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(type.value));
        } else {
            return ts.factory.createTypeReferenceNode('TODO');
        }
    } else if ('intrinsicName' in type) {
        return ts.factory.createTypeReferenceNode(type.intrinsicName as string);
    } else {
        return ts.factory.createTypeReferenceNode('TODO');
    }
}

function createJsonTypeNode(
    checker: ts.TypeChecker,
    type: ts.TypeNode | ts.Type,
    importer: (name: string, module: string) => void
): ts.TypeNode | undefined {
    const typeInfo = getTypeWithNullableInfo(checker, type!, true);

    if (isEnumType(typeInfo.type)) {
        const sourceFile = typeInfo.type.symbol.valueDeclaration?.getSourceFile();
        if (sourceFile) {
            importer(typeInfo.type.symbol.name, toImportPath(sourceFile.fileName));
        }

        return ts.factory.createUnionTypeNode([
            ts.factory.createTypeReferenceNode(typeInfo.type.symbol.name),
            ts.factory.createTypeOperatorNode(
                ts.SyntaxKind.KeyOfKeyword,
                ts.factory.createTypeQueryNode(ts.factory.createIdentifier(typeInfo.type.symbol.name))
            )
        ]);
    } else if (checker.isArrayType(typeInfo.type)) {
        const arrayItemType = unwrapArrayItemType(typeInfo.type, checker);
        if (arrayItemType) {
            const result = createJsonTypeNode(checker, arrayItemType, importer);
            if (result) {
                return ts.factory.createArrayTypeNode(result);
            } else {
                return ts.factory.createArrayTypeNode(createDefaultJsonTypeNode(checker, arrayItemType, false));
            }
        }
        return undefined;
    } else if (!isPrimitiveType(typeInfo.type) && typeInfo.type.isUnion()) {
        const types: ts.TypeNode[] = [];
        for (const type of typeInfo.type.types) {
            const mapped = createJsonTypeNode(checker, type, importer);
            if (mapped) {
                types.push(mapped);
            } else {
                types.push(createDefaultJsonTypeNode(checker, type, false));
            }
        }
        return ts.factory.createUnionTypeNode(types);
    } else if (typeInfo.type.symbol) {
        const sourceFile = typeInfo.type.symbol.valueDeclaration?.getSourceFile();
        if (sourceFile) {
            const isOwnType = !sourceFile.fileName.includes('node_modules');

            if (isOwnType) {
                const isGeneratedJsonDeclaration = ts
                    .getJSDocTags(typeInfo.type.symbol.valueDeclaration!)
                    .some(t => t.tagName.text === 'json_declaration');
                if (isGeneratedJsonDeclaration) {
                    importer(typeInfo.type.symbol.name + 'Json', './' + typeInfo.type.symbol.name + 'Json');
                } else {
                    importer(typeInfo.type.symbol.name + 'Json', toImportPath(sourceFile.fileName));
                }
            }

            let args: ts.TypeNode[] | undefined = undefined;
            if ('typeArguments' in typeInfo.type) {
                args = [];
                for (const arg of (typeInfo.type as ts.TypeReference).typeArguments ?? []) {
                    const mapped = createJsonTypeNode(checker, arg, importer);

                    if (mapped) {
                        args.push(mapped);
                    } else {
                        const argTypeInfo = getTypeWithNullableInfo(checker, arg, true);
                        args.push(createDefaultJsonTypeNode(checker, argTypeInfo.type, argTypeInfo.isNullable));
                    }
                }
            }

            let symbolType: ts.TypeNode = ts.factory.createTypeReferenceNode(
                typeInfo.type.symbol.name + (isOwnType ? 'Json' : ''),
                args
            );

            if (typeInfo.type.symbol.name === 'Map' && args && args.length === 2) {
                // symbolType = ts.factory.createUnionTypeNode([
                //     symbolType,
                //     ts.factory.createTypeReferenceNode('Record'
                // ]);
            }

            return symbolType;
        }
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
                .map(l => ' ' + l.trimStart())
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
    const checker = program.getTypeChecker();
    let type = createJsonTypeNode(checker, input.type!, importer) ?? cloneTypeNode(input.type!);

    let prop = ts.factory.createPropertySignature(
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

let allJsonTypes: string[] = [];
const emit = createEmitter('json_declaration', (program, input) => {
    console.log(`Writing JSON Type Declaration for ${input.name!.text}`);
    const statements: ts.Statement[] = [];

    const imported = new Set<string>();
    function importer(name: string, module: string) {
        if (imported.has(name)) {
            return;
        }
        imported.add(name);

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
                input.name!.text + 'Json',
                undefined,
                undefined,
                createJsonMembers(program, input, importer)
            ),
            input,
            ['@target web']
        )
    );

    allJsonTypes.push(input.name!.text + 'Json');
    const sourceFile = ts.factory.createSourceFile(
        [...statements],
        ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None
    );

    return sourceFile;
});
export default function emitWithIndex(program: ts.Program, _diagnostics: ts.Diagnostic[]) {
    allJsonTypes = [];

    emit(program, _diagnostics);

    const statements = allJsonTypes.map(type =>
        ts.factory.createExportDeclaration(
            undefined,
            true,
            ts.factory.createNamedExports([
                ts.factory.createExportSpecifier(false, undefined, ts.factory.createIdentifier(type))
            ]),
            ts.factory.createStringLiteral(`./${type}`)
        )
    );

    const sourceFile = ts.factory.createSourceFile(
        [...statements],
        ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None
    );

    generateFile(program, sourceFile, 'json.ts');
}
