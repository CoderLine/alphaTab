/**
 * This file contains an emitter which generates classes to serialize
 * any data models to and from JSON following certain rules.
 */

import path from 'node:path';
import ts from 'typescript';
import createEmitter from './EmitterBase';
import { createReadMethods } from './Serializer.read';
import { createWriteMethods } from './Serializer.write';
import { buildTypeSchema, toImportPath } from './TypeSchema';

export default createEmitter('json', (program, input) => {
    console.log(`Writing Serializer for ${input.name!.text}`);
    const sourceFileName = path.relative(
        path.dirname(program.getCompilerOptions().configFilePath as string),
        path.resolve(input.getSourceFile().fileName)
    );

    const className = input.name!.text;
    const serializable = buildTypeSchema(program, input);

    const imports = new Map<string, { module: string; typeOnly: boolean }>();
    imports.set(className, { module: toImportPath(sourceFileName), typeOnly: false });
    function importer(name: string, module: string, typeOnly: boolean = false) {
        const existing = imports.get(name);
        if (existing) {
            existing.typeOnly &&= typeOnly;
            return;
        }
        imports.set(name, { module, typeOnly });
    }

    const methods = [
        createReadMethods(className, serializable, importer),
        createWriteMethods(className, serializable, importer)
    ];

    const importLines = Array.from(imports.entries()).map(
        ([name, i]) => `import ${i.typeOnly ? 'type ' : ''}{ ${name} } from ${JSON.stringify(i.module)};`
    );

    const source = `${importLines.join('\n')}
/**
 * @internal
 */
export class ${className}Serializer {
${methods.join('\n')}
}
`;

    return ts.createSourceFile(`${className}Serializer.ts`, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
});
