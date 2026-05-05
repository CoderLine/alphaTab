/**
 * Defines named vertical positions for rests on a standard 5-line staff,
 * expressed as steps in alphaTab's internal coordinate system.
 * Use these values with {@link EngravingSettings.restPositionMain} and
 * {@link EngravingSettings.restPositionSecondary}.
 * @public
 */

/*
 * The settings assume a 5 line staff or lower and are adjusted proportionally within ScoreBeatGlypth._createRestGlyphs()
 * based upon the renderer.bar.staff.standardNotationLineCount value
 */
export enum RestPosition {
    /**
     * Bottom line of the staff (line 1 in standard notation).
     */
    Line1 = 8.5,
    /**
     * Space between line 1 and line 2.
     */
    Line1Space = 7.5,
    /**
     * Second line from the bottom.
     */
    Line2 = 6.5,
    /**
     * Space between line 2 and line 3.
     */
    Line2Space = 5.5,
    /**
     * Middle line of the staff.
     */
    Line3 = 4.5,
    /**
     * Space between line 3 and line 4.
     */
    Line3Space = 3.5,
    /**
     * Second line from the top.
     */
    Line4 = 2.5,
    /**
     * Space between line 4 and line 5.
     */
    Line4Space = 1.5,
    /**
     * Top line of the staff (line 5 in standard notation).
     */
    Line5 = 0.5,
    /**
     * Space above the top line.
     */
    Line5Space = -0.5
}
