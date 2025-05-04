// MdxPreview
import React, { useEffect, useState } from "react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

export type MarkdownStringProps = { content: string };
export const MarkdownString: React.FC<MarkdownStringProps> = ({ content }: MarkdownStringProps) => {
  const exports = useMDX(content);
  const Content = exports.default;
  return <Content />;
};

function useMDX(content: string) {
  const [exports, setExports] = useState({ default: runtime.Fragment });

  useEffect(() => {
    evaluate(content, { ...(runtime as any) }).then((exports) =>
      setExports(exports as any)
    );
  }, [content]);

  return exports;
}
