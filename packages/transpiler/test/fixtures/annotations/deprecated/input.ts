/**
 * Old shape API kept around for backwards compatibility.
 *
 * @deprecated Use NewShape instead.
 * @public
 */
export class OldShape {
    /**
     * Legacy area calculation entry point.
     *
     * @deprecated use area() instead
     */
    public calc(): number {
        return 0;
    }

    public area(): number {
        return 0;
    }
}
