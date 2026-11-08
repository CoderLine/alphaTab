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
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { Track } from '@coderline/alphatab/model/Track';
import { Voice } from '@coderline/alphatab/model/Voice';
import { SpelledPitch } from '@coderline/alphatab/model/SpelledPitch';
import type { Settings } from '@coderline/alphatab/Settings';
import { SynthConstants } from '@coderline/alphatab/synth/SynthConstants';

/**
 * The result of parsing a textual pitch like `C4`, `F#3` or `Gbb2`.
 * @internal
 */
export class PitchParseResult {
    public readonly pitch: SpelledPitch;
    /**
     * The accidental mode matching the accidental as written (e.g. {@link NoteAccidentalMode.ForceNatural} for `Cn4`).
     */
    public readonly accidentalMode: NoteAccidentalMode;

    public constructor(pitch: SpelledPitch, accidentalMode: NoteAccidentalMode) {
        this.pitch = pitch;
        this.accidentalMode = accidentalMode;
    }

    /**
     * The value for `Note.tone`: steps flattened below C roll over into the octave below (`Cb4` = 11),
     * steps sharpened above B stay in the octave of the step (`B#3` = 12).
     */
    public get noteTone(): number {
        const tone = SpelledPitch.stepSemitones(this.pitch.step) + this.pitch.alter;
        return tone < 0 ? tone + 12 : tone;
    }

    /**
     * The value for `Note.octave` matching {@link noteTone}.
     */
    public get noteOctave(): number {
        const tone = SpelledPitch.stepSemitones(this.pitch.step) + this.pitch.alter;
        return tone < 0 ? this.pitch.octave : this.pitch.octave + 1;
    }
}

/**
 * @internal
 * @record
 */
interface SpellingBase {
    step: number;
    alter: number;
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

    /**
     * Converts a {@link Automation.ratioPosition} within the given bar into a midi tick offset relative to the bar start.
     * @remarks
     * The ratio is relative to the full duration of the time signature, also in pick-up bars which are shorter.
     * This matches Guitar Pro which stores e.g. 0.5 for an automation on the 3rd eighth note of a 3/8 pick-up in 2/4.
     */
    public static ratioPositionToTick(masterBar: MasterBar, ratioPosition: number): number {
        return masterBar.calculateDuration(false) * ratioPosition;
    }

