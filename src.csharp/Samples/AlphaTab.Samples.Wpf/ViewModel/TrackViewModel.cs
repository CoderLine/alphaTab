using System.Linq;
using AlphaTab.Model;

namespace AlphaTab.Samples.Wpf.ViewModel
{
    /// <summary>
    /// A viewmodel for displaying track information in the UI
    /// </summary>
    public class TrackViewModel : ViewModelBase
    {
        private TrackType _trackType;
        private bool[] _usedBars;
        private bool _isSelected;
        private Track _track;

        public bool IsSelected
        {
            get => _isSelected;
            set
            {
                _isSelected = value;
                OnPropertyChanged();
            }
        }

        public TrackType TrackType
        {
            get => _trackType;
            set
            {
                _trackType = value;
                OnPropertyChanged();
            }
        }

        public string Name
        {
            get => _track.Name;
            set
            {
                _track.Name = value;
                OnPropertyChanged();
            }
        }

        public int Volume
        {
            get => (int)_track.PlaybackInfo.Volume;
            set
            {
                _track.PlaybackInfo.Volume = value;
                OnPropertyChanged();
            }
        }

        public bool IsSolo
        {
            get => _track.PlaybackInfo.IsSolo;
            set
            {
                _track.PlaybackInfo.IsSolo = value;
                OnPropertyChanged();
            }
        }

        public bool IsMute
        {
            get => _track.PlaybackInfo.IsMute;
            set
            {
                _track.PlaybackInfo.IsMute = value;
                OnPropertyChanged();
            }
        }

        public bool[] UsedBars
        {
            get => _usedBars;
            set
            {
                _usedBars = value;
                OnPropertyChanged();
            }
        }

        public Track Track
        {
            get => _track;
            set
            {
                _track = value;
                OnPropertyChanged();
            }
        }

        public TrackViewModel(Track track)
        {
            _track = track;

            // general midi Programs
            if (track.Staves.Any(s=>s.IsPercussion))
            {
                TrackType = TrackType.Drums;
            }
            else if (track.PlaybackInfo.Program >= 0 && track.PlaybackInfo.Program <= 6)
            {
                TrackType = TrackType.Piano;
            }
            else if (track.PlaybackInfo.Program >= 26 && track.PlaybackInfo.Program <= 31)
            {
                TrackType = TrackType.ElectricGuitar;
            }
            else if (track.PlaybackInfo.Program >= 32 && track.PlaybackInfo.Program <= 39)
            {
                TrackType = TrackType.BassGuitar;
            }
            else
            {
                TrackType = TrackType.Default;
            }

            // scan all bars if they have any note
            _usedBars = new bool[(int)track.Score.MasterBars.Count];
            for (var s = 0; s < track.Staves.Count; s++)
            {
                var staff = track.Staves[s];
                for (var barI = 0; barI < staff.Bars.Count; barI++)
                {
                    var bar = staff.Bars[barI];
                    _usedBars[barI] = false;

                    for (var voiceI = 0; voiceI < bar.Voices.Count && (!_usedBars[barI]); voiceI++)
                    {
                        var voice = bar.Voices[voiceI];
                        for (var i = 0; i < voice.Beats.Count; i++)
                        {
                            var b = voice.Beats[i];
                            if (!b.IsRest)
                            {
                                _usedBars[barI] = true;
                            }
                        }
                    }
                }
            }
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
