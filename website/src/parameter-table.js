import React from "react";
import CodeBadge from "./code-badge";
import MarkDownIt from "markdown-it";

function markdownChildren(children) {
    const md = new MarkDownIt({ breaks: true });
    let s = '';
    if (Array.isArray(children)) {
        children.forEach(child => {
            if (typeof child === 'string') {
                s += md.render(child);
            }
            else if ('render' in child) {
                s += child.render();
            }
            else {
                console.warn('unknown child', child);
            }
        });
    } else {
        s = md.render(children);
    }

    return s;
}

export function ParameterRow({ children, type, platform, name }) {
    children = {
        __html: markdownChildren(children)
    };
    return (
        <tr>
            <td>
                <CodeBadge type={platform} name={name} />
            </td>
            <td>
                <code>{type}</code>                
            </td>
            <td dangerouslySetInnerHTML={children}></td>
        </tr>
    );
}

export function ParameterTable({ children }) {
    return (
        <table class="table table-striped table-condensed type-table">
            <thead>
                <tr>
                    <th>Parameters</th>
                    <th>Type</th>
                    <th>Summary</th>
                </tr>
            </thead>
            <tbody> 
                {children}
            </tbody>
        </table>
    );
}

export default ParameterTable;
