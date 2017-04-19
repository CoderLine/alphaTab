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

using System.Windows;
using System.Windows.Controls;

namespace AlphaTab.Platform.CSharp.Wpf
{
    public class AlphaTabLayoutPanel : Panel
    {
        protected override Size MeasureOverride(Size availableSize)
        {
            foreach (UIElement child in InternalChildren)
            {
                child.Measure(availableSize);
            }
            return new Size
            {
                Width = double.IsInfinity(availableSize.Width) ? MinWidth : availableSize.Width,
                Height = double.IsInfinity(availableSize.Height) ? MinHeight : availableSize.Height
            };
        }

        protected override Size ArrangeOverride(Size finalSize)
        {
            var xChild = 0.0;
            var yChild = 0.0;

            var rowHeight = 0.0;

            foreach (UIElement child in InternalChildren)
            {
                child.Arrange(new Rect(xChild, yChild, child.DesiredSize.Width, child.DesiredSize.Height));

                xChild += child.DesiredSize.Width;
                if (child.DesiredSize.Height > rowHeight)
                {
                    rowHeight = child.DesiredSize.Height;
                }

                if (xChild >= finalSize.Width)
                {
                    xChild = 0;
                    yChild += rowHeight;
                    rowHeight = 0;
                }
            }

            return finalSize;
        }
    }
}
