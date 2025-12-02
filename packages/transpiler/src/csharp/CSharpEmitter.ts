import type ts from 'typescript';
import { transpileFilter } from '../BuilderHelpers';
import CSharpAstPrinter from './CSharpAstPrinter';
import CSharpAstTransformer from './CSharpAstTransformer';
import CSharpEmitterContext from './CSharpEmitterContext';

export default function createEmit(
    srcOutDir: string,
    testOutDir: string
) {
    return (program: ts.Program, diagnostics: ts.Diagnostic[]) => {
        const context = new CSharpEmitterContext(program, srcOutDir, testOutDir);
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
            console.log(`[C#] Writing Results (${context.csharpFiles.length} files)`);
            for (const file of context.csharpFiles) {
                const printer = new CSharpAstPrinter(file, context);
                printer.print();
                diagnostics.push(...printer.diagnostics);
            }
        }

        diagnostics.push(...context.diagnostics);
    };
}
