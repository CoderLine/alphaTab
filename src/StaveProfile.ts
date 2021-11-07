/**
 * Lists all stave profiles controlling which staves are shown.
 */
export enum StaveProfile {
    /**
     * The profile is auto detected by the track configurations.
     */
    Default,
    /**
     * Standard music notation and guitar tablature are rendered.
     */
    ScoreTab,
    /**
     * Only standard music notation is rendered.
     */
    Score,
    /**
     * Only guitar tablature is rendered.
     */
    Tab,
    /**
     * Only guitar tablature is rendered, but also rests and time signatures are not shown.
     * This profile is typically used in multi-track scenarios.
     */
    TabMixed
}
