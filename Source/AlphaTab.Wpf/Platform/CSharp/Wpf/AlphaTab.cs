/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Drawing;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Util;

namespace AlphaTab.Platform.CSharp.Wpf
{
    public class AlphaTab : Control
    {
        static AlphaTab()
        {
            DefaultStyleKeyProperty.OverrideMetadata(typeof(AlphaTab), new FrameworkPropertyMetadata(typeof(AlphaTab)));
        }

        private bool _initialRenderCompleted;
        private bool _redrawPending;
        private int _isRendering; // interlocked bool
        private ScrollViewer _scrollView;
        private readonly ObservableCollection<ImageSource> _images;

        #region Track

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

            ((AlphaTab)d).InvalidateTracks(true);
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
            InvalidateTracks(true);
        }

        public IEnumerable<Track> Tracks
        {
            get { return (IEnumerable<Track>)GetValue(TracksProperty); }
            set { SetValue(TracksProperty, value); }
        }

        #endregion

        #region Scale

        public static readonly DependencyProperty ScaleProperty = DependencyProperty.Register("Scale", typeof(float), typeof(AlphaTab), new PropertyMetadata(1f, OnScaleChanged));
        private static void OnScaleChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            ((AlphaTab)d).InvalidateTracks(true);
        }

        public float Scale
        {
            get { return (float)GetValue(ScaleProperty); }
            set { SetValue(ScaleProperty, value); }
        }

        #endregion

        #region ScoreWidth

        public static readonly DependencyProperty ScoreWidthProperty = DependencyProperty.Register("ScoreWidth", typeof(int), typeof(AlphaTab), new PropertyMetadata(-1, OnScoreWidthChanged));

        private static void OnScoreWidthChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            ((AlphaTab)d).InvalidateTracks(true);
        }

        public int ScoreWidth
        {
            get { return (int)GetValue(ScoreWidthProperty); }
            set { SetValue(ScoreWidthProperty, value); }
        }

        #endregion

        #region ScoreAutoSize

        public bool ScoreAutoSize
        {
            get { return ScoreWidth < 0; }
        }

        #endregion

        #region LayoutMode

        public static readonly DependencyProperty LayoutModeProperty = DependencyProperty.Register("LayoutMode", typeof(string), typeof(AlphaTab), new PropertyMetadata("page", OnLayoutModeChanged));

        private static void OnLayoutModeChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            ((AlphaTab)d).InvalidateTracks(true);
        }

        public string LayoutMode
        {
            get { return (string)GetValue(LayoutModeProperty); }
            set { SetValue(LayoutModeProperty, value); }
        }

        #endregion

        #region StretchForce

        public static readonly DependencyProperty StretchForceProperty = DependencyProperty.Register("StretchForce", typeof(float), typeof(AlphaTab), new PropertyMetadata(1f, OnStretchForceChanged));

        private static void OnStretchForceChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            ((AlphaTab)d).InvalidateTracks(true);
        }

        public float StretchForce
        {
            get { return (float)GetValue(StretchForceProperty); }
            set { SetValue(StretchForceProperty, value); }
        }

        #endregion

        #region StavesMode

        public static readonly DependencyProperty StavesModeProperty = DependencyProperty.Register("StavesMode", typeof(string), typeof(AlphaTab), new PropertyMetadata("score-tab", OnStavesModeChanged));

        private static void OnStavesModeChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            ((AlphaTab)d).InvalidateTracks(true);
        }

        public string StavesMode
        {
            get { return (string)GetValue(StavesModeProperty); }
            set { SetValue(StavesModeProperty, value); }
        }

        #endregion

        #region RenderPartials

        private static readonly DependencyPropertyKey RenderPartialsPropertyKey = DependencyProperty.RegisterReadOnly("RenderPartials", typeof(IEnumerable<ImageSource>), typeof(AlphaTab), new PropertyMetadata(default(IEnumerable<ImageSource>)));
        public static readonly DependencyProperty RenderPartialsProperty = RenderPartialsPropertyKey.DependencyProperty;

        public IEnumerable<ImageSource> RenderPartials
        {
            get { return (IEnumerable<ImageSource>)GetValue(RenderPartialsProperty); }
            private set { SetValue(RenderPartialsPropertyKey, value); }
        }

        #endregion

        #region ActualScoreWidth

        private static readonly DependencyPropertyKey ActualScoreWidthPropertyKey = DependencyProperty.RegisterReadOnly("ActualScoreWidth", typeof(float), typeof(AlphaTab), new PropertyMetadata(default(float)));
        public static readonly DependencyProperty ActualScoreWidthProperty = ActualScoreWidthPropertyKey.DependencyProperty;

        public float ActualScoreWidth
        {
            get { return (float)GetValue(ActualScoreWidthProperty); }
            private set { SetValue(ActualScoreWidthPropertyKey, value); }
        }

        #endregion

        #region ActualScoreHeight

        private static readonly DependencyPropertyKey ActualScoreHeightPropertyKey = DependencyProperty.RegisterReadOnly("ActualScoreHeight", typeof(float), typeof(AlphaTab), new PropertyMetadata(default(float)));
        public static readonly DependencyProperty ActualScoreHeightProperty = ActualScoreWidthPropertyKey.DependencyProperty;

        public float ActualScoreHeight
        {
            get { return (float)GetValue(ActualScoreHeightProperty); }
            private set { SetValue(ActualScoreHeightPropertyKey, value); }
        }

        #endregion

        #region RenderEngine

        public static readonly DependencyProperty RenderEngineProperty = DependencyProperty.Register("RenderEngine", typeof(string), typeof(AlphaTab), new PropertyMetadata("gdi", OnRenderEngineChanged));

        private static void OnRenderEngineChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            ((AlphaTab)d).InvalidateTracks(true);
        }

        public string RenderEngine
        {
            get { return (string)GetValue(RenderEngineProperty); }
            set { SetValue(RenderEngineProperty, value); }
        }


        #endregion

        public ScoreRenderer Renderer { get; private set; }

        public AlphaTab()
        {
            SnapsToDevicePixels = true;

            _images = new ObservableCollection<ImageSource>();
            RenderPartials = _images;

            var settings = Settings.Defaults;
            settings.Engine = "gdi";

            Renderer = new ScoreRenderer(settings);
            Renderer.PreRender += result =>
            {
                Dispatcher.BeginInvoke(new Action(() =>
                {
                    _images.Clear();
                    GC.Collect();
                    AddPartialResult(result);
                }));
            };
            Renderer.PartialRenderFinished += result =>
            {
                Dispatcher.BeginInvoke(new Action(() =>
                {
                    AddPartialResult(result);
                }));
            };
            Renderer.RenderFinished += result =>
            {
                Dispatcher.BeginInvoke(new Action(() =>
                {
                    _initialRenderCompleted = true;
                    _isRendering = 0;
                    AddPartialResult(result);
                    OnRenderFinished();
                    if (_redrawPending)
                    {
                        ResizeTracks(RenderWidth);
                    }
                }));
            };
        }

        public override void OnApplyTemplate()
        {
            base.OnApplyTemplate();
            _scrollView = (ScrollViewer)Template.FindName("PART_ScrollView", this);
            _scrollView.ScrollChanged += OnScrollChanged;
            InvalidateTracks(true);
        }

        public void InvalidateTracks(bool force)
        {
            var trackArray = Tracks?.ToArray();
            if (trackArray == null || trackArray.Length == 0) return;

            var width = RenderWidth;
            if (width > 0)
            {
                if (trackArray == Renderer.Tracks && !force)
                {
                    return;
                }

                var settings = Renderer.Settings;
                settings.Width = width;
                settings.Engine = RenderEngine;
                settings.Scale = Scale;
                settings.Layout.Mode = LayoutMode;
                settings.StretchForce = StretchForce;
                settings.Staves.Id = StavesMode;
                Renderer.UpdateSettings(settings);
                ModelUtils.ApplyPitchOffsets(settings, trackArray[0].Score);

                _initialRenderCompleted = false;
                _isRendering = 1;

                Task.Factory.StartNew(() =>
                {
                    Renderer.Render(trackArray[0].Score, trackArray.Select(t => t.Index).ToArray());
                });
            }
            else
            {
                _initialRenderCompleted = false;
                _redrawPending = true;
                _isRendering = 0;
            }
        }

        private int RenderWidth
        {
            get
            {
                return (int)(ScoreAutoSize ? _scrollView.ViewportWidth : ScoreWidth);
            }
        }

        private void OnScrollChanged(object sender, ScrollChangedEventArgs e)
        {
            if (Math.Abs(e.ViewportWidthChange) > 0 && ScoreAutoSize)
            {
                ResizeTracks(e.ViewportWidth);
            }
        }

        private void ResizeTracks(double width)
        {
            int newWidth = (int)width;
            if (Interlocked.Exchange(ref _isRendering, 1) == 1)
            {
                _redrawPending = true;
            }
            else if (width > 0)
            {
                _redrawPending = false;
                if (!_initialRenderCompleted)
                {
                    InvalidateTracks(true);
                }
                else if (newWidth != Renderer.Settings.Width)
                {
                    Task.Factory.StartNew(() =>
                    {
                        Renderer.Resize(newWidth);
                    });
                }
                else
                {
                    _isRendering = 0;
                }
            }
        }

        private void AddPartialResult(RenderFinishedEventArgs result)
        {
            ActualScoreWidth = result.TotalWidth;
            ActualScoreHeight = result.TotalHeight;
            if (result.RenderResult != null)
            {
                var bitmap = result.RenderResult as Bitmap;
                if (bitmap != null)
                {
                    using (bitmap)
                    {
                        _images.Add(GdiImageSource.Create(bitmap));
                    }
                }
                else
                {
                    using (result.RenderResult as IDisposable)
                    {
                        _images.Add(SkImageSource.Create(result.RenderResult));
                    }
                }
            }
        }

        #region RenderFinished

        public static readonly RoutedEvent RenderFinishedEvent = EventManager.RegisterRoutedEvent("RenderFinished", RoutingStrategy.Bubble, typeof(RoutedEventHandler), typeof(AlphaTab));
        public event RoutedEventHandler RenderFinished
        {
            add { AddHandler(RenderFinishedEvent, value); }
            remove { RemoveHandler(RenderFinishedEvent, value); }
        }

        protected virtual void OnRenderFinished()
        {
            RoutedEventArgs newEventArgs = new RoutedEventArgs(RenderFinishedEvent);
            RaiseEvent(newEventArgs);
        }

        #endregion

    }
}