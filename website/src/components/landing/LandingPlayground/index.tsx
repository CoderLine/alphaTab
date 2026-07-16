import React from 'react';
import { SectionHeader } from '../section-header';
import { Btn } from '../shared/btn';
import { CodeBlock } from '../shared/code-block';
import { TabNotation } from '../shared/tab-notation';
import { Waveform } from '../shared/waveform';
import { IconExternalLink, IconFileMusic, IconPlay } from '../shared/icons';
import styles from './styles.module.scss';

const SAMPLE = `\\title "Riff"
\\tempo 140

:8 5.3 7.3 8.3 7.3 5.3 3.3 5.3 |
   3.3 5.3 7.3 8.3 7.3 5.3 3.3`;

export const LandingPlayground: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <SectionHeader
          eyebrow="§ alphaTex · live"
          title="Type music. Hear it. Ship it."
          paragraph="alphaTex is a human-readable text format that compiles to notation in milliseconds. Author riffs in the browser, paste them into your CMS, version them in git."
          action={
            <span className={styles.headAction}>
              <Btn to="/docs/playground/playground" variant="secondary" size="sm" iconRight={<IconExternalLink size={11} />}>
                Open full Playground
              </Btn>
            </span>
          }
        />

        <div className={styles.frame}>
          <div className={styles.editorPane}>
            <div className={styles.editorHeader}>
              <IconFileMusic size={11} aria-hidden="true" />
              <span>riff.alphatex</span>
              <span className={styles.spacer} />
              <span className={styles.unsavedDot}>●</span>
              <span>unsaved</span>
            </div>
            {/* TODO(alphatab): swap this static CodeBlock for a real alphaTex editor
                when wiring is added. The notation pane below would then render the
                compiled output via useAlphaTab(). */}
            <CodeBlock code={SAMPLE} showHeader={false} className={styles.editorCode} />
          </div>

          <div className={styles.previewPane}>
            <div className={styles.previewHeader}>
              <IconPlay size={10} aria-hidden="true" />
              <span className={styles.compileMsg}>● compiled in 12ms</span>
              <span className={styles.spacer} />
              <span className={styles.previewMeta}>♩=140 · 2 bars · standard + tab</span>
            </div>
            <div className={styles.previewBody}>
              <div className={styles.notationWide}>
                <TabNotation width={700} height={180} measures={2} decorative={false} ariaLabel="Compiled alphaTex riff — two-bar tab and standard notation" />
              </div>
              <div className={styles.notationNarrow}>
                <TabNotation width={380} height={170} measures={2} decorative={false} ariaLabel="Compiled alphaTex riff — two-bar tab and standard notation" />
              </div>
            </div>
            <div className={styles.previewTransport}>
              <span className={styles.transportPlay}>
                <IconPlay size={10} aria-hidden="true" />
              </span>
              <Waveform width={400} height={22} className={styles.transportWave} />
              <span className={styles.transportTime}>00:00 / 00:08</span>
            </div>
          </div>
        </div>

        <div className={styles.mobileCta}>
          <Btn to="/docs/playground/playground" variant="secondary" fullWidth iconRight={<IconExternalLink size={11} />}>
            Open full Playground
          </Btn>
        </div>
      </div>
    </section>
  );
};
