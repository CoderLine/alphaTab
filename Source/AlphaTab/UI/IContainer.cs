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