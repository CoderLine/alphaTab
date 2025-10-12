import { Beat } from '@src/model/Beat';
import type { Duration } from '@src/model/Duration';
import { HeaderFooterStyle, type Score, ScoreStyle, type ScoreSubElement } from '@src/model/Score';
import type { Settings } from '@src/Settings';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { MasterBar } from '@src/model/MasterBar';
import type { Track } from '@src/model/Track';
import { SynthConstants } from '@src/synth/SynthConstants';
import { Bar } from '@src/model/Bar';
import { Voice } from '@src/model/Voice';
import { Automation, AutomationType } from '@src/model/Automation';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { KeySignature } from '@src/model/KeySignature';
import { AccidentalType } from '@src/model/AccidentalType';

export class TuningParseResult {
    public note: string | null = null;
    public tone: TuningParseResultTone = new TuningParseResultTone();
    public octave: number = 0;

    public get realValue(): number {
        return this.octave * 12 + this.tone.noteValue;
    }
}

export class TuningParseResultTone {
    public noteValue: number;
    public accidentalMode: NoteAccidentalMode;
    public constructor(noteValue: number = 0, accidentalMode: NoteAccidentalMode = NoteAccidentalMode.Default) {
        this.noteValue = noteValue;
        this.accidentalMode = accidentalMode;
    }
}

/**
 * This public class contains some utilities for working with model public classes
 * @partial
 */
export class ModelUtils {
    public static getIndex(duration: Duration): number {
        const index: number = 0;
        const value: number = duration;
        if (value < 0) {
            return index;
        }
        return Math.log2(duration) | 0;
    }

    public static keySignatureIsFlat(ks: number): boolean {
        return ks < 0;
    }

    public static keySignatureIsNatural(ks: number): boolean {
        return ks === 0;
    }

    public static keySignatureIsSharp(ks: number): boolean {
        return ks > 0;
    }

    public static applyPitchOffsets(settings: Settings, score: Score): void {
        for (let i: number = 0; i < score.tracks.length; i++) {
            if (i < settings.notation.displayTranspositionPitches.length) {
                for (const staff of score.tracks[i].staves) {
                    staff.displayTranspositionPitch = -settings.notation.displayTranspositionPitches[i];
                }
            }
            if (i < settings.notation.transpositionPitches.length) {
                for (const staff of score.tracks[i].staves) {
                    staff.transpositionPitch = -settings.notation.transpositionPitches[i];
                }
            }
        }
    }

    /**
     * Checks if the given string is a tuning inticator.
     * @param name
     */
    public static isTuning(name: string): boolean {
        return !!ModelUtils.parseTuning(name);
    }

    private static readonly TuningLetters = new Set<number>([
        0x43 /* C */, 0x44 /* D */, 0x45 /* E */, 0x46 /* F */, 0x47 /* G */, 0x41 /* A */, 0x42 /* B */, 0x63 /* c */,
        0x64 /* d */, 0x65 /* e */, 0x66 /* f */, 0x67 /* g */, 0x61 /* a */, 0x62 /* b */, 0x23 /* # */
    ]);
    public static parseTuning(name: string): TuningParseResult | null {
        let note: string = '';
        let octave: string = '';
        for (let i: number = 0; i < name.length; i++) {
            const c: number = name.charCodeAt(i);
            if (c >= 0x30 && c <= 0x39 /* 0-9 */) {
                // number without note?
                if (!note) {
                    return null;
                }
                octave += String.fromCharCode(c);
            } else if (ModelUtils.TuningLetters.has(c)) {
                note += String.fromCharCode(c);
            } else {
                return null;
            }
        }
        if (!octave || !note) {
            return null;
        }
        const result: TuningParseResult = new TuningParseResult();

        result.octave = Number.parseInt(octave, 10) + 1;
        result.note = note.toLowerCase();
        result.tone = ModelUtils.getToneForText(result.note);

        // if tone.noteValue is negative (eg. on Cb note)
        // we adjust roll-over to a lower octave
        if (result.tone.noteValue < 0) {
            result.octave--;
            result.tone.noteValue += 12;
        }

        return result;
    }

    public static getTuningForText(str: string): number {
        const result: TuningParseResult | null = ModelUtils.parseTuning(str);
        if (!result) {
            return -1;
        }
        return result.realValue;
    }

