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