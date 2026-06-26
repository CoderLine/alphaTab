import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';

type Logger = Pick<Console, 'log' | 'info' | 'warn' | 'error'>;

export function createDiagnosticReporter(pretty: boolean, logger: Logger): ts.DiagnosticReporter {
    const host: ts.FormatDiagnosticsHost = {
        getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
        getNewLine: () => ts.sys.newLine,
        getCanonicalFileName: ts.sys.useCaseSensitiveFileNames ? x => x : x => x.toLowerCase()
    };

    const mapping: Record<ts.DiagnosticCategory, keyof Logger> = {
        [ts.DiagnosticCategory.Warning]: 'warn',
        [ts.DiagnosticCategory.Error]: 'error',
        [ts.DiagnosticCategory.Message]: 'info',
        [ts.DiagnosticCategory.Suggestion]: 'log'
    };

    if (!pretty) {
        return diagnostic => logger[mapping[diagnostic.category]](ts.formatDiagnostic(diagnostic, host));
    }

    return diagnostic => {
        logger[mapping[diagnostic.category]](
            ts.formatDiagnosticsWithColorAndContext([diagnostic], host) + host.getNewLine()
        );
    };
}

export function symbolFromNode(checker: ts.TypeChecker, node: ts.Node) {
    return ((node as any).symbol as ts.Symbol | undefined) || checker.getSymbolAtLocation(node);
}

const moduleFlags = ts.SymbolFlags.ValueModule | ts.SymbolFlags.NamespaceModule;
export function resolveImportedSourceFile(checker: ts.TypeChecker, node: ts.ImportDeclaration) {
    const sourceFile = symbolFromNode(checker, node.moduleSpecifier);
    if (
        sourceFile &&
        (sourceFile.flags & moduleFlags) !== 0 &&
        sourceFile.valueDeclaration &&
        ts.isSourceFile(sourceFile.valueDeclaration)
    ) {
        return sourceFile.valueDeclaration;
    }
    return undefined;
}

function shouldFilterFromDts(node: ts.Node, warn?: (message: string) => void) {
    if (ts.canHaveModifiers(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword)) {
        return true;
    }
    for (const tag of ts.getJSDocTags(ts.getOriginalNode(node))) {
        switch (tag.tagName.text) {
            case 'public':
                return false;
            case 'internal':
            case 'private':
                return true;
        }
    }

    if (warn) {
        const file = node.getSourceFile();
        const location = file.getLineAndCharacterOfPosition(node.getStart());
        warn(`${file.fileName}:${location.line + 1}:${location.character}: Missing @public or @internal`);
    }

    return false;
}

function exportSymbolKey(sourceFile: string, exportName: string) {
    return `${sourceFile}__${exportName}`;
}

