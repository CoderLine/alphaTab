'use client';

import React, { useState, useEffect } from 'react';
import type * as alphaTab from '@coderline/alphatab';
import { PlayerProvider, PlayerHost } from '@coderline/alphatab-ui';
import { useAlphaTabApi, useAlphaTabEvent } from '@coderline/alphatab-react';
import { useAlphaTabModule } from '@site/src/alphatab-react';
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
  const module = useAlphaTabModule();
  const [entries, setEntries] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (!api || !module) { return; }
    api.midiEventsPlayedFilter = [
      module.midi.MidiEventType.NoteOn,
      module.midi.MidiEventType.AlphaTabMetronome,
      module.midi.MidiEventType.TempoChange,
    ];
  }, [api, module]);

  const typeName = (t: alphaTab.midi.MidiEventType): string => {
    if (!module) { return String(t); }
    const map = module.midi.MidiEventType as unknown as Record<number, string>;
    return map[t] ?? String(t);
  };

  const describe = (evt: alphaTab.midi.MidiEvent): string => {
    if (!module) { return ''; }
    const anyEvt = evt as unknown as {
      channel?: number;
      noteKey?: number;
      noteVelocity?: number;
      microSecondsPerQuarterNote?: number;
      metronomeNumerator?: number;
    };
    if (
      evt instanceof module.midi.NoteOnEvent ||
      evt instanceof module.midi.NoteOffEvent
    ) {
      return `ch ${anyEvt.channel} key ${anyEvt.noteKey} vel ${anyEvt.noteVelocity}`;
    }
    if (evt instanceof module.midi.TempoChangeEvent) {
      return `${anyEvt.microSecondsPerQuarterNote ?? ''} µs/qn`;
    }
    if (evt instanceof module.midi.AlphaTabMetronomeEvent) {
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
}) => (
  <div className={styles.wrapper}>
    <PlayerProvider file={file} tex={tex}>
      <TransportBar />
      <MidiLog maxEntries={maxEntries} />
      <PlayerHost />
    </PlayerProvider>
  </div>
);
