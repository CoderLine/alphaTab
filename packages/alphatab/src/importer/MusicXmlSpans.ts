import { Logger } from '@coderline/alphatab/Logger';
import type { MasterBar } from '@coderline/alphatab/model/MasterBar';
import type { Track } from '@coderline/alphatab/model/Track';
import type { XmlNode } from '@coderline/alphatab/xml/XmlNode';

/**
 * The MusicXML element family encoding a span.
 * Spans of the same family share the number-level slots used to pair starts and stops.
 * @internal
 */
export enum MusicXmlSpanElement {
    /**
     * Lines like `<dashes>` (and `<bracket>`), qualified by the words preceding them in the direction.
     */
    Line = 0
}

/**
 * @internal
 */
export enum MusicXmlSpanAction {
    Start = 0,
    Stop = 1,
    /**
     * Continuation across system breaks, it has no meaning for the time range.
     */
    Continue = 2
}

/**
 * The meaning of a span in the alphaTab model, independent of the MusicXML element encoding it.
 * @internal
 */
export enum MusicXmlSpanKind {
    /**
     * A span without effect on the model. It is still paired to keep the number slots consistent.
     */
    None = 0,
    LetRing = 1,
    PalmMute = 2
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
}

/**
 * A span start, stop or continuation read from a direction.
 * @internal
 * @record
 */
export interface MusicXmlSpanEvent {
    element: MusicXmlSpanElement;
    action: MusicXmlSpanAction;
    kind: MusicXmlSpanKind;
    number: string;
}

/**
 * A span of a part. It is open while only the start is known, and a parked stop while only the end is known.
 * @internal
 * @record
 */
export interface MusicXmlSpan {
    element: MusicXmlSpanElement;
    kind: MusicXmlSpanKind;
    number: string;
    /**
     * The index of the staff the span is placed on, -1 if the direction did not specify a staff.
     */
    staffIndex: number;
    start: MusicXmlSpanPosition | null;
    /**
     * The exclusive end of the span, null while (or if) the span is not closed.
     */
    end: MusicXmlSpanPosition | null;
}

/**
 * Pairs the span starts and stops of a part and collects the resulting time ranges.
 *
 * - The `number` identifies concurrent spans of the same element family within the part (MusicXML number-level).
 *   Exporters reuse numbers across staves (e.g. MuseScore), hence a match on the same staff is preferred.
 *   Before numbers were respected, the words were the only identity of a span. Hence a match of the same kind is preferred.
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
     * Processes all span events of a single direction at the given position.
     */
    public processDirection(events: MusicXmlSpanEvent[], staffIndex: number, position: MusicXmlSpanPosition) {
        // a direction ending one span and starting the next one, ends the first one first
        for (const e of events) {
            if (e.action === MusicXmlSpanAction.Stop) {
                this._stop(e, staffIndex, position);
            }
        }
        for (const e of events) {
            switch (e.action) {
                case MusicXmlSpanAction.Start:
                    this._start(e, staffIndex, position);
                    break;
                case MusicXmlSpanAction.Continue:
                    // a continuation without start (e.g. a partial export) acts as start
                    if (this._findOpen(e, staffIndex) === -1 && e.kind !== MusicXmlSpanKind.None) {
                        this._start(e, staffIndex, position);
                    }
                    break;
            }
        }
    }

    /**
     * Completes the tracking at the end of the part.
     * @returns The spans with an effect on the model, unclosed spans run to the end of the part.
     */
    public finish(masterBars: MasterBar[]): MusicXmlSpan[] {
        for (const s of this._open) {
            if (s.kind !== MusicXmlSpanKind.None) {
                Logger.warning('MusicXML', `Span ${s.number} is not closed, it continues until the end of the part`);
                this._closed.push(s);
            }
        }
        this._open = [];
        this._parkedStops = [];

        for (const s of this._closed) {
            s.start = MusicXmlSpanTracker._normalize(s.start!, masterBars);
            if (s.end !== null) {
                s.end = MusicXmlSpanTracker._normalize(s.end!, masterBars);
            }
        }

        const spans = this._closed;
        this._closed = [];
        return spans;
    }

    /**
     * Whether the span covers a beat starting at the given position.
     */
    public static covers(span: MusicXmlSpan, barIndex: number, ticks: number): boolean {
        if (MusicXmlSpanTracker._compare(span.start!, barIndex, ticks) > 0) {
            return false;
        }
        return span.end === null || MusicXmlSpanTracker._compare(span.end!, barIndex, ticks) > 0;
    }

    private _stop(e: MusicXmlSpanEvent, staffIndex: number, position: MusicXmlSpanPosition) {
        const index = this._findOpen(e, staffIndex);
        if (index === -1) {
            this._parkedStops.push({
                element: e.element,
                kind: e.kind,
                number: e.number,
                staffIndex: staffIndex,
                start: null,
                end: position
            });
            return;
        }

        const span = this._open[index];
        this._open.splice(index, 1);
        span.end = position;
        this._close(span);
    }

    private _start(e: MusicXmlSpanEvent, staffIndex: number, position: MusicXmlSpanPosition) {
        // the stop of this span appeared earlier in the document
        const parked = this._findParkedStop(e, staffIndex, position);
        if (parked !== -1) {
            const span = this._parkedStops[parked];
            this._parkedStops.splice(parked, 1);
            if (e.kind !== MusicXmlSpanKind.None) {
                span.kind = e.kind;
            }
            span.staffIndex = staffIndex;
            span.start = position;
            this._close(span);
            return;
        }

        // the same span started again without stop: the previous one ends here
        for (let i = 0; i < this._open.length; i++) {
            const open = this._open[i];
            if (
                open.element === e.element &&
                open.number === e.number &&
                open.kind === e.kind &&
                open.staffIndex === staffIndex
            ) {
                this._open.splice(i, 1);
                open.end = position;
                this._close(open);
                break;
            }
        }

        this._open.push({
            element: e.element,
            kind: e.kind,
            number: e.number,
            staffIndex: staffIndex,
            start: position,
            end: null
        });
    }

    private _close(span: MusicXmlSpan) {
        if (span.kind !== MusicXmlSpanKind.None) {
            this._closed.push(span);
        }
    }

    private _findOpen(e: MusicXmlSpanEvent, staffIndex: number): number {
        let best = -1;
        let bestScore = -1;
        for (let i = 0; i < this._open.length; i++) {
            const score = MusicXmlSpanTracker._matchScore(this._open[i], e, staffIndex);
            // on equal scores the most recently started span wins
            if (score >= bestScore) {
                best = i;
                bestScore = score;
            }
        }
        return best;
    }

    private _findParkedStop(e: MusicXmlSpanEvent, staffIndex: number, position: MusicXmlSpanPosition): number {
        let best = -1;
        let bestScore = -1;
        for (let i = 0; i < this._parkedStops.length; i++) {
            const parked = this._parkedStops[i];
            // a stop not after the start position belongs to a span which never started (e.g. stop and restart in one direction)
            if (MusicXmlSpanTracker._compare(parked.end!, position.barIndex, position.ticks) <= 0) {
                continue;
            }
            const score = MusicXmlSpanTracker._matchScore(parked, e, staffIndex);
            if (score >= bestScore) {
                best = i;
                bestScore = score;
            }
        }
        return best;
    }

    /**
     * -1 if the span does not match, otherwise the higher the better the span matches.
     */
    private static _matchScore(span: MusicXmlSpan, e: MusicXmlSpanEvent, staffIndex: number): number {
        if (span.element !== e.element || span.number !== e.number) {
            return -1;
        }
        let score = 0;
        if (e.kind !== MusicXmlSpanKind.None && span.kind === e.kind) {
            score += 2;
        }
        if (span.staffIndex === staffIndex) {
            score += 1;
        }
        return score;
    }

    private static _compare(position: MusicXmlSpanPosition, barIndex: number, ticks: number): number {
        if (position.barIndex !== barIndex) {
            return position.barIndex - barIndex;
        }
        return position.ticks - ticks;
    }

    /**
     * Moves positions shifted across bar lines (e.g. by an offset) into the bar they refer to.
     */
    private static _normalize(position: MusicXmlSpanPosition, masterBars: MasterBar[]): MusicXmlSpanPosition {
        let barIndex = position.barIndex;
        let ticks = position.ticks;
        while (ticks < 0 && barIndex > 0) {
            barIndex--;
            ticks += masterBars[barIndex].calculateDuration(false);
        }
        while (barIndex < masterBars.length - 1 && ticks >= masterBars[barIndex].calculateDuration(false)) {
            ticks -= masterBars[barIndex].calculateDuration(false);
            barIndex++;
        }
        return { barIndex: barIndex, ticks: ticks };
    }
}

