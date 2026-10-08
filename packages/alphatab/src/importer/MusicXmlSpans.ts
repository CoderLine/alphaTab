import { Logger } from '@coderline/alphatab/Logger';
import { type Bar, SustainPedalMarker, SustainPedalMarkerType } from '@coderline/alphatab/model/Bar';
import { Beat } from '@coderline/alphatab/model/Beat';
import { CrescendoType } from '@coderline/alphatab/model/CrescendoType';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import type { MasterBar } from '@coderline/alphatab/model/MasterBar';
import type { Note } from '@coderline/alphatab/model/Note';
import { Ottavia } from '@coderline/alphatab/model/Ottavia';
import { SimileMark } from '@coderline/alphatab/model/SimileMark';
import { SlideOutType } from '@coderline/alphatab/model/SlideOutType';
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { Track } from '@coderline/alphatab/model/Track';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import type { Voice } from '@coderline/alphatab/model/Voice';
import type { XmlNode } from '@coderline/alphatab/xml/XmlNode';

/**
 * The MusicXML element encoding a span. Each element has its own number-level slots to pair starts and stops.
 * @internal
 */
export enum MusicXmlSpanElement {
    /**
     * `<direction-type><dashes>`, its meaning is defined by the preceding words.
     */
    Dashes = 0,
    /**
     * `<direction-type><bracket>`, its meaning is defined by the preceding words.
     */
    Bracket = 1,
    /**
     * `<direction-type><wedge>`
     */
    Wedge = 2,
    /**
     * `<direction-type><octave-shift>`
     */
    OctaveShift = 3,
    /**
     * `<direction-type><pedal>`
     */
    Pedal = 4,
    /**
     * `<ornaments><wavy-line>` (trill or vibrato line), anchored to notes.
     */
    WavyLine = 5,
    /**
     * `<measure-style><slash>`
     */
    Slash = 6,
    /**
     * `<measure-style><measure-repeat>`
     */
    MeasureRepeat = 7,
    /**
     * `<barline><ending>`
     */
    Ending = 8,
    /**
     * `<notations><tied>`, anchored to notes.
     */
    Tied = 9,
    /**
     * `<notations><slur>`, anchored to notes.
     */
    Slur = 10,
    /**
     * `<notations><glissando>`, anchored to notes.
     */
    Glissando = 11,
    /**
     * `<notations><slide>`, anchored to notes.
     */
    Slide = 12
}

/**
 * @internal
 */
export enum MusicXmlSpanAction {
    Start = 0,
    Stop = 1,
    /**
     * Continuation across system breaks. It has no meaning for the time range,
     * but starts the span if it was not started (e.g. partial exports).
     */
    Continue = 2
}

/**
 * The meaning of a span in the alphaTab model, independent of the MusicXML element encoding it.
 * @internal
 */
export enum MusicXmlSpanKind {
    /**
     * A span without effect on the model (e.g. unknown words on a line, unsupported octave shift sizes).
     * It is still paired to keep the number slots consistent.
     */
    None = 0,
    LetRing = 1,
    PalmMute = 2,
    Crescendo = 3,
    Decrescendo = 4,
    Ottava8va = 5,
    Ottava8vb = 6,
    Ottava15ma = 7,
    Ottava15mb = 8,
    SustainPedal = 9,
    /**
     * The value is the trill step in semitones.
     */
    Trill = 10,
    Vibrato = 11,
    Slash = 12,
    SimileSimple = 13,
    SimileDouble = 14,
    /**
     * The value is the alternate endings bitflag.
     */
    AlternateEnding = 15,
    Tie = 16,
    Slur = 17,
    Slide = 18
}

/**
 * A musical position within a part.
 * @internal
 * @record
 */
export interface MusicXmlSpanPosition {
    /**
     * The index of the master bar.
     */
    barIndex: number;
    /**
     * The display ticks relative to the start of the bar.
     */
    ticks: number;
    /**
     * The number of beats created in the part before this position (document order).
     * It orders beats without duration (grace notes) at the same ticks.
     */
    sequence: number;
    /**
     * The exact position including the offset of the element (e.g. a stop nudged into the following note).
     * The cursor ({@link barIndex}, {@link ticks}) is the position between the notes the element is written at.
     */
    exactBarIndex: number;
    exactTicks: number;
}

/**
 * A span start, stop or continuation read from the MusicXML.
 * @internal
 * @record
 */
export interface MusicXmlSpanEvent {
    element: MusicXmlSpanElement;
    action: MusicXmlSpanAction;
    kind: MusicXmlSpanKind;
    /**
     * Additional data of the kind (e.g. trill step).
     */
    value: number;
    /**
     * Identifies concurrent spans of the same element (MusicXML number-level, the pitch for ties).
     */
    number: string;
    /**
     * The index of the staff the event is placed on, -1 if not specified.
     */
    staffIndex: number;
    /**
     * The raw MusicXML voice the event is placed in, empty if not specified.
     */
    voice: string;
    /**
     * The raw MusicXML voice of the note the event is written at (the following note), empty if unknown.
     */
    writtenVoice: string;
    position: MusicXmlSpanPosition;
    /**
     * The note the event is attached to (for spans anchored to notes).
     */
    note: Note | null;
    /**
     * Whether the stop is placed within the last covered beat instead of after it (e.g. octave shifts of Finale and Sibelius).
     */
    endIncludesBeat: boolean;
}

