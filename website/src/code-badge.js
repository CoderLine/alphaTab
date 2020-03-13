import React from 'react';

export function CodeBadge({ type, name }) {
    if(!name) {
        return (<></>);
    }
    let title = type;
    switch (type) {
        case 'net':
            title = '.net';
            break;
        case 'js':
            title = 'JavaScript';
            break;
        case 'json':
            title = 'JSON';
            break;
        case 'html':
            title = 'HTML';
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