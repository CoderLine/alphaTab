using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Drawing;
using System.Windows.Forms;
using AlphaTab.Model;

namespace AlphaTab.WinForms
{
    /// <summary>
    /// A WinForms UI control to display an instance of alphaTab via <see cref="PictureBox"/>
    /// items.
    /// </summary>
    public sealed class AlphaTabControl : Panel
    {
        private IEnumerable<Track>? _tracks;

        private readonly AlphaTabLayoutPanel _layoutPanel;
        private Settings _settings;

        /// <see cref="AlphaTabApiBase{TSettings}.Tracks"/>
        [Browsable(false)]
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
        public IEnumerable<Track>? Tracks
        {
            get => _tracks;
            set
            {
                if (Equals(_tracks, value))
                {
                    return;
                }

                if (_tracks is INotifyCollectionChanged observable)
                {
                    observable.CollectionChanged -= OnTracksChanged;
                }

                _tracks = value;

                if (_tracks is INotifyCollectionChanged observable2)
                {
                    observable2.CollectionChanged += OnTracksChanged;
                }

                RenderTracks();
            }
        }

        /// <see cref="AlphaTabApiBase{TSettings}.Settings"/>
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Content)]
        public Settings Settings
        {
            get => _settings;
            set
            {
                if (_settings == value)
                {
                    return;
                }

                _settings = value;
                OnSettingsChanged(value);
            }
        }

        /// <summary>
        /// Gets the alphaTab API object.
        /// </summary>
        [Browsable(false)]
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
        public AlphaTabApiBase<AlphaTabControl> Api { get; private set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="AlphaTabControl"/> class.
        /// </summary>
        public AlphaTabControl()
        {
            _settings = null!;
            _layoutPanel = new AlphaTabLayoutPanel();
            AutoScroll = true;
            Controls.Add(_layoutPanel);

            Settings = new Settings();
            Settings.Player.EnablePlayer = true;
            Settings.Player.EnableCursor = true;
        }

        /// <inheritdoc />
        protected override void OnHandleCreated(EventArgs e)
        {
            Api = new AlphaTabApiBase<AlphaTabControl>(new WinFormsUiFacade(this, _layoutPanel),
                this);
            base.OnHandleCreated(e);
        }

        /// <inheritdoc />
        protected override void OnPaddingChanged(EventArgs e)
        {
            base.OnPaddingChanged(e);
            if (_layoutPanel != null)
            {
                _layoutPanel.Location = new Point(Padding.Left, Padding.Top);
            }
        }

        /// <inheritdoc />
        protected override void OnControlAdded(ControlEventArgs e)
        {
            base.OnControlAdded(e);
            if (e.Control != _layoutPanel)
            {
                Controls.Remove(e.Control);
            }
        }

        /// <inheritdoc />
        protected override void OnForeColorChanged(EventArgs e)
        {
            base.OnForeColorChanged(e);
            if (_layoutPanel != null)
            {
                _layoutPanel.BackColor = ForeColor;
            }
        }

        private void OnTracksChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            RenderTracks();
        }

        /// <summary>
        /// Initiates a rendering of the currently configured tracks.
        /// </summary>
        public void RenderTracks()
        {
            if (Tracks == null)
            {
                return;
            }

            Score? score = null;
            var trackIndexes = new List<double>();
            foreach (var track in Tracks)
            {
                if (score == null)
                {
                    score = track.Score;
                }

                if (score == track.Score)
                {
                    trackIndexes.Add(track.Index);
                }
            }

            if (score != null)
            {
                Api.RenderScore(score, trackIndexes);
            }
        }

        /// <summary>
        /// Fired when the settings object changed.
        /// </summary>
        /// <remarks>
        /// Only fires when the whole object changes but not if individual properties changed.
        /// </remarks>
        public event Action<Settings>? SettingsChanged;

        private void OnSettingsChanged(Settings obj)
        {
            SettingsChanged?.Invoke(obj);
        }
    }
}
