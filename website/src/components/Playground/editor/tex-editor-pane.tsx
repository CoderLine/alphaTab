import React, { useRef } from 'react';
import { useAlphaTabApi, useAlphaTabModule, useAlphaTabSelector } from '@site/src/alphatab-react';
import { AlphaTexEditor, type AlphaTexEditorHandle } from '@site/src/components/AlphaTexEditor';
import { RenderStatus, describeScore } from '@site/src/components/AlphaTexEditor/render-status';
import { IconClose, IconCode, IconFileMusic } from '@site/src/components/landing/shared/icons';
import { NOT_DESKTOP_QUERY, useMediaQuery } from '@site/src/components/landing/shared/use-media-query';
import { withExtension } from '../download';
import type { PlaygroundDocumentState } from '../use-playground-document';
import styles from './editor.module.scss';

interface TexEditorPaneProps {
    doc: PlaygroundDocumentState;
    onClose: () => void;
}

export const TexEditorPane: React.FC<TexEditorPaneProps> = ({ doc, onClose }) => {
    const { document, text, setText, texResult } = doc;
    const editorRef = useRef<AlphaTexEditorHandle>(null);
    const compact = useMediaQuery(NOT_DESKTOP_QUERY);
    const score = useAlphaTabSelector((s) => s.currentScore);
    const totalBars = useAlphaTabSelector((s) => s.totalBars);
    const isRendering = useAlphaTabSelector((s) => s.isRendering);

    const diagnostics = texResult?.diagnostics ?? [];
    const errors = diagnostics.filter((d) => d.severity === 'error');
    const warnings = diagnostics.filter((d) => d.severity === 'warning');
    const isTex = document?.kind === 'tex';
    const modified = isTex && text !== document.originalText;

    return (
        <section className={styles.pane} aria-label="alphaTex editor">
            <header className={styles.header}>
                <IconFileMusic size={12} aria-hidden="true" />
                <span className={styles.fileName}>{isTex ? document.fileName : 'alphaTex'}</span>
                {modified && <span className={styles.modified} title="Edited">●</span>}
                {modified && (
                    <button type="button" className={styles.headerBtn} onClick={() => setText(document.originalText)}>
                        Revert
                    </button>
                )}
                <button type="button" className={styles.close} onClick={onClose} aria-label="Close editor">
                    <IconClose />
                </button>
            </header>

            {isTex ? (
                <>
                    <div className={styles.body}>
                        <AlphaTexEditor
                            key={document.id}
                            ref={editorRef}
                            value={text}
                            onChange={setText}
                            compact={compact}
                            ariaLabel={`alphaTex source: ${document.fileName}`}
                        />
                    </div>
                    <footer className={styles.status}>
                        <RenderStatus
                            updating={!texResult || texResult.text !== text || isRendering}
                            errors={errors}
                            warnings={warnings}
                            hasScore={!!score}
                            onReveal={(d) => d?.start && editorRef.current?.revealPosition(d.start.line, d.start.col)}
                            surface="code"
                        />
                        <span className={styles.spacer} />
                        <span className={styles.meta}>{describeScore(score, totalBars)}</span>
                    </footer>
                </>
            ) : (
                <ConvertPlaceholder doc={doc} />
            )}
        </section>
    );
};

const ConvertPlaceholder: React.FC<{ doc: PlaygroundDocumentState }> = ({ doc }) => {
    const api = useAlphaTabApi();
    const module = useAlphaTabModule();
    const score = useAlphaTabSelector((s) => s.currentScore);
    const fileName = doc.document?.fileName ?? 'score';

    const convert = () => {
        if (!api?.score || !module) return;
        const tex = new module.exporter.AlphaTexExporter().exportToString(api.score, api.settings);
        doc.openTex(withExtension(fileName, 'alphatex'), tex);
    };

    return (
        <div className={styles.placeholder}>
            <IconCode size={22} aria-hidden="true" />
            <p>
                <strong>{fileName}</strong> is a binary file. Convert it to alphaTex to edit it here.
            </p>
            <p className={styles.placeholderNote}>
                The conversion covers what alphaTex can express; an embedded backing track stays behind.
            </p>
            <button type="button" className={styles.convertBtn} onClick={convert} disabled={!score}>
                Convert to alphaTex
            </button>
        </div>
    );
};
