import * as alphaTab from '@coderline/alphatab';
import type React from 'react';
import { useState } from 'react';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';
import { useAlphaTabEvent } from '@site/src/hooks';
import { openFile } from '@site/src/utils';
import { PlayerProgressIndicator } from '../AlphaTabFull/player-progress-indicator';

export interface PlayerControlsGroupProps {
    sidePanel: SidePanel;
    onSidePanelChange: (sidePanel: SidePanel) => void;
    api: alphaTab.AlphaTabApi;
}

export enum SidePanel {
    None = 0,
    Settings = 1,
    TrackSelector = 2
}

export const PlayerControlsGroup: React.FC<PlayerControlsGroupProps> = ({ api, sidePanel, onSidePanelChange }) => {
    const [soundFontLoadPercentage, setSoundFontLoadPercentage] = useState(0);
    const [isPlaying, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [endTime, setEndTime] = useState(1);

    useAlphaTabEvent(api, 'soundFontLoad', e => {
        setSoundFontLoadPercentage(e.loaded / e.total);
    });

    useAlphaTabEvent(api, 'soundFontLoaded', () => {
        setSoundFontLoadPercentage(1);
    });
    useAlphaTabEvent(api, 'playerStateChanged', e => {
        setPlaying(e.state === alphaTab.synth.PlayerState.Playing);
    });
    useAlphaTabEvent(api, 'playerPositionChanged', e => {
        // reduce number of UI updates to second changes.
        const previousCurrentSeconds = (currentTime / 1000) | 0;
        const newCurrentSeconds = (e.currentTime / 1000) | 0;

        if (e.endTime === endTime && (previousCurrentSeconds === newCurrentSeconds || newCurrentSeconds === 0)) {
            return;
        }

        setEndTime(e.endTime);
        setCurrentTime(e.currentTime);
    });

    const open = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.gp,.gp3,.gp4,.gp5,.gpx,.musicxml,.mxml,.xml,.capx';
        input.onchange = () => {
            if (input.files?.length === 1) {
                openFile(api, input.files[0]);
            }
        };
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    };

    const formatDuration = (milliseconds: number) => {
        let seconds = milliseconds / 1000;
        const minutes = (seconds / 60) | 0;
        seconds = (seconds - minutes * 60) | 0;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <>
            <div className={styles['at-time-slider']}>
                <div
                    className={styles['at-time-slider-value']}
                    style={{
                        width: `${((currentTime / endTime) * 100).toFixed(2)}%`
                    }}
                />
            </div>
            <div className={styles['at-player']}>
                <div className={styles['at-player-left']}>
                    <button
                        type="button"
                        onClick={e => {
                            e.preventDefault();
                            open();
                        }}
                        data-tooltip-id="tooltip-playground"
                        data-tooltip-content="Open File">
                        <FontAwesomeIcon icon={solid.faFolderOpen} />
                    </button>

                    <button
                        type="button"
                        onClick={e => {
                            e.preventDefault();
                            api.playPause();
                        }}
                        data-tooltip-id="tooltip-playground"
                        data-tooltip-content="Play/Pause"
                        className={`${api.isReadyForPlayback ? '' : ' disabled'}`}>
                        <FontAwesomeIcon icon={isPlaying ? solid.faPause : solid.faPlay} />
                    </button>

                    <PlayerProgressIndicator percentage={soundFontLoadPercentage} />

                    {api.score && (
                        <div className={styles['at-song-details']}>
                            <span className={styles['at-song-title']}>{api.score.title}</span>
                            <span> - </span>
                            <span className={styles['at-song-artist']}>{api.score.artist}</span>
                        </div>
                    )}

                    <div className={styles['at-time-position']}>
                        {formatDuration(currentTime)} / {formatDuration(endTime)}
                    </div>
                </div>

                <div className={styles['at-player-right']}>
                    <button
                        type="button"
                        onClick={e => {
                            e.preventDefault();
                            if (sidePanel === SidePanel.TrackSelector) {
                                onSidePanelChange(SidePanel.None);
                            } else {
                                onSidePanelChange(SidePanel.TrackSelector);
                            }
                        }}
                        className={sidePanel === SidePanel.TrackSelector ? styles.active : ''}>
                        <FontAwesomeIcon icon={solid.faListCheck} /> Tracks
                    </button>
                    <button
                        type="button"
                        onClick={e => {
                            e.preventDefault();
                            if (sidePanel === SidePanel.Settings) {
                                onSidePanelChange(SidePanel.None);
                            } else {
                                onSidePanelChange(SidePanel.Settings);
                            }
                        }}
                        className={sidePanel === SidePanel.Settings ? styles.active : ''}>
                        <FontAwesomeIcon icon={solid.faGear} /> Settings
                    </button>
                </div>
            </div>
        </>
    );
};
