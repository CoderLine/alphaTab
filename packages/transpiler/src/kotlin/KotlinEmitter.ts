import type ts from 'typescript';
import { transpileFilter } from '../BuilderHelpers';
import KotlinAstPrinter from './KotlinAstPrinter';
import KotlinAstTransformer from './KotlinAstTransformer';
import KotlinEmitterContext from './KotlinEmitterContext';

export default function createEmit(srcOutDir: string, testOutDir: string) {
    return (program: ts.Program, diagnostics: ts.Diagnostic[]) => {
        const context = new KotlinEmitterContext(program, srcOutDir, testOutDir);

        console.log('[Kotlin] Transforming to Kotlin AST');
        for (const file of program.getRootFileNames().filter(transpileFilter)) {
            const sourceFile = program.getSourceFile(file)!;
            const transformer = new KotlinAstTransformer(sourceFile, context);
            transformer.transform();
        }

        console.log('[Kotlin] Resolving types');
        context.resolveAllUnresolvedTypeNodes();
        context.rewriteVisibilities();

        if (!context.hasErrors) {
            console.log('[Kotlin] Writing Result');
            for (const file of context.csharpFiles) {
                // console.log(`[Kotlin] ${file.fileName} ${file.namespace.declarations.map(d=>d.name).join(', ')}`)
                const printer = new KotlinAstPrinter(file, context);
                printer.print();
                diagnostics.push(...printer.diagnostics);
            }
        }

        diagnostics.push(...context.diagnostics);
    };
}
