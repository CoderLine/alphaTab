import React, { useCallback, useEffect, useState } from "react";
import type * as alphaTab from "@coderline/alphatab";
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabApi,
  useAlphaTabEvent,
  useAlphaTabModule,
} from "@site/src/alphatab-react";
import CodeBlock from "@theme/CodeBlock";

export interface SettingsJsonDemoProps {
  showCode?: boolean;
}

const codeSample = `import * as alphaTab from '@coderline/alphatab';

const container = getAlphaTabContainer();
const api = new alphaTab.AlphaTabApi(container, {
  core: { file: '/scores/chords.gp' },
  display: { scale: 1.0 },
});

function refreshJson() {
  document.querySelector('#settings-json').value =
    alphaTab.model.JsonConverter.settingsToJson(api.settings);
}

// Serialize on every knob change
document.querySelector('#layout-mode').addEventListener('change', (e) => {
  api.settings.display.layoutMode = Number(e.target.value);
  api.updateSettings();
  api.render();
  refreshJson();
});

// Round-trip: parse the textarea and re-apply
document.querySelector('#reset').addEventListener('click', () => {
  const text = document.querySelector('#settings-json').value;
  const restored = alphaTab.model.JsonConverter.jsonToSettings(text);
  api.settings = restored;
  api.updateSettings();
  api.render();
});`;

const SettingsJsonInner: React.FC = () => {
  const api = useAlphaTabApi();
  const module = useAlphaTabModule();

  const layoutModeOptions = React.useMemo(() => {
    if (!module) { return [] as { label: string; value: alphaTab.LayoutMode }[]; }
    return [
      { label: "Page", value: module.LayoutMode.Page },
      { label: "Horizontal", value: module.LayoutMode.Horizontal },
      { label: "Parchment", value: module.LayoutMode.Parchment },
    ];
  }, [module]);

  const [layoutMode, setLayoutMode] = useState<alphaTab.LayoutMode | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [json, setJson] = useState<string>("");
  const [copyStatus, setCopyStatus] = useState<string>();

  // Initialize layoutMode default once the module is loaded.
  useEffect(() => {
    if (module && layoutMode === null) {
      setLayoutMode(module.LayoutMode.Page);
    }
  }, [module, layoutMode]);

  const refreshJson = useCallback(
    (current: alphaTab.AlphaTabApi) => {
      if (!module) { return; }
      try {
        setJson(module.model.JsonConverter.settingsToJson(current.settings));
      } catch (e) {
        console.error("Could not serialize settings", e);
      }
    },
    [module],
  );

  // Initial render of the JSON blob once the api is ready.
  useAlphaTabEvent("scoreLoaded", () => {
    if (api) {
      refreshJson(api);
    }
  }, [api, refreshJson]);

  useEffect(() => {
    if (!api || layoutMode === null) {
      return;
    }
    api.settings.display.layoutMode = layoutMode;
    api.settings.display.scale = scale;
    api.updateSettings();
    api.render();
    refreshJson(api);
  }, [api, layoutMode, scale, refreshJson]);

  function resetFromJson() {
    if (!api || !module) {
      return;
    }
    try {
      const restored = module.model.JsonConverter.jsonToSettings(json);
      api.settings = restored;
      api.updateSettings();
      api.render();
      setLayoutMode(restored.display.layoutMode);
      setScale(restored.display.scale);
      refreshJson(api);
    } catch (e) {
      console.error("Could not parse settings JSON", e);
      alert(
        "Could not parse the settings JSON, check the browser logs for details",
      );
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

  const controlRowStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "1rem",
    padding: "0.75rem",
    marginBottom: "0.75rem",
    border: "1px solid var(--ifm-color-emphasis-300)",
    borderRadius: "6px",
    background: "var(--ifm-background-surface-color)",
  };

  const knobStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    flex: "1 1 15rem",
  };

  return (
    <>
      <div style={controlRowStyle}>
        <div style={knobStyle}>
          <label htmlFor="settings-json-layout-mode" style={{ fontWeight: 600 }}>
            Layout mode
          </label>
          <select
            id="settings-json-layout-mode"
            value={layoutMode ?? ""}
            onChange={(e) => setLayoutMode(Number(e.target.value))}
            disabled={!module}
          >
            {layoutModeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div style={knobStyle}>
          <label htmlFor="settings-json-scale" style={{ fontWeight: 600 }}>
            Scale
          </label>
          <input
            id="settings-json-scale"
            type="range"
            min={0.5}
            max={2.0}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span
            style={{
              minWidth: "3rem",
              textAlign: "right",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(scale * 100)}%
          </span>
        </div>
      </div>
      <AlphaTabCanvas />
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
          className="button button--secondary"
          onClick={copyToClipboard}
          type="button"
          disabled={!json}
        >
          Copy to clipboard
        </button>
        <button
          className="button button--primary"
          onClick={resetFromJson}
          type="button"
          disabled={!json}
        >
          Reset settings from JSON
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
        placeholder="Live settings JSON will appear here."
      />
    </>
  );
};

export const SettingsJsonDemo: React.FC<SettingsJsonDemoProps> = ({
  showCode = true,
}) => {
  return (
    <div>
      <AlphaTabPlayer
        file="/files/features/Chords.gp5"
        player={true}
        settings={{ display: { scale: 1.0 } }}
      >
        <SettingsJsonInner />
      </AlphaTabPlayer>
      {showCode ? <CodeBlock language="js">{codeSample}</CodeBlock> : null}
    </div>
  );
};
