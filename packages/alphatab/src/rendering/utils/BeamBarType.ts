/**
 * Lists all types how two voices can be joined with bars.
 */
export enum BeamBarType {
    /**
     * Full Bar from current to next
     */
    Full = 0,
    /**
     * A small Bar from current to previous
     */
    PartLeft = 1,
    /**
     * A small bar from current to next
     */
    PartRight = 2
}
