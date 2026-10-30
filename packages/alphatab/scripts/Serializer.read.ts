import {
    findSerializerModule,
    type Importer,
    isNullableOrOptional,
    isPrimitiveForSerialization,
    isStrictType,
    jsonAddMethod,
    primaryJsonName,
    printTypeNode,
    serializedFields,
    wrapTarget
} from './Serializer.common';
import type { TypeProperty, TypeSchema, TypeWithNullableInfo } from './TypeSchema';

/**
 * The typed reader call for a value of the given type, a cast `readValue` for everything without a typed call.
 */
function readValueExpr(type: TypeWithNullableInfo, r: string): string {
    if (type.isPrimitiveType && !isNullableOrOptional(type)) {
        switch (type.typeAsString) {
            case 'number':
                return `${r}.readNumber()`;
            case 'boolean':
                return `${r}.readBoolean()`;
            case 'string':
                return `${r}.readString()`;
        }
    }
    return isNullableOrOptional(type)
        ? `${r}.readValue() as ${printTypeNode(type)}`
        : `${r}.readValue()! as ${printTypeNode(type)}`;
}

function enumExpr(type: TypeWithNullableInfo, value: string, importer: Importer): string {
    importer(type.typeAsString, type.modulePath);
    importer('JsonHelper', '@coderline/alphatab/io/JsonHelper');
    const parse = `JsonHelper.parseEnum<${type.typeAsString}>(${value}, ${type.typeAsString})`;
    if (type.isNullable) {
        return `${parse} ?? null`;
    }
    if (type.isOptional) {
        return parse;
    }
    return `${parse}!`;
}

function constructExpr(type: TypeWithNullableInfo, importer: Importer): string {
    if (type.isRecord) {
        return '{}';
    }
    importer(type.typeAsString, type.modulePath);
    return `new ${type.typeAsString}()`;
}

/**
 * How a child record is read: `strict` classes read non-strict children with the user-input reader, as user input
 * does not use their canonical keys; `nonStrict` classes decide at runtime through their `flexible` parameter.
 */
type ReadContext = 'strict' | 'nonStrict' | 'flexible' | 'canonical';

function childRead(type: TypeWithNullableInfo, target: string, r: string, ctx: ReadContext, importer: Importer): string {
    const itemSerializer = `${type.typeAsString}Serializer`;
    importer(itemSerializer, findSerializerModule(type));
    if (isStrictType(type)) {
        return `${itemSerializer}.read(${target}, ${r});`;
    }
    switch (ctx) {
        case 'strict':
        case 'flexible':
            return `${itemSerializer}.readFlexible(${target}, ${r});`;
        case 'canonical':
            return `${itemSerializer}.read(${target}, ${r});`;
        case 'nonStrict':
            return `if (flexible) {\n${itemSerializer}.readFlexible(${target}, ${r});\n} else {\n${itemSerializer}.read(${target}, ${r});\n}`;
    }
}

function mapRead(prop: TypeProperty, ctx: ReadContext, importer: Importer): string {
    const type = prop.type;
    const field = `obj.${prop.name}`;
    const keyType = type.typeArguments![0];
    const valueType = type.typeArguments![1];

    let key: string;
    if (keyType.isEnumType) {
        key = enumExpr({ ...keyType, isNullable: false, isOptional: false }, 'k', importer);
    } else if (keyType.isNumberType) {
        key = 'Number.parseInt(k)';
    } else {
        key = 'k';
    }

    let prepare = '';
    let value: string;
    if (valueType.isEnumType) {
        value = enumExpr(valueType, 'rr.readValue()', importer);
    } else if (isPrimitiveForSerialization(valueType)) {
        value = readValueExpr(valueType, 'rr');
    } else if (valueType.isJsonImmutable) {
        importer(valueType.typeAsString, valueType.modulePath);
        value = `${valueType.typeAsString}.fromJson(rr.readValue())${isNullableOrOptional(valueType) ? '' : '!'}`;
    } else {
        prepare = `const i = ${constructExpr(valueType, importer)};\n${childRead(valueType, 'i', 'rr', ctx, importer)}\n`;
        value = 'i';
    }

    const add = jsonAddMethod(prop);
    const set = add
        ? `obj.${add}(${key}, ${value});`
        : `${field}${isNullableOrOptional(type) ? '!' : ''}.set(${key}, ${value});`;

    const create = prop.isReadOnly
        ? ''
        : `${field} = new Map<${printTypeNode(keyType)}, ${printTypeNode(valueType)}>();\n`;
    return `${create}r.readObject((k, rr) => {\n${prepare}${set}\nreturn true;\n});`;
}

