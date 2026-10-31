import React, { useState } from "react";
import { PlayerProvider, PlayerHost } from '@coderline/alphatab-ui';
import { useAlphaTabApi } from '@coderline/alphatab-react';
import { useAlphaTabModule } from '@site/src/alphatab-react';
import CodeBlock from "@theme/CodeBlock";

export interface Gp7ExporterDemoProps {
  showCode?: boolean;
}

function formatBytes(n: number): string {
  return n.toLocaleString();
}

const codeSample = `import * as alphaTab from '@coderline/alphatab';

const container = getAlphaTabContainer();
const api = new alphaTab.AlphaTabApi(container, {
  core: { file: '/scores/song.gp' },
});

api.scoreLoaded.on(() => {
  const exporter = new alphaTab.exporter.Gp7Exporter();
  const data = exporter.export(api.score, api.settings);

  const fileName = (api.score.title || 'Untitled') + '.gp';
  const url = URL.createObjectURL(
    new Blob([data], { type: 'application/octet-stream' })
  );

  const a = document.createElement('a');
  a.download = fileName;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});`;

const Gp7ExporterControls: React.FC = () => {
  const api = useAlphaTabApi();
  const module = useAlphaTabModule();
  const [status, setStatus] = useState<string>();

  function downloadGp() {
    if (!api || !api.score || !module) {
      return;
    }
    try {
      const exporter = new module.exporter.Gp7Exporter();
      const data = exporter.export(api.score, api.settings);

      const fileName = (api.score.title || "Untitled") + ".gp";

      const blob = new Blob([data as Uint8Array<ArrayBuffer>], { type: "application/octet-stream" });
      const href = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.download = fileName;
      a.href = href;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Once the browser has kicked off the download, the blob URL is no
      // longer needed — release it right away rather than holding onto it.
      URL.revokeObjectURL(href);

      setStatus(`Wrote ${fileName} — ${formatBytes(data.length)} bytes`);
    } catch (e) {
      console.error("Error during export", e);
      alert("Something went wrong during export, check the browser logs for details");
    }
  }

  return (
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
  );
};

export const Gp7ExporterDemo: React.FC<Gp7ExporterDemoProps> = ({
  showCode = true,
}) => {
  return (
    <div>
      <PlayerProvider file="/files/features/Chords.gp5" player={true}>
        <Gp7ExporterControls />
        <PlayerHost />
      </PlayerProvider>
      {showCode ? <CodeBlock language="js">{codeSample}</CodeBlock> : null}
    </div>
  );
};
