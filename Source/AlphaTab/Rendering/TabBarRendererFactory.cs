/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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
using AlphaTab.Model;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This Factory produces TabBarRenderer instances
    /// </summary>
    public class TabBarRendererFactory : BarRendererFactory
    {
        public override bool CanCreate(Track track)
        {
            return track.Tuning.Length > 0;
        }

        public override BarRendererBase Create(Bar bar)
        {
            return new TabBarRenderer(bar);
        }
    }
}