    /**
     * Converts a midi tick offset relative to the bar start into a {@link Automation.ratioPosition}.
     * See {@link ratioPositionToTick} for the convention.
     */
    public static tickToRatioPosition(masterBar: MasterBar, tick: number): number {
        return tick / masterBar.calculateDuration(false);
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
     * @internal
     */
    public static readonly tuningLetters = new Set<number>([
        0x43 /* C */, 0x44 /* D */, 0x45 /* E */, 0x46 /* F */, 0x47 /* G */, 0x41 /* A */, 0x42 /* B */, 0x63 /* c */,
        0x64 /* d */, 0x65 /* e */, 0x66 /* f */, 0x67 /* g */, 0x61 /* a */, 0x62 /* b */, 0x23 /* # */
    ]);

    /**
     * Parses a textual pitch in the form `<step><accidental><octave>` like `C4`, `f#3` or `Gbb2`.
     * The step is case insensitive, the accidental is any key of {@link accidentalModeMapping}.
     * Digits are collected as octave wherever they appear after the step.
     * @returns The parsed pitch or null if the text is no valid pitch.
     */
    public static parsePitch(name: string): PitchParseResult | null {
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

        const step = SpelledPitch.stepForLetter(note.charCodeAt(0));
        if (step < 0) {
            return null;
        }

        const accidental = note.substring(1).toLowerCase();
        if (!ModelUtils.accidentalModeMapping.has(accidental)) {
            return null;
        }
        const accidentalMode = ModelUtils.accidentalModeMapping.get(accidental)!;

        return new PitchParseResult(
            new SpelledPitch(step, ModelUtils.accidentalModeToAlter(accidentalMode), Number.parseInt(octave, 10)),
            accidentalMode
        );
    }

    /**
     * The semitones the given accidental mode shifts the written step by.
     * Modes without a sharp or flat do not shift the step.
     */
    public static accidentalModeToAlter(accidentalMode: NoteAccidentalMode): number {
        switch (accidentalMode) {
            case NoteAccidentalMode.ForceSharp:
                return 1;
            case NoteAccidentalMode.ForceDoubleSharp:
                return 2;
            case NoteAccidentalMode.ForceFlat:
                return -1;
            case NoteAccidentalMode.ForceDoubleFlat:
                return -2;
        }
        return 0;
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

    /**
     * Gets the interval in semitones a harmonic sounds above the played pitch when touching the string
     * at the given harmonic value (the fret position of the node).
     * @param value The harmonic value.
     */
    public static harmonicValueToPitch(value: number): number {
        // add semitones to reach corresponding harmonic frets
        if (ModelUtils.isAlmostEqualTo(value, 2.4)) {
            return 36;
        }
        if (ModelUtils.isAlmostEqualTo(value, 2.7)) {
            // Fret 3 2nd octave + minor seventh
            return 34;
        }
        if (value < 3) {
            // no natural harmonics below fret 3
            return 0;
        }
        if (value <= 3.5) {
            // Fret 3 2nd octave + fifth
            return 31;
        }
        if (value <= 4) {
            return 28;
        }
        if (value <= 5) {
            return 24;
        }
        if (value <= 6) {
            return 34;
        }
        if (value <= 7) {
            return 19;
        }
        if (value <= 8.5) {
            return 36;
        }
        if (value <= 9) {
            return 28;
        }
        if (value <= 10) {
            return 34;
        }
        if (value <= 11) {
            return 0;
        }
        if (value <= 12) {
            return 12;
        }
        if (value < 14) {
            // fret 13,14 stay
            return 0;
        }
        if (value <= 15) {
            return 34;
        }
        if (value <= 16) {
            return 28;
        }
        if (value <= 17) {
            return 36;
        }
        if (value <= 18) {
            return 0;
        }
        if (value <= 19) {
            return 19;
        }
        if (value <= 21) {
            //  20,21 stay
            return 0;
        }
        if (value <= 22) {
            return 36;
        }
        if (value <= 24) {
            return 24;
        }
        return 0;
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

    public static backfillStaffVoices(staff: Staff, targetVoiceCount: number): void {
        for (let bi = 0; bi < staff.bars.length - 1; bi++) {
            const priorBar = staff.bars[bi];
            while (priorBar.voices.length < targetVoiceCount) {
                ModelUtils.appendPlaceholderVoice(priorBar);
            }
        }
    }

    public static appendPlaceholderVoice(bar: Bar): void {
        const voice: Voice = new Voice();
        bar.addVoice(voice);
        const beat: Beat = new Beat();
        beat.isEmpty = true;
        beat.duration = Duration.Quarter;
        voice.addBeat(beat);
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
                        ModelUtils.appendPlaceholderVoice(bar);
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

    // 12 chromatic pitch classes with always 3 possible spellings in the
    // accidental range of bb..##
    private static readonly _spellingCandidates: SpellingBase[][] = [
        // 0: C
        [
            { step: 0, alter: 0 }, // C
            { step: 1, alter: -2 }, // Dbb
            { step: 6, alter: 1 } // B#
        ],
        // 1: C#/Db
        [
            { step: 0, alter: 1 }, // C#
            { step: 1, alter: -1 }, // Db
            { step: 6, alter: 2 } // B##
        ],
        // 2: D
        [
            { step: 1, alter: 0 }, // D
            { step: 0, alter: 2 }, // C##
            { step: 2, alter: -2 } // Ebb
        ],
        // 3: D#/Eb
        [
            { step: 1, alter: 1 }, // D#
            { step: 2, alter: -1 }, // Eb
            { step: 3, alter: -2 } // Fbb
        ],
        // 4: E
        [
            { step: 2, alter: 0 }, // E
            { step: 1, alter: 2 }, // D##
            { step: 3, alter: -1 } // Fb
        ],
        // 5: F
        [
            { step: 3, alter: 0 }, // F
            { step: 2, alter: 1 }, // E#
            { step: 4, alter: -2 } // Gbb
        ],
        // 6: F#/Gb
        [
            { step: 3, alter: 1 }, // F#
            { step: 4, alter: -1 }, // Gb
            { step: 2, alter: 2 } // E##
        ],
        // 7: G
        [
            { step: 4, alter: 0 }, // G
            { step: 3, alter: 2 }, // F##
            { step: 5, alter: -2 } // Abb
        ],
        // 8: G#/Ab
        [
            { step: 4, alter: 1 }, // G#
            { step: 5, alter: -1 } // Ab
        ],
        // 9: A
        [
            { step: 5, alter: 0 }, // A
            { step: 4, alter: 2 }, // G##
            { step: 6, alter: -2 } // Bbb
        ],
        // 10: A#/Bb
        [
            { step: 5, alter: 1 }, // A#
            { step: 6, alter: -1 }, // Bb
            { step: 0, alter: -2 } // Cbb
        ],
        // 11: B
        [
            { step: 6, alter: 0 }, // B
            { step: 5, alter: 2 }, // A##
            { step: 0, alter: -1 } // Cb
        ]
    ];
    private static readonly _sharpKeySignatureOrder: number[] = [3, 0, 4, 1, 5, 2, 6]; // F C G D A E B
    private static readonly _flatKeySignatureOrder: number[] = [6, 2, 5, 1, 4, 0, 3]; // B E A D G C F

    private static readonly _keySignatureAccidentalByDegree: number[][] =
        ModelUtils._buildKeySignatureAccidentalByDegree();

    private static _buildKeySignatureAccidentalByDegree(): number[][] {
        const lookup: number[][] = [];
        for (let ks = -7; ks <= 7; ks++) {
            const row = [0, 0, 0, 0, 0, 0, 0];
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

    /**
     * Resolves how the given note value is written in the given key signature.
     * A forced accidental mode selects the matching enharmonic spelling if there is one,
     * otherwise the spelling of the key signature is used, otherwise sharps or flats depending on the key signature.
     */
    public static resolveSpelling(
        keySignature: KeySignature,
        noteValue: number,
        accidentalMode: NoteAccidentalMode
    ): SpelledPitch {
        const chroma = ModelUtils.flooredDivision(noteValue, 12);
        const candidates = ModelUtils._spellingCandidates[chroma];

        let step = -1;
        let alter = 0;

        if (accidentalMode !== NoteAccidentalMode.Default) {
            const desiredAlter = ModelUtils.accidentalModeToAlter(accidentalMode);
            for (let i = 0; i < candidates.length; i++) {
                const c = candidates[i];
                if (c.alter === desiredAlter) {
                    step = c.step;
                    alter = c.alter;
                    break;
                }
            }
        }

        if (step === -1) {
            for (let i = 0; i < candidates.length; i++) {
                const c = candidates[i];
                if (ModelUtils.getKeySignatureAccidentalOffset(keySignature, c.step) === c.alter) {
                    step = c.step;
                    alter = c.alter;
                    break;
                }
            }
        }

        if (step === -1) {
            step = SpelledPitch.preferredStep(chroma, ModelUtils.keySignatureIsFlat(keySignature));
            alter = chroma - SpelledPitch.stepSemitones(step);
        }

        const octave = Math.floor((noteValue - (SpelledPitch.stepSemitones(step) + alter)) / 12) - 1;
        return new SpelledPitch(step, alter, octave);
    }

    /**
     * Returns the simplest accidental mode which results in the same rendering as the given one.
     * The forced modes are only spelling hints: when the hint resolves to the spelling which
     * {@link NoteAccidentalMode.Default} would choose anyhow, the hint is not needed.
     * The rendering only uses the accidental mode via {@link resolveSpelling} and checks for
     * {@link NoteAccidentalMode.ForceNone}. If this changes, this method has to be adapted.
     * @param keySignature The key signature of the bar holding the note.
     * @param noteValue The display value of the note.
     * @param accidentalMode The accidental mode of the note.
     */
    public static simplifyAccidentalMode(
        keySignature: KeySignature,
        noteValue: number,
        accidentalMode: NoteAccidentalMode
    ): NoteAccidentalMode {
        if (accidentalMode === NoteAccidentalMode.Default || accidentalMode === NoteAccidentalMode.ForceNone) {
            return accidentalMode;
        }

        const forced = ModelUtils.resolveSpelling(keySignature, noteValue, accidentalMode);
        const preferred = ModelUtils.resolveSpelling(keySignature, noteValue, NoteAccidentalMode.Default);
        if (forced.step === preferred.step && forced.alter === preferred.alter) {
            return NoteAccidentalMode.Default;
        }
        return accidentalMode;
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
        spelling: SpelledPitch,
        quarterBend: boolean,
        currentAccidentalOffset: number | null = null
    ) {
        if (accidentalMode === NoteAccidentalMode.ForceNone) {
            return AccidentalType.None;
        }

        if (quarterBend) {
            if (spelling.alter > 0) {
                return AccidentalType.SharpQuarterNoteUp;
            }
            if (spelling.alter < 0) {
                return AccidentalType.FlatQuarterNoteUp;
            }
            return AccidentalType.NaturalQuarterNoteUp;
        }

        const desiredOffset = spelling.alter;
        const ksOffset = ModelUtils.getKeySignatureAccidentalOffset(keySignature, spelling.step);

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
        switch (offset) {
            case -2:
                return AccidentalType.DoubleFlat;
            case -1:
                return AccidentalType.Flat;
            case 0:
                return AccidentalType.Natural;
            case 1:
                return AccidentalType.Sharp;
            case 2:
                return AccidentalType.DoubleSharp;
        }
        return AccidentalType.None;
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

    /** True iff the staff's first note isn't stringed. Empty staves return false. */
    public static staffNotesAreNotStringed(staff: Staff) {
        for (const bar of staff.bars) {
            for (const voice of bar.voices) {
                for (const beat of voice.beats) {
                    for (const note of beat.notes) {
                        return !note.isStringed;
                    }
                }
            }
        }
        return false;
    }
}
