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
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;
using AlphaTab.Platform.Svg;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This is the main wrapper of the rendering engine which 
    /// can render a single track of a score object into a notation sheet.
    /// </summary>
    public class ScoreRenderer : IScoreRenderer
    {
        private string _currentLayoutMode;

        public ICanvas Canvas { get; set; }
        public Score Score { get; set; }
        public Track[] Tracks { get; set; }

        public ScoreLayout Layout { get; set; }

        public RenderingResources RenderingResources { get; set; }
        public Settings Settings { get; set; }

        public ScoreRenderer(Settings settings, object param)
        {
            Settings = settings;
            RenderingResources = new RenderingResources(1);
            if (settings.Engine == null || !Environment.RenderEngines.ContainsKey(settings.Engine))
            {
                Canvas = Environment.RenderEngines["default"](param);
            }
            else
            {
                Canvas = Environment.RenderEngines[settings.Engine](param);
            }
            RecreateLayout();
        }

        private void RecreateLayout()
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
                Layout.PartialRenderFinished += OnPartialRenderFinished;
                _currentLayoutMode = Settings.Layout.Mode;
            }
        }

        public void Render(Track track)
        {
            Score = track.Score;
            Tracks = new []{track};
            Invalidate();
        }

        public void RenderMultiple(Track[] tracks)
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


        public void Invalidate()
        {
            if (Tracks.Length == 0) return;
            if (RenderingResources.Scale != Settings.Scale)
            {
                RenderingResources.Init(Settings.Scale);
                Canvas.LineWidth = Settings.Scale;
            }
            Canvas.Resources = RenderingResources;
            OnPreRender();
            RecreateLayout();
            LayoutAndRender();
        }

        private void LayoutAndRender()
        {
            Layout.DoLayoutAndRender();
            Layout.RenderAnnotation();
            OnRenderFinished(new RenderFinishedEventArgs
            {
                TotalHeight = Layout.Height,
                TotalWidth = Layout.Width
            });
            OnPostRenderFinished();
        }

        public event Action PreRender;
        protected virtual void OnPreRender()
        {
            Action handler = PreRender;
            if (handler != null) handler();
        }

        public event Action<RenderFinishedEventArgs> PartialRenderFinished;
        protected virtual void OnPartialRenderFinished(RenderFinishedEventArgs e)
        {
            Action<RenderFinishedEventArgs> handler = PartialRenderFinished;
            if (handler != null) handler(e);
        }


        public event Action<RenderFinishedEventArgs> RenderFinished;
        protected virtual void OnRenderFinished(RenderFinishedEventArgs e)
        {
            Action<RenderFinishedEventArgs> handler = RenderFinished;
            if (handler != null) handler(e);
        }

        public event Action PostRenderFinished;
        protected virtual void OnPostRenderFinished()
        {
            Action handler = PostRenderFinished;
            if (handler != null) handler();
        }

        public BoundingsLookup BuildBoundingsLookup()
        {
            var lookup = new BoundingsLookup();
            Layout.BuildBoundingsLookup(lookup);
            return lookup;
        }
    }
}