    public static getToneForText(note: string): TuningParseResultTone {
        const noteName = note.substring(0, 1);
        const accidental = note.substring(1);

        let noteValue: number;
        let noteAccidenalMode: NoteAccidentalMode;

        switch (noteName.toLowerCase()) {
            case 'c':
                noteValue = 0;
                break;
            case 'd':
                noteValue = 2;
                break;
            case 'e':
                noteValue = 4;
                break;
            case 'f':
                noteValue = 5;
                break;
            case 'g':
                noteValue = 7;
                break;
            case 'a':
                noteValue = 9;
                break;
            case 'b':
                noteValue = 11;
                break;
            default:
                noteValue = 0;
                break;
        }

        noteAccidenalMode = ModelUtils.parseAccidentalMode(accidental);
        switch (noteAccidenalMode) {
            case NoteAccidentalMode.Default:
                break;
            case NoteAccidentalMode.ForceNone:
                break;
            case NoteAccidentalMode.ForceNatural:
                break;
            case NoteAccidentalMode.ForceSharp:
                noteValue++;
                break;
            case NoteAccidentalMode.ForceDoubleSharp:
                noteValue += 2;
                break;
            case NoteAccidentalMode.ForceFlat:
                noteValue--;
                break;
            case NoteAccidentalMode.ForceDoubleFlat:
                noteValue -= 2;
                break;
        }

        return new TuningParseResultTone(noteValue, noteAccidenalMode);
    }

    /**
     * @internal
     */
    public static readonly accidentalModeMapping = new Map<string, NoteAccidentalMode>([
        ['default', NoteAccidentalMode.Default],
        ['d', NoteAccidentalMode.Default],

        ['forcenone', NoteAccidentalMode.ForceNone],
        ['-', NoteAccidentalMode.ForceNone],

        ['forcenatural', NoteAccidentalMode.ForceNatural],
        ['n', NoteAccidentalMode.ForceNatural],

        ['forcesharp', NoteAccidentalMode.ForceSharp],
        ['#', NoteAccidentalMode.ForceSharp],

        ['forcedoublesharp', NoteAccidentalMode.ForceDoubleSharp],
        ['##', NoteAccidentalMode.ForceDoubleSharp],
        ['x', NoteAccidentalMode.ForceDoubleSharp],

        ['forceflat', NoteAccidentalMode.ForceFlat],
        ['b', NoteAccidentalMode.ForceFlat],

        ['forcedoubleflat', NoteAccidentalMode.ForceDoubleFlat],
        ['bb', NoteAccidentalMode.ForceDoubleFlat]
    ]);

    public static parseAccidentalMode(data: string): NoteAccidentalMode {
        const key = data.toLowerCase();
        if (ModelUtils.accidentalModeMapping.has(key)) {
            return ModelUtils.accidentalModeMapping.get(key)!;
        }
        return NoteAccidentalMode.Default;
    }

    public static newGuid(): string {
        return `${
            Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1) +
            Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1)
        }-${Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1)}-${Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1)}-${Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1)}-${Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1)}${Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1)}${Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1)}`;
    }

    public static isAlmostEqualTo(a: number, b: number): boolean {
        return Math.abs(a - b) < 0.00001;
    }

    public static toHexString(n: number, digits: number = 0): string {
        let s: string = '';
        const hexChars: string = '0123456789ABCDEF';
        do {
            s = String.fromCharCode(hexChars.charCodeAt(n & 15)) + s;
            n = n >> 4;
        } while (n > 0);
        while (s.length < digits) {
            s = `0${s}`;
        }
        return s;
    }

    /**
     * Gets the list of alternate endings on which the master bar is played.
     * @param bitflag The alternate endings bitflag.
     */
    public static getAlternateEndingsList(bitflag: number): number[] {
        const endings: number[] = [];
        for (let i: number = 0; i < MasterBar.MaxAlternateEndings; i++) {
            if ((bitflag & (0x01 << i)) !== 0) {
                endings.push(i);
            }
        }
        return endings;
    }

    public static deltaFretToHarmonicValue(deltaFret: number): number {
        switch (deltaFret) {
            case 2:
                return 2.4;
            case 3:
                return 3.2;
            case 4:
            case 5:
            case 7:
            case 9:
            case 12:
            case 16:
            case 17:
            case 19:
            case 24:
                return deltaFret;
            case 8:
                return 8.2;
            case 10:
                return 9.6;
            case 14:
            case 15:
                return 14.7;
            case 21:
            case 22:
                return 21.7;
            default:
                return 12;
        }
    }

