/**
 * Class with a mix of public and @internal members, pinning the
 * transpiler's per-member visibility lowering.
 *
 * @public
 */
export class Mixed {
    public publicField: number = 0;

    /**
     * @internal
     */
    public internalField: number = 0;

    public publicMethod(): number {
        return this.publicField;
    }

    /**
     * @internal
     */
    public internalMethod(): number {
        return this.internalField;
    }
}
