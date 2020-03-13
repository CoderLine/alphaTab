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

export function TypeRow({ children, type, name }) {
    if (children && type && name) {
        children = {
            __html: markdownChildren(children)
        };
        return (
            <tr>
                <td>
                    <CodeBadge type={type} name={name} />
                </td>
                <td dangerouslySetInnerHTML={children}></td>
            </tr>
        );
    } else if (type && name) {
        return (
            <tr>
                <td>
                    <CodeBadge type={type} name={name} />
                </td>
            </tr>
        );
    } else if (name) {
        return (
            <tr>
                <td>
                    <CodeBadge type="All" name={name} />
                </td>
            </tr>
        );
    }
}

export function TypeTable({ children }) {
    var hasAnyRowValues = false;
    if(Array.isArray(children)) {
        for(let row of children) {
            if('props' in row && row.props.children) {
                hasAnyRowValues = true;
                break;
            }
        }
    }
    else if('props' in children && children.props.children) {
        hasAnyRowValues = true;
    }

    if(hasAnyRowValues) {
        return (
            <table className="table table-striped table-condensed type-table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Values</th>
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        );
    }
    else {
        return (
            <table className="table table-striped table-condensed type-table">
                <tbody>{children}</tbody>
            </table>
        ); 
    };
}

export default TypeTable;
