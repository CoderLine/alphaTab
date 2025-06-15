import type * as alphaTab from '@coderline/alphatab';
import type React from 'react';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useAlphaTabEvent } from '@site/src/hooks';
import { TrackItem } from './track-item';

export interface PlaygroundTrackSelectorProps {
    api: alphaTab.AlphaTabApi;
    isOpen: boolean;
    onClose: () => void;
}

export const PlaygroundTrackSelector: React.FC<PlaygroundTrackSelectorProps> = ({
    api,
    isOpen: areSettingsOpen,
    onClose
}) => {
    const [score, setScore] = useState(api.score);
    const [selectedTracks, setSelectedTracks] = useState(new Map<number, alphaTab.model.Track>());

    useAlphaTabEvent(api, 'renderStarted', isResize => {
        const selectedTracks = new Map<number, alphaTab.model.Track>();
        for (const t of api!.tracks) {
            selectedTracks.set(t.index, t);
        }

        setSelectedTracks(selectedTracks);
    });

    useAlphaTabEvent(api, 'scoreLoaded', score => {
        setScore(score);
    });

    useEffect(() => {
        setScore(api.score);
    }, [api.score]);

    return (
        <div className={`${styles['at-settings']} shadow--tl ${areSettingsOpen ? styles.open : ''}`}>
            <button
                type="button"
                onClick={() => onClose()}
                className={`button button--sm button--primary button--outline ${styles['at-settings-close']}`}>
                <FontAwesomeIcon icon={solid.faClose} />
            </button>

            <h4>Tracks</h4>

            {score?.tracks.map(t => (
                <TrackItem key={t.index} api={api} track={t} isSelected={selectedTracks.has(t.index)} />
            ))}
        </div>
    );
};