/**
 * A span of a part. It is open while only the start is known, and a parked stop while only the end is known.
 * @internal
 * @record
 */
export interface MusicXmlSpan {
    element: MusicXmlSpanElement;
    kind: MusicXmlSpanKind;
    value: number;
    number: string;
    staffIndex: number;
    voice: string;
    writtenVoice: string;
    start: MusicXmlSpanPosition | null;
    /**
     * The exclusive end of the span, null if the span is not closed.
     */
    end: MusicXmlSpanPosition | null;
    startNote: Note | null;
    endNote: Note | null;
    endIncludesBeat: boolean;
}

/**
 * Pairs the span starts and stops of a part and collects the resulting spans.
 *
 * - The `number` identifies concurrent spans of the same element within the part (MusicXML number-level).
 *   Exporters reuse numbers across staves (e.g. MuseScore), hence a match on the same staff (and voice) is preferred.
 *   Lines were identified by their words before numbers were respected, hence a line of the same kind is preferred.
 * - Start and stop refer to the score order, not the document order: a stop can appear before its start
 *   (e.g. in another voice after a `<backup>`). Such stops are parked until their start appears.
 * - Positions are musical positions (cursor + offset), the stop is the exclusive end of the span.
 *   Exporters write the stop after the last covered note (e.g. MuseScore).
 * @internal
 */
export class MusicXmlSpanTracker {
    private _open: MusicXmlSpan[] = [];
    private _parkedStops: MusicXmlSpan[] = [];
    private _closed: MusicXmlSpan[] = [];

    /**
     * Processes the span events of a single element (e.g. direction, notations) which share the same position.
     */
    public process(events: MusicXmlSpanEvent[]) {
        // an element ending one span and starting the next one, ends the first one first
        for (const e of events) {
            if (e.action === MusicXmlSpanAction.Stop) {
                this._stop(e);
            }
        }
        for (const e of events) {
            switch (e.action) {
                case MusicXmlSpanAction.Start:
                    this._start(e);
                    break;
                case MusicXmlSpanAction.Continue:
                    if (this._findOpen(e) === -1 && e.kind !== MusicXmlSpanKind.None) {
                        this._start(e);
                    }
                    break;
            }
        }
    }

    /**
     * Adds a span which is complete on its own (e.g. a trill mark without line on a single note).
     */
    public add(span: MusicXmlSpan) {
        this._closed.push(span);
    }

    /**
     * Completes the tracking at the end of the part.
     * @returns The spans with an effect on the model ordered by their start, unclosed spans run to the end of the part.
     */
    public finish(track: Track, masterBars: MasterBar[]): MusicXmlSpan[] {
        for (const s of this._open) {
            if (s.kind === MusicXmlSpanKind.None) {
                continue;
            }
            if (MusicXmlSpanTracker._isLink(s.element)) {
                // ties without end are tied to the next note (resolved when applied), other links have no meaning
                if (s.element === MusicXmlSpanElement.Tied) {
                    this._closed.push(s);
                }
                continue;
            }
            if (s.element === MusicXmlSpanElement.WavyLine) {
                // a trill without end covers its start note
                s.endNote = s.startNote;
            } else {
                Logger.warning('MusicXML', `Span ${s.number} is not closed, it continues until the end of the part`);
            }
            this._closed.push(s);
        }
        for (const s of this._parkedStops) {
            // an ending stop without start marks its own bar
            if (s.element === MusicXmlSpanElement.Ending) {
                s.start = MusicXmlSpans.position(s.end!.barIndex - 1, 0, s.end!.sequence, 0);
                this._closed.push(s);
            }
        }
        this._open = [];
        this._parkedStops = [];

        // positions shifted across bar lines (e.g. by an offset) belong to the bar they refer to
        const barLengths: number[] = [];
        for (const masterBar of masterBars) {
            barLengths.push(MusicXmlSpanTracker._barLength(track, masterBar));
        }
        for (const s of this._closed) {
            if (s.start !== null) {
                s.start = MusicXmlSpanTracker._normalize(s.start!, barLengths);
            }
            if (s.end !== null) {
                s.end = MusicXmlSpanTracker._normalize(s.end!, barLengths);
            }
        }

        // stable sort by start, later spans override the values of earlier ones
        const spans: MusicXmlSpan[] = [];
        for (const s of this._closed) {
            let index = spans.length;
            while (index > 0 && MusicXmlSpanTracker._comparePositions(spans[index - 1].start!, s.start!) > 0) {
                index--;
            }
            spans.splice(index, 0, s);
        }
        this._closed = [];
        return spans;
    }

    private _stop(e: MusicXmlSpanEvent) {
        const index = this._findOpen(e);
        if (index === -1) {
            const parked = MusicXmlSpanTracker._createSpan(e);
            parked.end = e.position;
            parked.endNote = e.note;
            this._parkedStops.push(parked);
            return;
        }

        const span = this._open[index];
        this._open.splice(index, 1);
        span.end = e.position;
        span.endNote = e.note;
        span.endIncludesBeat = e.endIncludesBeat;
        this._close(span);
    }

