import { IEventEmitter, IEventEmitterOfT } from '@src/EventEmitter';
import { Score } from '@src/model/Score';
import { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { BoundsLookup } from '@src/rendering/utils/BoundsLookup';
import { Settings } from '@src/Settings';

/**
 * Represents the public interface of the component that can render scores.
 */
export interface IScoreRenderer {
    /**
     * Gets or sets the lookup which allows fast access to beats at a given position.
     */
    readonly boundsLookup: BoundsLookup | null;

    /**
     * Gets or sets the width of the score to be rendered.
     */
    width: number;

    /**
     * Initiates a full re-rendering of the score using the current settings.
     */
    render(): void;

    /**
     * Initiates a resize-optimized re-rendering of the score using the current settings.
     */
    resizeRender(): void;

    /**
     * Initiates the rendering of the specified tracks of the given score.
     * @param score The score defining the tracks.
     * @param trackIndexes The indexes of the tracks to draw.
     */
    renderScore(score: Score, trackIndexes: number[]): void;

    /**
     * Updates the settings to the given object.
     * @param settings
     */
    updateSettings(settings: Settings): void;

    /**
     * Destroys the renderer.
     */
    destroy(): void;

    /**
     * Occurs before the rendering of the tracks starts.
     */
    readonly preRender: IEventEmitterOfT<boolean>;

    /**
     * Occurs after the rendering of the tracks finished.
     */
    readonly renderFinished: IEventEmitterOfT<RenderFinishedEventArgs>;

    /**
     * Occurs whenever a part of the whole music sheet is rendered and can be displayed.
     */
    readonly partialRenderFinished: IEventEmitterOfT<RenderFinishedEventArgs>;

    /**
     * Occurs when the whole rendering and layout process finished.
     */
    readonly postRenderFinished: IEventEmitter;

    /**
     * Occurs whenever an error happens.
     */
    readonly error: IEventEmitterOfT<Error>;
}
