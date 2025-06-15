import type * as alphaTab from '@coderline/alphatab';
import type React from 'react';
import { useState } from 'react';
import styles from './styles.module.scss';
import { useEffectNoMount } from '@site/src/hooks';

type StaffOptions = {
    showSlash: boolean;
    showNumbered: boolean;
    showTablature: boolean;
    showStandardNotation: boolean;
};

export interface StaffItemProps {
    api: alphaTab.AlphaTabApi;
    staff: alphaTab.model.Staff;
}

export const StaffItem: React.FC<StaffItemProps> = ({ api, staff }) => {
    const [staffOptions, _setStaffOptions] = useState<StaffOptions>({
        showNumbered: staff.showNumbered,
        showSlash: staff.showSlash,
        showTablature: staff.showTablature,
        showStandardNotation: staff.showStandardNotation
    });

    useEffectNoMount(() => {
        for (const key in staffOptions) {
            staff[key] = staffOptions[key];
        }
        api.render();
    }, [api, staff, staffOptions]);

    const setStaffOptions = (updater: (current: StaffOptions) => StaffOptions) => {
        _setStaffOptions(value => {
            const newValue = updater(value);
            if (!Array.from(Object.keys(newValue)).some(k => newValue[k])) {
                return value;
            }
            return newValue;
        });
    };

    return (
        <div className={`${styles['settings-item']}`}>
            <div className={`${styles['settings-item-label']}`}>Staff {staff.index + 1}</div>
            <div className={`${styles['settings-item-control']} ${styles['button-group']}`}>
                <button
                    type="button"
                    className={`button ${styles['icon-button']} button--sm ${staffOptions.showStandardNotation ? 'button--primary' : 'button--secondary button--outline'}`}
                    disabled={staff.isPercussion}
                    onClick={() => setStaffOptions(o => ({ ...o, showStandardNotation: !o.showStandardNotation }))}
                    data-tooltip-content="Standard Notation"
                    data-tooltip-id="tooltip-playground">
                    𝅘𝅥
                </button>
                <button
                    type="button"
                    className={`button ${styles['icon-button']} button--sm ${staffOptions.showTablature ? 'button--primary' : 'button--secondary button--outline'}`}
                    onClick={() => setStaffOptions(o => ({ ...o, showTablature: !o.showTablature }))}
                    disabled={staff.isPercussion}
                    data-tooltip-content="Guitar Tabs"
                    data-tooltip-id="tooltip-playground">
                    5⤴
                </button>
                <button
                    type="button"
                    className={`button ${styles['icon-button']} button--sm ${staffOptions.showSlash ? 'button--primary' : 'button--secondary button--outline'}`}
                    onClick={() => setStaffOptions(o => ({ ...o, showSlash: !o.showSlash }))}
                    disabled={staff.isPercussion}
                    data-tooltip-content="Slash Notation"
                    data-tooltip-id="tooltip-playground">
                    𝄍
                </button>
                <button
                    type="button"
                    className={`button ${styles['icon-button']} button--sm ${staffOptions.showNumbered ? 'button--primary' : 'button--secondary button--outline'}`}
                    onClick={() => setStaffOptions(o => ({ ...o, showNumbered: !o.showNumbered }))}
                    disabled={staff.isPercussion}
                    data-tooltip-content="Numbered Notation"
                    data-tooltip-id="tooltip-playground">
                    &#818;2&#818;
                </button>
            </div>
        </div>
    );
};

export interface TrackItemProps {
    api: alphaTab.AlphaTabApi;
    track: alphaTab.model.Track;
    isSelected: boolean;
}

