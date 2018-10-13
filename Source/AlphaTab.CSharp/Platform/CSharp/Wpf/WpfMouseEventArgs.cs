#if NET471
/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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