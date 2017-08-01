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

        public ICanvas Canvas { get; set; }

        public Score Score { get; private set; }
        public Track[] Tracks { get; private set; }
        public ScoreLayout Layout { get; set; }

        public RenderingResources RenderingResources { get; set; }
        public Settings Settings { get; set; }

        public BoundsLookup BoundsLookup { get; set; }

        public ScoreRenderer(Settings settings)
        {
            Settings = settings;
            RenderingResources = new RenderingResources(1);
            RecreateCanvas();
            RecreateLayout();
        }

        public void Destroy()
        {
            Score = null;
            Canvas = null;
            Layout = null;
            RenderingResources = null;
            Settings = null;
            BoundsLookup = null;
            Tracks = null;
        }

        private bool RecreateCanvas()
        {
            if (_currentRenderEngine != Settings.Engine)
            {
                if (Settings.Engine == null || !Environment.RenderEngines.ContainsKey(Settings.Engine))
                {
                    Canvas = Environment.RenderEngines["default"]();
                }
                else
                {
                    Canvas = Environment.RenderEngines[Settings.Engine]();
                }
                _currentRenderEngine = Settings.Engine;
                return true;
            }
            return false;
        }

        private bool RecreateLayout()
        {
            if (_currentLayoutMode != Settings.Layout.Mode)
            {
                if (Settings.Layout == null || !Environment.LayoutEngines.ContainsKey(Settings.Layout.Mode))
                {
                    Layout = Environment.LayoutEngines["default"](this);
                }
                else
                {
                    Layout = Environment.LayoutEngines[Settings.Layout.Mode](this);
                }
                _currentLayoutMode = Settings.Layout.Mode;
                return true;
            }
            return false;
        }

        public void Render(Score score, int[] trackIndexes)
        {
            try
            {
                Score = score;
                var tracks = new FastList<Track>();
                foreach (var track in trackIndexes)
                {
                    if (track >= 0 && track < score.Tracks.Count)
                    {
                        tracks.Add(score.Tracks[track]);
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


        public void UpdateSettings(Settings settings)
        {
            Settings = settings;
        }

        public void Invalidate()
        {
            if (Settings.Width == 0)
            {
                Logger.Warning("Rendering", "AlphaTab skipped rendering because of width=0 (element invisible)");
                return;
            }

            BoundsLookup = new BoundsLookup();
            if (Tracks.Length == 0) return;

            RecreateCanvas();
            if (RenderingResources.Scale != Settings.Scale)
            {
                RenderingResources.Init(Settings.Scale);
                Canvas.LineWidth = Settings.Scale;
            }
            Canvas.Resources = RenderingResources;

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
                Layout.Resize();
                Layout.RenderAnnotation();
                OnRenderFinished();
                OnPostRender();
            }
            else
            {
                Logger.Warning("Rendering", "Current layout does not support dynamic resizing, nothing was done");
            }
            Logger.Info("Rendering", "Resize finished");
        }

        private void LayoutAndRender()
        {
            Logger.Info("Rendering", "Rendering at scale " + Settings.Scale + " with layout " + Layout.Name);
            Layout.LayoutAndRender();
            Layout.RenderAnnotation();
            OnRenderFinished();
            OnPostRender();
        }

        public event Action<RenderFinishedEventArgs> PreRender;
        protected virtual void OnPreRender()
        {
            var result = Canvas.OnPreRender();
            var handler = PreRender;
            var args = new RenderFinishedEventArgs();
            args.TotalWidth = 0;
            args.TotalHeight = 0;
            args.Width = 0;
            args.Height = 0;
            args.RenderResult = result;

            if (handler != null) handler(args);
        }

        public event Action<RenderFinishedEventArgs> PartialRenderFinished;

        public virtual void OnPartialRenderFinished(RenderFinishedEventArgs e)
        {
            Action<RenderFinishedEventArgs> handler = PartialRenderFinished;
            if (handler != null) handler(e);
        }

        public event Action<RenderFinishedEventArgs> RenderFinished;
        protected virtual void OnRenderFinished()
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

        public event Action<string, Exception> Error;
        protected virtual void OnError(string type, Exception details)
        {
            var handler = Error;
            if (handler != null) handler(type, details);
        }

        public event Action PostRenderFinished;
        protected virtual void OnPostRender()
        {
            Action handler = PostRenderFinished;
            if (handler != null) handler();
        }

    }
}