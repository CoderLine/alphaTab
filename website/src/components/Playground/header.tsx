import React, { useEffect, useRef, useState } from 'react';
import {
    usePlayerSelector,
    ExportMenu,
    IconCheck,
    IconChevronDown,
    IconCode,
    IconLink,
    IconSliders,
    IconTracks,
    IconUpload,
    IconWaveform,
    IconButton,
    Menu,
    MenuItem,
    MenuLabel,
    type ScoreDocument,
} from '@coderline/alphatab-ui';
import { isIOS } from './is-ios';
import { PLAYGROUND_SAMPLES, type PlaygroundSample } from './sources';
import styles from './playground.module.scss';

export type PanelId = 'editor' | 'tracks' | 'settings' | 'sync';

const FILE_ACCEPT = [
    '.gp', '.gp3', '.gp4', '.gp5', '.gpx', '.gp7', '.gp8',
    '.xml', '.musicxml', '.mxl', '.capx',
    '.alphatex', '.atex', '.tex', '.txt',
].join(',');

interface PlaygroundHeaderProps {
    document: ScoreDocument | null;
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
    const score = usePlayerSelector((s) => s.currentScore);
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
                    if (file) { onOpenFile(file); }
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
                <ExportMenu fileName={document?.fileName} />
            </div>
        </header>
    );
};

const ShareButton: React.FC<{ document: ScoreDocument | null; buildShareUrl: () => Promise<string | null> }> = ({
    document,
    buildShareUrl,
}) => {
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (!copied) { return; }
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
                if (!url) { return; }
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
