import type * as Monaco from 'monaco-editor';

export type MonacoApi = typeof Monaco;

export const ALPHATEX_LANGUAGE_ID = 'alphatex';
export const ALPHATEX_THEME = 'alphatex-code-surface';

let pending: Promise<MonacoApi> | null = null;

/**
 * Loads Monaco with the alphaTex grammar and theme registered. Browser only;
 * resolves to the same instance for every caller.
 */
export function loadMonaco(): Promise<MonacoApi> {
    pending ??= initialize().catch((e) => {
        pending = null;
        throw e;
    });
    return pending;
}

async function initialize(): Promise<MonacoApi> {
    self.MonacoEnvironment = {
        getWorker: () => new Worker(new URL('./editor.worker.ts', import.meta.url)),
    };

    const [monaco, { addTextMateGrammarSupport, registerAlphaTexGrammar }, onigurumaWasm] = await Promise.all([
        import('monaco-editor'),
        import('@coderline/alphatab-monaco'),
        fetch(new URL('vscode-oniguruma/release/onig.wasm', import.meta.url)).then((r) => {
            if (!r.ok) { throw new Error(`[AlphaTexEditor] Failed to fetch onig.wasm: ${r.status}`); }
            return r.arrayBuffer();
        }),
    ]);

    await registerAlphaTexGrammar(addTextMateGrammarSupport(onigurumaWasm));
    defineTheme(monaco);
    return monaco;
}

/**
 * The editor background stays transparent so the host's `--at-code-surface`
 * shows through in either color mode; the syntax palette is mode-independent.
 */
function defineTheme(monaco: MonacoApi): void {
    const style = getComputedStyle(document.documentElement);
    const color = (name: string) => style.getPropertyValue(name).trim().replace(/^#/, '');

    const plain = color('--at-syntax-plain');
    const comment = color('--at-syntax-comment');
    const punctuation = color('--at-syntax-punctuation');

    monaco.editor.defineTheme(ALPHATEX_THEME, {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: '', foreground: plain },
            { token: 'comment', foreground: comment, fontStyle: 'italic' },
            { token: 'string', foreground: color('--at-syntax-string') },
            { token: 'punctuation.definition.string', foreground: color('--at-syntax-string') },
            { token: 'constant.character.escape', foreground: color('--at-syntax-type') },
            { token: 'keyword.metadata', foreground: color('--at-syntax-keyword') },
            { token: 'constant.numeric', foreground: color('--at-syntax-number') },
            { token: 'variable.identifier', foreground: color('--at-syntax-function') },
            { token: 'punctuation', foreground: punctuation },
            { token: 'punctuation.bar', foreground: color('--at-syntax-type') },
            { token: 'invalid', foreground: color('--at-syntax-invalid') },
        ],
        colors: {
            'editor.background': '#00000000',
            'editorGutter.background': '#00000000',
            'editor.foreground': `#${plain}`,
            'editorLineNumber.foreground': `#${comment}80`,
            'editorLineNumber.activeForeground': `#${punctuation}`,
            'editor.lineHighlightBackground': '#ffffff08',
            'editor.lineHighlightBorder': '#00000000',
        },
    });
}
