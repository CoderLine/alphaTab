import {
    findSerializerModule,
    type Importer,
    isNullableOrOptional,
    isPrimitiveForSerialization,
    primaryJsonName,
    serializedFields,
    wrapTarget
} from './Serializer.common';
import type { TypeProperty, TypeSchema, TypeWithNullableInfo } from './TypeSchema';

/**
 * The typed writer call for a value of the given type, `writeValue` for everything without a typed call.
 */
function writeValueCall(type: TypeWithNullableInfo, expr: string): string {
    if (type.isPrimitiveType && !isNullableOrOptional(type)) {
        switch (type.typeAsString) {
            case 'number':
                return `w.writeNumber(${expr});`;
            case 'boolean':
                return `w.writeBoolean(${expr});`;
            case 'string':
                return `w.writeString(${expr});`;
        }
    }
    return `w.writeValue(${expr});`;
}

function nullGuard(type: TypeWithNullableInfo, field: string, code: string): string {
    if (type.isNullable) {
        return `if (${field} !== null) {\n${code}\n}`;
    }
    if (type.isOptional) {
        return `if (${field} !== undefined) {\n${code}\n}`;
    }
    return code;
}

function mapValueWrite(valueType: TypeWithNullableInfo, importer: Importer): string {
    if (valueType.isEnumType) {
        return valueType.isNullable || valueType.isOptional
            ? 'w.writeValue(v as number | null | undefined);'
            : 'w.writeNumber(v as number);';
    }
    if (isPrimitiveForSerialization(valueType)) {
        return writeValueCall(valueType, 'v');
    }
    if (valueType.isJsonImmutable) {
        importer(valueType.typeAsString, valueType.modulePath);
        return `w.writeValue(${valueType.typeAsString}.toJson(v));`;
    }
    const itemSerializer = `${valueType.typeAsString}Serializer`;
    importer(itemSerializer, findSerializerModule(valueType));
    return `${itemSerializer}.write(v, w);`;
}

function propertyWrite(serializable: TypeSchema, prop: TypeProperty, id: number, importer: Importer): string | null {
    if (prop.isJsonReadOnly) {
        return null;
    }

    const key = `w.field(${id}, ${JSON.stringify(primaryJsonName(prop))});`;
    const field = `obj.${prop.name}`;
    const type = prop.type;

    if (prop.isUnsetAsNaN) {
        return `if (!Number.isNaN(${field})) {\n${key}\nw.writeNumber(${field});\n}`;
    }
    if (prop.asRaw || type.isPrimitiveType || type.isTypedArray) {
        return `${key}\n${writeValueCall(type, field)}`;
    }
    if (type.isEnumType) {
        if (type.isNullable) {
            return `${key}\nw.writeValue(${field} as number | null);`;
        }
        if (type.isOptional) {
            return `${key}\nw.writeValue(${field} as number | undefined);`;
        }
        return `${key}\nw.writeNumber(${field} as number);`;
    }
    if (type.isArray) {
        const itemType = type.arrayItemType!;
        if (itemType.isOwnType && !itemType.isEnumType) {
            const itemSerializer = `${itemType.typeAsString}Serializer`;
            importer(itemSerializer, findSerializerModule(itemType));
            return nullGuard(
                type,
                field,
                `${key}\nw.startArray(${field}!.length);\nfor (const i of ${field}!) {\n${itemSerializer}.write(i, w);\n}\nw.endArray();`
            );
        }
        return `${key}\nw.writeValue(${field});`;
    }
    if (type.isMap) {
        const valueWrite = mapValueWrite(type.typeArguments![1], importer);
        return nullGuard(
            type,
            field,
            `${key}\nw.startMap();\nfor (const [k, v] of ${field}!) {\nw.prop(k.toString());\n${valueWrite}\n}\nw.endMap();`
        );
    }
    if (type.isSet) {
        const itemType = type.typeArguments![0];
        let collect: string;
        if (itemType.isPrimitiveType) {
            collect = `const a: ${itemType.typeAsString}[] = [];\nfor (const v of ${field}!) {\na.push(v);\n}`;
        } else if (itemType.isEnumType) {
            collect = `const a: number[] = [];\nfor (const v of ${field}!) {\na.push(v as number);\n}`;
        } else {
            throw new Error(
                `only Set<Primitive> and Set<Enum> sets are supported, extend if needed! Found ${type.typeAsString}`
            );
        }
        return nullGuard(type, field, `${collect}\n${key}\nw.writeValue(a);`);
    }
    if (type.isJsonImmutable) {
        importer(type.typeAsString, type.modulePath);
        return `${key}\nw.writeValue(${type.typeAsString}.toJson(${field}));`;
    }

    const itemSerializer = `${type.typeAsString}Serializer`;
    importer(itemSerializer, findSerializerModule(type));
    const write = `${key}\n${itemSerializer}.write(${field}, w);`;
    // non-strict (settings) containers write unset non-record children as null
    const skipUnset = serializable.isStrict ? isNullableOrOptional(type) : type.isRecord && isNullableOrOptional(type);
    return skipUnset ? `if (${field}) {\n${write}\n}` : write;
}

export function createWriteMethods(className: string, serializable: TypeSchema, importer: Importer): string {
    importer('IObjectWriter', '@coderline/alphatab/io/IObjectWriter', true);
    importer('MapObjectWriter', '@coderline/alphatab/io/MapObjectWriter');

    const body: string[] = [];
    const fields = serializedFields(serializable);
    for (let id = 0; id < fields.length; id++) {
        const prop = fields[id];
        const code = propertyWrite(serializable, prop, id, importer);
        if (code !== null) {
            body.push(wrapTarget(prop, code));
        }
    }
    if (serializable.hasToJsonExtension) {
        body.push('obj.toJson(w);');
    }

    return `
    public static toJson(obj: ${className} | null | undefined): Map<string, unknown> | null {
        const w = new MapObjectWriter();
        ${className}Serializer.write(obj, w);
        return w.result as Map<string, unknown> | null;
    }
    public static write(obj: ${className} | null | undefined, w: IObjectWriter): void {
        if (!obj) {
            w.writeNull();
            return;
        }
        w.startObject();
        ${body.join('\n')}
        w.endObject();
    }`;
}
