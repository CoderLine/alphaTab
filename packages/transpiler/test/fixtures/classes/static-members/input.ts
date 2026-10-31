/**
 * Covers static member declarations:
 *  - static property with initializer
 *  - static readonly property
 *  - static method
 *  - accessing static property from a static method via ClassName.field
 *  - accessing static property from an instance method via ClassName.field
 *
 * @public
 */
export class Counter {
    private static count: number = 0;
    public static readonly maxCount: number = 100;

    public static increment(): void {
        Counter.count++;
    }

    public static getCount(): number {
        return Counter.count;
    }

    public isAtMax(): boolean {
        return Counter.count >= Counter.maxCount;
    }
}
