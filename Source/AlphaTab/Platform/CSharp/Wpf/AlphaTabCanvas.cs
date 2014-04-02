using System.Windows;
using System.Windows.Controls;
using AlphaTab.Model;
using AlphaTab.Rendering;

namespace AlphaTab.Platform.CSharp
{
    public class AlphaTabCanvas : Canvas
    {
        public static readonly DependencyProperty TrackProperty =
            DependencyProperty.Register("Track", typeof(Track), typeof(AlphaTabCanvas), new PropertyMetadata(null, OnTrackChanged));

        public static readonly DependencyProperty SettingsProperty =
          DependencyProperty.Register("Settings", typeof(Settings), typeof(AlphaTabCanvas), new PropertyMetadata(null, OnSettingsChanged));

        private static void OnSettingsChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            ((AlphaTabCanvas)d).InvalidateTrack();
        }

        public Track Track
        {
            get { return (Track)GetValue(TrackProperty); }
            set { SetValue(TrackProperty, value); }
        }

        private static void OnTrackChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            ((AlphaTabCanvas)d).InvalidateTrack();
        }

        public Settings Settings
        {
            get { return (Settings)GetValue(SettingsProperty); }
            set { SetValue(SettingsProperty, value); }
        }

        private readonly ScoreRenderer _renderer;

        public AlphaTabCanvas()
        {
            var settings = Settings.Defaults;
            settings.Engine = "wpf";
            Settings = settings;
            _renderer = new ScoreRenderer(settings, this);
            _renderer.RenderFinished += OnRenderFinished;
        }

        public void InvalidateTrack()
        {
            if (Track == null) return;
            _renderer.Render(Track);
        }

        #region RenderFinished

        public static readonly RoutedEvent RenderFinishedEvent = EventManager.RegisterRoutedEvent("RenderFinished", RoutingStrategy.Bubble, typeof(RoutedEventHandler), typeof(AlphaTabCanvas));
        public event RoutedEventHandler RenderFinished
        {
            add { AddHandler(RenderFinishedEvent, value); }
            remove { RemoveHandler(RenderFinishedEvent, value); }
        }

        // This method raises the Tap event 
        protected virtual void OnRenderFinished()
        {
            RoutedEventArgs newEventArgs = new RoutedEventArgs(RenderFinishedEvent);
            RaiseEvent(newEventArgs);
        }

        #endregion

    }
}
