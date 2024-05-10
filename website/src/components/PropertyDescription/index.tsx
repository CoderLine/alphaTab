import { buildNames } from "@site/src/names";
import { Page } from "@site/src/page";
import React from 'react';
import { CodeBadge } from "../CodeBadge";
import {
    PropVersionDoc,
} from "@docusaurus/plugin-content-docs";

export interface PropertyDescriptionProps {
    metadata: any;
    showJson: boolean;
    doc: PropVersionDoc
}

export class PropertyDescription extends React.Component<PropertyDescriptionProps>
{
    public render() {
        const page = new Page(this.props.metadata, this.props.doc);
        const { jsNames, csNames, jQueryNames, domNames, androidNames } = buildNames(page);
        const jsonNames = this.props.showJson ? jsNames : [];
        return (
            <table className="table table-striped table-condensed type-table">
                <tbody>
                    {jsNames.map(n => (
                        <tr>
                            <td><CodeBadge type="js" name={n} /></td>
                        </tr>
                    ))}
                    {jsonNames.map(n => (
                        <tr>
                            <td><CodeBadge type="json" name={n} /></td>
                        </tr>
                    ))}
                    {jQueryNames.map(n => (
                        <tr>
                            <td><CodeBadge type="jquery" name={n} /></td>
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
                    {androidNames.map(n => (
                        <tr>
                            <td><CodeBadge type="android" name={n} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
}