    private _start(e: MusicXmlSpanEvent) {
        // the stop of this span appeared earlier in the document
        const parked = this._findParkedStop(e);
        if (parked !== -1) {
            const stopped = this._parkedStops[parked];
            this._parkedStops.splice(parked, 1);
            if (e.kind !== MusicXmlSpanKind.None) {
                stopped.kind = e.kind;
            }
            stopped.value = e.value;
            stopped.staffIndex = e.staffIndex;
            stopped.voice = e.voice;
            stopped.writtenVoice = e.writtenVoice;
            stopped.start = e.position;
            stopped.startNote = e.note;
            this._close(stopped);
            return;
        }

        // the same span started again without stop: the previous one ends here
        for (let i = 0; i < this._open.length; i++) {
            const open = this._open[i];
            if (MusicXmlSpanTracker._isRestart(open, e)) {
                this._open.splice(i, 1);
                if (open.element === MusicXmlSpanElement.Tied) {
                    // a tie without end, tied to the next note (resolved when applied)
                    this._close(open);
                } else if (!MusicXmlSpanTracker._isLink(open.element)) {
                    open.end = e.position;
                    this._close(open);
                }
                break;
            }
        }

        const span = MusicXmlSpanTracker._createSpan(e);
        span.start = e.position;
        span.startNote = e.note;
        this._open.push(span);
    }

    private _close(span: MusicXmlSpan) {
        if (span.kind !== MusicXmlSpanKind.None) {
            this._closed.push(span);
        }
    }

    private _findOpen(e: MusicXmlSpanEvent): number {
        // ties are paired in order (e.g. unisons in chords), all others with the most recent one
        const firstWins = e.element === MusicXmlSpanElement.Tied;
        let best = -1;
        let bestScore = -1;
        for (let i = 0; i < this._open.length; i++) {
            const score = MusicXmlSpanTracker._matchScore(this._open[i], e);
            if (score > bestScore || (score === bestScore && score >= 0 && !firstWins)) {
                best = i;
                bestScore = score;
            }
        }
        return best;
    }

    private _findParkedStop(e: MusicXmlSpanEvent): number {
        let best = -1;
        let bestScore = -1;
        for (let i = 0; i < this._parkedStops.length; i++) {
            const parked = this._parkedStops[i];
            // a stop not after the start belongs to a span which never started (e.g. stop and restart in one direction)
            if (MusicXmlSpanTracker._comparePositions(parked.end!, e.position) <= 0) {
                continue;
            }
            const score = MusicXmlSpanTracker._matchScore(parked, e);
            if (score >= 0 && score >= bestScore) {
                best = i;
                bestScore = score;
            }
        }
        return best;
    }

    /**
     * -1 if the span does not match the event, otherwise the higher the better it matches.
     */
    private static _matchScore(span: MusicXmlSpan, e: MusicXmlSpanEvent): number {
        if (span.element !== e.element || span.number !== e.number) {
            return -1;
        }
        // the model links notes within a staff only
        if (MusicXmlSpanTracker._isLink(span.element) && span.staffIndex !== e.staffIndex) {
            return -1;
        }
        let score = 0;
        if (MusicXmlSpanTracker._isIdentifiedByWords(span.element) && e.kind !== MusicXmlSpanKind.None) {
            if (span.kind === e.kind) {
                score += 8;
            }
        }
        if (span.element === MusicXmlSpanElement.Tied) {
            // unisons on different strings
            const spanNote = span.startNote !== null ? span.startNote : span.endNote;
            if (spanNote !== null && e.note !== null && spanNote!.string === e.note!.string) {
                score += 4;
            }
        }
        if (span.staffIndex === e.staffIndex) {
            score += 2;
        }
        if (span.voice === e.voice) {
            score += 1;
        }
        return score;
    }

    private static _isRestart(open: MusicXmlSpan, e: MusicXmlSpanEvent): boolean {
        if (open.element !== e.element || open.number !== e.number || open.staffIndex !== e.staffIndex) {
            return false;
        }
        if (open.voice !== e.voice) {
            return false;
        }
        if (MusicXmlSpanTracker._isIdentifiedByWords(open.element) && open.kind !== e.kind) {
            return false;
        }
        // notes of the same chord can start multiple links (e.g. ties on unisons)
        if (open.startNote !== null && e.note !== null && open.startNote!.beat === e.note!.beat) {
            return false;
        }
        return true;
    }

    private static _isIdentifiedByWords(element: MusicXmlSpanElement): boolean {
        return element === MusicXmlSpanElement.Dashes || element === MusicXmlSpanElement.Bracket;
    }

    private static _isLink(element: MusicXmlSpanElement): boolean {
        switch (element) {
            case MusicXmlSpanElement.Tied:
            case MusicXmlSpanElement.Slur:
            case MusicXmlSpanElement.Glissando:
            case MusicXmlSpanElement.Slide:
                return true;
            default:
                return false;
        }
    }

    private static _createSpan(e: MusicXmlSpanEvent): MusicXmlSpan {
        return {
            element: e.element,
            kind: e.kind,
            value: e.value,
            number: e.number,
            staffIndex: e.staffIndex,
            voice: e.voice,
            writtenVoice: e.writtenVoice,
            start: null,
            end: null,
            startNote: null,
            endNote: null,
            endIncludesBeat: false
        };
    }

    /**
     * The length of the bar in the part, bars can be fuller or emptier than the time signature (e.g. anacrusis, cadenza).
     */
    private static _barLength(track: Track, masterBar: MasterBar): number {
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
        return length > 0 ? length : masterBar.calculateDuration(false);
    }

