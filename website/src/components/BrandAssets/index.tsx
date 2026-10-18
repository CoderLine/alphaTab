import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.scss';

export interface BrandAsset {
  file: string;
  name: string;
  use: string;
  background: 'light' | 'dark';
}

export const OFFICIAL_ASSETS: BrandAsset[] = [
  { file: 'alphatab-official-logo.svg', name: 'Logo', use: 'Light backgrounds', background: 'light' },
  { file: 'alphatab-official-logo-white.svg', name: 'Logo, white', use: 'Dark or colored backgrounds', background: 'dark' },
  { file: 'alphatab-official-logo-tagline.svg', name: 'Logo with tagline', use: 'Headers, banners, landing pages', background: 'light' },
  { file: 'alphatab-official-logo-tagline-white.svg', name: 'Logo with tagline, white', use: 'Headers and banners on dark backgrounds', background: 'dark' },
  { file: 'alphatab-official-logo-stacked.svg', name: 'Stacked logo', use: 'Square spaces, splash and loading screens', background: 'light' },
  { file: 'alphatab-official-logo-stacked-white.svg', name: 'Stacked logo, white', use: 'Square spaces on dark backgrounds', background: 'dark' },
];

export const STYLIZED_ASSETS: BrandAsset[] = [
  { file: 'alphatab-stylized-logo.svg', name: 'Logo', use: 'Light backgrounds', background: 'light' },
  { file: 'alphatab-stylized-logo-dark.svg', name: 'Logo, dark', use: 'Dark backgrounds', background: 'dark' },
  { file: 'alphatab-stylized-logo-stacked.svg', name: 'Stacked logo', use: 'Square spaces', background: 'light' },
  { file: 'alphatab-stylized-logo-stacked-dark.svg', name: 'Stacked logo, dark', use: 'Square spaces on dark backgrounds', background: 'dark' },
  { file: 'alphatab-stylized-logo-black.svg', name: 'Logo, black', use: 'Print and single-color layouts', background: 'light' },
  { file: 'alphatab-stylized-logo-white.svg', name: 'Logo, white', use: 'Photos and colored backgrounds', background: 'dark' },
  { file: 'powered-by-alphatab.svg', name: 'Powered by', use: 'Footers, about pages, landing pages', background: 'light' },
  { file: 'powered-by-alphatab-dark.svg', name: 'Powered by, dark', use: 'Footers on dark themes', background: 'dark' },
  { file: 'notation-by-alphatab.svg', name: 'Notation by', use: 'Next to the score or the player controls', background: 'light' },
  { file: 'notation-by-alphatab-dark.svg', name: 'Notation by, dark', use: 'Players with a dark theme', background: 'dark' },
  { file: 'alphatab-compact.svg', name: 'Compact', use: 'Status bars and toolbars', background: 'light' },
  { file: 'alphatab-compact-dark.svg', name: 'Compact, dark', use: 'Dark status bars and toolbars', background: 'dark' },
  { file: 'alphatab-attribution.svg', name: 'Score mark', use: 'The in-score attribution as a standalone image', background: 'light' },
  { file: 'alphatab-attribution-white.svg', name: 'Score mark, white', use: 'The in-score attribution on dark backgrounds', background: 'dark' },
  { file: 'alphatab-icon.svg', name: 'Icon', use: 'App menus, favicons, tight spaces', background: 'light' },
  { file: 'alphatab-icon-white.svg', name: 'Icon, white', use: 'Icons on dark or colored backgrounds', background: 'dark' },
];

const AssetTile: React.FC<{ asset: BrandAsset }> = ({ asset }) => {
  const url = useBaseUrl(`/img/brand/${asset.file}`);
  return (
    <li className={styles.tile}>
      <div className={asset.background === 'dark' ? styles.previewDark : styles.previewLight}>
        <img src={url} alt={`${asset.name} variant of the alphaTab logo`} loading="lazy" />
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{asset.name}</div>
        <div className={styles.use}>{asset.use}</div>
        <a className={styles.download} href={url} download={asset.file}>
          {asset.file}
        </a>
      </div>
    </li>
  );
};

export interface BrandAssetsProps {
  set: 'official' | 'stylized';
}

export const BrandAssets: React.FC<BrandAssetsProps> = ({ set }) => {
  const assets = set === 'official' ? OFFICIAL_ASSETS : STYLIZED_ASSETS;
  return (
    <ul className={styles.grid}>
      {assets.map((a) => (
        <AssetTile key={a.file} asset={a} />
      ))}
    </ul>
  );
};
