export function CodeBadge({ type, name }) {
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
    return (
        <code class="code-badge code-badge-{type}">
            {name}
            <span>{title}</span>
        </code>
    );
}

export default CodeBadge;