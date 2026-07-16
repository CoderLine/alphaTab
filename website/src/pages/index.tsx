import React from 'react';
import Layout from '@theme/Layout';
import { LandingBanner } from '@site/src/components/landing/LandingBanner';
import { LandingHero } from '@site/src/components/landing/LandingHero';
import { LandingInfoBand } from '@site/src/components/landing/LandingInfoBand';
import { LandingFeatures } from '@site/src/components/landing/LandingFeatures';
import { LandingPlayground } from '@site/src/components/landing/LandingPlayground';
import { LandingShowcase } from '@site/src/components/landing/LandingShowcase';
import { LandingCta } from '@site/src/components/landing/LandingCta';
import styles from './index.module.scss';

export default function Home(): React.ReactElement {
  return (
    <Layout>
      <div className={styles.landing}>
        <LandingBanner />
        <LandingHero />
        <LandingInfoBand />
        <LandingFeatures />
        <LandingPlayground />
        <LandingShowcase />
        <LandingCta />
      </div>
    </Layout>
  );
}
