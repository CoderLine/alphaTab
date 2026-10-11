import { useCallback, useEffect, useState } from 'react';

function read<T>(key: string, fallback: T): T {
    try {
        const raw = window.localStorage.getItem(key);
        return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
        return fallback;
    }
}

/**
 * `useState` mirrored to `localStorage` under `key`. Falls back to in-memory state when storage is
 * unavailable (private windows, blocked site data). Browser-only: the Playground never renders on the server.
 */
export function usePersistedState<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
    const [value, setValue] = useState<T>(() => read(key, fallback));

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Storage full or blocked; the in-memory value still works for this visit.
        }
    }, [key, value]);

    const set = useCallback((next: T | ((prev: T) => T)) => setValue(next), []);
    return [value, set];
}
