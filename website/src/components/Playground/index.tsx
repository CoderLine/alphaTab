import React, { useCallback, useEffect, useState } from 'react';
import {
    PlayerProvider,
    PlayerView,
    usePlayerSelector,
    PHONE_QUERY,
    useMediaQuery,
    TexEditorPane,
    SettingsPanel,
    useSchemaSettings,
    useScoreDocument,
    TrackPanel,
    usePersistedState,
} from '@coderline/alphatab-ui';
import { PlaygroundHeader, type PanelId } from './header';
import { MediaSyncPanel } from './media-sync/media-sync-panel';
import { MediaSyncProvider, useMediaSync } from './media-sync/media-sync-context';
import { MusicFontProvider, MusicFontSetting } from './music-font';
import { YouTubeDock } from './media-sync/youtube-dock';
import { PLAYGROUND_DOCUMENTS } from './sources';

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

    const texErrors = doc.texResult?.diagnostics.filter((d) => d.severity === 'error') ?? [];
    const message = doc.loadError
        ? `Could not open ${doc.document?.fileName}: ${doc.loadError}`
        : !hasScore && texErrors.length > 0
          ? 'The alphaTex has errors, see the editor'
          : !hasScore
            ? `Loading ${doc.document?.fileName ?? ''}…`
            : null;

    return (
        <PlayerView
            header={
                <PlaygroundHeader
                    document={doc.document}
                    panels={panels}
                    onTogglePanel={togglePanel}
                    onOpenSample={doc.openSample}
                    onOpenFile={onDropFile}
                    buildShareUrl={doc.buildShareUrl}
                />
            }
            editor={
                panels.editor
                    ? {
                          content: <TexEditorPane doc={doc} onClose={() => closePanel('editor')} />,
                          size: layout.editorWidth,
                          min: 280,
                          max: 900,
                          onResize: (editorWidth) => setLayout((l) => ({ ...l, editorWidth })),
                          resizeLabel: 'Resize editor',
                      }
                    : null
            }
            start={panels.tracks && <TrackPanel onClose={() => closePanel('tracks')} />}
            end={panels.settings && <SettingsPanel settings={settings} onClose={() => closePanel('settings')} quickExtras={musicFont} />}
            notationMessage={message}
            notationDimmed={texErrors.length > 0}
            notationOverlay={<YouTubeDock />}
            drawer={
                panels.sync
                    ? {
                          content: <MediaSyncPanel doc={doc} onClose={() => closePanel('sync')} />,
                          size: layout.syncHeight,
                          min: 160,
                          max: 640,
                          onResize: (syncHeight) => setLayout((l) => ({ ...l, syncHeight })),
                          resizeLabel: 'Resize media sync editor',
                      }
                    : null
            }
            onDropFile={onDropFile}
        />
    );
};
