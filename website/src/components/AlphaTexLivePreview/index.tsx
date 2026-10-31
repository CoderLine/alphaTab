import React, { useEffect, useRef, useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import { AlphaTabHost, AlphaTabProvider } from "@coderline/alphatab-react";
import { useSiteAlphaTabSettings } from "@site/src/alphatab-settings";
import { DemoPlayButton } from "@site/src/components/DemoPlayButton";
import * as Riffs from "@site/src/tex-riffs";
import styles from "./styles.module.scss";

export interface AlphaTexLivePreviewProps {
  showCode?: boolean;
}

const INITIAL_TEX = Riffs.STEADY_PULSE;

export const AlphaTexLivePreview: React.FC<AlphaTexLivePreviewProps> = ({
  showCode = true,
}) => {
  const [text, setText] = useState(INITIAL_TEX);
  const [renderedTex, setRenderedTex] = useState(INITIAL_TEX);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const site = useSiteAlphaTabSettings({ player: true });

  const onChange = (value: string) => {
    setText(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => setRenderedTex(value), 200);
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
      <AlphaTabProvider
        tex={renderedTex}
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <textarea
          className={styles.editor}
          value={text}
          rows={8}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
        />
        <DemoPlayButton />
        <AlphaTabHost />
      </AlphaTabProvider>
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
