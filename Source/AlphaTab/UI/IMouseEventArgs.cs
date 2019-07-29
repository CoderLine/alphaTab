namespace AlphaTab.UI
{
    /// <summary>
    /// This interface represents the information about a mouse event that occured on the UI. 
    /// </summary>
    public interface IMouseEventArgs
    {
        /// <summary>
        /// Gets a value indicating whether the left mouse button was pressed. 
        /// </summary>
        bool IsLeftMouseButton { get; }

        /// <summary>
        /// Gets the X-position of the cursor at the time of the event relative to the given UI container. 
        /// </summary>
        /// <param name="relativeTo">The UI element to which the relative position should be calculated.</param>
        /// <returns>The relative X-position of the cursor to the given UI container at the time the event occured.</returns>
        float GetX(IContainer relativeTo);

        /// <summary>
        /// Gets the Y-position of the cursor at the time of the event relative to the given UI container. 
        /// </summary>
        /// <param name="relativeTo">The UI element to which the relative position should be calculated.</param>
        /// <returns>The relative Y-position of the cursor to the given UI container at the time the event occured.</returns>
        float GetY(IContainer relativeTo);

        /// <summary>
        /// If called, the original mouse action is prevented and the event is flagged as handled. 
        /// </summary>
        void PreventDefault();
    }
}
