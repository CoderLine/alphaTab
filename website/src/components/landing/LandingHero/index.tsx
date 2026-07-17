import React from 'react';
import { Btn } from '../shared/btn';
import { IconArrow } from '../shared/icons';
import { LandingPlayerStage } from '../LandingPlayerStage';
import styles from './styles.module.scss';

export const LandingHero: React.FC = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <h1 className={styles.h1}>
          <span className={styles.h1Line1}>Music notation,</span>{' '}
          <span className={styles.h1Muted}>rendered as a </span>
          <span className={styles.h1Highlight}>first-class SDK</span>.
        </h1>

        <p className={styles.lede}>
          alphaTab renders interactive guitar tabs and sheet music from Guitar&nbsp;Pro, MusicXML, Capella, and the
          built-in alphaTex syntax. One core, three runtimes — JavaScript, .NET, and Kotlin&nbsp;for&nbsp;Android.
        </p>

        <div className={styles.ctas}>
          <Btn to="/docs/introduction" size="lg" iconRight={<IconArrow />}>
            Get started
          </Btn>
          <Btn to="/docs/features/" size="lg" variant="secondary">
            See live examples
          </Btn>
        </div>

        <div className={styles.stage}>
          <LandingPlayerStage />
        </div>
      </div>
    </section>
  );
};
