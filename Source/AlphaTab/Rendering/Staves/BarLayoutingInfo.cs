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

using System.Collections.Generic;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Staves
{
    /// <summary>
    /// This public class stores size information about a stave. 
    /// It is used by the layout engine to collect the sizes of score parts
    /// to align the parts across multiple staves.
    /// </summary>
    public class BarLayoutingInfo
    {
        public float FullWidth { get; set; }
        public FastDictionary<string, float> Sizes { get; set; }

        public float VoiceSize { get; set; }
        public float MinStretchForce { get; set; }

        public BarLayoutingInfo()
        {
            Sizes = new FastDictionary<string, float>();
            FullWidth = 0;
            VoiceSize = 0;
            Springs = new FastDictionary<int, Spring>();
        }

        public void UpdateVoiceSize(float size)
        {
            if (size > VoiceSize)
            {
                VoiceSize = size;
            }
        }

        public void SetSize(string key, float size)
        {
            Sizes[key] = size;
        }

        public float GetSize(string key)
        {
            if (Sizes.ContainsKey(key))
            {
                return Sizes[key];
            }
            return 0;
        }

        public void UpdateMinStretchForce(float force)
        {
            if (MinStretchForce < force)
            {
                MinStretchForce = force;
            }
        }

        public FastDictionary<int, Spring> Springs { get; set; }
        public int SmallestDuration { get; set; }

        public void AddSpring(Beat beat, float preStretchWidth)
        {
            var start = beat.AbsoluteStart;
            if (!Springs.ContainsKey(start))
            {
                var spring = new Spring();
                spring.TimePosition = start;
                spring.PreStretchWidth = preStretchWidth;
                spring.Beats.Add(beat);
                Springs[start] = spring;
            }
            else
            {
                var spring = Springs[start];
                if (spring.PreStretchWidth < preStretchWidth)
                {
                    spring.PreStretchWidth = preStretchWidth;
                }
                spring.Beats.Add(beat);
            }

            var duration = beat.CalculateDuration();
            if (duration < SmallestDuration)
            {
                SmallestDuration = duration;
            }
        }

        public void CalculateSpringConstants()
        {
            Std.Foreach(Springs.Values, spring =>
            {
                CalculateSpringConstant(spring);
            });
        }

        private void CalculateSpringConstant(Spring spring)
        {
            var di = spring.d
        }

        public float SpaceToForce(float space)
        {
            var sortedSprings = new List<Spring>();
            var xMin = 0f;
            Std.Foreach(Springs.Values, spring =>
            {
                sortedSprings.Add(spring);
                if (spring.PreStretchWidth < xMin)
                {
                    xMin = spring.PreStretchWidth;
                }
            });

            sortedSprings.Sort((a, b) =>
            {
                if (a.PreStretchWidth < b.PreStretchWidth)
                {
                    return -1;
                }
                if (a.PreStretchWidth > b.PreStretchWidth)
                {
                    return 1;
                }
                return 0;
            });

            if (space < xMin || sortedSprings.Count == 0)
            {
                return 0;
            }

            var c = Springs[0].SpringConstant;
            for (int i = 0; i < sortedSprings.Count; i++)
            {
                xMin -= Springs[i].PreStretchWidth;

                var f = (space - xMin) / c;
                if (i == sortedSprings.Count - 1 || f < Springs[i].PreStretchForce)
                {
                    return f;
                }

                c = 1 / ((1 / c) + (1 / Springs[i].SpringConstant));
            }

            return 0;
        }
    }

    public class Spring
    {
        public int TimePosition { get; set; }

        public float Force { get; set; }
        public float Width { get; set; }
        public float SpringConstant { get; set; }

        public FastList<Beat> Beats { get; set; }

        public float PreStretchWidth { get; set; }
        public float PreStretchForce { get; set; }

        public Spring()
        {
            Beats = new FastList<Beat>();
        }
    }
}
