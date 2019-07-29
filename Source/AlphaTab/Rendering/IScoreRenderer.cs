using System;
using AlphaTab.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// Represents the public interface of the component that can render scores. 
    /// </summary>
    public interface IScoreRenderer
    {
        /// <summary>
        /// Gets or sets the lookup which allows fast access to beats at a given position. 
        /// </summary>
        BoundsLookup BoundsLookup { get; }

        /// <summary>
        /// Invalidates the drawn music sheet and initiates a redraw. 
        /// </summary>
        void Invalidate();

        /// <summary>
        /// Triggers a relayout to the given size including redrawing. 
        /// </summary>
        /// <param name="width"></param>
        void Resize(int width);

        /// <summary>
        /// Initiates the rendering of the specified tracks of the given score. 
        /// </summary>
        /// <param name="score">The score defining the tracks. </param>
        /// <param name="trackIndexes">The indexes of the tracks to draw.</param>
        void Render(Score score, int[] trackIndexes);

        /// <summary>
        /// Occurs before the rendering of the tracks starts.
        /// </summary>
        event Action PreRender;
        /// <summary>
        /// Occurs after the rendering of the tracks finished. 
        /// </summary>
        event Action<RenderFinishedEventArgs> RenderFinished;
        /// <summary>
        /// Occurs whenever a part of the whole music sheet is rendered and can be displayed. 
        /// </summary>
        event Action<RenderFinishedEventArgs> PartialRenderFinished;
        /// <summary>
        /// Occurs when the whole rendering and layout process finished. 
        /// </summary>
        event Action PostRenderFinished;
        /// <summary>
        /// Occurs whenever an error happens. 
        /// </summary>
        event Action<string,Exception> Error;

        /// <summary>
        /// Updates the settings to the given object. 
        /// </summary>
        /// <param name="settings"></param>
        void UpdateSettings(Settings settings);

        /// <summary>
        /// Destroys the renderer. 
        /// </summary>
        void Destroy();
    }

    /// <summary>
    /// This eventargs define the details about the rendering and layouting process and are
    /// provided whenever a part of of the music sheet is rendered. 
    /// </summary>
    public class RenderFinishedEventArgs
    {
        /// <summary>
        /// Gets or sets the width of the current rendering result. 
        /// </summary>
        public float Width { get; set; }
        /// <summary>
        /// Gets or sets the height of the current rendering result.  
        /// </summary>
        public float Height { get; set; }

        /// <summary>
        /// Gets or sets the currently known total width of the final music sheet. 
        /// </summary>
        public float TotalWidth { get; set; }
        /// <summary>
        /// Gets or sets the currently known total height of the final music sheet. 
        /// </summary>
        public float TotalHeight { get; set; }
        /// <summary>
        /// Gets or sets the index of the first masterbar that was rendered in this result. 
        /// </summary>
        public int FirstMasterBarIndex { get; set; }
        /// <summary>
        /// Gets or sets the index of the last masterbar that was rendered in this result. 
        /// </summary>
        public int LastMasterBarIndex { get; set; }

        /// <summary>
        /// Gets or sets the render engine specific result object which contains the rendered music sheet. 
        /// </summary>
        public object RenderResult { get; set; }
    }
}
