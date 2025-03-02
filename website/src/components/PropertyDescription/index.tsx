import { buildNames } from "@site/src/names";
import { Page } from "@site/src/page";
import React from "react";
import { CodeBadge } from "../CodeBadge";
import { PropVersionDoc } from "@docusaurus/plugin-content-docs";
import { useDoc } from "@docusaurus/plugin-content-docs/lib/client/doc.js";

export interface PropertyDescriptionProps {
  metadata: any;
  showJson: boolean;
  doc: PropVersionDoc;
}

export const PropertyDescription: React.FC<PropertyDescriptionProps> = ({
  showJson,
}) => {
  const doc = useDoc();
  const page = new Page(doc.metadata, doc.metadata);
  const { jsNames, csNames, jQueryNames, domNames, androidNames } =
    buildNames(page);
  const jsonNames = showJson ? jsNames : [];
  return (
    <table className="table table-striped table-condensed type-table">
      <tbody>
        {jsNames.map((n) => (
          <tr key={`js-${n}`}>
            <td>
              <CodeBadge type="js" name={n} />
            </td>
          </tr>
        ))}
        {jsonNames.map((n) => (
          <tr key={`json-${n}`}>
            <td>
              <CodeBadge type="json" name={n} />
            </td>
          </tr>
        ))}
        {jQueryNames.map((n) => (
          <tr key={`jq-${n}`}>
            <td>
              <CodeBadge type="jquery" name={n} />
            </td>
          </tr>
        ))}
        {domNames.map((n) => (
          <tr key={`html-${n}`}>
            <td>
              <CodeBadge type="html" name={n} />
            </td>
          </tr>
        ))}
        {csNames.map((n) => (
          <tr key={`net-${n}`}>
            <td>
              <CodeBadge type="net" name={n} />
            </td>
          </tr>
        ))}
        {androidNames.map((n) => (
          <tr key={`android-${n}`}>
            <td>
              <CodeBadge type="android" name={n} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
