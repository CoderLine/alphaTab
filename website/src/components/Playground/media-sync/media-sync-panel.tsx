import React, { useEffect, useRef, useState } from 'react';
import { useAlphaTabApi } from '@coderline/alphatab-react';
import { useAlphaTabModule } from '@site/src/alphatab-react';
import {
    IconCheck,
    IconCopy,
    IconDownload,
    IconFit,
    IconRedo,
    IconReset,
    IconUndo,
    IconUpload,
    IconWand,
    IconWaveform,
    IconYoutube,
    IconZoomIn,
    IconZoomOut,
    IconChevronDown,
    IconCode,
    Segmented,
    PHONE_QUERY,
    useMediaQuery,
    downloadBytes,
    withExtension,
    Dialog,
    IconButton,
    Menu,
    MenuItem,
    Panel,
} from '@coderline/alphatab-ui';
import type { PlaygroundDocumentState } from '../use-playground-document';
import { extractYouTubeVideoId } from './media/youtube-media';
import { useMediaSync, type MediaKind } from './media-sync-context';
import { generateSyncCode } from './model/codegen';
import { isSyncPoint } from './model/timeline';
import { SyncTimeline, type SyncTimelineHandle } from './sync-timeline';
import styles from './media-sync.module.scss';

const AUDIO_ACCEPT = 'audio/*,.mp3,.ogg,.oga,.opus,.wav,.flac,.m4a,.aac,.webm';

interface MediaSyncPanelProps {
    doc: PlaygroundDocumentState;
    onClose: () => void;
}

