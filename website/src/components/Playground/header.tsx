import React, { useEffect, useRef, useState } from 'react';
import { useAlphaTabApi, useAlphaTabControls, useAlphaTabModule, useAlphaTabSelector } from '@site/src/alphatab-react';
import {
    IconCheck,
    IconClose,
    IconChevronDown,
    IconCode,
    IconDownload,
    IconFileMusic,
    IconLink,
    IconPrinter,
    IconSliders,
    IconTracks,
    IconUpload,
    IconWaveform,
} from '@site/src/components/landing/shared/icons';
import { isIOS } from '@site/src/utils';
import { exportWav } from './audio-export';
import { downloadBytes, withExtension } from './download';
import { PLAYGROUND_SAMPLES, type PlaygroundSample } from './sources';
import type { PlaygroundDocument } from './use-playground-document';
import { IconButton } from './ui/icon-button';
import { Menu, MenuItem, MenuLabel } from './ui/menu';
import styles from './playground.module.scss';

export type PanelId = 'editor' | 'tracks' | 'settings' | 'sync';

const FILE_ACCEPT = [
    '.gp', '.gp3', '.gp4', '.gp5', '.gpx', '.gp7', '.gp8',
    '.xml', '.musicxml', '.mxl', '.capx',
    '.alphatex', '.atex', '.tex', '.txt',
].join(',');

interface PlaygroundHeaderProps {
    document: PlaygroundDocument | null;
    panels: Record<PanelId, boolean>;
    onTogglePanel: (panel: PanelId) => void;
    onOpenSample: (sample: PlaygroundSample) => void;
    onOpenFile: (file: File) => void;
    buildShareUrl: () => Promise<string | null>;
}

export const PlaygroundHeader: React.FC<PlaygroundHeaderProps> = ({
    document,
    panels,
    onTogglePanel,
    onOpenSample,
    onOpenFile,
    buildShareUrl,
}) => {
    const score = useAlphaTabSelector((s) => s.currentScore);
    const title = score?.title?.trim();
    const artist = score?.artist?.trim();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const groups = ['Files', 'alphaTex'] as const;
    const activeSampleId =
        document?.kind === 'tex' ? document.sampleId : document?.link && 'sample' in document.link ? document.link.sample : undefined;

    return (
        <header className={styles.header}>
            <Menu
                trigger={(props) => (
                    <button type="button" className={styles.docChip} {...props}>
                        <span className={styles.docDot} style={{ background: document?.color }} />
                        <span className={styles.docText}>
                            <span className={styles.docFile}>{document?.fileName ?? 'Loading…'}</span>
                            {(title || artist) && (
                                <span className={styles.docTitle}>
                                    {title}
                                    {title && artist && ' · '}
                                    {artist}
                                </span>
                            )}
                        </span>
                        <IconChevronDown size={12} aria-hidden="true" />
                    </button>
                )}
            >
                {(close) => (
                    <>
                        {groups.map((group) => (
                            <React.Fragment key={group}>
                                <MenuLabel>{group === 'Files' ? 'Sample files' : 'alphaTex samples'}</MenuLabel>
                                {PLAYGROUND_SAMPLES.filter((s) => s.group === group).map((s) => (
                                    <MenuItem
                                        key={s.id}
                                        active={s.id === activeSampleId}
                                        icon={<span className={styles.menuDot} style={{ background: s.color }} />}
                                        detail={s.source.backingTrack ? <IconWaveform size={11} aria-label="with backing track" /> : undefined}
                                        onSelect={() => {
                                            close();
                                            onOpenSample(s);
                                        }}
                                    >
                                        {s.fileName}
                                    </MenuItem>
                                ))}
                            </React.Fragment>
                        ))}
                        <MenuLabel>Your files</MenuLabel>
                        <MenuItem
                            icon={<IconUpload size={13} />}
                            detail="or drop"
                            onSelect={() => {
                                close();
                                fileInputRef.current?.click();
                            }}
                        >
                            Open file…
                        </MenuItem>
                    </>
                )}
            </Menu>
            <input
                ref={fileInputRef}
                type="file"
                accept={isIOS() ? undefined : FILE_ACCEPT}
                hidden
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) onOpenFile(file);
                }}
            />

            <span className={styles.headerSpacer} />

            <div className={styles.headerGroup} role="group" aria-label="Panels">
                <IconButton label="alphaTex editor" text="Editor" active={panels.editor} aria-pressed={panels.editor} onClick={() => onTogglePanel('editor')}>
                    <IconCode size={14} aria-hidden="true" />
                </IconButton>
                <IconButton label="Tracks" text="Tracks" active={panels.tracks} aria-pressed={panels.tracks} onClick={() => onTogglePanel('tracks')}>
                    <IconTracks size={14} aria-hidden="true" />
                </IconButton>
                <IconButton label="Media sync" text="Media sync" active={panels.sync} aria-pressed={panels.sync} onClick={() => onTogglePanel('sync')}>
                    <IconWaveform size={13} aria-hidden="true" />
                </IconButton>
                <IconButton label="Settings" text="Settings" active={panels.settings} aria-pressed={panels.settings} onClick={() => onTogglePanel('settings')}>
                    <IconSliders size={14} aria-hidden="true" />
                </IconButton>
            </div>

            <span className={styles.headerDivider} />

            <div className={styles.headerGroup}>
                <IconButton label="Open file" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <IconUpload size={14} aria-hidden="true" />
                </IconButton>
                <ShareButton buildShareUrl={buildShareUrl} document={document} />
                <ExportMenu document={document} />
            </div>
        </header>
    );
};

