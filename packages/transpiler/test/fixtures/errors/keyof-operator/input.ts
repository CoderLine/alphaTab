/**
 * @public
 */
export interface Profile {
    name: string;
    email: string;
    age: number;
}

/**
 * @public
 */
export class KeyofOperator {
    public pickKey(k: keyof Profile): string {
        return k;
    }
}
