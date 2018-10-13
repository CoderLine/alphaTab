using System;

namespace AlphaTab.UI
{
    public interface IContainer
    {
        float Top { get; set; }
        float Left { get; set; }
        float Width { get; set; }
        float Height { get; set; }

        bool IsVisible { get; }

        float ScrollLeft { get; set; }
        float ScrollTop { get; set; }

        void AppendChild(IContainer child);
        event Action Scroll;
        event Action Resize;
        void StopAnimation();
        void TransitionToX(double duration, float x);

        event Action<IMouseEventArgs> MouseDown;
        event Action<IMouseEventArgs> MouseMove;
        event Action<IMouseEventArgs> MouseUp;
        void Clear();
    }
}