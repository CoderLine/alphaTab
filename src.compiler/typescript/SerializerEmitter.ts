/**
 * This file contains an emitter which generates classes to serialize
 * any data models to and from JSON following certain rules.
 */

import * as path from 'path';
import * as ts from 'typescript';
import createEmitter from './EmitterBase';
import { JsonProperty, JsonSerializable, toImportPath } from './Serializer.common';
import { createSetPropertyMethod } from './Serializer.setProperty';
import { createFromJsonMethod } from './Serializer.fromJson';
import { createToJsonMethod } from './Serializer.toJson';


export default createEmitter('json', (program, input) => {
    console.log(`Writing Serializer for ${input.name!.text}`);
    const sourceFileName = path.relative(
        path.join(path.resolve(program.getCompilerOptions().baseUrl!)),
        path.resolve(input.getSourceFile().fileName)
    );

    const serializable: JsonSerializable = {
        properties: [],
        isStrict: !!ts.getJSDocTags(input).find(t => t.tagName.text === 'json_strict'),
        hasToJsonExtension: false,
        hasSetPropertyExtension: false
    };

    input.members.forEach(member => {
        if (ts.isPropertyDeclaration(member)) {
            const propertyDeclaration = member as ts.PropertyDeclaration;
            if (
                !propertyDeclaration.modifiers!.find(
                    m => m.kind === ts.SyntaxKind.StaticKeyword || m.kind === ts.SyntaxKind.PrivateKeyword
                )
            ) {
                const jsonNames = [(member.name as ts.Identifier).text.toLowerCase()];

                if (ts.getJSDocTags(member).find(t => t.tagName.text === 'json_on_parent')) {
                    jsonNames.push('');
                }

                if (!ts.getJSDocTags(member).find(t => t.tagName.text === 'json_ignore')) {
                    serializable.properties.push({
                        property: propertyDeclaration,
                        jsonNames: jsonNames,
                        partialNames: !!ts.getJSDocTags(member).find(t => t.tagName.text === 'json_partial_names'),
                        target: ts.getJSDocTags(member).find(t => t.tagName.text === 'target')?.comment as string,
                        isReadOnly: !!ts.getJSDocTags(member).find(t => t.tagName.text === 'json_read_only')
                    });
                }
            }
        }
        else if (ts.isMethodDeclaration(member)) {
            switch ((member.name as ts.Identifier).text) {
                case 'toJson':
                    serializable.hasToJsonExtension = true;
                    break;
                case 'setProperty':
                    serializable.hasSetPropertyExtension = true;
                    break;
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
        statements.push(
            ts.factory.createImportDeclaration(
                undefined,
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
            [],
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            input.name!.text + 'Serializer',
            undefined,
            undefined,
            [
                createFromJsonMethod(input, serializable, importer),
                createToJsonMethod(program, input, serializable, importer),
                createSetPropertyMethod(program, input, serializable, importer)
            ]
        )
    );

    const sourceFile = ts.factory.createSourceFile(
        [
            ts.factory.createImportDeclaration(
                undefined,
                undefined,
                ts.factory.createImportClause(
                    false,
                    undefined,
                    ts.factory.createNamedImports([
                        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(input.name!.text))
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
