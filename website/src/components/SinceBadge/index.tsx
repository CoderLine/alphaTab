import React from 'react';
import styles from './styles.module.scss';

export class SinceBadge extends React.Component<{since: string}> {
    public render() {
        return (
            <span className={`badge badge--info ${styles.since}`}>since {this.props.since}</span>
        )
    }
}