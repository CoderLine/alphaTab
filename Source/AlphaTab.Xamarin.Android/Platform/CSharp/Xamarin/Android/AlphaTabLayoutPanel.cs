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

using Android.Content;
using Android.Views;

namespace AlphaTab.Platform.CSharp.Xamarin.Android
{
    class AlphaTabLayoutPanel : ViewGroup
    {
        public AlphaTabLayoutPanel(Context context) : base(context)
        {
        }

        protected override void OnMeasure(int widthMeasureSpec, int heightMeasureSpec)
        {
            var childCount = ChildCount;
            for (int i = 0; i < childCount; i++)
            {
                var child = GetChildAt(i);
                child.Measure(widthMeasureSpec, heightMeasureSpec);
            }

            SetMeasuredDimension(MinimumWidth, MinimumHeight);
        }

        protected override void OnLayout(bool changed, int l, int t, int r, int b)
        {
            var xChild = l;
            var yChild = t;

            var rowHeight = 0;
            var childCount = ChildCount;

            for (int i = 0; i < childCount; i++)
            {
                var child = GetChildAt(i);
                child.Layout(xChild, yChild, xChild + child.MeasuredWidth, yChild + child.MeasuredHeight);

                xChild += child.MeasuredWidth;
                if (child.MeasuredHeight > rowHeight)
                {
                    rowHeight = child.MeasuredHeight;
                }

                if (xChild >= r)
                {
                    xChild = l;
                    yChild += rowHeight;
                    rowHeight = 0;
                }
            }
        }
    }
}
