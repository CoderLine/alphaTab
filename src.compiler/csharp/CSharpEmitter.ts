import path from 'path';
import * as ts from 'typescript';
import * as cs from './CSharpAst';
import CSharpAstTransformer from './CSharpAstTransformer';
import CSharpEmitterContext from './CSharpEmitterContext';
import CSharpAstPrinter from './CSharpAstPrinter';

export default function emit(program: ts.Program): ts.Diagnostic[] {
    const diagnostics: ts.Diagnostic[] = [];

    const context = new CSharpEmitterContext(program);

    program.getRootFileNames().forEach(file => {
        const sourceFile = program.getSourceFile(file)!;
        const transformer = new CSharpAstTransformer(sourceFile, context);
        transformer.transform();
    });

    context.resolveAllUnresolvedTypeNodes();

    if (!context.hasErrors) {
        context.csharpFiles.forEach(file => {
            const printer = new CSharpAstPrinter(file, context);
            printer.print();
            diagnostics.push(...printer.diagnostics);
        })
    }

    diagnostics.push(...context.diagnostics);

    return diagnostics;
}