function filterDtsVisitor(
    checker: ts.TypeChecker,
    s: ts.SourceFile,
    removedSymbols: Set<string>,
    warn: (message: string) => void
) {
    return function visitor(node: ts.Node) {
        if (ts.canHaveModifiers(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
            if (!shouldFilterFromDts(node, warn)) {
                return ts.visitEachChild(node, visitor, undefined);
            }

            const name = 'name' in node ? (node.name?.getText() ?? '') : '';
            removedSymbols.add(exportSymbolKey(s.fileName, name));
            return undefined;
        } else if (ts.isExportAssignment(node)) {
            if (!shouldFilterFromDts(node)) {
                return ts.visitEachChild(node, visitor, undefined);
            }

            removedSymbols.add(exportSymbolKey(s.fileName, ''));
            return undefined;
        } else if (ts.isExportDeclaration(node)) {
            if (!shouldFilterFromDts(node)) {
                return ts.visitEachChild(node, visitor, undefined);
            }

            if (node.exportClause && ts.isNamedExports(node.exportClause)) {
                for (const exp of node.exportClause.elements) {
                    const symbol = symbolFromNode(checker, exp);
                    if (symbol) {
                        removedSymbols.add(exportSymbolKey(s.fileName, exp.name.getText()));
                    }
                }
            }

            return undefined;
        } else if (shouldFilterFromDts(node)) {
            return undefined;
        }

        return ts.visitEachChild(node, visitor, undefined);
    };
}

function filterDtsImportsVisitor(checker: ts.TypeChecker, removedSymbols: Set<string>) {
    let importedSourceFile: string | undefined;
    return function visitor(node: ts.Node) {
        if (ts.isImportDeclaration(node) && node.importClause) {
            const sourceFile = resolveImportedSourceFile(checker, node);
            if (!sourceFile) {
                return node;
            }

            // import a from 'x'
            if (node.importClause.name) {
                const symbol = exportSymbolKey(sourceFile.fileName, '');
                if (removedSymbols.has(symbol)) {
                    return undefined;
                }
            } else if (node.importClause.namedBindings) {
                // import * as x from 'x';
                if (ts.isNamespaceImport(node.importClause.namedBindings)) {
                    // cannot nicely filter these. hard to detect if all removed members are ununsed
                }
                // import { a, b, c as d} from 'x'
                else if (ts.isNamedImports(node.importClause.namedBindings)) {
                    importedSourceFile = sourceFile.fileName;
                    const rewritten = ts.visitEachChild(node, visitor, undefined);
                    importedSourceFile = undefined;

                    if ((rewritten.importClause!.namedBindings! as ts.NamedImports).elements.length === 0) {
                        return undefined;
                    }
                    return rewritten;
                }
            }
        } else if (ts.isImportSpecifier(node) && importedSourceFile) {
            const symbol = exportSymbolKey(importedSourceFile, node.name.getText());
            if (removedSymbols.has(symbol)) {
                return undefined;
            }
        }

        return ts.visitEachChild(node, visitor, undefined);
    };
}

export async function createApiDtsFiles(
    dtsBaseDir: string,
    dtsFiles: string[],
    projectDir: string,
    outDir: string,
    logger: Logger
) {
    const commandLine = ts.parseCommandLine([]);
    if (!commandLine.options.project) {
        commandLine.options.project = path.resolve(projectDir, 'tsconfig.json');
    }

    const reportDiagnostic = createDiagnosticReporter(true, logger);

    const parseConfigFileHost: ts.ParseConfigFileHost = ts.sys as any;
    parseConfigFileHost.onUnRecoverableConfigFileDiagnostic = diagnostic => {
        reportDiagnostic(diagnostic);
        ts.sys.exit(ts.ExitStatus.InvalidProject_OutputsSkipped);
    };

    const parsedCommandLine = ts.getParsedCommandLineOfConfigFile(
        commandLine.options.project!,
        commandLine.options,
        parseConfigFileHost,
        /*extendedConfigCache*/ undefined,
        commandLine.watchOptions
    )!;

    const removedSymbols = new Set<string>();

    const program = ts.createProgram({
        rootNames: dtsFiles,
        options: parsedCommandLine.options,
        projectReferences: parsedCommandLine.projectReferences,
        host: ts.createCompilerHost(parsedCommandLine.options)
    });

    let sourceFiles = dtsFiles.map(f => program.getSourceFile(f)!);

    const checker = program.getTypeChecker();

    // Pass 1: Filter all exports
    sourceFiles = sourceFiles.map(
        s => ts.visitEachChild(s, filterDtsVisitor(checker, s, removedSymbols, logger.warn), undefined) as ts.SourceFile
    );

    // Pass 2: Filter imports of remoevd exports
    sourceFiles = sourceFiles.map(
        s => ts.visitEachChild(s, filterDtsImportsVisitor(checker, removedSymbols), undefined) as ts.SourceFile
    );

    // Pass 3: filter any files which do not have any exports
    sourceFiles = sourceFiles.filter(s =>
        s.statements.some(
            e =>
                ts.isExportDeclaration(e) ||
                (ts.canHaveModifiers(e) && e.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword))
        )
    );

    // Pass 4(todo): Collect and Filter any unused imports from externals

    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
        removeComments: false,
        noEmitHelpers: true
    });

    for (const s of sourceFiles) {
        const result = printer.printFile(s);
        const relativePath = path.relative(dtsBaseDir, s.fileName);
        const outputFile = path.resolve(outDir, relativePath);
        const parent = path.dirname(outputFile);
        await fs.promises.mkdir(parent, { recursive: true });
        await fs.promises.writeFile(outputFile, result);
    }
}

