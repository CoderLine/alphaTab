using System;

namespace AlphaTab.UI
{
    /// <summary>
    /// This interface represents a container control in the UI layer. 
    /// </summary>
    public interface IContainer
    {
        /// <summary>
        /// Gets or sets the Y-position of the control, relative to its parent. 
        /// </summary>
        float Top { get; set; }

        /// <summary>
        /// Gets or sets the X-position of the control, relative to its parent. 
        /// </summary>
        float Left { get; set; }

        /// <summary>
        /// Gets or sets the width of the control.
        /// </summary>
        float Width { get; set; }

        /// <summary>
        /// Gets or sets the height of the control.
        /// </summary>
        float Height { get; set; }

        /// <summary>
        /// Gets a value indicating whether the control is visible.
        /// </summary>
        bool IsVisible { get; }

        /// <summary>
        /// Gets or sets the horizontal scroll offset of this control if it is scrollable. 
        /// </summary>
        float ScrollLeft { get; set; }

        /// <summary>
        /// Gets or sets the vertical scroll offset of this control if it is scrollable. 
        /// </summary>
        float ScrollTop { get; set; }

        /// <summary>
        /// Adds the given child control to this container. 
        /// </summary>
        /// <param name="child">The child control to add.</param>
        void AppendChild(IContainer child);

        /// <summary>
        /// This event occurs when a scroll on the control happened. 
        /// </summary>
        event Action Scroll;

        /// <summary>
        /// This event occurs when the control was resized. 
        /// </summary>
        event Action Resize;

        /// <summary>
        /// Stops the animations of this control immediately. 
        /// </summary>
        void StopAnimation();

        /// <summary>
        /// Tells the control to move to the given X-position in the given time. 
        /// </summary>
        /// <param name="duration">The milliseconds that should be needed to reach the new X-position</param>
        /// <param name="x">The new X-position</param>
        void TransitionToX(double duration, float x);

        /// <summary>
        /// This event occurs when a mouse/finger press happened on the control.
        /// </summary>
        event Action<IMouseEventArgs> MouseDown;

        /// <summary>
        /// This event occurs when a mouse/finger moves on top of the control.
        /// </summary>
        event Action<IMouseEventArgs> MouseMove;

        /// <summary>
        /// This event occurs when a mouse/finger is released from the control.
        /// </summary>
        event Action<IMouseEventArgs> MouseUp;

        /// <summary>
        /// Clears the container and removes all child items.
        /// </summary>
        void Clear();
    }
}
