'use client';

import React, { useState, useEffect } from 'react';
import {
  AlphaTabPlayer,
  AlphaTabCanvas,
  useAlphaTabControls,
} from '@site/src/alphatab-react';
import { TransportBar } from './TransportControls';
import styles from './styles.module.scss';

export interface VolumeMixDemoProps {
  file?: string;
  tex?: string;
  showCode?: boolean;
}

const VolumeMixControls: React.FC = () => {
  const controls = useAlphaTabControls();
  const [master, setMaster] = useState(1);
  const [metronome, setMetronome] = useState(0.3);
  const [countIn, setCountIn] = useState(0.7);

  useEffect(() => {
    controls?.setMasterVolume(master);
  }, [controls, master]);

  useEffect(() => {
    controls?.setMetronomeVolume(metronome);
  }, [controls, metronome]);

  useEffect(() => {
    controls?.setCountInVolume(countIn);
  }, [controls, countIn]);

  const slider = (label: string, val: number, set: (v: number) => void, id: string) => (
    <div className={styles.field}>
      <label htmlFor={id}>
        {label}: <span className={styles.value}>{val.toFixed(2)}</span>
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={val}
        onChange={(e) => set(parseFloat(e.target.value))}
        style={{ width: '12rem' }}
      />
    </div>
  );

  return (
    <div className={styles.extras}>
      {slider('Master volume', master, setMaster, 'vol-master')}
      {slider('Metronome volume', metronome, setMetronome, 'vol-metronome')}
      {slider('Count-in volume', countIn, setCountIn, 'vol-countin')}
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const VolumeMixDemo: React.FC<VolumeMixDemoProps> = ({ file, tex, showCode = true }) => (
  <div className={styles.wrapper}>
    <AlphaTabPlayer file={file} tex={tex}>
      <TransportBar />
      <VolumeMixControls />
      <AlphaTabCanvas />
    </AlphaTabPlayer>
  </div>
);
