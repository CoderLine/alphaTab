import React from "react";
import CodeBadge from "./code-badge";
import ReactMarkdown from 'react-markdown'

function renderChild(child) {
  if (typeof child === "string") {
    return (
        <ReactMarkdown source={child} />
    )
  } else {
    return child;
  }
}

export function ParameterRow({ children, type, platform, name }) {
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
          ? children.map((c) => renderChild(c))
          : children}
      </td>
    </tr>
  );
}

export function ParameterTable({ children }) {
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
}

export default ParameterTable;
