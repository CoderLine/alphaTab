import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./index.module.scss";
import { HomepageFeatures } from "@site/src/components/HomepageFeatures";
import { AlphaTabFull } from "@site/src/components/AlphaTabFull";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/introduction"
          >
            Get Started
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/playground"
          >
            Explore Playground
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.tagline} description={siteConfig.tagline}>
      <HomepageHeader />
      <main className="main-at">
        <AlphaTabFull
          settings={{
            core: {
              file: "/files/canon.gp",
              tracks: [0],
            },
          }}
        />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
