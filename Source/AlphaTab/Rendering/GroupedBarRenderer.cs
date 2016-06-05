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

using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Staves;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This BarRenderer has 3 different groups which cna store glyphs:
    ///  - PreBeatGlyphs : Those glyphs are aligned left to right before the first glyph which represents a beat
    ///  - BeatGlyphs : Each of those glyphs represents one beat. They are aligned left to right.
    ///  - PostBeatGlyphs : Those glyphs are aligned left to right after the last beat glyph
    /// </summary>
    public abstract class GroupedBarRenderer : BarRendererBase
    {
        public const string KeySizePre = "Pre";
        public const string KeySizePost = "Post";

        private readonly LeftToRightLayoutingGlyphGroup _preBeatGlyphs;
        private readonly FastDictionary<int, VoiceContainerGlyph> _voiceContainers;
        private readonly LeftToRightLayoutingGlyphGroup _postBeatGlyphs;

        public float PreBeatX
        {
            get
            {
                return _preBeatGlyphs.X;
            }
        }

        public float PreBeatWidth
        {
            get
            {
                return _preBeatGlyphs.Width;
            }
        }

        public float VoiceContainerX
        {
            get { return _preBeatGlyphs.X + _preBeatGlyphs.Width; }
        }

        public float VoiceContainerWidth
        {
            get { return PostBeatX - VoiceContainerX; }
        }

        public float PostBeatX
        {
            get
            {
                return _postBeatGlyphs.X;
            }
        }

        public float PostBeatWidth
        {
            get
            {
                return _postBeatGlyphs.Width;
            }
        }

        protected GroupedBarRenderer(Bar bar)
            : base(bar)
        {
            _preBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
            _preBeatGlyphs.Renderer = this;
            _voiceContainers = new FastDictionary<int, VoiceContainerGlyph>();
            _postBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
            _postBeatGlyphs.Renderer = this;
        }

        public override void DoLayout()
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

            UpdateWidth();
        }

        private void UpdateWidth()
        {
            Width = _postBeatGlyphs.X + _postBeatGlyphs.Width;
        }

        public virtual float GetNoteX(Note note, bool onEnd = true)
        {
            return 0;
        }

        public virtual float GetNoteY(Note note)
        {
            return 0;
        }


        public override void RegisterLayoutingInfo(BarLayoutingInfo info)
        {
            var preSize = _preBeatGlyphs.Width;
            if (info.GetSize(KeySizePre) < preSize)
            {
                info.SetSize(KeySizePre, preSize);
            }

            Std.Foreach(_voiceContainers.Values, c => c.RegisterLayoutingInfo(info));

            var postSize = _postBeatGlyphs.Width;
            if (info.GetSize(KeySizePost) < postSize)
            {
                info.SetSize(KeySizePost, postSize);
            }

            if (info.FullWidth < Width)
            {
                info.FullWidth = Width;
            }
        }

        public override void ApplyLayoutingInfo(BarLayoutingInfo info)
        {
            // if we need additional space in the preBeat group we simply
            // add a new spacer
            _preBeatGlyphs.Width = info.GetSize(KeySizePre);

            // on beat glyphs we apply the glyph spacing
            var voiceEnd = 0f;
            Std.Foreach(_voiceContainers.Values, c =>
            {
                c.X = _preBeatGlyphs.X + _preBeatGlyphs.Width;
                c.ApplyLayoutingInfo(info);
                var newEnd = c.X + c.Width;
                if (voiceEnd < newEnd)
                {
                    voiceEnd = newEnd;
                }
            });

            // on the post glyphs we add the spacing before all other glyphs
            _postBeatGlyphs.X = voiceEnd;
            _postBeatGlyphs.Width = info.GetSize(KeySizePost);

            Width = info.FullWidth;
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

        public BeatContainerGlyph GetBeatContainer(Voice voice, int beat)
        {
            return GetOrCreateVoiceContainer(voice).BeatGlyphs[beat];
        }

        public BeatGlyphBase GetPreNotesPosition(Voice voice, int beat)
        {
            return GetBeatContainer(voice, beat).PreNotes;
        }

        public BeatGlyphBase GetOnNotesPosition(Voice voice, int beat)
        {
            return GetBeatContainer(voice, beat).OnNotes;
        }

        public BeatGlyphBase GetPostNotesPosition(Voice voice, int beat)
        {
            return GetBeatContainer(voice, beat).PostNotes;
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

        public override void ScaleToWidth(float width)
        {
            // preBeat and postBeat glyphs do not get resized
            var containerWidth = width - _preBeatGlyphs.Width - _postBeatGlyphs.Width;

            Std.Foreach(_voiceContainers.Values, c =>
            {
                c.ScaleToWidth(containerWidth);
            });

            _postBeatGlyphs.X = _preBeatGlyphs.X + _preBeatGlyphs.Width + containerWidth;

            base.ScaleToWidth(width);
        }

        public override void FinalizeRenderer(ScoreLayout layout)
        {
            Std.Foreach(_voiceContainers.Values, c => c.FinalizeGlyph(layout));
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
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

        public override void BuildBoundingsLookup(BoundingsLookup lookup,
                float visualTop, float visualHeight,
                float realTop, float realHeight, float x)
        {
            base.BuildBoundingsLookup(lookup, visualTop, visualHeight, realTop, realHeight, x);
            var barLookup = lookup.Bars[lookup.Bars.Count - 1];
            var beatStart = BeatGlyphsStart;
            Std.Foreach(_voiceContainers.Values, c =>
            {
                for (int i = 0, j = c.BeatGlyphs.Count; i < j; i++)
                {
                    var bc = c.BeatGlyphs[i];
                    var beatLookup = new BeatBoundings();
                    beatLookup.Beat = bc.Beat;
                    // on beat bounding rectangle
                    beatLookup.VisualBounds = new Bounds(
                    x + Staff.X + X + beatStart + c.X + bc.X + bc.OnNotes.X, visualTop,
                    bc.OnNotes.Width, visualHeight);
                    // real beat boundings
                    beatLookup.Bounds = new Bounds(
                    x + Staff.X + X + beatStart + c.X + bc.X, realTop,
                    bc.Width, realHeight);
                    barLookup.Beats.Add(beatLookup);
                }
            });
        }
    }
}
