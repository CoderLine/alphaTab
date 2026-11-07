/**
 * A raw grid cell of a TablEdit file, with the cell codes and flags both format generations share.
 * @internal
 */
export class TefCell {
    public static readonly typeMask = 0x3f;
    public static readonly rest = 0x33;
    public static readonly graceFlag = 0x40;
    public static readonly pitchChangeFlag = 0x80;

    public static readonly chordMarker = 0x35;
    public static readonly lineBreakMarker = 0x36;
    public static readonly accentMarker = 0x37;
    public static readonly crescendoMarker = 0x38;
    public static readonly textMarker = 0x39;
    public static readonly connectionMarker = 0x3d;
    public static readonly fingeringMarker = 0x3e;
    public static readonly extensionMarker = 0x7d;
    public static readonly patchMarker = 0x7e;
    public static readonly symbolMarker = 0xb6;
    public static readonly readingGuideMarker = 0xb7;
    public static readonly syncopationMarker = 0xfd;
    public static readonly tempoMarker = 0xfe;

    public static readonly restHiddenInNotationFlag = 0x01;
    public static readonly restHiddenInTabFlag = 0x20;
    public static readonly excludeFromBeaming = 0x08;
    public static readonly ottavaMask = 0x44;
    public static readonly ottavaBassa = 0x40;
    public static readonly ottavaAlta = 0x44;

    /**
     * The grid position in 1/64 notes from the start of the piece.
     */
    public position: number = 0;
    /**
     * The string row counted over all instruments.
     */
    public row: number = 0;
    public data!: Uint8Array;
}
