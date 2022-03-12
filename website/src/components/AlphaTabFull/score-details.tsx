import * as alphaTab from '@coderline/alphatab';
import React from 'react';
import styles from './styles.module.scss';

export interface ScoreDetailsProps {
    score?: alphaTab.model.Score;
}

export interface ScoreDetailsState {
}

export class ScoreDetails extends React.Component<ScoreDetailsProps, ScoreDetailsState> {
    public constructor(props: ScoreDetailsProps) {
        super(props);
    }

    public render() {
        return (
            <div className={styles['at-song-details']}>
                <span className={styles['at-song-title']}>{this.props.score?.title}</span> -{" "}
                <span className={styles['at-song-artist']}>{this.props.score?.artist}</span>
            </div>
        );
    }
}
