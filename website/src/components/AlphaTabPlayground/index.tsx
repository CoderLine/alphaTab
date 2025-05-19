'use client';

import type * as alphaTab from '@coderline/alphatab';
import React, { useEffect, useState } from 'react';
import { useAlphaTab, useAlphaTabEvent } from '@site/src/hooks';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';
import { openFile } from '@site/src/utils';
import { PlayerControlsGroup, SidePanel } from './player-controls-group';
import { PlaygroundSettings } from './playground-settings';
import { Tooltip } from 'react-tooltip';
import { PlaygroundTrackSelector } from './track-selector';

interface AlphaTabPlaygroundProps {
    settings?: alphaTab.json.SettingsJson;
}

export const AlphaTabPlayground: React.FC<AlphaTabPlaygroundProps> = ({ settings }) => {
    const viewPortRef = React.createRef<HTMLDivElement>();
    const [isLoading, setLoading] = useState(true);
    const [sidePanel, setSidePanel] = useState(SidePanel.None);

    const [api, element] = useAlphaTab(s => {
        s.core.engine = 'svg';
        s.player.scrollElement = viewPortRef.current!;
        s.player.scrollOffsetY = -10;
        s.player.enablePlayer = true;
        if (settings) {
            s.fillFromJson(settings);
        }
    });

    useAlphaTabEvent(api, 'renderFinished', () => {
        setLoading(false);
    });

    const onDragOver = (e: React.DragEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'link';
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer) {
            const files = e.dataTransfer.files;
            if (files.length === 1) {
                openFile(api!, files[0]);
            }
        }
    };

    return (
        <>
            <div className={styles['at-wrap']} onDragOver={onDragOver} onDrop={onDrop}>
                {isLoading && (
                    <div className={styles['at-overlay']}>
                        <div className={styles['at-overlay-content']}>
                            <FontAwesomeIcon icon={solid.faSpinner} size="2x" spin={true} />
                        </div>
                    </div>
                )}

                {api && api?.score && (
                    <PlaygroundSettings
                        api={api}
                        onClose={() => setSidePanel(SidePanel.None)}
                        isOpen={sidePanel === SidePanel.Settings}
                    />
                )}

                {api && api?.score && (
                    <PlaygroundTrackSelector
                        api={api}
                        onClose={() => setSidePanel(SidePanel.None)}
                        isOpen={sidePanel === SidePanel.TrackSelector}
                    />
                )}

                <div className={styles['at-content']}>
                    <div className={styles['at-viewport']} ref={viewPortRef}>
                        <div ref={element} />
                    </div>
                </div>

                <div className={styles['at-footer']}>
                    {api && <PlayerControlsGroup api={api} sidePanel={sidePanel} onSidePanelChange={setSidePanel} />}
                </div>
            </div>
            <Tooltip anchorSelect="[data-tooltip-content]" id="tooltip-playground" style={{ zIndex: 1200 }} />
        </>
    );
};
