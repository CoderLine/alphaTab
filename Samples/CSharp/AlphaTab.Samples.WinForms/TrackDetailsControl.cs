﻿using System;
using System.Drawing;
using System.Windows.Forms;
using AlphaTab.Model;

namespace AlphaTab.Samples.WinForms
{
    public partial class TrackDetailsControl : UserControl
    {
        private bool _isSelected;
        private Track _track;

        public bool IsSelected
        {
            get { return _isSelected; }
            set
            {
                _isSelected = value;
                BackColor = value ? Color.FromArgb(116, 118, 117) : Color.FromArgb(93, 94, 95);
            }
        }

        public Track Track
        {
            get { return _track; }
            set
            {
                _track = value;
                TrackName = value.Name;
                Volume = (int)Math.Round(value.PlaybackInfo.Volume * 100, 0);
                IsSolo = value.PlaybackInfo.IsSolo;
                IsMute = value.PlaybackInfo.IsMute;
            }
        }

        public string TrackName
        {
            get { return lblName.Text; }
            set { lblName.Text = value; }
        }

        public int Volume
        {
            get { return volumeTrack.Value; }
            set { volumeTrack.Value = value; }
        }

        public bool IsSolo
        {
            get { return isSoloCheck.Checked; }
            set { isSoloCheck.Checked = value; }
        }

        public bool IsMute
        {
            get { return isMuteCheck.Checked; }
            set { isMuteCheck.Checked = value; }
        }

        public TrackDetailsControl()
        {
            InitializeComponent();
        }

        public TrackDetailsControl(Track track)
        {
            InitializeComponent();
            Track = track;
        }

        public event EventHandler Selected;
        protected virtual void OnSelected()
        {
            EventHandler handler = Selected;
            if (handler != null) handler(this, EventArgs.Empty);
        }

        private void lblName_Click(object sender, EventArgs e)
        {
            OnSelected();
        }
    }
}
