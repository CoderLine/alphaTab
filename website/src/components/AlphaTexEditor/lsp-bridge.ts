import type * as Monaco from 'monaco-editor';
import {
    CompletionRequest,
    CompletionResolveRequest,
    DidChangeTextDocumentNotification,
    DidOpenTextDocumentNotification,
    DocumentDiagnosticRequest,
    HoverRequest,
    InitializedNotification,
    InitializeRequest,
    PositionEncodingKind,
    SignatureHelpRequest,
    type CancellationToken,
    type InitializeParams,
    type InitializeResult,
} from 'vscode-languageserver-protocol';
import {
    BrowserMessageReader,
    BrowserMessageWriter,
    createProtocolConnection,
} from 'vscode-languageserver-protocol/browser';
import {
    lspToMonacoCompletionItem,
    lspToMonacoHover,
    lspToMonacoMarker,
    lspToMonacoSignatureHelp,
    monacoToLspCompletionItem,
    monacoToLspCompletionTriggerKind,
    monacoToLspContentChange,
    monacoToLspSignatureHelp,
    monacoToLspSignatureHelpTriggerKind,
} from '@coderline/alphatab-monaco/dist/lspMonacoMappings';
import { ALPHATEX_LANGUAGE_ID, type MonacoApi } from './monaco-env';

const MARKER_OWNER = 'alphatex-lsp';
const TYPED_TOKEN = /\\?[\w-]*$/;
const DIAGNOSTICS_DELAY_MS = 150;

const initializeParams: InitializeParams = {
    processId: null,
    rootUri: null,
    clientInfo: { name: 'alphaTab website' },
    capabilities: {
        general: {
            positionEncodings: [PositionEncodingKind.UTF16],
            markdown: { parser: 'marked', version: '1.1.0' },
        },
        textDocument: {
            completion: {
                completionItem: {
                    snippetSupport: true,
                    documentationFormat: ['markdown', 'plaintext'],
                    insertReplaceSupport: true,
                    labelDetailsSupport: true,
                },
            },
            hover: { contentFormat: ['markdown', 'plaintext'] },
            signatureHelp: {
                signatureInformation: {
                    documentationFormat: ['markdown', 'plaintext'],
                    parameterInformation: { labelOffsetSupport: true },
                    activeParameterSupport: true,
                },
            },
            diagnostic: {},
        },
    },
};

/**
 * Connects the editor's model to a dedicated alphaTex language server worker:
 * diagnostics as model markers, plus completion, hover and signature help.
 * Providers answer only for this model, so several editors can coexist.
 * Disposing terminates the worker and unregisters everything.
 */
