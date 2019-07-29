#if ANDROID
using AlphaTab.UI;
using Android.Views;

namespace AlphaTab.Platform.CSharp.Xamarin.Android
{
    class AndroidMouseEventArgs : IMouseEventArgs
    {
        private readonly View.TouchEventArgs _eventArgs;

        public AndroidMouseEventArgs(View.TouchEventArgs eventArgs)
        {
            _eventArgs = eventArgs;
        }

        public bool IsLeftMouseButton => _eventArgs.Event.PointerCount == 1;

        public float GetX(IContainer relativeTo)
        {
            var relativeView = ((ViewContainer) relativeTo).View;
            var relativeViewLocationOnScreen = new int[2];
            relativeView.GetLocationOnScreen(relativeViewLocationOnScreen);
            return _eventArgs.Event.RawX - relativeViewLocationOnScreen[0];
        }

        public float GetY(IContainer relativeTo)
        {
            var relativeView = ((ViewContainer)relativeTo).View;
            var relativeViewLocationOnScreen = new int[2];
            relativeView.GetLocationOnScreen(relativeViewLocationOnScreen);
            return _eventArgs.Event.RawY - relativeViewLocationOnScreen[1];
        }

        public void PreventDefault()
        {
            _eventArgs.Handled = true;
        }
    }

}
#endif