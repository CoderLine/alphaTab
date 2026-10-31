'use client';

import React, { useEffect, useRef, useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import {
    AlphaTabHost,
    AlphaTabProvider,
    useAlphaTabApi,
    useAlphaTabEventValue,
} from "@coderline/alphatab-react";
import { IconPause, IconPlay } from "@coderline/alphatab-ui";
import { useSiteAlphaTabSettings } from "@site/src/alphatab-settings";
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
    const isPlaying =
        useAlphaTabEventValue(
            "playerStateChanged",
            (e) => e.state === alphaTab.synth.PlayerState.Playing,
        ) ?? false;
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
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <IconPause aria-hidden="true" /> : <IconPlay aria-hidden="true" />}
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
                <AlphaTabHost className={styles.scroller} />
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
    const site = useSiteAlphaTabSettings({ player: true, settings });

    return (
        <AlphaTabProvider
            file={file}
            tex={tex}
            configureSettings={site.configureSettings}
            settings={site.settings}
        >
            <Inner renderCountVisible={renderCountVisible} />
        </AlphaTabProvider>
    );
};
