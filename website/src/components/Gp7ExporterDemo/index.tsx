import * as alphaTab from "@coderline/alphatab";
import React, { useEffect, useState } from "react";
import { useAlphaTab } from "@site/src/hooks";
import CodeBlock from "@theme/CodeBlock";

export interface Gp7ExporterDemoProps {
  showCode?: boolean;
}

function formatBytes(n: number): string {
  return n.toLocaleString();
}

export const Gp7ExporterDemo: React.FC<Gp7ExporterDemoProps> = ({
  showCode = true,
}) => {
  const [api, element] = useAlphaTab((s) => {
    s.core.file = "/files/features/Chords.gp5";
    s.player.playerMode = alphaTab.PlayerMode.Disabled;
    s.player.scrollMode = alphaTab.ScrollMode.Off;
    s.player.enableCursor = false;
    s.player.enableUserInteraction = false;
  });

  const [status, setStatus] = useState<string>();
  const [blobUrl, setBlobUrl] = useState<string>();

  useEffect(() => {
    const currentUrl = blobUrl;
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [blobUrl]);

  function downloadGp() {
    if (!api || !api.score) {
      return;
    }
    try {
      const exporter = new alphaTab.exporter.Gp7Exporter();
      const data = exporter.export(api.score, api.settings);

      const fileName = api.score.title
        ? `${api.score.title}.gp`
        : "Untitled.gp";

      const blob = new Blob([data], { type: "application/octet-stream" });
      const href = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.download = fileName;
      a.href = href;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setBlobUrl(href);
      setStatus(`Wrote ${fileName} — ${formatBytes(data.length)} bytes`);
    } catch (e) {
      console.error("Error during export", e);
      alert("Something went wrong during export, check the browser logs for details");
    }
  }

  const code = `import * as alphaTab from '@coderline/alphatab';

const container = getAlphaTabContainer();
const api = new alphaTab.AlphaTabApi(container, {
  core: { file: '/scores/canon.gp' },
});

api.scoreLoaded.on(() => {
  const exporter = new alphaTab.exporter.Gp7Exporter();
  const data = exporter.export(api.score, api.settings);

  const fileName = api.score.title
    ? \`\${api.score.title}.gp\`
    : 'Untitled.gp';

  const a = document.createElement('a');
  a.download = fileName;
  a.href = URL.createObjectURL(new Blob([data], { type: 'application/octet-stream' }));
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
});`;

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "0.75rem",
        }}
      >
        <button
          className="button button--primary"
          onClick={downloadGp}
          type="button"
        >
          Download .gp
        </button>
        {status && (
          <span
            style={{
              fontVariantNumeric: "tabular-nums",
              color: "var(--ifm-color-emphasis-700)",
            }}
          >
            {status}
          </span>
        )}
      </div>
      <div ref={element} />
      {showCode ? <CodeBlock language="js">{code}</CodeBlock> : null}
    </div>
  );
};
