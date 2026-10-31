import React, { useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import { AlphaTabHost, AlphaTabProvider, useAlphaTabApi } from '@coderline/alphatab-react';
import CodeBlock from "@theme/CodeBlock";
import { useSiteAlphaTabSettings } from '@site/src/alphatab-settings';

export interface MidiExporterDemoProps {
  showCode?: boolean;
}

type CaptionMap = Partial<Record<alphaTab.midi.MidiFileFormat, string>>;

function formatBytes(n: number): string {
  return n.toLocaleString();
}

function buildMidiBytes(
  api: alphaTab.AlphaTabApi,
  format: alphaTab.midi.MidiFileFormat,
): Uint8Array {
  const midiFile = new alphaTab.midi.MidiFile();
  midiFile.format = format;

  const handler = new alphaTab.midi.AlphaSynthMidiFileHandler(midiFile, true);
  const generator = new alphaTab.midi.MidiFileGenerator(
    api.score!,
    api.settings,
    handler,
  );
  generator.generate();
  return midiFile.toBinary();
}

const codeSample = `import * as alphaTab from '@coderline/alphatab';

const container = getAlphaTabContainer();
const api = new alphaTab.AlphaTabApi(container, {
  core: { file: '/scores/song.gp' },
  player: { playerMode: alphaTab.PlayerMode.EnabledSynthesizer },
});

api.scoreLoaded.on(() => {
  // SMF Type 0 — single track, multi channel
  api.downloadMidi(alphaTab.midi.MidiFileFormat.SingleTrackMultiChannel);

  // SMF Type 1 — one MIDI track per alphaTab track
  api.downloadMidi(alphaTab.midi.MidiFileFormat.MultiTrack);
});`;

const MidiExporterControls: React.FC = () => {
  const api = useAlphaTabApi();
  const [captions, setCaptions] = useState<CaptionMap>({});

  function download(format: alphaTab.midi.MidiFileFormat) {
    if (!api || !api.score) {
      return;
    }
    try {
      const bytes = buildMidiBytes(api, format);
      const fileName = api.score.title
        ? `${api.score.title}.mid`
        : "File.mid";

      setCaptions((prev) => ({
        ...prev,
        [format]: `${fileName} — ${formatBytes(bytes.length)} bytes`,
      }));

      api.downloadMidi(format);
    } catch (e) {
      console.error("Error during MIDI export", e);
      alert(
        "Something went wrong during MIDI export, check the browser logs for details",
      );
    }
  }

  const type0 = alphaTab.midi.MidiFileFormat.SingleTrackMultiChannel;
  const type1 = alphaTab.midi.MidiFileFormat.MultiTrack;

  const columnStyle: React.CSSProperties = {
    flex: 1,
    minWidth: "12rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.5rem",
  };

  const captionStyle: React.CSSProperties = {
    fontVariantNumeric: "tabular-nums",
    color: "var(--ifm-color-emphasis-700)",
    fontSize: "0.9em",
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        marginBottom: "0.75rem",
      }}
    >
      <div style={columnStyle}>
        <button
          className="button button--primary"
          onClick={() => download(type0)}
          type="button"
        >
          Download (SMF Type 0)
        </button>
        <span style={captionStyle}>
          {captions[type0] || "Single track, multi channel"}
        </span>
      </div>
      <div style={columnStyle}>
        <button
          className="button button--primary"
          onClick={() => download(type1)}
          type="button"
        >
          Download (SMF Type 1)
        </button>
        <span style={captionStyle}>
          {captions[type1] || "One MIDI track per alphaTab track"}
        </span>
      </div>
    </div>
  );
};

export const MidiExporterDemo: React.FC<MidiExporterDemoProps> = ({
  showCode = true,
}) => {
  const site = useSiteAlphaTabSettings({ player: true });
  return (
    <div>
      <AlphaTabProvider
        file="/files/features/Chords.gp5"
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <MidiExporterControls />
        <AlphaTabHost />
      </AlphaTabProvider>
      {showCode ? <CodeBlock language="js">{codeSample}</CodeBlock> : null}
    </div>
  );
};
