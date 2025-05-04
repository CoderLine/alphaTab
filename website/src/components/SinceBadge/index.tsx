import React from "react";
import styles from "./styles.module.scss";
import { useDoc } from "@docusaurus/plugin-content-docs/lib/client/doc.js";

export type SinceBadgeProps = {
  since?: string;
  inline?: boolean;
};
export const SinceBadge: React.FC<SinceBadgeProps> = ({ since, inline }) => {
  const doc = useDoc();
  if (
    inline &&
    doc.frontMatter.sidebar_custom_props?.since &&
    doc.frontMatter.sidebar_custom_props?.since == since
  ) {
    return <></>;
  }

  if (since) {
    return (
      <span
        className={`badge badge--info ${styles.since} ${
          inline ? styles.sinceInline : ""
        }`}
      >
        since {since}
      </span>
    );
  } else {
    return <></>;
  }
};

// compatible with ReactDOMServer.renderToStaticMarkup needed in tooltip scenarios
// it doesn't auto-hide if the since badge has the same version as the page
export const TooltipSinceBadge: React.FC<SinceBadgeProps> = ({ since, inline }) => {
  if (since) {
    return (
      <span
        className={`badge badge--info ${styles.since} ${
          inline ? styles.sinceInline : ""
        }`}
      >
        since {since}
      </span>
    );
  } else {
    return <></>;
  }
};
