import * as alphaTab from '@coderline/alphatab';
import React from 'react';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

export interface TrackItemProps {
    api: alphaTab.AlphaTabApi;
    track: alphaTab.model.Track;
    isSelected: boolean;
}

export interface TrackItemState {
}

export class TrackItem extends React.Component<TrackItemProps, TrackItemState> {
    private _volumeSlider: React.RefObject<HTMLInputElement>;

    constructor(props) {
        super(props);
        this._volumeSlider = React.createRef();
    }

    public toggleMute(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        this.props.track.playbackInfo.isMute = !this.props.track.playbackInfo.isMute;
        this.forceUpdate();
        this.props.api.changeTrackMute(
            [this.props.track],
            this.props.track.playbackInfo.isMute
        );
    }

    public toggleSolo(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        this.props.track.playbackInfo.isSolo = !this.props.track.playbackInfo.isSolo;
        this.forceUpdate();
        this.props.api.changeTrackSolo(
            [this.props.track],
            this.props.track.playbackInfo.isSolo
        );
    }

    public updateVolume(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        const volumeSlider = this._volumeSlider.current;
        this.props.api.changeTrackVolume(
            [this.props.track],
            volumeSlider.valueAsNumber / this.props.track.playbackInfo.volume
        );
    }

    public selectTrack(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        this.props.api.renderTracks([this.props.track]);
    }

    public render() {
        const isSelected = this.props.isSelected;
        const isMute = this.props.track.playbackInfo.isMute;
        const isSolo = this.props.track.playbackInfo.isSolo;
        const volume = this.props.track.playbackInfo.volume;
        return (
            <div
                className={`${styles['at-track']} ${isSelected ? styles.active : ""}`}
                onClick={this.selectTrack.bind(this)}
            >
                <div className={styles['at-track-icon']}>
                    <FontAwesomeIcon icon={solid('guitar')} />
                </div>
                <span className={styles['at-track-name']}>{this.props.track.name}</span>
                <div className={styles['at-track-controls']}>
                    <button
                        type="button"
                        onClick={this.toggleMute.bind(this)}
                        className={`button button--danger button--sm ${isMute ? "" : "button--outline"}`}
                    >
                        Mute
                    </button>
                    <button
                        type="button"
                        onClick={this.toggleSolo.bind(this)}
                        className={`button button--success button--sm ${isSolo ? "" : "button--outline"}`}
                    >
                        Solo
                    </button>
                    <FontAwesomeIcon icon={solid('volume-up')}></FontAwesomeIcon>
                    <input
                        type="range"
                        min="0"
                        max="16"
                        ref={this._volumeSlider}
                        defaultValue={volume}
                        onInput={this.updateVolume.bind(this)}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                        className={styles['at-track-volume']}
                    />
                </div>
            </div>
        );
    }
}