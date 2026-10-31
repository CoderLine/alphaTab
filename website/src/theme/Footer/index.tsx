import React from 'react';
import Link from '@docusaurus/Link';
import { useThemeConfig } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Logo } from '@site/src/components/landing/shared/logo';
import styles from './styles.module.scss';

type FooterLink = {
  label?: string;
  to?: string;
  href?: string;
  prependBaseUrlToHref?: boolean;
  html?: string;
};

type FooterColumn = {
  title?: string | null;
  items: FooterLink[];
};

function isMultiColumn(links: unknown): links is FooterColumn[] {
  return Array.isArray(links) && (links.length === 0 || typeof links[0] === 'object' && 'items' in (links[0] as object));
}

function FooterLinkItem({ link }: { link: FooterLink }) {
  if (link.html) {
    // eslint-disable-next-line react/no-danger
    return <li className={styles.item}><span dangerouslySetInnerHTML={{ __html: link.html }} /></li>;
  }
  const label = link.label ?? '';
  if (link.to) {
    return (
      <li className={styles.item}>
        <Link to={link.to} className={styles.link}>
          {label}
        </Link>
      </li>
    );
  }
  if (link.href) {
    return (
      <li className={styles.item}>
        <a href={link.href} target="_blank" rel="noopener noreferrer" className={styles.link}>
          {label}
        </a>
      </li>
    );
  }
  return <li className={styles.item}>{label}</li>;
}

export default function Footer(): React.ReactElement | null {
  const { footer } = useThemeConfig();
  const { siteConfig } = useDocusaurusContext();
  if (!footer) { return null; }

  const { links, copyright } = footer;
  const columns: FooterColumn[] = isMultiColumn(links) ? links : [];
  const version =
    (siteConfig.customFields?.alphaTabVersionFull as string | undefined) ?? '';

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.cols}>
          <div className={styles.brand}>
            <Logo size={20} />
            <p className={styles.tagline}>
              Open-source music notation, rendered on the runtime you actually use. MPL-2.0 since 2010.
            </p>
          </div>

          <div className={styles.linkGrid}>
            {columns.map((col, i) => (
              <div key={i} className={styles.col}>
                {col.title && <div className={styles.colTitle}>{col.title}</div>}
                <ul className={styles.list}>
                  {col.items.map((link, j) => (
                    <FooterLinkItem key={j} link={link} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bottom}>
          {copyright && <span className={styles.copyright}>{copyright}</span>}
          <span className={styles.bottomSpacer} />
          {version && <span className={styles.version}>v{version}</span>}
        </div>
      </div>
    </footer>
  );
}
