/**
 * @record
 * @public
 */
export interface WithMethod {
    label: string;
}

/**
 * @public
 */
export class ObjectMethod {
    public make(): WithMethod {
        return {
            label: 'x',
            describe() {
                return this.label;
            }
        } as WithMethod;
    }
}
