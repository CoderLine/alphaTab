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

namespace AlphaTab.Audio.Generator
{
    public class MidiPlaybackController
    {
        private readonly Score _score;

        private int _repeatStartIndex;
        private int _repeatNumber;
        private bool _repeatOpen;

        public bool ShouldPlay { get; set; }
        public int Index { get; set; }
        public int CurrentTick { get; set; }

        public bool Finished
        {
            get
            {
                return Index >= _score.MasterBars.Count;
            }
        }


        public MidiPlaybackController(Score score)
        {
            _score = score;

            ShouldPlay = true;
            Index = 0;
            CurrentTick = 0;
        }

        public void ProcessCurrent()
        {
            var masterBar = _score.MasterBars[Index];
            var masterBarAlternateEndings = masterBar.AlternateEndings;
            
            // if the repeat group wasn't closed we reset the repeating 
            // on the last group opening
            if (!masterBar.RepeatGroup.IsClosed && masterBar.RepeatGroup.Openings[masterBar.RepeatGroup.Openings.Count - 1] == masterBar)
            {
                _repeatNumber = 0;
                _repeatOpen = false;
            }

            if ((masterBar.IsRepeatStart || masterBar.Index == 0) && _repeatNumber == 0)
            {
                _repeatStartIndex = Index;
                _repeatOpen = true;
            }
            else if (masterBar.IsRepeatStart)
            {
                ShouldPlay = true;
            }

            // if we encounter an alternate ending
            if (_repeatOpen && masterBarAlternateEndings > 0)
            {
                // do we need to skip this section?
                if ((masterBarAlternateEndings & (1 << _repeatNumber)) == 0)
                {
                    ShouldPlay = false;
                }
                else
                {
                    ShouldPlay = true;
                }
            }

            if (ShouldPlay)
            {
                CurrentTick += masterBar.CalculateDuration();
            }
        }

        public void MoveNext()
        {
            var masterBar = _score.MasterBars[Index];
            var masterBarRepeatCount = masterBar.RepeatCount - 1;

            // if we encounter a repeat end 
            if (_repeatOpen && (masterBarRepeatCount > 0))
            {
                // more repeats required?
                if (_repeatNumber < masterBarRepeatCount)
                {
                    // jump to start
                    Index = _repeatStartIndex;
                    _repeatNumber++;
                }
                else
                {
                    // no repeats anymore, jump after repeat end
                    _repeatNumber = 0;
                    _repeatOpen = false;
                    ShouldPlay = true;
                    Index++;
                }
            }
            // no repeat end, normal next
            else
            {
                Index++;
            }
        }
    }
}