    private static _normalize(position: MusicXmlSpanPosition, barLengths: number[]): MusicXmlSpanPosition {
        const normalized = MusicXmlSpans.position(position.barIndex, position.ticks, position.sequence, 0);
        MusicXmlSpanTracker._normalizeTicks(normalized, position.barIndex, position.ticks, barLengths, false);
        MusicXmlSpanTracker._normalizeTicks(normalized, position.exactBarIndex, position.exactTicks, barLengths, true);
        return normalized;
    }

    private static _normalizeTicks(
        position: MusicXmlSpanPosition,
        barIndex: number,
        ticks: number,
        barLengths: number[],
        exact: boolean
    ) {
        while (ticks < 0 && barIndex > 0) {
            barIndex--;
            ticks += barLengths[barIndex];
        }
        while (barIndex < barLengths.length - 1 && ticks > barLengths[barIndex]) {
            ticks -= barLengths[barIndex];
            barIndex++;
        }
        if (exact) {
            position.exactBarIndex = barIndex;
            position.exactTicks = ticks;
        } else {
            position.barIndex = barIndex;
            position.ticks = ticks;
        }
    }

    public static comparePosition(position: MusicXmlSpanPosition, barIndex: number, ticks: number): number {
        if (position.barIndex !== barIndex) {
            return position.barIndex - barIndex;
        }
        return position.ticks - ticks;
    }

    private static _comparePositions(a: MusicXmlSpanPosition, b: MusicXmlSpanPosition): number {
        return MusicXmlSpanTracker.comparePosition(a, b.barIndex, b.ticks);
    }
}

/**
 * Reads MusicXML span elements and applies the resulting spans to the model.
 * @internal
 */
export class MusicXmlSpans {
    /**
     * Creates a position at the given cursor with the offset of the element.
     */
    public static position(barIndex: number, ticks: number, sequence: number, offset: number): MusicXmlSpanPosition {
        return {
            barIndex: barIndex,
            ticks: ticks,
            sequence: sequence,
            exactBarIndex: barIndex,
            exactTicks: ticks + offset
        };
    }

    /**
     * Creates an event with the given identity, the placement is filled by the caller.
     */
    public static createEvent(
        element: MusicXmlSpanElement,
        action: MusicXmlSpanAction,
        kind: MusicXmlSpanKind,
        number: string
    ): MusicXmlSpanEvent {
        return {
            element: element,
            action: action,
            kind: kind,
            value: 0,
            number: number,
            staffIndex: -1,
            voice: '',
            writtenVoice: '',
            position: MusicXmlSpans.position(0, 0, 0, 0),
            note: null,
            endIncludesBeat: false
        };
    }

    /**
     * Reads a `<dashes>` or `<bracket>` element.
     * @param words The `<words>` labelling the line, they define its meaning.
     */
    public static readLine(
        element: XmlNode,
        lineElement: MusicXmlSpanElement,
        words: string,
        events: MusicXmlSpanEvent[]
    ) {
        const action = MusicXmlSpans._readAction(element.getAttribute('type', 'start'));
        if (action === null) {
            return;
        }
        events.push(
            MusicXmlSpans.createEvent(
                lineElement,
                action!,
                MusicXmlSpans.lineKind(words),
                element.getAttribute('number', '1')
            )
        );
    }

    /**
     * The meaning of a line labelled with the given words.
     * Exporters use different spellings (e.g. alphaTab "LetRing", MuseScore "let ring").
     */
    public static lineKind(words: string): MusicXmlSpanKind {
        switch (words.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()) {
            case 'letring':
                return MusicXmlSpanKind.LetRing;
            case 'pm':
            case 'palmmute':
                return MusicXmlSpanKind.PalmMute;
            default:
                return MusicXmlSpanKind.None;
        }
    }

    /**
     * Reads a `<wedge>` element.
     */
    public static readWedge(element: XmlNode, events: MusicXmlSpanEvent[]) {
        const number = element.getAttribute('number', '1');
        switch (element.getAttribute('type')) {
            case 'crescendo':
                events.push(
                    MusicXmlSpans.createEvent(
                        MusicXmlSpanElement.Wedge,
                        MusicXmlSpanAction.Start,
                        MusicXmlSpanKind.Crescendo,
                        number
                    )
                );
                break;
            case 'diminuendo':
                events.push(
                    MusicXmlSpans.createEvent(
                        MusicXmlSpanElement.Wedge,
                        MusicXmlSpanAction.Start,
                        MusicXmlSpanKind.Decrescendo,
                        number
                    )
                );
                break;
            case 'stop':
                events.push(
                    MusicXmlSpans.createEvent(
                        MusicXmlSpanElement.Wedge,
                        MusicXmlSpanAction.Stop,
                        MusicXmlSpanKind.None,
                        number
                    )
                );
                break;
            case 'continue':
                events.push(
                    MusicXmlSpans.createEvent(
                        MusicXmlSpanElement.Wedge,
                        MusicXmlSpanAction.Continue,
                        MusicXmlSpanKind.None,
                        number
                    )
                );
                break;
        }
    }

