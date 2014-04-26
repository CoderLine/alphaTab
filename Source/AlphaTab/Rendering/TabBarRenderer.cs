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
        public const int LineSpacing = 10;

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

        public int GetNoteX(Note note, bool onEnd = true)
        {
            TabBeatGlyph beat = (TabBeatGlyph)GetOnNotesPosition(note.Beat.Voice.Index, note.Beat.Index);
            if (beat != null)
            {
                return beat.Container.X + beat.X + beat.NoteNumbers.GetNoteX(note, onEnd);
            }
            return PostBeatGlyphsStart;
        }

        public int GetBeatX(Beat beat)
        {
            TabBeatGlyph bg = (TabBeatGlyph)GetPreNotesPosition(beat.Voice.Index, beat.Index);
            if (bg != null)
            {
                return bg.Container.X + bg.X;
            }
            return 0;
        }

        public int GetNoteY(Note note)
        {
            TabBeatGlyph beat = (TabBeatGlyph)GetOnNotesPosition(note.Beat.Voice.Index, note.Beat.Index);
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
            Height = (int)(LineOffset * (Bar.Track.Tuning.Count - 1)) + (NumberOverflow * 2);
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
                AddPreBeatGlyph(new SpacingGlyph(0, 0, (int)(30 * Scale), false));
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
                AddPostBeatGlyph(new SpacingGlyph(0, 0, (int)(3 * Scale), false));
                AddPostBeatGlyph(new BarSeperatorGlyph(0, 0));
            }
            else if (Bar.NextBar == null || !Bar.NextBar.MasterBar.IsRepeatStart)
            {
                AddPostBeatGlyph(new BarSeperatorGlyph(0, 0, IsLast));
            }
        }

        public override int TopPadding
        {
            get { return NumberOverflow; }
        }

        public override int BottomPadding
        {
            get { return NumberOverflow; }
        }

        /// <summary>
        /// Gets the relative y position of the given steps relative to first line.
        /// </summary>
        /// <param name="line">the amount of steps while 2 steps are one line</param>
        /// <param name="correction"></param>
        /// <returns></returns>
        public int GetTabY(int line, int correction = 0)
        {
            return (int)((LineOffset * line) + (correction * Scale));
        }

        /// <summary>
        /// gets the padding needed to place numbers within the bounding box
        /// </summary>
        public int NumberOverflow
        {
            get
            {
                var res = Resources;
                return (int)((res.TablatureFont.Size / 2) + (res.TablatureFont.Size * 0.2));
            }
        }

        protected override void PaintBackground(int cx, int cy, ICanvas canvas)
        {
            var res = Resources;

            //
            // draw string lines
            //
            canvas.Color = res.StaveLineColor;
            var lineY = cy + Y + NumberOverflow;

            for (int i = 0, j = Bar.Track.Tuning.Count; i < j; i++)
            {
                if (i > 0) lineY += (int)LineOffset;
                canvas.BeginPath();
                canvas.MoveTo(cx + X, lineY);
                canvas.LineTo(cx + X + Width, lineY);
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
