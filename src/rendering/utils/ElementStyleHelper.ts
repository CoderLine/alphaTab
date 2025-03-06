import { Color } from '@src/model';
import { ElementStyle } from '@src/model/ElementStyle';
import { TrackSubElement } from '@src/model/Track';
import { ICanvas } from '@src/platform';

/**
 * A helper to apply element styles in a specific rendering scope via the `using` keyword
 */
export class ElementStyleHelper {
    public static track(
        canvas: ICanvas,
        element: TrackSubElement,
        container: ElementStyle<TrackSubElement>
    ): Disposable | undefined {
        let defaultColor: Color = canvas.settings.display.resources.mainGlyphColor;
        switch (element) {
            case TrackSubElement.TrackName:
            case TrackSubElement.BracesAndBrackets:
                break;
            case TrackSubElement.StaffLine:
                defaultColor = canvas.settings.display.resources.staffLineColor;
                break;
        }

        return new ElementStyleScope<TrackSubElement>(canvas, element, container, defaultColor);
    }
}

/**
 * A helper class for applying elements styles to the canvas and restoring the previous state afterwards.
 */
class ElementStyleScope<TSubElement> implements Disposable {
    private _canvas: ICanvas;
    private _previousColor?: Color;

    public constructor(
        canvas: ICanvas,
        element: TSubElement,
        container: ElementStyle<TSubElement>,
        defaultColor: Color
    ) {
        this._canvas = canvas;

        if (container.colors.has(element)) {
            this._previousColor = canvas.color;
            canvas.color = container.colors.get(element) ?? defaultColor;
        }
    }

    [Symbol.dispose]() {
        if (this._previousColor) {
            this._canvas.color = this._previousColor!;
        }
    }
}
