using System.Windows.Input;
using AlphaTab.Platform;

namespace AlphaTab.Wpf
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

        public double GetX(IContainer relativeTo)
        {
            var relativeControl = ((FrameworkElementContainer)relativeTo).Control;
            var position = _args.GetPosition(relativeControl);
            return (float)position.X;
        }

        public double GetY(IContainer relativeTo)
        {
            var relativeControl = ((FrameworkElementContainer)relativeTo).Control;
            var position = _args.GetPosition(relativeControl);
            return (float)position.Y;
        }

        public void PreventDefault()
        {
            _args.Handled = true;
        }
    }
}