function setRead(prop: TypeProperty, importer: Importer): string {
    const type = prop.type;
    const field = `obj.${prop.name}`;
    const itemType = type.typeArguments![0];
    const add = jsonAddMethod(prop);
    if (isPrimitiveForSerialization(itemType)) {
        const elementType = itemType.typeAsString;
        return add
            ? `for (const i of (r.readValue() as ${elementType}[])) {\nobj.${add}(i);\n}`
            : `${field} = new Set<${elementType}>(r.readValue() as ${elementType}[]);`;
    }
    if (itemType.isEnumType) {
        const item = enumExpr({ ...itemType, isNullable: false, isOptional: false }, 'i', importer);
        if (add) {
            return `for (const i of (r.readValue() as number[])) {\nobj.${add}(${item});\n}`;
        }
        return `{\nconst s = new Set<${itemType.typeAsString}>();\nfor (const i of (r.readValue() as number[])) {\ns.add(${item});\n}\n${field} = s;\n}`;
    }
    throw new Error(`Unsupported set type: ${type.typeAsString}`);
}

/**
 * Reads a nested record that has no dedicated branch.
 */
function nestedRead(prop: TypeProperty, importer: Importer, nullValue: string, ctx: ReadContext): string {
    const type = prop.type;
    const field = `obj.${prop.name}`;
    if (!isNullableOrOptional(type)) {
        return childRead(type, field, 'r', ctx, importer);
    }
    return `if (r.isNullish()) {\n${field} = ${nullValue};\n} else {\n${field} = ${constructExpr(type, importer)};\n${childRead(type, field, 'r', ctx, importer)}\n}`;
}

/**
 * Whether the property is a nested record of a non-strict class, which supports partial names on user input.
 */
function isFlexibleNested(prop: TypeProperty): boolean {
    const type = prop.type;
    return !(
        prop.isUnsetAsNaN ||
        (!prop.asRaw && type.isUnionType) ||
        prop.asRaw ||
        isPrimitiveForSerialization(type) ||
        type.isEnumType ||
        type.isArray ||
        type.isMap ||
        type.isSet ||
        type.isJsonImmutable
    );
}

