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
using AlphaTab.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering
{
    public interface IScoreRenderer
    {
        BoundsLookup BoundsLookup { get; }

        void Invalidate();
        void Resize(int width);
        void Render(Score score, int[] trackIndexes);

        event Action<RenderFinishedEventArgs> PreRender;
        event Action<RenderFinishedEventArgs> RenderFinished;
        event Action<RenderFinishedEventArgs> PartialRenderFinished;
        event Action PostRenderFinished;
        event Action<string,Exception> Error;
        void UpdateSettings(Settings settings);
        void Destroy();
    }

    public class RenderFinishedEventArgs
    {
        public float Width { get; set; }
        public float Height { get; set; }
        public float TotalWidth { get; set; }
        public float TotalHeight { get; set; }
        public int FirstMasterBarIndex { get; set; }
        public int LastMasterBarIndex { get; set; }
        public object RenderResult { get; set; }
    }
}
