#if NET472
/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using AlphaTab.Audio.Synth;
using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Platform.CSharp.Wpf
{
    public class AlphaTab : Control
    {
        static AlphaTab()
        {
            DefaultStyleKeyProperty.OverrideMetadata(typeof(AlphaTab), new FrameworkPropertyMetadata(typeof(AlphaTab)));
        }

        private ScrollViewer _scrollView;

        #region Tracks

        public static readonly DependencyProperty TracksProperty = DependencyProperty.Register("Tracks", typeof(IEnumerable<Track>), typeof(AlphaTab), new PropertyMetadata(default(IEnumerable<Track>), OnTracksChanged));

        private static void OnTracksChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            var observable = e.OldValue as INotifyCollectionChanged;
            if (observable != null)
            {
                ((AlphaTab)d).UnregisterObservableCollection(observable);
            }

            observable = e.NewValue as INotifyCollectionChanged;
            if (observable != null)
            {
                ((AlphaTab)d).RegisterObservableCollection(observable);
            }

            ((AlphaTab)d).InvalidateTracks();
        }

        private void RegisterObservableCollection(INotifyCollectionChanged collection)
        {
            collection.CollectionChanged += OnTracksChanged;
        }

        private void UnregisterObservableCollection(INotifyCollectionChanged collection)
        {
            collection.CollectionChanged -= OnTracksChanged;
        }

        private void OnTracksChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            InvalidateTracks();
        }

        public IEnumerable<Track> Tracks
        {
            get { return (IEnumerable<Track>)GetValue(TracksProperty); }
            set { SetValue(TracksProperty, value); }
        }

        #endregion

        #region Settings

        public static readonly DependencyProperty SettingsProperty = DependencyProperty.Register(
            "Settings", typeof(Settings), typeof(AlphaTab), new PropertyMetadata(Settings.Defaults, OnSettingsChanged));

        private static void OnSettingsChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            ((AlphaTab)d).SettingsChanged?.Invoke((Settings)e.NewValue);
        }

        public Settings Settings
        {
            get { return (Settings)GetValue(SettingsProperty); }
            set { SetValue(SettingsProperty, value); }
        }

        #endregion

        #region BarCursorFill

        public static readonly DependencyProperty BarCursorFillProperty = DependencyProperty.Register(
            "BarCursorFill", typeof(Brush), typeof(AlphaTab), new PropertyMetadata(new SolidColorBrush(Color.FromArgb(64, 255, 242, 0))));

        public Brush BarCursorFill
        {
            get { return (Brush)GetValue(BarCursorFillProperty); }
            set { SetValue(BarCursorFillProperty, value); }
        }


        #endregion
        #region BeatCursorFill

        public static readonly DependencyProperty BeatCursorFillProperty = DependencyProperty.Register(
            "BeatCursorFill", typeof(Brush), typeof(AlphaTab), new PropertyMetadata(new SolidColorBrush(Color.FromArgb(191, 64, 64, 255))));

        public Brush BeatCursorFill
        {
            get { return (Brush)GetValue(BeatCursorFillProperty); }
            set { SetValue(BeatCursorFillProperty, value); }
        }


        #endregion
        #region SelectionFill

        public static readonly DependencyProperty SelectionCursorFillProperty = DependencyProperty.Register(
            "SelectionFill", typeof(Brush), typeof(AlphaTab), new PropertyMetadata(new SolidColorBrush(Color.FromArgb(25, 64, 64, 255))));

        public Brush SelectionFill
        {
            get { return (Brush)GetValue(SelectionCursorFillProperty); }
            set { SetValue(SelectionCursorFillProperty, value); }
        }


        #endregion

        public AlphaTabApi<AlphaTab> Api { get; private set; }

        public AlphaTab()
        {
            SnapsToDevicePixels = true;
            Settings = Settings.Defaults;
            Settings.EnablePlayer = true;
            Settings.EnableCursor = true;
        }

        public override void OnApplyTemplate()
        {
            base.OnApplyTemplate();
            _scrollView = (ScrollViewer)Template.FindName("PART_ScrollView", this);
            Api = new AlphaTabApi<AlphaTab>(new WpfUiFacade(_scrollView), this);
        }

        public void InvalidateTracks()
        {
            if (Api != null)
            {
                RenderTracks();
            }
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
    }
}
#endif