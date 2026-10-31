import {
    type MusicXmlSpan,
    MusicXmlSpanKind,
    type MusicXmlSpanPlacement
} from '@coderline/alphatab/importer/MusicXmlSpans';
import { type Bar, SustainPedalMarker, SustainPedalMarkerType } from '@coderline/alphatab/model/Bar';
import { Beat } from '@coderline/alphatab/model/Beat';
import { CrescendoType } from '@coderline/alphatab/model/CrescendoType';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import type { MasterBar } from '@coderline/alphatab/model/MasterBar';
import { Ottavia } from '@coderline/alphatab/model/Ottavia';
import { SimileMark } from '@coderline/alphatab/model/SimileMark';
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { Track } from '@coderline/alphatab/model/Track';

/**
 * A boundary of a span, normalized to the bar it refers to.
 * @internal
 * @record
 */
interface MusicXmlSpanBound {
    barIndex: number;
    /**
     * The ticks of the cursor the element is written at.
     */
    ticks: number;
    /**
     * The position including the offset of the element.
     */
    exactBarIndex: number;
    exactTicks: number;
    sequence: number;
}

/**
 * Applies the spans of a part to the model.
 *
 * A beat is covered by a span if:
 * - the beat is next to the cursor the start or stop is written at, and on the covered side of it. Exporters write
 *   stops after the last covered note (e.g. MuseScore), or nudge them with an offset into the next note (e.g. Finale).
 * - otherwise (e.g. other voices) if its middle is within the span, including the offsets.
 * - beats without duration (grace notes) at a boundary are ordered as in the document.
 * @internal
 */
export class MusicXmlSpanApplier {
    private _track: Track;
    private _masterBars: MasterBar[];
    private _beats: Beat[];
    private _beatSequence: Map<Beat, number> = new Map<Beat, number>();
    private _voiceIndexOf: (staff: Staff, voice: string) => number;
    private _octaveStopInLastNote: boolean;
    private _barLengths: number[] = [];
    private _pedalBars: Bar[] = [];

    /**
     * @param beats All beats in document order (see {@link MusicXmlSpanPosition.sequence}).
     * @param voiceIndexOf Resolves a raw MusicXML voice to the index of the voice on the staff, -1 if not existing.
     * @param octaveStopInLastNote Whether octave shift stops are written within the last shifted note (e.g. Finale).
     */
    public constructor(
        track: Track,
        masterBars: MasterBar[],
        beats: Beat[],
        voiceIndexOf: (staff: Staff, voice: string) => number,
        octaveStopInLastNote: boolean
    ) {
        this._track = track;
        this._masterBars = masterBars;
        this._beats = beats;
        for (let i = 0; i < beats.length; i++) {
            if (beats[i].voice.bar.staff.track === track) {
                this._beatSequence.set(beats[i], i);
            }
        }
        this._voiceIndexOf = voiceIndexOf;
        this._octaveStopInLastNote = octaveStopInLastNote;

        // bars can be fuller or emptier than their time signature (e.g. anacrusis, cadenza)
        for (const masterBar of masterBars) {
            let length = 0;
            for (const staff of track.staves) {
                if (masterBar.index < staff.bars.length) {
                    for (const voice of staff.bars[masterBar.index].voices) {
                        if (voice.beats.length > 0) {
                            length = Math.max(length, voice.beats[voice.beats.length - 1].displayEnd);
                        }
                    }
                }
            }
            this._barLengths.push(length > 0 ? length : masterBar.calculateDuration(false));
        }
    }

    public apply(spans: MusicXmlSpan[]) {
        // later spans override the values of earlier ones
        const ordered: MusicXmlSpan[] = [];
        for (const span of spans) {
            let index = ordered.length;
            while (index > 0 && this._compareStart(ordered[index - 1], span) > 0) {
                index--;
            }
            ordered.splice(index, 0, span);
        }

        for (const span of ordered) {
            switch (span.kind) {
                case MusicXmlSpanKind.SustainPedal:
                    this._applyPedal(span);
                    break;
                case MusicXmlSpanKind.SimileSimple:
                case MusicXmlSpanKind.SimileDouble:
                    this._applySimile(span);
                    break;
                default:
                    this._applyBeats(span);
                    break;
            }
        }

        for (const bar of this._pedalBars) {
            // a change lifts before it retakes
            bar.sustainPedals.sort((a, b) =>
                a.ratioPosition !== b.ratioPosition
                    ? a.ratioPosition - b.ratioPosition
                    : MusicXmlSpanApplier._pedalOrder(a) - MusicXmlSpanApplier._pedalOrder(b)
            );
        }
    }

