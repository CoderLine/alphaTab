import * as alphaTab from '@coderline/alphatab'
import React from 'react';

export interface ScoreDetailsProps {
    file: string
}

export interface ScoreDetailsState {
    error: any
    score: alphaTab.model.Score
}

export class ScoreDetails extends React.Component<ScoreDetailsProps, ScoreDetailsState> {
    constructor(props) {
        super(props);
        this.state = {
            score: null,
            error: null
        };
    }
    componentDidMount() {
        alphaTab.importer.ScoreLoader.loadScoreAsync(this.props.file, score => {
            this.setState({ score });
        },
            error => {
                this.setState({ error });
            });
    }
    render() {
        if (this.state.error) {
            return this.state.error;
        } else if (this.state.score) {
            return (
                <>
                    <p><strong>Title:</strong> {this.state.score.title}</p>
                    <p><strong>Subtitle:</strong> {this.state.score.subTitle}</p>
                    <p><strong>Album:</strong> {this.state.score.album}</p>
                    <p><strong>Tempo:</strong> {this.state.score.tempo}</p>
                    <p><strong>Bars:</strong> {this.state.score.masterBars.length}</p>
                    <p><strong>Tracks:</strong> {this.state.score.tracks.length}</p>
                    <ul>
                        {this.state.score.tracks.map(t => <li>{t.name}</li>)}
                    </ul>
                </>);
        }
        else {
            return "Loading...";
        }
    }
}
