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

// @ts-expect-error
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';

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

async function setupMonaco() {
    self.MonacoEnvironment = {
        getWorker: () => {
            return new editorWorker();
        }
    };

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
                const grammar = await load<string>(new URL('./alphatex.tmlanguage.json', import.meta.url), 'text');
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

    const languageConfiguration = JSON.parse(
        await load<string>(new URL('./alphatex.language-configuration.json', import.meta.url), 'text')
    );
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

    monaco.languages.registerDocumentSemanticTokensProvider('alphatex', {
        getLegend() {
            return {
                tokenTypes: [
                    'number',

                    'identifier',

                    'valuelist',

                    'metadata'
                ],
                tokenModifiers: [
                    // number.
                    'fret',
                    'string',
                    'duration',

                    // identifier.
                    'property',
                    'beat',
                    'note',

                    // metadata.
                    'structural',
                    'score',
                    'staff',
                    'bar'
                ]
            };
        },
        provideDocumentSemanticTokens(model) {
            const data: number[] = [];

            if(model.getVersionId() === astId) {
                
            }

            return {
                data: new Uint32Array(data)
            };
        },
        releaseDocumentSemanticTokens(resultId) {}
    });
}

let ast: alphaTab.importer.alphaTex.AlphaTexScoreNode | undefined;
let astId: number = -1;
async function setupEditor(api: alphaTab.AlphaTabApi, element: HTMLElement) {
    const initialCode = sessionStorage.getItem('alphatex-editor.code') ?? trimCode(element.innerHTML);
    element.innerHTML = '';

    await setupMonaco();

    function handleError(e: Error) {
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
    }

    const editor = monaco.editor.create(element!, {
        value: initialCode,
        language: 'alphatex',
        automaticLayout: true
    });

    function loadTex(tex: string) {
        monaco.editor.removeAllMarkers('alphaTab');
        const model = editor.getModel()!;
        const importer = new AlphaTexImporter();
        importer.initFromString(tex, api.settings);
        let score: alphaTab.model.Score;
        try {
            score = importer.readScore();
        } catch (e) {
            handleError(e as Error);
            return;
        }

        astId = model?.getVersionId();
        ast = importer.scoreNode;
        sessionStorage.setItem('alphatex-editor.code', tex);

        api.renderTracks(score.tracks);
    }

    editor.onDidChangeModelContent(() => {
        const model = editor.getModel()!;
        const tex = model.getValue();
        loadTex(tex);
    });
    loadTex(initialCode);

    api.error.on(e => {
        handleError(e);
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
