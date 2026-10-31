import clsx from 'clsx';
import type React from 'react';
import { IconUpload } from '../icons';
import { usePlayerSelector } from '../PlayerProvider';
import styles from './overlays.module.scss';

/** The drop target hint shown while a file is dragged over a player view. */
export const DropOverlay: React.FC<{ hint?: React.ReactNode; className?: string }> = ({
    hint = 'Guitar Pro 3–8, MusicXML, Capella or alphaTex',
    className
}) => (
    <div className={clsx(styles.dropOverlay, className)} aria-hidden="true">
        <IconUpload size={28} />
        <span>Drop to open</span>
        {hint && <span className={styles.dropHint}>{hint}</span>}
    </div>
);

/** A busy indicator over the notation while the player renders. Must be rendered inside `<PlayerProvider>`. */
export const RenderingOverlay: React.FC<{ className?: string }> = ({ className }) => {
    const isRendering = usePlayerSelector(s => s.isRendering);
    if (!isRendering) {
        return null;
    }
    return (
        <div className={clsx(styles.rendering, className)} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            Rendering…
        </div>
    );
};
