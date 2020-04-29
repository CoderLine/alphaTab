import React from "react";
import classnames from "classnames";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import AlphaTab from "../alphatab-full";

const features = [
  {
    title: <>Responsive Display</>,
    imageUrl: "img/undraw_docusaurus_mountain.svg",
    description: (
      <>
        Depending on the available screen resolution alphaTab can resize
        dynamically to make the music sheet fit the available space.
      </>
    )
  },
  {
    title: <>Designed for Cross Platform usage</>,
    imageUrl: "img/undraw_docusaurus_tree.svg",
    description: (
      <>
        The core of alphaTab is designed to run without external dependencies
        and on multiple platforms. From one central code base we provide
        alphaTab for web based apps, desktop apps using .net and support for
        native Android and iOS apps is planed.
      </>
    )
  },
  {
    title: <>Audio Playback</>,
    imageUrl: "img/undraw_docusaurus_react.svg",
    description: (
      <>
        The built-in audio synthesizer allows users to hear what they are
        seeing. Using SoundFont2 containers as input, alphaTab can generate the
        matching audio to the displayed music notation and provide a live
        display cursor including interactive selection of playback position and
        ranges.
      </>
    )
  },
  {
    title: <>Powerful API</>,
    imageUrl: "img/undraw_docusaurus_react.svg",
    description: (
      <>
        Use the alphaTab APIs to build your customized look&amp;feel on top of
        the main rendering component. Access the full data model of the music
        sheet to derive UI components tailored for your needs.
      </>
    )
  }
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={styles.feature}>
      {imgUrl && (
          <img className={styles.featureImage} src={imgUrl} alt={title} />
      )}
      <div className={styles.featureDescription}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout title={`${siteConfig.title}`} description="">
      <header className={classnames("hero hero--primary", styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={classnames(
                "button button--outline button--secondary button--lg",
                styles.getStarted
              )}
              to={useBaseUrl("docs/introduction")}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main class="main-at">
        <AlphaTab settings={ { 
          file: "/files/Nightwish.gp5",
          tracks: 3          
        } } />
        {features && features.length && (
          <section className={styles.features}>
            <div className="container">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
