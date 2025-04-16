import type { IEventEmitter, IEventEmitterOfT } from '@src/EventEmitter';
import type { Score } from '@src/model/Score';
// biome-ignore lint/correctness/noUnusedImports: https://github.com/biomejs/biome/issues/4677
import type { IUiFacade } from '@src/platform/IUiFacade';
import type { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import type { BoundsLookup } from '@src/rendering/utils/BoundsLookup';
import type { Settings } from '@src/Settings';

/**
 * Represents the public interface of the component that can render scores.
 */
export interface IScoreRenderer {
    /**
     * Gets or sets the lookup which allows fast access to beats at a given position.
     */
    readonly boundsLookup: BoundsLookup | null;

    /**
     * The width of the rendered score.
     * @remarks
     * For layouts that grow from top to bottom (like `page`), it is required to specify a width for the renderer.
     * The renderer will fit then the bars into this area for rendering. The alphaTab API object uses a link to the
     * graphical user interface via a {@link IUiFacade} to get the available width for rendering. When using the low-level APIs
     * this width must be specified manually.
     *
     * For layouts that grow from left to right the width and height are usually calculated automatically based on
     * the contents.
     * @since 0.9.6
     */
    width: number;

    /**
     * Initiates a re-rendering of the current setup.
     * @since 0.9.6
     */
    render(): void;

    /**
     * Initiates a resize-optimized re-rendering of the score using the current settings.
     * @remarks
     * This method can be used if only re-fitting of the score into a new width should be done.
     * alphaTab internally keeps all the information about the music notation elements like
     * where they are placed and how they are connected. This is a rather expensive operation
     * but it is only required to be done once.
     *
     * In case the UI is resized, this method can be used to trigger a rearrangement of the existing elements
     * into the newly available space.
     * @since 0.9.6
     */
    resizeRender(): void;

    /**
     * Initiates the rendering of the specified tracks of the given score.
     * @param score The score defining the tracks.
     * @param trackIndexes The indexes of the tracks to draw.
     * @since 0.9.6
     */
    renderScore(score: Score | null, trackIndexes: number[] | null): void;

    /**
     * Requests the rendering of a chunk which was layed out before.
     * @param resultId the result ID as provided by the {@link partialLayoutFinished} event.
     * @remarks
     * This method initiates the rendering of a layed out chunk advertised through {@link partialLayoutFinished}
     * @since 1.2.3
     */
    renderResult(resultId: string): void;

    /**
     * Updates the settings to the given object.
     * @remarks
     * This method updates the settings to the given object. On some platforms like JavaScript
     * the settings object will need to be passed on to the corresponding worker to be really updated.
     * It is recommended to make this call after updating any properties of the settings object to ensure
     * it is really passed on to all components.
     *
     * This method will not trigger automatically any re-rendering.
     * @since 0.9.6
     */
    updateSettings(settings: Settings): void;

    /**
     * Destroys the renderer and all related components.
     * @remarks
     * This method destroys the full renderer and by this closes all potentially opened
     * contexts and shuts down any worker. 
     *
     * If you dynamically create/destroy renderers it is recommended to always call this method
     * to ensure all resources are leaked. 

     * @since 0.9.6
     */
    destroy(): void;

    /**
     * Occurs before the rendering of the tracks starts
     * @remarks
     * This event is fired when the rendering of the whole music sheet is starting. All
     * preparations are completed and the layout and render sequence is about to start.
     *
     * The provided boolean indicates the rendering is triggered from a resize
     *
     * @eventProperty
     * @since 0.9.4
     */
    readonly preRender: IEventEmitterOfT<boolean>;

    /**
     * This event is fired when the rendering of the whole music sheet is finished.
     * @remarks
     * This event is fired when the rendering of the whole music sheet is finished from the render engine side. There might be still tasks open for
     * the display component to visually display the rendered components when this event is notified.
     * @eventProperty
     * @since 0.9.4
     */
    readonly renderFinished: IEventEmitterOfT<RenderFinishedEventArgs>;

    /**
     * Occurs whenever a part of the whole music sheet is rendered and can be displayed.
     * @remarks
     * AlphaTab does not render the whole music sheet into a single canvas but rather
     * splits it down into smaller chunks. This allows faster display of results to the user
     * and avoids issues related to browser restrictions (like maximum canvas sizes).
     *
     * This event is fired whenever one chunk of the music sheet is fully rendered.
     *
     * {@since 1.2.3} the rendering of a chunk needs to be requested via the {@link renderResult} method after
     * a chunk was advertised through the {@link partialLayoutFinished}.
     * @eventProperty
     * @since 1.2.3
     */
    readonly partialRenderFinished: IEventEmitterOfT<RenderFinishedEventArgs>;

    /**
     * Occurs whenever a part of the whole music sheet is layed out but not yet rendered.
     * @remarks
     * AlphaTab does not render the whole music sheet into a single canvas but rather
     * splits it down into smaller chunks. This allows faster display of results to the user
     * and avoids issues related to browser restrictions (like maximum canvas sizes).
     *
     * This event is fired whenever one chunk of the music sheet was fully layed out.
     * @eventProperty
     * @since 1.2.3
     */
    readonly partialLayoutFinished: IEventEmitterOfT<RenderFinishedEventArgs>;

    /**
     * This event is fired when the rendering of the whole music sheet is finished, and all handlers of {@link renderFinished} ran.
     * @remarks
     * This event is fired when the rendering of the whole music sheet is finished, and all handlers of {@link renderFinished} ran. When this
     * handlers are called, the whole rendering and display pipeline is completed.
     * @eventProperty
     * @since 0.9.4
     */
    readonly postRenderFinished: IEventEmitter;

    /**
     * This event is fired when an error within alphatab occurred.
     * @remarks
     * This event is fired when an error within alphatab occurred. Use this event as global error handler to show errors
     * to end-users. Due to the asynchronous nature of alphaTab, no call to the API will directly throw an error if it fails.
     * Instead a signal to this error handlers will be sent.
     * @since 0.9.4
     */
    readonly error: IEventEmitterOfT<Error>;
}
