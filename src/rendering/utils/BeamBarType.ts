/**
 * Lists all types how two voices can be joined with bars.
 */
export enum BeamBarType {
    /**
     * Full Bar from current to next
     */
    Full,
    /**
     * A small Bar from current to previous
     */
    PartLeft,
    /**
     * A small bar from current to next
     */
    PartRight
}
