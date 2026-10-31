import React, { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import {
    PlayerHost,
    PlayerProvider,
    usePlayerSelector,
    IconUpload,
    PHONE_QUERY,
    useMediaQuery,
    TexEditorPane,
    SettingsPanel,
    useSchemaSettings,
    useScoreDocument,
    TrackPanel,
    Transport,
    ResizeHandle,
    useFileDrop,
    usePersistedState,
} from '@coderline/alphatab-ui';
import { PlaygroundHeader, type PanelId } from './header';
import { MediaSyncPanel } from './media-sync/media-sync-panel';
import { MediaSyncProvider, useMediaSync } from './media-sync/media-sync-context';
import { MusicFontProvider, MusicFontSetting } from './music-font';
import { YouTubeDock } from './media-sync/youtube-dock';
import { PLAYGROUND_DOCUMENTS } from './sources';
import styles from './playground.module.scss';

const SIDE_PANELS: PanelId[] = ['editor', 'tracks', 'settings'];

interface Layout {
    panels: Record<PanelId, boolean>;
    editorWidth: number;
    syncHeight: number;
}

const DEFAULT_LAYOUT: Layout = {
    panels: { editor: false, tracks: true, settings: false, sync: false },
    editorWidth: 420,
    syncHeight: 260,
};

/** The full-page alphaTab Playground. Browser-only. */
export const Playground: React.FC = () => (
    <MusicFontProvider>
        {(font) => (
            <PlayerProvider key={font.key} fonts="noto">
                <MediaSyncProvider>
                    <PlaygroundApp musicFont={<MusicFontSetting musicFont={font.musicFont} setMusicFont={font.setMusicFont} />} />
                </MediaSyncProvider>
            </PlayerProvider>
        )}
    </MusicFontProvider>
);

const PlaygroundApp: React.FC<{ musicFont: React.ReactNode }> = ({ musicFont }) => {
    const doc = useScoreDocument(PLAYGROUND_DOCUMENTS);
    const hasScore = usePlayerSelector((s) => s.currentScore !== null);
    const settings = useSchemaSettings({ onReload: doc.reload });
    const { resetDocument } = useMediaSync();
    const isPhone = useMediaQuery(PHONE_QUERY);
    const [layout, setLayout] = usePersistedState<Layout>('alphatab.playground-layout.v1', DEFAULT_LAYOUT);
    // Phones show side panels as sheets over the notation: one at a time, closed on load and not persisted.
    const [phoneSheet, setPhoneSheet] = useState<PanelId | null>(null);
    const persistedPanels = { ...DEFAULT_LAYOUT.panels, ...layout.panels };
    const panels: Record<PanelId, boolean> = isPhone
        ? { editor: phoneSheet === 'editor', tracks: phoneSheet === 'tracks', settings: phoneSheet === 'settings', sync: persistedPanels.sync }
        : persistedPanels;
    const workspaceRef = useRef<HTMLDivElement>(null);

    const togglePanel = useCallback(
        (panel: PanelId) => {
            if (isPhone && SIDE_PANELS.includes(panel)) {
                setPhoneSheet((current) => (current === panel ? null : panel));
                return;
            }
            setLayout((l) => ({ ...l, panels: { ...DEFAULT_LAYOUT.panels, ...l.panels, [panel]: !l.panels[panel] } }));
        },
        [isPhone, setLayout],
    );
    const closePanel = (panel: PanelId) => {
        if (isPhone && SIDE_PANELS.includes(panel)) { setPhoneSheet(null); }
        else { setLayout((l) => ({ ...l, panels: { ...l.panels, [panel]: false } })); }
    };

    const documentId = doc.document?.id;
    useEffect(() => {
        if (documentId !== undefined) { resetDocument(); }
    }, [documentId, resetDocument]);

    const { openFile } = doc;
    const onDropFile = useCallback((file: File) => void openFile(file), [openFile]);
    const dragging = useFileDrop(workspaceRef, onDropFile);

    const texErrors = doc.texResult?.diagnostics.filter((d) => d.severity === 'error') ?? [];
    const message = doc.loadError
        ? `Could not open ${doc.document?.fileName}: ${doc.loadError}`
        : !hasScore && texErrors.length > 0
          ? 'The alphaTex has errors, see the editor'
          : !hasScore
            ? `Loading ${doc.document?.fileName ?? ''}…`
            : null;

    return (
        <div className={styles.page}>
            <PlaygroundHeader
                document={doc.document}
                panels={panels}
                onTogglePanel={togglePanel}
                onOpenSample={doc.openSample}
                onOpenFile={onDropFile}
                buildShareUrl={doc.buildShareUrl}
            />

            <div ref={workspaceRef} className={styles.workspace}>
                {panels.editor && (
                    <>
                        <aside className={clsx(styles.side, styles.editorSide)} style={{ '--side-width': `${layout.editorWidth}px` } as React.CSSProperties}>
                            <TexEditorPane doc={doc} onClose={() => closePanel('editor')} />
                        </aside>
                        {!isPhone && (
                            <ResizeHandle
                                axis="x"
                                value={layout.editorWidth}
                                min={280}
                                max={900}
                                onChange={(editorWidth) => setLayout((l) => ({ ...l, editorWidth }))}
                                label="Resize editor"
                            />
                        )}
                    </>
                )}
                {panels.tracks && (
                    <aside className={clsx(styles.side, styles.tracksSide)}>
                        <TrackPanel onClose={() => closePanel('tracks')} />
                    </aside>
                )}

                <main className={styles.main}>
                    <div className={clsx(styles.notation, texErrors.length > 0 && styles.notationDimmed)}>
                        <PlayerHost className={styles.canvas} withSelectionHandles />
                        {message && <div className={styles.notationMessage}>{message}</div>}
                        <YouTubeDock />
                    </div>
                    {panels.sync && (
                        <>
                            <ResizeHandle
                                axis="y"
                                value={layout.syncHeight}
                                min={160}
                                max={640}
                                direction={-1}
                                onChange={(syncHeight) => setLayout((l) => ({ ...l, syncHeight }))}
                                label="Resize media sync editor"
                            />
                            <div className={styles.syncDrawer} style={{ height: layout.syncHeight }}>
                                <MediaSyncPanel doc={doc} onClose={() => closePanel('sync')} />
                            </div>
                        </>
                    )}
                    <Transport />
                </main>

                {panels.settings && (
                    <aside className={clsx(styles.side, styles.settingsSide)}>
                        <SettingsPanel settings={settings} onClose={() => closePanel('settings')} quickExtras={musicFont} />
                    </aside>
                )}

                {dragging && (
                    <div className={styles.dropOverlay} aria-hidden="true">
                        <IconUpload size={28} />
                        <span>Drop to open</span>
                        <span className={styles.dropHint}>Guitar Pro 3–8, MusicXML, Capella or alphaTex</span>
                    </div>
                )}
            </div>
        </div>
    );
};
