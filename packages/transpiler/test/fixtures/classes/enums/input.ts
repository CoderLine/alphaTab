/**
 * Covers enum declarations:
 *  - numeric enum with default (auto-incremented) values
 *  - numeric enum with explicit values
 *  - numeric enum with negative literal value (exercises prefix-unary
 *    enum smart-cast path)
 *  - numeric enum with computed initializer (bitwise constant expression)
 *  - using an enum value in an expression
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
 * @public
 */
export enum Color {
    Red = 1,
    Green = 2,
    Blue = 4
}

/**
 * @public
 */
export enum Flags {
    None = 0,
    Read = 1 << 0,
    Write = 1 << 1,
    Execute = 1 << 2,
    All = Read | Write | Execute
}

/**
 * @public
 */
export enum Signed {
    Off = -1,
    On = 1
}

/**
 * @public
 */
export class Palette {
    public getDirection(): Direction {
        return Direction.Up;
    }

    public mixColor(c: Color): number {
        return c | Color.Green;
    }

    public toggleFlag(f: Flags): Flags {
        return f ^ Flags.Read;
    }

    public defaultSign(): Signed {
        return Signed.Off;
    }
}