    public static clamp(value: number, min: number, max: number): number {
        if (value <= min) {
            return min;
        }
        if (value >= max) {
            return max;
        }
        return value;
    }

    public static buildMultiBarRestInfo(
        tracks: Track[] | null,
        startIndex: number,
        endIndexInclusive: number
    ): Map<number, number[]> | null {
        if (!tracks) {
            return null;
        }
        const stylesheet = tracks[0].score.stylesheet;
        const shouldDrawMultiBarRests: boolean =
            tracks.length > 1
                ? stylesheet.multiTrackMultiBarRest
                : stylesheet.perTrackMultiBarRest?.has(tracks[0].index) === true;
        if (!shouldDrawMultiBarRests) {
            return null;
        }

        const lookup = new Map<number, number[]>();

        const score = tracks[0].score;

        let currentIndex = startIndex;
        let tempo = score.tempo;
        while (currentIndex <= endIndexInclusive) {
            const currentGroupStartIndex = currentIndex;
            let currentGroup: number[] | null = null;

            while (currentIndex <= endIndexInclusive) {
                const masterBar = score.masterBars[currentIndex];

                let hasTempoChange = false;
                for (const a of masterBar.tempoAutomations) {
                    if (a.value !== tempo) {
                        hasTempoChange = true;
                    }
                    tempo = a.value;
                }

                // check if masterbar breaks multibar rests, it must be fully empty with no annotations
                if (
                    masterBar.alternateEndings ||
                    (masterBar.isRepeatStart && masterBar.index !== currentGroupStartIndex) ||
                    masterBar.isFreeTime ||
                    masterBar.isAnacrusis ||
                    masterBar.section !== null ||
                    (masterBar.index !== currentGroupStartIndex && hasTempoChange) ||
                    (masterBar.fermata !== null && masterBar.fermata.size > 0) ||
                    (masterBar.directions !== null && masterBar.directions.size > 0)
                ) {
                    break;
                }

                // check if masterbar breaks multibar rests because of change to previous
                if (
                    currentGroupStartIndex > startIndex &&
                    masterBar.previousMasterBar &&
                    (masterBar.timeSignatureCommon !== masterBar.previousMasterBar!.timeSignatureCommon ||
                        masterBar.timeSignatureNumerator !== masterBar.previousMasterBar!.timeSignatureNumerator ||
                        masterBar.timeSignatureDenominator !== masterBar.previousMasterBar!.timeSignatureDenominator ||
                        masterBar.tripletFeel !== masterBar.previousMasterBar!.tripletFeel)
                ) {
                    break;
                }

                // masterbar is good, now check bars across staves
                let areAllBarsSuitable = true;
                for (const t of tracks) {
                    for (const s of t.staves) {
                        const bar = s.bars[masterBar.index];

                        if (!bar.isRestOnly) {
                            areAllBarsSuitable = false;
                            break;
                        }

                        if (
                            bar.index > 0 &&
                            (bar.keySignature !== bar.previousBar!.keySignature ||
                                bar.keySignatureType !== bar.previousBar!.keySignatureType)
                        ) {
                            areAllBarsSuitable = false;
                            break;
                        }
                    }

                    if (!areAllBarsSuitable) {
                        break;
                    }
                }

                if (!areAllBarsSuitable) {
                    break;
                }

                // skip initial bar as it is not "additional" but we are checking it
                currentIndex++;
                if (masterBar.index > currentGroupStartIndex) {
                    if (currentGroup === null) {
                        currentGroup = [masterBar.index];
                    } else {
                        currentGroup.push(masterBar.index);
                    }
                }

                // special scenario -> repeat ends are included but then we stop
                if (masterBar.isRepeatEnd) {
                    break;
                }
            }

            if (currentGroup) {
                lookup.set(currentGroupStartIndex, currentGroup);
            } else {
                currentIndex++;
            }
        }

        return lookup;
    }

    public static computeFirstDisplayedBarIndex(score: Score, settings: Settings) {
        let startIndex: number = settings.display.startBar;
        startIndex--; // map to array index

        startIndex = Math.min(score.masterBars.length - 1, Math.max(0, startIndex));
        return startIndex;
    }

