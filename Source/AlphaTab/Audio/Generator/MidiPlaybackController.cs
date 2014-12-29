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
using AlphaTab.Model;

namespace AlphaTab.Audio.Generator
{
    public class MidiPlaybackController
    {
        private readonly Score _score;

        private int _lastIndex;
        private int _repeatAlternative;
        private int _repeatStart;
        private int _repeatStartIndex;
        private int _repeatNumber;
        private int _repeatEnd;
        private bool _repeatOpen;

        public bool ShouldPlay { get; set; }
        public int RepeatMove { get; set; }
        public int Index { get; set; }

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
            RepeatMove = 0;
            Index = 0;
        }

        public void Process()
        {
            var masterBar = _score.MasterBars[Index];
        
            // if the repeat group wasn't closed we reset the repeating 
            // on the last group opening
            if (!masterBar.RepeatGroup.IsClosed && masterBar.RepeatGroup.Openings[masterBar.RepeatGroup.Openings.Count -1] == masterBar)
            {
                _repeatStart = 0;
                _repeatNumber = 0;
                _repeatEnd = 0;
                _repeatOpen = false;
            }
        
            if (masterBar.IsRepeatStart)
            {
                _repeatStartIndex = Index;
                _repeatStart = masterBar.Start;
                _repeatOpen = true;
                if (Index > _lastIndex)
                {
                    _repeatNumber = 0;
                    _repeatAlternative = 0;
                }
            }
            else
            {
                if (_repeatAlternative == 0)
                {
                    _repeatAlternative = masterBar.AlternateEndings;
                }
                if ((_repeatOpen && (_repeatAlternative > 0)) && ((_repeatAlternative & (1 << _repeatNumber)) == 0))
                {
                    RepeatMove -= masterBar.CalculateDuration();
                    if (masterBar.RepeatCount > 0)
                    {
                        _repeatAlternative = 0;
                    }
                    ShouldPlay = false;
                    Index++;
                    return;
                }
            }
            _lastIndex = Math.Max(_lastIndex, Index);
            if (_repeatOpen && (masterBar.RepeatCount > 0))
            {
                if ((_repeatNumber < masterBar.RepeatCount) || (_repeatAlternative > 0))
                {
                    _repeatEnd = masterBar.Start + masterBar.CalculateDuration();
                    RepeatMove += _repeatEnd - _repeatStart;
                    Index = _repeatStartIndex - 1;
                    _repeatNumber++;
                }
                else
                {
                    _repeatStart = 0;
                    _repeatNumber = 0;
                    _repeatEnd = 0;
                    _repeatOpen = false;
                }
                _repeatAlternative = 0;
            }
            Index++;
        }
    }
}
