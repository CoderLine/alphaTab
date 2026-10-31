import React from 'react';
import clsx from 'clsx';
import type { PlaybackState } from '@site/src/alphatab-react';
import { preparationText } from './format';
import styles from './styles.module.scss';

interface PlaybackStatusLineProps {
    playback: PlaybackState;
    onRetry?: () => void;
    className?: string;
}

/** What the player is preparing, or why it fell back. Renders nothing while idle. */
export function PlaybackStatusLine({ playback, onRetry, className }: PlaybackStatusLineProps): React.ReactElement | null {
    if (playback.notice) {
        return (
            <div className={clsx(styles.statusLine, styles.statusNotice, className)} role="status">
                <span>{playback.notice}</span>
                {onRetry && (
                    <button type="button" className={styles.retry} onClick={onRetry}>
                        Retry
                    </button>
                )}
            </div>
        );
    }
    if (playback.preparing) {
        return (
            <div className={clsx(styles.statusLine, className)} role="status" aria-live="polite">
                {preparationText(playback.preparing)}
            </div>
        );
    }
    return null;
}
