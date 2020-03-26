import React from 'react';
import './alphatab-full.css';

function merge() {
    let target = {};
    // Merge the object into the target object
    let merger = (obj) => {
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                    // If we're doing a deep (merge) 
                    // and the property is an object
                    target[prop] = merge(target[prop], obj[prop]);
                } else {
                    // Otherwise, do a regular merge
                    target[prop] = obj[prop];
                }
            }
        }
    };
    //Loop through each object and conduct a merge
    for (let i = 0; i < arguments.length; i++) {
        merger(arguments[i]);
    }
    return target;
}

class TrackItem extends React.Component {
    constructor(props) {
        super(props);
    }

    toggleMute(e) {
        e.preventDefault();
        this.props.track.mute = !this.props.track.mute;
        this.setState(this.state);
        this.props.api.changeTrackMute([this.props.track], this.props.track.mute);
    }

    toggleSolo(e) {
        e.preventDefault();
        this.props.track.solo = !this.state.track.solo;
        this.setState(this.state);
        this.props.api.changeTrackSolo([this.props.track], this.props.track.mute);
    }

    updateVolume(e) {
        e.preventDefault();
        const volumeSlider = this.refs.volumeSlider;
        this.props.api.changeTrackVolume([this.props.track], volumeSlider.value / this.props.track.playbackInfo.volume);
    }

    selectTrack(e) {
        e.preventDefault();
        this.props.api.renderTracks([this.props.track]);
    }

    render() {
        const isSelected = this.props.isSelected;
        const isMute = this.props.track.playbackInfo.mute;
        const isSolo = this.props.track.playbackInfo.solo;
        const volume = this.props.track.playbackInfo.volume;
        return (<div className={`at-track ${isSelected ? "active" : ""}`} onClick={this.selectTrack}>
            <div className="at-track-icon">
                <i className="fas fa-guitar"></i>
            </div>
            <span className="at-track-name">{this.props.track.name}</span>
            <div className="at-track-controls">
                <button type="button"
                    onClick={this.toggleMute}
                    className={`btn btn-sm btn-outline-danger at-track-mute ${isMute ? "active" : ""}`}>
                    Mute
                </button>
                <button type="button"
                    onClick={this.toggleSolo}
                    className={`btn btn-sm btn-outline-success at-track-solo ${isSolo ? "active" : ""}`}>
                    Solo
                </button>
                <i className="fas fa-volume-up"></i>
                <input type="range"
                    min="0"
                    max="16"
                    ref="volumeSlider"
                    defaultValue={volume}
                    onInput={this.updateVolume}
                    onClick={e => e.preventDefault()}
                    className="at-track-volume" />
            </div>
        </div>
        );
    }
}

class Times extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="at-times">
                <div style="at-time-slider">
                    <div className="at-time-slider-value" style={{ width: ((this.props.currentTime / this.props.endTime) * 100).toFixed(2) + '%' }}></div>
                </div>
                <div className="at-times-values">
                    <div className="at-bar-position"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Bar Position">
                        {this.props.currentBarIndex + 1} / {this.props.totalBarCount}
                    </div>
                    <div className="at-time-signature"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Time Signature">
                        {this.props.timeSignatureNumerator} / {this.props.timeSignatureDenominator}
                    </div>
                    <div className="at-time-position"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Time Position">
                        {this.formatDuration(this.props.currentTime)} / {formatDuration(this.props.endTime)}
                    </div>
                    <div className="at-tempo"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Tempo">
                        {this.props.tempo}
                    </div>
                </div>
            </div>
        );
    }
}

class PlaybackSpeedSlider extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                <span className="at-speed-label">
                    Speed <span className="at-speed-value">100%</span>
                </span>
                <input type="range"
                    min="0"
                    max="300"
                    step="10"
                    defaultValue="100"
                    className="at-speed" />
            </div>
        );
    }
}

class LayoutSelector extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="btn-group dropup">
                <button type="button"
                    className="btn dropdown-toggle at-layout-button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false">
                    Layout
                </button>
                <ul className="dropdown-menu at-layout-options">
                    <li>
                        <a href="#"
                            data-layout="horizontal-screen">
                            <i className="far fa-caret-square-right"></i>
                            Horizontal Layout(Off-Screen)
                        </a>
                    </li>
                    <li>
                        <a href="#"
                            data-layout="horizontal-bar">
                            <i className="fas fa-caret-square-right"></i>
                            Horizontal Layout(Bar Wise)
                        </a>
                    </li>
                    <li>
                        <a href="#" data-layout="page">
                            <i className="fas fa-caret-square-down"></i>
                            Vertical Layout
                        </a>
                    </li>
                </ul>
            </div>
        );
    }
}

