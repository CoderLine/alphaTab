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
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Staves;
using AlphaTab.Rendering.Utils;
using Staff = AlphaTab.Rendering.Staves.Staff;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This is the base public class for creating blocks which can render bars.
    /// </summary>
    public class BarRendererBase
    {
        private LeftToRightLayoutingGlyphGroup _preBeatGlyphs;
        private FastDictionary<int, VoiceContainerGlyph> _voiceContainers;
        private LeftToRightLayoutingGlyphGroup _postBeatGlyphs;

        public BarRendererBase NextRenderer
        {
            get
            {
                if (Bar.NextBar == null)
                {
                    return null;
                }
                return ScoreRenderer.Layout.GetRendererForBar(Staff.StaveId, Bar.NextBar);
            }
        }

        public BarRendererBase PreviousRenderer
        {
            get
            {
                if (Bar.PreviousBar == null)
                {
                    return null;
                }
                return ScoreRenderer.Layout.GetRendererForBar(Staff.StaveId, Bar.PreviousBar);
            }
        }

        public Staff Staff { get; set; }
        public float X { get; set; }
        public float Y { get; set; }
        public float Width { get; set; }
        public float Height { get; set; }
        public int Index { get; set; }

        public float TopOverflow { get; set; }
        public float BottomOverflow { get; set; }

        public BarHelpers Helpers { get; set; }
        public Bar Bar { get; set; }

        /// <summary>
        /// Gets or sets whether this renderer is linked to the next one 
        /// by some glyphs like a vibrato effect
        /// </summary>
        public bool IsLinkedToPrevious { get; set; }

        public BarRendererBase(ScoreRenderer renderer, Bar bar)
        {
            Bar = bar;
            ScoreRenderer = renderer;
            Helpers = new BarHelpers(bar);
        }

        public void RegisterOverflowTop(float topOverflow)
        {
            if (topOverflow > TopOverflow)
                TopOverflow = topOverflow;
        }
        public void RegisterOverflowBottom(float bottomOverflow)
        {
            if (bottomOverflow > BottomOverflow)
                BottomOverflow = bottomOverflow;
        }

        public virtual void ScaleToWidth(float width)
        {
            // preBeat and postBeat glyphs do not get resized
            var containerWidth = width - _preBeatGlyphs.Width - _postBeatGlyphs.Width;

            foreach (var voice in _voiceContainers)
            {
                var c = _voiceContainers[voice];
                c.ScaleToWidth(containerWidth);
            }

            _postBeatGlyphs.X = _preBeatGlyphs.X + _preBeatGlyphs.Width + containerWidth;

            Width = width;
        }

        public RenderingResources Resources
        {
            get
            {
                return ScoreRenderer.RenderingResources;
            }
        }

        public ScoreRenderer ScoreRenderer
        {
            get;
            private set;
        }

        public Settings Settings
        {
            get
            {
                return ScoreRenderer.Settings;
            }
        }

        public float Scale
        {
            get
            {
                return Settings.Scale;
            }
        }

        private bool _wasFirstOfLine;
        public bool IsFirstOfLine
        {
            get
            {
                return Index == 0;
            }
        }

        public bool IsLast
        {
            get
            {
                return Staff.StaveGroup.IsLast && Index == Staff.BarRenderers.Count - 1;
            }
        }

        public BarLayoutingInfo LayoutingInfo { get; set; }

        public virtual void RegisterLayoutingInfo()
        {
            var info = LayoutingInfo;

            var preSize = _preBeatGlyphs.Width;
            if (info.PreBeatSize < preSize)
            {
                info.PreBeatSize = preSize;
            }

            foreach (var voice in _voiceContainers)
            {
                var c = _voiceContainers[voice];
                c.RegisterLayoutingInfo(info);
            }

            var postSize = _postBeatGlyphs.Width;
            if (info.PostBeatSize < postSize)
            {
                info.PostBeatSize = postSize;
            }
        }

        private int _appliedLayoutingInfo;
        public virtual bool ApplyLayoutingInfo()
        {
            if (_appliedLayoutingInfo >= LayoutingInfo.Version)
            {
                return false;
            }
            _appliedLayoutingInfo = LayoutingInfo.Version;
            // if we need additional space in the preBeat group we simply
            // add a new spacer
            _preBeatGlyphs.Width = LayoutingInfo.PreBeatSize;

            // on beat glyphs we apply the glyph spacing
            var voiceEnd = _preBeatGlyphs.X + _preBeatGlyphs.Width;
            foreach (var voice in _voiceContainers)
            {
                var c = _voiceContainers[voice];
                c.X = _preBeatGlyphs.X + _preBeatGlyphs.Width;
                c.ApplyLayoutingInfo(LayoutingInfo);
                var newEnd = c.X + c.Width;
                if (voiceEnd < newEnd)
                {
                    voiceEnd = newEnd;
                }
            }

            // on the post glyphs we add the spacing before all other glyphs
            _postBeatGlyphs.X = voiceEnd;
            _postBeatGlyphs.Width = LayoutingInfo.PostBeatSize;

            Width = _postBeatGlyphs.X + _postBeatGlyphs.Width;
            return true;
        }

        public bool IsFinalized { get; private set; }

        public virtual void FinalizeRenderer()
        {
            IsFinalized = true;
        }

        /// <summary>
        /// Gets the top padding for the main content of the renderer. 
        /// Can be used to specify where i.E. the score lines of the notation start.
        /// </summary>
        /// <returns></returns>
        public float TopPadding
        {
            get; set;
        }

        /// <summary>
        /// Gets the bottom padding for the main content of the renderer. 
        /// Can be used to specify where i.E. the score lines of the notation end.
        /// </summary>
        public float BottomPadding
        {
            get; set;
        }

        public virtual void DoLayout()
        {
            _preBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
            _preBeatGlyphs.Renderer = this;
            _voiceContainers = new FastDictionary<int, VoiceContainerGlyph>();
            _postBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
            _postBeatGlyphs.Renderer = this;

            for (int i = 0; i < Bar.Voices.Count; i++)
            {
                var voice = Bar.Voices[i];
                if (HasVoiceContainer(voice))
                {
                    var c = new VoiceContainerGlyph(0, 0, voice);
                    c.Renderer = this;
                    _voiceContainers[Bar.Voices[i].Index] = c;
                }
            }

            CreatePreBeatGlyphs();
            CreateBeatGlyphs();
            CreatePostBeatGlyphs();

            UpdateSizes();
        }

        protected virtual bool HasVoiceContainer(Voice voice)
        {
            return !voice.IsEmpty || voice.Index == 0;
        }

        protected virtual void UpdateSizes()
        {
            Staff.RegisterStaffTop(TopPadding);
            Staff.RegisterStaffBottom(Height - BottomPadding);

            var voiceContainers = _voiceContainers;
            var beatGlyphsStart = BeatGlyphsStart;
            var postBeatStart = beatGlyphsStart;
            foreach (var voice in voiceContainers)
            {
                var c = voiceContainers[voice];
                c.X = beatGlyphsStart;
                c.DoLayout();
                var x = c.X + c.Width;
                if (postBeatStart < x)
                {
                    postBeatStart = x;
                }
            }

            _postBeatGlyphs.X = postBeatStart;

            Width = _postBeatGlyphs.X + _postBeatGlyphs.Width;
        }

        protected void AddPreBeatGlyph(Glyph g)
        {
            _preBeatGlyphs.AddGlyph(g);
        }

        protected void AddBeatGlyph(BeatContainerGlyph g)
        {
            g.Renderer = this;
            g.PreNotes.Renderer = this;
            g.OnNotes.Renderer = this;
            g.OnNotes.BeamingHelper = Helpers.BeamHelperLookup[g.Beat.Voice.Index][g.Beat.Index];
            GetOrCreateVoiceContainer(g.Beat.Voice).AddGlyph(g);
        }

        protected VoiceContainerGlyph GetOrCreateVoiceContainer(Voice voice)
        {
            return _voiceContainers[voice.Index];
        }

        public BeatContainerGlyph GetBeatContainer(Beat beat)
        {
            return GetOrCreateVoiceContainer(beat.Voice).BeatGlyphs[beat.Index];
        }

        public BeatGlyphBase GetPreNotesGlyphForBeat(Beat beat)
        {
            return GetBeatContainer(beat).PreNotes;
        }

        public BeatGlyphBase GetOnNotesGlyphForBeat(Beat beat)
        {
            return GetBeatContainer(beat).OnNotes;
        }

        public virtual void Paint(float cx, float cy, ICanvas canvas)
        {
            PaintBackground(cx, cy, canvas);

            canvas.Color = Resources.MainGlyphColor;

            _preBeatGlyphs.Paint(cx + X, cy + Y, canvas);

            foreach (var voice in _voiceContainers)
            {
                var c = _voiceContainers[voice];
                canvas.Color = c.Voice.Index == 0
                   ? Resources.MainGlyphColor
                   : Resources.SecondaryGlyphColor;
                c.Paint(cx + X, cy + Y, canvas);
            }


            canvas.Color = Resources.MainGlyphColor;
            _postBeatGlyphs.Paint(cx + X, cy + Y, canvas);
        }

        protected virtual void PaintBackground(float cx, float cy, ICanvas canvas)
        {
            //var c = new Color((byte)Platform.Random(255),
            //      (byte)Platform.Random(255),
            //      (byte)Platform.Random(255),
            //      100);
            //canvas.Color = c;
            //canvas.FillRect(cx + X, cy + Y, Width, Height);
        }

        public virtual void BuildBoundingsLookup(MasterBarBounds masterBarBounds, float cx, float cy)
        {
            var barBounds = new BarBounds();
            barBounds.Bar = Bar;
            barBounds.VisualBounds = new Bounds
            {
                X = cx + X,
                Y = cy + Y + TopPadding,
                W = Width,
                H = Height - TopPadding - BottomPadding
            };
            barBounds.RealBounds = new Bounds
            {
                X = cx + X,
                Y = cy + Y,
                W = Width,
                H = Height
            };
            masterBarBounds.AddBar(barBounds);

            foreach (var voice in _voiceContainers)
            {
                var c = _voiceContainers[voice];
                if (!c.Voice.IsEmpty || (Bar.IsEmpty && voice == 0))
                {
                    for (int i = 0, j = c.BeatGlyphs.Count; i < j; i++)
                    {
                        var bc = c.BeatGlyphs[i];

                        var beatBoundings = new BeatBounds();
                        beatBoundings.Beat = bc.Beat;
                        beatBoundings.VisualBounds = new Bounds
                        {
                            X = cx + X + c.X + bc.X + bc.OnNotes.X,
                            Y = barBounds.VisualBounds.Y,
                            W = bc.OnNotes.Width,
                            H = barBounds.VisualBounds.H
                        };
                        beatBoundings.RealBounds = new Bounds
                        {
                            X = cx + X + c.X + bc.X,
                            Y = barBounds.RealBounds.Y,
                            W = bc.Width,
                            H = barBounds.RealBounds.H
                        };
                        barBounds.AddBeat(beatBoundings);
                    }
                }
            }
        }

        protected void AddPostBeatGlyph(Glyph g)
        {
            _postBeatGlyphs.AddGlyph(g);
        }

        protected virtual void CreatePreBeatGlyphs()
        {
            _wasFirstOfLine = IsFirstOfLine;
        }

        protected virtual void CreateBeatGlyphs()
        {

        }

        protected virtual void CreatePostBeatGlyphs()
        {
            AddPostBeatGlyph(new SpacingGlyph(0, 0, 5 * Scale));
        }

        public float BeatGlyphsStart
        {
            get
            {
                return _preBeatGlyphs.X + _preBeatGlyphs.Width;
            }
        }

        public virtual float GetNoteX(Note note, bool onEnd = true)
        {
            return 0;
        }

        public float GetBeatX(Beat beat, BeatXPosition requestedPosition = BeatXPosition.PreNotes)
        {
            var container = GetBeatContainer(beat);
            if (container != null)
            {
                switch (requestedPosition)
                {
                    case BeatXPosition.PreNotes:
                        return container.VoiceContainer.X + container.X + container.PreNotes.X;
                    case BeatXPosition.OnNotes:
                        return container.VoiceContainer.X + container.X + container.OnNotes.X;
                    case BeatXPosition.PostNotes:
                        return container.VoiceContainer.X + container.X + container.OnNotes.X + container.OnNotes.Width;
                    case BeatXPosition.EndBeat:
                        return container.VoiceContainer.X + container.X + container.Width;
                }
            }
            return 0;
        }

        public virtual float GetNoteY(Note note)
        {
            return 0;
        }

        public void ReLayout()
        {
            // there are some glyphs which are shown only for renderers at the line start, so we simply recreate them
            // but we only need to recreate them for the renderers that were the first of the line or are now the first of the line
            if ((_wasFirstOfLine && !IsFirstOfLine) || (!_wasFirstOfLine && IsFirstOfLine))
            {
                _preBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
                _preBeatGlyphs.Renderer = this;
                CreatePreBeatGlyphs();
            }

            UpdateSizes();
            RegisterLayoutingInfo();
        }
    }

    /// <summary>
    /// Lists the different position modes for <see cref="BarRendererBase.GetBeatX"/>
    /// </summary>
    public enum BeatXPosition
    {
        /// <summary>
        /// Gets the pre-notes position which is located before the accidentals
        /// </summary>
        PreNotes,

        /// <summary>
        /// Gets the on-notes position which is located after the accidentals but before the note heads. 
        /// </summary>
        OnNotes,

        /// <summary>
        /// Get the post-notes position which is located at after the note heads. 
        /// </summary>
        PostNotes,

        /// <summary>
        /// Get the end-beat position which is located at the end of the beat. This position is almost
        /// equal to the pre-notes position of the next beat.
        /// </summary>
        EndBeat
    }
}
