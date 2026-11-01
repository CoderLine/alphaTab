import { BarSubElement, type Bar } from '@coderline/alphatab/model/Bar';
import type { BeatSubElement, Beat } from '@coderline/alphatab/model/Beat';
import type { Color } from '@coderline/alphatab/model/Color';
import type { ElementStyle } from '@coderline/alphatab/model/ElementStyle';
import type { NoteSubElement, Note } from '@coderline/alphatab/model/Note';
import type { Score, ScoreSubElement } from '@coderline/alphatab/model/Score';
import { type Track, TrackSubElement } from '@coderline/alphatab/model/Track';
import type { VoiceSubElement, Voice } from '@coderline/alphatab/model/Voice';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { RenderingResources } from '@coderline/alphatab/RenderingResources';

/**
 * A helper to apply element styles in a specific rendering scope, either via the `using` keyword
 * on the scopes returned by `score`, `bar`, `voice` etc. or via the `apply*` methods paired with
 * {@link restore} in a `finally` block. The latter do not allocate and are meant for hot paint paths.
 * @internal
 */
export class ElementStyleHelper {
    public static score(
        canvas: ICanvas,
        element: ScoreSubElement,
        score: Score,
        forceDefault: boolean = false
    ): Disposable | undefined {
        return ElementStyleHelper._scope(canvas, ElementStyleHelper.applyScore(canvas, element, score, forceDefault));
    }

    /**
     * Applies the style of the element to the canvas.
     * @returns The color to pass to {@link restore} once the styled element is painted.
     */
    public static applyScore(
        canvas: ICanvas,
        element: ScoreSubElement,
        score: Score,
        forceDefault: boolean = false
    ): Color | undefined {
        if (!score.style && !forceDefault) {
            return undefined;
        }

        const defaultColor: Color = ElementStyleHelper._scoreDefaultColor(canvas.settings.display.resources, element);

        return ElementStyleHelper._apply<ScoreSubElement>(canvas, element, score.style, defaultColor, forceDefault);
    }

    public static scoreColor(res: RenderingResources, element: ScoreSubElement, score: Score): Color | undefined {
        const defaultColor: Color = ElementStyleHelper._scoreDefaultColor(res, element);

        if (score.style && score.style!.colors.has(element)) {
            return score.style!.colors.get(element) ?? defaultColor;
        }

        return undefined;
    }

    private static _scoreDefaultColor(res: RenderingResources, _element: ScoreSubElement) {
        const defaultColor: Color = res.scoreInfoColor;

        return defaultColor;
    }

    public static bar(
        canvas: ICanvas,
        element: BarSubElement,
        bar: Bar,
        forceDefault: boolean = false
    ): Disposable | undefined {
        return ElementStyleHelper._scope(canvas, ElementStyleHelper.applyBar(canvas, element, bar, forceDefault));
    }

    /**
     * Applies the style of the element to the canvas.
     * @returns The color to pass to {@link restore} once the styled element is painted.
     */
    public static applyBar(
        canvas: ICanvas,
        element: BarSubElement,
        bar: Bar,
        forceDefault: boolean = false
    ): Color | undefined {
        if (!bar.style && !forceDefault) {
            return undefined;
        }

        let defaultColor: Color = canvas.settings.display.resources.mainGlyphColor;
        switch (element) {
            case BarSubElement.StandardNotationRepeats:
            case BarSubElement.GuitarTabsRepeats:
            case BarSubElement.SlashRepeats:
            case BarSubElement.NumberedRepeats:
            case BarSubElement.StandardNotationClef:
            case BarSubElement.GuitarTabsClef:
            case BarSubElement.StandardNotationKeySignature:
            case BarSubElement.NumberedKeySignature:
            case BarSubElement.StandardNotationTimeSignature:
            case BarSubElement.GuitarTabsTimeSignature:
            case BarSubElement.SlashTimeSignature:
            case BarSubElement.NumberedTimeSignature:
                break;

            case BarSubElement.StandardNotationBarLines:
            case BarSubElement.GuitarTabsBarLines:
            case BarSubElement.SlashBarLines:
            case BarSubElement.NumberedBarLines:
                defaultColor = canvas.settings.display.resources.barSeparatorColor;
                break;

            case BarSubElement.StandardNotationBarNumber:
            case BarSubElement.SlashBarNumber:
            case BarSubElement.NumberedBarNumber:
            case BarSubElement.GuitarTabsBarNumber:
                defaultColor = canvas.settings.display.resources.barNumberColor;
                break;

            case BarSubElement.StandardNotationStaffLine:
            case BarSubElement.GuitarTabsStaffLine:
            case BarSubElement.SlashStaffLine:
            case BarSubElement.NumberedStaffLine:
                defaultColor = canvas.settings.display.resources.staffLineColor;
                break;
        }

        return ElementStyleHelper._apply<BarSubElement>(canvas, element, bar.style, defaultColor, forceDefault);
    }

