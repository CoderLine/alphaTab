import { BarSubElement, type Bar } from '@src/model/Bar';
import type { BeatSubElement, Beat } from '@src/model/Beat';
import type { Color } from '@src/model/Color';
import type { ElementStyle } from '@src/model/ElementStyle';
import type { NoteSubElement, Note } from '@src/model/Note';
import type { Score, ScoreSubElement } from '@src/model/Score';
import { type Track, TrackSubElement } from '@src/model/Track';
import type { VoiceSubElement, Voice } from '@src/model/Voice';
import type { ICanvas } from '@src/platform/ICanvas';
import type { RenderingResources } from '@src/RenderingResources';

/**
 * A helper to apply element styles in a specific rendering scope via the `using` keyword
 */
export class ElementStyleHelper {
    public static score(
        canvas: ICanvas,
        element: ScoreSubElement,
        score: Score,
        forceDefault: boolean = false
    ): Disposable | undefined {
        if (!score.style && !forceDefault) {
            return undefined;
        }

        const defaultColor: Color = ElementStyleHelper.scoreDefaultColor(canvas.settings.display.resources, element);

        return new ElementStyleScope<ScoreSubElement>(canvas, element, score.style, defaultColor);
    }

    public static scoreColor(res: RenderingResources, element: ScoreSubElement, score: Score): Color | undefined {
        const defaultColor: Color = ElementStyleHelper.scoreDefaultColor(res, element);

        if (score.style && score.style!.colors.has(element)) {
            return score.style!.colors.get(element) ?? defaultColor;
        }

        return undefined;
    }

    private static scoreDefaultColor(res: RenderingResources, element: ScoreSubElement) {
        const defaultColor: Color = res.mainGlyphColor;

        return defaultColor;
    }

    public static bar(
        canvas: ICanvas,
        element: BarSubElement,
        bar: Bar,
        forceDefault: boolean = false
    ): Disposable | undefined {
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

        return new ElementStyleScope<BarSubElement>(canvas, element, bar.style, defaultColor);
    }

    public static voice(
        canvas: ICanvas,
        element: VoiceSubElement,
        voice: Voice,
        forceDefault: boolean = false
    ): Disposable | undefined {
        if (!voice.style && !forceDefault) {
            return undefined;
        }

        const defaultColor: Color =
            voice.index === 0
                ? canvas.settings.display.resources.mainGlyphColor
                : canvas.settings.display.resources.secondaryGlyphColor;

        return new ElementStyleScope<VoiceSubElement>(canvas, element, voice.style, defaultColor);
    }

    public static trackColor(res: RenderingResources, element: TrackSubElement, track: Track): Color | undefined {
        const defaultColor = ElementStyleHelper.trackDefaultColor(res, element);

        if (track.style && track.style!.colors.has(element)) {
            return track.style!.colors.get(element) ?? defaultColor;
        }

        return undefined;
    }

    private static trackDefaultColor(res: RenderingResources, element: TrackSubElement) {
        let defaultColor: Color = res.mainGlyphColor;
        switch (element) {
            case TrackSubElement.TrackName:
            case TrackSubElement.SystemSeparator:
            case TrackSubElement.StringTuning:
                break;
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
        if (!track.style && !forceDefault) {
            return undefined;
        }

        const defaultColor = ElementStyleHelper.trackDefaultColor(canvas.settings.display.resources, element);

        return new ElementStyleScope<TrackSubElement>(canvas, element, track.style, defaultColor);
    }

    public static beatColor(res: RenderingResources, element: BeatSubElement, beat: Beat): Color | undefined {
        const defaultColor = ElementStyleHelper.beatDefaultColor(res, element, beat);

        if (beat.style && beat.style!.colors.has(element)) {
            return beat.style!.colors.get(element) ?? defaultColor;
        }

        return undefined;
    }

    private static beatDefaultColor(res: RenderingResources, element: BeatSubElement, beat: Beat) {
        const defaultColor: Color = beat.voice.index === 0 ? res.mainGlyphColor : res.secondaryGlyphColor;

        return defaultColor;
    }
    public static beat(
        canvas: ICanvas,
        element: BeatSubElement,
        beat: Beat,
        forceDefault: boolean = false
    ): Disposable | undefined {
        if (!beat.style && !forceDefault) {
            return undefined;
        }

        const defaultColor = ElementStyleHelper.beatDefaultColor(canvas.settings.display.resources, element, beat);

        return new ElementStyleScope<BeatSubElement>(canvas, element, beat.style, defaultColor);
    }

    public static noteColor(res: RenderingResources, element: NoteSubElement, note: Note): Color | undefined {
        const defaultColor = ElementStyleHelper.noteDefaultColor(res, element, note);

        if (note.style && note.style!.colors.has(element)) {
            return note.style!.colors.get(element) ?? defaultColor;
        }

        return undefined;
    }

    private static noteDefaultColor(res: RenderingResources, element: NoteSubElement, note: Note) {
        const defaultColor: Color = note.beat.voice.index === 0 ? res.mainGlyphColor : res.secondaryGlyphColor;

        return defaultColor;
    }

    public static note(
        canvas: ICanvas,
        element: NoteSubElement,
        note: Note,
        forceDefault: boolean = false
    ): Disposable | undefined {
        if (!note.style && !forceDefault) {
            return undefined;
        }

        const defaultColor: Color =
            note.beat.voice.index === 0
                ? canvas.settings.display.resources.mainGlyphColor
                : canvas.settings.display.resources.secondaryGlyphColor;

        return new ElementStyleScope<NoteSubElement>(canvas, element, note.style, defaultColor);
    }
}

/**
 * A helper class for applying elements styles to the canvas and restoring the previous state afterwards.
 */
class ElementStyleScope<TSubElement extends number> implements Disposable {
    private _canvas: ICanvas;
    private _previousColor?: Color;

    public constructor(
        canvas: ICanvas,
        element: TSubElement,
        container: ElementStyle<TSubElement> | undefined,
        defaultColor: Color
    ) {
        this._canvas = canvas;

        if (container && container.colors.has(element)) {
            this._previousColor = canvas.color;
            canvas.color = container.colors.get(element) ?? defaultColor;
        } else if (!container) {
            this._previousColor = canvas.color;
            canvas.color = defaultColor;
        }
    }

    [Symbol.dispose]() {
        if (this._previousColor) {
            this._canvas.color = this._previousColor!;
        }
    }
}
