import { Logger } from '@coderline/alphatab/Logger';
import type { XmlNode } from '@coderline/alphatab/xml/XmlNode';

/**
 * The MusicXML element encoding a span. Each element has its own number-level slots to pair starts and stops.
 * @internal
 */
export enum MusicXmlSpanElement {
    Dashes = 0,
    Bracket = 1,
    Wedge = 2,
    OctaveShift = 3,
    Pedal = 4,
    Slash = 5,
    MeasureRepeat = 6
}

/**
 * @internal
 */
export enum MusicXmlSpanAction {
    Start = 0,
    Stop = 1,
    /**
     * Continuation across system breaks, starts the span if it was not started (e.g. partial exports).
     */
    Continue = 2
}

/**
 * The meaning of a span in the alphaTab model.
 * @internal
 */
export enum MusicXmlSpanKind {
    /**
     * No effect on the model (e.g. unknown words on a line), the span is still paired to keep the numbers consistent.
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
    Slash = 10,
    SimileSimple = 11,
    SimileDouble = 12
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
     * The display ticks of the cursor (between the notes the element is written at), relative to the start of the bar.
     */
    ticks: number;
    /**
     * The `<offset>` in display ticks, the element is shown at the cursor plus the offset.
     */
    offset: number;
    /**
     * The number of beats created before this position in the document, the index of the following beat.
     */
    sequence: number;
}

/**
 * Where a span element is written.
 * @internal
 * @record
 */
export interface MusicXmlSpanPlacement {
    /**
     * The index of the staff, -1 if not specified.
     */
    staffIndex: number;
    /**
     * The raw MusicXML voice, empty if not specified.
     */
    voice: string;
    position: MusicXmlSpanPosition;
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
     * The MusicXML number-level identifying concurrent spans of the same element.
     */
    number: string;
}

/**
 * A paired span. Open while only the start is known, a parked stop while only the end is known.
 * @internal
 * @record
 */
export interface MusicXmlSpan {
    element: MusicXmlSpanElement;
    kind: MusicXmlSpanKind;
    number: string;
    start: MusicXmlSpanPlacement | null;
    /**
     * The exclusive end, null if the span is not closed.
     */
    end: MusicXmlSpanPlacement | null;
}

/**
 * Pairs the span starts and stops of a part.
 *
 * - The `number` identifies concurrent spans of the same element within the part (MusicXML number-level).
 *   Exporters reuse numbers across staves (e.g. MuseScore), hence spans on different staves never match.
 *   Lines were identified by their words before numbers were respected, hence a line of the same kind is preferred.
 * - Start and stop refer to the score order, not the document order: a stop can appear before its start
 *   (e.g. in another voice after a `<backup>`). Such stops are parked until their start appears.
 * @internal
 */
export class MusicXmlSpanTracker {
    private _open: MusicXmlSpan[] = [];
    private _parkedStops: MusicXmlSpan[] = [];
    private _closed: MusicXmlSpan[] = [];

    /**
     * Processes the span events of a single element (e.g. direction) written at the given placement.
     */
    public process(events: MusicXmlSpanEvent[], placement: MusicXmlSpanPlacement) {
        // an element ending one span and starting the next one, ends the first one first
        for (const e of events) {
            if (e.action === MusicXmlSpanAction.Stop) {
                this._stop(e, placement);
            }
        }
        for (const e of events) {
            if (
                e.action === MusicXmlSpanAction.Start ||
                (e.action === MusicXmlSpanAction.Continue &&
                    e.kind !== MusicXmlSpanKind.None &&
                    MusicXmlSpanTracker._bestMatch(this._open, e, placement) === -1)
            ) {
                this._start(e, placement);
            }
        }
    }

    /**
     * Completes the tracking at the end of the part.
     * @returns The spans with an effect on the model, unclosed spans run to the end of the part.
     */
    public finish(): MusicXmlSpan[] {
        for (const s of this._open) {
            if (s.kind !== MusicXmlSpanKind.None) {
                Logger.warning('MusicXML', `Span ${s.number} is not closed, it continues until the end of the part`);
                this._closed.push(s);
            }
        }
        const spans = this._closed;
        this._open = [];
        this._parkedStops = [];
        this._closed = [];
        return spans;
    }

    private _stop(e: MusicXmlSpanEvent, placement: MusicXmlSpanPlacement) {
        const index = MusicXmlSpanTracker._bestMatch(this._open, e, placement);
        if (index === -1) {
            this._parkedStops.push({ element: e.element, kind: e.kind, number: e.number, start: null, end: placement });
            return;
        }
        const span = this._open[index];
        this._open.splice(index, 1);
        span.end = placement;
        if (span.kind === MusicXmlSpanKind.None) {
            span.kind = e.kind;
        }
        this._close(span);
    }

