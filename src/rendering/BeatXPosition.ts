/**
 * Lists the different position modes for {@link BarRendererBase.getBeatX}
 */
export enum BeatXPosition {
    /**
     * Gets the pre-notes position which is located before the accidentals
     */
    PreNotes,
    /**
     * Gets the on-notes position which is located after the accidentals but before the note heads.
     */
    OnNotes,
    /**
     * Gets the middle-notes position which is located after in the middle the note heads.
     */
    MiddleNotes,
    /**
     * Gets position of the stem for this beat
     */
    Stem,
    /**
     * Get the post-notes position which is located at after the note heads.
     */
    PostNotes,
    /**
     * Get the end-beat position which is located at the end of the beat. This position is almost
     * equal to the pre-notes position of the next beat.
     */
    EndBeat
}
