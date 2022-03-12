import React from 'react';
import styles from './styles.module.scss';

export type Platform =
    'all' |
    'net' |
    'net-wf' |
    'net-wpf' |
    'js-html' |
    'json-js-html' |
    'js' |
    'js-jquery' |
    'json' |
    'json-html' |
    'html' |
    'jquery';

export class CodeBadge extends React.Component<{ type?: Platform, name?: string }> {
    public render() {
        if (!this.props.name) {
            return (<></>);
        }
        let title: string = this.props.type;
        let typeStyle = styles[this.props.type];
        switch (this.props.type) {
            case 'all':
                title = 'All';
                break;
            case 'net':
                title = '.net';
                break;
            case 'net-wf':
                title = '.net WinForms';
                typeStyle = styles.net;
                break;
            case 'net-wpf':
                title = '.net WPF';
                typeStyle = styles.net;
                break;
            case 'js-html':
                typeStyle = styles.js;
                title = 'JavaScript & HTML';
                break;
            case 'json-js-html':
                typeStyle = styles.js;
                title = 'JSON, JavaScript & HTML';
                break;
            case 'js':
                title = 'JavaScript';
                break;
            case 'js-jquery':
                typeStyle = styles.js;
                title = 'JavaScript & jQuery';
                break;
            case 'json':
                title = 'JSON';
                break;
            case 'json-html':
                typeStyle = styles.json;
                title = 'JSON & HTML';
                break;
            case 'html':
                title = 'HTML';
                break;
            case 'jquery':
                typeStyle = styles.jq;
                title = 'jQuery';
                break;
        }
        const css = `${styles['code-badge']} ${typeStyle}`;
        return (
            <code className={css}>
                {this.props.name}
                <span>{title}</span>
            </code>
        );
    }
}