/**
 * This public class represents a predefined string tuning.
 */
export class Tuning {
    private static _sevenStrings: Tuning[] = [];
    private static _sixStrings: Tuning[] = [];
    private static _fiveStrings: Tuning[] = [];
    private static _fourStrings: Tuning[] = [];
    private static _defaultTunings: Map<number, Tuning> = new Map();

    public static getTextForTuning(tuning: number, includeOctave: boolean): string {
        let octave: number = (tuning / 12) | 0;
        let note: number = tuning % 12;
        let notes: string[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        let result: string = notes[note];
        if (includeOctave) {
            result += octave - 1;
        }
        return result;
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
            new Tuning('Guitar 7 strings', new Int32Array([64, 59, 55, 50, 45, 40, 35]), true)
        );

        Tuning._sevenStrings.push(Tuning._defaultTunings.get(7)!);
        Tuning._defaultTunings.set(
            6,
            new Tuning('Guitar Standard Tuning', new Int32Array([64, 59, 55, 50, 45, 40]), true)
        );

        Tuning._sixStrings.push(Tuning._defaultTunings.get(6)!);
        Tuning._sixStrings.push(new Tuning('Guitar Tune down ½ step', new Int32Array([63, 58, 54, 49, 44, 39]), false));
        Tuning._sixStrings.push(new Tuning('Guitar Tune down 1 step', new Int32Array([62, 57, 53, 48, 43, 38]), false));
        Tuning._sixStrings.push(new Tuning('Guitar Tune down 2 step', new Int32Array([60, 55, 51, 46, 41, 36]), false));
        Tuning._sixStrings.push(new Tuning('Guitar Dropped D Tuning', new Int32Array([64, 59, 55, 50, 45, 38]), false));
        Tuning._sixStrings.push(
            new Tuning('Guitar Dropped D Tuning variant', new Int32Array([64, 57, 55, 50, 45, 38]), false)
        );
        Tuning._sixStrings.push(
            new Tuning('Guitar Double Dropped D Tuning', new Int32Array([62, 59, 55, 50, 45, 38]), false)
        );
        Tuning._sixStrings.push(new Tuning('Guitar Dropped E Tuning', new Int32Array([66, 61, 57, 52, 47, 40]), false));
        Tuning._sixStrings.push(new Tuning('Guitar Dropped C Tuning', new Int32Array([62, 57, 53, 48, 43, 36]), false));
        Tuning._sixStrings.push(new Tuning('Guitar Open C Tuning', new Int32Array([64, 60, 55, 48, 43, 36]), false));
        Tuning._sixStrings.push(new Tuning('Guitar Open Cm Tuning', new Int32Array([63, 60, 55, 48, 43, 36]), false));
        Tuning._sixStrings.push(new Tuning('Guitar Open C6 Tuning', new Int32Array([64, 57, 55, 48, 43, 36]), false));
        Tuning._sixStrings.push(
            new Tuning('Guitar Open Cmaj7 Tuning', new Int32Array([64, 59, 55, 52, 43, 36]), false)
        );
        Tuning._sixStrings.push(new Tuning('Guitar Open D Tuning', new Int32Array([62, 57, 54, 50, 45, 38]), false));
        Tuning._sixStrings.push(new Tuning('Guitar Open Dm Tuning', new Int32Array([62, 57, 53, 50, 45, 38]), false));
        Tuning._sixStrings.push(new Tuning('Guitar Open D5 Tuning', new Int32Array([62, 57, 50, 50, 45, 38]), false));
        Tuning._sixStrings.push(new Tuning('Guitar Open D6 Tuning', new Int32Array([62, 59, 54, 50, 45, 38]), false));
        Tuning._sixStrings.push(
            new Tuning('Guitar Open Dsus4 Tuning', new Int32Array([62, 57, 55, 50, 45, 38]), false)
        );
        Tuning._sixStrings.push(new Tuning('Guitar Open E Tuning', new Int32Array([64, 59, 56, 52, 47, 40]), false));
        Tuning._sixStrings.push(new Tuning('Guitar Open Em Tuning', new Int32Array([64, 59, 55, 52, 47, 40]), false));
        Tuning._sixStrings.push(
            new Tuning('Guitar Open Esus11 Tuning', new Int32Array([64, 59, 55, 52, 45, 40]), false)
        );
        Tuning._sixStrings.push(new Tuning('Guitar Open F Tuning', new Int32Array([65, 60, 53, 48, 45, 41]), false));
        Tuning._sixStrings.push(new Tuning('Guitar Open G Tuning', new Int32Array([62, 59, 55, 50, 43, 38]), false));
        Tuning._sixStrings.push(new Tuning('Guitar Open Gm Tuning', new Int32Array([62, 58, 55, 50, 43, 38]), false));
        Tuning._sixStrings.push(new Tuning('Guitar Open G6 Tuning', new Int32Array([64, 59, 55, 50, 43, 38]), false));
        Tuning._sixStrings.push(
            new Tuning('Guitar Open Gsus4 Tuning', new Int32Array([62, 60, 55, 50, 43, 38]), false)
        );
        Tuning._sixStrings.push(new Tuning('Guitar Open A Tuning', new Int32Array([64, 61, 57, 52, 45, 40]), false));
        Tuning._sixStrings.push(new Tuning('Guitar Open Am Tuning', new Int32Array([64, 60, 57, 52, 45, 40]), false));
        Tuning._sixStrings.push(new Tuning('Guitar Nashville Tuning', new Int32Array([64, 59, 67, 62, 57, 52]), false));
        Tuning._sixStrings.push(new Tuning('Bass 6 Strings Tuning', new Int32Array([48, 43, 38, 33, 28, 23]), false));
        Tuning._sixStrings.push(new Tuning('Lute or Vihuela Tuning', new Int32Array([64, 59, 54, 50, 45, 40]), false));

        Tuning._defaultTunings.set(5, new Tuning('Bass 5 Strings Tuning', new Int32Array([43, 38, 33, 28, 23]), true));
        Tuning._fiveStrings.push(Tuning._defaultTunings.get(5)!);
        Tuning._fiveStrings.push(new Tuning('Banjo Dropped C Tuning', new Int32Array([62, 59, 55, 48, 67]), false));
        Tuning._fiveStrings.push(new Tuning('Banjo Open D Tuning', new Int32Array([62, 57, 54, 50, 69]), false));
        Tuning._fiveStrings.push(new Tuning('Banjo Open G Tuning', new Int32Array([62, 59, 55, 50, 67]), false));
        Tuning._fiveStrings.push(new Tuning('Banjo G Minor Tuning', new Int32Array([62, 58, 55, 50, 67]), false));
        Tuning._fiveStrings.push(new Tuning('Banjo G Modal Tuning', new Int32Array([62, 57, 55, 50, 67]), false));

        Tuning._defaultTunings.set(4, new Tuning('Bass Standard Tuning', new Int32Array([43, 38, 33, 28]), true));
        Tuning._fourStrings.push(Tuning._defaultTunings.get(4)!);
        Tuning._fourStrings.push(new Tuning('Bass Tune down ½ step', new Int32Array([42, 37, 32, 27]), false));
        Tuning._fourStrings.push(new Tuning('Bass Tune down 1 step', new Int32Array([41, 36, 31, 26]), false));
        Tuning._fourStrings.push(new Tuning('Bass Tune down 2 step', new Int32Array([39, 34, 29, 24]), false));
        Tuning._fourStrings.push(new Tuning('Bass Dropped D Tuning', new Int32Array([43, 38, 33, 26]), false));
        Tuning._fourStrings.push(new Tuning('Ukulele C Tuning', new Int32Array([45, 40, 36, 43]), false));
        Tuning._fourStrings.push(new Tuning('Ukulele G Tuning', new Int32Array([52, 47, 43, 38]), false));
        Tuning._fourStrings.push(new Tuning('Mandolin Standard Tuning', new Int32Array([64, 57, 50, 43]), false));
        Tuning._fourStrings.push(new Tuning('Mandolin or Violin Tuning', new Int32Array([76, 69, 62, 55]), false));
        Tuning._fourStrings.push(new Tuning('Viola Tuning', new Int32Array([69, 62, 55, 48]), false));
        Tuning._fourStrings.push(new Tuning('Cello Tuning', new Int32Array([57, 50, 43, 36]), false));
    }

    /**
     * Tries to find a known tuning by a given list of tuning values.
     * @param strings The values defining the tuning.
     * @returns The known tuning.
     */
    public static findTuning(strings: Int32Array): Tuning | null {
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
    public tunings: Int32Array;

    /**
     * Initializes a new instance of the {@link Tuning} class.
     * @param name The name.
     * @param tuning The tuning.
     * @param isStandard if set to`true`[is standard].
     */
    public constructor(name: string, tuning: Int32Array, isStandard: boolean) {
        this.isStandard = isStandard;
        this.name = name;
        this.tunings = tuning;
    }
}

Tuning.initialize();
