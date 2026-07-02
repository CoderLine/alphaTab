/**
 * @public
 */
export class ForOf {
    public sum(items: number[]): number {
        let total = 0;
        for (const item of items) {
            total += item;
        }
        return total;
    }

    public join(parts: string[], sep: string): string {
        let result = '';
        let first = true;
        for (const part of parts) {
            if (!first) {
                result += sep;
            }
            result += part;
            first = false;
        }
        return result;
    }
}
