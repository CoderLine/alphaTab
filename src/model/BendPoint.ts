/**
 * A single point of a bending graph. Used to
 * describe WhammyBar and String Bending effects.
 * @cloneable
 * @json
 */
export class BendPoint {
    public static readonly MaxPosition: number = 60;
    public static readonly MaxValue: number = 12;

    /**
     * Gets or sets offset of the point relative to the note duration (0-60)
     */
    public offset: number;

    /**
     * Gets or sets the 1/4 note value offsets for the bend.
     */
    public value: number;

    /**
     * Initializes a new instance of the {@link BendPoint} class.
     * @param offset The offset.
     * @param value The value.
     */
    public constructor(offset: number = 0, value: number = 0) {
        this.offset = offset;
        this.value = value;
    }
}
