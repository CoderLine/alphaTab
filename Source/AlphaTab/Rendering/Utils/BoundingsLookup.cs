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

namespace AlphaTab.Rendering.Utils
{
    public class Bounds
    {
        public float X { get; set; }
        public float Y { get; set; }
        public float W { get; set; }
        public float H { get; set; }

        public Bounds(float x, float y, float w, float h)
        {
            X = x;
            Y = y;
            W = w;
            H = h;
        }
    }

    public class BeatBoundings
    {
        public Beat Beat { get; set; }
        public Bounds Bounds { get; set; }
        public Bounds VisualBounds { get; set; }
    }

    public class BarBoundings
    {
        public bool IsFirstOfLine { get; set; }
        public bool IsLastOfLine { get; set; }
        public Bar Bar { get; set; }
        public Bounds Bounds { get; set; }
        public Bounds VisualBounds { get; set; }

        public FastList<BeatBoundings> Beats { get; set; }

        public BarBoundings()
        {
            Beats = new FastList<BeatBoundings>();
        }

        public Beat FindBeatAtPos(float x)
        {
            var index = 0;
            // move right as long we didn't pass our x-pos
            while (index < (Beats.Count - 1) && x > (Beats[index].Bounds.X + Beats[index].Bounds.W))
            {
                index++;
            }

            return Beats[index].Beat;
        }
    }

    public class BoundingsLookup
    {
        public FastList<BarBoundings> Bars { get; set; }

        public BoundingsLookup()
        {
            Bars = new FastList<BarBoundings>();
        }

        public Beat GetBeatAtPos(float x, float y)
        {
            //
            // find a bar which matches in y-axis
            var bottom = 0;
            var top = Bars.Count - 1;

            var barIndex = -1;
            while (bottom <= top)
            {
                var middle = (top + bottom) / 2;
                var bar = Bars[middle];

                // found?
                if (y >= bar.Bounds.Y && y <= (bar.Bounds.Y + bar.Bounds.H))
                {
                    barIndex = middle;
                    break;
                }
                // search in lower half 
                if (y < bar.Bounds.Y)
                {
                    top = middle - 1;
                }
                // search in upper half
                else
                {
                    bottom = middle + 1;
                }
            }

            // no bar found
            if (barIndex == -1) return null;

            // 
            // Find the matching bar in the row
            var currentBar = Bars[barIndex];

            // clicked before bar
            if (x < currentBar.Bounds.X)
            {
                // we move left till we either pass our x-position or are at the beginning of the line/score
                while (barIndex > 0 && x < Bars[barIndex].Bounds.X && !Bars[barIndex].IsFirstOfLine)
                {
                    barIndex--;
                }
            }
            else
            {
                // we move right till we either pass our our x-position or are at the end of the line/score
                while (barIndex < (Bars.Count - 1) && x > (Bars[barIndex].Bounds.X + Bars[barIndex].Bounds.W) && !Bars[barIndex].IsLastOfLine)
                {
                    barIndex++;
                }
            }

            // 
            // Find the matching beat within the bar
            return Bars[barIndex].FindBeatAtPos(x);
        }
    }
}