    public static computeLastDisplayedBarIndex(score: Score, settings: Settings, startIndex: number) {
        let endBarIndex: number = settings.display.barCount;
        if (endBarIndex < 0) {
            endBarIndex = score.masterBars.length;
        }
        endBarIndex = startIndex + endBarIndex - 1; // map count to array index

        endBarIndex = Math.min(score.masterBars.length - 1, Math.max(0, endBarIndex));
        return endBarIndex;
    }

    public static getOrCreateHeaderFooterStyle(score: Score, element: ScoreSubElement) {
        let style = score.style;
        if (!score.style) {
            style = new ScoreStyle();
            score.style = style;
        }

        let headerFooterStyle: HeaderFooterStyle;
        if (style!.headerAndFooter.has(element)) {
            headerFooterStyle = style!.headerAndFooter.get(element)!;
        } else {
            headerFooterStyle = new HeaderFooterStyle();

            if (ScoreStyle.defaultHeaderAndFooter.has(element)) {
                const defaults = ScoreStyle.defaultHeaderAndFooter.get(element)!;
                headerFooterStyle.template = defaults.template;
                headerFooterStyle.textAlign = defaults.textAlign;
            }

            style!.headerAndFooter.set(element, headerFooterStyle);
        }

        return headerFooterStyle;
    }

    /**
     * Performs some general consolidations of inconsistencies on the given score like
     * missing bars, beats, duplicated midi channels etc
     */
    public static consolidate(score: Score) {
        // empty score?
        if (score.masterBars.length === 0) {
            const master: MasterBar = new MasterBar();
            score.addMasterBar(master);

            const tempoAutomation = new Automation();
            tempoAutomation.isLinear = false;
            tempoAutomation.type = AutomationType.Tempo;
            tempoAutomation.value = score.tempo;
            master.tempoAutomations.push(tempoAutomation);

            const bar: Bar = new Bar();
            score.tracks[0].staves[0].addBar(bar);

            const v = new Voice();
            bar.addVoice(v);

            const emptyBeat: Beat = new Beat();
            emptyBeat.isEmpty = true;
            v.addBeat(emptyBeat);
            return;
        }

        const usedChannels = new Set<number>([SynthConstants.PercussionChannel]);
        for (const track of score.tracks) {
            // ensure percussion channel
            if (track.staves.length === 1 && track.staves[0].isPercussion) {
                track.playbackInfo.primaryChannel = SynthConstants.PercussionChannel;
                track.playbackInfo.secondaryChannel = SynthConstants.PercussionChannel;
            } else {
                // unique midi channels and generate secondary channels
                if (track.playbackInfo.primaryChannel !== SynthConstants.PercussionChannel) {
                    while (usedChannels.has(track.playbackInfo.primaryChannel)) {
                        track.playbackInfo.primaryChannel++;
                    }
                }
                usedChannels.add(track.playbackInfo.primaryChannel);

                if (track.playbackInfo.secondaryChannel !== SynthConstants.PercussionChannel) {
                    while (usedChannels.has(track.playbackInfo.secondaryChannel)) {
                        track.playbackInfo.secondaryChannel++;
                    }
                }
                usedChannels.add(track.playbackInfo.secondaryChannel);
            }

            for (const staff of track.staves) {
                // fill empty beats
                for (const b of staff.bars) {
                    for (const v of b.voices) {
                        if (v.isEmpty && v.beats.length === 0) {
                            const emptyBeat: Beat = new Beat();
                            emptyBeat.isEmpty = true;
                            v.addBeat(emptyBeat);
                        }
                    }
                }

                // fill missing bars
                const voiceCount = staff.bars.length === 0 ? 1 : staff.bars[0].voices.length;
                while (staff.bars.length < score.masterBars.length) {
                    const bar: Bar = new Bar();
                    staff.addBar(bar);
                    const previousBar = bar.previousBar;
                    if (previousBar) {
                        bar.clef = previousBar.clef;
                        bar.clefOttava = previousBar.clefOttava;
                        bar.keySignature = bar.previousBar!.keySignature;
                        bar.keySignatureType = bar.previousBar!.keySignatureType;
                    }

                    for (let i = 0; i < voiceCount; i++) {
                        const v = new Voice();
                        bar.addVoice(v);

                        const emptyBeat: Beat = new Beat();
                        emptyBeat.isEmpty = true;
                        v.addBeat(emptyBeat);
                    }
                }
            }
        }

        // ensure first masterbar has a tempo automation for score tempo
        if (score.masterBars.length > 0) {
            const firstTempoAutomation = score.masterBars[0].tempoAutomations.find(
                a => a.type === AutomationType.Tempo && a.ratioPosition === 0
            );
            if (!firstTempoAutomation) {
                const tempoAutomation = new Automation();
                tempoAutomation.isLinear = false;
                tempoAutomation.type = AutomationType.Tempo;
                tempoAutomation.value = score.tempo;
                tempoAutomation.text = score.tempoLabel;
                tempoAutomation.isVisible = false;
                score.masterBars[0].tempoAutomations.push(tempoAutomation);
            }
        }
    }

