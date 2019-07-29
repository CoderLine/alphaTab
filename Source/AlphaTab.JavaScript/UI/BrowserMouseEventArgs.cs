using AlphaTab.Haxe.Js.Html;

namespace AlphaTab.UI
{
    class BrowserMouseEventArgs : IMouseEventArgs
    {
        private readonly MouseEvent _e;
        public bool IsLeftMouseButton => _e.Button == 0;

        public float GetX(IContainer relativeTo)
        {
            var relativeToElement = ((HtmlElementContainer)relativeTo).Element;
            var bounds = relativeToElement.GetBoundingClientRect();
            float left = bounds.Left + relativeToElement.OwnerDocument.DefaultView.PageXOffset;
            return _e.PageX - left;
        }

        public float GetY(IContainer relativeTo)
        {
            var relativeToElement = ((HtmlElementContainer)relativeTo).Element;
            var bounds = relativeToElement.GetBoundingClientRect();
            float top = bounds.Top + relativeToElement.OwnerDocument.DefaultView.PageYOffset;
            return _e.PageY - top;
        }

        public void PreventDefault()
        {
            _e.PreventDefault();
        }

        public BrowserMouseEventArgs(MouseEvent e)
        {
            _e = e;
        }
    }
}