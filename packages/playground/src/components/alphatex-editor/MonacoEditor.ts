import * as alphaTab from '@coderline/alphatab';
import { registerAlphaTexGrammar } from '@coderline/alphatab-monaco/alphatex';
import { basicEditorLspIntegration } from '@coderline/alphatab-monaco/lsp';
import { addTextMateGrammarSupport } from '@coderline/alphatab-monaco/textmate';
import * as monaco from 'monaco-editor';
// @ts-expect-error worker import handled by Vite
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { type Mountable, css, html, injectStyles, parseHtml } from '../../util/Dom';

injectStyles(
    'MonacoEditor',
    css`
    .at-monaco { height: 100%; }
`
);

let monacoSetupPromise: Promise<void> | null = null;

async function setupMonaco(): Promise<void> {
    if (!monacoSetupPromise) {
        monacoSetupPromise = (async () => {
            self.MonacoEnvironment = {
                getWorker: () => new editorWorker()
            };
            const onigurumaWasm = await fetchArrayBuffer(
                new URL('vscode-oniguruma/release/onig.wasm', import.meta.url).toString()
            );
            const textMateSupport = addTextMateGrammarSupport(onigurumaWasm);
            await registerAlphaTexGrammar(textMateSupport);
        })();
    }
    return monacoSetupPromise;
}

async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }
    return res.arrayBuffer();
}

export interface MonacoEditorProps {
    initialCode: string;
}

export class MonacoEditor implements Mountable {
    readonly root: HTMLElement;
    readonly ready: Promise<void>;
    private editor: monaco.editor.IStandaloneCodeEditor | null = null;

    onChange: ((tex: string) => void) | null = null;

    constructor(private props: MonacoEditorProps) {
        this.root = parseHtml(html`<div class="at-monaco"></div>`);
        this.ready = this.init();
    }

    private async init(): Promise<void> {
        await setupMonaco();
        this.editor = monaco.editor.create(this.root, {
            value: this.props.initialCode,
            language: 'alphatex',
            automaticLayout: true
        });
        this.editor.onDidChangeModelContent(() => {
            this.onChange?.(this.editor!.getModel()!.getValue());
        });
        await basicEditorLspIntegration(
            this.editor,
            new Worker(new URL('../../../alphatexLanguageServerWrap.ts', import.meta.url), { type: 'module' }),
            {
                logger: {
                    error: m => alphaTab.Logger.error('LanguageServer', m),
                    info: m => alphaTab.Logger.info('LanguageServer', m),
                    log: m => alphaTab.Logger.debug('LanguageServer', m),
                    warn: m => alphaTab.Logger.warning('LanguageServer', m)
                },
                clientInfo: { name: 'alphaTab Playground', version: 'latest' },
                languageId: 'alphatex'
            }
        );
    }

    getValue(): string {
        return this.editor?.getModel()?.getValue() ?? this.props.initialCode;
    }

    setValue(value: string): void {
        this.editor?.getModel()?.setValue(value);
    }

    dispose(): void {
        this.editor?.dispose();
        this.editor = null;
        this.root.remove();
    }
}
