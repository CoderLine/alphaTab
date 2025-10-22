import * as monaco from 'monaco-editor';

import { setupControl } from './control';
import * as alphaTab from '@src/alphaTab.main';

import * as vsctm from 'vscode-textmate';
import * as oniguruma from 'vscode-oniguruma';

function trimCode(code: string) {
    return code
        .trim()
        .split(/\r?\n/)
        .map(l => l.trimLeft())
        .join('\r\n');
}

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
// import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
// import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
// import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

async function setupMonaco() {
    self.MonacoEnvironment = {
        getWorker: (_workerId, label) => {
            switch (label) {
                // case 'json':
                //     return getWorkerModule('/monaco-editor/esm/vs/language/json/json.worker?worker', label);
                // case 'css':
                // case 'scss':
                // case 'less':
                //     return getWorkerModule('/monaco-editor/esm/vs/language/css/css.worker?worker', label);
                // case 'html':
                // case 'handlebars':
                // case 'razor':
                //     return getWorkerModule('/monaco-editor/esm/vs/language/html/html.worker?worker', label);
                // case 'typescript':
                // case 'javascript':
                //     return getWorkerModule('/monaco-editor/esm/vs/language/typescript/ts.worker?worker', label);
                default:
                    return new editorWorker();
            }
        }
    };

    const wasmBin = await new Promise<ArrayBuffer>((res, rej) => {
        const req = new XMLHttpRequest();
        req.onload = () => {
            res(req.response);
        };
        req.onerror = e => {
            rej(e);
        };
        const onigWasm = new URL('vscode-oniguruma/release/onig.wasm', import.meta.url);
        req.open('GET', onigWasm);
        req.responseType = 'arraybuffer';
        req.send();
    });

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
                const grammar = await new Promise<string>((res, rej) => {
                    const req = new XMLHttpRequest();
                    req.onload = () => {
                        res(req.responseText);
                    };
                    req.onerror = e => {
                        rej(e);
                    };
                    const onigWasm = new URL('./alphatex.tmlanguage.json', import.meta.url);
                    req.open('GET', onigWasm);
                    req.send();
                });
                return vsctm.parseRawGrammar(grammar, 'alphatex.tmlanguage.json');
            }
            console.log(`Unknown scope name: ${scopeName}`);
            return null;
        }
    });

    const grammar = (await registry.loadGrammar('source.alphatex'))!;
    monaco.languages.register({
        id: 'alphatex'
    });
    monaco.languages.setLanguageConfiguration('alphatex', {
        comments: {
            lineComment: { comment: '//', noIndent: false },
            blockComment: ['/*', '*/']
        },
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')']
        ],
        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" }
        ],
        surroundingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" }
        ]
    });
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

async function setupEditor(api: alphaTab.AlphaTabApi, element: HTMLElement) {
    const initialCode = sessionStorage.getItem('alphatex-editor.code') ?? trimCode(element.innerHTML);
    element.innerHTML = '';

    await setupMonaco();

    const editor = monaco.editor.create(element!, {
        value: initialCode,
        language: 'alphatex',
        automaticLayout: true
    });
    editor.onDidChangeModelContent(() => {
        monaco.editor.removeAllMarkers('alphaTab');
        const tex = editor.getModel()!.getValue();
        api.tex(tex, 'all');
        sessionStorage.setItem('alphatex-editor.code', tex);
    });
    api.tex(initialCode, 'all');

    api.error.on(e => {
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
            const markers: monaco.editor.IMarkerData[] = [];
            for (const d of atError.iterateDiagnostics()) {
                const marker: monaco.editor.IMarkerData = {
                    severity: monaco.MarkerSeverity.Info,
                    message: d.message,
                    startLineNumber: d.start!.line,
                    startColumn: d.start!.col - 1,
                    endLineNumber: d.end!.line,
                    endColumn: d.end!.col - 1,
                    code: `AT${d.code}`
                };
                switch (d.severity) {
                    case alphaTab.importer.alphaTex.AlphaTexDiagnosticsSeverity.Hint:
                        marker.severity = monaco.MarkerSeverity.Hint;
                        break;
                    case alphaTab.importer.alphaTex.AlphaTexDiagnosticsSeverity.Warning:
                        marker.severity = monaco.MarkerSeverity.Warning;
                        break;
                    case alphaTab.importer.alphaTex.AlphaTexDiagnosticsSeverity.Error:
                        marker.severity = monaco.MarkerSeverity.Error;
                        break;
                }
                markers.push(marker);
            }

            monaco.editor.setModelMarkers(editor.getModel()!, 'alphaTab', markers);
        }
    });
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
