import { useEffect, useState } from 'react';

/**
 * Drives the hero player's playback cursor at ~5 fps via setTimeout.
 * The landing renders large; pinning React reconciliation at 60fps would melt
 * mobile browsers and re-renders are coarse-grained here anyway. Pauses while
 * the tab is hidden so background tabs don't waste cycles.
 */
export function useThrottledCursor(
  initial = 0.2,
  step = 0.022,
  intervalMs = 200,
  loopStart = 0.08,
  loopEnd = 0.96,
): number {
  const [cursor, setCursor] = useState(initial);

  useEffect(() => {
    if (typeof window === 'undefined') { return; }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let last = performance.now();

    const tick = () => {
      if (cancelled) { return; }
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      if (!document.hidden) {
        setCursor((p) => {
          const next = p + dt * step;
          return next > loopEnd ? loopStart : next;
        });
      }
      timer = setTimeout(tick, intervalMs);
    };

    timer = setTimeout(tick, intervalMs);
    return () => {
      cancelled = true;
      if (timer !== undefined) { clearTimeout(timer); }
    };
  }, [step, intervalMs, loopStart, loopEnd]);

  return cursor;
}
