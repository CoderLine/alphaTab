import * as ts from 'typescript';
import KotlinAstPrinter from './KotlinAstPrinter';
import KotlinAstTransformer from './KotlinAstTransformer';
import KotlinEmitterContext from './KotlinEmitterContext';

export default function emit(program: ts.Program, diagnostics: ts.Diagnostic[]) {
    const context = new KotlinEmitterContext(program);
    
    console.log('[Kotlin] Transforming to Kotlin AST');
    program.getRootFileNames().forEach(file => {
        const sourceFile = program.getSourceFile(file)!;
        const transformer = new KotlinAstTransformer(sourceFile, context);
        transformer.transform();
    });

    console.log('[Kotlin] Resolving types');
    context.resolveAllUnresolvedTypeNodes();
    context.rewriteVisibilities();

    if (!context.hasErrors) {
        console.log('[Kotlin] Writing Result');
        context.csharpFiles.forEach(file => {
            // console.log(`[Kotlin] ${file.fileName} ${file.namespace.declarations.map(d=>d.name).join(', ')}`)
            const printer = new KotlinAstPrinter(file, context);
            printer.print();
            diagnostics.push(...printer.diagnostics);
        })
    }

    diagnostics.push(...context.diagnostics);
}