/**
 * @record
 * @public
 */
export interface Base {
    x: number;
    y: number;
}

/**
 * @public
 */
export class ObjectSpread {
    public extend(other: Base): Base {
        return { ...other, x: 10 };
    }
}
