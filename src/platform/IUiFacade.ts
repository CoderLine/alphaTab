import { AlphaTabApiBase } from '@src/AlphaTabApiBase';
import { IAlphaSynth } from '@src/synth/IAlphaSynth';
import { IEventEmitter } from '@src/EventEmitter';
import { Score } from '@src/model/Score';
import { IContainer } from '@src/platform/IContainer';
import { IMouseEventArgs } from '@src/platform/IMouseEventArgs';
import { Cursors } from '@src/platform/Cursors';
import { IScoreRenderer } from '@src/rendering/IScoreRenderer';
import { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { Bounds } from '@src/rendering/utils/Bounds';

/**
 * This interface represents the UI abstraction between alphaTab and the corresponding UI framework being used.
 * @param <TSettings> The type of that holds the settings passed from the UI layer.
 */
export interface IUiFacade<TSettings> {
    /**
     * Gets the root UI element that holds the whole alphaTab control.
     */
    readonly rootContainer: IContainer;

    /**
     * Gets a value indicating whether the UI framework supports worker based rendering.
     */
    readonly areWorkersSupported: boolean;

    /**
     * Gets or sets whether the UI is ready to render the music notation. On some platforms where pre-loading of assets is done asynchronously,
     * rendering might need to be deferred.
     */
    readonly canRender: boolean;

    /**
     * Gets the resize throttling in milliseconds. Then the music sheet is resized, the re-rendering is deferred until this timeout is reached.
     */
    readonly resizeThrottle: number;

    /**
     * Initializes the UI using the given alphaTab API and settings object.
     * @param api The alphaTab API wrapper responsible for UI interaction.
     * @param settings The settings object holding the settings from the UI layer.
     */
    initialize(api: AlphaTabApiBase<TSettings>, settings: TSettings): void;

    /**
     * Tells the UI layer to destroy the alphaTab controls and restore the initial state.
     */
    destroy(): void;

    /**
     * Creates the canvas element that wraps all individually rendered partials.
     * @returns The canvas element that wraps all individually rendered partials.
     */
    createCanvasElement(): IContainer;

    /**
     * Tells the UI layer to trigger an event with the given name and details.
     * @param container The element on which the event should be triggered.
     * @param eventName The event that should be triggered.
     * @param details The object holding the details about the event.
     * @param originalEvent The original event related to this custom event.
     */
    triggerEvent(container: IContainer, eventName: string, details: unknown, originalEvent?: IMouseEventArgs): void;

    /**
     * Tells the UI layer to do the initial rendering.
     */
    initialRender(): void;

    /**
     * Tells the UI layer to append the given render results to the UI.
     * @param renderResults The rendered partial that should be added to the UI.
     */
    beginAppendRenderResults(renderResults: RenderFinishedEventArgs | null): void;

    /**
     * Tells the UI layer to create the worker renderer. This method is the UI layer supports worker rendering and worker rendering is not disabled via setting.
     * @returns
     */
    createWorkerRenderer(): IScoreRenderer;

    /**
     * Tells the UI layer to create a player worker.
     * @returns
     */
    createWorkerPlayer(): IAlphaSynth | null;

    /**
     * Creates the cursor objects that are used to highlight the currently played beats and bars.
     * @returns
     */
    createCursors(): Cursors | null;

    /**
     * Destroys the cursor objects that are used to highlight the currently played beats and bars.
     */
    destroyCursors(): void;

    /**
     * Tells the UI layer to invoke the given action.
     * @param action
     */
    beginInvoke(action: () => void): void;

    /**
     * Tells the UI layer to remove all highlights from highlighted music notation elements.
     */
    removeHighlights(): void;

    /**
     * Tells the UI layer to highlight the music notation elements with the given ID.
     * @param groupId The group id that identifies the elements to be highlighted.
     */
    highlightElements(groupId: string): void;

    /**
     * Creates a new UI element that is used to display the selection rectangle.
     * @returns
     */
    createSelectionElement(): IContainer | null;

    /**
     * Gets the UI element that is used for scrolling during playback.
     * @returns
     */
    getScrollContainer(): IContainer;

    /**
     * Calculates the relative offset of a container to the scroll element.
     * @param scrollElement The parent scroll element to which the relative position is computed.
     * @param container The container element for which the relative position is calculated.
     * @returns
     */
    getOffset(scrollElement: IContainer | null, container: IContainer): Bounds;

    /**
     * Initiates a vertical scroll on the given element.
     * @param scrollElement The element on which the scrolling should happen.
     * @param offset The absolute scroll offset to which scrolling should happen.
     * @param speed How fast the scrolling from the current offset to the given one should happen in milliseconds.
     */
    scrollToY(scrollElement: IContainer, offset: number, speed: number): void;

    /**
     * Initiates a horizontal scroll on the given element.
     * @param scrollElement The element on which the scrolling should happen.
     * @param offset The absolute scroll offset to which scrolling should happen.
     * @param speed How fast the scrolling from the current offset to the given one should happen in milliseconds.
     */
    scrollToX(scrollElement: IContainer, offset: number, speed: number): void;

    /**
     * Attempts a load of the score represented by the given data object.
     * @param data The data object to decode
     * @param success The action to call if the score was loaded
     * @param error The action to call if any error during loading ocurred.
     * @returns true if the data object is supported and a load was initiated, otherwise false
     */
    load(data: unknown, success: (score: Score) => void, error: (error: Error) => void): boolean;

    /**
     * Attempts a load of the score represented by the given data object.
     * @param data The data object to decode
     * @param append Whether to fully replace or append the data from the given soundfont.
     * @returns true if the data object is supported and a load was initiated, otherwise false
     */
    loadSoundFont(data: unknown, append: boolean): boolean;

    /**
     * This events is fired when the {@link canRender} property changes.
     */
    readonly canRenderChanged: IEventEmitter;

    /**
     * This event is fired when {@link rootContainer} became visible when it was invisible at the time rendering was initiated.
     */
    readonly rootContainerBecameVisible: IEventEmitter;
}
