'use client';

import * as alphaTab from '@coderline/alphatab';
import React, { useState, useCallback, useEffect } from 'react';
import { TransportControls } from './TransportControls';
import styles from './styles.module.scss';

export interface OutputDeviceDemoProps {
  file?: string;
  tex?: string;
  showCode?: boolean;
}

const isSupported = () => {
  if (typeof window === 'undefined') return false;
  return 'AudioContext' in window && 'setSinkId' in (AudioContext.prototype as object);
};

export const OutputDeviceDemo: React.FC<OutputDeviceDemoProps> = ({
  file,
  tex,
  showCode = true,
}) => {
  const [api, setApi] = useState<alphaTab.AlphaTabApi>();
  const [devices, setDevices] = useState<alphaTab.synth.ISynthOutputDevice[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [supported, setSupported] = useState(true);
  const [status, setStatus] = useState('press refresh to list devices');

  useEffect(() => {
    setSupported(isSupported());
  }, []);

  const refresh = useCallback(async () => {
    if (!api) return;
    try {
      const list = await api.enumerateOutputDevices();
      setDevices(list);
      const def = list.find((d) => d.isDefault) ?? list[0];
      if (def) setSelectedId(def.deviceId);
      setStatus(`${list.length} device(s)`);
    } catch (err) {
      setStatus(`enumerate failed: ${(err as Error).message}`);
    }
  }, [api]);

  const onSelect = async (id: string) => {
    setSelectedId(id);
    if (!api) return;
    const dev = devices.find((d) => d.deviceId === id) ?? null;
    try {
      await api.setOutputDevice(dev);
      setStatus(`routing to: ${dev?.label ?? 'system default'}`);
    } catch (err) {
      setStatus(`setOutputDevice failed: ${(err as Error).message}`);
    }
  };

  return (
    <TransportControls
      file={file}
      tex={tex}
      showCode={showCode}
      onApi={setApi}
      renderExtras={() =>
        !supported ? (
          <div className={styles.notice}>
            This browser does not expose output-device selection (`AudioContext.setSinkId`).
            Transport still works, but device switching is unavailable.
          </div>
        ) : (
          <>
            <button className={styles.mixerBtn} onClick={refresh}>
              Refresh devices
            </button>
            <label className={styles.fieldRow}>
              Output device:
              <select
                value={selectedId}
                onChange={(e) => onSelect(e.target.value)}
                disabled={devices.length === 0}
              >
                {devices.length === 0 && <option value="">(none listed)</option>}
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || d.deviceId}
                    {d.isDefault ? ' (default)' : ''}
                  </option>
                ))}
              </select>
            </label>
            <span className={styles.badge}>{status}</span>
          </>
        )
      }
    />
  );
};
