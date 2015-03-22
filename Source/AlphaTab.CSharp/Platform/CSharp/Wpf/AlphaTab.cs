/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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
using System.Collections.ObjectModel;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using AlphaTab.Model;
using AlphaTab.Rendering;

namespace AlphaTab.Platform.CSharp.Wpf
{
    public class AlphaTab : Control
    {
        public static readonly DependencyProperty TrackProperty =
            DependencyProperty.Register("Track", typeof(Track), typeof(AlphaTab), new PropertyMetadata(null, OnTrackChanged));

        public static readonly DependencyProperty SettingsProperty =
          DependencyProperty.Register("Settings", typeof(Settings), typeof(AlphaTab), new PropertyMetadata(null, OnSettingsChanged));

        public static readonly DependencyProperty PartialResultsProperty = DependencyProperty.Register(
         "PartialResults", typeof(ObservableCollection<ImageSource>), typeof(AlphaTab), new PropertyMetadata(default(ObservableCollection<ImageSource>)));

        static AlphaTab()
        {
            DefaultStyleKeyProperty.OverrideMetadata(typeof(AlphaTab),
                new FrameworkPropertyMetadata(typeof(AlphaTab)));
        }

        private static void OnSettingsChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            ((AlphaTab)d).InvalidateTrack();
        }

        public Track Track
        {
            get { return (Track)GetValue(TrackProperty); }
            set { SetValue(TrackProperty, value); }
        }

        private static void OnTrackChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            ((AlphaTab)d).InvalidateTrack();
        }

        public Settings Settings
        {
            get { return (Settings)GetValue(SettingsProperty); }
            set { SetValue(SettingsProperty, value); }
        }


        public ObservableCollection<ImageSource> PartialResults
        {
            get { return (ObservableCollection<ImageSource>)GetValue(PartialResultsProperty); }
            set { SetValue(PartialResultsProperty, value); }
        }

        private readonly ScoreRenderer _renderer;

        public AlphaTab()
        {
            SnapsToDevicePixels = true;
            var settings = Settings.Defaults;
            settings.Engine = "gdi";
            Settings = settings;
            PartialResults = new ObservableCollection<ImageSource>();
            _renderer = new ScoreRenderer(settings, this);
            _renderer.PreRender += () =>
            {
                lock (this)
                {
                    Dispatcher.BeginInvoke(new Action(() =>
                    {
                        PartialResults.Clear();
                    }));
                }
            };
            _renderer.PartialRenderFinished += result =>
            {
                lock (this)
                {
                    Dispatcher.BeginInvoke(new Action(() =>
                    {
                        AddPartialResult(result);
                    }));
                }
            };
            _renderer.RenderFinished += result =>
            {
                Dispatcher.BeginInvoke(new Action(() =>
                {
                    OnRenderFinished(result);
                }));
            };
        }

        private void AddPartialResult(RenderFinishedEventArgs result)
        {
            lock (this)
            {
                Width = result.TotalWidth;
                Height = result.TotalHeight;
                var bitmap = (Bitmap)result.RenderResult;
                IntPtr hBitmap = bitmap.GetHbitmap();
                try
                {
                    PartialResults.Add(Imaging.CreateBitmapSourceFromHBitmap(
                            hBitmap,
                            IntPtr.Zero, Int32Rect.Empty,
                            BitmapSizeOptions.FromWidthAndHeight(bitmap.Width, bitmap.Height)));
                }
                finally
                {
                    DeleteObject(hBitmap);
                }
            }
        }

        public void InvalidateTrack()
        {
            if (Track == null) return;
            var track = Track;
            Task.Factory.StartNew(() =>
            {
                _renderer.Render(track);
            });
        }

        #region RenderFinished

        public static readonly RoutedEvent RenderFinishedEvent = EventManager.RegisterRoutedEvent("RenderFinished", RoutingStrategy.Bubble, typeof(RoutedEventHandler), typeof(AlphaTab));

        public event RoutedEventHandler RenderFinished
        {
            add { AddHandler(RenderFinishedEvent, value); }
            remove { RemoveHandler(RenderFinishedEvent, value); }
        }

        [DllImport("gdi32.dll")]
        private static extern bool DeleteObject(IntPtr hObject);

        protected virtual void OnRenderFinished(RenderFinishedEventArgs e)
        {
            RoutedEventArgs newEventArgs = new RoutedEventArgs(RenderFinishedEvent);
            RaiseEvent(newEventArgs);
        }

        #endregion

    }
}