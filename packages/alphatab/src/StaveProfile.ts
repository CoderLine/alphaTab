/**
 * Lists all stave profiles controlling which staves are shown.
 */
export enum StaveProfile {
    /**
     * The profile is auto detected by the track configurations.
     */
    Default = 0,
    /**
     * Standard music notation and guitar tablature are rendered.
     */
    ScoreTab = 1,
    /**
     * Only standard music notation is rendered.
     */
    Score = 2,
    /**
     * Only guitar tablature is rendered.
     */
    Tab = 3,
    /**
     * Only guitar tablature is rendered, but also rests and time signatures are not shown.
     * This profile is typically used in multi-track scenarios.
     */
    TabMixed = 4
}
