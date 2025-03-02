import { buildNames } from "@site/src/names";
import { Page } from "@site/src/page";
import React from "react";
import { CodeBadge } from "../CodeBadge";
import { useDoc } from "@docusaurus/plugin-content-docs/lib/client/doc.js";

export interface EventDescriptionProps {}

export const EventDescription: React.FC<EventDescriptionProps> = () => {
  const doc = useDoc();
  const page = new Page(doc.metadata, doc.metadata);
  const { jsNames, csNames, jQueryNames, domNames, androidNames } =
    buildNames(page);

  return (
    <table className="table table-striped table-condensed type-table">
      <tbody>
        {jsNames.map((name, index) => (
          <tr key={index}>
            <td>
              <CodeBadge type="js" name={name} />
            </td>
          </tr>
        ))}
        {jQueryNames.map((name, index) => (
          <tr key={index}>
            <td>
              <CodeBadge type="jquery" name={name} />
            </td>
          </tr>
        ))}
        {domNames.map((name, index) => (
          <tr key={index}>
            <td>
              <CodeBadge type="html" name={name} />
            </td>
          </tr>
        ))}
        {csNames.map((name, index) => (
          <tr key={index}>
            <td>
              <CodeBadge type="net" name={name} />
            </td>
          </tr>
        ))}
        {androidNames.map((name, index) => (
          <tr key={index}>
            <td>
              <CodeBadge type="android" name={name} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
