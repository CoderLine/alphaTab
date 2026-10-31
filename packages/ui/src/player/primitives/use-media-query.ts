import { useEffect, useState } from 'react';

/** Tracks a CSS media query; `false` during SSR and the first client render. */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia(query);
        const update = () => setMatches(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, [query]);
    return matches;
}

/** Matches the `mobile` breakpoint in `_breakpoints.scss`. */
export const PHONE_QUERY = '(max-width: 640px)';
/** Matches the `not-desktop` breakpoint in `_breakpoints.scss`. */
export const NOT_DESKTOP_QUERY = '(max-width: 1023px)';
