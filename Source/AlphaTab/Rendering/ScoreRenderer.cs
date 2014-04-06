using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This is the main wrapper of the rendering engine which 
    /// can render a single track of a score object into a notation sheet.
    /// </summary>
    public class ScoreRenderer
    {
        private string _currentLayoutMode;

        [IntrinsicProperty]
        public ICanvas Canvas { get; set; }
        [IntrinsicProperty]
        public Score Score { get; set; }
        [IntrinsicProperty]
        public List<Track> Tracks { get; set; }

        [IntrinsicProperty]
        public ScoreLayout Layout { get; set; }

        [IntrinsicProperty]
        public RenderingResources RenderingResources { get; set; }
        [IntrinsicProperty]
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
                _currentLayoutMode = Settings.Layout.Mode;
            }
        }

        public void Render(Track track)
        {
            Score = track.Score;
            Tracks = new List<Track>();
            Tracks.Add(track);
            Invalidate();
        }

        public void RenderMultiple(List<Track> tracks)
        {
            if (tracks.Count == 0)
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
            if (Tracks.Count == 0) return;
            if (RenderingResources.Scale != Settings.Scale)
            {
                RenderingResources.Init(Settings.Scale);
                Canvas.LineWidth = Settings.Scale;
            }
            RecreateLayout();
            Canvas.Clear();
            DoLayout();
            PaintScore();
            OnRenderFinished();
        }


        private void DoLayout()
        {
            Layout.DoLayout();
            Canvas.Height = (int)(Layout.Height + (RenderingResources.CopyrightFont.Size * 2));
            Canvas.Width = Layout.Width;
        }

        private void PaintScore()
        {
            PaintBackground();
            Layout.PaintScore();
        }

        public void PaintBackground() 
        {
            // attention, you are not allowed to remove change this notice within any version of this library without permission!
            var msg = "Rendered using alphaTab (http://www.alphaTab.net)";
            Canvas.Color = new Color(62, 62, 62);
            Canvas.Font = RenderingResources.CopyrightFont;
            Canvas.TextAlign = TextAlign.Center;
        
            var x = Canvas.Width / 2;
            Canvas.FillText(msg, x, Canvas.Height - (RenderingResources.CopyrightFont.Size * 2));
        }

        public event Action RenderFinished;
        protected virtual void OnRenderFinished()
        {
            Action handler = RenderFinished;
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