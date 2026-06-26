/**
 * @public
 */
export enum Mode {
    Off,
    On
}

/**
 * @public
 */
export class ValueNonNull {
    public mode: Mode | null = null;

    public read(): Mode {
        return this.mode!;
    }
}
