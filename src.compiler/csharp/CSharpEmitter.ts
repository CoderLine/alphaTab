import * as ts from 'typescript';
import CSharpAstTransformer from './CSharpAstTransformer';
import CSharpEmitterContext from './CSharpEmitterContext';
import CSharpAstPrinter from './CSharpAstPrinter';

export default function emit(program: ts.Program, diagnostics: ts.Diagnostic[]) {
    const context = new CSharpEmitterContext(program);
    console.log('[C#] Transforming to C# AST');
    program.getRootFileNames().forEach(file => {
        const sourceFile = program.getSourceFile(file)!;
        const transformer = new CSharpAstTransformer(sourceFile, context);
        transformer.transform();
    });


    console.log('[C#] Resolving types');
    context.resolveAllUnresolvedTypeNodes();
    context.rewriteVisibilities();

    if (!context.hasErrors) {
        console.log('[C#] Writing Result');
        context.csharpFiles.forEach(file => {
            const printer = new CSharpAstPrinter(file, context);
            printer.print();
            diagnostics.push(...printer.diagnostics);
        })
    }

    diagnostics.push(...context.diagnostics);
}