    private _applyBeats(span: MusicXmlSpan) {
        const start = this._bound(span.start!);
        let writtenBeat: Beat | null = null;
        if (span.kind === MusicXmlSpanKind.Crescendo || span.kind === MusicXmlSpanKind.Decrescendo) {
            // dynamics are shown once per staff, on the voice they are written at
            writtenBeat = this._writtenBeat(span.start!);
        }

        for (const staff of this._track.staves) {
            // a direction without staff in a part with multiple staves applies to all of them (e.g. notation and tablature)
            if (span.start!.staffIndex !== -1 && staff.index !== span.start!.staffIndex) {
                continue;
            }

            let voiceIndex = -1;
            if (span.start!.voice.length > 0) {
                voiceIndex = this._voiceIndexOf(staff, span.start!.voice);
                if (voiceIndex === -1) {
                    continue;
                }
            } else if (writtenBeat !== null && writtenBeat!.voice.bar.staff === staff) {
                voiceIndex = writtenBeat!.voice.index;
            }

            let end: MusicXmlSpanBound | null = span.end !== null ? this._bound(span.end!) : null;
            if (end !== null && this._octaveStopInLastNote && MusicXmlSpanApplier._isOttava(span.kind)) {
                end = this._endOfBeatAt(staff, voiceIndex, end!);
            }

            const lastBar = end === null ? staff.bars.length - 1 : Math.min(end!.barIndex, staff.bars.length - 1);
            for (let barIndex = start.barIndex; barIndex <= lastBar; barIndex++) {
                const voices = staff.bars[barIndex].voices;
                for (let v = 0; v < voices.length; v++) {
                    if (voiceIndex === -1 || v === voiceIndex) {
                        for (const beat of voices[v].beats) {
                            if (this._covers(start, end, barIndex, beat)) {
                                MusicXmlSpanApplier._applyBeat(span.kind, beat);
                            }
                        }
                    }
                }
            }
        }
    }

    private static _applyBeat(kind: MusicXmlSpanKind, beat: Beat) {
        switch (kind) {
            case MusicXmlSpanKind.LetRing:
                for (const note of beat.notes) {
                    note.isLetRing = true;
                }
                break;
            case MusicXmlSpanKind.PalmMute:
                for (const note of beat.notes) {
                    note.isPalmMute = true;
                }
                break;
            case MusicXmlSpanKind.Crescendo:
                beat.crescendo = CrescendoType.Crescendo;
                break;
            case MusicXmlSpanKind.Decrescendo:
                beat.crescendo = CrescendoType.Decrescendo;
                break;
            case MusicXmlSpanKind.Ottava8va:
                beat.ottava = Ottavia._8va;
                break;
            case MusicXmlSpanKind.Ottava8vb:
                beat.ottava = Ottavia._8vb;
                break;
            case MusicXmlSpanKind.Ottava15ma:
                beat.ottava = Ottavia._15ma;
                break;
            case MusicXmlSpanKind.Ottava15mb:
                beat.ottava = Ottavia._15mb;
                break;
            case MusicXmlSpanKind.Slash:
                beat.slashed = true;
                break;
        }
    }

    private _covers(start: MusicXmlSpanBound, end: MusicXmlSpanBound | null, barIndex: number, beat: Beat): boolean {
        const sequence = this._beatSequence.has(beat) ? this._beatSequence.get(beat)! : -1;
        if (beat.displayEnd <= beat.displayStart) {
            return (
                MusicXmlSpanApplier._isAtOrAfter(start, barIndex, beat, sequence) &&
                (end === null || !MusicXmlSpanApplier._isAtOrAfter(end!, barIndex, beat, sequence))
            );
        }

        const middle = (beat.displayStart + beat.displayEnd) / 2;
        const isAfterStart = MusicXmlSpanApplier._isBoundary(start, barIndex, beat)
            ? MusicXmlSpanApplier._isAtOrAfter(start, barIndex, beat, sequence)
            : MusicXmlSpanApplier._compare(start.exactBarIndex, start.exactTicks, barIndex, middle) < 0;
        if (!isAfterStart || end === null) {
            return isAfterStart;
        }
        return MusicXmlSpanApplier._isBoundary(end!, barIndex, beat)
            ? !MusicXmlSpanApplier._isAtOrAfter(end!, barIndex, beat, sequence)
            : MusicXmlSpanApplier._compare(end!.exactBarIndex, end!.exactTicks, barIndex, middle) > 0;
    }

    private static _isBoundary(bound: MusicXmlSpanBound, barIndex: number, beat: Beat): boolean {
        return bound.barIndex === barIndex && (bound.ticks === beat.displayStart || bound.ticks === beat.displayEnd);
    }

    private static _isAtOrAfter(bound: MusicXmlSpanBound, barIndex: number, beat: Beat, sequence: number): boolean {
        const compare = MusicXmlSpanApplier._compare(bound.barIndex, bound.ticks, barIndex, beat.displayStart);
        if (compare !== 0) {
            return compare < 0;
        }
        // beats without duration (grace notes) at the same position are ordered as in the document
        return beat.graceType === GraceType.None || sequence < 0 || sequence >= bound.sequence;
    }

    private static _compare(barIndexA: number, ticksA: number, barIndexB: number, ticksB: number): number {
        return barIndexA !== barIndexB ? barIndexA - barIndexB : ticksA - ticksB;
    }

    private static _isOttava(kind: MusicXmlSpanKind): boolean {
        return (
            kind === MusicXmlSpanKind.Ottava8va ||
            kind === MusicXmlSpanKind.Ottava8vb ||
            kind === MusicXmlSpanKind.Ottava15ma ||
            kind === MusicXmlSpanKind.Ottava15mb
        );
    }

