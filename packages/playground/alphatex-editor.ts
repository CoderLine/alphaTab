import * as alphaTab from '@coderline/alphatab';
import { textMateGrammar, languageConfiguration } from '@coderline/alphatab-lsp/index';

import * as monaco from 'monaco-editor';
// @ts-expect-error
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import Split from 'split.js';
import {
    type CompletionItem,
    CompletionItemKind,
    CompletionItemTag,
    type CompletionParams,
    CompletionRequest,
    CompletionResolveRequest,
    CompletionTriggerKind,
    DiagnosticSeverity,
    DidChangeTextDocumentNotification,
    DidOpenTextDocumentNotification,
    type DocumentDiagnosticParams,
    DocumentDiagnosticRequest,
    type Hover,
    type HoverParams,
    HoverRequest,
    type InitializeParams,
    InitializeRequest,
    InsertTextFormat,
    MarkedString,
    MarkupContent,
    type ParameterInformation,
    PositionEncodingKind,
    type SignatureHelp,
    type SignatureHelpParams,
    SignatureHelpRequest,
    SignatureHelpTriggerKind,
    type SignatureInformation,
    type TextDocumentContentChangeEvent,
    type TextEdit
} from 'vscode-languageserver-protocol';
import {
    BrowserMessageReader,
    BrowserMessageWriter,
    createProtocolConnection
} from 'vscode-languageserver-protocol/browser';
import * as oniguruma from 'vscode-oniguruma';
import * as vsctm from 'vscode-textmate';
import { setupControl } from './control';