    private _start(e: MusicXmlSpanEvent, placement: MusicXmlSpanPlacement) {
        // the stop of this span appeared earlier in the document
        const parked = MusicXmlSpanTracker._bestMatch(this._parkedStops, e, placement);
        if (parked !== -1) {
            const span = this._parkedStops[parked];
            this._parkedStops.splice(parked, 1);
            if (e.kind !== MusicXmlSpanKind.None) {
                span.kind = e.kind;
            }
            span.start = placement;
            this._close(span);
            return;
        }

        // the same span started again without stop: the previous one ends here
        const restarted = MusicXmlSpanTracker._bestMatch(this._open, e, placement);
        if (restarted !== -1 && MusicXmlSpanTracker._isSame(this._open[restarted], e, placement)) {
            const span = this._open[restarted];
            this._open.splice(restarted, 1);
            span.end = placement;
            this._close(span);
        }

        this._open.push({ element: e.element, kind: e.kind, number: e.number, start: placement, end: null });
    }

    private _close(span: MusicXmlSpan) {
        if (span.kind !== MusicXmlSpanKind.None) {
            this._closed.push(span);
        }
    }

    /**
     * The best matching span for the event, -1 if none matches. Parked stops only match if they are after the start.
     */
    private static _bestMatch(spans: MusicXmlSpan[], e: MusicXmlSpanEvent, placement: MusicXmlSpanPlacement): number {
        let best = -1;
        let bestScore = -1;
        for (let i = 0; i < spans.length; i++) {
            const span = spans[i];
            if (span.element !== e.element || span.number !== e.number) {
                continue;
            }
            const other = span.start !== null ? span.start! : span.end!;
            if (other.staffIndex !== -1 && placement.staffIndex !== -1 && other.staffIndex !== placement.staffIndex) {
                continue;
            }
            if (span.start === null && !MusicXmlSpanTracker._isBefore(placement.position, span.end!.position)) {
                continue;
            }
            const score = MusicXmlSpanTracker._score(span, other, e, placement);
            // the most recent open span, the earliest parked stop
            if (score > bestScore || (score === bestScore && span.start !== null)) {
                best = i;
                bestScore = score;
            }
        }
        return best;
    }

    private static _score(
        span: MusicXmlSpan,
        other: MusicXmlSpanPlacement,
        e: MusicXmlSpanEvent,
        placement: MusicXmlSpanPlacement
    ): number {
        let score = 0;
        if (
            MusicXmlSpanTracker._isIdentifiedByWords(span.element) &&
            e.kind !== MusicXmlSpanKind.None &&
            span.kind === e.kind
        ) {
            score += 4;
        }
        if (other.staffIndex === placement.staffIndex) {
            score += 2;
        }
        if (other.voice === placement.voice) {
            score += 1;
        }
        return score;
    }

    private static _isSame(span: MusicXmlSpan, e: MusicXmlSpanEvent, placement: MusicXmlSpanPlacement): boolean {
        return (
            span.start!.staffIndex === placement.staffIndex &&
            span.start!.voice === placement.voice &&
            (!MusicXmlSpanTracker._isIdentifiedByWords(span.element) || span.kind === e.kind)
        );
    }

    private static _isIdentifiedByWords(element: MusicXmlSpanElement): boolean {
        return element === MusicXmlSpanElement.Dashes || element === MusicXmlSpanElement.Bracket;
    }

    private static _isBefore(a: MusicXmlSpanPosition, b: MusicXmlSpanPosition): boolean {
        return a.barIndex !== b.barIndex ? a.barIndex < b.barIndex : a.ticks < b.ticks;
    }
}

/**
 * Reads the MusicXML elements encoding spans.
 * @internal
 */
export class MusicXmlSpanReader {
    /**
     * Reads a `<dashes>` or `<bracket>` element.
     * @param words The `<words>` labelling the line, they define its meaning.
     */
    public static readLine(element: XmlNode, words: string, events: MusicXmlSpanEvent[]) {
        const lineElement = element.localName === 'bracket' ? MusicXmlSpanElement.Bracket : MusicXmlSpanElement.Dashes;
        const type = element.getAttribute('type', 'start');
        if (type !== 'start' && type !== 'stop' && type !== 'continue') {
            return;
        }
        const action =
            type === 'stop'
                ? MusicXmlSpanAction.Stop
                : type === 'continue'
                  ? MusicXmlSpanAction.Continue
                  : MusicXmlSpanAction.Start;
        MusicXmlSpanReader._push(events, lineElement, action, MusicXmlSpanReader.lineKind(words), element);
    }

