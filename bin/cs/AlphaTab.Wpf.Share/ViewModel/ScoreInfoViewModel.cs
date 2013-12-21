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
    public class ScoreInfoViewModel : INotifyPropertyChanged
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
            _tab = score.tab;
            _words = score.words;
            _title = score.title;
            _subTitle = score.subTitle;
            _notices = score.notices;
            _music = score.music;
            _instructions = score.instructions;
            _copyright = score.copyright;
            _artist = score.artist;
            _album = score.album;
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


        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChangedEventHandler handler = PropertyChanged;
            if (handler != null) handler(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
