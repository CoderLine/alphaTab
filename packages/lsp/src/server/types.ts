import type * as alphaTab from '@coderline/alphatab';
import type { createConnection as createBrowserConnection } from 'vscode-languageserver/lib/browser/main.js';
import type { createConnection as createNodeConnection } from 'vscode-languageserver/lib/node/main.js';
import type { TextDocument } from 'vscode-languageserver-textdocument';

export type NodeConnection = ReturnType<typeof createNodeConnection>;
export type BrowserConnection = ReturnType<typeof createBrowserConnection>;

export type Connection = NodeConnection | BrowserConnection;

export interface AlphaTexTextDocument extends TextDocument {
    score?: alphaTab.model.Score;
    ast?: alphaTab.importer.alphaTex.AlphaTexScoreNode;
}

export { type RemoteConsole, type TextDocumentPositionParams, TextDocuments } from 'vscode-languageserver';

export {
    type DocumentDiagnosticReport,
    DocumentDiagnosticReportKind,
    type InitializeParams,
    type InitializeResult,
    PositionEncodingKind,
    TextDocumentSyncKind
} from 'vscode-languageserver-protocol';

export {
    type CompletionItem,
    type Diagnostic,
    DiagnosticSeverity,
    CompletionItemKind,
    InsertTextFormat,
    type Hover,
    TextEdit,
    uinteger,
    ParameterInformation,
    type SignatureHelp,
    SignatureInformation,
} from 'vscode-languageserver-types';

export { TextDocument } from 'vscode-languageserver-textdocument';