async function setupLspAlphaTexLanguageSupport(editor: monaco.editor.IStandaloneCodeEditor) {
    const worker = new Worker(new URL('./alphatex-lsp-worker-wrap', import.meta.url), { type: 'module' });

    const reader = new BrowserMessageReader(worker);
    const writer = new BrowserMessageWriter(worker);
    const connection = createProtocolConnection(reader, writer, {
        error(message) {
            alphaTab.Logger.error('LanguageServer', message);
        },
        info(message) {
            alphaTab.Logger.info('LanguageServer', message);
        },
        log(message) {
            alphaTab.Logger.debug('LanguageServer', message);
        },
        warn(message) {
            alphaTab.Logger.warning('LanguageServer', message);
        }
    });
    connection.onError(data => {
        // TODO: Error handling
        alphaTab.Logger.error('LanguageServer', 'Error on lsp connection', ...data);
    });
    connection.onClose(() => {
        // TODO: close handling
        alphaTab.Logger.info('LanguageServer', 'LSP connection closed');
    });

    const initRequest: InitializeParams = {
        processId: null,
        clientInfo: {
            name: 'alphaTab Playground',
            version: '1.7.0'
        },
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

    alphaTab.Logger.info('LanguageClient', 'Start listerning');
    connection.listen();

    alphaTab.Logger.info('LanguageClient', 'Begin initialization');
    const initResponse = await connection.sendRequest(InitializeRequest.type, initRequest);
    alphaTab.Logger.info('LanguageClient', 'Initialization complete');

    const documentUri = 'alphatab://playground.atex';
    const model = editor.getModel()!;
    await connection.sendNotification(DidOpenTextDocumentNotification.type, {
        textDocument: {
            languageId: 'alphatex',
            text: model.getValue(),
            uri: documentUri,
            version: model.getVersionId()
        }
    });

    async function updateDiagnostics() {
        const params: DocumentDiagnosticParams = {
            textDocument: {
                uri: documentUri
            }
        };
        const result = await connection.sendRequest(DocumentDiagnosticRequest.type, params);
        if (result.kind === 'unchanged') {
            return;
        }

        // TODO: global scope vs specific editor?
        monaco.editor.removeAllMarkers('alphatab');
        monaco.editor.setModelMarkers(
            editor.getModel()!,
            'alphatab',
            result.items.map(
                i =>
                    ({
                        severity: lspToMonacoSeverity(i.severity),
                        message: i.message,
                        startLineNumber: i.range.start.line + 1,
                        startColumn: i.range.start.character + 1,
                        endLineNumber: i.range.end.line + 1,
                        endColumn: i.range.end.character + 1,
                        code: i.code?.toString(),
                        tags: i.tags,
                        source: i.source
                        // relatedInformation: i.relatedInformation?.map(r => ())
                    }) satisfies monaco.editor.IMarkerData
            )
        );
    }
    await updateDiagnostics();

    editor.onDidChangeModelContent(async e => {
        await connection.sendNotification(DidChangeTextDocumentNotification.type, {
            textDocument: {
                uri: documentUri,
                version: e.versionId
            },
            contentChanges: e.changes.map(
                c =>
                    ({
                        range: {
                            start: {
                                line: c.range.startLineNumber - 1,
                                character: c.range.startColumn - 1
                            },
                            end: {
                                line: c.range.endLineNumber - 1,
                                character: c.range.endColumn - 1
                            }
                        },
                        text: c.text
                    }) satisfies TextDocumentContentChangeEvent
            )
        });

        await updateDiagnostics();
    });

    // TODO: global scope vs specific editor?
    monaco.languages.registerCompletionItemProvider('alphatex', {
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

    monaco.languages.registerHoverProvider('alphatex', {
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
            return lspHoverToMonacoHover(response);
        }
    });

    monaco.languages.registerSignatureHelpProvider('alphatex', {
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

async function setupBasicAlphaTexLanguageSupport() {
    // basic language init (syntax grammar, language config etc.)
    const wasmBin = await load<ArrayBuffer>(
        new URL('vscode-oniguruma/release/onig.wasm', import.meta.url),
        'arraybuffer'
    );

    const registry = new vsctm.Registry({
        onigLib: (async () => {
            await oniguruma.loadWASM(wasmBin);
            return {
                createOnigScanner(patterns: any) {
                    return new oniguruma.OnigScanner(patterns);
                },
                createOnigString(s) {
                    return new oniguruma.OnigString(s);
                }
            };
        })(),
        loadGrammar: async scopeName => {
            if (scopeName === 'source.alphatex') {
                const grammar = JSON.stringify(textMateGrammar);
                return vsctm.parseRawGrammar(grammar, 'alphatex.tmLanguage.json');
            }
            console.log(`Unknown scope name: ${scopeName}`);
            return null;
        }
    });

    const grammar = (await registry.loadGrammar('source.alphatex'))!;
    monaco.languages.register({
        id: 'alphatex'
    });

    monaco.languages.setLanguageConfiguration('alphatex', languageConfiguration);
    monaco.languages.setTokensProvider('alphatex', {
        getInitialState() {
            return vsctm.INITIAL;
        },
        tokenize(line, state) {
            const tokenizerState = state as vsctm.StateStack;
            const textMateResult = grammar.tokenizeLine(line, tokenizerState, 500);
            if (textMateResult.stoppedEarly) {
                return {
                    endState: state,
                    tokens: textMateResult.tokens.map(t => ({ ...t, scopes: t.scopes.reverse().join(' ') }))
                };
            }

            let endState: vsctm.StateStack;
            if (state.equals(textMateResult.ruleStack)) {
                endState = tokenizerState;
            } else {
                endState = textMateResult.ruleStack;
            }

            return {
                endState,
                tokens: textMateResult.tokens.map(t => ({ ...t, scopes: t.scopes.reverse().join(' ') }))
            };
        }
    });
}
async function setupMonaco() {
    self.MonacoEnvironment = {
        getWorker: () => {
            return new editorWorker();
        }
    };

    await setupBasicAlphaTexLanguageSupport();
}

function trimCode(code: string) {
    return code
        .trim()
        .split(/\r?\n/)
        .map(l => l.trimStart())
        .join('\r\n');
}

async function load<T>(url: URL, type: XMLHttpRequest['responseType']): Promise<T> {
    return new Promise<T>((res, rej) => {
        const req = new XMLHttpRequest();
        req.onload = () => {
            res(req.response);
        };
        req.onerror = e => {
            rej(e);
        };
        req.open('GET', url);
        req.responseType = type;
        req.send();
    });
}

async function setupEditor(api: alphaTab.AlphaTabApi, element: HTMLElement) {
    Split(['#editor-wrap', '#alphatab-wrap']);

    const initialCode = sessionStorage.getItem('alphatex-editor.code') ?? trimCode(element.innerHTML);
    element.innerHTML = '';

    await setupMonaco();

    const editor = monaco.editor.create(element!, {
        value: initialCode,
        language: 'alphatex',
        automaticLayout: true
    });

    function loadTex(tex: string) {
        const importer = new alphaTab.importer.AlphaTexImporter();
        importer.initFromString(tex, api.settings);
        let score: alphaTab.model.Score;
        try {
            score = importer.readScore();
        } catch {
            return;
        }

        sessionStorage.setItem('alphatex-editor.code', tex);
        api.renderTracks(score.tracks);
    }

    editor.onDidChangeModelContent(() => {
        const model = editor.getModel()!;
        const tex = model.getValue();
        loadTex(tex);
    });
    loadTex(initialCode);

    await setupLspAlphaTexLanguageSupport(editor);
}

const req = new XMLHttpRequest();
req.onload = () => {
    document.getElementById('placeholder')!.outerHTML = req.responseText;

    const element = document.getElementById('alphaTab')!;
    delete element.dataset.file;
    delete element.dataset.tracks;

    const editorElement = document.getElementById('editor')!;

    const api = setupControl('#alphaTab', {
        core: {
            file: undefined
        }
    });

    setupEditor(api, editorElement);

    (window as any).at = api;
};
req.open('GET', 'control-template.html');
req.send();

function lspToMonacoSeverity(severity: DiagnosticSeverity | undefined): monaco.MarkerSeverity {
    if (severity === undefined) {
        return monaco.MarkerSeverity.Info;
    } else {
        switch (severity) {
            case DiagnosticSeverity.Error:
                return monaco.MarkerSeverity.Error;
            case DiagnosticSeverity.Hint:
                return monaco.MarkerSeverity.Hint;
            case DiagnosticSeverity.Information:
                return monaco.MarkerSeverity.Info;
            case DiagnosticSeverity.Warning:
                return monaco.MarkerSeverity.Warning;
        }
    }
}
function monacoToLspSignatureHelpTriggerKind(
    triggerKind: monaco.languages.SignatureHelpTriggerKind
): SignatureHelpTriggerKind {
    switch (triggerKind) {
        case monaco.languages.SignatureHelpTriggerKind.ContentChange:
            return SignatureHelpTriggerKind.ContentChange;
        case monaco.languages.SignatureHelpTriggerKind.Invoke:
            return SignatureHelpTriggerKind.Invoked;
        case monaco.languages.SignatureHelpTriggerKind.TriggerCharacter:
            return SignatureHelpTriggerKind.TriggerCharacter;
    }
}
function monacoToLspCompletionTriggerKind(triggerKind: monaco.languages.CompletionTriggerKind): CompletionTriggerKind {
    switch (triggerKind) {
        case monaco.languages.CompletionTriggerKind.Invoke:
            return CompletionTriggerKind.Invoked;
        case monaco.languages.CompletionTriggerKind.TriggerCharacter:
            return CompletionTriggerKind.TriggerCharacter;
        case monaco.languages.CompletionTriggerKind.TriggerForIncompleteCompletions:
            return CompletionTriggerKind.TriggerForIncompleteCompletions;
    }
}

function monacoToLspCompletionItem(value: monaco.languages.CompletionItem): CompletionItem {
    return {
        label: typeof value.label === 'string' ? value.label : value.label.label,
        additionalTextEdits: value.additionalTextEdits?.map(monacoToLspTextEdit),
        command: value.command
            ? {
                  command: value.command.id,
                  title: value.command.title,
                  arguments: value.command.arguments
              }
            : undefined,
        commitCharacters: value.commitCharacters,
        data: undefined,
        detail: value.detail,
        documentation: value.documentation
            ? {
                  kind: typeof value.documentation === 'string' ? 'plaintext' : 'markdown',
                  value:
                      value.documentation === 'string'
                          ? value.documentation
                          : (value.documentation as monaco.IMarkdownString).value
              }
            : undefined,
        filterText: value.filterText,
        insertText: value.insertText,
        insertTextFormat:
            value.insertTextRules === monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                ? InsertTextFormat.Snippet
                : InsertTextFormat.PlainText,
        insertTextMode: undefined,
        kind: monacoToLspCompletionKind(value.kind),
        labelDetails:
            typeof value.label === 'string'
                ? undefined
                : {
                      description: value.label.description,
                      detail: value.label.detail
                  },
        preselect: value.preselect,
        sortText: value.sortText,
        tags: value.tags?.map(monacoToLspTag),
        textEdit: undefined,
        textEditText: undefined
    };
}

function lspToMonacoCompletionItem(
    value: CompletionItem,
    cursorPosition: monaco.languages.CompletionItem['range']
): monaco.languages.CompletionItem {
    return {
        insertText: value.insertText ?? value.label,
        kind: lspToMonacoCompletionKind(value.kind),
        label: {
            label: value.label,
            description: value.labelDetails?.description,
            detail: value.labelDetails?.detail
        },
        range: cursorPosition,
        command: value.command
            ? {
                  id: value.command.command,
                  title: value.command.title,
                  arguments: value.command.arguments
              }
            : undefined,
        additionalTextEdits: value.additionalTextEdits?.map(lspToMonacoTextEdit),
        action: undefined,
        commitCharacters: value.commitCharacters,
        detail: value.detail,
        documentation: value.documentation,
        filterText: value.filterText,
        insertTextRules:
            value.insertTextFormat === InsertTextFormat.Snippet
                ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                : undefined,
        preselect: value.preselect,
        sortText: value.sortText,
        tags: value.tags
    };
}

function lspToMonacoCompletionKind(kind: CompletionItemKind | undefined): monaco.languages.CompletionItemKind {
    if (kind === undefined) {
        return monaco.languages.CompletionItemKind.Text;
    }

    switch (kind) {
        case CompletionItemKind.Text:
            return monaco.languages.CompletionItemKind.Text;
        case CompletionItemKind.Method:
            return monaco.languages.CompletionItemKind.Method;
        case CompletionItemKind.Function:
            return monaco.languages.CompletionItemKind.Function;
        case CompletionItemKind.Constructor:
            return monaco.languages.CompletionItemKind.Constructor;
        case CompletionItemKind.Field:
            return monaco.languages.CompletionItemKind.Field;
        case CompletionItemKind.Variable:
            return monaco.languages.CompletionItemKind.Variable;
        case CompletionItemKind.Class:
            return monaco.languages.CompletionItemKind.Class;
        case CompletionItemKind.Interface:
            return monaco.languages.CompletionItemKind.Interface;
        case CompletionItemKind.Module:
            return monaco.languages.CompletionItemKind.Module;
        case CompletionItemKind.Property:
            return monaco.languages.CompletionItemKind.Property;
        case CompletionItemKind.Unit:
            return monaco.languages.CompletionItemKind.Unit;
        case CompletionItemKind.Value:
            return monaco.languages.CompletionItemKind.Value;
        case CompletionItemKind.Enum:
            return monaco.languages.CompletionItemKind.Enum;
        case CompletionItemKind.Keyword:
            return monaco.languages.CompletionItemKind.Keyword;
        case CompletionItemKind.Snippet:
            return monaco.languages.CompletionItemKind.Snippet;
        case CompletionItemKind.Color:
            return monaco.languages.CompletionItemKind.Color;
        case CompletionItemKind.File:
            return monaco.languages.CompletionItemKind.File;
        case CompletionItemKind.Reference:
            return monaco.languages.CompletionItemKind.Reference;
        case CompletionItemKind.Folder:
            return monaco.languages.CompletionItemKind.Folder;
        case CompletionItemKind.EnumMember:
            return monaco.languages.CompletionItemKind.EnumMember;
        case CompletionItemKind.Constant:
            return monaco.languages.CompletionItemKind.Constant;
        case CompletionItemKind.Struct:
            return monaco.languages.CompletionItemKind.Struct;
        case CompletionItemKind.Event:
            return monaco.languages.CompletionItemKind.Event;
        case CompletionItemKind.Operator:
            return monaco.languages.CompletionItemKind.Operator;
        case CompletionItemKind.TypeParameter:
            return monaco.languages.CompletionItemKind.TypeParameter;
    }
}

function monacoToLspCompletionKind(kind: monaco.languages.CompletionItemKind): CompletionItemKind {
    switch (kind) {
        case monaco.languages.CompletionItemKind.Text:
            return CompletionItemKind.Text;
        case monaco.languages.CompletionItemKind.Method:
            return CompletionItemKind.Method;
        case monaco.languages.CompletionItemKind.Function:
            return CompletionItemKind.Function;
        case monaco.languages.CompletionItemKind.Constructor:
            return CompletionItemKind.Constructor;
        case monaco.languages.CompletionItemKind.Field:
            return CompletionItemKind.Field;
        case monaco.languages.CompletionItemKind.Variable:
            return CompletionItemKind.Variable;
        case monaco.languages.CompletionItemKind.Class:
            return CompletionItemKind.Class;
        case monaco.languages.CompletionItemKind.Interface:
            return CompletionItemKind.Interface;
        case monaco.languages.CompletionItemKind.Module:
            return CompletionItemKind.Module;
        case monaco.languages.CompletionItemKind.Property:
            return CompletionItemKind.Property;
        case monaco.languages.CompletionItemKind.Unit:
            return CompletionItemKind.Unit;
        case monaco.languages.CompletionItemKind.Value:
            return CompletionItemKind.Value;
        case monaco.languages.CompletionItemKind.Enum:
            return CompletionItemKind.Enum;
        case monaco.languages.CompletionItemKind.Keyword:
            return CompletionItemKind.Keyword;
        case monaco.languages.CompletionItemKind.Snippet:
            return CompletionItemKind.Snippet;
        case monaco.languages.CompletionItemKind.Color:
            return CompletionItemKind.Color;
        case monaco.languages.CompletionItemKind.File:
            return CompletionItemKind.File;
        case monaco.languages.CompletionItemKind.Reference:
            return CompletionItemKind.Reference;
        case monaco.languages.CompletionItemKind.Folder:
            return CompletionItemKind.Folder;
        case monaco.languages.CompletionItemKind.EnumMember:
            return CompletionItemKind.EnumMember;
        case monaco.languages.CompletionItemKind.Constant:
            return CompletionItemKind.Constant;
        case monaco.languages.CompletionItemKind.Struct:
            return CompletionItemKind.Struct;
        case monaco.languages.CompletionItemKind.Event:
            return CompletionItemKind.Event;
        case monaco.languages.CompletionItemKind.Operator:
            return CompletionItemKind.Operator;
        case monaco.languages.CompletionItemKind.TypeParameter:
            return CompletionItemKind.TypeParameter;
        case monaco.languages.CompletionItemKind.Customcolor:
            return CompletionItemKind.Color;
        case monaco.languages.CompletionItemKind.User:
            return CompletionItemKind.Text;
        case monaco.languages.CompletionItemKind.Issue:
            return CompletionItemKind.Text;
        case monaco.languages.CompletionItemKind.Tool:
            return CompletionItemKind.Text;
    }
}

function lspToMonacoTextEdit(value: TextEdit): monaco.editor.ISingleEditOperation {
    return {
        range: {
            startColumn: value.range.start.character + 1,
            startLineNumber: value.range.start.line + 1,
            endColumn: value.range.end.character + 1,
            endLineNumber: value.range.end.line + 1
        },
        text: value.newText
    };
}
function monacoToLspTextEdit(value: monaco.editor.ISingleEditOperation): TextEdit {
    return {
        range: {
            start: {
                character: value.range.startColumn - 1,
                line: value.range.startLineNumber - 1
            },
            end: {
                character: value.range.endColumn - 1,
                line: value.range.endLineNumber - 1
            }
        },
        newText: value.text ?? ''
    };
}
function monacoToLspTag(value: monaco.languages.CompletionItemTag): CompletionItemTag {
    switch (value) {
        case monaco.languages.CompletionItemTag.Deprecated:
            return CompletionItemTag.Deprecated;
    }
}

function lspHoverToMonacoHover(response: Hover): monaco.languages.Hover {
    return {
        range: response.range
            ? {
                  startColumn: response.range.start.character + 1,
                  startLineNumber: response.range.start.line + 1,
                  endLineNumber: response.range.end.character + 1,
                  endColumn: response.range.end.character + 1
              }
            : undefined,
        contents: MarkupContent.is(response.contents)
            ? lspToMonacoMarkupContent(response.contents)
            : MarkedString.is(response.contents)
              ? lspToMonacoMarkedString(response.contents)
              : response.contents.flatMap(lspToMonacoMarkedString)
    };
}
function lspToMonacoMarkupContent(contents: MarkupContent): monaco.IMarkdownString[] {
    return [
        {
            value: contents.kind === 'markdown' ? contents.value : markdownToPlainText(contents.value)
        }
    ];
}
function markdownToPlainText(value: string): string {
    return value.replace(/[\\`\`\``*_{}[\]()#+\-.!]/g, '\\$&');
}
const codeBlock = '```';

function lspToMonacoMarkedString(contents: MarkedString): monaco.IMarkdownString[] {
    return [
        {
            value:
                typeof contents === 'string'
                    ? contents
                    : `${codeBlock}${contents.language}\n${contents.value}\n${codeBlock}`
        }
    ];
}
function monacoToLspSignatureHelp(v: monaco.languages.SignatureHelp): SignatureHelp {
    return {
        signatures: v.signatures.map(monacoToLspSignatureInformation),
        activeParameter: v.activeParameter,
        activeSignature: v.activeSignature
    };
}

function monacoToLspSignatureInformation(value: monaco.languages.SignatureInformation): SignatureInformation {
    return {
        label: value.label,
        activeParameter: value.activeParameter,
        documentation: monacoToLspMarkupContent(value.documentation),
        parameters: value.parameters.map(monacoToLspParameterInformation)
    };
}

function monacoToLspParameterInformation(value: monaco.languages.ParameterInformation): ParameterInformation {
    return {
        label: value.label,
        documentation: monacoToLspMarkupContent(value.documentation)
    };
}

function monacoToLspMarkupContent(
    documentation: string | monaco.IMarkdownString | undefined
): string | MarkupContent | undefined {
    if (typeof documentation === 'string' || documentation === undefined) {
        return documentation;
    }
    return {
        kind: 'markdown',
        value: documentation.value
    };
}
function lspToMonacoSignatureHelp(response: SignatureHelp): monaco.languages.SignatureHelpResult {
    return {
        dispose() {},
        value: {
            signatures: response.signatures.map(lspToMonacoSignatureInformation),
            activeParameter: response.activeParameter ?? 0,
            activeSignature: response.activeSignature ?? 0
        }
    };
}

function lspToMonacoSignatureInformation(v: SignatureInformation): monaco.languages.SignatureInformation {
    return {
        label: v.label,
        parameters: v.parameters?.map(lspToMonacoParameterInformation) ?? [],
        activeParameter: v.activeParameter ?? 0,
        documentation: lspToMonacoMarkdownString(v.documentation)
    };
}

function lspToMonacoMarkdownString(documentation: string | MarkupContent | undefined): string | monaco.IMarkdownString {
    if (documentation === undefined) {
        return '';
    }
    if (typeof documentation === 'string') {
        return documentation;
    }
    return lspToMonacoMarkupContent(documentation)[0];
}

function lspToMonacoParameterInformation(v: ParameterInformation): monaco.languages.ParameterInformation {
    return {
        label: v.label,
        documentation: lspToMonacoMarkdownString(v.documentation)
    };
}
