import { useAlphaTabApi } from '@coderline/alphatab-react';
import { useEffect, useRef } from 'react';
import styles from './youtube-video.module.scss';
import { YoutubeSync } from './YoutubeSync';

/** The YouTube video that drives the surrounding player, see {@link YoutubeSync}. */
export function YoutubeVideo({ videoId }: { videoId: string }) {
    const api = useAlphaTabApi();
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!api || !host) {
            return;
        }
        const sync = new YoutubeSync(api, host, videoId);
        return () => sync.dispose();
    }, [api, videoId]);

    return (
        <div className={styles.wrap}>
            {/* The YouTube API replaces the content of this element; React leaves it empty. */}
            <div ref={hostRef} className={styles.video} />
        </div>
    );
}
