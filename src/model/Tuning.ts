/**
 * This public class represents a predefined string tuning.
 * @json
 */
export class Tuning {
    private static _sevenStrings: Tuning[] = [];
    private static _sixStrings: Tuning[] = [];
    private static _fiveStrings: Tuning[] = [];
    private static _fourStrings: Tuning[] = [];
    private static _defaultTunings: Map<number, Tuning> = new Map();

    public static readonly defaultAccidentals: string[] = ['', '#', '', '#', '', '', '#', '', '#', '', '#', ''];
    public static readonly defaultSteps: string[] = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];

    public static getTextForTuning(tuning: number, includeOctave: boolean): string {
        let parts = Tuning.getTextPartsForTuning(tuning);
        return includeOctave ? parts.join('') : parts[0];
    }

    public static getTextPartsForTuning(tuning: number, octaveShift: number = -1): string[] {
        let octave: number = (tuning / 12) | 0;
        let note: number = tuning % 12;
        let notes: string[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        return [notes[note], (octave + octaveShift).toString()];
    }

    /**
     * Gets the default tuning for the given string count.
     * @param stringCount The string count.
     * @returns The tuning for the given string count or null if the string count is not defined.
     */
    public static getDefaultTuningFor(stringCount: number): Tuning | null {
        if (Tuning._defaultTunings.has(stringCount)) {
            return Tuning._defaultTunings.get(stringCount)!;
        }
        return null;
    }

    /**
     * Gets a list of all tuning presets for a given stirng count.
     * @param stringCount The string count.
     * @returns The list of known tunings for the given string count or an empty list if the string count is not defined.
     */
    public static getPresetsFor(stringCount: number): Tuning[] {
        switch (stringCount) {
            case 7:
                return Tuning._sevenStrings;
            case 6:
                return Tuning._sixStrings;
            case 5:
                return Tuning._fiveStrings;
            case 4:
                return Tuning._fourStrings;
        }
        return [];
    }

    public static initialize(): void {
        Tuning._defaultTunings.set(
            7,
            new Tuning('Guitar 7 strings', [64, 59, 55, 50, 45, 40, 35], true)
        );

        Tuning._sevenStrings.push(Tuning._defaultTunings.get(7)!);
        Tuning._defaultTunings.set(
            6,
            new Tuning('Guitar Standard Tuning', [64, 59, 55, 50, 45, 40], true)
        );

        Tuning._sixStrings.push(Tuning._defaultTunings.get(6)!);
        Tuning._sixStrings.push(new Tuning('Guitar Tune down ½ step', [63, 58, 54, 49, 44, 39], false));
        Tuning._sixStrings.push(new Tuning('Guitar Tune down 1 step', [62, 57, 53, 48, 43, 38], false));
        Tuning._sixStrings.push(new Tuning('Guitar Tune down 2 step', [60, 55, 51, 46, 41, 36], false));
        Tuning._sixStrings.push(new Tuning('Guitar Dropped D Tuning', [64, 59, 55, 50, 45, 38], false));
        Tuning._sixStrings.push(
            new Tuning('Guitar Dropped D Tuning variant', [64, 57, 55, 50, 45, 38], false)
        );
        Tuning._sixStrings.push(
            new Tuning('Guitar Double Dropped D Tuning', [62, 59, 55, 50, 45, 38], false)
        );
        Tuning._sixStrings.push(new Tuning('Guitar Dropped E Tuning', [66, 61, 57, 52, 47, 40], false));
        Tuning._sixStrings.push(new Tuning('Guitar Dropped C Tuning', [62, 57, 53, 48, 43, 36], false));
        Tuning._sixStrings.push(new Tuning('Guitar Open C Tuning', [64, 60, 55, 48, 43, 36], false));
        Tuning._sixStrings.push(new Tuning('Guitar Open Cm Tuning', [63, 60, 55, 48, 43, 36], false));
        Tuning._sixStrings.push(new Tuning('Guitar Open C6 Tuning', [64, 57, 55, 48, 43, 36], false));
        Tuning._sixStrings.push(
            new Tuning('Guitar Open Cmaj7 Tuning', [64, 59, 55, 52, 43, 36], false)
        );
        Tuning._sixStrings.push(new Tuning('Guitar Open D Tuning', [62, 57, 54, 50, 45, 38], false));
        Tuning._sixStrings.push(new Tuning('Guitar Open Dm Tuning', [62, 57, 53, 50, 45, 38], false));
        Tuning._sixStrings.push(new Tuning('Guitar Open D5 Tuning', [62, 57, 50, 50, 45, 38], false));
        Tuning._sixStrings.push(new Tuning('Guitar Open D6 Tuning', [62, 59, 54, 50, 45, 38], false));
        Tuning._sixStrings.push(
            new Tuning('Guitar Open Dsus4 Tuning', [62, 57, 55, 50, 45, 38], false)
        );
        Tuning._sixStrings.push(new Tuning('Guitar Open E Tuning', [64, 59, 56, 52, 47, 40], false));
        Tuning._sixStrings.push(new Tuning('Guitar Open Em Tuning', [64, 59, 55, 52, 47, 40], false));
        Tuning._sixStrings.push(
            new Tuning('Guitar Open Esus11 Tuning', [64, 59, 55, 52, 45, 40], false)
        );
        Tuning._sixStrings.push(new Tuning('Guitar Open F Tuning', [65, 60, 53, 48, 45, 41], false));
        Tuning._sixStrings.push(new Tuning('Guitar Open G Tuning', [62, 59, 55, 50, 43, 38], false));
        Tuning._sixStrings.push(new Tuning('Guitar Open Gm Tuning', [62, 58, 55, 50, 43, 38], false));
        Tuning._sixStrings.push(new Tuning('Guitar Open G6 Tuning', [64, 59, 55, 50, 43, 38], false));
        Tuning._sixStrings.push(
            new Tuning('Guitar Open Gsus4 Tuning', [62, 60, 55, 50, 43, 38], false)
        );
        Tuning._sixStrings.push(new Tuning('Guitar Open A Tuning', [64, 61, 57, 52, 45, 40], false));
        Tuning._sixStrings.push(new Tuning('Guitar Open Am Tuning', [64, 60, 57, 52, 45, 40], false));
        Tuning._sixStrings.push(new Tuning('Guitar Nashville Tuning', [64, 59, 67, 62, 57, 52], false));
        Tuning._sixStrings.push(new Tuning('Bass 6 Strings Tuning', [48, 43, 38, 33, 28, 23], false));
        Tuning._sixStrings.push(new Tuning('Lute or Vihuela Tuning', [64, 59, 54, 50, 45, 40], false));

        Tuning._defaultTunings.set(5, new Tuning('Bass 5 Strings Tuning', [43, 38, 33, 28, 23], true));
        Tuning._fiveStrings.push(Tuning._defaultTunings.get(5)!);
        Tuning._fiveStrings.push(new Tuning('Banjo Dropped C Tuning', [62, 59, 55, 48, 67], false));
        Tuning._fiveStrings.push(new Tuning('Banjo Open D Tuning', [62, 57, 54, 50, 69], false));
        Tuning._fiveStrings.push(new Tuning('Banjo Open G Tuning', [62, 59, 55, 50, 67], false));
        Tuning._fiveStrings.push(new Tuning('Banjo G Minor Tuning', [62, 58, 55, 50, 67], false));
        Tuning._fiveStrings.push(new Tuning('Banjo G Modal Tuning', [62, 57, 55, 50, 67], false));

        Tuning._defaultTunings.set(4, new Tuning('Bass Standard Tuning', [43, 38, 33, 28], true));
        Tuning._fourStrings.push(Tuning._defaultTunings.get(4)!);
        Tuning._fourStrings.push(new Tuning('Bass Tune down ½ step', [42, 37, 32, 27], false));
        Tuning._fourStrings.push(new Tuning('Bass Tune down 1 step', [41, 36, 31, 26], false));
        Tuning._fourStrings.push(new Tuning('Bass Tune down 2 step', [39, 34, 29, 24], false));
        Tuning._fourStrings.push(new Tuning('Bass Dropped D Tuning', [43, 38, 33, 26], false));
        Tuning._fourStrings.push(new Tuning('Ukulele C Tuning', [45, 40, 36, 43], false));
        Tuning._fourStrings.push(new Tuning('Ukulele G Tuning', [52, 47, 43, 38], false));
        Tuning._fourStrings.push(new Tuning('Mandolin Standard Tuning', [64, 57, 50, 43], false));
        Tuning._fourStrings.push(new Tuning('Mandolin or Violin Tuning', [76, 69, 62, 55], false));
        Tuning._fourStrings.push(new Tuning('Viola Tuning', [69, 62, 55, 48], false));
        Tuning._fourStrings.push(new Tuning('Cello Tuning', [57, 50, 43, 36], false));
    }

    /**
     * Tries to find a known tuning by a given list of tuning values.
     * @param strings The values defining the tuning.
     * @returns The known tuning.
     */
    public static findTuning(strings: number[]): Tuning | null {
        let tunings: Tuning[] = Tuning.getPresetsFor(strings.length);
        for (let t: number = 0, tc: number = tunings.length; t < tc; t++) {
            let tuning: Tuning = tunings[t];
            let equals: boolean = true;
            for (let i: number = 0, j: number = strings.length; i < j; i++) {
                if (strings[i] !== tuning.tunings[i]) {
                    equals = false;
                    break;
                }
            }
            if (equals) {
                return tuning;
            }
        }
        return null;
    }

    /**
     * Gets or sets whether this is the standard tuning for this number of strings.
     */
    public isStandard: boolean;

    /**
     * Gets or sets the name of the tuning.
     */
    public name: string;

    /**
     * Gets or sets the values for each string of the instrument.
     */
    public tunings: number[];

    /**
     * Initializes a new instance of the {@link Tuning} class.
     * @param name The name.
     * @param tuning The tuning.
     * @param isStandard if set to`true`[is standard].
     */
    public constructor(name: string = '', tuning: number[] | null = null, isStandard: boolean = false) {
        this.isStandard = isStandard;
        this.name = name;
        this.tunings = tuning ?? [];
    }

    /**
     * Tries to detect the name and standard flag of the tuning from a known tuning list based
     * on the string values. 
     */
    public finish() {
        const knownTuning = Tuning.findTuning(this.tunings);
        if (knownTuning) {
            this.name = knownTuning.name;
            this.isStandard = knownTuning.isStandard;
        }
        this.name = this.name.trim();
    }
}

Tuning.initialize();