export function connectAlphaTexLsp(
    monaco: MonacoApi,
    editor: Monaco.editor.IStandaloneCodeEditor,
): Monaco.IDisposable {
    const model = editor.getModel();
    if (!model) throw new Error('[AlphaTexEditor] Editor has no model');
    const uri = model.uri.toString();
    const isOwnModel = (m: Monaco.editor.ITextModel) => m.uri.toString() === uri;

    const worker = new Worker(new URL('./alphatex-lsp.worker.ts', import.meta.url));
    const connection = createProtocolConnection(new BrowserMessageReader(worker), new BrowserMessageWriter(worker));
    const disposables: Monaco.IDisposable[] = [];
    let disposed = false;
    let diagnosticsTimer: ReturnType<typeof setTimeout> | undefined;

    const pullDiagnostics = async () => {
        const version = model.getVersionId();
        const result = await connection.sendRequest(DocumentDiagnosticRequest.type, { textDocument: { uri } });
        if (disposed || model.isDisposed() || model.getVersionId() !== version || result.kind !== 'full') return;
        monaco.editor.setModelMarkers(model, MARKER_OWNER, result.items.map(lspToMonacoMarker));
    };
    const scheduleDiagnostics = () => {
        clearTimeout(diagnosticsTimer);
        diagnosticsTimer = setTimeout(() => void pullDiagnostics().catch(reportError), DIAGNOSTICS_DELAY_MS);
    };

    const start = async () => {
        connection.listen();
        const init = await connection.sendRequest(InitializeRequest.type, initializeParams);
        if (disposed) return;
        void connection.sendNotification(InitializedNotification.type, {});

        // The snapshot and the change subscription must happen in the same tick so no edit slips between them.
        void connection.sendNotification(DidOpenTextDocumentNotification.type, {
            textDocument: { uri, languageId: ALPHATEX_LANGUAGE_ID, version: model.getVersionId(), text: model.getValue() },
        });
        disposables.push(
            model.onDidChangeContent((e) => {
                void connection.sendNotification(DidChangeTextDocumentNotification.type, {
                    textDocument: { uri, version: e.versionId },
                    contentChanges: e.changes.map(monacoToLspContentChange),
                });
                scheduleDiagnostics();
            }),
        );
        registerProviders(init);
        scheduleDiagnostics();
    };

    const registerProviders = (init: InitializeResult) => {
        const { capabilities } = init;
        const toLspPosition = (p: Monaco.Position) => ({ line: p.lineNumber - 1, character: p.column - 1 });
        const token = (t: Monaco.CancellationToken) => t as unknown as CancellationToken;

        if (capabilities.completionProvider) {
            disposables.push(
                monaco.languages.registerCompletionItemProvider(ALPHATEX_LANGUAGE_ID, {
                    triggerCharacters: capabilities.completionProvider.triggerCharacters,
                    async provideCompletionItems(m, position, context, t) {
                        if (!isOwnModel(m)) return null;
                        const response = await connection.sendRequest(
                            CompletionRequest.type,
                            {
                                textDocument: { uri },
                                position: toLspPosition(position),
                                context: {
                                    triggerKind: monacoToLspCompletionTriggerKind(context.triggerKind),
                                    triggerCharacter: context.triggerCharacter,
                                },
                            },
                            token(t),
                        );
                        if (!response) return null;
                        const range = typedTokenRange(monaco, m, position);
                        const items = Array.isArray(response) ? response : response.items;
                        return {
                            suggestions: items.map((item) => lspToMonacoCompletionItem(item, range)),
                            incomplete: !Array.isArray(response) && response.isIncomplete,
                        };
                    },
                    async resolveCompletionItem(item, t) {
                        const response = await connection.sendRequest(
                            CompletionResolveRequest.type,
                            monacoToLspCompletionItem(item),
                            token(t),
                        );
                        return lspToMonacoCompletionItem(response, item.range);
                    },
                }),
            );
        }

        if (capabilities.hoverProvider) {
            disposables.push(
                monaco.languages.registerHoverProvider(ALPHATEX_LANGUAGE_ID, {
                    async provideHover(m, position, t) {
                        if (!isOwnModel(m)) return null;
                        const response = await connection.sendRequest(
                            HoverRequest.type,
                            { textDocument: { uri }, position: toLspPosition(position) },
                            token(t),
                        );
                        return response ? lspToMonacoHover(response) : null;
                    },
                }),
            );
        }

        if (capabilities.signatureHelpProvider) {
            const { triggerCharacters, retriggerCharacters } = capabilities.signatureHelpProvider;
            disposables.push(
                monaco.languages.registerSignatureHelpProvider(ALPHATEX_LANGUAGE_ID, {
                    signatureHelpTriggerCharacters: triggerCharacters,
                    signatureHelpRetriggerCharacters: retriggerCharacters,
                    async provideSignatureHelp(m, position, t, context) {
                        if (!isOwnModel(m)) return null;
                        const response = await connection.sendRequest(
                            SignatureHelpRequest.type,
                            {
                                textDocument: { uri },
                                position: toLspPosition(position),
                                context: {
                                    isRetrigger: context.isRetrigger,
                                    triggerKind: monacoToLspSignatureHelpTriggerKind(context.triggerKind),
                                    triggerCharacter: context.triggerCharacter,
                                    activeSignatureHelp: context.activeSignatureHelp
                                        ? monacoToLspSignatureHelp(context.activeSignatureHelp)
                                        : undefined,
                                },
                            },
                            token(t),
                        );
                        return response ? lspToMonacoSignatureHelp(response) : null;
                    },
                }),
            );
        }
    };

    function reportError(e: unknown) {
        if (!disposed) console.error('[AlphaTexEditor] Language server request failed', e);
    }

    void start().catch(reportError);

    return {
        dispose() {
            if (disposed) return;
            disposed = true;
            clearTimeout(diagnosticsTimer);
            for (const d of disposables) d.dispose();
            if (!model.isDisposed()) monaco.editor.setModelMarkers(model, MARKER_OWNER, []);
            connection.dispose();
            worker.terminate();
        },
    };
}

/** The token being typed before the cursor, including a leading `\\` of a metadata tag. */
function typedTokenRange(monaco: MonacoApi, model: Monaco.editor.ITextModel, position: Monaco.Position): Monaco.Range {
    const before = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
    const typed = TYPED_TOKEN.exec(before)?.[0].length ?? 0;
    return new monaco.Range(position.lineNumber, position.column - typed, position.lineNumber, position.column);
}