    /**
     * The colour of a staff-line sub-element of the bar. Staff lines inherit no colour from other elements:
     * without an entry in the bar style the default staff-line colour applies.
     */
    public static staffLineColor(res: RenderingResources, element: BarSubElement, bar: Bar): Color {
        const style = bar.style;
        if (style && style.colors.has(element)) {
            return style.colors.get(element) ?? res.staffLineColor;
        }
        return res.staffLineColor;
    }

    public static voice(
        canvas: ICanvas,
        element: VoiceSubElement,
        voice: Voice,
        forceDefault: boolean = false
    ): Disposable | undefined {
        return ElementStyleHelper._scope(canvas, ElementStyleHelper.applyVoice(canvas, element, voice, forceDefault));
    }

    /**
     * Applies the style of the element to the canvas.
     * @returns The color to pass to {@link restore} once the styled element is painted.
     */
    public static applyVoice(
        canvas: ICanvas,
        element: VoiceSubElement,
        voice: Voice,
        forceDefault: boolean = false
    ): Color | undefined {
        if (!voice.style && !forceDefault) {
            return undefined;
        }

        const defaultColor: Color =
            voice.index === 0
                ? canvas.settings.display.resources.mainGlyphColor
                : canvas.settings.display.resources.secondaryGlyphColor;

        return ElementStyleHelper._apply<VoiceSubElement>(canvas, element, voice.style, defaultColor, forceDefault);
    }

    /**
     * The colour of the track style entry for the element, `defaultColor` for a `null` entry and `undefined`
     * without an entry.
     * @param defaultColor The colour the element has without a style where it is painted.
     */
    public static trackColor(element: TrackSubElement, track: Track, defaultColor: Color): Color | undefined {
        if (track.style && track.style!.colors.has(element)) {
            return track.style!.colors.get(element) ?? defaultColor;
        }

        return undefined;
    }

    private static _trackDefaultColor(res: RenderingResources, element: TrackSubElement) {
        let defaultColor: Color = res.mainGlyphColor;
        switch (element) {
            case TrackSubElement.SystemSeparator:
            case TrackSubElement.StringTuning:
                break;
            case TrackSubElement.TrackName:
            case TrackSubElement.BracesAndBrackets:
                defaultColor = res.barSeparatorColor;
                break;
        }

        return defaultColor;
    }

    public static track(
        canvas: ICanvas,
        element: TrackSubElement,
        track: Track,
        forceDefault: boolean = false
    ): Disposable | undefined {
        return ElementStyleHelper._scope(canvas, ElementStyleHelper.applyTrack(canvas, element, track, forceDefault));
    }

    /**
     * Applies the style of the element to the canvas.
     * @returns The color to pass to {@link restore} once the styled element is painted.
     */
    public static applyTrack(
        canvas: ICanvas,
        element: TrackSubElement,
        track: Track,
        forceDefault: boolean = false
    ): Color | undefined {
        if (!track.style && !forceDefault) {
            return undefined;
        }

        const defaultColor = ElementStyleHelper._trackDefaultColor(canvas.settings.display.resources, element);

        return ElementStyleHelper._apply<TrackSubElement>(canvas, element, track.style, defaultColor, forceDefault);
    }

    public static beatColor(res: RenderingResources, element: BeatSubElement, beat: Beat): Color | undefined {
        const defaultColor = ElementStyleHelper._beatDefaultColor(res, element, beat);

        if (beat.style && beat.style!.colors.has(element)) {
            return beat.style!.colors.get(element) ?? defaultColor;
        }

        return undefined;
    }

    private static _beatDefaultColor(res: RenderingResources, _element: BeatSubElement, beat: Beat) {
        const defaultColor: Color = beat.voice.index === 0 ? res.mainGlyphColor : res.secondaryGlyphColor;

        return defaultColor;
    }
    public static beat(
        canvas: ICanvas,
        element: BeatSubElement,
        beat: Beat,
        forceDefault: boolean = false
    ): Disposable | undefined {
        return ElementStyleHelper._scope(canvas, ElementStyleHelper.applyBeat(canvas, element, beat, forceDefault));
    }

