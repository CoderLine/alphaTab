import * as alphaTab from '@coderline/alphatab';
import React from 'react';
import { PlayerControlsGroup } from './player-controls-group';
import { TrackItem } from './track-item';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import environment from '@site/src/environment';

interface AlphaTabProps {
    settings: any
}

interface AlphaTabState {
    settings: alphaTab.Settings,
    isLoading: boolean,
    api?: alphaTab.AlphaTabApi,
    score?: alphaTab.model.Score;
    selectedTracks?: Map<number, alphaTab.model.Track>;

    layoutMode: alphaTab.LayoutMode | undefined;
    scrollMode: alphaTab.ScrollMode | undefined;
}

export class AlphaTabFull extends React.Component<AlphaTabProps, AlphaTabState>  {
    private _currentTempo: number = 0;
    private _viewPort: React.RefObject<HTMLDivElement>;
    private _alphaTab: React.RefObject<HTMLDivElement>;
    private _wrapper: React.RefObject<HTMLDivElement>;
    private _playerControls: React.RefObject<PlayerControlsGroup>;

    constructor(props: AlphaTabProps | Readonly<AlphaTabProps>) {
        super(props);
        this._viewPort = React.createRef();
        this._wrapper = React.createRef();
        this._playerControls = React.createRef();
        this._alphaTab = React.createRef();

        // pull fonts
        const settings = new alphaTab.Settings();
        settings.player.scrollOffsetY = -10;
        settings.player.enablePlayer = true;
        settings.core.fontDirectory = environment.fontDirectory;
        settings.player.soundFont = require('@coderline/alphatab/soundfont/sonivox.sf2');
        settings.fillFromJson(props.settings);

        this.state = {
            settings: settings,
            isLoading: true,
            layoutMode: undefined,
            scrollMode: undefined
        };

        this.onLayoutChange = this.onLayoutChange.bind(this);
    }

    componentDidMount(): void {
        const viewPort = this._viewPort.current;
        const alphaTabHost = this._alphaTab.current;
        this.state.settings.player.scrollElement = viewPort;

        // we avoid re-creation of the alphaTab element here.
        this.setupEvents(alphaTabHost);
        this.setState({
            api: new alphaTab.AlphaTabApi(alphaTabHost, this.state.settings)
        });
        this._wrapper.current.ondragover = (e) => {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'link';
        };
        this._wrapper.current.ondrop = (e) => {
            e.stopPropagation();
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length === 1) {
                this._playerControls.current.openFile(files[0]);
            }
        };
    }

    componentWillUnmount(): void {
        this.state.api?.destroy();
    }

    private onLayoutChange(layoutMode: alphaTab.LayoutMode | undefined, scrollMode: alphaTab.ScrollMode | undefined) {
        this.setState({
            layoutMode: layoutMode,
            scrollMode: scrollMode
        });

        const settings = this.state.api.settings;
        this.updateSettingsForLayout(settings, layoutMode, scrollMode, this._viewPort.current?.offsetWidth ?? window.innerWidth);
        this.state.api.updateSettings();
        this.state.api.render();
    }

    private updateSettingsForLayout(settings: alphaTab.Settings, layoutMode: alphaTab.LayoutMode | undefined, scrollMode: alphaTab.ScrollMode | undefined, width: number) {
        if (layoutMode == undefined) {
            if (width > 750) {
                settings.display.scale = 1;
                settings.display.layoutMode = alphaTab.LayoutMode.Page;
            } else {
                settings.display.scale = 0.8;
                settings.display.layoutMode = alphaTab.LayoutMode.Horizontal;
            }
        } else {
            if (width > 750) {
                settings.display.scale = 1;
            } else {
                settings.display.scale = 0.8;
            }
            settings.display.layoutMode = layoutMode;
            settings.player.scrollMode = scrollMode;
        }
    }

    private updateMasterBarTimes(currentMasterBar: alphaTab.model.MasterBar) {
        const masterBarCount = currentMasterBar.score.masterBars.length;
        if (currentMasterBar.tempoAutomation != null) {
            this._currentTempo = currentMasterBar.tempoAutomation.value | 0;
        }

        this._playerControls.current.setState({
            timeSignatureNumerator: currentMasterBar.timeSignatureNumerator,
            timeSignatureDenominator: currentMasterBar.timeSignatureDenominator,
            currentBarIndex: currentMasterBar.index + 1,
            totalBarCount: masterBarCount,
            tempo: this._currentTempo,
        });
    }

    private setupEvents(at: HTMLDivElement) {
        at.addEventListener("alphaTab.scoreLoaded", (e: CustomEvent) => {
            this.setState({
                score: e.detail,
            });
            this._currentTempo = e.detail.tempo;
            this.updateMasterBarTimes(e.detail.masterBars[0]);
        });

        at.addEventListener("alphaTab.playedBeatChanged", (e: CustomEvent) => {
            this.updateMasterBarTimes(e.detail.voice.bar.masterBar);
        });

        at.addEventListener("alphaTab.playerStateChanged", (e: CustomEvent) => {
            const args = e.detail;
            this._playerControls.current?.setState({
                isPlaying: args.state == 1,
            });
        });

        at.addEventListener("alphaTab.resize", (e: CustomEvent) => {
            this.updateSettingsForLayout(e.detail.settings,
                this.state.layoutMode,
                this.state.scrollMode,
                e.detail.newWidth
            );
        });

        at.addEventListener("alphaTab.renderStarted", (e: CustomEvent) => {
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

        at.addEventListener("alphaTab.renderFinished", () => {
            this.setState({
                isLoading: false,
            });
        });

        let previousTime = -1;
        let previousEndTime = 0;
        at.addEventListener("alphaTab.playerPositionChanged", (e: CustomEvent) => {
            const args = e.detail;

            // reduce number of UI updates to second changes.
            const currentSeconds = (args.currentTime / 1000) | 0;
            if (args.endTick == previousEndTime &&
                (currentSeconds == previousTime || currentSeconds === 0)) {
                return;
            }
            previousTime = currentSeconds;
            this._playerControls.current.setState(args);
        });

        at.addEventListener("alphaTab.soundFontLoad", (e: CustomEvent) => {
            this._playerControls.current.setState({
                soundFontLoadPercentage: e.detail.loaded / e.detail.total,
            });
        });
        at.addEventListener("alphaTab.soundFontLoaded", () => {
            this._playerControls.current.setState({
                soundFontLoadPercentage: 1,
            });
        });
    }

    public render(): JSX.Element {
        return (
            <div className={styles['at-wrap']} ref={this._wrapper}>
                {this.state.isLoading && (
                    <div className={styles['at-overlay']}>
                        <div className={styles['at-overlay-content']}>
                            <FontAwesomeIcon icon={solid('spinner')} size="2x" spin={true} />
                        </div>
                    </div>
                )}

                <div className={styles['at-content']}>
                    <div className={styles['at-sidebar']}>
                        <div className={styles['at-sidebar-content']}>
                            <div className={styles['at-track-list']}>
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

                    <div className={styles['at-viewport']} ref={this._viewPort}>
                        <div ref={this._alphaTab}></div>
                    </div>
                </div>

                <div className={styles['at-footer']}>
                    <PlayerControlsGroup ref={this._playerControls}
                        api={this.state.api}
                        onLayoutChange={this.onLayoutChange} />
                </div>
            </div>
        );
    }
}