    /**
     * Trims any empty bars at the end of the song.
     * @param score
     */
    public static trimEmptyBarsAtEnd(score: Score) {
        while (score.masterBars.length > 1) {
            const barIndex = score.masterBars.length - 1;
            const masterBar = score.masterBars[barIndex];

            if (masterBar.hasChanges) {
                return;
            }

            for (const track of score.tracks) {
                for (const staff of track.staves) {
                    if (barIndex < staff.bars.length) {
                        const bar = staff.bars[barIndex];
                        if (!bar.isEmpty || bar.hasChanges) {
                            // found a non-empty bar, stop whole cleanup
                            return;
                        }
                    }
                }
            }

            // if we reach here, all found bars are empty, remove the bar
            for (const track of score.tracks) {
                for (const staff of track.staves) {
                    if (barIndex < staff.bars.length) {
                        const bar = staff.bars[barIndex];
                        staff.bars.pop();
                        // unlink
                        bar.previousBar!.nextBar = null;
                    }
                }
            }

            score.masterBars.pop();
            masterBar.previousMasterBar!.nextMasterBar = null;
        }
    }

    private static allMusicFontSymbols: MusicFontSymbol[] = [];

    /**
     * Gets a list of all music font symbols used in alphaTab.
     */
    public static getAllMusicFontSymbols(): MusicFontSymbol[] {
        if (ModelUtils.allMusicFontSymbols.length === 0) {
            ModelUtils.allMusicFontSymbols = Object.values(MusicFontSymbol)
                .filter<any>((k: any) => typeof k === 'number')
                .map(v => v as number as MusicFontSymbol) as MusicFontSymbol[];
        }

        return ModelUtils.allMusicFontSymbols;
    }

    /**
     * Lists the display transpositions for some known midi instruments.
     * It is a common practice to transpose the standard notation for instruments like guitars.
     */
    public static readonly displayTranspositionPitches = new Map<number, number>([
        // guitar
        [24, -12],
        [25, -12],
        [26, -12],
        [27, -12],
        [28, -12],
        [29, -12],
        [30, -12],
        [31, -12],
        // bass
        [32, -12],
        [33, -12],
        [34, -12],
        [35, -12],
        [36, -12],
        [37, -12],
        [38, -12],
        [39, -12],
        // Contrabass
        [43, -12]
    ]);

    /**
     * @internal
     */
    public static flooredDivision(a: number, b: number): number {
        return a - b * Math.floor(a / b);
    }

    // NOTE: haven't figured out yet what exact formula is applied when transposing key signatures
    // this table is simply created by checking the Guitar Pro behavior,

    // The table is organized as [<transpose>][<key signature>] to match the table above
    // it's also easier to read as we list every key signature per row, transposed by the same value
    // this gives typically just a shifted list according to the transpose (with some special treatments)

    /**
     * Converts the key transpose table to actual key signatures.
     * @param texts An array where every item indicates the number of accidentals and which accidental
     * placed for the key signature.
     *
     * e.g. 3# is 3-sharps -> KeySignature.A
     */
    private static translateKeyTransposeTable(texts: string[][]): KeySignature[][] {
        const keySignatures: KeySignature[][] = [];
        for (const transpose of texts) {
            const transposeValues: KeySignature[] = [];
            keySignatures.push(transposeValues);
            for (const keySignatureText of transpose) {
                const keySignature =
                    // digit
                    (Number.parseInt(keySignatureText.charAt(0), 10) *
                        // b -> negative, # positive
                        (keySignatureText.charAt(1) === 'b' ? -1 : 1)) as KeySignature;
                transposeValues.push(keySignature);
            }
        }
        return keySignatures;
    }

