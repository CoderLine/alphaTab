/**
 * @public
 */
export interface HasId {
    readonly id: number;
}

/**
 * @public
 */
export interface HasName {
    readonly name: string;
}

/**
 * @public
 */
export class IntersectionMultiOperand {
    public describe(item: HasId & HasName): string {
        return `${item.id}: ${item.name}`;
    }
}