function propertyRead(serializable: TypeSchema, prop: TypeProperty, importer: Importer): string {
    const type = prop.type;
    const ctx: ReadContext = serializable.isStrict ? 'strict' : 'nonStrict';
    const field = `obj.${prop.name}`;

    if (prop.isUnsetAsNaN) {
        return `${field} = r.isNullish() ? Number.NaN : r.readNumber();`;
    }
    if (!prop.asRaw && type.isUnionType) {
        return `${field} = ${isNullableOrOptional(type) ? 'r.readValue()' : 'r.readValue()!'} as ${printTypeNode(type)};`;
    }
    if (prop.asRaw || isPrimitiveForSerialization(type)) {
        return `${field} = ${readValueExpr(type, 'r')};`;
    }
    if (type.isEnumType) {
        return `${field} = ${enumExpr(type, 'r.readValue()', importer)};`;
    }
    if (type.isArray) {
        const itemType = type.arrayItemType!;
        if (!itemType.isOwnType || itemType.isEnumType) {
            return `${field} = ${readValueExpr(type, 'r')};`;
        }
        const add = jsonAddMethod(prop) ?? `${prop.name}.push`;
        const read = `${field} = [];\nr.readArray(rr => {\nconst i = ${constructExpr(itemType, importer)};\n${childRead(itemType, 'i', 'rr', ctx, importer)}\nobj.${add}(i);\n});`;
        return isNullableOrOptional(type) ? `if (!r.isNullish()) {\n${read}\n}` : read;
    }
    if (type.isMap) {
        return mapRead(prop, ctx, importer);
    }
    if (type.isSet) {
        return setRead(prop, importer);
    }
    if (type.isJsonImmutable) {
        importer(type.typeAsString, type.modulePath);
        return `${field} = ${type.typeAsString}.fromJson(r.readValue())${isNullableOrOptional(type) ? '' : '!'};`;
    }
    if (serializable.isStrict) {
        return nestedRead(prop, importer, type.isNullable ? 'null' : 'undefined', ctx);
    }
    // user input reaches these through readFlexibleProperty
    return nestedRead(prop, importer, type.isOptional ? 'undefined' : 'null', 'canonical');
}

function caseClause(prop: TypeProperty, label: string, code: string): string {
    return `${prop.target ? '/*@target web*/\n' : ''}case ${label}:\n${code}`;
}

/**
 * The user-input reader of a non-strict class: keys are lowercased, nested records also take their own keys
 * prefixed by their name (partial names) or without prefix (on parent).
 */
function createFlexibleMethods(className: string, serializable: TypeSchema, importer: Importer): string {
    const serializer = `${className}Serializer`;
    const nested = serializable.properties.filter(p => primaryJsonName(p) !== undefined && isFlexibleNested(p));
    const nestedNames = nested.map(p => primaryJsonName(p)!);

    const body: string[] = [];
    if (nestedNames.length > 0) {
        body.push(
            `if (${JSON.stringify(nestedNames)}.indexOf(property) < 0 && ${serializer}.readProperty(obj, property, r, true)) {\nreturn true;\n}`
        );
    } else {
        body.push(`if (${serializer}.readProperty(obj, property, r, true)) {\nreturn true;\n}`);
    }

    for (const prop of nested) {
        const type = prop.type;
        const field = `obj.${prop.name}`;
        const names = JSON.stringify(prop.jsonNames.map(n => n.toLowerCase()));
        const itemSerializer = `${type.typeAsString}Serializer`;
        importer(itemSerializer, findSerializerModule(type));
        const code: string[] = [
            `if (${names}.indexOf(property) >= 0) {\n${nestedRead(prop, importer, type.isOptional ? 'undefined' : 'null', 'flexible')}\nreturn true;\n}`
        ];
        if (prop.partialNames) {
            if (isStrictType(type)) {
                // strict classes resolve keys only through the fields their read method passes to the reader
                throw new Error(`@json_partial_names is only supported on non-strict types: ${className}.${prop.name}`);
            }
            const create = isNullableOrOptional(type)
                ? `if (!${field}) {\n${field} = ${constructExpr(type, importer)};\n}\n`
                : '';
            const target = isNullableOrOptional(type) ? `${field}!` : field;
            code.push(
                `for (const c of ${names}) {\nif (property.indexOf(c) === 0) {\n${create}if (${itemSerializer}.readFlexibleProperty(${target}, property.substring(c.length), r)) {\nreturn true;\n}\n}\n}`
            );
        }
        body.push(wrapTarget(prop, code.join('\n')));
    }

    return `
    public static readFlexible(obj: ${className}, r: IObjectReader): void {
        r.readRecord(null, (id, k, rr) => id >= 0 ? ${serializer}._readField(obj, id, rr, false) : ${serializer}.readFlexibleProperty(obj, k.toLowerCase(), rr));
    }
    public static readFlexibleProperty(obj: ${className}, property: string, r: IObjectReader): boolean {
        ${body.join('\n')}
        return false;
    }`;
}

