#if NET472
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
using System.Windows.Forms;
using AlphaTab.UI;

namespace AlphaTab.Platform.CSharp.WinForms
{
    internal class WinFormsMouseEventArgs : IMouseEventArgs
    {
        private readonly Control _sender;
        private readonly MouseEventArgs _args;

        public WinFormsMouseEventArgs(Control sender, MouseEventArgs args)
        {
            _sender = sender;
            _args = args;
        }

        public bool IsLeftMouseButton => _args.Button == MouseButtons.Left;

        public float GetX(IContainer relativeTo)
        {
            var relativeControl = ((ControlContainer)relativeTo).Control;
            return relativeControl.PointToClient(_sender.PointToScreen(_args.Location)).X;
        }

        public float GetY(IContainer relativeTo)
        {
            var relativeControl = ((ControlContainer)relativeTo).Control;
            return relativeControl.PointToClient(_sender.PointToScreen(_args.Location)).Y;
        }

        public void PreventDefault()
        {
        }
    }
}
#endif