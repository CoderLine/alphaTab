using System;
using System.IO;
using System.Windows.Forms;
using AlphaTab.Synth;
using AlphaTab.Importer;
using AlphaTab.Model;
using AlphaTab.Samples.WinForms.Properties;
using Track = AlphaTab.Model.Track;

namespace AlphaTab.Samples.WinForms
{
    public partial class MainWindow : Form
    {
        private Score _score;
        private int _currentTrackIndex;

        public MainWindow()
        {
            InitializeComponent();
            alphaTabControl1.HandleCreated += (sender, args) =>
            {
                alphaTabControl1.Api.Player.StateChanged.On(OnPlayerStateChanged);
            };
        }


        private void OnPlayerStateChanged(PlayerStateChangedEventArgs e)
        {
            switch (e.State)
            {
                case PlayerState.Paused:
                    playPauseButton.Image = Resources.control_play;
                    break;
                case PlayerState.Playing:
                    playPauseButton.Image = Resources.control_pause;
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }

        private void openFileButton_Click(object sender, EventArgs e)
        {
            OpenFile();
        }

        #region Score Data

        public Score Score
        {
            get => _score;
            set
            {
                _score = value;
                showScoreInfo.Enabled = value != null;
                Text = "AlphaTab - " + (value == null ? "No File Opened" : value.Title);
                CurrentTrackIndex = 0;
            }
        }

        public int CurrentTrackIndex
        {
            get => _currentTrackIndex;
            set
            {
                _currentTrackIndex = value;
                UpdateSelectedTrack();
                var track = CurrentTrack;
                if (track != null)
                {
                    alphaTabControl1.Tracks = new[] {track};
                }
            }
        }

        public Track CurrentTrack
        {
            get
            {
                if (Score == null || CurrentTrackIndex < 0 ||
                    CurrentTrackIndex >= _score.Tracks.Count)
                {
                    return null;
                }

                return _score.Tracks[_currentTrackIndex];
            }
        }

        #endregion

        #region Score Loading

        private void OpenFile()
        {
            using (var dialog = new OpenFileDialog())
            {
                dialog.Filter =
                    "Supported Files (*.gp3, *.gp4, *.gp5, *.gpx, *.gp)|*.gp3;*.gp4;*.gp5;*.gpx;*.gp";
                if (dialog.ShowDialog(this) == DialogResult.OK)
                {
                    OpenFile(dialog.FileName);
                }
            }
        }

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
                Score = ScoreLoader.LoadScoreFromBytes(File.ReadAllBytes(file));

                trackDetails.Controls.Clear();
                trackBars.Controls.Clear();
                for (var i = Score.Tracks.Count - 1; i >= 0; i--)
                {
                    var details = new TrackDetailsControl(Score.Tracks[i]);
                    details.Dock = DockStyle.Top;
                    details.Height = 25;
                    trackDetails.Controls.Add(details);
                    details.Selected += details_Click;

                    var bars = new TrackBarsControl(Score.Tracks[i]);
                    bars.Dock = DockStyle.Top;
                    trackBars.Controls.Add(bars);
                }

                UpdateSelectedTrack();
            }
            catch (Exception e)
            {
                MessageBox.Show(this, e.Message, "An error during opening the file occured",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error);
            }
        }

        private void details_Click(object sender, EventArgs e)
        {
            var details = (TrackDetailsControl) sender;
            CurrentTrackIndex = _score.Tracks.IndexOf(details.Track);
        }

        private void UpdateSelectedTrack()
        {
            var currentTrack = CurrentTrack;
            foreach (TrackDetailsControl trackViewModel in trackDetails.Controls)
            {
                trackViewModel.IsSelected = currentTrack == trackViewModel.Track;
            }
        }

        #endregion

        private void showScoreInfo_Click(object sender, EventArgs e)
        {
            if (_score == null)
            {
                return;
            }

            using (var window = new ScoreInfoWindow(_score))
            {
                window.ShowDialog(this);
            }
        }

        private void playPauseButton_Click(object sender, EventArgs e)
        {
            alphaTabControl1.Api.PlayPause();
        }
    }
}
