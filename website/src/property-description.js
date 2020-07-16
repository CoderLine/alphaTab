import React from 'react';
import { Page } from './page'
import CodeBadge from './code-badge'
import { buildNames } from './names';

export default function PropertyDescription({ metadata }) {
    const page = new Page(metadata);
    const { jsNames, csNames, jQueryNames, domNames } = buildNames(page);
    return (
        <table className="table table-striped table-condensed type-table">
            <tbody>
                {jsNames.map(n => (
                    <tr>
                        <td><CodeBadge type="js" name={n} /></td>
                    </tr>
                ))}
                {jsNames.map(n => (
                    <tr>
                        <td><CodeBadge type="json" name={n} /></td>
                    </tr>
                ))}
                {domNames.map(n => (
                    <tr>
                        <td><CodeBadge type="html" name={n} /></td>
                    </tr>
                ))}
                {csNames.map(n => (
                    <tr>
                        <td><CodeBadge type="net" name={n} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}