/**
 * Reads MusicXML span elements and applies the resulting spans to the model.
 * @internal
 */
export class MusicXmlSpans {
    /**
     * Reads a `<dashes>` element.
     * @param precedingWords The `<words>` preceding the line within the same direction, they define its meaning.
     */
    public static readLine(element: XmlNode, precedingWords: string): MusicXmlSpanEvent | null {
        let action: MusicXmlSpanAction;
        switch (element.getAttribute('type', 'start')) {
            case 'start':
                action = MusicXmlSpanAction.Start;
                break;
            case 'stop':
                action = MusicXmlSpanAction.Stop;
                break;
            case 'continue':
                action = MusicXmlSpanAction.Continue;
                break;
            default:
                return null;
        }

        return {
            element: MusicXmlSpanElement.Line,
            action: action,
            kind: MusicXmlSpans._lineKind(precedingWords),
            number: element.getAttribute('number', '1')
        };
    }

    /**
     * Applies the span to the notes of all beats it covers.
     * Let ring and palm mute are note effects in the model, existing note effects are kept.
     */
    public static apply(span: MusicXmlSpan, track: Track) {
        if (span.kind === MusicXmlSpanKind.None) {
            return;
        }

        for (const staff of track.staves) {
            // a direction without staff in a part with multiple staves applies to all of them (e.g. notation and tablature)
            if (span.staffIndex !== -1 && staff.index !== span.staffIndex) {
                continue;
            }

            const lastBar =
                span.end === null ? staff.bars.length - 1 : Math.min(span.end!.barIndex, staff.bars.length - 1);
            for (let barIndex = span.start!.barIndex; barIndex <= lastBar; barIndex++) {
                for (const voice of staff.bars[barIndex].voices) {
                    for (const beat of voice.beats) {
                        if (MusicXmlSpanTracker.covers(span, barIndex, beat.displayStart)) {
                            for (const note of beat.notes) {
                                switch (span.kind) {
                                    case MusicXmlSpanKind.LetRing:
                                        note.isLetRing = true;
                                        break;
                                    case MusicXmlSpanKind.PalmMute:
                                        note.isPalmMute = true;
                                        break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private static _lineKind(words: string): MusicXmlSpanKind {
        switch (words) {
            case 'LetRing':
                return MusicXmlSpanKind.LetRing;
            case 'P.M.':
                return MusicXmlSpanKind.PalmMute;
            default:
                return MusicXmlSpanKind.None;
        }
    }
}
