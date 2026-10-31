import { buildNames } from "@site/src/names";
import { Page } from "@site/src/page";
import React from "react";
import { CodeBadge } from "../CodeBadge";
import { useDoc } from "@docusaurus/plugin-content-docs/lib/client/doc.js";
import styles from "./styles.module.scss";

export interface PropertyDescriptionProps {
  showJson: boolean;
}

export const PropertyDescription: React.FC<PropertyDescriptionProps> = ({
  showJson,
}) => {
  const doc = useDoc();
  const page = new Page(doc.metadata, doc.metadata);
  const { jsNames, csNames, androidNames } = buildNames(page);
  const jsonNames = showJson ? jsNames : [];
  return (
    <div className={styles.wrapper}>
      {jsNames.map((n) => (
        <CodeBadge key={`js-${n}`} type="js" name={n} />
      ))}
      {jsonNames.map((n) => (
        <CodeBadge key={`json-${n}`} type="json" name={n} />
      ))}
      {csNames.map((n) => (
        <CodeBadge key={`net-${n}`} type="net" name={n} />
      ))}
      {androidNames.map((n) => (
        <CodeBadge key={`android-${n}`} type="android" name={n} />
      ))}
    </div>
  );
};
