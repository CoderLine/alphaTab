import { setupCompletion } from 'src/server/completion';
import { setupDiagnostics } from 'src/server/diagnostics';
import { setupHover } from 'src/server/hover';
import type { AlphaTexTextDocument } from 'src/server/types';
import {
    createConnection,
    type InitializeParams,
    type InitializeResult,
    ProposedFeatures,
    TextDocumentSyncKind, 
    TextDocuments,
    PositionEncodingKind
} from 'vscode-languageserver/lib/node/main';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { setupSignatureHelp } from 'src/server/signatureHelp';

const connection = createConnection(ProposedFeatures.all);

const documents = new TextDocuments<AlphaTexTextDocument>(TextDocument);

connection.onInitialize((params: InitializeParams) => {
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

setupDiagnostics(connection, documents);
setupCompletion(connection,documents);
setupHover(connection, documents);
setupSignatureHelp(connection, documents);

documents.listen(connection);
connection.listen();
