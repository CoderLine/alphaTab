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
    type DocumentDiagnosticParams,
    DocumentDiagnosticRequest,
    type HoverParams,
    HoverRequest,
    type InitializeParams,
    InitializeRequest,
    type InitializeResult,
    type Logger,
    PositionEncodingKind,
    type ProtocolConnection,
    type SignatureHelpParams,
    SignatureHelpRequest
} from 'vscode-languageserver-protocol';
import {
    BrowserMessageReader,
    BrowserMessageWriter,
    createProtocolConnection
} from 'vscode-languageserver-protocol/browser';

/**
 * Options of {@link basicEditorLspIntegration}.
 */
export interface BasicEditorLspIntegrationInfo {
    /** The Monaco language the editor's model uses, e.g. `alphatex`. */
    languageId: string;
    logger?: Logger;
    clientInfo?: InitializeParams['clientInfo'];
    /**
     * Milliseconds to wait after the last edit before diagnostics are requested. `0`, the default,
     * requests them after every change.
     */
    diagnosticsDelay?: number;
    /**
     * The range a completion item replaces at `position`. Defaults to an empty range at `position`.
     */
    completionRange?(model: monaco.editor.ITextModel, position: monaco.Position): monaco.IRange;
}

/**
 * Enables a basic Language Server integration for the given editor covering:
 * * A single document backend (no workspace integration with file open,close, rename etc.)
 * * Diagnostics Provider (https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_pullDiagnostics)
 * * Completions (https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_completion)
 * * Hover (https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_hover)
 * * Signature Help (https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_signatureHelp)
 *
 * This feature set is mainly aligned with the capabilities of the alphaTab language server.
 * The providers answer only for the editor's model, so several editors can each have their own
 * integration.
 *
 * @param editor The editor to integrate with. Its model is the document sent to the server.
 * @param languageServerWorker The web worker with a language server listening for messages.
 * @returns Resolves once the server is initialized. Disposing the result removes the providers,
 * listeners and markers and closes the connection; the worker stays with the caller.
 */
export async function basicEditorLspIntegration(
    editor: monaco.editor.IStandaloneCodeEditor,
    languageServerWorker: Worker,
    info: BasicEditorLspIntegrationInfo
): Promise<monaco.IDisposable> {
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

    const model = editor.getModel()!;
    const documentUri = model.uri.toString();
    await connection.sendNotification(DidOpenTextDocumentNotification.type, {
        textDocument: {
            languageId: info.languageId,
            text: model.getValue(),
            uri: documentUri,
            version: model.getVersionId()
        }
    });

    const context: IntegrationContext = {
        model,
        documentUri,
        languageId: info.languageId,
        connection,
        initResponse,
        info,
        disposables: []
    };
    setupDocumentHandlingAndDiagnostics(context);
    setupCompletion(context);
    setupHover(context);
    setupSignatureHelp(context);

    let disposed = false;
    return {
        dispose() {
            if (disposed) {
                return;
            }
            disposed = true;
            for (const disposable of context.disposables) {
                disposable.dispose();
            }
            if (!model.isDisposed()) {
                monaco.editor.setModelMarkers(model, MARKER_OWNER, []);
            }
            connection.dispose();
        }
    };
}

const MARKER_OWNER = 'lsp';

interface IntegrationContext {
    model: monaco.editor.ITextModel;
    documentUri: string;
    languageId: string;
    connection: ProtocolConnection;
    initResponse: InitializeResult<any>;
    info: BasicEditorLspIntegrationInfo;
    disposables: monaco.IDisposable[];
}

function isOwnModel(context: IntegrationContext, model: monaco.editor.ITextModel) {
    return model.uri.toString() === context.documentUri;
}

