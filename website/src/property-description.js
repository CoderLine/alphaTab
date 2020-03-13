import React from 'react';
import Page from './page'
import CodeBadge from './code-badge'

export default function PropertyDescription({metadata}) {
    const page = new Page(metadata);
    console.log('page is ', page);
    const dotNetName = page.prop("title");
    const jsNames = page.props("jsName");
    const jsonNames = page.props("jsonName");
    const dataAttributeNames = page.props("dataAttribute");
    return (
        <table class="table table-striped table-condensed type-table">
            <tbody>
                <tr>
                    <td><CodeBadge type="net" name={dotNetName} /></td>
                </tr>
                {jsNames.map(name => (
                    <tr>
                        <td><CodeBadge type="js" name={name} /></td>
                    </tr>
                ))}
                {jsonNames.map(name => (
                    <tr>
                        <td><CodeBadge type="json" name={name} /></td>
                    </tr>
                ))}
                {dataAttributeNames.map(name => (
                    <tr>
                        <td><CodeBadge type="html" name={name} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}