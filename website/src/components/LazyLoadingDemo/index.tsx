'use client';

import React, { useEffect, useRef, useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import { useAlphaTab, useAlphaTabEvent } from "@site/src/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as solid from "@fortawesome/free-solid-svg-icons";
import styles from "./styles.module.scss";

export interface LazyLoadingDemoProps {
    file?: string;
    tex?: string;
    renderCountVisible?: boolean;
    showCode?: boolean;
}

export const LazyLoadingDemo: React.FC<LazyLoadingDemoProps> = ({
    file,
    tex,
    renderCountVisible = true,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const [api, element] = useAlphaTab((s) => {
        if (tex) {
            s.core.tex = true;
        } else if (file) {
            s.core.file = file;
        }
        s.core.enableLazyLoading = true;
        s.player.playerMode = alphaTab.PlayerMode.EnabledAutomatic;
        s.player.scrollMode = alphaTab.ScrollMode.Off;
    });

    useEffect(() => {
        if (!api || !scrollRef.current) return;
        api.settings.player.scrollElement = scrollRef.current;
        api.updateSettings();
    }, [api]);

    const [lazy, setLazy] = useState(true);
    const [chunkCount, setChunkCount] = useState(0);
    const [isPlaying, setPlaying] = useState(false);

    useAlphaTabEvent(
        api,
        "playerStateChanged",
        (args: alphaTab.synth.PlayerStateChangedEventArgs) => {
            setPlaying(args.state === alphaTab.synth.PlayerState.Playing);
        }
    );

    useEffect(() => {
        if (!api) return;
        api.settings.core.enableLazyLoading = lazy;
        api.updateSettings();
        api.render();
    }, [api, lazy]);

    // Count SVG chunks currently in the DOM.
    useEffect(() => {
        if (!element.current) return;
        const target = element.current;
        const update = () => {
            setChunkCount(target.querySelectorAll("svg").length);
        };
        update();
        const observer = new MutationObserver(update);
        observer.observe(target, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [element]);

    return (
        <div className={styles.wrapper}>
            <div className={styles.toolbar}>
                <button
                    className="button button--primary"
                    onClick={() => api?.playPause()}
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    <FontAwesomeIcon icon={isPlaying ? solid.faPause : solid.faPlay} />
                </button>
                <ul className={`pills ${styles.pills}`}>
                    <li
                        className={`pills__item ${
                            lazy ? "pills__item--active" : ""
                        }`}
                        onClick={() => setLazy(true)}
                    >
                        Lazy loading: on
                    </li>
                    <li
                        className={`pills__item ${
                            !lazy ? "pills__item--active" : ""
                        }`}
                        onClick={() => setLazy(false)}
                    >
                        Lazy loading: off
                    </li>
                </ul>
                {renderCountVisible && (
                    <div className={styles.counter}>
                        SVG chunks in DOM: <strong>{chunkCount}</strong>
                    </div>
                )}
            </div>
            <div className={styles.scroller} ref={scrollRef}>
                <div ref={element}>{tex}</div>
            </div>
        </div>
    );
};
