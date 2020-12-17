import * as ts from 'typescript';

export default function (emit: (program: ts.Program) => void) {
    function createDiagnosticReporter(pretty?: boolean): ts.DiagnosticReporter {
        const host: ts.FormatDiagnosticsHost = {
            getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
            getNewLine: () => ts.sys.newLine,
            getCanonicalFileName: ts.sys.useCaseSensitiveFileNames
                ? x => x
                : x => x.toLowerCase(),
        };

        if (!pretty) {
            return diagnostic => ts.sys.write(ts.formatDiagnostic(diagnostic, host));
        }

        return diagnostic => {
            ts.sys.write(ts.formatDiagnosticsWithColorAndContext([diagnostic], host) + host.getNewLine());
        };
    }

    const commandLine = ts.parseCommandLine(ts.sys.args);
    if (!ts.sys.fileExists(commandLine.options.project!)) {
        ts.sys.exit(ts.ExitStatus.InvalidProject_OutputsSkipped);
    }

    const parseConfigFileHost: ts.ParseConfigFileHost = <any>ts.sys;

    const parsedCommandLine = ts.getParsedCommandLineOfConfigFile(commandLine.options.project!, commandLine.options, parseConfigFileHost, /*extendedConfigCache*/ undefined, commandLine.watchOptions)!;
    const program = ts.createProgram({
        rootNames: parsedCommandLine.fileNames,
        options: parsedCommandLine.options,
        projectReferences: parsedCommandLine.projectReferences,
        host: ts.createCompilerHost(parsedCommandLine.options),
    });

    program.getTypeChecker();
    
    emit(program);
}