    /**
     * The end of the beats containing the exact position (stops written within the last covered note).
     */
    private _endOfBeatAt(staff: Staff, voiceIndex: number, bound: MusicXmlSpanBound): MusicXmlSpanBound {
        if (bound.exactBarIndex >= staff.bars.length) {
            return bound;
        }
        let end = -1;
        const voices = staff.bars[bound.exactBarIndex].voices;
        for (let v = 0; v < voices.length; v++) {
            if (voiceIndex === -1 || v === voiceIndex) {
                for (const beat of voices[v].beats) {
                    if (beat.displayStart <= bound.exactTicks && bound.exactTicks < beat.displayEnd) {
                        end = Math.max(end, beat.displayEnd);
                    }
                }
            }
        }
        if (end === -1) {
            return bound;
        }
        return {
            barIndex: bound.exactBarIndex,
            ticks: end,
            exactBarIndex: bound.exactBarIndex,
            exactTicks: end,
            sequence: bound.sequence
        };
    }

    /**
     * The beat the element is written at: the beat following it in the document.
     */
    private _writtenBeat(placement: MusicXmlSpanPlacement): Beat | null {
        const sequence = placement.position.sequence;
        if (sequence >= this._beats.length) {
            return null;
        }
        const beat = this._beats[sequence];
        return beat.voice.bar.staff.track === this._track ? beat : null;
    }

    private _applyPedal(span: MusicXmlSpan) {
        // pedal markers are placed on a single staff at their exact position
        const staffIndex = span.start!.staffIndex === -1 ? 0 : span.start!.staffIndex;
        if (staffIndex >= this._track.staves.length) {
            return;
        }
        const staff = this._track.staves[staffIndex];
        this._addPedalMarker(staff, this._bound(span.start!), SustainPedalMarkerType.Down);
        if (span.end !== null) {
            this._addPedalMarker(staff, this._bound(span.end!), SustainPedalMarkerType.Up);
        }
    }

    private _addPedalMarker(staff: Staff, bound: MusicXmlSpanBound, type: SustainPedalMarkerType) {
        if (bound.exactBarIndex >= staff.bars.length) {
            return;
        }
        const bar = staff.bars[bound.exactBarIndex];
        const marker = new SustainPedalMarker();
        marker.pedalType = type;
        marker.ratioPosition =
            bound.exactTicks /
            Math.max(
                this._masterBars[bound.exactBarIndex].calculateDuration(false),
                this._barLengths[bound.exactBarIndex]
            );
        bar.sustainPedals.push(marker);
        if (this._pedalBars.indexOf(bar) === -1) {
            this._pedalBars.push(bar);
        }
    }

    private static _pedalOrder(marker: SustainPedalMarker): number {
        return marker.pedalType === SustainPedalMarkerType.Up ? 0 : 1;
    }

    private _applySimile(span: MusicXmlSpan) {
        const startBar = span.start!.position.barIndex;
        for (const staff of this._track.staves) {
            if (span.start!.staffIndex !== -1 && staff.index !== span.start!.staffIndex) {
                continue;
            }
            const endBar =
                span.end === null ? staff.bars.length : Math.min(span.end!.position.barIndex, staff.bars.length);
            for (let barIndex = startBar; barIndex < endBar; barIndex++) {
                const bar = staff.bars[barIndex];
                if (span.kind === MusicXmlSpanKind.SimileSimple) {
                    bar.simileMark = SimileMark.Simple;
                } else {
                    bar.simileMark =
                        (barIndex - startBar) % 2 === 0 ? SimileMark.FirstOfDouble : SimileMark.SecondOfDouble;
                }
                // the repeated content is played from the repeated bar
                for (const voice of bar.voices) {
                    const emptyBeat = new Beat();
                    emptyBeat.isEmpty = true;
                    voice.addBeat(emptyBeat);
                }
            }
        }
    }

    private _compareStart(a: MusicXmlSpan, b: MusicXmlSpan): number {
        const pa = a.start!.position;
        const pb = b.start!.position;
        return MusicXmlSpanApplier._compare(pa.barIndex, pa.ticks, pb.barIndex, pb.ticks);
    }

    /**
     * Normalizes the placement to the bar it refers to (e.g. offsets crossing bar lines).
     */
    private _bound(placement: MusicXmlSpanPlacement): MusicXmlSpanBound {
        const position = placement.position;
        const bound: MusicXmlSpanBound = {
            barIndex: position.barIndex,
            ticks: position.ticks,
            exactBarIndex: position.barIndex,
            exactTicks: position.ticks + position.offset,
            sequence: position.sequence
        };
        while (bound.exactTicks < 0 && bound.exactBarIndex > 0) {
            bound.exactBarIndex--;
            bound.exactTicks += this._barLengths[bound.exactBarIndex];
        }
        while (
            bound.exactBarIndex < this._barLengths.length - 1 &&
            bound.exactTicks > this._barLengths[bound.exactBarIndex]
        ) {
            bound.exactTicks -= this._barLengths[bound.exactBarIndex];
            bound.exactBarIndex++;
        }
        return bound;
    }
}
