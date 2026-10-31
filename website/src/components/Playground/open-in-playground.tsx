import React from 'react';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { buildFileLink, buildPlaygroundUrl, PLAYGROUND_PATH, type PlaygroundLinkTarget } from './url-state';

type FileTarget = Exclude<PlaygroundLinkTarget, { tex: string }>;

/**
 * `href` and `onClick` for a link that opens `target` in the Playground. Inline alphaTex is
 * compressed into the URL on click; the plain `href` (and navigation without JavaScript) opens
 * `fallback`, or the Playground's default score.
 */
export function usePlaygroundLink(target: PlaygroundLinkTarget, fallback?: FileTarget) {
    const base = useBaseUrl(PLAYGROUND_PATH);
    const history = useHistory();
    const isTex = 'tex' in target;
    const href = !isTex ? buildFileLink(target, base) : fallback ? buildFileLink(fallback, base) : base;
    const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!isTex || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
        e.preventDefault();
        void buildPlaygroundUrl(target, base).then((url) => history.push(url));
    };
    return { href, onClick };
}

interface OpenInPlaygroundLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    score: PlaygroundLinkTarget;
    fallback?: FileTarget;
    children: React.ReactNode;
}

/** A link that opens a score in the Playground; see `usePlaygroundLink`. */
export const OpenInPlaygroundLink: React.FC<OpenInPlaygroundLinkProps> = ({ score, fallback, onClick, children, ...rest }) => {
    const link = usePlaygroundLink(score, fallback);
    return (
        <Link
            {...rest}
            to={link.href}
            onClick={(e) => {
                onClick?.(e);
                link.onClick(e);
            }}
        >
            {children}
        </Link>
    );
};
