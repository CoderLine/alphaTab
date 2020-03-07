import React from "react";
import classnames from "classnames";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

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
    <div className={classnames("col col--12", styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function AlphaTabTrack({track}) {
  return (
      <div className="at-track">
        <div className="at-track-icon">
          <i className="fas fa-guitar"></i>
        </div>
        <span className="at-track-name">{track.name}</span>
        <div className="at-track-controls">
          <button
            type="button"
            className="btn btn-sm btn-outline-danger at-track-mute"
          >
            Mute
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-success at-track-solo"
          >
            Solo
          </button>
          <i className="fas fa-volume-up"></i>
          <input
            type="range"
            min="0"
            max="16"
            defaultValue="8"
            className="at-track-volume"
          />
        </div>
      </div>
  );
}

function AlphaTabDemo() {
  return (
    <div className="at-wrap loading">
      <div className="at-overlay">
        <div className="at-overlay-content">
          <div
            className="spinner-border"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          ></div>
        </div>
      </div>
      <div className="at-sidebar">
        <div className="at-sidebar-content">
          <div className="at-track-list"></div>
        </div>
      </div>
      <div className="at-viewport">
        <div
          className="at-canvas"
          id="alphaTab"
          data-file={useBaseUrl("static/files/demo.gpx")}
          data-player-scrolloffsety="-10"
          data-player-enableplayer="true"
          data-file={useBaseUrl("static/files/default.sf2")}
        ></div>
      </div>

      <div className="at-footer">
        <div className="at-times">
          <div className="at-time-slider">
            <div className="at-time-slider-value"></div>
          </div>
          <div className="at-times-values">
            <div
              className="at-bar-position"
              data-toggle="tooltip"
              data-placement="top"
              title="Bar Position"
            ></div>
            <div
              className="at-time-signature"
              data-toggle="tooltip"
              data-placement="top"
              title="Time Signature"
            ></div>
            <div
              className="at-time-position"
              data-toggle="tooltip"
              data-placement="top"
              title="Time Position"
            ></div>
            <div
              className="at-tempo"
              data-toggle="tooltip"
              data-placement="top"
              title="Tempo"
            ></div>
          </div>
        </div>

        <div className="at-player">
          <div className="at-player-left">
            <a
              href="#"
              className="at-stop disabled"
              data-toggle="tooltip"
              data-placement="top"
              title="Stop"
            >
              <i className="fas fa-step-backward"></i>
            </a>
            <a
              href="#"
              className="at-play-pause disabled"
              data-toggle="tooltip"
              data-placement="top"
              title="Play/Pause"
            >
              <i className="fas fa-play-circle"></i>
            </a>
            <div className="at-player-loading progress">
              <span className="progress-left">
                <span className="progress-bar"></span>
              </span>
              <span className="progress-right">
                <span className="progress-bar"></span>
              </span>
              <div className="progress-value w-100 h-100 rounded-circle d-flex align-items-center justify-content-center font-weight-bold">
                <span className="progress-value-number">0</span>
                <sup className="small">%</sup>
              </div>
            </div>
            <div className="at-song-details">
              <div className="at-song-title"></div>
              <div className="at-song-artist"></div>
            </div>
            <div>
              <span className="at-speed-label">
                Speed <span className="at-speed-value">100%</span>
              </span>
              <input
                type="range"
                min="0"
                max="300"
                step="10"
                defaultValue="100"
                className="at-speed"
              />
            </div>
          </div>

          <div className="at-player-right">
            <a
              href="#"
              className="at-metronome disabled"
              data-toggle="tooltip"
              data-placement="top"
              title="Metronome"
            >
              <i className="fas fa-edit"></i>
            </a>
            <a
              href="#"
              className="at-loop disabled"
              data-toggle="tooltip"
              data-placement="top"
              title="Loop"
            >
              <i className="fas fa-retweet"></i>
            </a>
            <a
              href="#"
              className="at-print"
              data-toggle="tooltip"
              data-placement="top"
              title="Print"
            >
              <i className="fas fa-print"></i>
            </a>

            <div className="btn-group dropup">
              <button
                type="button"
                className="btn dropdown-toggle"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <i className="fas fa-search"></i>
                <span className="at-zoom-label">100%</span>
              </button>
              <ul className="dropdown-menu at-zoom-options">
                <li>
                  <a href="#">25%</a>
                </li>
                <li>
                  <a href="#">50%</a>
                </li>
                <li>
                  <a href="#">75%</a>
                </li>
                <li>
                  <a href="#">90%</a>
                </li>
                <li>
                  <a href="#">100%</a>
                </li>
                <li>
                  <a href="#">110%</a>
                </li>
                <li>
                  <a href="#">125%</a>
                </li>
                <li>
                  <a href="#">150%</a>
                </li>
                <li>
                  <a href="#">200%</a>
                </li>
              </ul>
            </div>

            <div className="btn-group dropup">
              <button
                type="button"
                className="btn dropdown-toggle at-layout-button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Layout
              </button>
              <ul className="dropdown-menu at-layout-options">
                <li>
                  <a href="#" data-layout="horizontal-screen">
                    <i className="far fa-caret-square-right"></i> Horizontal
                    Layout (Off-Screen)
                  </a>
                </li>
                <li>
                  <a href="#" data-layout="horizontal-bar">
                    <i className="fas fa-caret-square-right"></i> Horizontal
                    Layout (Bar Wise)
                  </a>
                </li>
                <li>
                  <a href="#" data-layout="page">
                    <i className="fas fa-caret-square-down"></i> Vertical Layout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
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
              to={useBaseUrl("docs/installation")}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        <AlphaTabDemo />
        {features && features.length && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
