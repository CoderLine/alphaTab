using System;
using AlphaTab.Audio.Synth;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.UI
{
    /// <summary>
    /// This interface represents the UI abstraction between alphaTab and the corresponding UI framework being used. 
    /// </summary>
    /// <typeparam name="TSettings">The type of that holds the settings passed from the UI layer.</typeparam>
    public interface IUiFacade<TSettings>
    {
        /// <summary>
        /// Gets the root UI element that holds the whole alphaTab control.
        /// </summary>
        IContainer RootContainer { get; }
        /// <summary>
        /// Gets a value indicating whether the UI framework supports worker based rendering. 
        /// </summary>
        bool AreWorkersSupported { get; }

        /// <summary>
        /// Gets or sets whether the UI is ready to render the music notation. On some platforms where pre-loading of assets is done asynchronously,
        /// rendering might need to be deferred. 
        /// </summary>
        bool CanRender { get; }
        /// <summary>
        /// Gets the resize throttling in milliseconds. Then the music sheet is resized, the re-rendering is deferred until this timeout is reached. 
        /// </summary>
        int ResizeThrottle { get; }

        /// <summary>
        /// This events is fired when the <see cref="CanRender"/> property changes. 
        /// </summary>
        event Action CanRenderChanged;

        /// <summary>
        /// This event is fired when <see cref="RootContainer"/> became visible when it was invisible at the time rendering was initiated. 
        /// </summary>
        event Action RootContainerBecameVisible;

        /// <summary>
        /// Initializes the UI using the given alphaTab API and settings object. 
        /// </summary>
        /// <param name="api">The alphaTab API wrapper responsible for UI interaction.</param>
        /// <param name="settings">The settings object holding the settings from the UI layer.</param>
        void Initialize(AlphaTabApi<TSettings> api, TSettings settings);

        /// <summary>
        /// Tells the UI layer to destroy the alphaTab controls and restore the initial state. 
        /// </summary>
        void Destroy();

        /// <summary>
        /// Creates the canvas element that wraps all individually rendered partials.  
        /// </summary>
        /// <returns>The canvas element that wraps all individually rendered partials.</returns>
        IContainer CreateCanvasElement();
        /// <summary>
        /// Tells the UI layer to trigger an event with the given name and details.
        /// </summary>
        /// <param name="container">The element on which the event should be triggered. </param>
        /// <param name="eventName">The event that should be triggered.</param>
        /// <param name="details">The object holding the details about the event.</param>
        void TriggerEvent(IContainer container, string eventName, object details = null);

        /// <summary>
        /// Tells the UI layer to do the initial rendering. 
        /// </summary>
        void InitialRender();

        /// <summary>
        /// Tells the UI layer to append the given render results to the UI. 
        /// </summary>
        /// <param name="renderResults">The rendered partial that should be added to the UI. </param>
        void BeginAppendRenderResults(RenderFinishedEventArgs renderResults);

        /// <summary>
        /// Tells the UI layer to create the worker renderer. This method is the UI layer supports worker rendering and worker rendering is not disabled via setting. 
        /// </summary>
        /// <returns></returns>
        IScoreRenderer CreateWorkerRenderer();

        /// <summary>
        /// Tells the UI layer to create a player worker. 
        /// </summary>
        /// <returns></returns>
        IAlphaSynth CreateWorkerPlayer();

        /// <summary>
        /// Creates the cursor objects that are used to highlight the currently played beats and bars. 
        /// </summary>
        /// <returns></returns>
        Cursors CreateCursors();
        
        /// <summary>
        /// Tells the UI layer to invoke the given action. 
        /// </summary>
        /// <param name="action"></param>
        void BeginInvoke(Action action);
        
        /// <summary>
        /// Tells the UI layer to remove all highlights from highlighted music notation elements. 
        /// </summary>
        void RemoveHighlights();
        /// <summary>
        /// Tells the UI layer to highlight the music notation elements with the given ID.
        /// </summary>
        /// <param name="groupId">The group id that identifies the elements to be highlighted. </param>
        void HighlightElements(string groupId);

        /// <summary>
        /// Creates a new UI element that is used to display the selection rectangle. 
        /// </summary>
        /// <returns></returns>
        IContainer CreateSelectionElement();

        /// <summary>
        /// Gets the UI element that is used for scrolling during playback. 
        /// </summary>
        /// <returns></returns>
        IContainer GetScrollContainer();

        /// <summary>
        /// Calculates the relative offset of a container to the scroll element. 
        /// </summary>
        /// <param name="scrollElement">The parent scroll element to which the relative position is computed. </param>
        /// <param name="container">The container element for which the relative position is calculated.</param>
        /// <returns></returns>
        Bounds GetOffset(IContainer scrollElement, IContainer container);

        /// <summary>
        /// Initiates a vertical scroll on the given element. 
        /// </summary>
        /// <param name="scrollElement">The element on which the scrolling should happen.</param>
        /// <param name="offset">The absolute scroll offset to which scrolling should happen.</param>
        /// <param name="speed">How fast the scrolling from the current offset to the given one should happen in milliseconds.</param>
        void ScrollToY(IContainer scrollElement, int offset, int speed);

        /// <summary>
        /// Initiates a horizontal scroll on the given element. 
        /// </summary>
        /// <param name="scrollElement">The element on which the scrolling should happen.</param>
        /// <param name="offset">The absolute scroll offset to which scrolling should happen.</param>
        /// <param name="speed">How fast the scrolling from the current offset to the given one should happen in milliseconds.</param>
        void ScrollToX(IContainer scrollElement, int offset, int speed);
    }
}