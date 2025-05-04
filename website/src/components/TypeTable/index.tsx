import React from "react";
import { CodeBadge, Platform } from "../CodeBadge";
import styles from "./styles.module.scss";
import { MarkdownString } from "../MarkdownString";

function renderChild(child) {
  if (typeof child === "string") {
    return <MarkdownString content={child} />;
  } else {
    return child;
  }
}

export type TypeRowProps = {
  children: React.ReactNode;
  type: Platform;
  name: string;
  link?: string;
};

export const TypeRow: React.FC<TypeRowProps> = ({
  children,
  type,
  name,
  link,
}) => {
  if (children && type && name) {
    return (
      <tr>
        <td>
          {link ? (
            <a href={link}>
              <CodeBadge type={type} name={name} />
            </a>
          ) : (
            <CodeBadge type={type} name={name} />
          )}
        </td>
        <td>
          {Array.isArray(children)
            ? React.Children.map(children, renderChild)
            : children}
        </td>
      </tr>
    );
  } else if (type && name) {
    return (
      <tr>
        <td>
          <CodeBadge type={type} name={name} />
        </td>
      </tr>
    );
  } else if (name) {
    return (
      <tr>
        <td>
          <CodeBadge type="all" name={name} />
        </td>
      </tr>
    );
  }
};

export type TypeTableProps = {
  children: React.ReactNode;
};

export const TypeTable: React.FC<TypeTableProps> = ({ children }) => {
  var hasAnyRowValues = false;
  if (Array.isArray(children)) {
    for (let row of children) {
      if ("props" in row && row.props.children) {
        hasAnyRowValues = true;
        break;
      }
    }
  } else if ("props" in (children as any) && (children as any).props.children) {
    hasAnyRowValues = true;
  }

  if (hasAnyRowValues) {
    return (
      <table
        className={`table table-striped table-condensed ${styles["type-table"]}`}
      >
        <thead>
          <tr>
            <th>Type</th>
            <th>Values</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    );
  } else {
    return (
      <table
        className={`table table-striped table-condensed ${styles["type-table"]}`}
      >
        <tbody>{children}</tbody>
      </table>
    );
  }
};
