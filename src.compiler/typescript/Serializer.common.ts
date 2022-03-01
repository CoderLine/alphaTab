import * as ts from 'typescript';
import * as path from 'path';

export interface JsonProperty {
    partialNames: boolean;
    property: ts.PropertyDeclaration;
    jsonNames: string[];
    target?: string;
    isReadOnly: boolean;
}

export interface JsonSerializable {
    isStrict: boolean;
    hasToJsonExtension: boolean;
    hasSetPropertyExtension: boolean;
    properties: JsonProperty[];
}


export function isImmutable(type: ts.Type | null): boolean {
    if (!type || !type.symbol) {
        return false;
    }

    const declaration = type.symbol.valueDeclaration;
    if (declaration) {
        return !!ts.getJSDocTags(declaration).find(t => t.tagName.text === 'json_immutable');
    }

    return false;
}

export function createStringUnknownMapNode(): ts.TypeNode {
    return ts.factory.createTypeReferenceNode('Map', [
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
    ]);
}

function removeExtension(fileName: string) {
    return fileName.substring(0, fileName.lastIndexOf('.'));
}

export function toImportPath(fileName: string) {
    return '@' + removeExtension(fileName).split('\\').join('/');
}

export function findModule(type: ts.Type, options: ts.CompilerOptions) {
    if (type.symbol && type.symbol.declarations) {
        for (const decl of type.symbol.declarations) {
            const file = decl.getSourceFile();
            if (file) {
                const relative = path.relative(path.join(path.resolve(options.baseUrl!)), path.resolve(file.fileName));
                return toImportPath(relative);
            }
        }

        return './' + type.symbol.name;
    }

    return '';
}

export function findSerializerModule(type: ts.Type, options: ts.CompilerOptions) {
    let module = findModule(type, options);
    const importPath = module.split('/');
    importPath.splice(1, 0, 'generated');
    importPath[importPath.length - 1] = type.symbol!.name + 'Serializer';
    return importPath.join('/');
}
