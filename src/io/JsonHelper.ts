import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';

/**
 * @partial
 */
export class JsonHelper {
    /**
     * @target web
     * @partial
     */
    public static parseEnum<T>(s: unknown, enumType: any): T | undefined {
        switch (typeof s) {
            case 'string':
                const num = Number.parseInt(s);
                return Number.isNaN(num)
                    ? (enumType[Object.keys(enumType).find(k => k.toLowerCase() === s.toLowerCase()) as any] as any)
                    : (num as unknown as T);
            case 'number':
                return s as unknown as T;
            case 'undefined':
            case 'object':
                return undefined;
        }
        throw new AlphaTabError(AlphaTabErrorType.Format, `Could not parse enum value '${s}'`);
    }

    /**
     * @target web
     * @partial
     */
    public static forEach(s: unknown, func: (v: unknown, k: string) => void): void {
        if (s instanceof Map) {
            (s as Map<string, unknown>).forEach(func);
        } else if (typeof s === 'object') {
            for (const k in s) {
                func((s as any)[k], k);
            }
        }
        // skip
    }

    /**
     * @target web
     * @partial
     */
    public static getValue(s: unknown, key: string): unknown {
        if (s instanceof Map) {
            return (s as Map<string, unknown>).get(key);
        }

        if (typeof s === 'object') {
            return (s as any)[key];
        }
        return null;
    }
}
