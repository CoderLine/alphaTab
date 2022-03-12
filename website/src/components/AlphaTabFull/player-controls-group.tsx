import * as alphaTab from '@coderline/alphatab';
import React from 'react';
import { LayoutSelector } from './layout-selector';
import { PlaybackSpeedSlider } from './playback-speed-slider';
import { PlayerProgressIndicator } from './player-progress-indicator';
import { ScoreDetails } from './score-details';
import { ZoomLevelSelector } from './zoom-level-selector';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

export interface PlayerControlsGroupProps {
    api: alphaTab.AlphaTabApi;
    onLayoutChange: (layoutMode: alphaTab.LayoutMode, scrollMode: alphaTab.ScrollMode) => void;
}

export interface PlayerControlsGroupState {
    soundFontLoadPercentage: number;
    isLooping: boolean;
    isCountInActive: boolean;
    isMetronomeActive: boolean;
    isPlaying: boolean;

    tempo: number;

    currentBarIndex: number;
    totalBarCount: number;

    timeSignatureNumerator: number;
    timeSignatureDenominator: number;

    currentTime: number;
    endTime: number;
}

export class PlayerControlsGroup extends React.Component<PlayerControlsGroupProps, PlayerControlsGroupState> {
    public constructor(props: PlayerControlsGroupProps) {
        super(props);
        this.state = {
            soundFontLoadPercentage: 0,
            isLooping: false,
            isCountInActive: false,
            isMetronomeActive: false,
            isPlaying: false,
            currentTime: 0,
            endTime: 1,
            tempo: 0,
            currentBarIndex: 0,
            totalBarCount: 0,
            timeSignatureNumerator: 4,
            timeSignatureDenominator: 4
        };
    }

    public stop(e: Event) {
        e.preventDefault();
        this.props.api?.stop();
    }

    public playPause(e: Event) {
        e.preventDefault();
        this.props.api?.playPause();
    }

    public print(e: Event) {
        e.preventDefault();
        this.props.api?.print('');
    }

    public download(e: Event) {
        e.preventDefault();
        const exporter = new alphaTab.exporter.Gp7Exporter();
        const score = this.props.api.score;
        const data = exporter.export(score, this.props.api.settings);
        const a = document.createElement('a');
        a.download = score.title.length > 0 ? score.title.trim() + '.gp' : 'Untitled.gp';
        a.href = URL.createObjectURL(new Blob([data], { type: 'application/gp' }));
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    public open(e: Event) {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = ".gp,.gp3,.gp4,.gp5,.gpx,.musicxml,.mxml,.xml,.capx";
        input.onchange = () => {
            if (input.files.length === 1) {
                this.openFile(input.files[0]);
            }
        };
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }

    public openFile(file: Blob) {
        const reader = new FileReader();
        reader.onload = (data) => {
            this.props.api.load(data.target.result, [0]);
        };
        reader.readAsArrayBuffer(file);
    }

    public toggleLoop(e: Event) {
        e.preventDefault();
        if (this.props.api) {
            let isLooping = !this.state.isLooping;
            this.setState({
                isLooping: isLooping,
            });
            this.props.api.isLooping = isLooping;
        }
    }

    public toggleMetronome(e: Event) {
        e.preventDefault();
        if (this.props.api) {
            let isMetronomeActive = !this.state.isMetronomeActive;
            this.setState({
                isMetronomeActive: isMetronomeActive,
            });
            this.props.api.metronomeVolume = isMetronomeActive ? 1 : 0;
        }
    }

    public toggleCountIn(e: Event) {
        e.preventDefault();
        if (this.props.api) {
            let isCountInActive = !this.state.isCountInActive;
            this.setState({
                isCountInActive: isCountInActive,
            });
            this.props.api.countInVolume = isCountInActive ? 1 : 0;
        }
    }

    public formatDuration(milliseconds: number) {
        let seconds = milliseconds / 1000;
        const minutes = (seconds / 60) | 0;
        seconds = (seconds - minutes * 60) | 0;
        return (
            String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0")
        );
    }

    public render(): JSX.Element {
        return (
            <>
                <div className={styles['at-time-slider']}>
                    <div
                        className={styles['at-time-slider-value']}
                        style={{
                            width:
                                ((this.state.currentTime / this.state.endTime) * 100).toFixed(
                                    2
                                ) + "%",
                        }}
                    ></div>
                </div>
                <div className={styles['at-player']}>
                    <div className={styles['at-player-left']}>
                        <a href="#" onClick={this.open.bind(this)} title="Open File">
                            <FontAwesomeIcon icon={solid('folder-open')} />
                        </a>

                        <a href="#" onClick={this.stop.bind(this)} title="Stop"
                            className={(this.props.api?.isReadyForPlayback ? "" : " disabled")}>
                            <FontAwesomeIcon icon={solid('step-backward')} />
                        </a>


                        <a href="#" onClick={this.playPause.bind(this)} title="Play/Pause"
                            className={(this.props.api?.isReadyForPlayback ? "" : " disabled")}>
                            <FontAwesomeIcon icon={this.state.isPlaying ? solid("pause") : solid("play")} />
                        </a>

                        <PlaybackSpeedSlider api={this.props.api} />
                        <PlayerProgressIndicator
                            percentage={this.state.soundFontLoadPercentage}
                        />
                        <ScoreDetails score={this.props.api?.score} />


                        <div className={styles['at-time-position']} title="Time Position">
                            {this.formatDuration(this.state.currentTime)} /{" "}
                            {this.formatDuration(this.state.endTime)}
                        </div>
                    </div>

                    <div className={styles['at-player-right']}>
                        <a href="#"
                            onClick={this.toggleCountIn.bind(this)}
                            className={
                                (this.props.api?.isReadyForPlayback ? "" : " disabled") +
                                (this.state.isCountInActive ? " " + styles.active : "")
                            }
                            title="Count-In"
                        >
                            <FontAwesomeIcon icon={solid("hourglass-half")} />
                        </a>
                        <a
                            href="#"
                            onClick={this.toggleMetronome.bind(this)}
                            className={
                                (this.props.api?.isReadyForPlayback ? "" : " disabled") +
                                (this.state.isMetronomeActive ? " " + styles.active : "")
                            }
                            title="Metronome"
                        >
                            <FontAwesomeIcon icon={solid("edit")} />
                        </a>
                        <a
                            href="#"
                            onClick={this.toggleLoop.bind(this)}
                            className={
                                (this.props.api?.isReadyForPlayback ? "" : " disabled") +
                                (this.state.isLooping ? " " + styles.active : "")
                            }
                            title="Loop"
                        >
                            <FontAwesomeIcon icon={solid("retweet")} />
                        </a>

                        <a
                            href="#"
                            onClick={this.print.bind(this)}
                            className={
                                (this.props.api?.isReadyForPlayback ? "" : " disabled")
                            }
                            title="Print"
                        >
                            <FontAwesomeIcon icon={solid("print")} />
                        </a>

                        <a
                            href="#"
                            onClick={this.download.bind(this)}
                            className={
                                (this.props.api?.isReadyForPlayback ? "" : " disabled")
                            }
                            title="Export to Guitar Pro 7"
                        >
                            <FontAwesomeIcon icon={solid("download")} />
                        </a>

                        <ZoomLevelSelector api={this.props.api} />
                        <LayoutSelector api={this.props.api} onLayoutChange={this.props.onLayoutChange} />

                        <div className={styles['at-logo']}>
                            powered by <img src="/img/alphatab.png" />
                        </div>
                    </div>
                </div >
            </>
        );
    }
}
