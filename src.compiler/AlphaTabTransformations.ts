import * as ts from 'typescript';
import { rewriteClassForCloneable } from './CloneBuilder'
import { rewriteClassForJsonSerialization } from './JsonSerializationBuilder'

export default function (program: ts.Program) {
    return (ctx: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            function visitor(node: ts.Node): ts.Node {
                if (ts.isClassDeclaration(node)) {
                    const isClonable = ts.getJSDocTags(node).find(t => t.tagName.text === 'cloneable');
                    const isJson = ts.getJSDocTags(node).find(t => t.tagName.text === 'json');
                    if (isClonable) {
                        node = rewriteClassForCloneable(node, ctx.factory, program.getTypeChecker());
                    }

                    if (isJson) {
                        node = rewriteClassForJsonSerialization(program, node as ts.ClassDeclaration, sourceFile, ctx.factory);
                    }
                }

                return node;
            }

            return ts.visitEachChild(sourceFile, visitor, ctx);
        };
    };
}