    /**
     * Applies the style of the element to the canvas.
     * @returns The color to pass to {@link restore} once the styled element is painted.
     */
    public static applyBeat(
        canvas: ICanvas,
        element: BeatSubElement,
        beat: Beat,
        forceDefault: boolean = false
    ): Color | undefined {
        if (!beat.style && !forceDefault) {
            return undefined;
        }

        const defaultColor = ElementStyleHelper._beatDefaultColor(canvas.settings.display.resources, element, beat);

        return ElementStyleHelper._apply<BeatSubElement>(canvas, element, beat.style, defaultColor, forceDefault);
    }

    public static noteColor(res: RenderingResources, element: NoteSubElement, note: Note): Color | undefined {
        const defaultColor = ElementStyleHelper._noteDefaultColor(res, element, note);

        if (note.style && note.style!.colors.has(element)) {
            return note.style!.colors.get(element) ?? defaultColor;
        }

        return undefined;
    }

    private static _noteDefaultColor(res: RenderingResources, _element: NoteSubElement, note: Note) {
        const defaultColor: Color = note.beat.voice.index === 0 ? res.mainGlyphColor : res.secondaryGlyphColor;

        return defaultColor;
    }

    public static note(
        canvas: ICanvas,
        element: NoteSubElement,
        note: Note,
        forceDefault: boolean = false
    ): Disposable | undefined {
        return ElementStyleHelper._scope(canvas, ElementStyleHelper.applyNote(canvas, element, note, forceDefault));
    }

    /**
     * Applies the style of the element to the canvas.
     * @returns The color to pass to {@link restore} once the styled element is painted.
     */
    public static applyNote(
        canvas: ICanvas,
        element: NoteSubElement,
        note: Note,
        forceDefault: boolean = false
    ): Color | undefined {
        if (!note.style && !forceDefault) {
            return undefined;
        }

        const defaultColor: Color =
            note.beat.voice.index === 0
                ? canvas.settings.display.resources.mainGlyphColor
                : canvas.settings.display.resources.secondaryGlyphColor;

        return ElementStyleHelper._apply<NoteSubElement>(canvas, element, note.style, defaultColor, forceDefault);
    }

    /**
     * Applies the color of the given note element like {@link applyNote}, using the given color
     * when the note style does not define the element.
     */
    public static applyNoteWithDefault(
        canvas: ICanvas,
        element: NoteSubElement,
        note: Note,
        defaultColor: Color
    ): Color | undefined {
        return ElementStyleHelper._apply<NoteSubElement>(canvas, element, note.style, defaultColor, true);
    }

    /**
     * Restores the canvas color changed by one of the `apply*` methods.
     * @param previousColor The value returned by the `apply*` method.
     */
    public static restore(canvas: ICanvas, previousColor: Color | undefined) {
        if (previousColor) {
            canvas.color = previousColor!;
        }
    }

    /**
     * Without an entry for the element in the style, the element inherits the current canvas colour,
     * unless `forceDefault` is set: then the default colour of the element applies.
     */
    private static _apply<TSubElement extends number>(
        canvas: ICanvas,
        element: TSubElement,
        container: ElementStyle<TSubElement> | undefined,
        defaultColor: Color,
        forceDefault: boolean
    ): Color | undefined {
        if (container && container.colors.has(element)) {
            const previousColor = canvas.color;
            canvas.color = container.colors.get(element) ?? defaultColor;
            return previousColor;
        }

        if (forceDefault) {
            const previousColor = canvas.color;
            canvas.color = defaultColor;
            return previousColor;
        }

        return undefined;
    }

    private static _scope(canvas: ICanvas, previousColor: Color | undefined): Disposable | undefined {
        return previousColor ? new ElementStyleScope(canvas, previousColor!) : undefined;
    }
}

/**
 * Restores the canvas color on dispose.
 * @internal
 */
class ElementStyleScope implements Disposable {
    private _canvas: ICanvas;
    private _previousColor: Color;

    public constructor(canvas: ICanvas, previousColor: Color) {
        this._canvas = canvas;
        this._previousColor = previousColor;
    }

    [Symbol.dispose]() {
        this._canvas.color = this._previousColor;
    }
}
