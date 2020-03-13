import React from 'react';
import {Page} from './page'
import CodeBadge from './code-badge'

export default function EventDescription({metadata}) {
    const page = new Page(metadata);
    const dotNetName = page.prop("title");
    const jsNames = page.props("jsName");
    const domNames = page.props("domName");
    return (
        <table className="table table-striped table-condensed type-table">
            <tbody>
                <tr>
                    <td><CodeBadge type="net" name={dotNetName} /></td>
                </tr>
                {jsNames.map((name, index) => (
                    <tr key={index}>
                        <td><CodeBadge type="js" name={name} /></td>
                    </tr>
                ))}
                {domNames.map((name, index) => (
                    <tr key={index}>
                        <td><CodeBadge type="html" name={name} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}