import { useCallback, useEffect, useState } from 'react';
import { useUiEnvironment } from '../environment';

/**
 * `useState` mirrored as JSON to the environment's `PreferencesStorage` under `key`. Values
 * that cannot be read back fall back to `fallback`. Reads storage on the first render, so render it
 * in the browser only.
 */
export function usePersistedState<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
    const { storage } = useUiEnvironment();
    const [value, setValue] = useState<T>(() => {
        const raw = storage.getItem(key);
        if (raw === null) {
            return fallback;
        }
        try {
            return JSON.parse(raw) as T;
        } catch {
            return fallback;
        }
    });

    useEffect(() => {
        storage.setItem(key, JSON.stringify(value));
    }, [storage, key, value]);

    const set = useCallback((next: T | ((prev: T) => T)) => setValue(next), []);
    return [value, set];
}
