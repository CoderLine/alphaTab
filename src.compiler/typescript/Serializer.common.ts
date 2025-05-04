import type { TypeWithNullableInfo } from './TypeSchema';

export function findSerializerModule(type: TypeWithNullableInfo) {
    const module = type.modulePath;
    const importPath = module.split('/');
    importPath.splice(1, 0, 'generated');
    importPath[importPath.length - 1] = `${type.typeAsString}Serializer`;
    return importPath.join('/');
}
