import React, { useEffect, useRef, useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import { useAlphaTab } from "@site/src/hooks";
import styles from "./styles.module.scss";

export interface AlphaTexLivePreviewProps {
  showCode?: boolean;
}

const INITIAL_TEX = `\\title "Live alphaTex preview"
\\tempo 120
.
:8 3.3 5.3 7.3 8.3 | 10.3 8.3 7.3 5.3 |
:4 3.3.4 5.3.4 :8 7.3 8.3 10.3 8.3 |`;

export const AlphaTexLivePreview: React.FC<AlphaTexLivePreviewProps> = ({
  showCode = true,
}) => {
  const [api, element] = useAlphaTab((s) => {
    s.core.tex = true;
  });
  const [text, setText] = useState(INITIAL_TEX);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadedRef = useRef(false);

  useEffect(() => {
    if (!api) {
      return;
    }
    if (!initialLoadedRef.current) {
      initialLoadedRef.current = true;
      api.tex(INITIAL_TEX);
    }
  }, [api]);

  const onChange = (value: string) => {
    setText(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      if (api) {
        try {
          api.tex(value);
        } catch {
          // parse errors surface through the api.error event
        }
      }
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const code = `const api = new alphaTab.AlphaTabApi(container, {});
api.tex(\`
  \\\\title "Live alphaTex preview"
  \\\\tempo 120
  .
  :8 3.3 5.3 7.3 8.3
\`);

document.getElementById('tex-input').addEventListener('input', (e) => {
  api.tex(e.target.value);
});`;

  return (
    <div className={styles.demo}>
      <textarea
        className={styles.editor}
        value={text}
        rows={8}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
      />
      <div ref={element}></div>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
