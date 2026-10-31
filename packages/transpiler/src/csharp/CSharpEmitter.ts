import type ts from 'typescript';
import AstTransformer from '../AstTransformer';
import { transpileFilter } from '../BuilderHelpers';
import { type IrPass, PassPipeline } from '../passes/IrPass';
import { ResolveTypesPass } from '../passes/ResolveTypesPass';
import { RewriteVisibilitiesPass } from '../passes/RewriteVisibilitiesPass';
import { SmartCastLoweringPass } from '../passes/SmartCastLoweringPass';
import CSharpAstPrinter from './CSharpAstPrinter';
import CSharpEmitterContext from './CSharpEmitterContext';
import { CSharpLanguage } from './CSharpLanguage';
import CSharpTargetStrategy from './CSharpTargetStrategy';

/** Pass list applied after the C# transformer runs and before the printer. */
const CSHARP_PASSES: readonly IrPass[] = [
    new ResolveTypesPass(),
    new SmartCastLoweringPass(),
    new RewriteVisibilitiesPass()
];

export default function createEmit(srcOutDir: string, testOutDir: string) {
    return (program: ts.Program, diagnostics: ts.Diagnostic[]) => {
        const context = new CSharpEmitterContext(program, srcOutDir, testOutDir, ctx => new CSharpTargetStrategy(ctx));
        console.log('[C#] Transforming to C# AST');
        for (const file of program.getRootFileNames().filter(transpileFilter)) {
            const sourceFile = program.getSourceFile(file)!;
            const transformer = new AstTransformer(sourceFile, context, CSharpLanguage);
            transformer.transform();
        }

        const pipeline = new PassPipeline(CSHARP_PASSES, msg => console.log(`[C#] ${msg}`));
        pipeline.run(context.sourceFiles, context);

        if (!context.hasErrors) {
            console.log(`[C#] Writing Results (${context.sourceFiles.length} files)`);
            for (const file of context.sourceFiles) {
                const printer = new CSharpAstPrinter(file, context);
                printer.print();
                diagnostics.push(...printer.diagnostics);
            }
        }

        diagnostics.push(...context.diagnostics);
    };
}
