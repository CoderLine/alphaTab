/**
 * @record
 * @public
 */
export interface WithGetter {
    label: string;
    readonly upper: string;
}

/**
 * @public
 */
export class ObjectGetter {
    public make(): WithGetter {
        return {
            label: 'x',
            get upper() {
                return this.label.toUpperCase();
            }
        } as WithGetter;
    }
}
