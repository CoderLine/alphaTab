import {
    ExportMenu,
    IconButton,
    IconCode,
    IconSliders,
    IconTracks,
    IconUpload,
    PlayerView,
    type ScoreDocumentState,
    SettingsPanel,
    TrackPanel,
    usePersistedState,
    usePlayerSelector,
    useSchemaSettings
} from '@coderline/alphatab-ui';
import type React from 'react';
import { useCallback, useRef } from 'react';
import styles from './demo-player.module.scss';

type PanelId = 'editor' | 'tracks' | 'settings';

interface Layout {
    panels: Record<PanelId, boolean>;
    editorWidth: number;
}

const DEFAULT_LAYOUT: Layout = {
    panels: { editor: true, tracks: true, settings: false },
    editorWidth: 480
};

export interface DemoPlayerViewProps {
    /** Prefix of the storage keys of the demo's panel layout and settings overrides. */
    demo: string;
    /** The open document; drives the file name, file opening, reloads and the notation message. */
    doc?: ScoreDocumentState;
    /** Name of the score for the header and the downloads, when there is no `doc`. */
    fileName?: string;
    /** Imports the score again, for settings the importer reads; defaults to `doc.reload`. */
    onReload?: () => void;
    /** Opens a picked or dropped file; defaults to `doc.openFile`. */
    onOpenFile?: (file: File) => void;
    /** Content of the resizable editor panel. */
    editor?: (close: () => void) => React.ReactNode;
    /** Between the header and the player, e.g. a video. */
    beforeWorkspace?: React.ReactNode;
    /** See `PlayerViewProps.scoreOverlay`. */
    scoreOverlay?: React.ReactNode;
}

const FILE_ACCEPT = '.gp,.gp3,.gp4,.gp5,.gpx,.gp7,.gp8,.xml,.musicxml,.mxl,.capx,.alphatex,.atex,.tex,.txt';
const noop = () => {};

/**
 * The player of a demo: the shared `PlayerView` with a header, the track panel, the settings panel,
 * the backing-track waveform and file drops. Must be rendered inside `<PlayerProvider>`.
 */
export const DemoPlayerView: React.FC<DemoPlayerViewProps> = ({
    demo,
    doc,
    fileName,
    onReload,
    onOpenFile,
    editor,
    beforeWorkspace,
    scoreOverlay
}) => {
    const hasScore = usePlayerSelector(s => s.currentScore !== null);
    const settings = useSchemaSettings({
        onReload: onReload ?? doc?.reload ?? noop,
        overridesKey: `alphatab.playground.${demo}.settings.v1`,
        viewKey: `alphatab.playground.${demo}.view.v1`
    });
    const [layout, setLayout] = usePersistedState<Layout>(`alphatab.playground.${demo}.layout.v1`, DEFAULT_LAYOUT);
    const panels = { ...DEFAULT_LAYOUT.panels, ...layout.panels };
    const setPanel = useCallback(
        (panel: PanelId, open: boolean) =>
            setLayout(l => ({ ...l, panels: { ...DEFAULT_LAYOUT.panels, ...l.panels, [panel]: open } })),
        [setLayout]
    );

    const docOpenFile = doc?.openFile;
    const openFile = useCallback(
        (file: File) => {
            if (onOpenFile) {
                onOpenFile(file);
            } else if (docOpenFile) {
                void docOpenFile(file);
            }
        },
        [onOpenFile, docOpenFile]
    );
    const canOpen = !!onOpenFile || !!docOpenFile;

    const name = doc?.document?.fileName ?? fileName;
    const texErrors = doc?.texResult?.diagnostics.filter(d => d.severity === 'error') ?? [];
    const message = doc?.loadError
        ? `Could not open ${name}: ${doc.loadError}`
        : !hasScore && texErrors.length > 0
          ? 'The alphaTex has errors, see the editor'
          : !hasScore && doc
            ? `Loading ${name ?? ''}…`
            : null;

    return (
        <PlayerView
            header={
                <>
                    <DemoHeader
                        fileName={name}
                        panels={panels}
                        hasEditor={!!editor}
                        onTogglePanel={panel => setPanel(panel, !panels[panel])}
                        onOpenFile={canOpen ? openFile : undefined}
                    />
                    {beforeWorkspace}
                </>
            }
            editor={
                editor && panels.editor
                    ? {
                          content: editor(() => setPanel('editor', false)),
                          size: layout.editorWidth,
                          min: 280,
                          max: 1200,
                          onResize: editorWidth => setLayout(l => ({ ...l, editorWidth })),
                          resizeLabel: 'Resize editor'
                      }
                    : null
            }
            start={panels.tracks && <TrackPanel onClose={() => setPanel('tracks', false)} />}
            end={panels.settings && <SettingsPanel settings={settings} onClose={() => setPanel('settings', false)} />}
            notationMessage={message}
            notationDimmed={texErrors.length > 0}
            scoreOverlay={scoreOverlay}
            renderingIndicator
            waveform
            onDropFile={canOpen ? openFile : undefined}
        />
    );
};

interface DemoHeaderProps {
    fileName?: string;
    panels: Record<PanelId, boolean>;
    hasEditor: boolean;
    onTogglePanel: (panel: PanelId) => void;
    onOpenFile?: (file: File) => void;
}

const DemoHeader: React.FC<DemoHeaderProps> = ({ fileName, panels, hasEditor, onTogglePanel, onOpenFile }) => {
    const score = usePlayerSelector(s => s.currentScore);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const title = score?.title?.trim();
    const artist = score?.artist?.trim();

    return (
        <header className={styles.header}>
            <div className={styles.document}>
                <span className={styles.fileName}>{fileName ?? 'score'}</span>
                {(title || artist) && (
                    <span className={styles.title}>{[title, artist].filter(Boolean).join(' · ')}</span>
                )}
            </div>
            <span className={styles.spacer} />
            <div className={styles.group}>
                {hasEditor && (
                    <IconButton
                        label="alphaTex editor"
                        text="Editor"
                        active={panels.editor}
                        aria-pressed={panels.editor}
                        onClick={() => onTogglePanel('editor')}>
                        <IconCode size={14} aria-hidden="true" />
                    </IconButton>
                )}
                <IconButton
                    label="Tracks"
                    text="Tracks"
                    active={panels.tracks}
                    aria-pressed={panels.tracks}
                    onClick={() => onTogglePanel('tracks')}>
                    <IconTracks size={14} aria-hidden="true" />
                </IconButton>
                <IconButton
                    label="Settings"
                    text="Settings"
                    active={panels.settings}
                    aria-pressed={panels.settings}
                    onClick={() => onTogglePanel('settings')}>
                    <IconSliders size={14} aria-hidden="true" />
                </IconButton>
            </div>
            <span className={styles.divider} />
            <div className={styles.group}>
                {onOpenFile && (
                    <>
                        <IconButton
                            label="Open a file, or drop one onto the player"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}>
                            <IconUpload size={14} aria-hidden="true" />
                        </IconButton>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={FILE_ACCEPT}
                            hidden
                            onChange={e => {
                                const file = e.target.files?.[0];
                                e.target.value = '';
                                if (file) {
                                    onOpenFile(file);
                                }
                            }}
                        />
                    </>
                )}
                <ExportMenu fileName={fileName} />
            </div>
        </header>
    );
};
