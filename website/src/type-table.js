import React from 'react';

export function TypeRow({
    children,
    type,
    name
}) {
    if (children && type && name) {
        return (
            <tr>
                <td><CodeBadge type={type} name={name} /></td>
                <td>
                    {children}
                </td>
            </tr>
        );
    }
    else if (type && name) {
        return (
            <tr>
                <td><CodeBadge type={type} name={name} /></td>
            </tr>
        );
    }
    else if (name) {
        return (
            <tr>
                <td><code>{type}</code></td>
            </tr>
        )
    }
}

export default function TypeTable({ children }) {
    return (
        <table class="table table-striped table-condensed type-table">
            <tbody>
                {children}
            </tbody>
        </table>
    )
} 