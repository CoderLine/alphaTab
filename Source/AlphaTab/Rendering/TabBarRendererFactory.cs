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

using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This Factory produces TabBarRenderer instances
    /// </summary>
    public class TabBarRendererFactory : BarRendererFactory
    {
        public override string StaffId { get { return TabBarRenderer.StaffId; } }

        public TabBarRendererFactory()
        {
            HideOnPercussionTrack = true;
        }

        public override bool CanCreate(Track track, Staff staff)
        {
            return track.Tuning.Length > 0 && base.CanCreate(track, staff);
        }

        public override BarRendererBase Create(ScoreRenderer renderer, Bar bar, FastDictionary<string, object> additionalSettings)
        {
            var tabBarRenderer = new TabBarRenderer(renderer, bar);

            if (additionalSettings.ContainsKey("rhythm"))
            {
                tabBarRenderer.RenderRhythm = (bool)additionalSettings["rhythm"];
            }

            if (additionalSettings.ContainsKey("rhythm-height"))
            {
                tabBarRenderer.RhythmHeight = (float)additionalSettings["rhythm-height"];
            }

            if (additionalSettings.ContainsKey("rhythm-beams"))
            {
                tabBarRenderer.RhythmBeams = (bool)additionalSettings["rhythm-beams"];
            }

            return tabBarRenderer;
        }
    }
}