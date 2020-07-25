/**
 * Lists all simile mark types as they are assigned to bars.
 */
export enum SimileMark {
    /**
     * No simile mark is applied
     */
    None,
    /**
     * A simple simile mark. The previous bar is repeated.
     */
    Simple,
    /**
     * A double simile mark. This value is assigned to the first
     * bar of the 2 repeat bars.
     */
    FirstOfDouble,
    /**
     * A double simile mark. This value is assigned to the second
     * bar of the 2 repeat bars.
     */
    SecondOfDouble
}
