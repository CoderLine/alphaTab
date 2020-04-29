import React from 'react';

export function CodeBadge({ type, name }) {
    if (!name) {
        return (<></>);
    }
    let title = type;
    switch (type) {
        case 'all':
            title = 'All';
            break;
        case 'net':
            title = '.net';
            break;
        case 'net-wf':
            title = '.net WinForms';
            type = "net";
            break;
        case 'net-wpf':
            title = '.net WPF';
            type = "net";
            break;
        case 'js-html':
            type = 'js';
            title = 'JavaScript & HTML';
            break;
        case 'json-js-html':
            type = 'js';
            title = 'JSON, JavaScript & HTML';
            break;
        case 'js':
            title = 'JavaScript';
            break;
        case 'js-jquery':
            type = 'js';
            title = 'JavaScript & jQuery';
            break;
        case 'json':
            title = 'JSON';
            break;
        case 'json-html':
            type = 'json';
            title = 'JSON & HTML';
            break;
        case 'html':
            title = 'HTML';
            break;
        case 'jquery':
            type = "jq";
            title = 'jQuery';
            break;
    }
    const css = "code-badge code-badge-" + type;
    return (
        <code className={css}>
            {name}
            <span>{title}</span>
        </code>
    );
}

export default CodeBadge;