export const TrackItem: React.FC<TrackItemProps> = ({ api, track, isSelected }) => {
    const [isMute, setMute] = useState(track.playbackInfo.isMute);
    useEffectNoMount(() => {
        track.playbackInfo.isMute = isMute;
        api.changeTrackMute([track], isMute);
    }, [api, track, isMute]);

    const [isSolo, setSolo] = useState(track.playbackInfo.isSolo);
    useEffectNoMount(() => {
        track.playbackInfo.isSolo = isSolo;
        api.changeTrackSolo([track], isSolo);
    }, [api, track, isSolo]);

    const [volume, setVolume] = useState(track.playbackInfo.volume);
    useEffectNoMount(() => {
        api.changeTrackVolume([track], volume / track.playbackInfo.volume);
    }, [api, track, volume]);

    const onTrackSelect = (selected: boolean) => {
        let newTracks: alphaTab.model.Track[];
        if (selected) {
            newTracks = [...api.tracks, track];
        } else {
            newTracks = api.tracks.filter(t => t !== track);
            if (newTracks.length === 0) {
                return;
            }
        }

        newTracks.sort((a, b) => a.index - b.index);
        api.renderTracks(newTracks);
    };

    const [transposeAudio, setTransposeAudio] = useState<number>(0);
    const [transposeFull, setTransposeFull] = useState<number>(0);

    useEffectNoMount(() => {
        api.changeTrackTranspositionPitch([track], transposeAudio);
    }, [api, track, transposeAudio]);

    useEffectNoMount(() => {
        const pitches = api.settings.notation.transpositionPitches;
        while (pitches.length < track.index + 1) {
            pitches.push(0);
        }
        pitches[track.index] = transposeFull;
        api.updateSettings();
        api.render();
    }, [api, track, transposeFull]);

    return (
        <div className={styles['track-item']} key={track.index}>
            <div className={`${styles['settings-item']} ${styles['track-item-info']}`}>
                <div className={`${`${styles['settings-item-label']} `}`}>
                    <input
                        type="checkbox"
                        id={`t-${track.index}`}
                        checked={isSelected}
                        onChange={e => onTrackSelect(e.target.checked)}
                    />
                    <label htmlFor={`t-${track.index}`}>{track.name}</label>
                </div>
                <div className={`${styles['settings-item-control']}`}>
                    <button
                        type="button"
                        className={`button ${styles['icon-button']} button--sm ${isSolo ? 'button--success' : 'button--secondary button--outline'}`}
                        onClick={() => {
                            setSolo(v => !v);
                        }}
                        data-tooltip-content="Solo"
                        data-tooltip-id="tooltip-playground">
                        🎧
                    </button>
                    <button
                        type="button"
                        className={`button ${styles['icon-button']} button--sm ${isMute ? 'button--danger' : 'button--secondary button--outline'}`}
                        onClick={() => {
                            setMute(v => !v);
                        }}
                        data-tooltip-content="Mute"
                        data-tooltip-id="tooltip-playground">
                        🔇
                    </button>
                </div>
            </div>

            <div className={`${styles['settings-item']}`}>
                <div className={`${styles['settings-item-label']}`}>Volume</div>
                <div className={styles['settings-item-control']}>
                    <input
                        type="range"
                        min="0"
                        max="16"
                        defaultValue={volume}
                        onInput={e => setVolume((e.target as HTMLInputElement).valueAsNumber)}
                        onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    />
                </div>
            </div>

            <div className={`${styles['settings-item']}`}>
                <div
                    className={`${styles['settings-item-label']}`}
                    data-tooltip-content="Fully transposes the track (audio and notation)"
                    data-tooltip-id="tooltip-playground">
                    Transpose Full
                </div>
                <div className={styles['settings-item-control']}>
                    <input
                        type="range"
                        min="-12"
                        max="12"
                        step="1"
                        defaultValue={transposeFull}
                        onInput={e => setTransposeFull((e.target as HTMLInputElement).valueAsNumber)}
                        onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    />
                </div>
            </div>

            <div className={`${styles['settings-item']}`}>
                <div
                    className={`${styles['settings-item-label']}`}
                    data-tooltip-content="Transposes the audio playback of the track"
                    data-tooltip-id="tooltip-playground">
                    Transpose Audio
                </div>
                <div
                    className={styles['settings-item-control']}
                    data-tooltip-content={transposeAudio.toString()}
                    data-tooltip-id="tooltip-playground">
                    <input
                        type="range"
                        min="-12"
                        max="12"
                        step="1"
                        defaultValue={transposeAudio}
                        onInput={e => setTransposeAudio((e.target as HTMLInputElement).valueAsNumber)}
                        onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    />
                </div>
            </div>

            {track.staves.map(s => (
                <StaffItem api={api} staff={s} key={s.index} />
            ))}
        </div>
    );
};
