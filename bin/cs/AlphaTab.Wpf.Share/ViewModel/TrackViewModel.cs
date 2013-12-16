/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
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
using System.ComponentModel;
using System.Runtime.CompilerServices;
using alphatab.model;

namespace AlphaTab.Wpf.Share.ViewModel
{
    /// <summary>
    /// A viewmodel for displaying track information in the UI
    /// </summary>
    public class TrackViewModel : INotifyPropertyChanged
    {
        private TrackType _trackType;
        private bool[] _usedBars;
        private bool _isSelected;
        private Track _track;

        public bool IsSelected
        {
            get { return _isSelected; }
            set
            {
                _isSelected = value;
                OnPropertyChanged();
            }
        }

        public TrackType TrackType
        {
            get { return _trackType; }
            set
            {
                _trackType = value;
                OnPropertyChanged();
            }
        }

        public string Name
        {
            get { return _track.name; }
            set
            {
                _track.name = value;
                OnPropertyChanged();
            }
        }

        public int Volume
        {
            get { return _track.playbackInfo.volume; }
            set
            {
                _track.playbackInfo.volume = value;
                OnPropertyChanged();
            }
        }

        public bool IsSolo
        {
            get { return _track.playbackInfo.isSolo; }
            set
            {
                _track.playbackInfo.isSolo = value;
                OnPropertyChanged();
            }
        }

        public bool IsMute
        {
            get { return _track.playbackInfo.isMute; }
            set
            {
                _track.playbackInfo.isMute = value;
                OnPropertyChanged();
            }
        }

        public bool[] UsedBars
        {
            get { return _usedBars; }
            set
            {
                _usedBars = value;
                OnPropertyChanged();
            }
        }

        public Track Track
        {
            get { return _track; }
            set
            {
                _track = value;
                OnPropertyChanged();
            }
        }

        public TrackViewModel(Track track)
        {
            _track = track;

            // general midi programs
            if (track.isPercussion)
            {
                TrackType = TrackType.Drums;
            }
            else if (track.playbackInfo.program >= 0 && track.playbackInfo.program <= 6)
            {
                TrackType = TrackType.Piano;
            }
            else if (track.playbackInfo.program >= 26 && track.playbackInfo.program <= 31)
            {
                TrackType = TrackType.ElectricGuitar;
            }
            else if (track.playbackInfo.program >= 32 && track.playbackInfo.program <= 39)
            {
                TrackType = TrackType.BassGuitar;
            }
            else 
            {
                TrackType = TrackType.Default;
            }

            // scan all bars if they have any note 
            _usedBars = new bool[track.bars.length];
            for (int barI = 0; barI < track.bars.length; barI++)
            {
                Bar bar = (Bar) track.bars[barI];
                _usedBars[barI] = false;

                for (int voiceI = 0; voiceI < bar.voices.length && (!_usedBars[barI]); voiceI++)
                {
                    Voice voice = (Voice) bar.voices[voiceI];
                    for (int beatI = 0; beatI < voice.beats.length; beatI++)
                    {
                        Beat b = (Beat) voice.beats[beatI];
                        if (!b.isRest())
                        {
                            _usedBars[barI] = true;
                        }
                    }
                    
                }   
            }
        }


        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            OnPropertyChangedExplicit(propertyName);
        }
        protected virtual void OnPropertyChangedExplicit(string propertyName)
        {
            PropertyChangedEventHandler handler = PropertyChanged;
            if (handler != null) handler(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public enum TrackType
    {
        Default,
        ElectricGuitar,
        BassGuitar,
        Drums,
        Piano
    }
}
