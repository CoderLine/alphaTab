/**
 * Lists all types of grace notes
 */
export enum GraceType {
    /**
     * No grace, normal beat.
     */
    None,
    /**
     * The beat contains on-beat grace notes.
     */
    OnBeat,
    /**
     * The beat contains before-beat grace notes.
     */
    BeforeBeat,
    /**
     * The beat contains very special bend-grace notes used in SongBook style displays.
     */
    BendGrace
}
