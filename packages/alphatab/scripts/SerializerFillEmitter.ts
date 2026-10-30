/**
 * Emits a test helper that sets every serialized property of every `@json` class to a value other than its
 * default, so serializer round trips can be checked per field.
 */

import path from 'node:path';
import ts from 'typescript';
import { generateFile } from './EmitterBase';
import {
    findSerializerModule,
    isNullableOrOptional,
    isPrimitiveForSerialization,
    jsonAddMethod,
    primaryJsonName,
    printTypeNode
} from './Serializer.common';
import { buildTypeSchema, type TypeProperty, toImportPath, type TypeWithNullableInfo } from './TypeSchema';

type Importer = (name: string, module: string) => void;

function primitiveValue(type: TypeWithNullableInfo, current: string): string | null {
    switch (type.typeAsString) {
        case 'number':
            return '7.25';
        case 'boolean':
            return current ? `!${current}` : 'true';
        case 'string':
            return "'x ä€𝄞'";
    }
    return null;
}

function enumValue(type: TypeWithNullableInfo, current: string | null, importer: Importer): string {
    importer(type.typeAsString, type.modulePath);
    return `SerializerFill.otherEnumValue(${type.typeAsString}, ${current ?? 'undefined'}) as ${type.typeAsString}`;
}

function immutableValue(type: TypeWithNullableInfo, importer: Importer): string {
    importer(type.typeAsString, type.modulePath);
    switch (type.typeAsString) {
        case 'Color':
            return 'new Color(1, 2, 3, 4)';
        case 'Font':
            importer('FontStyle', type.modulePath);
            importer('FontWeight', type.modulePath);
            return "Font.withFamilyList(['Fill', 'Other'], 7.25, FontStyle.Italic, FontWeight.Bold)";
    }
    throw new Error(`No fill value for the immutable type ${type.typeAsString}`);
}

/**
 * An expression creating a filled value of the given type, or null if the type cannot be filled.
 */
function valueOf(type: TypeWithNullableInfo, importer: Importer, prelude: string[], id: () => string): string | null {
    if (type.isEnumType) {
        return enumValue(type, null, importer);
    }
    if (type.isPrimitiveType) {
        return primitiveValue(type, '');
    }
    if (type.isTypedArray) {
        return `new ${type.typeAsString}([1, 2])`;
    }
    if (type.isArray) {
        const item = valueOf(type.arrayItemType!, importer, prelude, id);
        return item === null ? null : `[${item}]`;
    }
    if (type.isJsonImmutable) {
        return immutableValue(type, importer);
    }
    if (type.isOwnType && !type.isMap && !type.isSet) {
        const v = id();
        if (type.isRecord) {
            importer(type.typeAsString, type.modulePath);
            prelude.push(`const ${v}: ${type.typeAsString} = {};`);
        } else {
            importer(type.typeAsString, type.modulePath);
            prelude.push(`const ${v} = new ${type.typeAsString}();`);
        }
        prelude.push(`SerializerFill.fill${type.typeAsString}(${v}, depth + 1);`);
        return v;
    }
    return null;
}

function mapKey(type: TypeWithNullableInfo, importer: Importer): string {
    if (type.isEnumType) {
        return enumValue(type, null, importer);
    }
    return type.isNumberType ? '3' : "'k'";
}

function propertyFill(prop: TypeProperty, importer: Importer, unfilled: string[]): string | null {
    const type = prop.type;
    const field = `obj.${prop.name}`;
    let n = 0;
    const id = () => `v${n++}`;
    const prelude: string[] = [];
    const block = (code: string) => `{\n${prelude.join('\n')}\n${code}\n}`;

    // deprecated accessors are aliases of other properties, which are filled on their own
    if (prop.asRaw || type.unionTypes || prop.jsDocTags.some(t => t.tagName.text === 'deprecated')) {
        unfilled.push(prop.name);
        return null;
    }
    if (prop.isUnsetAsNaN) {
        return `${field} = 7.25;`;
    }
    if (type.isEnumType) {
        return `${field} = ${enumValue(type, field, importer)};`;
    }
    if (type.isPrimitiveType) {
        return `${field} = ${primitiveValue(type, isNullableOrOptional(type) ? '' : field)};`;
    }
    if (type.isMap) {
        const key = mapKey(type.typeArguments![0], importer);
        const value = valueOf(type.typeArguments![1], importer, prelude, id);
        if (value === null) {
            unfilled.push(prop.name);
            return null;
        }
        const add = jsonAddMethod(prop);
        if (add) {
            return block(`obj.${add}(${key}, ${value});`);
        }
        const create = prop.isReadOnly
            ? ''
            : `${field} = new Map<${printTypeNode(type.typeArguments![0])}, ${printTypeNode(type.typeArguments![1])}>();\n`;
        return block(`${create}${field}!.set(${key}, ${value});`);
    }
    if (type.isSet) {
        const item = valueOf(type.typeArguments![0], importer, prelude, id);
        const add = jsonAddMethod(prop);
        if (add) {
            return block(`obj.${add}(${item});`);
        }
        return block(`${field} = new Set<${printTypeNode(type.typeArguments![0])}>([${item}]);`);
    }
    if (type.isArray && !isPrimitiveForSerialization(type)) {
        const item = valueOf(type.arrayItemType!, importer, prelude, id);
        if (item === null) {
            unfilled.push(prop.name);
            return null;
        }
        const add = jsonAddMethod(prop) ?? `${prop.name}.push`;
        return block(`${field} = [];\nobj.${add}(${item});`);
    }
    const value = valueOf(type, importer, prelude, id);
    if (value === null) {
        unfilled.push(prop.name);
        return null;
    }
    if (type.isOwnType && !type.isJsonImmutable && !isNullableOrOptional(type) && prop.isReadOnly) {
        return `SerializerFill.fill${type.typeAsString}(${field}, depth + 1);`;
    }
    return block(`${field} = ${value};`);
}

