import React from 'react';
import {Page} from './page'
import CodeBadge from './code-badge'
import { buildNames } from './names';

export default function EventDescription({metadata}) {
    const page = new Page(metadata);
    const { jsNames, csNames, jQueryNames, domNames } = buildNames(page);
    return (
        <table className="table table-striped table-condensed type-table">
            <tbody>
                {jsNames.map((name, index) => (
                    <tr key={index}>
                        <td><CodeBadge type="js" name={name} /></td>
                    </tr>
                ))}                
                {jQueryNames.map((name, index) => (
                    <tr key={index}>
                        <td><CodeBadge type="jquery" name={name} /></td>
                    </tr>
                ))}            
                {domNames.map((name, index) => (
                    <tr key={index}>
                        <td><CodeBadge type="html" name={name} /></td>
                    </tr>
                ))}
                {csNames.map((name, index) => (
                    <tr key={index}>
                        <td><CodeBadge type="net" name={name} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}