import React from "react";
import ReactMarkdown from "react-markdown";
import { CodeBadge, Platform } from "../CodeBadge";
import styles from './styles.module.scss';

function renderChild(child) {
    if (typeof child === "string") {
        return <ReactMarkdown children={child} />;
    } else {
        return child;
    }
}

export class TypeRow extends React.Component<{ children: React.ReactNode, type: Platform, name: string }> {
    public render() {
        if (this.props.children && this.props.type && this.props.name) {
            return (
                <tr>
                    <td>
                        <CodeBadge type={this.props.type} name={this.props.name} />
                    </td>
                    <td>
                        {Array.isArray(this.props.children)
                            ? this.props.children.map((c) => renderChild(c))
                            : this.props.children}
                    </td>
                </tr>
            );
        } else if (this.props.type && this.props.name) {
            return (
                <tr>
                    <td>
                        <CodeBadge type={this.props.type} name={this.props.name} />
                    </td>
                </tr>
            );
        } else if (this.props.name) {
            return (
                <tr>
                    <td>
                        <CodeBadge type="all" name={this.props.name} />
                    </td>
                </tr>
            );
        }
    }
}

export class TypeTable extends React.Component<{ children: React.ReactNode }> {
    public render() {
        var hasAnyRowValues = false;
        if (Array.isArray(this.props.children)) {
            for (let row of this.props.children) {
                if ("props" in row && row.props.children) {
                    hasAnyRowValues = true;
                    break;
                }
            }
        } else if ("props" in (this.props.children as any) && (this.props.children as any).props.children) {
            hasAnyRowValues = true;
        }

        if (hasAnyRowValues) {
            return (
                <table className={`table table-striped table-condensed ${styles['type-table']}`}>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Values</th>
                        </tr>
                    </thead>
                    <tbody>{this.props.children}</tbody>
                </table>
            );
        } else {
            return (
                <table className={`table table-striped table-condensed ${styles['type-table']}`}>
                    <tbody>{this.props.children}</tbody>
                </table>
            );
        }
    }
}
