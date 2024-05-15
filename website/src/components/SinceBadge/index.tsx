import React from 'react';
import styles from './styles.module.scss';

export class SinceBadge extends React.Component<{ since: string, inline?: boolean }> {
    public render() {
        if (this.props.since) {
            return (
                <span className={`badge badge--info ${styles.since} ${this.props.inline ? styles.sinceInline : ''}`}>since {this.props.since}</span>
            )
        } else {
            return (<></>);
        }
    }
}