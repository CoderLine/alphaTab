import { useCallback, useEffect, useState } from 'react';

/**
 * Becomes `true` once the referenced element comes within `rootMargin` of the
 * viewport, and stays `true` afterwards.
 */
export function useNearViewport<T extends Element>(rootMargin = '600px'): [(node: T | null) => void, boolean] {
    const [node, setNode] = useState<T | null>(null);
    const [near, setNear] = useState(false);
    const ref = useCallback((n: T | null) => setNode(n), []);

    useEffect(() => {
        if (near || !node) return;
        if (typeof IntersectionObserver === 'undefined') {
            setNear(true);
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) setNear(true);
            },
            { rootMargin },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [node, near, rootMargin]);

    return [ref, near];
}