    /**
     * @internal
     */
    private static readonly keyTransposeTable: KeySignature[][] = ModelUtils.translateKeyTransposeTable([
        /*              Cb    Gb    Db    Ab    Eb    Bb    F     C     G     D     A     E     B     F     C# */
        /* C	 0 */ ['7b', '6b', '5b', '4b', '3b', '2b', '1b', '0#', '1#', '2#', '3#', '4#', '5#', '6#', '7#'],
        /* Db	 1 */ ['2b', '1b', '0#', '1#', '2#', '3#', '4#', '5#', '6#', '7#', '4b', '3b', '2b', '1b', '0#'],
        /* D	 2 */ ['3#', '4#', '7b', '6b', '5b', '4b', '3b', '2b', '1b', '0#', '1#', '2#', '3#', '4#', '5#'],
        /* Eb	 3 */ ['4b', '3b', '2b', '1b', '0#', '1#', '2#', '3#', '4#', '5#', '6#', '7#', '4b', '3b', '2b'],
        /* E	 4 */ ['1#', '2#', '3#', '4#', '7b', '6b', '5b', '4b', '3b', '2b', '1b', '0#', '1#', '2#', '3#'],
        /* F	 5 */ ['6b', '5b', '4b', '3b', '2b', '1b', '0#', '1#', '2#', '3#', '4#', '5#', '6#', '7#', '4b'],
        /* Gb	 6 */ ['1b', '0#', '1#', '2#', '3#', '4#', '7b', '6#', '7#', '4b', '3b', '2b', '1b', '0#', '1#'],
        /* G	 7 */ ['4#', '7b', '6b', '5b', '4b', '3b', '2b', '1b', '0#', '1#', '2#', '3#', '4#', '5#', '6#'],
        /* Ab	 8 */ ['3b', '2b', '1b', '0#', '1#', '2#', '3#', '4#', '5#', '6#', '7#', '4b', '3b', '2b', '1b'],
        /* A	 9 */ ['2#', '3#', '4#', '7b', '6b', '5b', '4b', '3b', '2b', '1b', '0#', '1#', '2#', '3#', '4#'],
        /* Bb	10 */ ['5b', '4b', '3b', '2b', '1b', '0#', '1#', '2#', '3#', '4#', '5#', '6#', '7#', '4b', '3b'],
        /* B	11 */ ['0#', '1#', '2#', '3#', '4#', '7b', '6b', '6#', '4b', '3b', '2b', '1b', '0#', '1#', '2#']
    ]);

    /**
     * Transposes the given key signature.
     * @internal
     * @param keySignature The key signature to transpose
     * @param transpose The number of semitones to transpose (+/- 0-11)
     * @returns
     */
    public static transposeKey(keySignature: KeySignature, transpose: number): KeySignature {
        if (transpose === 0) {
            return keySignature;
        }

        if (transpose < 0) {
            const lookup = ModelUtils.keyTransposeTable[-transpose];
            const keySignatureIndex = lookup.indexOf(keySignature);
            if (keySignatureIndex === -1) {
                return keySignature;
            }

            return (keySignatureIndex - 7) as KeySignature;
        } else {
            return ModelUtils.keyTransposeTable[transpose][keySignature + 7];
        }
    }

    /**
     * a lookup list containing an info whether the notes within an octave
     * need an accidental rendered. the accidental symbol is determined based on the type of key signature.
     */
    private static KeySignatureLookup: Array<boolean[]> = [
        // Flats (where the value is true, a flat accidental is required for the notes)
        [true, true, true, true, true, true, true, true, true, true, true, true],
        [true, true, true, true, true, false, true, true, true, true, true, true],
        [false, true, true, true, true, false, true, true, true, true, true, true],
        [false, true, true, true, true, false, false, false, true, true, true, true],
        [false, false, false, true, true, false, false, false, true, true, true, true],
        [false, false, false, true, true, false, false, false, false, false, true, true],
        [false, false, false, false, false, false, false, false, false, false, true, true],
        // natural
        [false, false, false, false, false, false, false, false, false, false, false, false],
        // sharps  (where the value is true, a flat accidental is required for the notes)
        [false, false, false, false, false, true, true, false, false, false, false, false],
        [true, true, false, false, false, true, true, false, false, false, false, false],
        [true, true, false, false, false, true, true, true, true, false, false, false],
        [true, true, true, true, false, true, true, true, true, false, false, false],
        [true, true, true, true, false, true, true, true, true, true, true, false],
        [true, true, true, true, true, true, true, true, true, true, true, false],
        [true, true, true, true, true, true, true, true, true, true, true, true]
    ];

