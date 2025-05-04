import * as ts from 'typescript';
import { createNodeFromSource, setMethodBody } from '../BuilderHelpers';
import type { TypeSchema } from './TypeSchema';

function generateFromJsonBody(
    input: ts.ClassDeclaration,
    serializable: TypeSchema,
    importer: (name: string, module: string) => void
) {
    importer('JsonHelper', '@src/io/JsonHelper');

    const serializerName = `${input.name!.text}Serializer`;
    return ts.factory.createBlock(
        [
            createNodeFromSource<ts.IfStatement>(
                `if(!m) { 
            return; 
        }`,
                ts.SyntaxKind.IfStatement
            ),
            serializable.isStrict
                ? createNodeFromSource<ts.ExpressionStatement>(
                      `JsonHelper.forEach(m, (v, k) => ${serializerName}.setProperty(obj, k, v));`,
                      ts.SyntaxKind.ExpressionStatement
                  )
                : createNodeFromSource<ts.ExpressionStatement>(
                      `JsonHelper.forEach(m, (v, k) => ${serializerName}.setProperty(obj, k.toLowerCase(), v));`,
                      ts.SyntaxKind.ExpressionStatement
                  )
        ],
        true
    );
}

export function createFromJsonMethod(
    input: ts.ClassDeclaration,
    serializable: TypeSchema,
    importer: (name: string, module: string) => void
) {
    const methodDecl = createNodeFromSource<ts.MethodDeclaration>(
        `public class Serializer {
            public static fromJson(obj: ${input.name!.text}, m: unknown): void {
            }
        }`,
        ts.SyntaxKind.MethodDeclaration
    );
    return setMethodBody(methodDecl, generateFromJsonBody(input, serializable, importer));
}
