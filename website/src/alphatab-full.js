import React from "react";
import "./alphatab-full.css";

function merge() {
  let target = {};
  // Merge the object into the target object
  let merger = (obj) => {
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (Object.prototype.toString.call(obj[prop]) === "[object Object]") {
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
    e.stopPropagation();
    this.props.track.playbackInfo.mute = !this.props.track.playbackInfo.mute;
    this.forceUpdate();
    this.props.api.changeTrackMute(
      [this.props.track],
      this.props.track.playbackInfo.mute
    );
  }

  toggleSolo(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.track.playbackInfo.solo = !this.props.track.playbackInfo.solo;
    this.forceUpdate();
    this.props.api.changeTrackSolo(
      [this.props.track],
      this.props.track.playbackInfo.solo
    );
  }

  updateVolume(e) {
    e.preventDefault();
    const volumeSlider = this.refs.volumeSlider;
    this.props.api.changeTrackVolume(
      [this.props.track],
      volumeSlider.value / this.props.track.playbackInfo.volume
    );
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
    return (
      <div
        className={`at-track ${isSelected ? "active" : ""}`}
        onClick={this.selectTrack.bind(this)}
      >
        <div className="at-track-icon">
          <i className="fas fa-guitar"></i>
        </div>
        <span className="at-track-name">{this.props.track.name}</span>
        <div className="at-track-controls">
          <button
            type="button"
            onClick={this.toggleMute.bind(this)}
            className={`btn btn-sm btn-outline-danger at-track-mute ${
              isMute ? "active" : ""
            }`}
          >
            Mute
          </button>
          <button
            type="button"
            onClick={this.toggleSolo.bind(this)}
            className={`btn btn-sm btn-outline-success at-track-solo ${
              isSolo ? "active" : ""
            }`}
          >
            Solo
          </button>
          <i className="fas fa-volume-up"></i>
          <input
            type="range"
            min="0"
            max="16"
            ref="volumeSlider"
            defaultValue={volume}
            onInput={this.updateVolume.bind(this)}
            onClick={(e) => e.preventDefault()}
            className="at-track-volume"
          />
        </div>
      </div>
    );
  }
}

class PlaybackSpeedSlider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      speed: 1,
    };
  }

  setSpeed(e) {
    e.preventDefault();
    const api = this.props.api;
    if (api) {
      const speed = parseFloat(e.target.innerText);
      this.setState({
        speed: speed,
      });
      this.props.api.playbackSpeed = speed;
    }
  }

  render() {
    return (
      <div className="btn-group dropup">
        <button
          type="button"
          className="btn dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <span className="at-speed-label" ref="currentValue">
            {this.state.speed}x
          </span>
        </button>
        <div className="dropdown-menu at-speed-options">
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setSpeed.bind(this)}
          >
            0.25x
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setSpeed.bind(this)}
          >
            0.5x
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setSpeed.bind(this)}
          >
            0.75x
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setSpeed.bind(this)}
          >
            0.9x
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setSpeed.bind(this)}
          >
            1x
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setSpeed.bind(this)}
          >
            1.1x
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setSpeed.bind(this)}
          >
            1.25x
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setSpeed.bind(this)}
          >
            1.50x
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setSpeed.bind(this)}
          >
            2x
          </a>
        </div>
      </div>
    );
  }
}

class LayoutSelector extends React.Component {
  constructor(props) {
    super(props);
  }

  selectLayout(layoutMode, scrollMode, e) {
    e.preventDefault();

    if (this.props.api) {
      const settings = this.props.api.settings;
      console.log(settings);
      settings.display.layoutMode = layoutMode;
      settings.player.scrollmode = scrollMode;
      this.props.api.updateSettings();
      this.props.api.render();
    }
  }

