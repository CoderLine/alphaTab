import { setupCompletion } from '@src/server/completion';
import { setupDiagnostics } from '@src/server/diagnostics';
import { setupHover } from '@src/server/hover';
import { setupSignatureHelp } from '@src/server/signatureHelp';
import {
    type AlphaTexTextDocument,
    type Connection,
    type InitializeParams,
    type InitializeResult,
    PositionEncodingKind,
    TextDocument,
    TextDocumentSyncKind,
    TextDocuments
} from '@src/server/types';

// the only place where we should import specif vscode-languageserver packages
import { createConnection as createBrowserConnection } from 'vscode-languageserver/lib/browser/main.js';
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

/**
 * Starts a new language server communicating via WebWorker.
 */
export function startWebWorkerLanguageServer() {
    startLanguageServer(
        createBrowserConnection(
            {
                // todo
            } as any,
            null! /*TODO */,
            null! /* TODO */
        )
    );
}

/**
 * Starts a new language server communicating from a Node.js process with a parent Node.js.
 */
export function startNodeLanguageServer() {
    startLanguageServer(createNodeConnection(NodeProposedFeatures.all));
}
