import type ts from 'typescript';
import AstTransformer from '../AstTransformer';
import { transpileFilter } from '../BuilderHelpers';
import { AsyncRewritePass } from '../passes/AsyncRewritePass';
import { DoubleSuffixPass } from '../passes/DoubleSuffixPass';
import { type IrPass, PassPipeline } from '../passes/IrPass';
import { PartialsPass } from '../passes/PartialsPass';
import { RecordPostProcessPass } from '../passes/RecordPostProcessPass';
import { ResolveTypesPass } from '../passes/ResolveTypesPass';
import { RewriteVisibilitiesPass } from '../passes/RewriteVisibilitiesPass';
import { SmartCastLoweringPass } from '../passes/SmartCastLoweringPass';
import KotlinAstPrinter from './KotlinAstPrinter';
import KotlinEmitterContext from './KotlinEmitterContext';
import { KotlinLanguage } from './KotlinLanguage';
import KotlinTargetStrategy from './KotlinTargetStrategy';

/** Pass list applied after the Kotlin transformer runs and before the printer. */
const KOTLIN_PASSES: readonly IrPass[] = [
    new ResolveTypesPass(),
    new RecordPostProcessPass(),
    new SmartCastLoweringPass(),
    new AsyncRewritePass(),
    new PartialsPass(),
    new DoubleSuffixPass(),
    new RewriteVisibilitiesPass()
];

export default function createEmit(srcOutDir: string, testOutDir: string) {
    return (program: ts.Program, diagnostics: ts.Diagnostic[]) => {
        const context = new KotlinEmitterContext(program, srcOutDir, testOutDir, ctx => new KotlinTargetStrategy(ctx));

        console.log('[Kotlin] Transforming to Kotlin AST');
        for (const file of program.getRootFileNames().filter(transpileFilter)) {
            const sourceFile = program.getSourceFile(file)!;
            const transformer = new AstTransformer(sourceFile, context, KotlinLanguage);
            transformer.transform();
        }

        const pipeline = new PassPipeline(KOTLIN_PASSES, msg => console.log(`[Kotlin] ${msg}`));
        pipeline.run(context.sourceFiles, context);

        if (!context.hasErrors) {
            console.log('[Kotlin] Writing Result');
            for (const file of context.sourceFiles) {
                const printer = new KotlinAstPrinter(file, context);
                printer.print();
                diagnostics.push(...printer.diagnostics);
            }
        }

        diagnostics.push(...context.diagnostics);
    };
}