export default function emit(program: ts.Program, _diagnostics: ts.Diagnostic[]) {
    const imports = new Map<string, string>();
    const importer: Importer = (name, module) => {
        if (!imports.has(name)) {
            imports.set(name, module);
        }
    };
    const methods: string[] = [];
    const unfilledLines: string[] = [];
    const cases: string[] = [];
    importer('IObjectReader', '@coderline/alphatab/io/IObjectReader');
    importer('IObjectWriter', '@coderline/alphatab/io/IObjectWriter');

    const configDir = path.dirname(program.getCompilerOptions().configFilePath as string);
    for (const file of program.getRootFileNames()) {
        const sourceFile = program.getSourceFile(file)!;
        for (const stmt of sourceFile.statements) {
            if (
                !(ts.isClassDeclaration(stmt) || ts.isInterfaceDeclaration(stmt)) ||
                !ts.getJSDocTags(stmt).some(t => t.tagName.text === 'json')
            ) {
                continue;
            }
            const className = stmt.name!.text;
            const modulePath = toImportPath(path.relative(configDir, path.resolve(sourceFile.fileName)));
            importer(className, modulePath);
            const schema = buildTypeSchema(program, stmt);
            const serializer = `${className}Serializer`;
            importer(serializer, findSerializerModule({ modulePath, typeAsString: className } as TypeWithNullableInfo));
            const create = ts.isInterfaceDeclaration(stmt) ? '({})' : `new ${className}()`;
            cases.push(`{ name: '${className}', serializer: ${serializer}, create: () => ${create} as unknown, fill: (o: unknown) => SerializerFill.fill${className}(o as ${className}) }`);
            const unfilled: string[] = [];
            const body: string[] = [];
            for (const prop of schema.properties) {
                if (primaryJsonName(prop) === undefined || prop.isJsonReadOnly) {
                    continue;
                }
                const code = propertyFill(prop, importer, unfilled);
                if (code !== null) {
                    body.push(code);
                }
            }
            if (unfilled.length > 0) {
                unfilledLines.push(`['${className}', [${unfilled.map(u => `'${u.toLowerCase()}'`).join(', ')}]]`);
            }
            methods.push(`
    public static fill${className}(obj: ${className}, depth: number = 0): void {
        if (depth > 8) {
            return;
        }
        ${body.join('\n')}
    }`);
        }
    }

    const source = `/** @target web */
${Array.from(imports.entries())
    .map(([name, module]) => `import { ${name} } from ${JSON.stringify(module)};`)
    .join('\n')}

/**
 * Fills every serialized property with a value other than its default.
 */
export interface SerializerFillCase {
    name: string;
    serializer: {
        toJson(obj: any): Map<string, unknown> | null;
        fromJson(obj: any, m: unknown): void;
        write(obj: any, w: IObjectWriter): void;
        read(obj: any, r: IObjectReader): void;
    };
    create(): unknown;
    fill(obj: unknown): void;
}

export class SerializerFill {
    public static readonly cases: SerializerFillCase[] = [
        ${cases.join(',\n')}
    ];

    /**
     * The serialized properties per class that are not filled (raw, union and deprecated alias values), by their JSON names.
     */
    public static readonly unfilled: Map<string, string[]> = new Map<string, string[]>([${unfilledLines.join(', ')}]);

    public static otherEnumValue(enumType: Record<string, unknown>, current: unknown): number {
        const values = Object.values(enumType).filter(v => typeof v === 'number') as number[];
        return values.find(v => v !== current && v !== 0) ?? values.find(v => v !== current)!;
    }
${methods.join('\n')}
}
`;
    generateFile(
        program,
        ts.createSourceFile('SerializerFill.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS),
        '../../test/generated/SerializerFill.ts'
    );
}
