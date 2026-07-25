import React, { useEffect, useRef, useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabControls,
} from "@site/src/alphatab-react";
import styles from "./styles.module.scss";

export interface AlphaTexLivePreviewProps {
  showCode?: boolean;
}

const INITIAL_TEX = `\\title "Live alphaTex preview"
\\tempo 120
.
:8 3.3 5.3 7.3 8.3 | 10.3 8.3 7.3 5.3 |
:4 3.3.4 5.3.4 :8 7.3 8.3 10.3 8.3 |`;

interface InnerProps {
  text: string;
  setText: (value: string) => void;
}

const Inner: React.FC<InnerProps> = ({ text, setText }) => {
  const controls = useAlphaTabControls();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onChange = (value: string) => {
    setText(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      if (controls) {
        try {
          controls.loadScoreFromTex(value);
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

  return (
    <>
      <textarea
        className={styles.editor}
        value={text}
        rows={8}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
      />
      <AlphaTabCanvas />
    </>
  );
};

export const AlphaTexLivePreview: React.FC<AlphaTexLivePreviewProps> = ({
  showCode = true,
}) => {
  const [text, setText] = useState(INITIAL_TEX);

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
      <AlphaTabPlayer tex={INITIAL_TEX} player={true}>
        <Inner text={text} setText={setText} />
      </AlphaTabPlayer>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