const ShareButton: React.FC<{ document: PlaygroundDocument | null; buildShareUrl: () => Promise<string | null> }> = ({
    document,
    buildShareUrl,
}) => {
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => setCopied(false), 1800);
        return () => clearTimeout(timer);
    }, [copied]);

    const shareable = document !== null && (document.kind === 'tex' || document.link !== null);
    const label = !shareable
        ? 'Local files cannot be shared by link; convert to alphaTex or export the file instead'
        : copied
          ? 'Link copied'
          : 'Copy a link to this score';

    return (
        <IconButton
            label={label}
            text={copied ? 'Copied' : 'Share'}
            variant="outline"
            disabled={!shareable}
            onClick={async () => {
                const url = await buildShareUrl();
                if (!url) return;
                try {
                    await navigator.clipboard.writeText(url);
                    setCopied(true);
                } catch {
                    window.prompt('Copy this link', url);
                }
            }}
        >
            {copied ? <IconCheck size={13} aria-hidden="true" /> : <IconLink size={13} aria-hidden="true" />}
        </IconButton>
    );
};

const ExportMenu: React.FC<{ document: PlaygroundDocument | null }> = ({ document }) => {
    const api = useAlphaTabApi();
    const module = useAlphaTabModule();
    const store = useAlphaTabControls();
    const currentScore = useAlphaTabSelector((s) => s.currentScore);
    const fileName = document?.fileName ?? 'score';
    const disabled = !api || !module || !currentScore;
    const [audioProgress, setAudioProgress] = useState<number | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    useEffect(() => () => abortRef.current?.abort(), []);

    const exportAudio = async () => {
        if (!api || !module || !store) return;
        const abort = new AbortController();
        abortRef.current = abort;
        setAudioProgress(0);
        try {
            const wav = await exportWav(api, module, store.getSnapshot(), setAudioProgress, abort.signal);
            downloadBytes(withExtension(fileName, 'wav'), wav, 'audio/wav');
        } catch (e) {
            if (!abort.signal.aborted) console.error('[Playground] Audio export failed', e);
        } finally {
            if (abortRef.current === abort) abortRef.current = null;
            setAudioProgress(null);
        }
    };

    const midi = (format: number) => api!.downloadMidi(format);

    return (
        <>
            {audioProgress !== null && (
                <IconButton
                    label="Cancel the audio export"
                    text={`Audio ${Math.round(audioProgress * 100)}%`}
                    variant="outline"
                    onClick={() => abortRef.current?.abort()}
                >
                    <IconClose size={10} aria-hidden="true" />
                </IconButton>
            )}
            <Menu
                align="end"
                trigger={(props) => (
                    <IconButton label="Export" text="Export" variant="primary" disabled={disabled} {...props}>
                        <IconDownload size={14} aria-hidden="true" />
                    </IconButton>
                )}
            >
                {(close) => (
                    <>
                        <MenuLabel>Score</MenuLabel>
                        <MenuItem
                            icon={<IconFileMusic size={13} />}
                            detail=".gp"
                            title="Guitar Pro 7+, including the backing track and sync points"
                            onSelect={() => {
                                close();
                                const bytes = new module!.exporter.Gp7Exporter().export(api!.score!, api!.settings);
                                downloadBytes(withExtension(fileName, 'gp'), bytes);
                            }}
                        >
                            Guitar Pro
                        </MenuItem>
                        <MenuItem
                            icon={<IconCode size={13} />}
                            detail=".alphatex"
                            onSelect={() => {
                                close();
                                const tex = new module!.exporter.AlphaTexExporter().exportToString(api!.score!, api!.settings);
                                downloadBytes(withExtension(fileName, 'alphatex'), tex, 'text/plain');
                            }}
                        >
                            alphaTex
                        </MenuItem>
                        <MenuItem
                            icon={<IconPrinter size={13} />}
                            onSelect={() => {
                                close();
                                api!.print();
                            }}
                        >
                            Print…
                        </MenuItem>
                        <MenuLabel>Audio</MenuLabel>
                        <MenuItem
                            icon={<IconWaveform size={12} />}
                            detail=".wav"
                            disabled={audioProgress !== null}
                            title="Renders the synthesizer with the current mix, metronome and playback range"
                            onSelect={() => {
                                close();
                                void exportAudio();
                            }}
                        >
                            Audio
                        </MenuItem>
                        <MenuItem
                            icon={<IconWaveform size={12} />}
                            detail=".mid"
                            title="One MIDI track with a channel per instrument"
                            onSelect={() => {
                                close();
                                midi(module!.midi.MidiFileFormat.SingleTrackMultiChannel);
                            }}
                        >
                            MIDI
                        </MenuItem>
                        <MenuItem
                            icon={<IconWaveform size={12} />}
                            detail=".mid"
                            title="One MIDI track per instrument"
                            onSelect={() => {
                                close();
                                midi(module!.midi.MidiFileFormat.MultiTrack);
                            }}
                        >
                            MIDI, track per instrument
                        </MenuItem>
                    </>
                )}
            </Menu>
        </>
    );
};
