/**
 * Lists all types of fermatas
 */
export enum FermataType {
    /**
     * A short fermata (triangle symbol)
     */
    Short = 0,
    /**
     * A medium fermata (round symbol)
     */
    Medium = 1,
    /**
     * A long fermata (rectangular symbol)
     */
    Long = 2
}

/**
 * Represents a fermata.
 * @json
 * @json_strict
 */
export class Fermata {
    /**
     * Gets or sets the type of fermata.
     */
    public type: FermataType = FermataType.Short;

    /**
     * Gets or sets the actual length of the fermata.
     */
    public length: number = 0;
}
