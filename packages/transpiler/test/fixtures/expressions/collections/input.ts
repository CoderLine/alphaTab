/**
 * @public
 */
export class Collections {
    public makeList(): number[] {
        return [1, 2, 3];
    }

    public get(items: number[], index: number): number {
        return items[index];
    }

    public set(items: number[], index: number, value: number): void {
        items[index] = value;
    }

    public makeMap(): Map<string, number> {
        const m = new Map<string, number>();
        m.set('a', 1);
        m.set('b', 2);
        return m;
    }

    public lookup(m: Map<string, number>, key: string): number {
        return m.get(key) ?? 0;
    }
}
