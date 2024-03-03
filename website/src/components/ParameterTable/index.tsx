import React from "react";
import {CodeBadge, Platform } from "../CodeBadge";
import { SinceBadge } from "../SinceBadge";
import {MDXProvider} from '@mdx-js/react'

function renderChild(child: string | JSX.Element): JSX.Element {
    if (typeof child === "string") {
        return (
            <MDXProvider children={child} />
        )
    } else {
        return child;
    }
}

export class ParameterRow extends React.Component<{
    children: React.ReactNode,
    platform: Platform,
    type: string,
    name: string,
    since: string
}> {
    public render() {
        return (
            <tr>
                <td>
                    <CodeBadge type={this.props.platform} name={this.props.name} />
                </td>
                <td>
                    <code>{this.props.type}</code>
                </td>
                <td>
                    {Array.isArray(this.props.children)
                        ? this.props.children.map((c) => renderChild(c))
                        : renderChild(this.props.children as any)}
                    <SinceBadge since={this.props.since} inline={true} />
                </td>
            </tr>
        );
    }
}

export class ParameterTable extends React.Component<{ children: React.ReactNode }> {
    public render() {
        return (
            <table className="table table-striped table-condensed type-table">
                <thead>
                    <tr>
                        <th>Parameters</th>
                        <th>Type</th>
                        <th>Summary</th>
                    </tr>
                </thead>
                <tbody>{this.props.children}</tbody>
            </table>
        );
    }
}
