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

function toDomSettingNames(jsNames, wildCard) {
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

function toDomEventNames(jsNames) {
    return jsNames.map(v => {
        return `alphaTab.${v}`;
    });
}

function tojQueryEventNames(jsNames) {
    return jsNames.map(v => {
        return `alphaTab.${v}`;
    });
}

function tojQueryMethodNames(jsNames) {
    return jsNames.map(v => {
        return `alphaTab('${v}')`;
    });
}

function tojQueryPropertyNames(jsNames) {
    return jsNames.map(v => {
        return `alphaTab('${v}')`;
    });
}

export function buildNames(property) {
    const javaScriptOnly = property.prop('javaScriptOnly', false);
    const domWildcard = property.prop('domWildcard', false);
    const category = property.prop('category', '');

    let jsNames = property.props('title');

    let csNames = property.props('csName');
    if (!javaScriptOnly && csNames.length === 0) {
        csNames = toPascalCase(jsNames);
    }

    if (property.prop('jsOnParent', false)) {
        jsNames.push(jsNames[0].split('.')[1]);
    }
    
    let jQueryNames = property.props('jQueryName');
    if (jQueryNames.length === 0) {
        if(category.startsWith('Events')) {
            jQueryNames = tojQueryEventNames(jsNames);
        } else if(category.startsWith('Methods')) {
            jQueryNames = tojQueryMethodNames(jsNames);
        } else if(category.startsWith('Properties')) {
            jQueryNames = tojQueryPropertyNames(jsNames);
        } else if(property.prop('jQuery', false)) {
            jQueryNames = jsNames;
        }   
    }

    let domNames = property.props('domName');
    if (domNames.length === 0) {
        if(category.startsWith('Events')) {
            domNames = toDomEventNames(jsNames);
        } else if(category.startsWith('Methods')) {
            // no DOM method names on API
        } else if(category.startsWith('Properties')) {
            // no DOM properties on API
        } else {
            domNames = toDomSettingNames(jsNames, domWildcard);
        }        
    }

    if(category.startsWith('Methods')) {
        jsNames = jsNames.map(v=> `${v}()`);
        csNames = csNames.map(v=> `${v}()`);
    }

    return {
        jsNames,
        csNames,
        jQueryNames,
        domNames
    };
}