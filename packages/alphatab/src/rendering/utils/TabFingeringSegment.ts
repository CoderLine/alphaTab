import type { Note } from '@coderline/alphatab/model/Note';

/**
 * The display fingering (string, fret, harmonic node) of all notes of a run of bars of one staff,
 * as decided by {@link TabFingeringSolver}. Values are only meaningful for stringed notes of the bars
 * from {@link firstBarIndex} to {@link lastBarIndex}.
 * @internal
 */
export class TabFingeringSegment {
    /**
     * The note is displayed on another string than in the model.
     */
    public static readonly flagMoved: number = 1;
    /**
     * No position on the tuning can play the note, it keeps its model string with an out of range fret.
     */
    public static readonly flagUnplayable: number = 2;
    /**
     * A natural harmonic without a matching node, displayed as artificial harmonic an octave above the fret.
     */
    public static readonly flagAsArtificial: number = 4;

    public readonly firstBarIndex: number;
    public readonly lastBarIndex: number;

    private readonly _barVoiceBase: Int32Array;
    private readonly _voiceBeatBase: Int32Array;
    private readonly _beatNoteBase: Int32Array;
    private readonly _strings: Uint8Array;
    private readonly _frets: Int16Array;
    private readonly _nodes: Int8Array;
    private readonly _flags: Uint8Array;

    public constructor(
        firstBarIndex: number,
        lastBarIndex: number,
        barVoiceBase: Int32Array,
        voiceBeatBase: Int32Array,
        beatNoteBase: Int32Array,
        noteCount: number
    ) {
        this.firstBarIndex = firstBarIndex;
        this.lastBarIndex = lastBarIndex;
        this._barVoiceBase = barVoiceBase;
        this._voiceBeatBase = voiceBeatBase;
        this._beatNoteBase = beatNoteBase;
        this._strings = new Uint8Array(noteCount);
        this._frets = new Int16Array(noteCount);
        this._nodes = new Int8Array(noteCount);
        this._nodes.fill(-1);
        this._flags = new Uint8Array(noteCount);
    }

    public covers(barIndex: number): boolean {
        return barIndex >= this.firstBarIndex && barIndex <= this.lastBarIndex;
    }

    public noteIndex(note: Note): number {
        const beat = note.beat;
        const voice = beat.voice;
        const voiceIndex = this._barVoiceBase[voice.bar.index - this.firstBarIndex] + voice.index;
        return this._beatNoteBase[this._voiceBeatBase[voiceIndex] + beat.index] + note.index;
    }

    public getString(note: Note): number {
        return this._strings[this.noteIndex(note)];
    }

    public getFret(note: Note): number {
        return this._frets[this.noteIndex(note)];
    }

    /**
     * The index into {@link TabFingeringSolver.naturalNodeValues} for natural harmonics, -1 otherwise.
     */
    public getNode(note: Note): number {
        return this._nodes[this.noteIndex(note)];
    }

    public getFlags(note: Note): number {
        return this._flags[this.noteIndex(note)];
    }

    public set(index: number, str: number, fret: number, node: number, flags: number): void {
        this._strings[index] = str;
        this._frets[index] = fret;
        this._nodes[index] = node;
        this._flags[index] = flags;
    }
}
