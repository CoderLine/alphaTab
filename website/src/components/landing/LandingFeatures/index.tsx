import React from 'react';
import { SectionHeader } from '../section-header';
import { FourNotations } from './cards/four-notations';
import { SyncVisual } from './cards/sync-visual';
import { Reflow } from './cards/reflow';
import { Mixer } from './cards/mixer';
import { CursorSelection } from './cards/cursor-selection';
import { Platforms } from './cards/platforms';
import styles from './styles.module.scss';

interface FeatureCard {
  n: string;
  t: string;
  d: string;
  v: React.ReactNode;
}

const CARDS: FeatureCard[] = [
  {
    n: '01',
    t: 'Renders four kinds of notation',
    d: 'Standard staff, guitar tabs, percussion tabs, slash chord notation and jiǎnpǔ — all from the same score.',
    v: <FourNotations />,
  },
  {
    n: '02',
    t: 'Synth, audio & video sync',
    d: 'Built-in WebAudio synth driven by SoundFont2/3 — or align playback to real audio, or even video. Beat-accurate cursor on the score whichever source is playing.',
    v: <SyncVisual />,
  },
  {
    n: '03',
    t: 'Live cursor & selection',
    d: 'Beat-accurate playback cursor, range looping, transposition, tempo control — all wired to events you subscribe to.',
    v: <CursorSelection />,
  },
  {
    n: '04',
    t: 'Reflow & responsive layout',
    d: 'Page mode, horizontal scroll mode, custom paddings, custom fonts. Resizes cleanly down to phones.',
    v: <Reflow />,
  },
  {
    n: '05',
    t: 'Multi-track control',
    d: 'Show, hide, solo, mute and re-mix individual tracks at runtime. Per-track volume, pan and transposition.',
    v: <Mixer />,
  },
  {
    n: '06',
    t: 'Open core, three runtimes',
    d: 'MPL-2.0 license. JavaScript for web, .NET for desktop and server, Kotlin for native Android.',
    v: <Platforms />,
  },
];

export const LandingFeatures: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <SectionHeader
          eyebrow="§ Capabilities"
          title="Everything a notation app needs, none of the lock-in."
          paragraph="alphaTab is the same TypeScript core compiled to .NET and Kotlin. New features ship to every runtime at the same time. Bring your own UI, pick the surfaces you need, drop the rest."
          meta="01 — 06"
        />

        <div className={styles.grid}>
          {CARDS.map((f, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardNum}>{f.n}</span>
                <span className={styles.cardRule} />
              </div>
              <h3 className={styles.cardTitle}>{f.t}</h3>
              <p className={styles.cardBody}>{f.d}</p>
              <div className={styles.cardVisual}>{f.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
