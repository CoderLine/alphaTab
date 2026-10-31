import { useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

interface ShieldsResponse {
  message?: string;
  value?: string;
}

// shields.io's documented JSON endpoint:
// https://github.com/badges/shields/blob/master/doc/json-format.md
//
// shields.io is CDN-backed and caches each badge for 30 min (its own
// Cache-Control header), so the browser HTTP cache reuses the response
// across navigations without any app-level cache. No GitHub API rate limit
// is consumed.
function jsonUrlFor(slug: string): string {
  return `https://img.shields.io/github/stars/${slug}.json`;
}

/**
 * Returns the current GitHub star count for the configured repository.
 *
 * Initial value comes from `customFields.githubStarsInitial` (populated at
 * build time by docusaurus.config.mts). On mount, the hook refreshes from
 * shields.io's JSON badge endpoint. On any failure, the initial value sticks.
 */
export function useGithubStars(): string {
  const { siteConfig } = useDocusaurusContext();
  const slug = (siteConfig.customFields?.githubRepo as string | undefined) ?? '';
  const initial = (siteConfig.customFields?.githubStarsInitial as string | undefined) ?? '';
  const [stars, setStars] = useState(initial);

  useEffect(() => {
    if (!slug) { return; }
    let cancelled = false;
    fetch(jsonUrlFor(slug))
      .then((r) => (r.ok ? (r.json() as Promise<ShieldsResponse>) : null))
      .then((data) => {
        if (cancelled || !data) { return; }
        const next = data.message ?? data.value;
        if (next) { setStars(next); }
      })
      .catch(() => {
        /* keep the build-time initial value */
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return stars;
}
