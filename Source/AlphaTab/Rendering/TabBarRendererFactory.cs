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

using AlphaTab.Model;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This Factory produces TabBarRenderer instances
    /// </summary>
    public class TabBarRendererFactory : BarRendererFactory
    {
        private readonly bool _showTimeSignature;
        private readonly bool _showRests;
        private readonly bool _showTiedNotes;
        public override string StaffId { get { return TabBarRenderer.StaffId; } }

        public TabBarRendererFactory(bool showTimeSignature, bool showRests, bool showTiedNotes)
        {
            _showTimeSignature = showTimeSignature;
            _showRests = showRests;
            _showTiedNotes = showTiedNotes;
            HideOnPercussionTrack = true;
        }

        public override bool CanCreate(Track track, Staff staff)
        {
            return track.Tuning.Length > 0 && base.CanCreate(track, staff);
        }

        public override BarRendererBase Create(ScoreRenderer renderer, Bar bar, StaveSettings staveSettings)
        {
            var tabBarRenderer = new TabBarRenderer(renderer, bar);
            tabBarRenderer.ShowRests = _showRests;
            tabBarRenderer.ShowTimeSignature = _showTimeSignature;
            tabBarRenderer.ShowTiedNotes = _showTiedNotes;
            tabBarRenderer.RenderRhythm = staveSettings.Get("rhythm", tabBarRenderer.RenderRhythm);
            tabBarRenderer.RhythmHeight = staveSettings.Get("rhythmHeight", tabBarRenderer.RhythmHeight);
            tabBarRenderer.RhythmBeams = staveSettings.Get("rhythmBeams", tabBarRenderer.RhythmBeams);

            return tabBarRenderer;
        }
    }
}