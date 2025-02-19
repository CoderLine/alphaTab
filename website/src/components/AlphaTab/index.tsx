import * as alphaTab from '@coderline/alphatab';
import environment from '@site/src/environment';
import React from 'react';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

export interface AlphaTabProps {
    settings?: any;
    file?: string;
    tracks?: number[] | string;
    tex: boolean;
    children: string | React.ReactElement;
    player?: boolean;
}

export interface AlphaTabState {
    isPlaying: boolean;
    api?: alphaTab.AlphaTabApi,
}

export class AlphaTab extends React.Component<AlphaTabProps, AlphaTabState> {
    private _element: React.RefObject<HTMLDivElement> = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            isPlaying: false
        };
    }

    componentDidMount() {
        const container = this._element.current;
        const settings = new alphaTab.Settings();
        settings.core.fontDirectory = environment.fontDirectory;
        if (this.props.file) {
            settings.core.file = this.props.file;
        }
        if (this.props.tex) {
            settings.core.tex = true;
        }
        if (this.props.tracks) {
            settings.fillFromJson({
                core: {
                    tracks: this.props.tracks
                }
            });
        }
        if (this.props.player) {
            settings.player.enablePlayer = true;
            settings.player.scrollOffsetY = -50;
            settings.player.soundFont = environment.soundFontDirectory + 'sonivox.sf2';
            settings.player.scrollMode = alphaTab.ScrollMode.Off;
        }
        if (this.props.settings) {
            settings.fillFromJson(this.props.settings)
        }

        const api =  new alphaTab.AlphaTabApi(container, settings);
        api.playerStateChanged.on((args) => {
            this.setState({
                isPlaying: args.state == alphaTab.synth.PlayerState.Playing,
            });
        });

        this.setState({
            api: api
        });

   
    }

    componentWillUnmount() {
        this.state.api?.destroy();
    }

    public playPause(e: Event) {
        e.preventDefault();
        this.state.api?.playPause();
    }

    render() {
        return (
            <div className={styles.wrapper}>
                {this.props.player && (
                    <button className='button button--primary'
                        onClick={this.playPause.bind(this)}>
                        <FontAwesomeIcon icon={this.state.isPlaying ? solid("pause") : solid("play")} />
                    </button>
                )}
                <div ref={this._element}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}