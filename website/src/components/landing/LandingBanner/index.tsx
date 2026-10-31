import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { IconArrow } from '@coderline/alphatab-ui';
import styles from './styles.module.scss';

// NOTE: The design places this banner ABOVE the navbar. Docusaurus's <Layout>
// puts the navbar first and sticky, so we render the banner inside the page
// body, below the navbar. Accepted deviation from the design.

export const LandingBanner: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();
  const version = (siteConfig.customFields?.alphaTabVersion as string | undefined) ?? '';
  // Resolved at build time by scanning docs/releases/ — always points to the
  // newest release notes file without manual edits when a new version ships.
  const releaseNotesPath =
    (siteConfig.customFields?.latestReleaseNotesPath as string | undefined) ?? '/docs/releases';

  return (
    <div className={styles.banner}>
      <div className={styles.inner}>
        <span className={styles.tag}>NEW</span>
        <span className={styles.message}>
          <strong>alphaTab {version}</strong>
          <span className={styles.detailFull}> is out — read what's new</span>
          <span className={styles.detailShort}> released</span>
        </span>
        <Link to={releaseNotesPath} className={styles.cta}>
          <span className={styles.ctaFull}>Release notes</span>
          <span className={styles.ctaShort}>Notes</span>
          <IconArrow size={11} />
        </Link>
      </div>
    </div>
  );
};