  render() {
    return (
      <div className="btn-group dropup">
        <button
          type="button"
          className="btn dropdown-toggle at-layout-button"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          Layout
        </button>
        <div className="dropdown-menu dropdown-menu-right at-layout-options">
          <a
            className="dropdown-item"
            href="#"
            onClick={this.selectLayout.bind(this, 1, 2)}
          >
            <i className="far fa-caret-square-right"></i> Horizontal Layout
            (Off-Screen)
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.selectLayout.bind(this, 1, 1)}
          >
            <i className="fas fa-caret-square-right"></i> Horizontal Layout (Bar
            Wise)
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.selectLayout.bind(this, 0, 1)}
          >
            <i className="fas fa-caret-square-down"></i> Vertical Layout
          </a>
        </div>
      </div>
    );
  }
}

class ZoomLevelSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zoom: 100,
    };
  }

  setZoom(e) {
    e.preventDefault();
    const api = this.props.api;
    if (api) {
      const zoom = parseInt(e.target.innerText);
      this.setState({
        zoom: zoom,
      });

      api.settings.display.scale = zoom / 100.0;
      api.updateSettings();
      api.render();
    }
  }

  render() {
    return (
      <div className="btn-group dropup">
        <button
          type="button"
          className="btn dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <i className="fas fa-search"></i>
          <span className="at-zoom-label" ref="currentValue">
            {this.state.zoom}%
          </span>
        </button>
        <div className="dropdown-menu dropdown-menu-right at-zoom-options">
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setZoom.bind(this)}
          >
            25%
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setZoom.bind(this)}
          >
            50%
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setZoom.bind(this)}
          >
            75%
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setZoom.bind(this)}
          >
            90%
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setZoom.bind(this)}
          >
            100%
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setZoom.bind(this)}
          >
            110%
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setZoom.bind(this)}
          >
            125%
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setZoom.bind(this)}
          >
            150%
          </a>
          <a
            className="dropdown-item"
            href="#"
            onClick={this.setZoom.bind(this)}
          >
            200%
          </a>
        </div>
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
        <span className="at-song-title">{this.props.score?.title}</span> -{" "}
        <span className="at-song-artist">{this.props.score?.artist}</span>
      </div>
    );
  }
}

class PlayerProgressIndicator extends React.Component {
  constructor(props) {
    super(props);
  }

  getLeftRotateTransform() {
    if (this.props.percentage < 0.5) {
      return "rotate(0deg)";
    } else {
      return (
        "rotate(" +
        this.percentageToDegrees(this.props.percentage - 0.5) +
        "deg)"
      );
    }
  }

  getRightRotateTransform() {
    if (this.props.percentage < 0.5) {
      return (
        "rotate(" + this.percentageToDegrees(this.props.percentage) + "deg)"
      );
    } else {
      return "rotate(180deg)";
    }
  }

  percentageToDegrees(percentage) {
    return percentage * 360;
  }

  render() {
    return (
      this.props.percentage < 0.99 && (
        <div className="at-player-loading progress">
          <span className="progress-left">
            <span
              className="progress-bar"
              style={{ transform: this.getLeftRotateTransform() }}
            ></span>
          </span>
          <span className="progress-right">
            <span
              className="progress-bar"
              style={{ transform: this.getRightRotateTransform() }}
            ></span>
          </span>
          <div className="progress-value w-100 h-100 rounded-circle d-flex align-items-center justify-content-center font-weight-bold">
            <span className="progress-value-number">
              {(this.props.percentage * 100) | 0}
            </span>
            <sup className="small">%</sup>
          </div>
        </div>
      )
    );
  }
}

class PlayerControlsGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      soundFontLoadPercentage: 0,
      isLooping: false,
      isMetronomeActive: false,
      isPlaying: false,
    };
  }

  stop(e) {
    e.preventDefault();
    this.props.api?.stop();
  }

  playPause(e) {
    e.preventDefault();
    this.props.api?.playPause();
  }

  print(e) {
    e.preventDefault();
    this.props.api?.print();
  }

  toggleLoop(e) {
    e.preventDefault();
    if (this.props.api) {
      let isLooping = !this.state.isLooping;
      this.setState({
        isLooping: isLooping,
      });
      this.props.api.isLooping = isLooping;
    }
  }

  toggleMetronome(e) {
    e.preventDefault();
    if (this.props.api) {
      let isMetronomeActive = !this.state.isMetronomeActive;
      this.setState({
        isMetronomeActive: isMetronomeActive,
      });
      this.props.api.metronomeVolume = isMetronomeActive ? 1 : 0;
    }
  }

  formatDuration(milliseconds) {
    let seconds = milliseconds / 1000;
    const minutes = (seconds / 60) | 0;
    seconds = (seconds - minutes * 60) | 0;
    return (
      String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0")
    );
  }

  render() {
    return (
      <>
        <div className="at-time-slider">
          <div
            className="at-time-slider-value"
            style={{
              width:
                ((this.state.currentTime / this.state.endTime) * 100).toFixed(
                  2
                ) + "%",
            }}
          ></div>
        </div>
        <div className="at-player">
          <div className="at-player-left">
            <a
              href="#"
              onClick={this.stop.bind(this)}
              className={
                "at-stop" +
                (this.props.api?.isReadyForPlayback ? "" : " disabled")
              }
              data-toggle="tooltip"
              data-placement="top"
              title="Stop"
            >
              <i className="fas fa-step-backward"></i>
            </a>
            <a
              href="#"
              onClick={this.playPause.bind(this)}
              className={
                "at-play-pause" +
                (this.props.api?.isReadyForPlayback ? "" : " disabled")
              }
              data-toggle="tooltip"
              data-placement="top"
              title="Play/Pause"
            >
              <i
                className={
                  "fas " + (this.state.isPlaying ? "fa-pause" : "fa-play")
                }
              ></i>
            </a>
            <PlaybackSpeedSlider api={this.props.api} />
            <PlayerProgressIndicator
              percentage={this.state.soundFontLoadPercentage}
            />
            <ScoreDetails score={this.props.api?.score} />

            <div
              className="at-time-position"
              data-toggle="tooltip"
              data-placement="top"
              title="Time Position"
            >
              {this.formatDuration(this.state.currentTime)} /{" "}
              {this.formatDuration(this.state.endTime)}
            </div>
          </div>

          <div className="at-player-right">
            <a
              href="#"
              onClick={this.toggleMetronome.bind(this)}
              className={
                "at-metronome" +
                (this.props.api?.isReadyForPlayback ? "" : " disabled") +
                (this.state.isMetronomeActive ? " active" : "")
              }
              data-toggle="tooltip"
              data-placement="top"
              title="Metronome"
            >
              <i className="fas fa-edit"></i>
            </a>
            <a
              href="#"
              onClick={this.toggleLoop.bind(this)}
              className={
                "at-loop" +
                (this.props.api?.isReadyForPlayback ? "" : " disabled") +
                (this.state.isLooping ? " active" : "")
              }
              data-toggle="tooltip"
              data-placement="top"
              title="Loop"
            >
              <i className="fas fa-retweet"></i>
            </a>
            <a
              href="#"
              onClick={this.print.bind(this)}
              className={
                "at-print" +
                (this.props.api?.isReadyForPlayback ? "" : " disabled")
              }
              data-toggle="tooltip"
              data-placement="top"
              title="Print"
            >
              <i className="fas fa-print"></i>
            </a>
            <ZoomLevelSelector api={this.props.api} />
            <LayoutSelector api={this.props.api} />

            <div className="at-logo">
              powered by <img src="/img/alphatab.png" />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default class AlphaTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: merge(
        { ...props.settings },
        {
          player: {
            scrollElement: this.refs.viewPort,
            scrollOffsetY: -10,
            enablePlayer: true,
            soundFont: "/js/alphaTab/soundfont/sonivox.sf2",
          },
        }
      ),
      isLoading: true,
      api: null,
      score: null,
    };
    this._currentTempo = 0;
  }
  componentDidMount() {
    this.state.settings.player.scrollElement = this.refs.viewPort;
    this.setupEvents();

    console.log(this.state.settings);

    this.setState({
      api: new alphaTab.AlphaTabApi(this.refs.alphaTab, this.state.settings),
    });
  }

  componentWillUnmount() {
    this.state.api.destroy();
  }

  updateMasterBarTimes(currentMasterBar) {
    const masterBarCount = currentMasterBar.score.masterBars.length;
    if (currentMasterBar.tempoAutomation != null) {
      this._currentTempo = currentMasterBar.tempoAutomation.value | 0;
    }

    this.refs.playerControls.setState({
      timeSignatureNumerator: currentMasterBar.timeSignatureNumerator,
      timeSignatureDenominator: currentMasterBar.timeSignatureDenominator,
      currentBarIndex: currentMasterBar.index + 1,
      totalBarCount: masterBarCount,
      tempo: this._currentTempo,
    });
  }

  setupEvents() {
    const at = this.refs.alphaTab;
    const playerControls = this.refs.playerControls;

    at.addEventListener("alphaTab.scoreLoaded", (e) => {
      this.setState({
        score: e.detail,
      });
      this._currentTempo = e.detail.tempo;
      this.updateMasterBarTimes(e.detail.masterBars[0]);
    });

    at.addEventListener("alphaTab.playedBeatChanged", (e) => {
      this.updateMasterBarTimes(e.detail.voice.bar.masterBar);
    });

    at.addEventListener("alphaTab.playerStateChanged", (e) => {
      const args = e.detail;
      playerControls.setState({
        isPlaying: args.state == 1,
      });
    });

    at.addEventListener("alphaTab.resize", (e) => {
        if(e.detail.newWidth > 750) {
            e.detail.settings.display.scale = 1;
            e.detail.settings.display.layoutMode = alphaTab.LayoutMode.Page;         
        } else {
            e.detail.settings.display.scale = 0.8;
            e.detail.settings.display.layoutMode = alphaTab.LayoutMode.Horizontal;
        }
    });

    at.addEventListener("alphaTab.renderStarted", (e) => {
      const isResize = e.detail;
      const selectedTracks = new Map();
      this.state.api.tracks.forEach((t) => {
        selectedTracks.set(t.index, t);
      });
      this.setState({
        selectedTracks: selectedTracks,
        isLoading: !isResize,
      });
    });

    at.addEventListener("alphaTab.renderFinished", (e) => {
      this.setState({
        isLoading: false,
      });
    });

    let previousTime = -1;
    at.addEventListener("alphaTab.playerPositionChanged", (e) => {
      var args = e.detail;

      // reduce number of UI updates to second changes.
      const currentSeconds = (args.currentTime / 1000) | 0;
      if (currentSeconds == previousTime || currentSeconds === 0) {
        return;
      }
      previousTime = currentSeconds;
      playerControls.setState(args);
    });

    at.addEventListener("alphaTab.soundFontLoad", function (e) {
      playerControls.setState({
        soundFontLoadPercentage: e.detail.loaded / e.detail.total,
      });
    });
    at.addEventListener("alphaTab.soundFontLoaded", function (e) {
      playerControls.setState({
        soundFontLoadPercentage: 1,
      });
    });
  }

  render() {
    return (
      <div className="at-wrap">
        {this.state.isLoading && (
          <div className="at-overlay">
            <div className="at-overlay-content">
              <div
                className="spinner-border"
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              ></div>
            </div>
          </div>
        )}

        <div className="at-content">
          <div className="at-sidebar">
            <div className="at-sidebar-content">
              <div className="at-track-list">
                {this.state.score?.tracks.map((t) => (
                  <TrackItem
                    key={t.index}
                    api={this.state.api}
                    isSelected={this.state.selectedTracks?.has(t.index)}
                    track={t}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="at-viewport" ref="viewPort">
            <div className="at-canvas" ref="alphaTab"></div>
          </div>
        </div>

        <div className="at-footer">
          <PlayerControlsGroup ref="playerControls" api={this.state.api} />
        </div>
      </div>
    );
  }
}
