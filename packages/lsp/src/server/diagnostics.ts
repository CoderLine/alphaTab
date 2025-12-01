import * as alphaTab from '@coderline/alphatab';
import {
    type AlphaTexTextDocument,
    type Connection,
    type Diagnostic,
    DiagnosticSeverity,
    type DocumentDiagnosticReport,
    DocumentDiagnosticReportKind,
    type TextDocuments,
    uinteger
} from '@coderline/alphatab-language-server/server/types';

export function setupDiagnostics(connection: Connection, documents: TextDocuments<AlphaTexTextDocument>) {
    connection.languages.diagnostics.on(async params => {
        const document = documents.get(params.textDocument.uri);
        if (document !== undefined) {
            return {
                kind: DocumentDiagnosticReportKind.Full,
                items: await validateTextDocument(document)
            } satisfies DocumentDiagnosticReport;
        } else {
            return {
                kind: DocumentDiagnosticReportKind.Full,
                items: []
            } satisfies DocumentDiagnosticReport;
        }
    });

    documents.onDidChangeContent(async change => {
        await validateTextDocument(change.document);
    });
}

function mapDiagnostics(atDiag: Iterable<alphaTab.importer.alphaTex.AlphaTexDiagnostic>): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const d of atDiag) {
        const diagnostic: Diagnostic = {
            severity: DiagnosticSeverity.Warning,
            range: {
                start: {
                    line: d.start!.line - 1,
                    character: d.start!.col - 1
                },
                end: {
                    line: d.end!.line - 1,
                    character: d.end!.col - 1
                }
            },
            message: d.message,
            code: `AT${d.code}`,
            source: 'alphaTab'
        };
        switch (d.severity) {
            case alphaTab.importer.alphaTex.AlphaTexDiagnosticsSeverity.Hint:
                diagnostic.severity = DiagnosticSeverity.Hint;
                break;
            case alphaTab.importer.alphaTex.AlphaTexDiagnosticsSeverity.Warning:
                diagnostic.severity = DiagnosticSeverity.Warning;
                break;
            case alphaTab.importer.alphaTex.AlphaTexDiagnosticsSeverity.Error:
                diagnostic.severity = DiagnosticSeverity.Error;
                break;
        }
        diagnostics.push(diagnostic);
    }
    return diagnostics;
}
function handleError(e: Error): Diagnostic[] {
    let atError: alphaTab.importer.AlphaTexErrorWithDiagnostics | undefined;
    if (e instanceof alphaTab.importer.AlphaTexErrorWithDiagnostics) {
        atError = e;
    } else if (
        e instanceof alphaTab.importer.UnsupportedFormatError &&
        e.cause instanceof alphaTab.importer.AlphaTexErrorWithDiagnostics
    ) {
        atError = e.cause;
    }

    if (atError) {
        return mapDiagnostics(atError.iterateDiagnostics());
    } else {
        return [
            {
                severity: DiagnosticSeverity.Warning,
                range: {
                    start: {
                        line: 0,
                        character: 0
                    },
                    end: {
                        line: 0,
                        character: uinteger.MAX_VALUE
                    }
                },
                message: `Unexpected error parsing alphaTex: ${e.message}`,
                source: 'alphaTab'
            }
        ];
    }
}

async function validateTextDocument(textDocument: AlphaTexTextDocument): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
    const text = textDocument.getText();

    const importer = new alphaTab.importer.AlphaTexImporter();
    importer.initFromString(text, new alphaTab.Settings());
    importer.parser!.mode = alphaTab.importer.alphaTex.AlphaTexParseMode.Full;
    try {
        textDocument.score = importer.readScore();
        textDocument.ast = importer.scoreNode;
        diagnostics.push(...mapDiagnostics(importer.lexerDiagnostics));
        diagnostics.push(...mapDiagnostics(importer.parserDiagnostics));
        diagnostics.push(...mapDiagnostics(importer.semanticDiagnostics));
    } catch (e) {
        textDocument.score = undefined;
        textDocument.ast = importer.scoreNode;

        diagnostics.push(...handleError(e as Error));
    }
    return diagnostics;
}
