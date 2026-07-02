/**
 * @public
 */
export class Delegated {
    /**
     * @delegated csharp CsName
     * @delegated kotlin ktName
     */
    public original: number = 0;

    public read(): number {
        return this.original;
    }
}
