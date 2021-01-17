import { AlphaTabError } from "@src/alphatab";
import { AlphaTabErrorType } from "@src/AlphaTabError";

/**
 * @partial
 */
export class JsonHelper {
    /**
     * @target web
     */
    public static parseEnum<T>(s: unknown, enumType: any): T | null {
        switch (typeof s) {
            case 'string':
                const num = parseInt(s);
                return isNaN(num)
                    ? enumType[Object.keys(enumType).find(k => k.toLowerCase() === s.toLowerCase()) as any] as any
                    : num as unknown as T;
            case 'number':
                return s as unknown as T;
            case 'undefined':
            case 'object':
                return null;
        }
        throw new AlphaTabError(AlphaTabErrorType.Format, `Could not parse enum value '${s}'`);
    }

    /**
     * @target web
     */
    public static forEach(s: unknown, func: (v: unknown, k: string) => void): void {
        if (s instanceof Map) {
            (s as Map<string, unknown>).forEach(func);
        }else if (typeof s === 'object') {
            for (const k in s) {
                func((s as any)[k], k)
            }
        }
        // skip
    }
}