import React, { type ReactNode } from "react";
import clsx from "clsx";
import type { Props } from "@theme/CodeBlock/Line";

import styles from "./styles.module.css";
import { CodeBlockMeta } from "../utils";
import Link from "@docusaurus/Link";

export type ExtendedCodeLineProps = Props & {
  meta: CodeBlockMeta;
};


export default function CodeBlockLine({
  line,
  classNames,
  showLineNumbers,
  getLineProps,
  getTokenProps,
  meta,
}: ExtendedCodeLineProps): ReactNode {
  if (line.length === 1 && line[0]!.content === "\n") {
    line[0]!.content = "";
  }

  const lineProps = getLineProps({
    line,
    className: clsx(classNames, showLineNumbers && styles.codeLine),
  });

  const lineTokens = line.map((token, key) => {
    const trimmed = token.content.trim();
    const makeLink = token.types.some((t) => t === "plain" || t === "function");
    if (makeLink) {
      const link = meta.options[`link${trimmed}`.toLowerCase()];
      if (typeof link === "string") {
        const index = token.content.indexOf(trimmed);
        let before = token.content.substring(0, index);
        let after = token.content.substring(index + trimmed.length);
        return (
          <>
            {before && (
              <span
                key={key + "-before"}
                {...getTokenProps({ token: { ...token, content: before } })}
              />
            )}
            <Link key={key} to={link}
              {...getTokenProps({ token: { ...token, content: trimmed } })}
            />
            {after && (
              <span
                key={key + "-after"}
                {...getTokenProps({ token: { ...token, content: after } })}
              />
            )}
          </>
        );
      }
    }

    return <span key={key} {...getTokenProps({ token })} />;
  });

  return (
    <span {...lineProps}>
      {showLineNumbers ? (
        <>
          <span className={styles.codeLineNumber} />
          <span className={styles.codeLineContent}>{lineTokens}</span>
        </>
      ) : (
        lineTokens
      )}
      <br />
    </span>
  );
}
