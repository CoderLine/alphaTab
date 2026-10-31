import React, { useState } from 'react';
import clsx from 'clsx';
import { IconChevronDown, IconYoutube } from '@site/src/components/landing/shared/icons';
import { IconButton } from '../ui/icon-button';
import { YouTubeEmbed } from './media/youtube-embed';
import { useMediaSync } from './media-sync-context';
import styles from './media-sync.module.scss';

/** The video the score is synchronized with, docked over the notation while YouTube is the playback source. */
export const YouTubeDock: React.FC = () => {
    const sync = useMediaSync();
    const [collapsed, setCollapsed] = useState(false);
    if (sync.kind !== 'youtube' || !sync.youtubeVideoId) return null;

    return (
        <div className={clsx(styles.videoDock, collapsed && styles.videoDockCollapsed)}>
            <div className={styles.videoBar}>
                <IconYoutube size={13} aria-hidden="true" />
                <span>{sync.youtubeMedia ? 'Synced video' : 'Loading video…'}</span>
                <span className={styles.spacer} />
                <IconButton label={collapsed ? 'Show video' : 'Hide video'} onClick={() => setCollapsed((c) => !c)}>
                    <IconChevronDown size={12} style={{ transform: collapsed ? 'rotate(180deg)' : undefined }} aria-hidden="true" />
                </IconButton>
            </div>
            <YouTubeEmbed
                className={styles.videoFrame}
                videoId={sync.youtubeVideoId}
                onMedia={sync.setYoutubeMedia}
                onError={(message) => sync.setError(`The video could not be opened: ${message}`)}
            />
        </div>
    );
};
