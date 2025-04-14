/**
 * Lists all types of grace notes
 */
export enum GraceType {
    /**
     * No grace, normal beat.
     */
    None = 0,
    /**
     * The beat contains on-beat grace notes.
     */
    OnBeat = 1,
    /**
     * The beat contains before-beat grace notes.
     */
    BeforeBeat = 2,
    /**
     * The beat contains very special bend-grace notes used in SongBook style displays.
     */
    BendGrace = 3
}
