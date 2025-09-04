/**
 * This file contains an emitter which generates classes to serialize
 * any data models to and from JSON following certain rules.
 */

import path from 'node:path';
import ts from 'typescript';
import createEmitter from './EmitterBase';
import { createSetPropertyMethod } from './Serializer.setProperty';
import { createFromJsonMethod } from './Serializer.fromJson';
import { createToJsonMethod } from './Serializer.toJson';
import { buildTypeSchema, toImportPath } from './TypeSchema';

export default createEmitter('json', (program, input) => {
    console.log(`Writing Serializer for ${input.name!.text}`);
    const sourceFileName = path.relative(
        path.join(path.resolve(program.getCompilerOptions().baseUrl!)),
        path.resolve(input.getSourceFile().fileName)
    );

    const serializable = buildTypeSchema(program, input);

    const statements: ts.Statement[] = [];

    const importedNames = new Set();
    function importer(name: string, module: string) {
        if (importedNames.has(name)) {
            return;
        }
        importedNames.add(name);
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
        ts.factory.createClassDeclaration(
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            `${input.name!.text}Serializer`,
            undefined,
            undefined,
            [
                createFromJsonMethod(input, serializable, importer),
                createToJsonMethod(input, serializable, importer),
                createSetPropertyMethod(input, serializable, importer)
            ]
        )
    );

    const sourceFile = ts.factory.createSourceFile(
        [
            ts.factory.createImportDeclaration(
                undefined,
                ts.factory.createImportClause(
                    false,
                    undefined,
                    ts.factory.createNamedImports([
                        ts.factory.createImportSpecifier(
                            false,
                            undefined,
                            ts.factory.createIdentifier(input.name!.text)
                        )
                    ])
                ),
                ts.factory.createStringLiteral(toImportPath(sourceFileName))
            ),
            ...statements
        ],
        ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None
    );

    return sourceFile;
});
