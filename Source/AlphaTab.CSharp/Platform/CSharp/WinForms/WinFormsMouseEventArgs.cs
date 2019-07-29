#if NET472
using System.Windows.Forms;
using AlphaTab.UI;

namespace AlphaTab.Platform.CSharp.WinForms
{
    internal class WinFormsMouseEventArgs : IMouseEventArgs
    {
        private readonly Control _sender;
        private readonly MouseEventArgs _args;

        public WinFormsMouseEventArgs(Control sender, MouseEventArgs args)
        {
            _sender = sender;
            _args = args;
        }

        public bool IsLeftMouseButton => _args.Button == MouseButtons.Left;

        public float GetX(IContainer relativeTo)
        {
            var relativeControl = ((ControlContainer)relativeTo).Control;
            return relativeControl.PointToClient(_sender.PointToScreen(_args.Location)).X;
        }

        public float GetY(IContainer relativeTo)
        {
            var relativeControl = ((ControlContainer)relativeTo).Control;
            return relativeControl.PointToClient(_sender.PointToScreen(_args.Location)).Y;
        }

        public void PreventDefault()
        {
        }
    }
}
#endif