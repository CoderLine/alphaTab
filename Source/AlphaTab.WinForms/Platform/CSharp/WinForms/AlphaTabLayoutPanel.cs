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

using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.Windows.Forms;
using System.Windows.Forms.Layout;

namespace AlphaTab.Platform.CSharp.WinForms
{
    public class AlphaTabLayoutPanel : Panel
    {
        private AlphaTabLayoutEngine _laoyutEngine;

        public override LayoutEngine LayoutEngine
        {
            get { return _laoyutEngine ?? (_laoyutEngine = new AlphaTabLayoutEngine()); }
        }

        public AlphaTabLayoutPanel()
        {
            DoubleBuffered = true;
            ResizeRedraw = true;
        }

        class AlphaTabLayoutEngine : LayoutEngine
        {
            public override bool Layout(object container, LayoutEventArgs layoutEventArgs)
            {
                var parent = (Control)container;

                var xChild = 0;
                var yChild = 0;

                var rowHeight = 0;

                foreach (Control child in parent.Controls)
                {
                    child.Location = new Point(xChild, yChild);

                    xChild += child.Width;
                    if (child.Height > rowHeight)
                    {
                        rowHeight = child.Height;
                    }

                    if (xChild >= parent.Width)
                    {
                        xChild = 0;
                        yChild += rowHeight;
                        rowHeight = 0;
                    }
                }

                return false;
            }
        }
    }
}