function setupDocumentHandlingAndDiagnostics(context: IntegrationContext) {
    const { model, documentUri, connection } = context;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function updateDiagnostics() {
        const version = model.getVersionId();
        const params: DocumentDiagnosticParams = {
            textDocument: {
                uri: documentUri
            }
        };
        const result = await connection.sendRequest(DocumentDiagnosticRequest.type, params);
        if (disposed || model.isDisposed() || model.getVersionId() !== version || result.kind === 'unchanged') {
            return;
        }

        monaco.editor.setModelMarkers(model, MARKER_OWNER, result.items.map(lspToMonacoMarker));
    }
    function reportError(e: unknown) {
        if (!disposed) {
            context.info.logger?.error(`Diagnostics request failed: ${e}`);
        }
    }
    function scheduleDiagnostics() {
        const delay = context.info.diagnosticsDelay ?? 0;
        if (delay <= 0) {
            updateDiagnostics().catch(reportError);
            return;
        }
        clearTimeout(timer);
        timer = setTimeout(() => updateDiagnostics().catch(reportError), delay);
    }
    updateDiagnostics().catch(reportError);

    context.disposables.push(
        model.onDidChangeContent(async e => {
            await connection.sendNotification(DidChangeTextDocumentNotification.type, {
                textDocument: {
                    uri: documentUri,
                    version: e.versionId
                },
                contentChanges: e.changes.map(monacoToLspContentChange)
            });
            scheduleDiagnostics();
        }),
        {
            dispose() {
                disposed = true;
                clearTimeout(timer);
            }
        }
    );
}

function setupHover(context: IntegrationContext) {
    const { documentUri, languageId, connection, initResponse } = context;
    if (!initResponse.capabilities.hoverProvider) {
        return;
    }

    context.disposables.push(
        monaco.languages.registerHoverProvider(languageId, {
            async provideHover(model, position, token) {
                if (!isOwnModel(context, model)) {
                    return null;
                }
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
        })
    );
}

function setupSignatureHelp(context: IntegrationContext) {
    const { documentUri, languageId, connection, initResponse } = context;
    if (!initResponse.capabilities.signatureHelpProvider) {
        return;
    }

    context.disposables.push(
        monaco.languages.registerSignatureHelpProvider(languageId, {
            async provideSignatureHelp(model, position, token, signatureContext) {
                if (!isOwnModel(context, model)) {
                    return null;
                }
                const params: SignatureHelpParams = {
                    position: {
                        character: position.column - 1,
                        line: position.lineNumber - 1
                    },
                    textDocument: {
                        uri: documentUri
                    },
                    context: {
                        isRetrigger: signatureContext.isRetrigger,
                        triggerKind: monacoToLspSignatureHelpTriggerKind(signatureContext.triggerKind),
                        activeSignatureHelp: signatureContext.activeSignatureHelp
                            ? monacoToLspSignatureHelp(signatureContext.activeSignatureHelp)
                            : undefined,
                        triggerCharacter: signatureContext.triggerCharacter
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
        })
    );
}

function setupCompletion(context: IntegrationContext) {
    const { documentUri, languageId, connection, initResponse, info } = context;
    if (!initResponse.capabilities.completionProvider) {
        return;
    }

    context.disposables.push(
        monaco.languages.registerCompletionItemProvider(languageId, {
            triggerCharacters: initResponse.capabilities.completionProvider!.triggerCharacters,
            async provideCompletionItems(model, position, completionContext, token) {
                if (!isOwnModel(context, model)) {
                    return null;
                }
                const params: CompletionParams = {
                    position: {
                        line: position.lineNumber - 1,
                        character: position.column - 1
                    },
                    textDocument: {
                        uri: documentUri
                    },
                    context: {
                        triggerKind: monacoToLspCompletionTriggerKind(completionContext.triggerKind),
                        triggerCharacter: completionContext.triggerCharacter
                    }
                };
                const response = await connection.sendRequest(CompletionRequest.type, params, token);
                if (response === null) {
                    return null;
                }
                const range = monaco.Range.lift(
                    info.completionRange?.(model, position) ??
                        new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column)
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
        })
    );
}