    /**
     * Reads an `<octave-shift>` element.
     */
    public static readOctaveShift(element: XmlNode, events: MusicXmlSpanEvent[]) {
        const number = element.getAttribute('number', '1');
        const size = Number.parseInt(element.getAttribute('size', '8'), 10);
        let action: MusicXmlSpanAction = MusicXmlSpanAction.Start;
        let kind = MusicXmlSpanKind.None;
        // the type is the direction the notes are displayed shifted to compared to their sounding pitch
        switch (element.getAttribute('type')) {
            case 'down':
                kind =
                    size === 8
                        ? MusicXmlSpanKind.Ottava8va
                        : size === 15
                          ? MusicXmlSpanKind.Ottava15ma
                          : MusicXmlSpanKind.None;
                break;
            case 'up':
                kind =
                    size === 8
                        ? MusicXmlSpanKind.Ottava8vb
                        : size === 15
                          ? MusicXmlSpanKind.Ottava15mb
                          : MusicXmlSpanKind.None;
                break;
            case 'stop':
                action = MusicXmlSpanAction.Stop;
                break;
            case 'continue':
                action = MusicXmlSpanAction.Continue;
                break;
            default:
                return;
        }
        events.push(MusicXmlSpans.createEvent(MusicXmlSpanElement.OctaveShift, action, kind, number));
    }

    /**
     * Reads a `<pedal>` element.
     */
    public static readPedal(element: XmlNode, events: MusicXmlSpanEvent[]) {
        const number = element.getAttribute('number', '1');
        switch (element.getAttribute('type')) {
            case 'start':
            // a pedal line continuing after a discontinue
            case 'resume':
                events.push(
                    MusicXmlSpans.createEvent(
                        MusicXmlSpanElement.Pedal,
                        MusicXmlSpanAction.Start,
                        MusicXmlSpanKind.SustainPedal,
                        number
                    )
                );
                break;
            case 'stop':
            // a pedal line ending without explicit lift
            case 'discontinue':
                events.push(
                    MusicXmlSpans.createEvent(
                        MusicXmlSpanElement.Pedal,
                        MusicXmlSpanAction.Stop,
                        MusicXmlSpanKind.None,
                        number
                    )
                );
                break;
            // lift and retake
            case 'change':
                events.push(
                    MusicXmlSpans.createEvent(
                        MusicXmlSpanElement.Pedal,
                        MusicXmlSpanAction.Stop,
                        MusicXmlSpanKind.None,
                        number
                    )
                );
                events.push(
                    MusicXmlSpans.createEvent(
                        MusicXmlSpanElement.Pedal,
                        MusicXmlSpanAction.Start,
                        MusicXmlSpanKind.SustainPedal,
                        number
                    )
                );
                break;
            case 'continue':
                events.push(
                    MusicXmlSpans.createEvent(
                        MusicXmlSpanElement.Pedal,
                        MusicXmlSpanAction.Continue,
                        MusicXmlSpanKind.SustainPedal,
                        number
                    )
                );
                break;
            // case 'sostenuto': Not supported
        }
    }

    /**
     * Reads an element linking two notes (e.g. `<slur>`, `<slide>`).
     */
    public static readLink(
        element: XmlNode,
        linkElement: MusicXmlSpanElement,
        kind: MusicXmlSpanKind,
        events: MusicXmlSpanEvent[]
    ) {
        let action: MusicXmlSpanAction;
        switch (element.getAttribute('type')) {
            case 'start':
                action = MusicXmlSpanAction.Start;
                break;
            case 'stop':
                action = MusicXmlSpanAction.Stop;
                break;
            // case 'continue': no meaning for the link
            default:
                return;
        }
        events.push(MusicXmlSpans.createEvent(linkElement, action, kind, element.getAttribute('number', '1')));
    }

    /**
     * Reads a `<wavy-line>` element of the ornaments of a note.
     * @param trillStep The trill step of the trill mark of the note, -1 if the note has no trill mark (the line is a vibrato).
     * @returns The action of the line, null if not supported.
     */
    public static readWavyLine(
        element: XmlNode,
        trillStep: number,
        events: MusicXmlSpanEvent[]
    ): MusicXmlSpanAction | null {
        const action = MusicXmlSpans._readAction(element.getAttribute('type'));
        if (action === null) {
            return null;
        }
        const e = MusicXmlSpans.createEvent(
            MusicXmlSpanElement.WavyLine,
            action!,
            action === MusicXmlSpanAction.Stop
                ? MusicXmlSpanKind.None
                : trillStep >= 0
                  ? MusicXmlSpanKind.Trill
                  : MusicXmlSpanKind.Vibrato,
            element.getAttribute('number', '1')
        );
        e.value = Math.max(trillStep, 0);
        events.push(e);
        return action;
    }

    /**
     * The trill step in semitones of a `trill-step` attribute.
     */
    public static trillStep(trillStep: string): number {
        switch (trillStep) {
            case 'half':
                return 1;
            case 'unison':
                return 0;
            // case 'whole':
            default:
                return 2;
        }
    }

