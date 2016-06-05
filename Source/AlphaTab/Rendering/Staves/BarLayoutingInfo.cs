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

using System;
using System.Collections.Generic;
using AlphaTab.Audio;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Layout;

namespace AlphaTab.Rendering.Staves
{
    /// <summary>
    /// This public class stores size information about a stave. 
    /// It is used by the layout engine to collect the sizes of score parts
    /// to align the parts across multiple staves.
    /// </summary>
    public class BarLayoutingInfo
    {
        private const int MinDuration = 30;
        private const int MinDurationWidth = 10;
        public FastDictionary<string, float> Sizes { get; set; }

        public float VoiceSize { get; set; }
        public float MinStretchForce { get; set; }
        public float TotalSpringConstant { get; set; }

        public BarLayoutingInfo()
        {
            Sizes = new FastDictionary<string, float>();
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

        public void AddSpring(int start, int duration, float preStretchWidth)
        {
            if (!Springs.ContainsKey(start))
            {
                var spring = new Spring();
                spring.TimePosition = start;
                spring.SmallestDuration = duration;
                spring.LongestDuration = duration;
                spring.PreStretchWidth = preStretchWidth;
                Springs[start] = spring;
            }
            else
            {
                var spring = Springs[start];
                if (spring.PreStretchWidth < preStretchWidth)
                {
                    spring.PreStretchWidth = preStretchWidth;
                }
                if (duration < spring.SmallestDuration)
                {
                    spring.SmallestDuration = duration;
                }
                if (duration > spring.LongestDuration)
                {
                    spring.LongestDuration = duration;
                }
            }

            if (duration < SmallestDuration)
            {
                SmallestDuration = duration;
            }
        }

        public void AddBeatSpring(Beat beat, float preStretchWidth)
        {
            AddSpring(beat.AbsoluteStart, beat.CalculateDuration(), preStretchWidth);
        }

        public void CalculateSpringConstants()
        {
            var sortedSprings = new FastList<Spring>();
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
                if (a.TimePosition < b.TimePosition)
                {
                    return -1;
                }
                if (a.TimePosition > b.TimePosition)
                {
                    return 1;
                }
                return 0;
            });

            var totalSpringConstant = 0f;
            for (int i = 0; i < sortedSprings.Count; i++)
            {
                var currentSpring = sortedSprings[i];
                int duration;
                if (i == sortedSprings.Count - 1)
                {
                    duration = currentSpring.LongestDuration;
                }
                else
                {
                    var nextSpring = sortedSprings[i + 1];
                    duration = nextSpring.TimePosition - currentSpring.TimePosition;
                }

                currentSpring.SpringConstant = CalculateSpringConstant(currentSpring, duration);

                totalSpringConstant += 1 / currentSpring.SpringConstant;
            }

            TotalSpringConstant = 1 / totalSpringConstant;
        }

        private float CalculateSpringConstant(Spring spring, float duration)
        {
            float minDuration = spring.SmallestDuration;
            if (spring.SmallestDuration == 0)
            {
                minDuration = duration;
            }
            var phi = 1 + 1f * Std.Log2(duration / (float)MinDuration);
            return (minDuration / duration) * 1 / (phi * MinDurationWidth);
        }


        public float SpaceToForce(float space)
        {
            return space * TotalSpringConstant;
        }

        public float CalculateVoiceWidth(float force)
        {
            return CalculateWidth(force, TotalSpringConstant);
        }

        public float CalculateWidth(float force, float springConstant)
        {
            return force / springConstant;
        }

        public FastDictionary<int, float> BuildOnTimePositions(float force)
        {
            var positions = new FastDictionary<int, float>();

            var sortedSprings = new FastList<Spring>();
            Std.Foreach(Springs.Values, spring =>
            {
                sortedSprings.Add(spring);
            });

            sortedSprings.Sort((a, b) =>
            {
                if (a.TimePosition < b.TimePosition)
                {
                    return -1;
                }
                if (a.TimePosition > b.TimePosition)
                {
                    return 1;
                }
                return 0;
            });

            var springX = 0f;
            for (int i = 0; i < sortedSprings.Count; i++)
            {
                positions[sortedSprings[i].TimePosition] = springX;
                springX += CalculateWidth(force, sortedSprings[i].SpringConstant);
            }

            return positions;
        }
    }

    public class Spring
    {
        public int TimePosition { get; set; }

        public int LongestDuration { get; set; }
        public int SmallestDuration { get; set; }

        public float Force { get; set; }
        public float Width { get; set; }
        public float SpringConstant { get; set; }

        public float PreStretchWidth { get; set; }
        public float PreStretchForce { get; set; }
    }
}
