import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import clsx from 'clsx';
import type * as Monaco from 'monaco-editor';
import type { MonacoApi } from './monaco-env';
import styles from './styles.module.scss';

export { useNearViewport } from './use-near-viewport';

export interface AlphaTexEditorHandle {
    /** Moves the cursor to the 1-based position, scrolls it into view and focuses the editor. */
    revealPosition(line: number, col: number): void;
}

export interface AlphaTexEditorProps {
    value: string;
    onChange: (value: string) => void;
    /** Narrow-screen tuning: word wrap and a smaller font. */
    compact?: boolean;
    ariaLabel?: string;
    className?: string;
}

let modelCounter = 0;

/**
 * Monaco-based alphaTex editor with language-server assistance. Until Monaco
 * has loaded (or if it fails to), a plain textarea edits the same value.
 */
export const AlphaTexEditor = React.forwardRef<AlphaTexEditorHandle, AlphaTexEditorProps>(
    ({ value, onChange, compact = false, ariaLabel = 'alphaTex source', className }, ref) => {
        const hostRef = useRef<HTMLDivElement>(null);
        const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
        const [ready, setReady] = useState(false);
        const valueRef = useRef(value);
        valueRef.current = value;
        const onChangeRef = useRef(onChange);
        onChangeRef.current = onChange;
        const compactRef = useRef(compact);
        compactRef.current = compact;

        useImperativeHandle(ref, () => ({
            revealPosition(line, col) {
                const editor = editorRef.current;
                if (!editor) return;
                const position = { lineNumber: line, column: col };
                editor.setPosition(position);
                editor.revealPositionInCenterIfOutsideViewport(position);
                editor.focus();
            },
        }), []);

        useEffect(() => {
            const host = hostRef.current;
            if (!host) return;
            let cancelled = false;
            let cleanup: (() => void) | undefined;

            void Promise.all([import('./monaco-env'), import('./lsp-bridge')])
                .then(async ([env, bridge]) => {
                    const monaco = await env.loadMonaco();
                    if (cancelled) return;
                    cleanup = mountEditor(monaco, env, bridge.connectAlphaTexLsp, host);
                })
                .catch((e) => console.error('[AlphaTexEditor] Monaco failed to load; using the plain editor', e));

            function mountEditor(
                monaco: MonacoApi,
                env: typeof import('./monaco-env'),
                connect: typeof import('./lsp-bridge').connectAlphaTexLsp,
                container: HTMLDivElement,
            ): () => void {
                const model = monaco.editor.createModel(
                    valueRef.current,
                    env.ALPHATEX_LANGUAGE_ID,
                    monaco.Uri.parse(`inmemory://alphatex/${++modelCounter}.alphatex`),
                );
                // Suggest, hover and signature widgets live on <body> so no ancestor's stacking context or overflow can cover them.
                const overflowHost = document.createElement('div');
                overflowHost.className = clsx('monaco-editor', styles.overflowHost);
                document.body.appendChild(overflowHost);
                const editor = monaco.editor.create(container, {
                    model,
                    theme: env.ALPHATEX_THEME,
                    ariaLabel,
                    automaticLayout: true,
                    fixedOverflowWidgets: true,
                    overflowWidgetsDomNode: overflowHost,
                    fontFamily: getComputedStyle(container).fontFamily,
                    ...sizeOptions(compactRef.current),
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    scrollbar: { alwaysConsumeMouseWheel: false, verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                    overviewRulerLanes: 0,
                    hideCursorInOverviewRuler: true,
                    folding: false,
                    glyphMargin: false,
                    lineNumbersMinChars: 3,
                    padding: { top: 16, bottom: 16 },
                    tabSize: 2,
                    renderWhitespace: 'none',
                    contextmenu: false,
                    wordBasedSuggestions: 'off',
                });
                const lsp = connect(monaco, editor);
                const changes = model.onDidChangeContent(() => {
                    const next = model.getValue();
                    if (next !== valueRef.current) onChangeRef.current(next);
                });
                editorRef.current = editor;
                setReady(true);

                return () => {
                    editorRef.current = null;
                    changes.dispose();
                    lsp.dispose();
                    editor.dispose();
                    model.dispose();
                    overflowHost.remove();
                };
            }

            return () => {
                cancelled = true;
                cleanup?.();
                setReady(false);
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        useEffect(() => {
            const editor = editorRef.current;
            const model = editor?.getModel();
            if (!editor || !model || model.getValue() === value) return;
            editor.pushUndoStop();
            editor.executeEdits('external', [{ range: model.getFullModelRange(), text: value }]);
            editor.pushUndoStop();
        }, [value, ready]);

        useEffect(() => {
            editorRef.current?.updateOptions(sizeOptions(compact));
        }, [compact, ready]);

        return (
            <div className={clsx(styles.root, compact && styles.compact, className)}>
                {!ready && (
                    <textarea
                        className={styles.fallback}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        spellCheck={false}
                        aria-label={ariaLabel}
                    />
                )}
                <div ref={hostRef} className={clsx(styles.host, !ready && styles.hostLoading)} />
            </div>
        );
    },
);
AlphaTexEditor.displayName = 'AlphaTexEditor';

function sizeOptions(compact: boolean): Monaco.editor.IEditorOptions {
    return compact
        ? { fontSize: 12, lineHeight: 19, wordWrap: 'on' }
        : { fontSize: 13, lineHeight: 21, wordWrap: 'off' };
}
