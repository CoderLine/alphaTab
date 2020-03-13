import React from 'react';
import {Page} from './page'
import CodeBadge from './code-badge'

export default function PropertyDescription({metadata}) {
    const page = new Page(metadata);
    const dotNetName = page.prop("title");
    const jsNames = page.props("jsName");
    const jsonNames = page.props("jsonName");
    const dataAttributeNames = page.props("dataAttribute");
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
                {jsonNames.map((name, index) => (
                    <tr key={index}>
                        <td><CodeBadge type="json" name={name} /></td>
                    </tr>
                ))}
                {dataAttributeNames.map((name, index) => (
                    <tr key={index}>
                        <td><CodeBadge type="html" name={name} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}