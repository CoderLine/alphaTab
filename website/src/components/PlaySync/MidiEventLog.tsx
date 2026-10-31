'use client';

import React, { useState, useEffect } from 'react';
import * as alphaTab from '@coderline/alphatab';
import { AlphaTabHost, AlphaTabProvider, useAlphaTabApi, useAlphaTabEvent } from '@coderline/alphatab-react';
import { useSiteAlphaTabSettings } from '@site/src/alphatab-settings';
import { TransportBar } from './TransportControls';
import styles from './styles.module.scss';

export interface MidiEventLogProps {
  file?: string;
  tex?: string;
  showCode?: boolean;
  maxEntries?: number;
}

interface LogEntry {
  id: number;
  tick: number;
  type: string;
  detail: string;
}

let entryId = 0;

const MidiLog: React.FC<{ maxEntries: number }> = ({ maxEntries }) => {
  const api = useAlphaTabApi();
  const [entries, setEntries] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (!api) { return; }
    api.midiEventsPlayedFilter = [
      alphaTab.midi.MidiEventType.NoteOn,
      alphaTab.midi.MidiEventType.AlphaTabMetronome,
      alphaTab.midi.MidiEventType.TempoChange,
    ];
  }, [api]);

  const typeName = (t: alphaTab.midi.MidiEventType): string => {
    const map = alphaTab.midi.MidiEventType as unknown as Record<number, string>;
    return map[t] ?? String(t);
  };

  const describe = (evt: alphaTab.midi.MidiEvent): string => {
    const anyEvt = evt as unknown as {
      channel?: number;
      noteKey?: number;
      noteVelocity?: number;
      microSecondsPerQuarterNote?: number;
      metronomeNumerator?: number;
    };
    if (
      evt instanceof alphaTab.midi.NoteOnEvent ||
      evt instanceof alphaTab.midi.NoteOffEvent
    ) {
      return `ch ${anyEvt.channel} key ${anyEvt.noteKey} vel ${anyEvt.noteVelocity}`;
    }
    if (evt instanceof alphaTab.midi.TempoChangeEvent) {
      return `${anyEvt.microSecondsPerQuarterNote ?? ''} µs/qn`;
    }
    if (evt instanceof alphaTab.midi.AlphaTabMetronomeEvent) {
      return `metronome beat ${anyEvt.metronomeNumerator ?? ''}`;
    }
    return '';
  };

  useAlphaTabEvent(
    'midiEventsPlayed',
    (e) => {
      setEntries((prev) => {
        const next = [...prev];
        for (const evt of e.events) {
          next.push({
            id: ++entryId,
            tick: evt.tick,
            type: typeName(evt.type),
            detail: describe(evt),
          });
        }
        return next.slice(-maxEntries);
      });
    },
  );

  return (
    <div className={styles.extras} style={{ display: 'block' }}>
      <div className={styles.caption}>
        Filter: NoteOn, AlphaTabMetronome, TempoChange
      </div>
      <div className={styles.midiLog}>
        {entries.length === 0 && <div>Press play to see events…</div>}
        {entries.map((e) => (
          <div key={e.id}>
            tick {e.tick.toString().padStart(6)} · {e.type.padEnd(20)} · {e.detail}
          </div>
        ))}
      </div>
    </div>
  );
};

export const MidiEventLog: React.FC<MidiEventLogProps> = ({
  file,
  tex,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showCode = true,
  maxEntries = 20,
}) => {
  const site = useSiteAlphaTabSettings({ player: true });
  return (
    <div className={styles.wrapper}>
      <AlphaTabProvider
        file={file}
        tex={tex}
        configureSettings={site.configureSettings}
        settings={site.settings}
      >
        <TransportBar />
        <MidiLog maxEntries={maxEntries} />
        <AlphaTabHost />
      </AlphaTabProvider>
    </div>
  );
};
