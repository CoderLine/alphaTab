import * as ts from 'typescript';
import { addNewLines, createNodeFromSource, setMethodBody } from '../BuilderHelpers';

function generateFromJsonBody(isStrict: boolean, importer: (name: string, module: string) => void) {
    importer('JsonHelper', '@src/io/JsonHelper');
    return ts.factory.createBlock(addNewLines([
        createNodeFromSource<ts.IfStatement>(`if(!m) { 
            return; 
        }`, ts.SyntaxKind.IfStatement),
        isStrict
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
    isStrict: boolean,
    importer: (name: string, module: string) => void
) {
    const methodDecl = createNodeFromSource<ts.MethodDeclaration>(
        `public class Serializer {
            public static fromJson(obj: ${input.name!.text}, m: unknown): void {
            }
        }`,
        ts.SyntaxKind.MethodDeclaration
    );
    return setMethodBody(methodDecl, generateFromJsonBody(isStrict, importer));
}
