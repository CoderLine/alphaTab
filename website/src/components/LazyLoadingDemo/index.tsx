'use client';

import React, { useEffect, useRef, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import {
    AlphaTabPlayer,
    AlphaTabCanvas,
    useAlphaTabApi,
    useAlphaTabState,
} from "@site/src/alphatab-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as solid from "@fortawesome/free-solid-svg-icons";
import styles from "./styles.module.scss";

export interface LazyLoadingDemoProps {
    file?: string;
    tex?: string;
    renderCountVisible?: boolean;
    showCode?: boolean;
}

function ApplyLazyLoading({ lazy }: { lazy: boolean }) {
    const api = useAlphaTabApi();
    useEffect(() => {
        if (!api) { return; }
        api.settings.core.enableLazyLoading = lazy;
        api.updateSettings();
        api.render();
    }, [api, lazy]);
    return null;
}

interface InnerProps {
    renderCountVisible: boolean;
}

const Inner: React.FC<InnerProps> = ({ renderCountVisible }) => {
    const api = useAlphaTabApi();
    const state = useAlphaTabState();
    const canvasWrapRef = useRef<HTMLDivElement>(null);
    const [lazy, setLazy] = useState(true);
    const [chunkCount, setChunkCount] = useState(0);

    // Count SVG chunks currently in the DOM.
    useEffect(() => {
        const wrap = canvasWrapRef.current;
        if (!wrap) { return; }
        const update = () => {
            setChunkCount(wrap.querySelectorAll("svg").length);
        };
        update();
        const observer = new MutationObserver(update);
        observer.observe(wrap, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, []);

    return (
        <div className={styles.wrapper}>
            <div className={styles.toolbar}>
                <button
                    className="button button--primary"
                    onClick={() => api?.playPause()}
                    aria-label={state.isPlaying ? "Pause" : "Play"}
                >
                    <FontAwesomeIcon icon={state.isPlaying ? solid.faPause : solid.faPlay} />
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
            <ApplyLazyLoading lazy={lazy} />
            <div ref={canvasWrapRef}>
                <AlphaTabCanvas className={styles.scroller} />
            </div>
        </div>
    );
};

export const LazyLoadingDemo: React.FC<LazyLoadingDemoProps> = ({
    file,
    tex,
    renderCountVisible = true,
}) => {
    const settings: alphaTab.json.SettingsJson = {
        core: { enableLazyLoading: true },
        player: { scrollMode: "Off" },
    };

    return (
        <AlphaTabPlayer file={file} tex={tex} settings={settings}>
            <Inner renderCountVisible={renderCountVisible} />
        </AlphaTabPlayer>
    );
};
