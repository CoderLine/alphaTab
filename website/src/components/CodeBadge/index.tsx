import React from "react";
import styles from "./styles.module.scss";
import Link from "@docusaurus/Link";

export type Platform =
  | "all"
  | "net"
  | "net-wf"
  | "net-wpf"
  | "js-html"
  | "json-js-html"
  | "js"
  | "js-jquery"
  | "json"
  | "json-html"
  | "html"
  | "jquery"
  | "android";

export type CodeBadgeProps = {
  type?: Platform;
  name?: string;
  link?: string;
};

export const CodeBadge: React.FC<CodeBadgeProps> = ({ type, name, link }) => {
  if (!name) {
    return <></>;
  }

  type ??= "all";

  let title: string = type;
  let typeStyle = styles[type];
  switch (type) {
    case "all":
      title = "All";
      break;
    case "net":
      title = ".net";
      break;
    case "android":
      title = "Android";
      break;
    case "net-wf":
      title = ".net WinForms";
      typeStyle = styles.net;
      break;
    case "net-wpf":
      title = ".net WPF";
      typeStyle = styles.net;
      break;
    case "js-html":
      typeStyle = styles.js;
      title = "JavaScript & HTML";
      break;
    case "json-js-html":
      typeStyle = styles.js;
      title = "JSON, JavaScript & HTML";
      break;
    case "js":
      title = "JavaScript";
      break;
    case "js-jquery":
      typeStyle = styles.js;
      title = "JavaScript & jQuery";
      break;
    case "json":
      title = "JSON";
      break;
    case "json-html":
      typeStyle = styles.json;
      title = "JSON & HTML";
      break;
    case "html":
      title = "HTML";
      break;
    case "jquery":
      typeStyle = styles.jq;
      title = "jQuery";
      break;
  }
  const css = `${styles["code-badge"]} ${typeStyle}`;

  if (link) {
    return (
      <Link to={link}>
        <code className={css}>
          {name}
          <span>{title}</span>
        </code>
      </Link>
    );
  } else {
    return (
      <code className={css}>
        {name}
        <span>{title}</span>
      </code>
    );
  }
};
