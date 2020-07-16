import { Staff } from '@src/model/Staff';

/**
 * A chord definition.
 */
export class Chord {
    /**
     * Gets or sets the name of the chord
     */
    public name: string = '';

    /**
     * Indicates the first fret of the chord diagram.
     */
    public firstFret: number = 1;

    /**
     * Gets or sets the frets played on the individual strings for this chord.
     * - The order in this list goes from the highest string to the lowest string.
     * - -1 indicates that the string is not played.
     */
    public strings: number[] = [];

    /**
     * Gets or sets a list of frets where the finger should hold a barre
     */
    public barreFrets: number[] = [];

    /**
     * Gets or sets the staff the chord belongs to.
     */
    public staff!: Staff;

    /**
     * Gets or sets whether the chord name is shown above the chord diagram.
     */
    public showName: boolean = true;

    /**
     * Gets or sets whether the chord diagram is shown.
     */
    public showDiagram: boolean = true;

    /**
     * Gets or sets whether the fingering is shown below the chord diagram.
     */
    public showFingering: boolean = true;

    public static copyTo(src: Chord, dst: Chord): void {
        dst.firstFret = src.firstFret;
        dst.name = src.name;
        dst.strings = src.strings.slice(0);
        dst.barreFrets = src.barreFrets.slice(0);
        dst.showName = src.showName;
        dst.showDiagram = src.showDiagram;
        dst.showFingering = src.showFingering;
    }
}
