function trimCode(code) {
    return code
        .trim()
        .split(/\r?\n/)
        .map(l => l.trimLeft())
        .join('\r\n');
}

function setupEditor(api, selector) {
    const element = document.querySelector(selector);
    element.innerHTML = trimCode(element.innerHTML);
    const editor = ace.edit(element, {
        mode: 'ace/mode/tex'
    });
    editor.session.on('change', () => {
        api.tex(editor.getSession().getDocument().getAllLines().join('\n'), 'all');
    });
}
