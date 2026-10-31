import React, { useEffect, useRef } from 'react';
import { YouTubeMedia } from './youtube-media';

interface YouTubeEmbedProps {
    videoId: string;
    /** Called with the media once the player is ready, and with `null` when it goes away. */
    onMedia: (media: YouTubeMedia | null) => void;
    onError: (message: string) => void;
    className?: string;
}

/** Hosts a YouTube player; the iframe lives in a node React does not manage, since YouTube replaces it. */
export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, onMedia, onError, className }) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const callbacks = useRef({ onMedia, onError });
    callbacks.current = { onMedia, onError };

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        const target = document.createElement('div');
        host.appendChild(target);
        let media: YouTubeMedia | null = null;
        let cancelled = false;
        YouTubeMedia.create(target, videoId).then(
            (created) => {
                if (cancelled) {
                    created.destroy();
                    return;
                }
                media = created;
                callbacks.current.onMedia(created);
            },
            (e: unknown) => {
                if (!cancelled) callbacks.current.onError(e instanceof Error ? e.message : String(e));
            },
        );
        return () => {
            cancelled = true;
            if (media) {
                media.destroy();
                callbacks.current.onMedia(null);
            }
            host.replaceChildren();
        };
    }, [videoId]);

    return <div ref={hostRef} className={className} />;
};
