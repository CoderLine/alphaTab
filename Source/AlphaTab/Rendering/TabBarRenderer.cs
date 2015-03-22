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
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This BarRenderer renders a bar using guitar tablature notation
    /// </summary>
    public class TabBarRenderer : GroupedBarRenderer
    {
        public const float LineSpacing = 10;

        private BarHelpers _helpers;

        public TabBarRenderer(Bar bar)
            : base(bar)
        {
        }

        private float LineOffset
        {
            get
            {
                return ((LineSpacing + 1) * Scale);
            }
        }

        public override float GetNoteX(Note note, bool onEnd = true)
        {
            var beat = (TabBeatGlyph)GetOnNotesPosition(note.Beat.Voice.Index, note.Beat.Index);
            if (beat != null)
            {
                return beat.Container.X + beat.X + beat.NoteNumbers.GetNoteX(note, onEnd);
            }
            return PostBeatGlyphsStart;
        }

        public float GetBeatX(Beat beat)
        {
            var bg = (TabBeatGlyph)GetPreNotesPosition(beat.Voice.Index, beat.Index);
            if (bg != null)
            {
                return bg.Container.X + bg.X;
            }
            return 0;
        }

        public override float GetNoteY(Note note)
        {
            var beat = (TabBeatGlyph)GetOnNotesPosition(note.Beat.Voice.Index, note.Beat.Index);
            if (beat != null)
            {
                return beat.NoteNumbers.GetNoteY(note);
            }
            return 0;
        }

        public override void DoLayout()
        {
            _helpers = Stave.StaveGroup.Helpers.Helpers[Bar.Track.Index][Bar.Index];
            base.DoLayout();
            Height = LineOffset * (Bar.Track.Tuning.Length - 1) + (NumberOverflow * 2);
            if (Index == 0)
            {
                Stave.RegisterStaveTop(NumberOverflow);
                Stave.RegisterStaveBottom(Height - NumberOverflow);
            }
        }

        protected override void CreatePreBeatGlyphs()
        {
            if (Bar.MasterBar.IsRepeatStart)
            {
                AddPreBeatGlyph(new RepeatOpenGlyph(0, 0, 1.5f, 3));
            }

            // Clef
            if (IsFirstOfLine)
            {
                AddPreBeatGlyph(new TabClefGlyph(0, 0));
            }

            AddPreBeatGlyph(new BarNumberGlyph(0, GetTabY(-1, -3), Bar.Index + 1, !Stave.IsFirstInAccolade));

            if (Bar.IsEmpty)
            {
                AddPreBeatGlyph(new SpacingGlyph(0, 0, 30 * Scale, false));
            }
        }

        protected override void CreateBeatGlyphs()
        {
#if MULTIVOICE_SUPPORT
            foreach (Voice v in Bar.Voices)
            {
                CreateVoiceGlyphs(v);
            }
#else
            CreateVoiceGlyphs(Bar.Voices[0]);
#endif
        }

        private void CreateVoiceGlyphs(Voice v)
        {
            for (int i = 0, j = v.Beats.Count; i < j; i++)
            {
                var b = v.Beats[i];
                var container = new TabBeatContainerGlyph(b);
                container.PreNotes = new TabBeatPreNotesGlyph();
                container.OnNotes = new TabBeatGlyph();
                ((TabBeatGlyph)container.OnNotes).BeamingHelper = _helpers.BeamHelperLookup[v.Index][b.Index];
                container.PostNotes = new TabBeatPostNotesGlyph();
                AddBeatGlyph(container);
            }
        }

        protected override void CreatePostBeatGlyphs()
        {
            if (Bar.MasterBar.IsRepeatEnd)
            {
                AddPostBeatGlyph(new RepeatCloseGlyph(X, 0));
                if (Bar.MasterBar.RepeatCount > 2)
                {
                    var line = IsLast || IsLastOfLine ? -1 : -4;
                    AddPostBeatGlyph(new RepeatCountGlyph(0, GetTabY(line, -3), Bar.MasterBar.RepeatCount));
                }
            }
            else if (Bar.MasterBar.IsDoubleBar)
            {
                AddPostBeatGlyph(new BarSeperatorGlyph(0, 0));
                AddPostBeatGlyph(new SpacingGlyph(0, 0, 3 * Scale, false));
                AddPostBeatGlyph(new BarSeperatorGlyph(0, 0));
            }
            else if (Bar.NextBar == null || !Bar.NextBar.MasterBar.IsRepeatStart)
            {
                AddPostBeatGlyph(new BarSeperatorGlyph(0, 0, IsLast));
            }
        }

        public override float TopPadding
        {
            get { return NumberOverflow; }
        }

        public override float BottomPadding
        {
            get { return NumberOverflow; }
        }

        /// <summary>
        /// Gets the relative y position of the given steps relative to first line.
        /// </summary>
        /// <param name="line">the amount of steps while 2 steps are one line</param>
        /// <param name="correction"></param>
        /// <returns></returns>
        public float GetTabY(int line, float correction = 0)
        {
            return (LineOffset * line) + (correction * Scale);
        }

        /// <summary>
        /// gets the padding needed to place numbers within the bounding box
        /// </summary>
        public float NumberOverflow
        {
            get
            {
                var res = Resources;
                return (res.TablatureFont.Size / 2) + (res.TablatureFont.Size * 0.2f);
            }
        }

        protected override void PaintBackground(float cx, float cy, ICanvas canvas)
        {
            var res = Resources;

            //
            // draw string lines
            //
            canvas.Color = res.StaveLineColor;
            var lineY = cy + Y + NumberOverflow;

            for (int i = 0, j = Bar.Track.Tuning.Length; i < j; i++)
            {
                if (i > 0) lineY += LineOffset;
                canvas.BeginPath();
                canvas.MoveTo(cx + X, (int)lineY);
                canvas.LineTo(cx + X + Width, (int)lineY);
                canvas.Stroke();
            }

            canvas.Color = res.MainGlyphColor;

            // Info guides for debugging

            //DrawInfoGuide(canvas, cx, cy, 0, new Color(255, 0, 0)); // top
            //DrawInfoGuide(canvas, cx, cy, stave.StaveTop, new Color(0, 255, 0)); // stavetop
            //DrawInfoGuide(canvas, cx, cy, stave.StaveBottom, new Color(0,255,0)); // stavebottom
            //DrawInfoGuide(canvas, cx, cy, Height, new Color(255, 0, 0)); // bottom
        }

        //private void DrawInfoGuide(ICanvas canvas, int cx, int cy, int y, Color c)
        //{
        //    canvas.Color = c;
        //    canvas.BeginPath();
        //    canvas.MoveTo(cx + X, cy + Y + y);
        //    canvas.LineTo(cx + X + Width, cy + Y + y);
        //    canvas.Stroke();
        //}
    }
}
