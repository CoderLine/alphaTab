import { AccidentalType } from '@coderline/alphatab/model/AccidentalType';
import { Automation, AutomationType } from '@coderline/alphatab/model/Automation';
import { Bar } from '@coderline/alphatab/model/Bar';
import { Beat } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import type { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { KeySignatureType } from '@coderline/alphatab/model/KeySignatureType';
import { MasterBar } from '@coderline/alphatab/model/MasterBar';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
import { HeaderFooterStyle, type Score, ScoreStyle, type ScoreSubElement } from '@coderline/alphatab/model/Score';
import type { Track } from '@coderline/alphatab/model/Track';
import { Voice } from '@coderline/alphatab/model/Voice';
import type { Settings } from '@coderline/alphatab/Settings';
import { SynthConstants } from '@coderline/alphatab/synth/SynthConstants';

/**
 * @internal
 */
export class TuningParseResult {
    public note: string | null = null;
    public tone: TuningParseResultTone = new TuningParseResultTone();
    public octave: number = 0;

    public get realValue(): number {
        return this.octave * 12 + this.tone.noteValue;
    }
}

/**
 * @internal
 */
export class TuningParseResultTone {
    public noteValue: number;
    public accidentalMode: NoteAccidentalMode;
    public constructor(noteValue: number = 0, accidentalMode: NoteAccidentalMode = NoteAccidentalMode.Default) {
        this.noteValue = noteValue;
        this.accidentalMode = accidentalMode;
    }
}

/**
 * @internal
 * @record
 */
export interface ResolvedSpelling {
    degree: number;
    accidentalOffset: number;
    chroma: number;
    octave: number;
}

/**
 * @internal
 * @record
 */
interface SpellingBase {
    degree: number;
    accidentalOffset: number;
}

/**
 * This public class contains some utilities for working with model public classes
 * @partial
 * @internal
 */
export class ModelUtils {
    private static readonly _durationIndices = ModelUtils._buildDurationIndices();

    private static _buildDurationIndices() {
        return new Map<Duration, number>(
            Object.values(Duration)
                .filter<any>((k: any) => typeof k === 'number')
                .map(d => [d as number as Duration, (d as number) < 0 ? 0 : Math.log2(d as number) | 0])
        );
    }

    public static getIndex(duration: Duration): number {
        return ModelUtils._durationIndices.get(duration)!;
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

    /**
     * @internal
     */
    public static readonly tuningLetters = new Set<number>([
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
            } else if (note.length === 0) {
                if (ModelUtils.tuningLetters.has(c)) {
                    note += String.fromCharCode(c);
                } else {
                    return null;
                }
            } else {
                note += String.fromCharCode(c);
            }
        }
        if (!octave || !note) {
            return null;
        }

        const result: TuningParseResult = new TuningParseResult();

        result.octave = Number.parseInt(octave, 10) + 1;
        result.note = note.toLowerCase();
        const tone = ModelUtils.getToneForText(result.note);
        if (tone === null) {
            return null;
        }
        result.tone = tone;

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

    public static getToneForText(note: string): TuningParseResultTone | null {
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
                return null;
        }

        if (!ModelUtils.accidentalModeMapping.has(accidental)) {
            return null;
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
    public static readonly reverseAccidentalModeMapping = new Map<NoteAccidentalMode, string>([
        [NoteAccidentalMode.Default, 'd'],

        [NoteAccidentalMode.ForceNone, 'forcenone'],

        [NoteAccidentalMode.ForceNatural, 'forcenatural'],

        [NoteAccidentalMode.ForceSharp, '#'],

        [NoteAccidentalMode.ForceDoubleSharp, 'x'],

        [NoteAccidentalMode.ForceFlat, 'b'],

        [NoteAccidentalMode.ForceDoubleFlat, 'bb']
    ]);

    /**
     * @internal
     */
    public static readonly accidentalModeMapping = new Map<string, NoteAccidentalMode>([
        ['default', NoteAccidentalMode.Default],
        ['d', NoteAccidentalMode.Default],
        ['', NoteAccidentalMode.Default],

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
    private static _translateKeyTransposeTable(texts: string[][]): KeySignature[][] {
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
    private static readonly _keyTransposeTable: KeySignature[][] = ModelUtils._translateKeyTransposeTable([
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
            const lookup = ModelUtils._keyTransposeTable[-transpose];
            const keySignatureIndex = lookup.indexOf(keySignature);
            if (keySignatureIndex === -1) {
                return keySignature;
            }

            return (keySignatureIndex - 7) as KeySignature;
        } else {
            return ModelUtils._keyTransposeTable[transpose][keySignature + 7];
        }
    }

    /**
     * @internal
     */
    public static toArticulationId(plain: string): string {
        return plain.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }

    public static minBoundingBox(a: number, b: number) {
        if (Number.isNaN(a)) {
            return b;
        } else if (Number.isNaN(b)) {
            return a;
        }
        return a < b ? a : b;
    }

    public static maxBoundingBox(a: number, b: number) {
        if (Number.isNaN(a)) {
            return b;
        } else if (Number.isNaN(b)) {
            return a;
        }
        return a > b ? a : b;
    }

    public static getSystemLayout(score: Score, systemIndex: number, displayedTracks: Track[]) {
        let defaultSystemsLayout: number;
        let systemsLayout: number[];
        if (displayedTracks.length === 1) {
            defaultSystemsLayout = displayedTracks[0].defaultSystemsLayout;
            systemsLayout = displayedTracks[0].systemsLayout;
        } else {
            // multi track applies
            defaultSystemsLayout = score.defaultSystemsLayout;
            systemsLayout = score.systemsLayout;
        }

        return systemIndex < systemsLayout.length ? systemsLayout[systemIndex] : defaultSystemsLayout;
    }

    // diatonic accidentals

    private static readonly _degreeSemitones: number[] = [0, 2, 4, 5, 7, 9, 11];

    private static readonly _sharpPreferredSpellings: SpellingBase[] = [
        { degree: 0, accidentalOffset: 0 }, // C
        { degree: 0, accidentalOffset: 1 }, // C#
        { degree: 1, accidentalOffset: 0 }, // D
        { degree: 1, accidentalOffset: 1 }, // D#
        { degree: 2, accidentalOffset: 0 }, // E
        { degree: 3, accidentalOffset: 0 }, // F
        { degree: 3, accidentalOffset: 1 }, // F#
        { degree: 4, accidentalOffset: 0 }, // G
        { degree: 4, accidentalOffset: 1 }, // G#
        { degree: 5, accidentalOffset: 0 }, // A
        { degree: 5, accidentalOffset: 1 }, // A#
        { degree: 6, accidentalOffset: 0 } // B
    ];

    private static readonly _flatPreferredSpellings: SpellingBase[] = [
        { degree: 0, accidentalOffset: 0 }, // C
        { degree: 1, accidentalOffset: -1 }, // Db
        { degree: 1, accidentalOffset: 0 }, // D
        { degree: 2, accidentalOffset: -1 }, // Eb
        { degree: 2, accidentalOffset: 0 }, // E
        { degree: 3, accidentalOffset: 0 }, // F
        { degree: 4, accidentalOffset: -1 }, // Gb
        { degree: 4, accidentalOffset: 0 }, // G
        { degree: 5, accidentalOffset: -1 }, // Ab
        { degree: 5, accidentalOffset: 0 }, // A
        { degree: 6, accidentalOffset: -1 }, // Bb
        { degree: 6, accidentalOffset: 0 } // B
    ];

    // 12 chromatic pitch classes with always 3 possible spellings in the
    // accidental range of bb..##
    private static readonly _spellingCandidates: SpellingBase[][] = [
        // 0: C
        [
            { degree: 0, accidentalOffset: 0 }, // C
            { degree: 1, accidentalOffset: -2 }, // Dbb
            { degree: 6, accidentalOffset: 1 } // B#
        ],
        // 1: C#/Db
        [
            { degree: 0, accidentalOffset: 1 }, // C#
            { degree: 1, accidentalOffset: -1 }, // Db
            { degree: 6, accidentalOffset: 2 } // B##
        ],
        // 2: D
        [
            { degree: 1, accidentalOffset: 0 }, // D
            { degree: 0, accidentalOffset: 2 }, // C##
            { degree: 2, accidentalOffset: -2 } // Ebb
        ],
        // 3: D#/Eb
        [
            { degree: 1, accidentalOffset: 1 }, // D#
            { degree: 2, accidentalOffset: -1 }, // Eb
            { degree: 3, accidentalOffset: -2 } // Fbb
        ],
        // 4: E
        [
            { degree: 2, accidentalOffset: 0 }, // E
            { degree: 1, accidentalOffset: 2 }, // D##
            { degree: 3, accidentalOffset: -1 } // Fb
        ],
        // 5: F
        [
            { degree: 3, accidentalOffset: 0 }, // F
            { degree: 2, accidentalOffset: 1 }, // E#
            { degree: 4, accidentalOffset: -2 } // Gbb
        ],
        // 6: F#/Gb
        [
            { degree: 3, accidentalOffset: 1 }, // F#
            { degree: 4, accidentalOffset: -1 }, // Gb
            { degree: 2, accidentalOffset: 2 } // E##
        ],
        // 7: G
        [
            { degree: 4, accidentalOffset: 0 }, // G
            { degree: 3, accidentalOffset: 2 }, // F##
            { degree: 5, accidentalOffset: -2 } // Abb
        ],
        // 8: G#/Ab
        [
            { degree: 4, accidentalOffset: 1 }, // G#
            { degree: 5, accidentalOffset: -1 } // Ab
        ],
        // 9: A
        [
            { degree: 5, accidentalOffset: 0 }, // A
            { degree: 4, accidentalOffset: 2 }, // G##
            { degree: 6, accidentalOffset: -2 } // Bbb
        ],
        // 10: A#/Bb
        [
            { degree: 5, accidentalOffset: 1 }, // A#
            { degree: 6, accidentalOffset: -1 }, // Bb
            { degree: 0, accidentalOffset: -2 } // Cbb
        ],
        // 11: B
        [
            { degree: 6, accidentalOffset: 0 }, // B
            { degree: 5, accidentalOffset: 2 }, // A##
            { degree: 0, accidentalOffset: -1 } // Cb
        ]
    ];
    private static readonly _sharpKeySignatureOrder: number[] = [3, 0, 4, 1, 5, 2, 6]; // F C G D A E B
    private static readonly _flatKeySignatureOrder: number[] = [6, 2, 5, 1, 4, 0, 3]; // B E A D G C F

    private static readonly _keySignatureAccidentalByDegree: number[][] =
        ModelUtils._buildKeySignatureAccidentalByDegree();

    private static readonly _accidentalOffsetToType = new Map<number, AccidentalType>([
        [-2, AccidentalType.DoubleFlat],
        [-1, AccidentalType.Flat],
        [0, AccidentalType.Natural],
        [1, AccidentalType.Sharp],
        [2, AccidentalType.DoubleSharp]
    ]);

    private static readonly _forcedAccidentalOffsetByMode = new Map<NoteAccidentalMode, number | null>([
        [NoteAccidentalMode.ForceSharp, 1],
        [NoteAccidentalMode.ForceDoubleSharp, 2],
        [NoteAccidentalMode.ForceFlat, -1],
        [NoteAccidentalMode.ForceDoubleFlat, -2],
        [NoteAccidentalMode.ForceNatural, 0],
        [NoteAccidentalMode.ForceNone, 0],
        [NoteAccidentalMode.Default, null]
    ]);

    private static _buildKeySignatureAccidentalByDegree(): number[][] {
        const lookup: number[][] = [];
        for (let ks = -7; ks <= 7; ks++) {
            const row = new Array<number>(7).fill(0);
            if (ks > 0) {
                for (let i = 0; i < ks; i++) {
                    row[ModelUtils._sharpKeySignatureOrder[i]] = 1;
                }
            } else if (ks < 0) {
                for (let i = 0; i < -ks; i++) {
                    row[ModelUtils._flatKeySignatureOrder[i]] = -1;
                }
            }
            lookup.push(row);
        }
        return lookup;
    }

    public static getKeySignatureAccidentalOffset(keySignature: KeySignature, degree: number): number {
        return ModelUtils._keySignatureAccidentalByDegree[(keySignature as number) + 7][degree];
    }

    public static resolveSpelling(
        keySignature: KeySignature,
        noteValue: number,
        accidentalMode: NoteAccidentalMode
    ): ResolvedSpelling {
        const chroma = ModelUtils.flooredDivision(noteValue, 12);

        const preferred = ModelUtils._getPreferredSpellingForKeySignature(keySignature, chroma);
        const desiredOffset = ModelUtils._forcedAccidentalOffsetByMode.get(accidentalMode) ?? null;

        let spelling: SpellingBase = preferred;
        if (desiredOffset !== null) {
            const candidates = ModelUtils._spellingCandidates[chroma];
            const exact = candidates.find(c => c.accidentalOffset === desiredOffset);
            if (exact) {
                spelling = exact;
            }
        }

        const baseSemitone = ModelUtils._degreeSemitones[spelling.degree] + spelling.accidentalOffset;
        const octave = Math.floor((noteValue - baseSemitone) / 12) - 1;

        return {
            degree: spelling.degree,
            accidentalOffset: spelling.accidentalOffset,
            chroma,
            octave
        };
    }

    public static computeAccidental(
        keySignature: KeySignature,
        accidentalMode: NoteAccidentalMode,
        noteValue: number,
        quarterBend: boolean,
        currentAccidentalOffset: number | null = null
    ) {
        const spelling = ModelUtils.resolveSpelling(keySignature, noteValue, accidentalMode);
        return ModelUtils.computeAccidentalForSpelling(
            keySignature,
            accidentalMode,
            spelling,
            quarterBend,
            currentAccidentalOffset
        );
    }

    public static computeAccidentalForSpelling(
        keySignature: KeySignature,
        accidentalMode: NoteAccidentalMode,
        spelling: ResolvedSpelling,
        quarterBend: boolean,
        currentAccidentalOffset: number | null = null
    ) {
        if (accidentalMode === NoteAccidentalMode.ForceNone) {
            return AccidentalType.None;
        }

        if (quarterBend) {
            if (spelling.accidentalOffset > 0) {
                return AccidentalType.SharpQuarterNoteUp;
            }
            if (spelling.accidentalOffset < 0) {
                return AccidentalType.FlatQuarterNoteUp;
            }
            return AccidentalType.NaturalQuarterNoteUp;
        }

        const desiredOffset = spelling.accidentalOffset;
        const ksOffset = ModelUtils.getKeySignatureAccidentalOffset(keySignature, spelling.degree);

        // already active in bar -> no accidental needed
        if (currentAccidentalOffset === desiredOffset) {
            return AccidentalType.None;
        }

        // key signature already defines the accidental and no explicit accidental is active
        if (currentAccidentalOffset == null && desiredOffset === ksOffset) {
            return AccidentalType.None;
        }

        return ModelUtils.accidentalOffsetToType(desiredOffset);
    }

    public static accidentalOffsetToType(offset: number): AccidentalType {
        return ModelUtils._accidentalOffsetToType.get(offset) ?? AccidentalType.None;
    }

    private static _getPreferredSpellingForKeySignature(keySignature: KeySignature, chroma: number): SpellingBase {
        const candidates = ModelUtils._spellingCandidates[chroma];

        const ksMatch = candidates.find(
            c => ModelUtils.getKeySignatureAccidentalOffset(keySignature, c.degree) === c.accidentalOffset
        );
        if (ksMatch) {
            return ksMatch;
        }

        const preferFlat = ModelUtils.keySignatureIsFlat(keySignature);
        return preferFlat ? ModelUtils._flatPreferredSpellings[chroma] : ModelUtils._sharpPreferredSpellings[chroma];
    }

    private static readonly _majorKeySignatureTonicDegrees: number[] = [
        // Flats: Cb, Gb, Db, Ab, Eb, Bb, F
        0, 4, 1, 5, 2, 6, 3,
        // Natural: C
        0,
        // Sharps: G, D, A, E, B, F#, C#
        4, 1, 5, 2, 6, 3, 0
    ];

    private static readonly _minorKeySignatureTonicDegrees: number[] = [
        // Flats: Ab, Eb, Bb, F, C, G, D
        5, 2, 6, 3, 0, 4, 1,
        // Natural: A
        5,
        // Sharps: E, B, F#, C#, G#, D#, A#
        2, 6, 3, 0, 4, 1, 5
    ];

    public static getKeySignatureTonicDegree(keySignature: KeySignature, keySignatureType: KeySignatureType): number {
        const ksi = (keySignature as number) + 7;
        return keySignatureType === KeySignatureType.Minor
            ? ModelUtils._minorKeySignatureTonicDegrees[ksi]
            : ModelUtils._majorKeySignatureTonicDegrees[ksi];
    }
}
