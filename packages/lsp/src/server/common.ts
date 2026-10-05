import { setupCompletion } from '@coderline/alphatab-language-server/server/completion';
import { setupDiagnostics } from '@coderline/alphatab-language-server/server/diagnostics';
import { setupHover } from '@coderline/alphatab-language-server/server/hover';
import { setupSignatureHelp } from '@coderline/alphatab-language-server/server/signatureHelp';
import {
    type AlphaTexTextDocument,
    type Connection,
    type InitializeParams,
    type InitializeResult,
    PositionEncodingKind,
    TextDocument,
    TextDocumentSyncKind,
    TextDocuments
} from '@coderline/alphatab-language-server/server/types';

export function startLanguageServer(serverConnection: Connection) {
    const documents = new TextDocuments<AlphaTexTextDocument>(TextDocument);

    serverConnection.onInitialize((params: InitializeParams) => {
        const capabilities = params.capabilities;

        const hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);

        const result: InitializeResult = {
            capabilities: {
                textDocumentSync: TextDocumentSyncKind.Incremental,
                positionEncoding: PositionEncodingKind.UTF16,
                completionProvider: {
                    resolveProvider: true
                },
                signatureHelpProvider: {
                    triggerCharacters: ['(']
                },
                diagnosticProvider: {
                    interFileDependencies: false,
                    workspaceDiagnostics: false
                },
                hoverProvider: {}
            }
        };
        if (hasWorkspaceFolderCapability) {
            result.capabilities.workspace = {
                workspaceFolders: {
                    supported: true
                }
            };
        }
        return result;
    });

    setupDiagnostics(serverConnection, documents);
    setupCompletion(serverConnection, documents);
    setupHover(serverConnection, documents);
    setupSignatureHelp(serverConnection, documents);

    documents.listen(serverConnection);
    serverConnection.listen();
}
