import React, { useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import { AlphaTabHost, AlphaTabProvider, useAlphaTabApi } from '@coderline/alphatab-react';
import CodeBlock from "@theme/CodeBlock";
import { useSiteAlphaTabSettings } from '@site/src/alphatab-settings';

export interface ScoreJsonDemoProps {
  showCode?: boolean;
}

function formatSize(bytes: number, lines: number): string {
  const kb = bytes / 1024;
  const sizeLabel = kb >= 10 ? `${Math.round(kb)} KB` : `${kb.toFixed(1)} KB`;
  return `${sizeLabel}, ${lines.toLocaleString()} lines`;
}

const codeSample = `import * as alphaTab from '@coderline/alphatab';

const container = getAlphaTabContainer();
const api = new alphaTab.AlphaTabApi(container, {
  core: { file: '/scores/song.gp' },
});

api.scoreLoaded.on(() => {
  // Serialize
  const jsonString = alphaTab.model.JsonConverter.scoreToJson(api.score);

  // Round-trip
  const restored = alphaTab.model.JsonConverter.jsonToScore(jsonString);
  api.renderScore(restored);
});`;

const ScoreJsonControls: React.FC = () => {
  const api = useAlphaTabApi();

  const [json, setJson] = useState<string>("");
  const [caption, setCaption] = useState<string>();
  const [copyStatus, setCopyStatus] = useState<string>();

  function serialize() {
    if (!api || !api.score) {
      return;
    }
    try {
      const text = alphaTab.model.JsonConverter.scoreToJson(api.score);
      setJson(text);
      const bytes = new TextEncoder().encode(text).length;
      const lines = text.split("\n").length;
      setCaption(formatSize(bytes, lines));
      setCopyStatus(undefined);
    } catch (e) {
      console.error("Serialize failed", e);
      alert("Could not serialize the score, check the browser logs for details");
    }
  }

  function roundTrip() {
    if (!api || !json) {
      return;
    }
    try {
      const restored = alphaTab.model.JsonConverter.jsonToScore(json);
      api.renderScore(restored);
    } catch (e) {
      console.error("Round-trip failed", e);
      alert("Could not parse the JSON, check the browser logs for details");
    }
  }

  async function copyToClipboard() {
    if (!json) {
      return;
    }
    try {
      await navigator.clipboard.writeText(json);
      setCopyStatus("Copied");
      window.setTimeout(() => setCopyStatus(undefined), 1500);
    } catch (e) {
      console.error("Clipboard write failed", e);
      setCopyStatus("Copy failed");
    }
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.75rem",
          margin: "0.75rem 0",
        }}
      >
        <button
          className="button button--primary"
          onClick={serialize}
          type="button"
        >
          Serialize
        </button>
        <button
          className="button button--secondary"
          onClick={roundTrip}
          type="button"
          disabled={!json}
        >
          Round-trip: parse and re-render
        </button>
        <button
          className="button button--secondary"
          onClick={copyToClipboard}
          type="button"
          disabled={!json}
        >
          Copy to clipboard
        </button>
        {copyStatus && (
          <span
            style={{
              fontSize: "0.9em",
              color: "var(--ifm-color-emphasis-700)",
            }}
          >
            {copyStatus}
          </span>
        )}
      </div>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        rows={16}
        spellCheck={false}
        style={{
          width: "100%",
          fontFamily: "var(--ifm-font-family-monospace)",
          fontSize: "0.85em",
          padding: "0.5rem",
          boxSizing: "border-box",
          border: "1px solid var(--ifm-color-emphasis-300)",
          borderRadius: "6px",
          background: "var(--ifm-background-surface-color)",
        }}
        placeholder='Press "Serialize" to fill this with the score JSON.'
      />
      {caption && (
        <div
          style={{
            marginTop: "0.25rem",
            fontSize: "0.9em",
            color: "var(--ifm-color-emphasis-700)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {caption}
        </div>
      )}
    </>
  );
};

export const ScoreJsonDemo: React.FC<ScoreJsonDemoProps> = ({
  showCode = true,
}) => {
  const site = useSiteAlphaTabSettings();
  return (
    <div>
      <AlphaTabProvider
        file="/files/features/Chords.gp5"
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <AlphaTabHost />
        <ScoreJsonControls />
      </AlphaTabProvider>
      {showCode ? <CodeBlock language="js">{codeSample}</CodeBlock> : null}
    </div>
  );
};
