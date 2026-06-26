/**
 * Covers fields and parameters typed as `any` and `unknown`.
 *
 * @public
 */
export class AnyAndUnknown {
    public anyValue: any = null;
    public unknownValue: unknown = null;

    public read(): any {
        return this.anyValue;
    }

    public describe(value: unknown): string {
        if (typeof value === 'string') {
            return value;
        }
        return 'unknown';
    }
}
