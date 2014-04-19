using System.Runtime.InteropServices;
#if CSharp
using System;
using System.Drawing;
using System.Windows;
using System.Windows.Media.Imaging;
using AlphaTab.Model;
using AlphaTab.Rendering;
using Image = System.Windows.Controls.Image;

namespace AlphaTab.Platform.CSharp.Wpf
{
    public class AlphaTabImage : Image
    {
        public static readonly DependencyProperty TrackProperty =
            DependencyProperty.Register("Track", typeof(Track), typeof(AlphaTabImage), new PropertyMetadata(null, OnTrackChanged));

        public static readonly DependencyProperty SettingsProperty =
          DependencyProperty.Register("Settings", typeof(Settings), typeof(AlphaTabImage), new PropertyMetadata(null, OnSettingsChanged));

        private static void OnSettingsChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            ((AlphaTabImage)d).InvalidateTrack();
        }

        public Track Track
        {
            get { return (Track)GetValue(TrackProperty); }
            set { SetValue(TrackProperty, value); }
        }

        private static void OnTrackChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            ((AlphaTabImage)d).InvalidateTrack();
        }

        public Settings Settings
        {
            get { return (Settings)GetValue(SettingsProperty); }
            set { SetValue(SettingsProperty, value); }
        }

        private readonly ScoreRenderer _renderer;

        public AlphaTabImage()
        {
            var settings = Settings.Defaults;
            settings.Engine = "gdi";
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

        public static readonly RoutedEvent RenderFinishedEvent = EventManager.RegisterRoutedEvent("RenderFinished", RoutingStrategy.Bubble, typeof(RoutedEventHandler), typeof(AlphaTabImage));
        public event RoutedEventHandler RenderFinished
        {
            add { AddHandler(RenderFinishedEvent, value); }
            remove { RemoveHandler(RenderFinishedEvent, value); }
        }

        [DllImport("gdi32.dll")]
        private static extern bool DeleteObject(IntPtr hObject);

        protected virtual void OnRenderFinished()
        {
            using (Bitmap bitmap = ((GdiCanvas)_renderer.Canvas).Image)
            {
                IntPtr hBitmap = bitmap.GetHbitmap();
                try
                {
                    Source = System.Windows.Interop.Imaging.CreateBitmapSourceFromHBitmap(
                        hBitmap,
                        IntPtr.Zero, Int32Rect.Empty,
                        BitmapSizeOptions.FromWidthAndHeight(bitmap.Width, bitmap.Height));
                    Width = bitmap.Width;
                    Height = bitmap.Height;
                }
                finally
                {
                    DeleteObject(hBitmap);
                }
            }

            RoutedEventArgs newEventArgs = new RoutedEventArgs(RenderFinishedEvent);
            RaiseEvent(newEventArgs);
        }

        #endregion

    }
}
#endif