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
        getWorker: () => new Worker(new URL('./editor.worker.ts', import.meta.url), { type: 'module' }),
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

const TYPED_TOKEN = /\\?[\w-]*$/;
const DIAGNOSTICS_DELAY_MS = 150;

/** The token being typed before the cursor, including a leading `\\` of a metadata tag. */
function typedTokenRange(model: Monaco.editor.ITextModel, position: Monaco.Position): Monaco.IRange {
    const before = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
    const typed = TYPED_TOKEN.exec(before)?.[0].length ?? 0;
    return {
        startLineNumber: position.lineNumber,
        startColumn: position.column - typed,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
    };
}

/**
 * Connects `editor` to its own alphaTex language server worker: diagnostics after a pause in typing,
 * completion of the typed token, hover and signature help. Disposing stops the server, also while
 * it still starts.
 */
export function connectLanguageServer(editor: Monaco.editor.IStandaloneCodeEditor): Monaco.IDisposable {
    const worker = new Worker(new URL('./alphatex-lsp.worker.ts', import.meta.url), { type: 'module' });
    let disposed = false;
    let integration: Monaco.IDisposable | null = null;
    import('@coderline/alphatab-monaco/lsp')
        .then(({ basicEditorLspIntegration }) =>
            basicEditorLspIntegration(editor, worker, {
                languageId: ALPHATEX_LANGUAGE_ID,
                clientInfo: { name: 'alphaTab UI' },
                diagnosticsDelay: DIAGNOSTICS_DELAY_MS,
                completionRange: typedTokenRange,
                logger: {
                    error: (m) => console.error('[AlphaTexEditor]', m),
                    warn: (m) => console.warn('[AlphaTexEditor]', m),
                    info: () => {},
                    log: () => {},
                },
            }),
        )
        .then((connected) => {
            if (disposed) { connected.dispose(); }
            else { integration = connected; }
        })
        .catch((e: unknown) => {
            if (!disposed) { console.error('[AlphaTexEditor] Language server failed to start', e); }
        });
    return {
        dispose() {
            if (disposed) { return; }
            disposed = true;
            integration?.dispose();
            worker.terminate();
        },
    };
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