    /**
     * Contains the list of notes within an octave have accidentals set.
     * @internal
     */
    public static AccidentalNotes: boolean[] = [
        false,
        true,
        false,
        true,
        false,
        false,
        true,
        false,
        true,
        false,
        true,
        false
    ];

    /**
     * @internal
     */
    public static computeAccidental(
        keySignature: KeySignature,
        accidentalMode: NoteAccidentalMode,
        noteValue: number,
        quarterBend: boolean,
        currentAccidental: AccidentalType | null = null
    ) {
        const ks: number = keySignature;
        const ksi: number = ks + 7;
        const index: number = noteValue % 12;

        const accidentalForKeySignature: AccidentalType = ksi < 7 ? AccidentalType.Flat : AccidentalType.Sharp;
        const hasKeySignatureAccidentalSetForNote: boolean = ModelUtils.KeySignatureLookup[ksi][index];
        const hasNoteAccidentalWithinOctave: boolean = ModelUtils.AccidentalNotes[index];

        // the general logic is like this:
        // - we check if the key signature has an accidental defined
        // - we calculate which accidental a note needs according to its index in the octave
        // - if the accidental is already placed at this line, nothing needs to be done, otherwise we place it
        // - if there should not be an accidental, but there is one in the key signature, we clear it.

        // the exceptions are:
        // - for quarter bends we just place the corresponding accidental
        // - the accidental mode can enforce the accidentals for the note

        let accidentalToSet: AccidentalType = AccidentalType.None;
        if (quarterBend) {
            accidentalToSet = hasNoteAccidentalWithinOctave ? accidentalForKeySignature : AccidentalType.Natural;
            switch (accidentalToSet) {
                case AccidentalType.Natural:
                    accidentalToSet = AccidentalType.NaturalQuarterNoteUp;
                    break;
                case AccidentalType.Sharp:
                    accidentalToSet = AccidentalType.SharpQuarterNoteUp;
                    break;
                case AccidentalType.Flat:
                    accidentalToSet = AccidentalType.FlatQuarterNoteUp;
                    break;
            }
        } else {
            // define which accidental should be shown ignoring what might be set on the KS already
            switch (accidentalMode) {
                case NoteAccidentalMode.ForceSharp:
                    accidentalToSet = AccidentalType.Sharp;
                    break;
                case NoteAccidentalMode.ForceDoubleSharp:
                    accidentalToSet = AccidentalType.DoubleSharp;
                    break;
                case NoteAccidentalMode.ForceFlat:
                    accidentalToSet = AccidentalType.Flat;
                    break;
                case NoteAccidentalMode.ForceDoubleFlat:
                    accidentalToSet = AccidentalType.DoubleFlat;
                    break;
                default:
                    // if note has an accidental in the octave, we place a symbol
                    // according to the Key Signature
                    if (hasNoteAccidentalWithinOctave) {
                        accidentalToSet = accidentalForKeySignature;
                    } else if (hasKeySignatureAccidentalSetForNote) {
                        // note does not get an accidental, but KS defines one -> Naturalize
                        accidentalToSet = AccidentalType.Natural;
                    }
                    break;
            }

            // do we need an accidental on the note?
            if (accidentalToSet !== AccidentalType.None) {
                // if there is no accidental on the line, and the key signature has it set already, we clear it on the note
                if (currentAccidental != null) {
                    if (currentAccidental === accidentalToSet) {
                        accidentalToSet = AccidentalType.None;
                    }
                }
                // if there is no accidental on the line, and the key signature has it set already, we clear it on the note
                else if (hasKeySignatureAccidentalSetForNote && accidentalToSet === accidentalForKeySignature) {
                    accidentalToSet = AccidentalType.None;
                }
            } else {
                // if we don't want an accidental, but there is already one applied, we place a naturalize accidental
                // and clear the registration
                if (currentAccidental !== null) {
                    if (currentAccidental === AccidentalType.Natural) {
                        accidentalToSet = AccidentalType.None;
                    } else {
                        accidentalToSet = AccidentalType.Natural;
                    }
                }
            }
        }

        return accidentalToSet;
    }
}
