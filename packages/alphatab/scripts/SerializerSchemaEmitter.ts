/**
 * Emits a fingerprint of the field ids of all `@json` classes, so that binary data written with field ids can be
 * rejected by readers of other generator output.
 */

import ts from 'typescript';
import { generateFile } from './EmitterBase';
import { primaryJsonName, printTypeNode, serializedFields } from './Serializer.common';
import { buildTypeSchema } from './TypeSchema';

/**
 * FNV-1a, 32 bit.
 */
function hash(text: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h;
}

export default function emit(program: ts.Program, _diagnostics: ts.Diagnostic[]) {
    const classes: string[] = [];
    for (const file of program.getRootFileNames()) {
        const sourceFile = program.getSourceFile(file)!;
        for (const stmt of sourceFile.statements) {
            if (
                (ts.isClassDeclaration(stmt) || ts.isInterfaceDeclaration(stmt)) &&
                ts.getJSDocTags(stmt).some(t => t.tagName.text === 'json')
            ) {
                const fields = serializedFields(buildTypeSchema(program, stmt)).map(
                    p => `${primaryJsonName(p)}:${printTypeNode(p.type)}`
                );
                classes.push(`${stmt.name!.text}{${fields.join(',')}}`);
            }
        }
    }
    classes.sort();

    const source = `/** @target web */
/**
 * @target web
 * @internal
 */
export class SerializerSchema {
    /**
     * A hash of the field ids, keys and types of all serialized classes (${classes.length} classes).
     */
    public static readonly fingerprint: number = 0x${hash(classes.join(';')).toString(16).padStart(8, '0')};
}
`;
    generateFile(
        program,
        ts.createSourceFile('SerializerSchema.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS),
        'SerializerSchema.ts'
    );
}
