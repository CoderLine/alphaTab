import React from 'react';
import clsx from 'clsx';
import { usePlaybackPreferences, useSoundFontLibrary, useUiEnvironment } from '../../environment';
import type { SoundFontEntry } from '../../state/playback';
import { IconExternalLink, IconInfo } from '../icons';
import { soundFontStatusText } from './format';
import styles from './styles.module.scss';

function AttributionInfo({ entry }: { entry: SoundFontEntry }): React.ReactElement | null {
    const [open, setOpen] = React.useState(false);
    const rootRef = React.useRef<HTMLDivElement>(null);
    const popoverId = React.useId();

    React.useEffect(() => {
        if (!open) { return; }
        const onDown = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) { setOpen(false); }
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [open]);

    const attribution = entry.attribution;
    if (!attribution) { return null; }

    return (
        // biome-ignore lint/a11y/noStaticElementInteractions: keeps Escape from the popover inside from closing the surrounding menu
        <div
            ref={rootRef}
            className={styles.info}
            onKeyDown={(e) => {
                // Close only this popover, not the menu or flyout around it.
                if (open && e.key === 'Escape') {
                    e.stopPropagation();
                    setOpen(false);
                }
            }}
        >
            <button
                type="button"
                className={clsx(styles.infoButton, open && styles.infoButtonOpen)}
                onClick={() => setOpen((v) => !v)}
                aria-label={`${entry.description}: credits and license`}
                aria-expanded={open}
                aria-controls={popoverId}
            >
                <IconInfo size={13} aria-hidden="true" />
            </button>
            {open && (
                <div id={popoverId} role="note" className={styles.infoPopover}>
                    <div className={styles.infoTitle}>{entry.description}</div>
                    <div>© {attribution.author}</div>
                    <div className={styles.infoLicense}>{attribution.license}</div>
                    <a href={attribution.href} target="_blank" rel="noopener noreferrer" className={styles.infoLink}>
                        Source <IconExternalLink size={10} aria-hidden="true" />
                    </a>
                </div>
            )}
        </div>
    );
}

/**
 * The SoundFont preference of the environment, with per-SoundFont download state and attribution.
 * Picking a SoundFont starts its download right away. Renders nothing without a SoundFont provider.
 */
export function SoundFontList(): React.ReactElement | null {
    const { soundFonts, playbackPreferences } = useUiEnvironment();
    const preferences = usePlaybackPreferences();
    const library = useSoundFontLibrary();
    if (!soundFonts) {
        return null;
    }
    const select = (entry: SoundFontEntry) => {
        playbackPreferences.setSoundFont(entry.id);
        soundFonts.load(entry.id).catch(() => {
            // Failure is reported through the per-SoundFont status.
        });
    };

    return (
        <div role="radiogroup" aria-label="Synthesizer SoundFont" className={styles.rows}>
            {soundFonts.entries.map((entry) => {
                const state = library[entry.id] ?? { status: 'available', loaded: 0, total: entry.sizeBytes };
                const selected = preferences.soundFontId === entry.id;
                const progress =
                    state.status === 'downloading' && state.total > 0 ? state.loaded / state.total : null;
                return (
                    <div key={entry.id} className={clsx(styles.row, selected && styles.rowSelected)}>
                        <button
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            className={styles.rowMain}
                            onClick={() => select(entry)}
                        >
                            <span className={styles.radio} aria-hidden="true" />
                            <span className={styles.rowText}>
                                <span className={styles.rowLabel}>{entry.label}</span>
                                <span className={styles.rowDescription}>{entry.description}</span>
                            </span>
                            <span className={clsx(styles.status, styles[`status_${state.status}`])}>
                                {soundFontStatusText(entry, state)}
                            </span>
                        </button>
                        <AttributionInfo entry={entry} />
                        {progress !== null && (
                            <span
                                className={styles.rowProgress}
                                style={{ transform: `scaleX(${progress})` }}
                                aria-hidden="true"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
