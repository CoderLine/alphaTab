import { buildNames } from '@site/src/names';
import { Page } from '@site/src/page';
import React from 'react';
import { CodeBadge } from '../CodeBadge';
import {
    PropVersionDoc,
} from "@docusaurus/plugin-content-docs";

export interface EventDescriptionProps {
    metadata: any;
    doc: PropVersionDoc
}

export class EventDescription extends React.Component<EventDescriptionProps> {
    public constructor(props: EventDescriptionProps) {
        super(props);
    }

    public render() {
        const page = new Page(this.props.metadata, this.props.doc);
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
}