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
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using alphatab.importer;
using alphatab.model;
using AlphaTab.Wpf.Share.Data;
using AlphaTab.Wpf.Share.Utils;

namespace AlphaTab.Wpf.Share.ViewModel
{
    /// <summary>
    /// This viewmodel contains the data and logic for the main application window. 
    /// </summary>
    public class MainViewModel : INotifyPropertyChanged
    {
        // references to the services we want to use
        private readonly IIOService _ioService;
        private readonly IErrorService _errorService;

        #region Score Data

        // those properties store the score information

        private Score _score;
        private int _currentTrackIndex;
        private IEnumerable<TrackViewModel> _trackInfos;
        private TrackViewModel _selectedTrackInfo;

        /// <summary>
        /// Gets or sets the currently opened score. 
        /// If a new score is selected, the first track gets loaded.
        /// </summary>
        public Score Score
        {
            get { return _score; }
            set
            {
                _score = value;
                OnPropertyChanged();

                // select the first track
                CurrentTrackIndex = 0;
            }
        }

        /// <summary>
        /// Gets or sets the index of the track which should be currently displayed.
        /// </summary>
        public int CurrentTrackIndex
        {
            get { return _currentTrackIndex; }
            set
            {
                _currentTrackIndex = value;

                // update the visual track selection if a new track is selected
                UpdateSelectedViewModel();

                // notify the ui
                OnPropertyChanged();
                OnPropertyChangedExplicit("CurrentTrack");
            }
        }

        /// <summary>
        /// Gets the currently selected track. 
        /// </summary>
        public Track CurrentTrack
        {
            get
            {
                if (Score == null || CurrentTrackIndex < 0 || CurrentTrackIndex >= _score.tracks.length) return null;
                return (Track)_score.tracks[_currentTrackIndex];
            }
        }

        /// <summary>
        /// Gets the information about the currently loaded tracks
        /// </summary>
        public IEnumerable<TrackViewModel> TrackInfos
        {
            get { return _trackInfos; }
            private set
            {
                _trackInfos = value;

                // ensure correct selection
                UpdateSelectedViewModel();
                OnPropertyChanged();
            }
        }

        /// <summary>
        /// Gets or sets the currently selected track.
        /// </summary>
        public TrackViewModel SelectedTrackInfo
        {
            get { return _selectedTrackInfo; }
            set
            {
                _selectedTrackInfo = value;
                // select the new track
                if (_score != null)
                {
                    CurrentTrackIndex = Array.FindIndex(_score.tracks.__a, t => t == _selectedTrackInfo.Track);
                }
                OnPropertyChanged();
            }
        }

        #endregion

        #region Score Loading

        /// <summary>
        /// A command which raises a file opening
        /// </summary>
        public ICommand OpenFileCommand { get; private set; }

        /// <summary>
        /// Opens a new file by loading the file path using the IO service. 
        /// </summary>
        public void OpenFile()
        {
            OpenFile(_ioService.OpenFile());
        }

        /// <summary>
        /// Opens a new file from the specified file path.
        /// </summary>
        /// <param name="file">the path to the file to load</param>
        private void OpenFile(string file)
        {
            if (!string.IsNullOrWhiteSpace(file) && File.Exists(file))
            {
                InternalOpenFile(file);
            }
        }

        private void InternalOpenFile(string file)
        {
            try
            {
                // load the score from the filesystem
                Score = ScoreLoader.loadScore(file);

                // build the track info objects for the ui
                TrackViewModel[] trackInfos = new TrackViewModel[Score.tracks.length];
                for (int i = 0; i < trackInfos.Length; i++)
                {
                    trackInfos[i] = new TrackViewModel((Track)Score.tracks[i]);
                }
                TrackInfos = trackInfos;
            }
            catch (Exception e)
            {
                _errorService.OpenFailed(e);
            }
        }

        /// <summary>
        /// Updates the currently selected viewmodel
        /// </summary>
        private void UpdateSelectedViewModel()
        {
            if (_trackInfos != null)
            {
                var currentTrack = CurrentTrack;
                foreach (var trackViewModel in _trackInfos)
                {
                    trackViewModel.IsSelected = currentTrack == trackViewModel.Track;
                }
            }
        }

        #endregion

        public MainViewModel(IIOService ioService, IErrorService errorService)
        {
            _ioService = ioService;
            _errorService = errorService;
            OpenFileCommand = new RelayCommand(OpenFile);
        }


        #region INotifyPropertyChanged

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChangedExplicit(string propertyName)
        {
            PropertyChangedEventHandler handler = PropertyChanged;
            if (handler != null) handler(this, new PropertyChangedEventArgs(propertyName));
        }

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            OnPropertyChangedExplicit(propertyName);
        }

        #endregion
    }
}
