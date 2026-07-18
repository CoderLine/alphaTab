'use client';

import * as alphaTab from '@coderline/alphatab';
import React, { useState, useEffect } from 'react';
import { TransportControls } from './TransportControls';
import { useAlphaTabEvent } from '@site/src/hooks';
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

const typeName = (t: alphaTab.midi.MidiEventType): string => {
  const map = alphaTab.midi.MidiEventType as unknown as Record<number, string>;
  return map[t] ?? String(t);
};

const describe = (evt: alphaTab.midi.MidiEvent): string => {
  const anyEvt = evt as any;
  if (evt instanceof alphaTab.midi.NoteOnEvent || evt instanceof alphaTab.midi.NoteOffEvent) {
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

let entryId = 0;

export const MidiEventLog: React.FC<MidiEventLogProps> = ({
  file,
  tex,
  showCode = true,
  maxEntries = 20,
}) => {
  const [api, setApi] = useState<alphaTab.AlphaTabApi>();
  const [entries, setEntries] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (!api) return;
    api.midiEventsPlayedFilter = [
      alphaTab.midi.MidiEventType.NoteOn,
      alphaTab.midi.MidiEventType.AlphaTabMetronome,
      alphaTab.midi.MidiEventType.TempoChange,
    ];
  }, [api]);

  useAlphaTabEvent(api, 'midiEventsPlayed', (e: alphaTab.synth.MidiEventsPlayedEventArgs) => {
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
  });

  return (
    <TransportControls
      file={file}
      tex={tex}
      showCode={showCode}
      onApi={setApi}
      renderExtras={() => (
        <div style={{ width: '100%' }}>
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
      )}
    />
  );
};
