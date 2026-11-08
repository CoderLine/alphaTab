import { FormatError } from '@coderline/alphatab/FormatError';

/**
 * A pitch as it is written in notation: a diatonic step with an accidental in an octave.
 * Enharmonic spellings like `F#3` and `Gb3` share the same {@link value} but are distinct pitches.
 * Pitches are immutable, in JSON they are written as text like `F#3`.
 * @since 1.10.0
 * @json_immutable
 * @public
 */
export class SpelledPitch {
    private static readonly _stepSemitones: number[] = [0, 2, 4, 5, 7, 9, 11];
    private static readonly _stepNames: string[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    // indexed by chroma
    private static readonly _sharpPreferredSteps: number[] = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
    private static readonly _flatPreferredSteps: number[] = [0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6];
    // indexed by chroma, for allocation free formatting of the preferred spellings
    private static readonly _sharpPreferredNames: string[] = [
        'C',
        'C#',
        'D',
        'D#',
        'E',
        'F',
        'F#',
        'G',
        'G#',
        'A',
        'A#',
        'B'
    ];
    private static readonly _flatPreferredNames: string[] = [
        'C',
        'Db',
        'D',
        'Eb',
        'E',
        'F',
        'Gb',
        'G',
        'Ab',
        'A',
        'Bb',
        'B'
    ];

    // indexed by step * 5 + alter + 2
    private static readonly _displayNames: string[] = SpelledPitch._buildDisplayNames();

    /**
     * The diatonic step (letter) of the pitch: 0 = C, 1 = D, 2 = E, 3 = F, 4 = G, 5 = A, 6 = B.
     * @since 1.10.0
     */
    public readonly step: number;

    /**
     * The accidental of the pitch in semitones: -2 = double flat, -1 = flat, 0 = natural, 1 = sharp, 2 = double sharp.
     * @since 1.10.0
     */
    public readonly alter: number;

    /**
     * The octave of the written step in scientific pitch notation (`C4` is the middle C).
     * The accidental does not change the octave: `B#3` sounds like `C4` and `Cb4` sounds like `B3`.
     * @since 1.10.0
     */
    public readonly octave: number;

    /**
     * Initializes a new instance of the {@link SpelledPitch} class.
     * @param step The diatonic step (0 = C ... 6 = B).
     * @param alter The accidental in semitones.
     * @param octave The octave of the written step.
     * @since 1.10.0
     */
    public constructor(step: number = 0, alter: number = 0, octave: number = 0) {
        this.step = step;
        this.alter = alter;
        this.octave = octave;
    }

    /**
     * The MIDI value of the pitch (`C4` = 60).
     * @since 1.10.0
     */
    public get value(): number {
        return (this.octave + 1) * 12 + SpelledPitch._stepSemitones[this.step] + this.alter;
    }

    /**
     * The pitch class of the pitch in the range 0-11 (C = 0, C#/Db = 1 ... B = 11).
     * @since 1.10.0
     */
    public get chroma(): number {
        return SpelledPitch._floorMod(SpelledPitch._stepSemitones[this.step] + this.alter, 12);
    }

    /**
     * The written name of the pitch without octave, like `C`, `F#` or `Bbb`.
     * @since 1.10.0
     */
    public toNameString(): string {
        return SpelledPitch._stepNames[this.step] + SpelledPitch.accidentalText(this.alter);
    }

    /**
     * The written name of the pitch with octave, like `C4`, `F#3` or `Bbb2`.
     */
    public toString(): string {
        return this.toNameString() + this.octave.toString();
    }

    /**
     * The written name of the pitch without octave with the accidental as music symbol character, like `F♯`.
     * @internal
     */
    public toDisplayNameString(): string {
        if (this.alter < -2 || this.alter > 2) {
            return this.toNameString();
        }
        return SpelledPitch._displayNames[this.step * 5 + this.alter + 2];
    }

    private static _buildDisplayNames(): string[] {
        // double flat, flat, natural, sharp, double sharp
        const accidentals = ['\uD834\uDD2B', '\u266D', '', '\u266F', '\uD834\uDD2A'];
        const names: string[] = [];
        for (const step of SpelledPitch._stepNames) {
            for (const accidental of accidentals) {
                names.push(step + accidental);
            }
        }
        return names;
    }

    /**
     * Creates a pitch from its JSON representation: the written name with octave like `F#3`,
     * or a MIDI value which is spelled with flats.
     * @internal
     */
    public static fromJson(v: unknown): SpelledPitch | null {
        if (v === null || v === undefined) {
            return null;
        }

        if (v instanceof SpelledPitch) {
            return v;
        }

        switch (typeof v) {
            case 'number':
                return SpelledPitch.fromValue(v as number, true);
            case 'string': {
                const pitch = SpelledPitch._parseName(v as string);
                if (pitch !== null) {
                    return pitch;
                }
                break;
            }
        }
        throw new FormatError('Unsupported format for spelled pitch');
    }

    /**
     * @internal
     */
    public static toJson(obj: SpelledPitch | null): string | null {
        return obj === null ? null : obj.toString();
    }

    /**
     * Parses the text written by {@link toString}.
     */
    private static _parseName(text: string): SpelledPitch | null {
        if (text.length < 2) {
            return null;
        }
        const step = SpelledPitch.stepForLetter(text.charCodeAt(0));
        if (step < 0) {
            return null;
        }

        let i = 1;
        let alter = 0;
        while (i < text.length && text.charCodeAt(i) === 0x23 /* # */) {
            alter++;
            i++;
        }
        if (alter === 0) {
            while (i < text.length && text.charCodeAt(i) === 0x62 /* b */) {
                alter--;
                i++;
            }
        }
        if (alter < -2 || alter > 2) {
            return null;
        }

        const octaveStart = i;
        if (i < text.length && text.charCodeAt(i) === 0x2d /* - */) {
            i++;
        }
        if (i === text.length) {
            return null;
        }
        while (i < text.length) {
            const c = text.charCodeAt(i);
            if (c < 0x30 || c > 0x39) {
                return null;
            }
            i++;
        }

        return new SpelledPitch(step, alter, Number.parseInt(text.substring(octaveStart), 10));
    }

    /**
     * Creates the pitch for the given MIDI value, spelled with a sharp or a flat when it is not a natural pitch.
     * Fractional values are truncated.
     * @internal
     */
    public static fromValue(value: number, preferFlat: boolean): SpelledPitch {
        const v = value | 0;
        const chroma = SpelledPitch._floorMod(v, 12);
        const step = preferFlat ? SpelledPitch._flatPreferredSteps[chroma] : SpelledPitch._sharpPreferredSteps[chroma];
        return new SpelledPitch(step, chroma - SpelledPitch._stepSemitones[step], Math.floor(v / 12) - 1);
    }

    /**
     * Formats the given MIDI value like {@link fromValue} followed by {@link toString} without creating the pitch.
     * @internal
     */
    public static formatValue(value: number, includeOctave: boolean, preferFlat: boolean): string {
        const v = value | 0;
        const chroma = SpelledPitch._floorMod(v, 12);
        const name = preferFlat ? SpelledPitch._flatPreferredNames[chroma] : SpelledPitch._sharpPreferredNames[chroma];
        return includeOctave ? name + (Math.floor(v / 12) - 1).toString() : name;
    }

    /**
     * The semitone offset of the given step within the octave (C = 0, D = 2 ... B = 11).
     * @internal
     */
    public static stepSemitones(step: number): number {
        return SpelledPitch._stepSemitones[step];
    }

    /**
     * The uppercase letter of the given step.
     * @internal
     */
    public static stepName(step: number): string {
        return SpelledPitch._stepNames[step];
    }

    /**
     * The step for the given letter (case insensitive) as character code, or -1 if it is no step letter.
     * @internal
     */
    public static stepForLetter(charCode: number): number {
        switch (charCode) {
            case 0x43 /* C */:
            case 0x63 /* c */:
                return 0;
            case 0x44 /* D */:
            case 0x64 /* d */:
                return 1;
            case 0x45 /* E */:
            case 0x65 /* e */:
                return 2;
            case 0x46 /* F */:
            case 0x66 /* f */:
                return 3;
            case 0x47 /* G */:
            case 0x67 /* g */:
                return 4;
            case 0x41 /* A */:
            case 0x61 /* a */:
                return 5;
            case 0x42 /* B */:
            case 0x62 /* b */:
                return 6;
        }
        return -1;
    }

    /**
     * The preferred step for the given pitch class when spelling with sharps or flats.
     * @internal
     */
    public static preferredStep(chroma: number, preferFlat: boolean): number {
        return preferFlat ? SpelledPitch._flatPreferredSteps[chroma] : SpelledPitch._sharpPreferredSteps[chroma];
    }

    /**
     * The textual accidental for the given alter (`bb`, `b`, empty, `#`, `##`).
     * @internal
     */
    public static accidentalText(alter: number): string {
        switch (alter) {
            case -2:
                return 'bb';
            case -1:
                return 'b';
            case 1:
                return '#';
            case 2:
                return '##';
        }
        return '';
    }

    private static _floorMod(a: number, b: number): number {
        return a - b * Math.floor(a / b);
    }
}
