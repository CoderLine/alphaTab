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
using Xamarin.Forms;

namespace AlphaTab.Platform.CSharp.Xamarin.Forms
{
    class AlphaTabLayoutPanel : Layout<View>
    {
        protected override SizeRequest OnMeasure(double widthConstraint, double heightConstraint)
        {
            foreach (var child in Children)
            {
                child.Measure(double.PositiveInfinity, double.PositiveInfinity);
            }
            return new SizeRequest(new Size(WidthRequest, HeightRequest));
        }

        protected override void LayoutChildren(double x, double y, double width, double height)
        {
            var xChild = x;
            var yChild = y;

            var rowHeight = 0.0;

            foreach (var child in Children)
            {
                LayoutChildIntoBoundingRegion(child, new Rectangle(new Point(xChild, yChild), new Size(child.WidthRequest, child.HeightRequest)));

                xChild += child.WidthRequest;
                if (child.HeightRequest > rowHeight)
                {
                    rowHeight = child.HeightRequest;
                }

                if (xChild >= width)
                {
                    xChild = x;
                    yChild += rowHeight;
                    rowHeight = 0;
                }
            }
        }
    }
}
