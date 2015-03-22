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
using System.ComponentModel;
using System.Runtime.CompilerServices;
using AlphaTab.Model;

namespace AlphaTab.Wpf.ViewModel
{
    public class ScoreInfoViewModel : ViewModelBase
    {
        private string _tab;
        private string _words;
        private string _title;
        private string _subTitle;
        private string _notices;
        private string _music;
        private string _instructions;
        private string _copyright;
        private string _artist;
        private string _album;

        public ScoreInfoViewModel(Score score)
        {
            _tab = score.Tab;
            _words = score.Words;
            _title = score.Title;
            _subTitle = score.SubTitle;
            _notices = score.Notices;
            _music = score.Music;
            _instructions = score.Instructions;
            _copyright = score.Copyright;
            _artist = score.Artist;
            _album = score.Album;
        }

        public string Album
        {
            get { return _album; }
            set
            {
                _album = value;
                OnPropertyChanged();
            }
        }

        public string Artist
        {
            get { return _artist; }
            set
            {
                _artist = value;
                OnPropertyChanged();
            }
        }

        public string Copyright
        {
            get { return _copyright; }
            set
            {
                _copyright = value;
                OnPropertyChanged();
            }
        }

        public string Instructions
        {
            get { return _instructions; }
            set
            {
                _instructions = value;
                OnPropertyChanged();
            }
        }

        public string Music
        {
            get { return _music; }
            set
            {
                _music = value;
                OnPropertyChanged();
            }
        }

        public string Notices
        {
            get { return _notices; }
            set
            {
                _notices = value;
                OnPropertyChanged();
            }
        }

        public string SubTitle
        {
            get { return _subTitle; }
            set
            {
                _subTitle = value;
                OnPropertyChanged();
            }
        }

        public string Title
        {
            get { return _title; }
            set
            {
                _title = value;
                OnPropertyChanged();
            }
        }

        public string Words
        {
            get { return _words; }
            set
            {
                _words = value;
                OnPropertyChanged();
            }
        }

        public string Tab
        {
            get { return _tab; }
            set
            {
                _tab = value;
                OnPropertyChanged();
            }
        }
    }
}
