/**
 * @public
 */
export interface Named {
    readonly name: string;
}

/**
 * Covers an interface that extends another interface, plus a class
 * implementing the derived interface.
 *
 * @public
 */
export interface Tagged extends Named {
    readonly tag: string;
}

/**
 * @public
 */
export class Label implements Tagged {
    public readonly name: string = '';
    public readonly tag: string = '';
}
