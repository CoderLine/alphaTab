import {
    findSerializerModule,
    type Importer,
    isNullableOrOptional,
    isPrimitiveForSerialization,
    primaryJsonName,
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

function propertyWrite(serializable: TypeSchema, prop: TypeProperty, importer: Importer): string | null {
    const jsonName = primaryJsonName(prop);
    if (!jsonName || prop.isJsonReadOnly) {
        return null;
    }

    const key = JSON.stringify(jsonName);
    const field = `obj.${prop.name}`;
    const type = prop.type;

    if (prop.isUnsetAsNaN) {
        return `if (!Number.isNaN(${field})) {\nw.prop(${key});\nw.writeNumber(${field});\n}`;
    }
    if (prop.asRaw || type.isPrimitiveType || type.isTypedArray) {
        return `w.prop(${key});\n${writeValueCall(type, field)}`;
    }
    if (type.isEnumType) {
        if (type.isNullable) {
            return `w.prop(${key});\nw.writeValue(${field} as number | null);`;
        }
        if (type.isOptional) {
            return `w.prop(${key});\nw.writeValue(${field} as number | undefined);`;
        }
        return `w.prop(${key});\nw.writeNumber(${field} as number);`;
    }
    if (type.isArray) {
        const itemType = type.arrayItemType!;
        if (itemType.isOwnType && !itemType.isEnumType) {
            const itemSerializer = `${itemType.typeAsString}Serializer`;
            importer(itemSerializer, findSerializerModule(itemType));
            return nullGuard(
                type,
                field,
                `w.prop(${key});\nw.startArray(${field}!.length);\nfor (const i of ${field}!) {\n${itemSerializer}.write(i, w);\n}\nw.endArray();`
            );
        }
        return `w.prop(${key});\nw.writeValue(${field});`;
    }
    if (type.isMap) {
        const valueWrite = mapValueWrite(type.typeArguments![1], importer);
        return nullGuard(
            type,
            field,
            `w.prop(${key});\nw.startMap();\nfor (const [k, v] of ${field}!) {\nw.prop(k.toString());\n${valueWrite}\n}\nw.endMap();`
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
        return nullGuard(type, field, `${collect}\nw.prop(${key});\nw.writeValue(a);`);
    }
    if (type.isJsonImmutable) {
        importer(type.typeAsString, type.modulePath);
        return `w.prop(${key});\nw.writeValue(${type.typeAsString}.toJson(${field}));`;
    }

    const itemSerializer = `${type.typeAsString}Serializer`;
    importer(itemSerializer, findSerializerModule(type));
    const write = `w.prop(${key});\n${itemSerializer}.write(${field}, w);`;
    // non-strict (settings) containers write unset non-record children as null
    const skipUnset = serializable.isStrict ? isNullableOrOptional(type) : type.isRecord && isNullableOrOptional(type);
    return skipUnset ? `if (${field}) {\n${write}\n}` : write;
}

export function createWriteMethods(className: string, serializable: TypeSchema, importer: Importer): string {
    importer('IObjectWriter', '@coderline/alphatab/io/IObjectWriter', true);
    importer('MapObjectWriter', '@coderline/alphatab/io/MapObjectWriter');

    const body: string[] = [];
    for (const prop of serializable.properties) {
        const code = propertyWrite(serializable, prop, importer);
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
