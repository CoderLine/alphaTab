/**
 * Lists all dynamics.
 */
export enum DynamicValue {
    // common dynamics
    /**
     * pianississimo (very very soft)
     */
    PPP = 0,
    /**
     * pianissimo (very soft)
     */
    PP = 1,
    /**
     * piano (soft)
     */
    P = 2,
    /**
     * mezzo-piano (half soft)
     */
    MP = 3,
    /**
     * mezzo-forte (half loud)
     */
    MF = 4,
    /**
     * forte (loud)
     */
    F = 5,
    /**
     * fortissimo (very loud)
     */
    FF = 6,
    /**
     * fortississimo (very very loud)
     */
    FFF = 7,

    // special dynamics

    PPPP = 8,
    PPPPP = 9,
    PPPPPP = 10,

    FFFF = 11,
    FFFFF = 12,
    FFFFFF = 13,

    /**
     * Sforzando
     */
    SF = 14,
    /**
     * SforzandoPiano
     */
    SFP = 15,
    /**
     * SforzandoPianissimo
     */
    SFPP = 16,

    /**
     * FortePiano
     */
    FP = 17,

    /**
     * Rinforzando 1
     */
    RF = 18,
    /**
     * Rinforzando 2
     */
    RFZ = 19,

    /**
     * Sforzato
     */
    SFZ = 20,
    /**
     * SforzatoFF
     */
    SFFZ = 21,
    /**
     * Forzando
     */
    FZ = 22,
    /**
     * Niente
     */
    N = 23,

    /**
     * Poco forte
     */
    PF = 24,

    /**
     * SforzatoPiano
     */
    SFZP = 25
}
