import {
    lspToMonacoCompletionItem,
    lspToMonacoHover,
    lspToMonacoMarker,
    lspToMonacoSignatureHelp,
    monacoToLspCompletionItem,
    monacoToLspCompletionTriggerKind,
    monacoToLspContentChange,
    monacoToLspSignatureHelp,
    monacoToLspSignatureHelpTriggerKind
} from '@coderline/alphatab-monaco/lspMonacoMappings';
import * as monaco from 'monaco-editor';
import {
    type CompletionParams,
    CompletionRequest,
    CompletionResolveRequest,
    DidChangeTextDocumentNotification,
    DidOpenTextDocumentNotification,
    type HoverParams,
    HoverRequest,
    type InitializeParams,
    InitializeRequest,
    type InitializeResult,
    type Logger,
    PositionEncodingKind,
    type ProtocolConnection,
    PublishDiagnosticsNotification,
    type SignatureHelpParams,
    SignatureHelpRequest
} from 'vscode-languageserver-protocol';
import {
    BrowserMessageReader,
    BrowserMessageWriter,
    createProtocolConnection
} from 'vscode-languageserver-protocol/browser';

/**
 * Enables a basic Language Server integration for the given editor covering:
 * * A single document backend (no workspace integration with file open,close, rename etc.)
 * * Diagnostics Provider (https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_pullDiagnostics)
 * * Completions (https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_completion)
 * * Hover (https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_hover)
 * * Signature Help (https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_signatureHelp)
 *
 * This feature set is mainly aligned with the capabilities of the alphaTab language server.
 *
 * @param editor The editor to integrate with.
 * @param languageServerWorker The web worker with a language server listening for messages.
 */
export async function basicEditorLspIntegration(
    editor: monaco.editor.IStandaloneCodeEditor,
    languageServerWorker: Worker,
    info: {
        languageId: string;
        logger?: Logger;
        clientInfo?: InitializeParams['clientInfo'];
    }
) {
    const reader = new BrowserMessageReader(languageServerWorker);
    const writer = new BrowserMessageWriter(languageServerWorker);
    const connection = createProtocolConnection(reader, writer, info.logger);
    connection.onError(data => {
        info.logger?.error(`Error on protocol connection: ${data}`);
    });
    connection.onClose(() => {
        info.logger?.log(`Language Server connection closed`);
    });

    const initRequest: InitializeParams = {
        processId: null,
        clientInfo: info.clientInfo,
        rootUri: null,
        capabilities: {
            general: {
                staleRequestSupport: {
                    cancel: true,
                    retryOnContentModified: []
                },
                regularExpressions: {
                    engine: 'ECMAScript',
                    version: 'ES2020'
                },
                markdown: {
                    parser: 'marked',
                    version: '1.1.0'
                },
                positionEncodings: [PositionEncodingKind.UTF16]
            },
            textDocument: {
                completion: {
                    completionItem: {
                        snippetSupport: true,
                        documentationFormat: ['markdown', 'plaintext'],
                        insertReplaceSupport: true,
                        labelDetailsSupport: true
                    }
                },
                hover: {
                    contentFormat: ['markdown', 'plaintext']
                },
                signatureHelp: {
                    signatureInformation: {
                        documentationFormat: ['markdown', 'plaintext'],
                        parameterInformation: {
                            labelOffsetSupport: true
                        },
                        activeParameterSupport: true
                    }
                },
                diagnostic: {}
            }
        }
    };

    info.logger?.log(`Begin listen on connection`);
    connection.listen();
    info.logger?.log(`Listening now on connection`);

    info.logger?.log(`Begin Language Server initialization`);
    const initResponse = await connection.sendRequest(InitializeRequest.type, initRequest);
    info.logger?.log(`Finished Language Server initialization`);

    const documentUri = 'monaco://standalone.document';
    const model = editor.getModel()!;
    await connection.sendNotification(DidOpenTextDocumentNotification.type, {
        textDocument: {
            languageId: info.languageId,
            text: model.getValue(),
            uri: documentUri,
            version: model.getVersionId()
        }
    });

    setupDocumentHandling(editor, documentUri, connection);
    setupDiagnostics(editor, documentUri, connection);
    setupCompletion(documentUri, info.languageId, connection, initResponse);
    setupHover(documentUri, info.languageId, connection, initResponse);
    setupSignatureHelp(documentUri, info.languageId, connection, initResponse);
}

