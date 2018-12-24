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
using System;
using AlphaTab.UI;
using Xamarin.Forms;

namespace AlphaTab.Platform.CSharp.Xamarin.Forms
{
    class ViewContainer : IContainer
    {
        public View View { get; set; }

        public ViewContainer(View view)
        {
            View = view;
        }

        public float Top
        {
            get => (float)AbsoluteLayout.GetLayoutBounds(View).Top;
            set
            {
                var bounds = AbsoluteLayout.GetLayoutBounds(View);
                bounds.Top = value;
                AbsoluteLayout.SetLayoutBounds(View, bounds);
            }
        }

        public float Left
        {
            get => (float)AbsoluteLayout.GetLayoutBounds(View).Left;
            set
            {
                var bounds = AbsoluteLayout.GetLayoutBounds(View);
                bounds.Top = value;
                AbsoluteLayout.SetLayoutBounds(View, bounds);
            }
        }

        public float Width
        {
            get => (float)View.Width;
            set => View.WidthRequest = value;
        }

        public float Height
        {
            get => (float)View.Height;
            set => View.HeightRequest = value;
        }

        public bool IsVisible => View.IsVisible && View.Width > 0;

        public float ScrollLeft
        {
            get => View is ScrollView scroll ? (float)scroll.ScrollX : 0;
            set
            {
                if (View is ScrollView scroll)
                {
                    scroll.ScrollToAsync(value, scroll.ScrollY, true);
                }
            }
        }

        public float ScrollTop
        {
            get => View is ScrollView scroll ? (float)scroll.ScrollY : 0;
            set
            {
                if (View is ScrollView scroll)
                {
                    scroll.ScrollToAsync(scroll.ScrollX, value, true);
                }
            }
        }

        public void AppendChild(IContainer child)
        {
            if (View is Layout<View> g)
            {
                g.Children.Add(((ViewContainer)child).View);
            }
        }

        public event Action Scroll
        {
            add
            {
                if (View is ScrollView scroll)
                {
                    scroll.Scrolled += (sender, args) => value();
                }
            }
            remove
            {
            }
        }

        public event Action Resize
        {
            add
            {
                View.SizeChanged += (o, e) => value();
            }
            remove
            {
            }
        }

        public void StopAnimation()
        {
            ViewExtensions.CancelAnimations(View);
        }

        public void TransitionToX(double duration, float x)
        {
            View.TranslateTo(x, 0, (uint) duration);
        }


        public event Action<IMouseEventArgs> MouseDown
        {
            add
            {
                // TODO
            }
            remove
            {
            }
        }

        public event Action<IMouseEventArgs> MouseMove
        {
            add
            {
                // TODO
            }
            remove
            {
            }
        }

        public event Action<IMouseEventArgs> MouseUp
        {
            add
            {
                // TODO
            }
            remove
            {
            }
        }

        public void Clear()
        {
            if (View is Layout<View> g)
            {
                g.Children.Clear();
            }
        }
    }
}
#endif