    /**
     * Applies the spans of a part to the model.
     * @param voiceIndexOf Resolves the raw MusicXML voice to the index of the voice on the staff, -1 if not existing.
     * @param beatSequence The document order of the beats (see {@link MusicXmlSpanPosition.sequence}).
     */
    public static apply(
        spans: MusicXmlSpan[],
        track: Track,
        masterBars: MasterBar[],
        voiceIndexOf: (staff: Staff, voice: string) => number,
        beatSequence: Map<Beat, number>
    ) {
        const pedalBars: Bar[] = [];
        for (const span of spans) {
            switch (span.kind) {
                case MusicXmlSpanKind.Tie:
                case MusicXmlSpanKind.Slur:
                case MusicXmlSpanKind.Slide:
                    MusicXmlSpans._applyLink(span);
                    break;
                case MusicXmlSpanKind.Trill:
                case MusicXmlSpanKind.Vibrato:
                    MusicXmlSpans._applyNoteRange(span);
                    break;
                case MusicXmlSpanKind.SustainPedal:
                    MusicXmlSpans._applyPedal(span, track, masterBars, pedalBars);
                    break;
                case MusicXmlSpanKind.AlternateEnding:
                    const lastBar = span.end === null ? masterBars.length : span.end!.barIndex;
                    for (let i = span.start!.barIndex; i < lastBar && i < masterBars.length; i++) {
                        masterBars[i].alternateEndings = masterBars[i].alternateEndings | span.value;
                    }
                    break;
                case MusicXmlSpanKind.SimileSimple:
                case MusicXmlSpanKind.SimileDouble:
                    MusicXmlSpans._applySimile(span, track);
                    break;
                default:
                    MusicXmlSpans._applyBeats(span, track, voiceIndexOf, beatSequence);
                    break;
            }
        }

        // markers of multiple spans, a change lifts before it retakes
        for (const bar of pedalBars) {
            MusicXmlSpans._sortPedalMarkers(bar);
        }
    }

    private static _applyBeats(
        span: MusicXmlSpan,
        track: Track,
        voiceIndexOf: (staff: Staff, voice: string) => number,
        beatSequence: Map<Beat, number>
    ) {
        for (const staff of track.staves) {
            // a direction without staff in a part with multiple staves applies to all of them (e.g. notation and tablature)
            if (span.staffIndex !== -1 && staff.index !== span.staffIndex) {
                continue;
            }

            let voiceIndex = -1;
            if (span.voice.length > 0) {
                voiceIndex = voiceIndexOf(staff, span.voice);
                if (voiceIndex === -1) {
                    continue;
                }
            } else if (
                span.writtenVoice.length > 0 &&
                (span.kind === MusicXmlSpanKind.Crescendo || span.kind === MusicXmlSpanKind.Decrescendo)
            ) {
                // dynamics are shown once per staff, on the voice they are written at
                voiceIndex = voiceIndexOf(staff, span.writtenVoice);
            }

            let end = span.end;
            if (end !== null && span.endIncludesBeat) {
                end = MusicXmlSpans._endOfBeatContaining(staff, voiceIndex, end!);
            }

            const lastBar = end === null ? staff.bars.length - 1 : Math.min(end!.barIndex, staff.bars.length - 1);
            for (let barIndex = span.start!.barIndex; barIndex <= lastBar; barIndex++) {
                const voices = staff.bars[barIndex].voices;
                for (let v = 0; v < voices.length; v++) {
                    if (voiceIndex !== -1 && v !== voiceIndex) {
                        continue;
                    }
                    for (const beat of voices[v].beats) {
                        if (MusicXmlSpans._covers(span.start!, end, barIndex, beat, beatSequence)) {
                            MusicXmlSpans._applyBeat(span, beat);
                        }
                    }
                }
            }
        }
    }

    /**
     * Whether the beat is covered by the span.
     * - Beats next to the position the start or stop is written at (the cursor) are covered as written:
     *   exporters write stops after the last covered note (e.g. MuseScore), or nudge them with an offset into
     *   the next note (e.g. Finale).
     * - Other beats (e.g. in other voices) are covered if their middle is within the exact span (with offsets).
     */
    private static _covers(
        start: MusicXmlSpanPosition,
        end: MusicXmlSpanPosition | null,
        barIndex: number,
        beat: Beat,
        beatSequence: Map<Beat, number>
    ): boolean {
        const sequence = beatSequence.has(beat) ? beatSequence.get(beat)! : -1;
        if (beat.displayEnd <= beat.displayStart) {
            // beats without duration (grace notes)
            return (
                MusicXmlSpans._isAtOrAfter(start, barIndex, beat, sequence) &&
                (end === null || !MusicXmlSpans._isAtOrAfter(end!, barIndex, beat, sequence))
            );
        }

        const middle = (beat.displayStart + beat.displayEnd) / 2;

        let isAfterStart: boolean;
        if (MusicXmlSpans._isBoundary(start, barIndex, beat)) {
            isAfterStart = MusicXmlSpans._isAtOrAfter(start, barIndex, beat, sequence);
        } else {
            isAfterStart = MusicXmlSpans._compareExact(start, barIndex, middle) < 0;
        }
        if (!isAfterStart || end === null) {
            return isAfterStart;
        }

        if (MusicXmlSpans._isBoundary(end!, barIndex, beat)) {
            return !MusicXmlSpans._isAtOrAfter(end!, barIndex, beat, sequence);
        }
        return MusicXmlSpans._compareExact(end!, barIndex, middle) > 0;
    }

    /**
     * Whether the cursor of the position is the start or end of the beat.
     */
    private static _isBoundary(position: MusicXmlSpanPosition, barIndex: number, beat: Beat): boolean {
        return (
            position.barIndex === barIndex &&
            (position.ticks === beat.displayStart || position.ticks === beat.displayEnd)
        );
    }

    private static _compareExact(position: MusicXmlSpanPosition, barIndex: number, ticks: number): number {
        if (position.exactBarIndex !== barIndex) {
            return position.exactBarIndex - barIndex;
        }
        return position.exactTicks - ticks;
    }