function setupDocumentHandling(
    editor: monaco.editor.IStandaloneCodeEditor,
    documentUri: string,
    connection: ProtocolConnection
) {
    editor.onDidChangeModelContent(async e => {
        await connection.sendNotification(DidChangeTextDocumentNotification.type, {
            textDocument: {
                uri: documentUri,
                version: e.versionId
            },
            contentChanges: e.changes.map(monacoToLspContentChange)
        });
    });
}

function setupDiagnostics(
    editor: monaco.editor.IStandaloneCodeEditor,
    documentUri: string,
    connection: ProtocolConnection
) {
    connection.onNotification(PublishDiagnosticsNotification.type, e => {
        monaco.editor.setModelMarkers(editor.getModel()!, 'lsp', e.diagnostics.map(lspToMonacoMarker));
    });
}

function setupHover(
    documentUri: string,
    languageId: string,
    connection: ProtocolConnection,
    initResponse: InitializeResult<any>
) {
    if (!initResponse.capabilities.hoverProvider) {
        return;
    }

    // TODO: registration is global, this will break with multiple editors
    monaco.languages.registerHoverProvider(languageId, {
        async provideHover(_, position, token) {
            const params: HoverParams = {
                position: {
                    line: position.lineNumber - 1,
                    character: position.column - 1
                },
                textDocument: {
                    uri: documentUri
                }
            };
            const response = await connection.sendRequest(HoverRequest.type, params, token);
            if (response === null) {
                return null;
            }
            return lspToMonacoHover(response);
        }
    });
}

function setupSignatureHelp(
    documentUri: string,
    languageId: string,
    connection: ProtocolConnection,
    initResponse: InitializeResult<any>
) {
    if (!initResponse.capabilities.signatureHelpProvider) {
        return;
    }

    // TODO: registration is global, this will break with multiple editors
    monaco.languages.registerSignatureHelpProvider(languageId, {
        async provideSignatureHelp(_, position, token, context) {
            const params: SignatureHelpParams = {
                position: {
                    character: position.column - 1,
                    line: position.lineNumber - 1
                },
                textDocument: {
                    uri: documentUri
                },
                context: {
                    isRetrigger: context.isRetrigger,
                    triggerKind: monacoToLspSignatureHelpTriggerKind(context.triggerKind),
                    activeSignatureHelp: context.activeSignatureHelp
                        ? monacoToLspSignatureHelp(context.activeSignatureHelp)
                        : undefined,
                    triggerCharacter: context.triggerCharacter
                }
            };

            const response = await connection.sendRequest(SignatureHelpRequest.type, params, token);
            if (response === null) {
                return null;
            }

            return lspToMonacoSignatureHelp(response);
        },
        signatureHelpRetriggerCharacters: initResponse.capabilities.signatureHelpProvider!.retriggerCharacters,
        signatureHelpTriggerCharacters: initResponse.capabilities.signatureHelpProvider!.triggerCharacters
    });
}
function setupCompletion(
    documentUri: string,
    languageId: string,
    connection: ProtocolConnection,
    initResponse: InitializeResult<any>
) {
    if (!initResponse.capabilities.completionProvider) {
        return;
    }

    // TODO: registration is global, this will break with multiple editors
    monaco.languages.registerCompletionItemProvider(languageId, {
        triggerCharacters: initResponse.capabilities.completionProvider!.triggerCharacters,
        async provideCompletionItems(_, position, context, token) {
            const params: CompletionParams = {
                position: {
                    line: position.lineNumber - 1,
                    character: position.column - 1
                },
                textDocument: {
                    uri: documentUri
                },
                context: {
                    triggerKind: monacoToLspCompletionTriggerKind(context.triggerKind),
                    triggerCharacter: context.triggerCharacter
                }
            };
            const response = await connection.sendRequest(CompletionRequest.type, params, token);
            if (response === null) {
                return null;
            }
            const range: monaco.Range = new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
            );

            return Array.isArray(response)
                ? {
                      suggestions: response.map(r => lspToMonacoCompletionItem(r, range)),
                      incomplete: false
                  }
                : {
                      suggestions: response.items.map(r => lspToMonacoCompletionItem(r, range)),
                      incomplete: response.isIncomplete
                  };
        },
        async resolveCompletionItem(item, token) {
            const response = await connection.sendRequest(
                CompletionResolveRequest.type,
                monacoToLspCompletionItem(item),
                token
            );
            return lspToMonacoCompletionItem(response, item.range);
        }
    });
}
