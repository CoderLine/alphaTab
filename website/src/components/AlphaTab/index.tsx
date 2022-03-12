import * as alphaTab from '@coderline/alphatab';
import environment from '@site/src/environment';
import React from 'react';

export interface AlphaTabProps {
    settings?: any;
    file?: string;
    tracks?: number[] | string;
    tex: boolean;
    children: string | React.ReactElement;
}

export class AlphaTab extends React.Component<AlphaTabProps> {
    private _api?: alphaTab.AlphaTabApi;
    private _element: React.RefObject<HTMLDivElement> = React.createRef();

    constructor(props) {
        super(props);
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
        if (this.props.settings) {
            settings.fillFromJson(this.props.settings)
        }

        this._api = new alphaTab.AlphaTabApi(container, settings);
    }

    componentWillUnmount() {
        this._api.destroy();
    }

    render() {
        return (
            <div ref={this._element}>
                {this.props.children}
            </div>
        );
    }
}