class ZoomLevelSelector extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="btn-group dropup">
                <button type="button"
                    className="btn dropdown-toggle"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false">
                    <i className="fas fa-search"></i>
                    <span className="at-zoom-label">100 %</span>
                </button>
                <ul className="dropdown-menu at-zoom-options">
                    <li>
                        <a href="#">25%</a>
                    </li>
                    <li>
                        <a href="#">50%</a>
                    </li>
                    <li>
                        <a href="#">75%</a>
                    </li>
                    <li>
                        <a href="#">90%</a>
                    </li>
                    <li>
                        <a href="#">100 %</a>
                    </li>
                    <li>
                        <a href="#">110 %</a>
                    </li>
                    <li>
                        <a href="#">125 %</a>
                    </li>
                    <li>
                        <a href="#">150 %</a>
                    </li>
                    <li>
                        <a href="#">200 %</a>
                    </li>
                </ul>
            </div>
        );
    }
}

class ScoreDetails extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="at-song-details">
                <div className="at-song-title">{this.context.api?.score?.title}</div>
                <div className="at-song-artist">{this.context.api?.score?.artist}</div>
            </div>
        );
    }
}

class PlayerProgressIndicator extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="at-player-loading progress">
                <span className="progress-left">
                    <span className="progress-bar"></span>
                </span>
                <span className="progress-right">
                    <span className="progress-bar"></span>
                </span>
                <div className="progress-value w-100 h-100 rounded-circle d-flex align-items-center justify-content-center font-weight-bold">
                    <span className="progress-value-number">0</span>
                    <sup className="small">%</sup>
                </div>
            </div>
        );
    }
}

class PlayerControlsGroup extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="at-player">
                <div className="at-player-left">
                    <a href="#"
                        className="at-stop disabled"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Stop">
                        <i className="fas fa-step-backward"></i>
                    </a>
                    <a href="#"
                        className="at-play-pause disabled"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Play/Pause">
                        <i className="fas fa-play-circle"></i>
                    </a>
                    <PlayerProgressIndicator />
                    <ScoreDetails />
                    <PlaybackSpeedSlider />
                </div>

                <div className="at-player-right">
                    <a href="#"
                        className="at-metronome disabled"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Metronome">
                        <i className="fas fa-edit"></i>
                    </a>
                    <a href="#"
                        className="at-loop disabled"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Loop">
                        <i className="fas fa-retweet"></i>
                    </a>
                    <a href="#"
                        className="at-print"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Print">
                        <i className="fas fa-print"></i>
                    </a>
                    <ZoomLevelSelector />
                    <LayoutSelector />
                </div>
            </div>
        );
    }
}

export default class AlphaTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            settings: merge({ ...props.settings },
                {
                    settings: {
                        player: {
                            scrollElement: this.refs.viewPort,
                            scrollOffsetY: -1,
                            enablePlayer: true,
                            soundFont: 'https://docs.alphatab.net/develop/assets/js/alphaTab/default.sf2'
                        }
                    }
                }
            ),
            isLoading: true,
            api: null,
            score: null
        };
    }
    componentDidMount() {
        this.setupEvents();
        this.setState({
            api: new alphaTab.platform.javaScript.AlphaTabApi(this.refs.alphaTab, this.state.settings)
        })
    }

    setupEvents() {
        const at = this.refs.alphaTab;
        at.addEventListener('alphaTab.loaded', (e) => {
            this.setState({
                score: e.detail
            });
        });

        at.addEventListener('alphaTab.render', (e) => {
            const isResize = e.detail;
            const selectedTracks = new Map();
            this.state.api.tracks.forEach((t) => { selectedTracks.set(t.index, t); });
            this.setState({
                selectedTracks: selectedTracks,
                isLoading: !isResize,
            });
        });

        at.addEventListener('alphaTab.rendered', (e) => {
            this.setState({
                isLoading: false
            });
        });

        at.addEventListener('alphaTab.soundFontLoad', function (e) {
            //updateProgress(playerLoadingIndicator, e.detail.loaded / e.detail.total);
        });
        at.addEventListener('alphaTab.soundFontLoaded', function (e) {
            //playerLoadingIndicator.classList.add('d-none');
        });
    }

    render() {
        return (
            <div className="at-wrap">

                {this.state.isLoading &&
                    <div className="at-overlay">
                        <div className="at-overlay-content">
                            <div className="spinner-border"
                                style={{ width: "3rem", height: "3rem" }}
                                role="status">
                            </div>
                        </div>
                    </div>
                }

                <div className="at-sidebar">
                    <div className="at-sidebar-content">
                        <div className="at-track-list">
                            {this.state.score?.tracks.map(t =>
                                <TrackItem
                                    key={t.index}
                                    api={this.state.api}
                                    isSelected={this.state.selectedTracks?.has(t.index)}
                                    track={t} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="at-viewport" ref="viewPort">
                    <div className="at-canvas" ref="alphaTab"></div>
                </div>

                <div className="at-footer">
                    <Times />
                    <PlayerControlsGroup />
                </div>
            </div>
        );
    }
}