export const MediaSyncPanel: React.FC<MediaSyncPanelProps> = ({ doc, onClose }) => {
    const sync = useMediaSync();
    const api = useAlphaTabApi();
    const module = useAlphaTabModule();
    const isPhone = useMediaQuery(PHONE_QUERY);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const timelineRef = useRef<SyncTimelineHandle>(null);
    const [dialog, setDialog] = useState<'youtube' | 'code' | null>(null);

    const markers = sync.markers;
    const syncPointCount = markers?.filter(isSyncPoint).length ?? 0;
    const editable = !!markers && !isPhone;
    const isTex = doc.document?.kind === 'tex';

    const chooseKind = (kind: MediaKind) => {
        if (kind === 'youtube' && !sync.youtubeVideoId) {
            setDialog('youtube');
            return;
        }
        if (kind === 'audio' && !sync.hasAudio) {
            audioInputRef.current?.click();
            return;
        }
        sync.setKind(kind);
    };

    const downloadGp = () => {
        if (!api?.score || !module) { return; }
        const bytes = new module.exporter.Gp7Exporter().export(api.score, api.settings);
        downloadBytes(withExtension(doc.document?.fileName ?? 'score', 'gp'), bytes);
    };

    const writeIntoTex = () => {
        const lines = generateSyncCode(sync.flatSyncPoints()).find((c) => c.language === 'alphatex')!.data;
        const withoutSync = doc.text.replace(/^[ \t]*\\sync\b.*(\r?\n)?/gm, '').replace(/\s+$/, '');
        doc.setText(`${withoutSync}\n${lines}\n`);
    };

    // Undo/redo while focus is anywhere in the editor.
    const onKeyDown = (e: React.KeyboardEvent) => {
        if (!(e.ctrlKey || e.metaKey) || (e.target as HTMLElement).closest('input, textarea, select')) { return; }
        const key = e.key.toLowerCase();
        if (key === 'z' && !e.shiftKey) { sync.undo(); }
        else if ((key === 'z' && e.shiftKey) || key === 'y') { sync.redo(); }
        else { return; }
        e.preventDefault();
    };

    const toolbar = (
        <div className={styles.toolbar}>
            <Segmented<MediaKind>
                label="Synchronize with"
                value={sync.kind}
                onChange={chooseKind}
                options={[
                    { v: 'synth', l: 'Synth' },
                    { v: 'audio', l: 'Audio' },
                    { v: 'youtube', l: 'YouTube' },
                ]}
            />
            <IconButton label="Load an audio file" onClick={() => audioInputRef.current?.click()}>
                <IconUpload size={13} aria-hidden="true" />
            </IconButton>
            <IconButton label="Open a YouTube video" onClick={() => setDialog('youtube')}>
                <IconYoutube size={14} aria-hidden="true" />
            </IconButton>
            {editable && (
                <>
                    <span className={styles.toolbarDivider} />
                    <IconButton label="Undo (Ctrl+Z)" disabled={!sync.canUndo} onClick={sync.undo}>
                        <IconUndo size={13} aria-hidden="true" />
                    </IconButton>
                    <IconButton label="Redo (Ctrl+Shift+Z)" disabled={!sync.canRedo} onClick={sync.redo}>
                        <IconRedo size={13} aria-hidden="true" />
                    </IconButton>
                    <span className={styles.toolbarDivider} />
                    <IconButton
                        label={sync.kind === 'audio' ? 'Auto sync: sync points at tempo changes, stretched to the audible part' : 'Auto sync: sync points at tempo changes'}
                        text="Auto sync"
                        onClick={sync.autoSyncNow}
                    >
                        <IconWand size={13} aria-hidden="true" />
                    </IconButton>
                    <IconButton label="Remove all sync points (play 1:1 with the score tempo)" onClick={sync.clearSyncPoints}>
                        <IconReset size={13} aria-hidden="true" />
                    </IconButton>
                    <span className={styles.toolbarDivider} />
                    <IconButton label="Zoom out" onClick={() => timelineRef.current?.zoomBy(1 / 1.5)}>
                        <IconZoomOut size={13} aria-hidden="true" />
                    </IconButton>
                    <IconButton label="Fit to width" onClick={() => timelineRef.current?.fit()}>
                        <IconFit size={13} aria-hidden="true" />
                    </IconButton>
                    <IconButton label="Zoom in" onClick={() => timelineRef.current?.zoomBy(1.5)}>
                        <IconZoomIn size={13} aria-hidden="true" />
                    </IconButton>
                </>
            )}
            <span className={styles.spacer} />
            {markers && (
                <span className={styles.count}>
                    {syncPointCount} sync point{syncPointCount === 1 ? '' : 's'}
                </span>
            )}
            {markers && (
                <Menu
                    align="end"
                    trigger={(props) => (
                        <IconButton label="Export sync points" text="Export" variant="outline" {...props}>
                            <IconDownload size={13} aria-hidden="true" />
                            <IconChevronDown size={11} aria-hidden="true" />
                        </IconButton>
                    )}
                >
                    {(close) => (
                        <>
                            <MenuItem
                                icon={<IconDownload size={13} />}
                                detail=".gp"
                                disabled={sync.kind !== 'audio'}
                                title={sync.kind !== 'audio' ? 'Only audio can be embedded into a file' : 'Guitar Pro file with the audio and sync points embedded'}
                                onSelect={() => {
                                    close();
                                    downloadGp();
                                }}
                            >
                                Synced Guitar Pro file
                            </MenuItem>
                            <MenuItem
                                icon={<IconCode size={13} />}
                                onSelect={() => {
                                    close();
                                    setDialog('code');
                                }}
                            >
                                Sync point code…
                            </MenuItem>
                            {isTex && (
                                <MenuItem
                                    icon={<IconWaveform size={12} />}
                                    title="Replaces the \sync lines of the alphaTex with the current sync points"
                                    onSelect={() => {
                                        close();
                                        writeIntoTex();
                                    }}
                                >
                                    Write into alphaTex
                                </MenuItem>
                            )}
                        </>
                    )}
                </Menu>
            )}
            <input
                ref={audioInputRef}
                type="file"
                accept={AUDIO_ACCEPT}
                hidden
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) { void sync.loadAudioFile(file); }
                }}
            />
        </div>
    );

    return (
        <div className={styles.root} onKeyDown={onKeyDown}>
            <Panel title="Media sync" icon={<IconWaveform size={12} />} onClose={onClose} actions={toolbar} headerClassName={styles.header} bodyClassName={styles.body}>
                {sync.error && (
                    <div className={styles.error} role="alert">
                        {sync.error}
                        <button type="button" onClick={() => sync.setError(null)}>Dismiss</button>
                    </div>
                )}
                <SyncBody
                    isPhone={isPhone}
                    onLoadAudio={() => audioInputRef.current?.click()}
                    onOpenYouTube={() => setDialog('youtube')}
                    timelineRef={timelineRef}
                />
            </Panel>
            {dialog === 'youtube' && <YouTubeDialog onClose={() => setDialog(null)} onOpen={(id) => sync.openYouTube(id)} />}
            {dialog === 'code' && <CodeDialog onClose={() => setDialog(null)} />}
        </div>
    );
};

