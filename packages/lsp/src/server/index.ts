import { setupCompletion } from '@coderline/alphatab-lsp/server/completion';
import { setupDiagnostics } from '@coderline/alphatab-lsp/server/diagnostics';
import { setupHover } from '@coderline/alphatab-lsp/server/hover';
import { setupSignatureHelp } from '@coderline/alphatab-lsp/server/signatureHelp';
import {
    type AlphaTexTextDocument,
    type Connection,
    type InitializeParams,
    type InitializeResult,
    PositionEncodingKind,
    TextDocument,
    TextDocumentSyncKind,
    TextDocuments
} from '@coderline/alphatab-lsp/server/types';

// the only place where we should import specif vscode-languageserver packages
import {
    BrowserMessageReader,
    BrowserMessageWriter,
    createConnection as createBrowserConnection
} from 'vscode-languageserver/lib/browser/main.js';
import {
    createConnection as createNodeConnection,
    ProposedFeatures as NodeProposedFeatures
} from 'vscode-languageserver/lib/node/main.js';

function startLanguageServer(serverConnection: Connection) {
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


type Port = ConstructorParameters<typeof BrowserMessageReader>[0];

/**
 * Starts a new language server communicating via WebWorker.
 * @param readerPort The port used to reading incoming language server messages
 * @param writerPort The port used to writer outgoing language server messages
 */
export function startWebWorkerLanguageServer(
    readerPort: Port,
    writerPort: Port
) {
    startLanguageServer(
        createBrowserConnection(
            new BrowserMessageReader(readerPort),
            new BrowserMessageWriter(writerPort)
        )
    );
}

/**
 * Starts a new language server communicating from a Node.js process with a parent Node.js.
 */
export function startNodeLanguageServer() {
    startLanguageServer(createNodeConnection(NodeProposedFeatures.all));
}
