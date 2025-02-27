import React from "react";
import { CodeBadge, Platform } from "../CodeBadge";
import { SinceBadge } from "../SinceBadge";
import { MDXProvider } from "@mdx-js/react";

function renderChild(child: React.ReactNode): React.ReactNode {
  if (typeof child === "string") {
    return <MDXProvider children={child} />;
  } else {
    return child;
  }
}

export type ParameterRowProps = {
  children: React.ReactNode;
  platform: Platform;
  type: string;
  name: string;
  since?: string;
};

export const ParameterRow: React.FC<ParameterRowProps> = ({
  children,
  platform,
  type,
  name,
  since,
}) => {
  return (
    <tr>
      <td>
        <CodeBadge type={platform} name={name} />
      </td>
      <td>
        <code>{type}</code>
      </td>
      <td>
        {Array.isArray(children)
          ? React.Children.map(children, renderChild)
          : renderChild(children as any)}
        {since && <SinceBadge since={since} inline={true} />}
      </td>
    </tr>
  );
};

export type ParameterTableProps = {
  children: React.ReactNode;
};

export const ParameterTable: React.FC<ParameterTableProps> = ({ children }) => {
  return (
    <table className="table table-striped table-condensed type-table">
      <thead>
        <tr>
          <th>Parameters</th>
          <th>Type</th>
          <th>Summary</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};
