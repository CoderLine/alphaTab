#if ANDROID
using System;
using System.Collections.Generic;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Rendering;
using Xamarin.Forms;

namespace AlphaTab.Platform.CSharp.Xamarin.Forms
{
    public class AlphaTab : ScrollView
    {
        private readonly AlphaTabLayoutPanel _contentPanel;

        public static readonly BindableProperty TracksProperty =
 BindableProperty.Create("Tracks", typeof(IEnumerable<Track>), typeof(AlphaTab), propertyChanged: OnTracksChanged);
        private static void OnTracksChanged(BindableObject bindable, object oldvalue, object newvalue)
        {
            ((AlphaTab)bindable).RenderTracks();
        }
        public IEnumerable<Track> Tracks
        {
            get { return (IEnumerable<Track>)GetValue(TracksProperty); }
            set { SetValue(TracksProperty, value); }
        }

        public static readonly BindableProperty SettingsProperty =
 BindableProperty.Create("Settings", typeof(Settings), typeof(AlphaTab), propertyChanged: OnSettingsChanged);
        private static void OnSettingsChanged(BindableObject bindable, object oldvalue, object newvalue)
        {
            ((AlphaTab)bindable).OnSettingsChanged((Settings)newvalue);
        }

        public Settings Settings
        {
            get { return (Settings)GetValue(SettingsProperty); }
            set { SetValue(SettingsProperty, value); }
        }

        private readonly ScoreRenderer _renderer;
        public AlphaTabApi<AlphaTab> Api { get; private set; }

        public AlphaTab()
        {
            _contentPanel = new AlphaTabLayoutPanel();
            _contentPanel.HorizontalOptions = new LayoutOptions(LayoutAlignment.Start, true);
            _contentPanel.VerticalOptions = new LayoutOptions(LayoutAlignment.Start, true);

            Orientation = ScrollOrientation.Both;

            Content = _contentPanel;

            Settings = Settings.Defaults;
            Settings.EnablePlayer = true;
            Settings.EnableCursor = true;

            Api = new AlphaTabApi<AlphaTab>(new XamarinFormsUiFacade(this, _contentPanel), this);

        }

        public void RenderTracks()
        {
            if (Tracks == null) return;

            Score score = null;
            var trackIndexes = new FastList<int>();
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
                Api.RenderTracks(score, trackIndexes.ToArray());
            }
        }

        public event Action<Settings> SettingsChanged;
        private void OnSettingsChanged(Settings obj)
        {
            SettingsChanged?.Invoke(obj);
        }
    }
}
#endif
