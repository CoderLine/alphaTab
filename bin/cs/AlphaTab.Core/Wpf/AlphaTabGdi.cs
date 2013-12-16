/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
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
using System.Drawing;
using System.Windows;
using System.Windows.Media.Imaging;
using alphatab;
using alphatab.model;
using alphatab.platform.cs;
using alphatab.rendering;
using AlphaTab.Utils;
using Image = System.Windows.Controls.Image;

namespace AlphaTab.Wpf
{
    public class AlphaTabGdi : Image
    {
        public static readonly DependencyProperty TrackProperty =
            DependencyProperty.Register("Track", typeof(Track), typeof(AlphaTabGdi), new PropertyMetadata(null, OnTrackChanged));
        
        public static readonly DependencyProperty SettingsProperty =
          DependencyProperty.Register("Settings", typeof(Settings), typeof(AlphaTabGdi), new PropertyMetadata(null, OnSettingsChanged));

        private static void OnSettingsChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            ((AlphaTabGdi)d).InvalidateTrack();
        }

        public Track Track
        {
            get { return (Track)GetValue(TrackProperty); }
            set { SetValue(TrackProperty, value); }
        }

        private static void OnTrackChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            ((AlphaTabGdi)d).InvalidateTrack();
        }

        public Settings Settings
        {
            get { return (Settings)GetValue(SettingsProperty); }
            set { SetValue(SettingsProperty, value); }
        }

        private readonly ScoreRenderer _renderer;

        public AlphaTabGdi()
        {
            var settings = Settings.defaults();
            settings.engine = "gdi";
            Settings = settings;
            _renderer = new ScoreRenderer(settings, this);
            _renderer.addRenderFinishedListener(new ActionFunction(OnRenderFinished));
        }

        public void InvalidateTrack()
        {
            if (Track == null) return;
            _renderer.render(Track);
        }

        #region RenderFinished

        public static readonly RoutedEvent RenderFinishedEvent = EventManager.RegisterRoutedEvent("RenderFinished", RoutingStrategy.Bubble, typeof(RoutedEventHandler), typeof(AlphaTabGdi));
        public event RoutedEventHandler RenderFinished
        {
            add { AddHandler(RenderFinishedEvent, value); }
            remove { RemoveHandler(RenderFinishedEvent, value); }
        }

        // This method raises the Tap event 
        protected virtual void OnRenderFinished()
        {
            using (Bitmap bitmap = ((GdiCanvas)_renderer.canvas).getImage())
            {
                Source = System.Windows.Interop.Imaging.CreateBitmapSourceFromHBitmap(
                    bitmap.GetHbitmap(),
                    IntPtr.Zero, Int32Rect.Empty,
                    BitmapSizeOptions.FromWidthAndHeight(bitmap.Width, bitmap.Height));
                Width = bitmap.Width;
                Height = bitmap.Height;
            }

            RoutedEventArgs newEventArgs = new RoutedEventArgs(RenderFinishedEvent);
            RaiseEvent(newEventArgs);
        }

        #endregion

    }
}
