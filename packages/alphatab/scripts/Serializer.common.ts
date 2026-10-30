import ts from 'typescript';
import type { TypeProperty, TypeSchema, TypeWithNullableInfo } from './TypeSchema';

export function findSerializerModule(type: TypeWithNullableInfo) {
    const module = type.modulePath;
    const importPath = module.split('/');
    importPath.splice(2, 0, 'generated');
    importPath[importPath.length - 1] = `${type.typeAsString}Serializer`;
    return importPath.join('/');
}

export type Importer = (name: string, module: string, typeOnly?: boolean) => void;

const printer = ts.createPrinter();
const printerSourceFile = ts.createSourceFile('serializer.ts', '', ts.ScriptTarget.Latest);

export function printTypeNode(type: TypeWithNullableInfo): string {
    return printer.printNode(ts.EmitHint.Unspecified, type.createTypeNode(), printerSourceFile);
}

/**
 * The key a property is written with: its lowercased name.
 */
export function primaryJsonName(prop: TypeProperty): string | undefined {
    return prop.jsonNames.filter(n => n !== '')[0];
}

export function isNullableOrOptional(type: TypeWithNullableInfo) {
    return type.isNullable || type.isOptional;
}

export function isPrimitiveForSerialization(type: TypeWithNullableInfo) {
    return type.isPrimitiveType || !!type.arrayItemType?.isPrimitiveType || type.isTypedArray;
}

export function isStrictType(type: TypeWithNullableInfo) {
    return !!type.jsDocTags?.some(t => t.tagName.text === 'json_strict');
}

export function jsonAddMethod(prop: TypeProperty): string | undefined {
    return prop.jsDocTags.filter(t => t.tagName.text === 'json_add').map(t => t.comment ?? '')[0] as
        | string
        | undefined;
}

/**
 * Restricts the statements of a property to the web target if the property has `@target web`.
 */
export function wrapTarget(prop: TypeProperty, code: string): string {
    if (!prop.target) {
        return code;
    }
    if (prop.target !== 'web') {
        throw new Error(`Only @target web is supported on serialized properties, found ${prop.target} on ${prop.name}`);
    }
    return `/*@target web*/\n{\n${code}\n}`;
}

/**
 * The fields of a class that have a key, in declaration order. A field's id is its index in this list. Binary
 * realisations write the id instead of the key, so both ends of a hand-off must come from the same generator
 * output.
 */
export function serializedFields(serializable: TypeSchema): TypeProperty[] {
    const fields = serializable.properties.filter(p => primaryJsonName(p) !== undefined);
    if (fields.length > 256) {
        throw new Error(`Field ids are written as one byte, ${fields.length} fields are too many`);
    }
    return fields;
}

