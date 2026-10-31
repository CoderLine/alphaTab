/**
 * Covers static accessor emission:
 *  - static getter (lazy singleton pattern)
 *  - static getter / setter pair
 *
 * @public
 */
export class Singleton {
    private static _instance: Singleton | null = null;
    private static _version: number = 1;

    public static get instance(): Singleton {
        if (Singleton._instance === null) {
            Singleton._instance = new Singleton();
        }
        return Singleton._instance;
    }

    public static get version(): number {
        return Singleton._version;
    }

    public static set version(v: number) {
        Singleton._version = v;
    }
}
