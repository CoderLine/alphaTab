using System;
using System.IO;
using System.Windows.Forms;
using alphatab.importer;
using alphatab.model;
using Track = alphatab.model.Track;

namespace AlphaTab.Gdi
{
    public partial class MainWindow : Form
    {
        private Score _score;
        private int _currentTrackIndex;

        public MainWindow()
        {
            InitializeComponent();
        }

        private void openFileButton_Click(object sender, EventArgs e)
        {
            OpenFile();
        }

        #region Score Data

        public Score Score
        {
            get { return _score; }
            set
            {
                _score = value;
                showScoreInfo.Enabled = value != null;
                Text = "AlphaTab - " + (value == null ? "No File Opened" : value.title);
                CurrentTrackIndex = 0;
            }
        }

        public int CurrentTrackIndex
        {
            get { return _currentTrackIndex; }
            set
            {
                _currentTrackIndex = value;
                UpdateSelectedTrack();
                var track = CurrentTrack;
                if (track != null)
                {
                    alphaTabControl1.Track = track;
                }
            }
        }

        public Track CurrentTrack
        {
            get
            {
                if (Score == null || CurrentTrackIndex < 0 || CurrentTrackIndex >= _score.tracks.length) return null;
                return (Track)_score.tracks[_currentTrackIndex];
            }
        }

        #endregion

        #region Score Loading

        private void OpenFile()
        {
            using (OpenFileDialog dialog = new OpenFileDialog())
            {
                dialog.Filter = "Supported Files (*.gp3, *.gp4, *.gp5, *.gpx)|*.gp3;*.gp4;*.gp5;*.gpx";
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
                Score = ScoreLoader.loadScore(file);

                trackDetails.Controls.Clear();
                trackBars.Controls.Clear();
                for (int i = Score.tracks.length - 1; i >= 0; i--)
                {
                    TrackDetailsControl details = new TrackDetailsControl((Track)Score.tracks[i]);
                    details.Dock = DockStyle.Top;
                    details.Height = 25;
                    trackDetails.Controls.Add(details);
                    details.Selected += details_Click;

                    TrackBarsControl bars = new TrackBarsControl((Track)Score.tracks[i]);
                    bars.Dock = DockStyle.Top;
                    trackBars.Controls.Add(bars);
                }

                UpdateSelectedTrack();
            }
            catch (Exception e)
            {
                MessageBox.Show(this, e.Message, "An error during opening the file occured", MessageBoxButtons.OK,
                    MessageBoxIcon.Error);
            }
        }

        private void details_Click(object sender, EventArgs e)
        {
            TrackDetailsControl details = (TrackDetailsControl)sender;
            CurrentTrackIndex = Array.FindIndex(_score.tracks.__a, t => t == details.Track);
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
            if (_score == null) return;
            using (ScoreInfoWindow window = new ScoreInfoWindow(_score))
            {
                window.ShowDialog(this);
            }
        }

        private void panel1_MouseEnter(object sender, EventArgs e)
        {
            panel1.Focus();
        }
    }
}
