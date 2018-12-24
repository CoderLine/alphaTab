#if ANDROID
/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
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