    /**
     * Whether the beat starts at or after the given position.
     */
    private static _isAtOrAfter(
        position: MusicXmlSpanPosition,
        barIndex: number,
        beat: Beat,
        sequence: number
    ): boolean {
        const compare = MusicXmlSpanTracker.comparePosition(position, barIndex, beat.displayStart);
        if (compare !== 0) {
            return compare < 0;
        }
        // beats without duration (grace notes) at the same position are ordered as in the document
        if (beat.graceType !== GraceType.None && sequence >= 0) {
            return sequence >= position.sequence;
        }
        return true;
    }

    /**
     * The end of the beats containing the given position (e.g. stops written within the last covered note).
     */
    private static _endOfBeatContaining(
        staff: Staff,
        voiceIndex: number,
        position: MusicXmlSpanPosition
    ): MusicXmlSpanPosition {
        const barIndex = position.exactBarIndex;
        if (barIndex >= staff.bars.length) {
            return position;
        }
        let end = -1;
        const voices = staff.bars[barIndex].voices;
        for (let v = 0; v < voices.length; v++) {
            if (voiceIndex !== -1 && v !== voiceIndex) {
                continue;
            }
            for (const beat of voices[v].beats) {
                if (
                    beat.graceType === GraceType.None &&
                    beat.displayStart <= position.exactTicks &&
                    position.exactTicks < beat.displayEnd
                ) {
                    end = Math.max(end, beat.displayEnd);
                }
            }
        }
        return end === -1 ? position : MusicXmlSpans.position(barIndex, end, position.sequence, 0);
    }

