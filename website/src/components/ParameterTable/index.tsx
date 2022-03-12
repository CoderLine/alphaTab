import React from "react";
import ReactMarkdown from 'react-markdown'
import {CodeBadge, Platform } from "../CodeBadge";

function renderChild(child: string | JSX.Element): JSX.Element {
    if (typeof child === "string") {
        return (
            <ReactMarkdown children={child} />
        )
    } else {
        return child;
    }
}

export class ParameterRow extends React.Component<{
    children: React.ReactNode,
    platform: Platform,
    type: string,
    name: string
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
