using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlphaTab.Model;
using AlphaTab.Rendering;
using SkiaSharp;
using Xamarin.Forms;

namespace AlphaTab.Platform.CSharp.Xamarin.Forms
{
    public class AlphaTab : ScrollView
    {
        private StackLayout _stackLayout;

        public static readonly BindableProperty SettingsProperty = BindableProperty.Create("Settings", typeof(Settings), typeof(AlphaTab));
        public Settings Settings
        {
            get { return (Settings)GetValue(SettingsProperty); }
            set { SetValue(SettingsProperty, value); }
        }

        public static readonly BindableProperty TracksProperty = BindableProperty.Create("Tracks", typeof(IEnumerable<Track>), typeof(AlphaTab), propertyChanged: OnTracksChanged);
        private static void OnTracksChanged(BindableObject bindable, object oldvalue, object newvalue)
        {
            ((AlphaTab)bindable).InvalidateTracks();
        }
        public IEnumerable<Track> Tracks
        {
            get { return (IEnumerable<Track>)GetValue(TracksProperty); }
            set { SetValue(TracksProperty, value); }
        }

        private static readonly BindablePropertyKey PartialResultsPropertyKey = BindableProperty.CreateReadOnly("PartialResults", typeof(ObservableCollection<SKImage>), typeof(AlphaTab), null);
        private static readonly BindableProperty PartialResultsProperty = PartialResultsPropertyKey.BindableProperty;
        public ObservableCollection<SKImage> PartialResults
        {
            get { return (ObservableCollection<SKImage>)GetValue(PartialResultsProperty); }
            set { SetValue(PartialResultsPropertyKey, value); }
        }

        private readonly ScoreRenderer _renderer;

        public AlphaTab()
        {
            _stackLayout = new StackLayout();
            Content = _stackLayout;

            var settings = Settings.Defaults;
            settings.Engine = "skia";
            Settings = settings;
            PartialResults = new ObservableCollection<SKImage>();
            _renderer = new ScoreRenderer(settings);
            _renderer.PreRender += result =>
            {
                lock (this)
                {
                    Device.BeginInvokeOnMainThread(() =>
                    {
                        ClearPartialResults();
                        AddPartialResult(result);
                    });
                }
            };
            _renderer.PartialRenderFinished += result =>
            {
                lock (this)
                {
                    Device.BeginInvokeOnMainThread(() =>
                    {
                        AddPartialResult(result);
                    });
                }
            };
            _renderer.RenderFinished += result =>
            {
                Device.BeginInvokeOnMainThread(() =>
                {
                    OnRenderFinished(result);
                });
            };
        }

        private void ClearPartialResults()
        {
            var oldResults = PartialResults;
            PartialResults = new ObservableCollection<SKImage>();
            foreach (var oldResult in oldResults)
            {
                oldResult.Dispose();
            }
            _stackLayout.Children.Clear();
        }

        private void AddPartialResult(RenderFinishedEventArgs result)
        {
            lock (this)
            {
                WidthRequest = result.TotalWidth;
                HeightRequest = result.TotalHeight;
                if (result.RenderResult != null)
                {
                    PartialResults.Add((SKImage)result.RenderResult);
                    _stackLayout.Children.Add(new Label
                    {
                        Text = _stackLayout.Children.Count.ToString(),
                        WidthRequest = result.Width,
                        HeightRequest = result.Height
                    });
                }
            }
        }

        private void InvalidateTracks()
        {
            if (Tracks == null) return;
            var tracks = Tracks.ToArray();
            Task.Factory.StartNew(() =>
            {
                try
                {
                    _renderer.RenderMultiple(tracks);
                }
                catch (Exception e)
                {
                    Debug.WriteLine(e);
                }
            });
        }

        public event EventHandler<RenderFinishedEventArgs> RenderFinished;
        protected virtual void OnRenderFinished(RenderFinishedEventArgs e)
        {
            RenderFinished?.Invoke(this, e);
        }
    }
}