    private static _applyBeat(span: MusicXmlSpan, beat: Beat) {
        switch (span.kind) {
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

    /**
     * Applies spans anchored to notes to all beats from the start to the stop note within their voice.
     */
    private static _applyNoteRange(span: MusicXmlSpan) {
        const startBeat = span.startNote!.beat;
        const endBeat = span.endNote !== null ? span.endNote!.beat : startBeat;
        const staff = startBeat.voice.bar.staff;
        const voiceIndex = startBeat.voice.index;
        const lastBar = Math.min(endBeat.voice.bar.index, staff.bars.length - 1);

        let inRange = false;
        for (let barIndex = startBeat.voice.bar.index; barIndex <= lastBar; barIndex++) {
            const voices = staff.bars[barIndex].voices;
            if (voiceIndex >= voices.length) {
                continue;
            }
            const voice: Voice = voices[voiceIndex];
            for (const beat of voice.beats) {
                if (beat === startBeat) {
                    inRange = true;
                }
                if (inRange) {
                    MusicXmlSpans._applyNoteRangeBeat(span, beat);
                }
                if (beat === endBeat) {
                    return;
                }
            }
        }
    }

    private static _applyNoteRangeBeat(span: MusicXmlSpan, beat: Beat) {
        for (const note of beat.notes) {
            if (note.isPercussion) {
                continue;
            }
            switch (span.kind) {
                case MusicXmlSpanKind.Trill:
                    note.trillValue = note.calculateRealValue(false, false) + span.value;
                    break;
                case MusicXmlSpanKind.Vibrato:
                    if (note.vibrato === VibratoType.None) {
                        note.vibrato = VibratoType.Slight;
                    }
                    break;
            }
        }
    }

    private static _applyLink(span: MusicXmlSpan) {
        const origin = span.startNote!;
        let destination = span.endNote;
        if (span.kind === MusicXmlSpanKind.Tie) {
            destination = MusicXmlSpans._resolveTieDestination(origin, destination);
        }
        if (destination === null) {
            return;
        }
        if (!MusicXmlSpans._isLinkable(origin, destination!)) {
            Logger.warning('MusicXML', 'Ignoring link to a note before its origin');
            return;
        }
        MusicXmlSpans._link(span.kind, origin, destination!);
    }

    private static _link(kind: MusicXmlSpanKind, origin: Note, destination: Note) {
        switch (kind) {
            case MusicXmlSpanKind.Tie:
                if (!destination.isTieDestination) {
                    destination.isTieDestination = true;
                    destination.tieOrigin = origin;
                }
                break;
            case MusicXmlSpanKind.Slur:
                // hammer-ons and pull-offs are drawn with their own slur, exporters write both (e.g. MuseScore)
                if (
                    origin.isHammerPullOrigin &&
                    destination.string === origin.string &&
                    MusicXmlSpans._nextBeatInVoice(origin.beat) === destination.beat
                ) {
                    return;
                }
                destination.isSlurDestination = true;
                origin.slurDestination = destination;
                destination.slurOrigin = origin;
                break;
            case MusicXmlSpanKind.Slide:
                origin.slideTarget = destination;
                destination.slideOrigin = origin;
                origin.slideOutType = SlideOutType.Shift;
                break;
        }
    }

    /**
     * The key identifying ties, the written pitch (see MusicXML spec, the number is rarely given).
     */
    public static tieKey(note: Note): string {
        return `${note.octave * 12 + note.tone}`;
    }

    /**
     * A tie connects a note with the same pitch on the next beat of the voice.
     * Ties without (or with an invalid) end are tied to that note if it exists (e.g. MuseScore import).
     */
    private static _resolveTieDestination(origin: Note, destination: Note | null): Note | null {
        const nextBeat = MusicXmlSpans._nextBeatInVoice(origin.beat);
        if (destination !== null) {
            const destinationBeat = destination!.beat;
            // ties across voices are kept as written
            if (destinationBeat.voice.index !== origin.beat.voice.index || destinationBeat === nextBeat) {
                return destination;
            }
        }
        if (nextBeat === null) {
            return null;
        }

        const key = MusicXmlSpans.tieKey(origin);
        let candidate: Note | null = null;
        for (const note of nextBeat!.notes) {
            if (!note.isTieDestination && MusicXmlSpans.tieKey(note) === key) {
                // unisons on different strings
                if (note.string === origin.string) {
                    return note;
                }
                if (candidate === null) {
                    candidate = note;
                }
            }
        }
        return candidate;
    }

    private static _nextBeatInVoice(beat: Beat): Beat | null {
        const voice = beat.voice;
        const skipGrace = beat.graceType === GraceType.None;
        let index = voice.beats.indexOf(beat) + 1;
        let beats = voice.beats;
        let bar = voice.bar;
        while (true) {
            while (index < beats.length) {
                if (!skipGrace || beats[index].graceType === GraceType.None) {
                    return beats[index];
                }
                index++;
            }
            const staff = bar.staff;
            if (bar.index + 1 >= staff.bars.length || voice.index >= staff.bars[bar.index + 1].voices.length) {
                return null;
            }
            bar = staff.bars[bar.index + 1];
            beats = bar.voices[voice.index].beats;
            index = 0;
        }
    }

    /**
     * The model resolves the origin of a link before its destination (bar by bar, voice by voice).
     */
    private static _isLinkable(origin: Note, destination: Note): boolean {
        const originBeat = origin.beat;
        const destinationBeat = destination.beat;
        if (originBeat.voice.bar.index !== destinationBeat.voice.bar.index) {
            return originBeat.voice.bar.index < destinationBeat.voice.bar.index;
        }
        if (originBeat.voice.index !== destinationBeat.voice.index) {
            return originBeat.voice.index < destinationBeat.voice.index;
        }
        const beats = originBeat.voice.beats;
        return beats.indexOf(originBeat) < beats.indexOf(destinationBeat);
    }

    private static _applyPedal(span: MusicXmlSpan, track: Track, masterBars: MasterBar[], pedalBars: Bar[]) {
        const staffIndex = span.staffIndex === -1 ? 0 : span.staffIndex;
        if (staffIndex >= track.staves.length) {
            return;
        }
        const staff = track.staves[staffIndex];
        MusicXmlSpans._addPedalMarker(staff, masterBars, span.start!, SustainPedalMarkerType.Down, pedalBars);
        if (span.end !== null) {
            MusicXmlSpans._addPedalMarker(staff, masterBars, span.end!, SustainPedalMarkerType.Up, pedalBars);
        }
    }

    private static _addPedalMarker(
        staff: Staff,
        masterBars: MasterBar[],
        position: MusicXmlSpanPosition,
        type: SustainPedalMarkerType,
        pedalBars: Bar[]
    ) {
        if (position.barIndex >= staff.bars.length) {
            return;
        }
        // pedal markers are placed at the exact position
        const barIndex = position.exactBarIndex;
        if (barIndex >= staff.bars.length) {
            return;
        }
        const bar = staff.bars[barIndex];
        const marker = new SustainPedalMarker();
        marker.pedalType = type;
        marker.ratioPosition = position.exactTicks / masterBars[barIndex].calculateDuration(false);
        bar.sustainPedals.push(marker);
        if (pedalBars.indexOf(bar) === -1) {
            pedalBars.push(bar);
        }
    }

    private static _sortPedalMarkers(bar: Bar) {
        const sorted: SustainPedalMarker[] = [];
        for (const marker of bar.sustainPedals) {
            let index = sorted.length;
            while (index > 0 && MusicXmlSpans._comparePedalMarkers(sorted[index - 1], marker) > 0) {
                index--;
            }
            sorted.splice(index, 0, marker);
        }
        bar.sustainPedals = sorted;
    }

    private static _comparePedalMarkers(a: SustainPedalMarker, b: SustainPedalMarker): number {
        if (a.ratioPosition !== b.ratioPosition) {
            return a.ratioPosition - b.ratioPosition;
        }
        // at the same position the lift comes before the retake
        const aUp = a.pedalType === SustainPedalMarkerType.Up ? 0 : 1;
        const bUp = b.pedalType === SustainPedalMarkerType.Up ? 0 : 1;
        return aUp - bUp;
    }

    private static _applySimile(span: MusicXmlSpan, track: Track) {
        for (const staff of track.staves) {
            if (span.staffIndex !== -1 && staff.index !== span.staffIndex) {
                continue;
            }
            const lastBar = span.end === null ? staff.bars.length : Math.min(span.end!.barIndex, staff.bars.length);
            for (let barIndex = span.start!.barIndex; barIndex < lastBar; barIndex++) {
                const bar = staff.bars[barIndex];
                if (span.kind === MusicXmlSpanKind.SimileSimple) {
                    bar.simileMark = SimileMark.Simple;
                } else {
                    bar.simileMark =
                        (barIndex - span.start!.barIndex) % 2 === 0
                            ? SimileMark.FirstOfDouble
                            : SimileMark.SecondOfDouble;
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

    private static _readAction(type: string): MusicXmlSpanAction | null {
        switch (type) {
            case 'start':
                return MusicXmlSpanAction.Start;
            case 'stop':
                return MusicXmlSpanAction.Stop;
            case 'continue':
                return MusicXmlSpanAction.Continue;
            default:
                return null;
        }
    }
}
