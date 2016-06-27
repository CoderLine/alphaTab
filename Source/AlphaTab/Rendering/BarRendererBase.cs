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
        private readonly LeftToRightLayoutingGlyphGroup _preBeatGlyphs;
        private readonly FastDictionary<int, VoiceContainerGlyph> _voiceContainers;
        private readonly LeftToRightLayoutingGlyphGroup _postBeatGlyphs;

        public Staff Staff { get; set; }
        public float X { get; set; }
        public float Y { get; set; }
        public float Width { get; set; }
        public float Height { get; set; }
        public int Index { get; set; }
        public bool IsEmpty { get; set; }

        public float TopOverflow { get; set; }
        public float BottomOverflow { get; set; }

        public Bar Bar { get; set; }

        /// <summary>
        /// Gets or sets whether this renderer is linked to the next one 
        /// by some glyphs like a vibrato effect
        /// </summary>
        public bool IsLinkedToPrevious { get; set; }

        public BarRendererBase(Bar bar)
        {
            Bar = bar;
            IsEmpty = true;

            _preBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
            _preBeatGlyphs.Renderer = this;
            _voiceContainers = new FastDictionary<int, VoiceContainerGlyph>();
            _postBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
            _postBeatGlyphs.Renderer = this;
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

            Std.Foreach(_voiceContainers.Values, c =>
            {
                c.ScaleToWidth(containerWidth);
            });

            _postBeatGlyphs.X = _preBeatGlyphs.X + _preBeatGlyphs.Width + containerWidth;

            Width = width;
        }

        public RenderingResources Resources
        {
            get
            {
                return Layout.Renderer.RenderingResources;
            }
        }

        public ScoreLayout Layout
        {
            get
            {
                return Staff.StaveGroup.Layout;
            }
        }

        public Settings Settings
        {
            get
            {
                return Layout.Renderer.Settings;
            }
        }

        public float Scale
        {
            get
            {
                return Settings.Scale;
            }
        }

        public bool IsFirstOfLine
        {
            get
            {
                return Index == 0;
            }
        }

        public bool IsLastOfLine
        {
            get
            {
                return Index == Staff.BarRenderers.Count - 1;
            }
        }

        public bool IsLast
        {
            get
            {
                return Bar.Index == Staff.BarRenderers.Count - 1;
            }
        }

        public BarLayoutingInfo LayoutingInfo { get; set; }

        public virtual void RegisterLayoutingInfo(BarLayoutingInfo info)
        {
            LayoutingInfo = info;

            var preSize = _preBeatGlyphs.Width;
            if (info.PreBeatSize < preSize)
            {
                info.PreBeatSize = preSize;
            }

            Std.Foreach(_voiceContainers.Values, c => c.RegisterLayoutingInfo(info));

            var postSize = _postBeatGlyphs.Width;
            if (info.PostBeatSize < postSize)
            {
                info.PostBeatSize = postSize;
            }
        }

        public virtual void ApplyLayoutingInfo()
        {
            // if we need additional space in the preBeat group we simply
            // add a new spacer
            _preBeatGlyphs.Width = LayoutingInfo.PreBeatSize;

            // on beat glyphs we apply the glyph spacing
            var voiceEnd = 0f;
            Std.Foreach(_voiceContainers.Values, c =>
            {
                c.X = _preBeatGlyphs.X + _preBeatGlyphs.Width;
                c.ApplyLayoutingInfo(LayoutingInfo);
                var newEnd = c.X + c.Width;
                if (voiceEnd < newEnd)
                {
                    voiceEnd = newEnd;
                }
            });

            // on the post glyphs we add the spacing before all other glyphs
            _postBeatGlyphs.X = voiceEnd;
            _postBeatGlyphs.Width = LayoutingInfo.PostBeatSize;

            Width = _postBeatGlyphs.X + _postBeatGlyphs.Width;
        }

        public bool IsFinalized { get; private set; }

        public virtual void FinalizeRenderer(ScoreLayout layout)
        {
            IsFinalized = true;
        }

        /// <summary>
        /// Gets the top padding for the main content of the renderer. 
        /// Can be used to specify where i.E. the score lines of the notation start.
        /// </summary>
        /// <returns></returns>
        public virtual float TopPadding
        {
            get
            {
                return 0;
            }
        }

        /// <summary>
        /// Gets the bottom padding for the main content of the renderer. 
        /// Can be used to specify where i.E. the score lines of the notation end.
        /// </summary>
        public virtual float BottomPadding
        {
            get
            {
                return 0;
            }
        }

        public virtual void DoLayout()
        {
            CreatePreBeatGlyphs();
            CreateBeatGlyphs();
            CreatePostBeatGlyphs();

            var postBeatStart = 0f;
            Std.Foreach(_voiceContainers.Values, c =>
            {
                c.X = BeatGlyphsStart;
                c.DoLayout();
                var x = c.X + c.Width;
                if (postBeatStart < x)
                {
                    postBeatStart = x;
                }
            });

            _postBeatGlyphs.X = postBeatStart;

            Width = _postBeatGlyphs.X + _postBeatGlyphs.Width;
        }

        protected void AddPreBeatGlyph(Glyph g)
        {
            IsEmpty = false;
            _preBeatGlyphs.AddGlyph(g);
        }

        protected void AddBeatGlyph(BeatContainerGlyph g)
        {
            GetOrCreateVoiceContainer(g.Beat.Voice).AddGlyph(g);
        }


        protected VoiceContainerGlyph GetOrCreateVoiceContainer(Voice voice)
        {
            VoiceContainerGlyph c;
            if (voice.Index >= _voiceContainers.Count)
            {
                c = new VoiceContainerGlyph(0, 0, voice);
                c.Renderer = this;
                _voiceContainers[voice.Index] = c;
            }
            else
            {
                c = _voiceContainers[voice.Index];
            }
            return c;
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

            Std.Foreach(_voiceContainers.Values, c =>
            {
                canvas.Color = c.Voice.Index == 0
                    ? Resources.MainGlyphColor
                    : Resources.SecondaryGlyphColor;
                c.Paint(cx + X, cy + Y, canvas);
            });

            canvas.Color = Resources.MainGlyphColor;
            _postBeatGlyphs.Paint(cx + X, cy + Y, canvas);
        }

        protected virtual void PaintBackground(float cx, float cy, ICanvas canvas)
        {
            //var c = new Color((byte)Std.Random(255),
            //      (byte)Std.Random(255),
            //      (byte)Std.Random(255),
            //      100);
            //canvas.Color = c;
            //canvas.FillRect(cx + X, cy + Y, Width, Height);
        }

        public virtual void BuildBoundingsLookup(MasterBarBounds masterBarBounds, float cx, float cy)
        {
            var barBounds = new BarBounds();
            barBounds.Bar = Bar;
            barBounds.VisualBounds = new Bounds(cx + X, cy + Y + TopPadding, Width, Height - TopPadding - BottomPadding);
            barBounds.RealBounds = new Bounds(cx + X, cy + Y, Width, Height);
            masterBarBounds.AddBar(barBounds);

            Std.Foreach(_voiceContainers.Values, c =>
            {
                if (!c.Voice.IsEmpty)
                {
                    for (int i = 0, j = c.BeatGlyphs.Count; i < j; i++)
                    {
                        var bc = c.BeatGlyphs[i];

                        var beatBoundings = new BeatBounds();
                        beatBoundings.Beat = bc.Beat;
                        beatBoundings.VisualBounds = new Bounds(cx + X + c.X + bc.X + bc.OnNotes.X,
                            barBounds.VisualBounds.Y, bc.OnNotes.Width, barBounds.VisualBounds.H);
                        beatBoundings.RealBounds = new Bounds(cx + X + c.X + bc.X, barBounds.RealBounds.Y, bc.Width,
                            barBounds.RealBounds.H);
                        barBounds.AddBeat(beatBoundings);
                    }
                }
            });
        }

        protected void AddPostBeatGlyph(Glyph g)
        {
            IsEmpty = false;
            _postBeatGlyphs.AddGlyph(g);
        }

        protected virtual void CreatePreBeatGlyphs()
        {

        }

        protected virtual void CreateBeatGlyphs()
        {

        }

        protected virtual void CreatePostBeatGlyphs()
        {

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
