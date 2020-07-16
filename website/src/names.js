function toPascalCase(v) {
    if (typeof v === 'string') {
        var parts = v.split('.');
        for (let i = 0; i < parts.length; i++) {
            parts[i] = parts[i].substr(0, 1).toUpperCase() + parts[i].substr(1);
        }
        return parts.join('.');
    }
    return v.map(toPascalCase);
}

function toDomNames(jsNames, wildCard) {
    return jsNames.map(v => {
        const parts = v.split('.');
        if (wildCard) {
            parts.push('*');
        }

        let domName = 'data';
        for (const part of parts) {
            domName += `-${part.toLowerCase()}`;
        }

        return domName;
    });
}
export function buildNames(property) {
    const javaScriptOnly = property.prop('javaScriptOnly', false);

    let jsNames = property.props('title');

    let csNames = property.props('csName');
    if (!javaScriptOnly && csNames.length === 0) {
        csNames = toPascalCase(jsNames);
    }

    if (property.prop('jsOnParent', false)) {
        jsNames.push(jsNames[0].split('.')[1]);
    }
    
    let jQueryNames = property.props('jQueryName');
    if (property.prop('jQuery', false) && jQueryNames.length === 0) {
        jQueryNames = jsNames;
    }

    let domNames = property.props('domName');
    if (domNames.length === 0) {
        domNames = toDomNames(jsNames);
    }

    return {
        jsNames,
        csNames,
        jQueryNames,
        domNames
    };
}