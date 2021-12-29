import * as ts from 'typescript';
import { addNewLines, createNodeFromSource, setMethodBody } from '../BuilderHelpers';
import { JsonSerializable } from './Serializer.common';

function generateFromJsonBody(serializable: JsonSerializable, importer: (name: string, module: string) => void) {
    importer('JsonHelper', '@src/io/JsonHelper');
    return ts.factory.createBlock(addNewLines([
        createNodeFromSource<ts.IfStatement>(`if(!m) { 
            return; 
        }`, ts.SyntaxKind.IfStatement),
        serializable.isStrict
            ? createNodeFromSource<ts.ExpressionStatement>(
                `JsonHelper.forEach(m, (v, k) => this.setProperty(obj, k, v));`,
                ts.SyntaxKind.ExpressionStatement
            )
            : createNodeFromSource<ts.ExpressionStatement>(
                `JsonHelper.forEach(m, (v, k) => this.setProperty(obj, k.toLowerCase(), v));`,
                ts.SyntaxKind.ExpressionStatement
            )
    ]));
}

export function createFromJsonMethod(
    input: ts.ClassDeclaration,
    serializable: JsonSerializable,
    importer: (name: string, module: string) => void
) {
    const methodDecl = createNodeFromSource<ts.MethodDeclaration>(
        `public class Serializer {
            public static fromJson(obj: ${input.name!.text}, m: unknown): void {
            }
        }`,
        ts.SyntaxKind.MethodDeclaration
    );
    return setMethodBody(methodDecl, generateFromJsonBody(serializable, importer));
}
