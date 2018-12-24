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
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Utils;
using AlphaTab.Util;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This is the main wrapper of the rendering engine which 
    /// can render a single track of a score object into a notation sheet.
    /// </summary>
    public class ScoreRenderer : IScoreRenderer
    {
        private string _currentLayoutMode;
        private string _currentRenderEngine;
        private Track[] _renderedTracks;

        internal ICanvas Canvas { get; set; }

        internal Score Score { get; private set; }
        internal Track[] Tracks { get; private set; }
        internal ScoreLayout Layout { get; set; }

        internal Settings Settings { get; set; }

        /// <inheritdoc />
        public BoundsLookup BoundsLookup { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="ScoreRenderer"/> class.
        /// </summary>
        /// <param name="settings">The settings to use for rendering.</param>
        public ScoreRenderer(Settings settings)
        {
            Settings = settings;
            RecreateCanvas();
            RecreateLayout();
        }

        /// <inheritdoc />
        public void Destroy()
        {
            Score = null;
            Canvas = null;
            Layout = null;
            Settings = null;
            BoundsLookup = null;
            Tracks = null;
        }

        private bool RecreateCanvas()
        {
            if (_currentRenderEngine != Settings.Engine)
            {
                Canvas = Environment.GetRenderEngineFactory(Settings).CreateCanvas();
                _currentRenderEngine = Settings.Engine;
                return true;
            }
            return false;
        }

        private bool RecreateLayout()
        {
            if (_currentLayoutMode != Settings.Layout.Mode)
            {
                Layout = Environment.GetLayoutEngineFactory(Settings).CreateLayout(this);
                _currentLayoutMode = Settings.Layout.Mode;
                return true;
            }
            return false;
        }

        /// <inheritdoc />
        public void Render(Score score, int[] trackIndexes)
        {
            try
            {
                Score = score;
                FastList<Track> tracks;
                if (trackIndexes == null)
                {
                    tracks = score.Tracks.Clone();
                }
                else
                {
                    tracks = new FastList<Track>();
                    foreach (var track in trackIndexes)
                    {
                        if (track >= 0 && track < score.Tracks.Count)
                        {
                            tracks.Add(score.Tracks[track]);
                        }
                    }
                }
               
                if (tracks.Count == 0 && score.Tracks.Count > 0)
                {
                    tracks.Add(score.Tracks[0]);
                }
                Tracks = tracks.ToArray();
                Invalidate();
            }
            catch (Exception e)
            {
                OnError("render", e);
            }
        }

        /// <summary>
        /// Initiates rendering fof the given tracks.
        /// </summary>
        /// <param name="tracks">The tracks to render.</param>
        public void RenderTracks(Track[] tracks)
        {
            if (tracks.Length == 0)
            {
                Score = null;
            }
            else
            {
                Score = tracks[0].Score;
            }

            Tracks = tracks;
            Invalidate();
        }


        /// <inheritdoc />
        public void UpdateSettings(Settings settings)
        {
            Settings = settings;
        }

        /// <inheritdoc />
        public void Invalidate()
        {
            if (Settings.Width == 0)
            {
                Logger.Warning("Rendering", "AlphaTab skipped rendering because of width=0 (element invisible)");
                return;
            }

            BoundsLookup = new BoundsLookup();
            if (Tracks == null || Tracks.Length == 0) return;

            RecreateCanvas();
            Canvas.LineWidth = Settings.Scale;
            Canvas.Settings = Settings;

            Logger.Info("Rendering", "Rendering " + Tracks.Length + " tracks");
            for (int i = 0; i < Tracks.Length; i++)
            {
                var track = Tracks[i];
                Logger.Info("Rendering", "Track " + i + ": " + track.Name);
            }

            OnPreRender();
            RecreateLayout();
            LayoutAndRender();
            _renderedTracks = Tracks;
            Logger.Info("Rendering", "Rendering finished");
        }

        /// <inheritdoc />
        public void Resize(int width)
        {
            if (RecreateLayout() || RecreateCanvas() || _renderedTracks != Tracks || Tracks == null)
            {
                Logger.Info("Rendering", "Starting full rerendering due to layout or canvas change");
                Invalidate();
            }
            else if (Layout.SupportsResize)
            {
                Logger.Info("Rendering", "Starting optimized rerendering for resize");
                BoundsLookup = new BoundsLookup();
                OnPreRender();
                Settings.Width = width;
                Canvas.Settings = Settings;
                Layout.Resize();
                Layout.RenderAnnotation();
                OnRenderFinished();
                OnPostRender();
            }
            else
            {
                Logger.Warning("Rendering", "Current layout does not support dynamic resizing, nothing was done");
            }
            Logger.Debug("Rendering", "Resize finished");
        }

        private void LayoutAndRender()
        {
            Logger.Info("Rendering", "Rendering at scale " + Settings.Scale + " with layout " + Layout.Name);
            Layout.LayoutAndRender();
            Layout.RenderAnnotation();
            OnRenderFinished();
            OnPostRender();
        }

        /// <inheritdoc />
        public event Action PreRender;
        private void OnPreRender()
        {
            var handler = PreRender;
            if (handler != null) handler();
        }

        /// <inheritdoc />
        public event Action<RenderFinishedEventArgs> PartialRenderFinished;

        internal void OnPartialRenderFinished(RenderFinishedEventArgs e)
        {
            Action<RenderFinishedEventArgs> handler = PartialRenderFinished;
            if (handler != null) handler(e);
        }

        /// <inheritdoc />
        public event Action<RenderFinishedEventArgs> RenderFinished;
        private void OnRenderFinished()
        {
            var result = Canvas.OnRenderFinished();
            Action<RenderFinishedEventArgs> handler = RenderFinished;
            if (handler != null) handler(new RenderFinishedEventArgs
            {
                RenderResult = result,
                TotalHeight = Layout.Height,
                TotalWidth = Layout.Width
            });
        }

        /// <inheritdoc />
        public event Action<string, Exception> Error;
        private void OnError(string type, Exception details)
        {
            var handler = Error;
            if (handler != null) handler(type, details);
        }

        /// <inheritdoc />
        public event Action PostRenderFinished;
        private void OnPostRender()
        {
            Action handler = PostRenderFinished;
            if (handler != null) handler();
        }

    }
}