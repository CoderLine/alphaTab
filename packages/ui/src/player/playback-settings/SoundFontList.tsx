import React from 'react';
import clsx from 'clsx';
import { SOUNDFONTS, selectSoundFont, usePlaybackPreferences, useSoundFontLibrary, type SoundFontEntry } from '../../state/playback';
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

/** The site-wide SoundFont choice, with per-SoundFont download state and attribution. */
export function SoundFontList(): React.ReactElement {
    const preferences = usePlaybackPreferences();
    const library = useSoundFontLibrary();

    return (
        <div role="radiogroup" aria-label="Synthesizer SoundFont" className={styles.rows}>
            {SOUNDFONTS.map((entry) => {
                const state = library[entry.id];
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
                            onClick={() => selectSoundFont(entry.id)}
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
