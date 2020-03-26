using AlphaTab.Haxe.Js.Html;

namespace AlphaTab.UI
{
    internal class BrowserMouseEventArgs : IMouseEventArgs
    {
        public MouseEvent MouseEvent { get; }

        public bool IsLeftMouseButton => MouseEvent.Button == 0;

        public float GetX(IContainer relativeTo)
        {
            var relativeToElement = ((HtmlElementContainer)relativeTo).Element;
            var bounds = relativeToElement.GetBoundingClientRect();
            float left = bounds.Left + relativeToElement.OwnerDocument.DefaultView.PageXOffset;
            return MouseEvent.PageX - left;
        }

        public float GetY(IContainer relativeTo)
        {
            var relativeToElement = ((HtmlElementContainer)relativeTo).Element;
            var bounds = relativeToElement.GetBoundingClientRect();
            float top = bounds.Top + relativeToElement.OwnerDocument.DefaultView.PageYOffset;
            return MouseEvent.PageY - top;
        }

        public void PreventDefault()
        {
            MouseEvent.PreventDefault();
        }

        public BrowserMouseEventArgs(MouseEvent e)
        {
            MouseEvent = e;
        }
    }
}
