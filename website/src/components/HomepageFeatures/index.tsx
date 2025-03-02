import React from 'react';
import styles from './styles.module.scss';

type FeatureItem = {
  title: string;
  Image: any;
  description: React.ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Responsive Display',
    Image: require('@site/static/img/undraw-responsive.svg').default,
    description: (
      <>
        Depending on the available screen resolution alphaTab can resize
        dynamically to make the music sheet fit the available space.
      </>
    ),
  },
  {
    title: 'Designed for Cross Platform usage',
    Image: require('@site/static/img/undraw-cross-platform.svg').default,
    description: (
      <>
        The core of alphaTab is designed to run with minimal external dependencies
        and on multiple platforms. From one central code base we provide
        alphaTab for web based apps, apps using .net and Kotlin for Android.
      </>
    ),
  },
  {
    title: 'Audio Playback',
    Image: require('@site/static/img/undraw-audio.svg').default,
    description: (
      <>
        The built-in audio synthesizer allows users to hear what they are
        seeing. Using SoundFont2 and SoundFont3 containers as input, alphaTab can generate the
        matching audio to the displayed music notation and provide a live
        display cursor including interactive selection of playback position and
        ranges.
      </>
    ),
  },
  {
    title: 'Powerful API',
    Image: require('@site/static/img/undraw-api.svg').default,
    description: (
      <>
        Use the alphaTab APIs to build your customized look&amp;feel on top of
        the main rendering component. Access the full data model of the music
        sheet to derive UI components tailored for your needs.
      </>
    ),
  },
];

function Feature({title, Image, description}: FeatureItem) {
  return (
    <div className={styles.feature}>
      <div className={styles.featureImageWrap}>
        <Image className={styles.featureImage} />
      </div>
      <div className={styles.featureDescription}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
