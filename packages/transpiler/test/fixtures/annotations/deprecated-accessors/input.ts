/**
 * @public
 */
export class Settings {
    public threshold: number = 1;

    /**
     * Whether the last system is justified.
     * @deprecated Use threshold instead.
     */
    public get justify(): boolean {
        return this.threshold < 1;
    }

    public set justify(value: boolean) {
        this.threshold = value ? 0 : 1;
    }

    /**
     * Whether user interaction is enabled.
     * @deprecated Use threshold individually
     */
    public get interaction(): boolean {
        return this.threshold > 0;
    }

    /**
     * @deprecated Use threshold individually
     */
    public set interaction(value: boolean) {
        this.threshold = value ? 1 : 0;
    }

    /**
     * The legacy threshold.
     * @deprecated Use threshold instead.
     */
    public get legacy(): number {
        return this.threshold;
    }
}
