import * as alphaTab from '@coderline/alphatab';
import React from 'react';

export interface PlaybackSpeedSliderProps {
    api: alphaTab.AlphaTabApi;
}

export interface PlaybackSpeedSliderState {
    speed: number;
}

export class PlaybackSpeedSlider extends React.Component<PlaybackSpeedSliderProps, PlaybackSpeedSliderState> {
    public constructor(props: PlaybackSpeedSliderProps) {
        super(props);
        this.state = {
            speed: 1
        };
        this.setSpeed = this.setSpeed.bind(this);
    }

    private setSpeed(speed: number, e: React.MouseEvent) {
        e.preventDefault();
        const api = this.props.api;
        if (api) {
            this.setState({
                speed: speed,
            });
            this.props.api.playbackSpeed = speed;
        }
    }

    public render() {
        return (
            <div className="dropdown dropdown--hoverable">
                <span title="Playback Speed">{this.state.speed}x</span>
                <ul className="dropdown__menu">
                    <li>
                        <a className="dropdown__link" href="#" onClick={e => this.setSpeed(0.25, e)}>
                            0.25x
                        </a>
                    </li>
                    <li>
                        <a className="dropdown__link" href="#" onClick={e => this.setSpeed(0.5, e)}>
                            0.5x
                        </a>
                    </li>
                    <li>
                        <a className="dropdown__link" href="#" onClick={e => this.setSpeed(0.75, e)}>
                            0.75x
                        </a>
                    </li>
                    <li>
                        <a className="dropdown__link" href="#" onClick={e => this.setSpeed(0.9, e)}>
                            0.9x
                        </a>
                    </li>
                    <li>
                        <a className="dropdown__link" href="#" onClick={e => this.setSpeed(1, e)}>
                            1x
                        </a>
                    </li>
                    <li>
                        <a className="dropdown__link" href="#" onClick={e => this.setSpeed(1.25, e)}>
                            1.25x
                        </a>
                    </li>
                    <li>
                        <a className="dropdown__link" href="#" onClick={e => this.setSpeed(1.5, e)}>
                            1.5x
                        </a>
                    </li>
                    <li>
                        <a className="dropdown__link" href="#" onClick={e => this.setSpeed(2, e)}>
                            2x
                        </a>
                    </li>
                </ul>
            </div>
        );
    }
}