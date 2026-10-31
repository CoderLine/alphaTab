/**
 * Direction enum used to exercise bracket access against numeric and
 * string keys.
 *
 * @public
 */
export enum Direction {
    Up,
    Down,
    Left,
    Right
}

/**
 * Covers TypeScript's reverse-mapping bracket access on numeric enums:
 *  - Direction[d]   numeric value to member name
 *  - Direction[s]   member name to numeric value (via keyof typeof)
 *
 * @public
 */
export class EnumBracketAccess {
    public name(d: Direction): string {
        return Direction[d];
    }

    public parse(s: string): Direction {
        return Direction[s as keyof typeof Direction];
    }
}
