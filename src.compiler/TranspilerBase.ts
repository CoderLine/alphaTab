import * as ts from 'typescript';

function createDiagnosticReporter(pretty?: boolean): ts.DiagnosticReporter {
    const host: ts.FormatDiagnosticsHost = {
        getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
        getNewLine: () => ts.sys.newLine,
        getCanonicalFileName: ts.sys.useCaseSensitiveFileNames ? x => x : x => x.toLowerCase()
    };

    if (!pretty) {
        return diagnostic => ts.sys.write(ts.formatDiagnostic(diagnostic, host));
    }

    return diagnostic => {
        ts.sys.write(ts.formatDiagnosticsWithColorAndContext([diagnostic], host) + host.getNewLine());
    };
}

interface Emitter {
    name: string;
    emit(program: ts.Program, diagnostics: ts.Diagnostic[]): void;
}

export default function (emitters: Emitter[], handleErrors: boolean = false) {
    console.log(`Parsing using typescript ${ts.version}...`);
    const commandLine = ts.parseCommandLine(ts.sys.args);
    if (!commandLine.options.project) {
        commandLine.options.project = 'tsconfig.json';
    }

    let reportDiagnostic = createDiagnosticReporter();

    const parseConfigFileHost: ts.ParseConfigFileHost = <any>ts.sys;
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
    const pretty = !!ts.sys.writeOutputIsTTY?.();
    if (pretty) {
        reportDiagnostic = createDiagnosticReporter(true);
    }

    const program = ts.createProgram({
        rootNames: parsedCommandLine.fileNames,
        options: parsedCommandLine.options,
        projectReferences: parsedCommandLine.projectReferences,
        host: ts.createCompilerHost(parsedCommandLine.options)
    });

    let allDiagnostics: ts.Diagnostic[] = [];
    if (handleErrors) {
        allDiagnostics = program.getConfigFileParsingDiagnostics().slice();
        const syntacticDiagnostics = program.getSyntacticDiagnostics();
        if (syntacticDiagnostics.length) {
            allDiagnostics.push(...syntacticDiagnostics);
        } else {
            allDiagnostics.push(...program.getOptionsDiagnostics());
            allDiagnostics.push(...program.getGlobalDiagnostics());
            allDiagnostics.push(...program.getSemanticDiagnostics());
        }
    }

    program.getTypeChecker();

    for (const emitter of emitters) {
        console.log(`[${emitter.name}] Emitting...`);
        emitter.emit(program, allDiagnostics);
    }

    if (handleErrors) {
        const diagnostics = ts.sortAndDeduplicateDiagnostics(allDiagnostics);
        let errorCount = 0;
        let warningCount = 0;
        for (const d of diagnostics) {
            switch (d.category) {
                case ts.DiagnosticCategory.Error:
                    errorCount++;
                    break;
                case ts.DiagnosticCategory.Warning:
                    warningCount++;
                    break;
            }
            reportDiagnostic(d);
        }

        if (pretty) {
            reportDiagnostic({
                file: undefined,
                start: undefined,
                length: undefined,
                code: 6194,
                messageText: `Compilation completed with ${errorCount} errors and ${warningCount} warnings${ts.sys.newLine}`,
                category:
                    errorCount > 0
                        ? ts.DiagnosticCategory.Error
                        : warningCount > 0
                          ? ts.DiagnosticCategory.Warning
                          : ts.DiagnosticCategory.Message
            });
        }

        console.log('Done transpiling');

        if (errorCount > 0) {
            ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsGenerated);
        } else {
            ts.sys.exit(ts.ExitStatus.Success);
        }
    } else {
        console.log('Done transpiling');
    }
}