export function createReadMethods(className: string, serializable: TypeSchema, importer: Importer): string {
    importer('IObjectReader', '@coderline/alphatab/io/IObjectReader', true);
    importer('RecordFields', '@coderline/alphatab/io/RecordFields');
    const serializer = `${className}Serializer`;

    if (!serializable.isStrict && (serializable.hasAfterFromJsonExtension || serializable.hasSetPropertyExtension)) {
        throw new Error(`Serialization hooks are only supported on @json_strict classes: ${className}`);
    }

    const flexibleArg = serializable.isStrict ? '' : ', false';
    const flexibleParam = serializable.isStrict ? '' : ', flexible: boolean';
    const flexiblePass = serializable.isStrict ? '' : ', flexible';
    const names: string[] = [];
    const fieldCases: string[] = [];
    // A closure in _readField would make V8 allocate a context on every call, so properties read through
    // closures get their own method.
    const helpers: string[] = [];
    const fields = serializedFields(serializable);
    for (let id = 0; id < fields.length; id++) {
        const prop = fields[id];
        let code = propertyRead(serializable, prop, importer);
        if (code.includes('=>')) {
            const helper = `_read${prop.name.charAt(0).toUpperCase()}${prop.name.substring(1)}`;
            const target = prop.target ? '/**\n * @target web\n */\n' : '';
            helpers.push(
                `${target}private static ${helper}(obj: ${className}, r: IObjectReader${flexibleParam}): void {\n${code}\n}`
            );
            code = `${serializer}.${helper}(obj, r${flexiblePass});`;
        }
        names.push(primaryJsonName(prop)!);
        fieldCases.push(caseClause(prop, String(id), `${code}\nreturn true;`));
    }

    const after = serializable.hasAfterFromJsonExtension ? '\nobj.afterFromJson();' : '';
    const fieldSwitch = fieldCases.length > 0 ? `switch (id) {\n${fieldCases.join('\n')}\n}` : '';

    // strict classes read fields only in read, so the switch is its handler; non-strict ones also read them through
    // readProperty and readFlexible (user input with partial names, see createFlexibleMethods)
    const hookFallback = serializable.hasSetPropertyExtension ? 'id < 0 ? obj.setProperty(k, r) : false' : 'false';
    const readHandler = serializable.isStrict
        ? `(id, k, r) => {\n${fieldSwitch}\nreturn ${hookFallback};\n}`
        : `(id, k, rr) => ${serializer}._readField(obj, id, rr${flexibleArg})`;
    const readField = serializable.isStrict
        ? ''
        : `
    private static _readField(obj: ${className}, id: number, r: IObjectReader${flexibleParam}): boolean {
        ${fieldSwitch}
        return false;
    }`;
    const readProperty = serializable.isStrict
        ? ''
        : `
    public static readProperty(obj: ${className}, property: string, r: IObjectReader${flexibleParam}): boolean {
        const id = ${serializer}._fields.idOf(property);
        return id >= 0 ? ${serializer}._readField(obj, id, r${flexiblePass}) : false;
    }`;

    if (serializable.isJsonRoot) {
        importer('MapObjectReader', '@coderline/alphatab/io/MapObjectReader');
    }
    const wrapper =
        !serializable.isJsonRoot
            ? ''
            : `
    public static fromJson(obj: ${className}, m: unknown): void {
        if (!m) {
            return;
        }
        ${serializer}.${serializable.isStrict ? 'read' : 'readFlexible'}(obj, new MapObjectReader(m));
    }`;
    return `
    private static readonly _fields: RecordFields = new RecordFields(${JSON.stringify(names)});${wrapper}
    public static read(obj: ${className}, reader: IObjectReader): void {
        reader.readRecord(${serializer}._fields, ${readHandler});${after}
    }${readProperty}${readField}
    ${helpers.join('\n')}${serializable.isStrict ? '' : createFlexibleMethods(className, serializable, importer)}`;
}
