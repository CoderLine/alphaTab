import { useEffect, useRef, useState } from 'react';

interface Rotation {
  idx: number;
  setIdx: (i: number) => void;
  /** Auto-advance currently active. False while paused. */
  running: boolean;
  /** Bumped whenever the active slide changes, so consumers can re-mount progress UI. */
  cycle: number;
}

/**
 * Carousel rotation that pauses (rather than resets) when `paused` flips on.
 * Tracks elapsed time across pauses so resuming continues the same slide's
 * remaining duration. No React state for the progress bar — consumers drive
 * that purely in CSS via the returned `cycle` key + `running` flag.
 */
export function useRotation(length: number, intervalMs: number, paused: boolean): Rotation {
  const [idx, setIdxState] = useState(0);
  const [cycle, setCycle] = useState(0);

  // Elapsed milliseconds already consumed in the current slide.
  const elapsedRef = useRef(0);
  // performance.now() at the moment the current run segment started, or 0 if not running.
  const runStartRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const advance = () => {
    elapsedRef.current = 0;
    setIdxState((i) => (i + 1) % length);
    setCycle((c) => c + 1);
  };

  // Schedule the next advance based on remaining time in the current slide.
  const schedule = () => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    const remaining = Math.max(0, intervalMs - elapsedRef.current);
    runStartRef.current = performance.now();
    timerRef.current = setTimeout(() => {
      timerRef.current = undefined;
      runStartRef.current = 0;
      advance();
    }, remaining);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (paused) {
      // Pause: capture how much of the current slide has already elapsed,
      // then cancel the pending advance.
      if (runStartRef.current !== 0) {
        elapsedRef.current += performance.now() - runStartRef.current;
        runStartRef.current = 0;
      }
      if (timerRef.current !== undefined) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      return;
    }
    schedule();
    return () => {
      if (timerRef.current !== undefined) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, intervalMs, length, idx]);

  // Pause when the tab is hidden — match the discipline used elsewhere.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVis = () => {
      if (document.hidden && runStartRef.current !== 0) {
        elapsedRef.current += performance.now() - runStartRef.current;
        runStartRef.current = 0;
        if (timerRef.current !== undefined) {
          clearTimeout(timerRef.current);
          timerRef.current = undefined;
        }
      } else if (!document.hidden && !paused) {
        schedule();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, intervalMs]);

  const setIdx = (i: number) => {
    elapsedRef.current = 0;
    setIdxState(i);
    setCycle((c) => c + 1);
  };

  return { idx, setIdx, running: !paused, cycle };
}
