import { faRotate } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import styles from './styles.module.scss';

export interface PlayerProgressIndicatorProps {
    percentage: number;
}

export interface PlayerProgressIndicatorState {
}

export class PlayerProgressIndicator extends React.Component<PlayerProgressIndicatorProps, PlayerProgressIndicatorState> {
    private _radius = 16;
    private _stroke = 2;
    private _normalizedRadius = this._radius - this._stroke * 2;
    private _circumference = this._normalizedRadius * 2 * Math.PI;

    public constructor(props: PlayerProgressIndicatorProps) {
        super(props);
    }

    public render() {
        const v = this.props.percentage * 100;
        return (
            this.props.percentage < 0.99 && (
                <div className={styles.progress}>
                    <svg width={this._radius * 2}
                        height={this._radius * 2}>
                        <circle
                            stroke="white"
                            strokeDasharray={`${this._circumference} ${this._circumference}`}
                            style={ {
                                strokeDashoffset: this._circumference - (v / 100 * this._circumference),
                                transformOrigin: `50% 50%`,
                                transform: 'rotate(-90deg)'
                            } }
                            stroke-width={this._stroke}                            
                            fill="transparent"
                            r={this._normalizedRadius}
                            cx={this._radius}
                            cy={this._radius} />
                    </svg>

                    <div className={`${styles['progress-value']}`}>
                        <span className={styles['progress-value-number']}>
                            {v | 0}
                        </span>
                        <sup className="small">%</sup>
                    </div>
                </div>
            )
        );
    }
}
