import React from 'react';
import clsx from 'clsx';
import { IconGithub } from '@coderline/alphatab-ui';
import { useGithubStars } from '@site/src/components/landing/use-github-stars';
import styles from './GitHubStarsLink.module.scss';

interface Props {
  href: string;
  className?: string;
}

export default function GitHubStarsLink({ href, className }: Props): React.ReactElement {
  const stars = useGithubStars();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(styles.link, className)}
      aria-label={stars ? `GitHub repository — ${stars} stars` : 'GitHub repository'}
    >
      <IconGithub size={18} aria-hidden="true" />
      {stars && <span className={styles.count}>{stars}</span>}
    </a>
  );
}
