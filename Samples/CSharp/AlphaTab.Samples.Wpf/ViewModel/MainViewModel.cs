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
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using AlphaTab.Importer;
using AlphaTab.Model;
using AlphaTab.Samples.Wpf.Data;
using AlphaTab.Samples.Wpf.Utils;

namespace AlphaTab.Samples.Wpf.ViewModel
{
    /// <summary>
    /// This viewmodel contains the data and logic for the main application window. 
    /// </summary>
    public class MainViewModel : ViewModelBase
    {
        // references to the services we want to use
        private readonly IDialogService _dialogService;
        private readonly IErrorService _errorService;

        #region Score Data

        // those properties store the score information

        private Score _score;
        private int _currentTrackIndex;
        private IEnumerable<TrackViewModel> _trackInfos;
        private TrackViewModel _selectedTrackInfo;
        private readonly RelayCommand _showScoreInfoCommand;
        private string[] _renderEngines;
        private string _renderEngine;

        /// <summary>
        /// A command which raises the <see cref="ShowScoreInfo"/> method
        /// </summary>
        public ICommand ShowScoreInfoCommand
        {
            get { return _showScoreInfoCommand; }
        }

        public string[] RenderEngines
        {
            get { return _renderEngines; }
        }

        public string RenderEngine
        {
            get { return _renderEngine; }
            set
            {
                if (value == _renderEngine) return;
                _renderEngine = value;
                OnPropertyChanged();
            }
        }

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
                OnPropertyChanged("ScoreTitle");
                _showScoreInfoCommand.RaiseCanExecuteChanged();

                // select the first track
                CurrentTrackIndex = 0;
            }
        }

        /// <summary>
        /// Gets or sets the title of the currently loaded sore.
        /// </summary>
        public string ScoreTitle
        {
            get
            {
                return _score == null ? "No File Opened" : _score.Title;
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
                OnPropertyChanged(nameof(CurrentTracks));
            }
        }

        /// <summary>
        /// Gets the currently selected track. 
        /// </summary>
        public IEnumerable<Track> CurrentTracks
        {
            get
            {
                if (Score == null || CurrentTrackIndex < 0 || CurrentTrackIndex >= _score.Tracks.Count) return null;
                return new[] { _score.Tracks[_currentTrackIndex] };
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
                    CurrentTrackIndex = _score.Tracks.IndexOf(_selectedTrackInfo.Track);
                }
                OnPropertyChanged();
            }
        }

        /// <summary>
        /// Opens a score info dialog for the current score.
        /// </summary>
        public void ShowScoreInfo()
        {
            if (_score != null)
                _dialogService.ShowScoreInfo(_score);
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
            OpenFile(_dialogService.OpenFile());
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
            Task.Factory.StartNew(() =>
            {
                try
                {
                    // load the score from the filesystem
                    Score = ScoreLoader.LoadScoreFromBytes(File.ReadAllBytes(file));

                    // build the track info objects for the ui
                    TrackViewModel[] trackInfos = new TrackViewModel[Score.Tracks.Count];
                    for (int i = 0; i < trackInfos.Length; i++)
                    {
                        trackInfos[i] = new TrackViewModel(Score.Tracks[i]);
                    }
                    TrackInfos = trackInfos;
                }
                catch (Exception e)
                {
                    _errorService.OpenFailed(e);
                }
            });
        }

        /// <summary>
        /// Updates the currently selected viewmodel
        /// </summary>
        private void UpdateSelectedViewModel()
        {
            if (_trackInfos != null)
            {
                var currentTrackLookup = CurrentTracks.ToLookup(t => t.Index);
                foreach (var trackViewModel in _trackInfos)
                {
                    trackViewModel.IsSelected = currentTrackLookup.Contains(trackViewModel.Track.Index);
                }
            }
        }

        #endregion

        public MainViewModel(IDialogService dialogService, IErrorService errorService)
        {
            _renderEngines = new[] { "gdi", "skia" };
            _renderEngine = _renderEngines[0];
            _dialogService = dialogService;
            _errorService = errorService;
            OpenFileCommand = new RelayCommand(OpenFile);
            _showScoreInfoCommand = new RelayCommand(ShowScoreInfo, () => _score != null);
        }
    }
}
