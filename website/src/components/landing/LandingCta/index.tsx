import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import { Pill } from '../shared/pill';
import { IconArrow } from '../shared/icons';
import styles from './styles.module.scss';

interface Install {
  platform: string;
  cmd: string;
}

export const LandingCta: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();
  const version = (siteConfig.customFields?.alphaTabVersion as string | undefined) ?? '';

  const installs: Install[] = [
    { platform: 'JavaScript', cmd: 'npm i @coderline/alphatab' },
    { platform: '.NET', cmd: 'dotnet add package AlphaTab' },
    { platform: 'Kotlin', cmd: `implementation("net.alphatab:alphatab:${version}")` },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.card}>
          <div className={styles.copy}>
            <Pill className={styles.versionPill}>v{version} · MPL-2.0</Pill>
            <h2 className={styles.title}>
              Ready to ship<br className={styles.titleBreak} /> music to your users?
            </h2>
            <p className={styles.lede}>
              Five minutes to first render. Pick your runtime, follow the quickstart, embed alphaTab in the app you
              already have.
            </p>
          </div>

          <div className={styles.installs}>
            {installs.map((r, i) => (
              <div key={i} className={styles.installCard}>
                <div className={styles.installPlatform}>{r.platform}</div>
                <div className={styles.installCmd}>{r.cmd}</div>
              </div>
            ))}
            <Link to="/docs/getting-started/installation-web" className={styles.quickstart}>
              Quickstart guide <IconArrow aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
