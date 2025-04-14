import type * as ts from 'typescript';
import CSharpAstTransformer from './CSharpAstTransformer';
import CSharpEmitterContext from './CSharpEmitterContext';
import CSharpAstPrinter from './CSharpAstPrinter';
import { transpileFilter } from '../BuilderHelpers';

export default function emit(program: ts.Program, diagnostics: ts.Diagnostic[]) {
    const context = new CSharpEmitterContext(program);
    console.log('[C#] Transforming to C# AST');
    for (const file of program.getRootFileNames().filter(transpileFilter)) {
        const sourceFile = program.getSourceFile(file)!;
        const transformer = new CSharpAstTransformer(sourceFile, context);
        transformer.transform();
    }

    console.log('[C#] Resolving types');
    context.resolveAllUnresolvedTypeNodes();
    context.rewriteVisibilities();

    if (!context.hasErrors) {
        console.log(`[C#] Writing Result to ${context.compilerOptions.outDir!} (${context.csharpFiles.length} files)`);
        for (const file of context.csharpFiles) {
            const printer = new CSharpAstPrinter(file, context);
            printer.print();
            diagnostics.push(...printer.diagnostics);
        }
    }

    diagnostics.push(...context.diagnostics);
}
