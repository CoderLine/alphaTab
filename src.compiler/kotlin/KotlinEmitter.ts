import * as ts from 'typescript';
import CSharpAstTransformer from '../csharp/CSharpAstTransformer';
import CSharpEmitterContext from '../csharp/CSharpEmitterContext';
import KotlinAstPrinter from './KotlinAstPrinter';

export default function emit(program: ts.Program, diagnostics: ts.Diagnostic[]) {
    const context = new CSharpEmitterContext(program);
    context.noPascalCase = true;
    
    console.log('[Kotlin] Transforming to Kotlin AST');
    program.getRootFileNames().forEach(file => {
        const sourceFile = program.getSourceFile(file)!;
        const transformer = new CSharpAstTransformer(sourceFile, context);
        transformer.transform();
    });


    console.log('[Kotlin] Resolving types');
    context.resolveAllUnresolvedTypeNodes();
    context.rewriteVisibilities();

    if (!context.hasErrors) {
        console.log('[Kotlin] Writing Result');
        context.csharpFiles.forEach(file => {
            const printer = new KotlinAstPrinter(file, context);
            printer.print();
            diagnostics.push(...printer.diagnostics);
        })
    }

    diagnostics.push(...context.diagnostics);
}