import * as alphaTab from '@coderline/alphatab';
import { registerAlphaTexGrammar } from '@coderline/alphatab-monaco/alphatex';
import { basicEditorLspIntegration } from '@coderline/alphatab-monaco/lsp';
import { addTextMateGrammarSupport } from '@coderline/alphatab-monaco/textmate';
import * as monaco from 'monaco-editor';
// @ts-expect-error
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import Split from 'split.js';
import { setupControl } from './control';

async function setupLspAlphaTexLanguageSupport(editor: monaco.editor.IStandaloneCodeEditor) {
    await basicEditorLspIntegration(
        editor,
        new Worker(new URL('./alphaTexLanguageServerWrap', import.meta.url), { type: 'module' }),
        {
            logger: {
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
            },
            clientInfo: {
                name: 'alphaTab Playground',
                version: 'latest'
            },
            languageId: 'alphatex'
        }
    );
}

async function setupBasicAlphaTexLanguageSupport() {
    const onigurumaWasm = await load<ArrayBuffer>(
        new URL('vscode-oniguruma/release/onig.wasm', import.meta.url),
        'arraybuffer'
    );

    const textMateSupport = addTextMateGrammarSupport(onigurumaWasm);
    await registerAlphaTexGrammar(textMateSupport);
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

    const initialCode = sessionStorage.getItem('alphatex-editor.code') ?? trimCode(element.innerText);
    element.innerText = '';

    await setupMonaco();

    const editor = monaco.editor.create(element!, {
        value: initialCode,
        language: 'alphatex',
        automaticLayout: true
    });

    let fromTex = true;
    api.settings.exporter.comments = true;
    api.settings.exporter.indent = 2;
    api.scoreLoaded.on(score => {
        if (!fromTex) {
            const exporter = new alphaTab.exporter.AlphaTexExporter();
            const tex = exporter.exportToString(score, api.settings);
            editor.getModel()!.setValue(tex);
        }
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
        fromTex = true;
        api.renderTracks(score.tracks);
        fromTex = false;
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
