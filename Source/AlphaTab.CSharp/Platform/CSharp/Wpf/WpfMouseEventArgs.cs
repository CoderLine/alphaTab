#if NET472
using System.Windows.Input;
using AlphaTab.UI;

namespace AlphaTab.Platform.CSharp.Wpf
{
    internal class WpfMouseEventArgs : IMouseEventArgs
    {
        private readonly MouseEventArgs _args;

        public WpfMouseEventArgs(MouseEventArgs args)
        {
            _args = args;
        }

        public WpfMouseEventArgs(MouseButtonEventArgs args)
        {
            _args = args;
            IsLeftMouseButton = args.ChangedButton == MouseButton.Left && args.ButtonState == MouseButtonState.Pressed;
        }

        public bool IsLeftMouseButton { get; }

        public float GetX(IContainer relativeTo)
        {
            var relativeControl = ((FrameworkElementContainer)relativeTo).Control;
            var position = _args.GetPosition(relativeControl);
            return (float)position.X;
        }

        public float GetY(IContainer relativeTo)
        {
            var relativeControl = ((FrameworkElementContainer)relativeTo).Control;
            var position = _args.GetPosition(relativeControl);
            return (float)position.X;
        }

        public void PreventDefault()
        {
            _args.Handled = true;
        }
    }
}
#endif