const SyncBody: React.FC<{
    isPhone: boolean;
    onLoadAudio: () => void;
    onOpenYouTube: () => void;
    timelineRef: React.Ref<SyncTimelineHandle>;
}> = ({ isPhone, onLoadAudio, onOpenYouTube, timelineRef }) => {
    const sync = useMediaSync();

    if (sync.kind === 'synth') {
        return (
            <div className={styles.empty}>
                <p>
                    Sync points tie the notation to a recording, so the cursor follows the audio or video even where the
                    performance speeds up or slows down.
                </p>
                <div className={styles.emptyActions}>
                    <button type="button" className={styles.emptyBtn} onClick={sync.hasAudio ? () => sync.setKind('audio') : onLoadAudio}>
                        <IconUpload size={13} aria-hidden="true" /> {sync.hasAudio ? 'Sync with the backing track' : 'Load an audio file'}
                    </button>
                    <button type="button" className={styles.emptyBtn} onClick={onOpenYouTube}>
                        <IconYoutube size={14} aria-hidden="true" /> Sync with a YouTube video
                    </button>
                </div>
            </div>
        );
    }
    if (sync.kind === 'audio' && !sync.hasAudio) {
        return (
            <div className={styles.empty}>
                <p>This score has no backing track yet.</p>
                <button type="button" className={styles.emptyBtn} onClick={onLoadAudio}>
                    <IconUpload size={13} aria-hidden="true" /> Load an audio file
                </button>
            </div>
        );
    }
    if (!sync.markers) {
        const what = sync.kind === 'youtube' ? (sync.youtubeMedia ? 'Preparing the timeline…' : 'Loading the video…') : sync.analysing ? 'Analysing the audio…' : 'Preparing the timeline…';
        return <div className={styles.empty}>{what}</div>;
    }
    if (isPhone) {
        return (
            <div className={styles.empty}>
                <p>Editing sync points needs a larger screen. Playback with the {sync.kind === 'youtube' ? 'video' : 'audio'} works here too.</p>
            </div>
        );
    }
    return (
        <>
            <SyncTimeline
                markers={sync.markers}
                durationMs={sync.durationMs}
                analysis={sync.analysis}
                media={sync.media}
                zoom={sync.zoom}
                onZoomChange={sync.setZoom}
                onCommit={sync.commit}
                handleRef={timelineRef}
            />
            <div className={styles.hints}>
                <span><kbd>Drag</kbd> a marker to sync it</span>
                <span><kbd>Double-click</kbd> adds or removes a sync point</span>
                <span><kbd>←</kbd><kbd>→</kbd> select, <kbd>Shift</kbd> jumps sync points</span>
                <span><kbd>Alt</kbd>+<kbd>←</kbd><kbd>→</kbd> nudge 10 ms (<kbd>Shift</kbd> 100 ms)</span>
                <span><kbd>Ctrl</kbd>+wheel zooms</span>
                {sync.audioName && <span className={styles.hintFile}>{sync.audioName}</span>}
            </div>
        </>
    );
};

const YouTubeDialog: React.FC<{ onClose: () => void; onOpen: (videoId: string) => void }> = ({ onClose, onOpen }) => {
    const [url, setUrl] = useState('');
    const videoId = extractYouTubeVideoId(url);
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoId) { return; }
        onOpen(videoId);
        onClose();
    };
    return (
        <Dialog
            title="Sync with a YouTube video"
            onClose={onClose}
            footer={
                <>
                    <button type="button" className={styles.dialogBtn} onClick={onClose}>Cancel</button>
                    <button type="submit" form="youtube-form" className={styles.dialogBtnPrimary} disabled={!videoId}>
                        Open video
                    </button>
                </>
            }
        >
            <form id="youtube-form" onSubmit={submit} className={styles.dialogForm}>
                <label className={styles.dialogLabel}>
                    Video link
                    <input
                        autoFocus
                        className={styles.dialogInput}
                        placeholder="https://www.youtube.com/watch?v=…"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        aria-invalid={url.length > 0 && !videoId}
                    />
                </label>
                {url.length > 0 && !videoId && <span className={styles.dialogError}>That does not look like a YouTube link.</span>}
                <p className={styles.privacy}>
                    The video plays in YouTube&apos;s privacy-enhanced embed (youtube-nocookie.com). Opening it loads
                    YouTube&apos;s player script from youtube.com, and Google receives data such as your IP address.
                </p>
            </form>
        </Dialog>
    );
};

const CodeDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const sync = useMediaSync();
    const code = generateSyncCode(sync.flatSyncPoints());
    const [language, setLanguage] = useState(code[0].language);
    const current = code.find((c) => c.language === language)!;

    return (
        <Dialog title="Sync point code" wide onClose={onClose}>
            <p>
                Store these sync points next to the file (for example in your database), load them along with it and
                apply them once alphaTab loaded the score.
            </p>
            <Segmented<string> label="Language" value={language} onChange={(v) => setLanguage(v as typeof language)} options={code.map((c) => ({ v: c.language, l: c.label }))} />
            <CodeBlock title={current.language === 'alphatex' ? 'Append to the end of the alphaTex' : 'Sync points'} code={current.data} />
            {current.usage && <CodeBlock title="Applying them" code={current.usage} />}
        </Dialog>
    );
};

const CodeBlock: React.FC<{ title: string; code: string }> = ({ title, code }) => {
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (!copied) { return; }
        const timer = setTimeout(() => setCopied(false), 1500);
        return () => clearTimeout(timer);
    }, [copied]);
    return (
        <figure className={styles.code}>
            <figcaption className={styles.codeHeader}>
                <span>{title}</span>
                <button
                    type="button"
                    className={styles.codeCopy}
                    onClick={() => void navigator.clipboard.writeText(code).then(() => setCopied(true))}
                >
                    {copied ? <IconCheck size={12} /> : <IconCopy size={12} />} {copied ? 'Copied' : 'Copy'}
                </button>
            </figcaption>
            <pre className={styles.codeBody}>
                <code>{code}</code>
            </pre>
        </figure>
    );
};
