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

    // narrowed to a subset of the enum members by assignments, then to non-null by the check
    public readNarrowed(on: boolean[]): Mode {
        let mode: Mode | null = null;
        for (const v of on) {
            if (v) {
                mode = Mode.On;
            }
        }
        if (mode === null) {
            return Mode.Off;
        }
        return mode;
    }
}