    /**
     * The meaning of a line labelled with the given words (e.g. alphaTab "LetRing", MuseScore "let ring").
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

    public static readWedge(element: XmlNode, events: MusicXmlSpanEvent[]) {
        switch (element.getAttribute('type')) {
            case 'crescendo':
                MusicXmlSpanReader._start(events, MusicXmlSpanElement.Wedge, MusicXmlSpanKind.Crescendo, element);
                break;
            case 'diminuendo':
                MusicXmlSpanReader._start(events, MusicXmlSpanElement.Wedge, MusicXmlSpanKind.Decrescendo, element);
                break;
            case 'stop':
                MusicXmlSpanReader._stop(events, MusicXmlSpanElement.Wedge, element);
                break;
            // case 'continue': no meaning for the time range
        }
    }

    public static readOctaveShift(element: XmlNode, events: MusicXmlSpanEvent[]) {
        const type = element.getAttribute('type');
        if (type === 'stop') {
            MusicXmlSpanReader._stop(events, MusicXmlSpanElement.OctaveShift, element);
        } else if (type === 'down' || type === 'up') {
            // the type is the direction the notes are displayed shifted to, other sizes are not supported but paired
            let kind = MusicXmlSpanKind.None;
            switch (element.getAttribute('size', '8')) {
                case '8':
                    kind = type === 'down' ? MusicXmlSpanKind.Ottava8va : MusicXmlSpanKind.Ottava8vb;
                    break;
                case '15':
                    kind = type === 'down' ? MusicXmlSpanKind.Ottava15ma : MusicXmlSpanKind.Ottava15mb;
                    break;
            }
            MusicXmlSpanReader._start(events, MusicXmlSpanElement.OctaveShift, kind, element);
        }
        // case 'continue': no meaning for the time range
    }

    public static readPedal(element: XmlNode, events: MusicXmlSpanEvent[]) {
        switch (element.getAttribute('type')) {
            // lift and retake
            case 'change':
                MusicXmlSpanReader._stop(events, MusicXmlSpanElement.Pedal, element);
                MusicXmlSpanReader._start(events, MusicXmlSpanElement.Pedal, MusicXmlSpanKind.SustainPedal, element);
                break;
            case 'start':
            // a line continuing after a discontinue
            case 'resume':
                MusicXmlSpanReader._start(events, MusicXmlSpanElement.Pedal, MusicXmlSpanKind.SustainPedal, element);
                break;
            case 'stop':
            // a line ending without explicit lift
            case 'discontinue':
                MusicXmlSpanReader._stop(events, MusicXmlSpanElement.Pedal, element);
                break;
            case 'continue':
                MusicXmlSpanReader._push(
                    events,
                    MusicXmlSpanElement.Pedal,
                    MusicXmlSpanAction.Continue,
                    MusicXmlSpanKind.SustainPedal,
                    element
                );
                break;
            // case 'sostenuto': Not supported
        }
    }

    /**
     * Reads a `<measure-style>` element.
     * @param midBar Whether the measure style changes within the bar, measure repeats are only supported at the bar start.
     */
    public static readMeasureStyle(element: XmlNode, midBar: boolean, events: MusicXmlSpanEvent[]) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'multiple-rest': Ignored, when multibar rests are enabled for rendering this info shouldn't matter.
                case 'measure-repeat':
                    if (midBar) {
                        break;
                    }
                    switch (c.getAttribute('type')) {
                        case 'start':
                            const slashes = c.getAttribute('slashes', '1');
                            const kind =
                                slashes === '1'
                                    ? MusicXmlSpanKind.SimileSimple
                                    : slashes === '2'
                                      ? MusicXmlSpanKind.SimileDouble
                                      : MusicXmlSpanKind.None;
                            MusicXmlSpanReader._start(events, MusicXmlSpanElement.MeasureRepeat, kind, c);
                            break;
                        // the first measure not repeating anymore
                        case 'stop':
                            MusicXmlSpanReader._stop(events, MusicXmlSpanElement.MeasureRepeat, c);
                            break;
                    }
                    break;
                // case 'beat-repeat': Not supported
                case 'slash':
                    // use-stems: not supported
                    switch (c.getAttribute('type')) {
                        case 'start':
                            MusicXmlSpanReader._start(events, MusicXmlSpanElement.Slash, MusicXmlSpanKind.Slash, c);
                            break;
                        case 'stop':
                            MusicXmlSpanReader._stop(events, MusicXmlSpanElement.Slash, c);
                            break;
                    }
                    break;
            }
        }
    }

    private static _start(
        events: MusicXmlSpanEvent[],
        element: MusicXmlSpanElement,
        kind: MusicXmlSpanKind,
        node: XmlNode
    ) {
        MusicXmlSpanReader._push(events, element, MusicXmlSpanAction.Start, kind, node);
    }

    private static _stop(events: MusicXmlSpanEvent[], element: MusicXmlSpanElement, node: XmlNode) {
        MusicXmlSpanReader._push(events, element, MusicXmlSpanAction.Stop, MusicXmlSpanKind.None, node);
    }

    private static _push(
        events: MusicXmlSpanEvent[],
        element: MusicXmlSpanElement,
        action: MusicXmlSpanAction,
        kind: MusicXmlSpanKind,
        node: XmlNode
    ) {
        events.push({ element: element, action: action, kind: kind, number: node.getAttribute('number', '1') });
    }
}
