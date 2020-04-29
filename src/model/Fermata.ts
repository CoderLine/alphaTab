/**
 * Lists all types of fermatas
 */
export enum FermataType {
    /**
     * A short fermata (triangle symbol)
     */
    Short,
    /**
     * A medium fermata (round symbol)
     */
    Medium,
    /**
     * A long fermata (rectangular symbol)
     */
    Long
}

/**
 * Represents a fermata.
 */
export class Fermata {
    /**
     * Gets or sets the type of fermata.
     */
    public type: FermataType = FermataType.Short;

    /**
     * Gets or sets the actual lenght of the fermata.
     */
    public length: number = 0;

    public static copyTo(src: Fermata, dst: Fermata): void {
        dst.type = src.type;
        dst.length = src.length;
    }
}
