using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This BarRenderer renders a bar using guitar tablature notation
    /// </summary>
    internal class TabBarRenderer : BarRendererBase
    {
        public const string StaffId = "tab";

        public const float LineSpacing = 10;

        private float _tupletSize;

        public bool ShowTimeSignature { get; set; }
        public bool ShowRests { get; set; }
        public bool ShowTiedNotes { get; set; }

        public TabBarRenderer(ScoreRenderer renderer, Bar bar)
            : base(renderer, bar)
        {
        }

        public float LineOffset => (LineSpacing + 1) * Scale;

        public override float GetNoteX(Note note, bool onEnd = true)
        {
            var beat = (TabBeatGlyph)GetOnNotesGlyphForBeat(note.Beat);
            if (beat != null)
            {
                return beat.Container.X + beat.Container.VoiceContainer.X + beat.X +
                       beat.NoteNumbers.GetNoteX(note, onEnd);
            }

            return 0;
        }

        public override float GetNoteY(Note note, bool aboveNote = false)
        {
            var beat = (TabBeatGlyph)GetOnNotesGlyphForBeat(note.Beat);
            if (beat != null)
            {
                return beat.NoteNumbers.GetNoteY(note, aboveNote);
            }

            return 0;
        }

        protected override void UpdateSizes()
        {
            var res = Resources;
            var numberOverflow = res.TablatureFont.Size / 2 + res.TablatureFont.Size * 0.2f;
            TopPadding = numberOverflow;
            BottomPadding = numberOverflow;
            Height = LineOffset * (Bar.Staff.Tuning.Length - 1) + numberOverflow * 2;


            if (Settings.Notation.RhythmMode != TabRhythmMode.Hidden)
            {
                Height += Settings.Notation.RhythmHeight * Settings.Display.Scale;
                BottomPadding += Settings.Notation.RhythmHeight * Settings.Display.Scale;
            }

            base.UpdateSizes();
        }

        public override void DoLayout()
        {
            base.DoLayout();
            if (Settings.Notation.RhythmMode != TabRhythmMode.Hidden)
            {
                var hasTuplets = false;
                foreach (var voice in Bar.Voices)
                {
                    if (HasVoiceContainer(voice))
                    {
                        var c = GetOrCreateVoiceContainer(voice);
                        if (c.TupletGroups.Count > 0)
                        {
                            hasTuplets = true;
                            break;
                        }
                    }
                }

                if (hasTuplets)
                {
                    _tupletSize = Resources.EffectFont.Size * 0.8f;
                    RegisterOverflowBottom(_tupletSize);
                }
            }
        }

        protected override void CreatePreBeatGlyphs()
        {
            base.CreatePreBeatGlyphs();
            if (Bar.MasterBar.IsRepeatStart)
            {
                AddPreBeatGlyph(new RepeatOpenGlyph(0, 0, 1.5f, 3));
            }

            // Clef
            if (IsFirstOfLine)
            {
                var center = (Bar.Staff.Tuning.Length + 1) / 2f;
                AddPreBeatGlyph(new TabClefGlyph(5 * Scale, GetTabY(center)));
            }

            // Time Signature
            if (ShowTimeSignature &&
                (Bar.PreviousBar == null ||
                 Bar.PreviousBar != null && Bar.MasterBar.TimeSignatureNumerator !=
                 Bar.PreviousBar.MasterBar.TimeSignatureNumerator || Bar.PreviousBar != null &&
                 Bar.MasterBar.TimeSignatureDenominator != Bar.PreviousBar.MasterBar.TimeSignatureDenominator))
            {
                CreateStartSpacing();
                CreateTimeSignatureGlyphs();
            }

            AddPreBeatGlyph(new BarNumberGlyph(0, GetTabY(-0.5f), Bar.Index + 1));

            if (Bar.IsEmpty)
            {
                AddPreBeatGlyph(new SpacingGlyph(0, 0, 30 * Scale));
            }
        }

        private bool _startSpacing;

        private void CreateStartSpacing()
        {
            if (_startSpacing)
            {
                return;
            }

            AddPreBeatGlyph(new SpacingGlyph(0, 0, 2 * Scale));
            _startSpacing = true;
        }

        private void CreateTimeSignatureGlyphs()
        {
            AddPreBeatGlyph(new SpacingGlyph(0, 0, 5 * Scale));
            AddPreBeatGlyph(new TabTimeSignatureGlyph(0,
                GetTabY(0),
                Bar.MasterBar.TimeSignatureNumerator,
                Bar.MasterBar.TimeSignatureDenominator,
                Bar.MasterBar.TimeSignatureCommon));
        }

        protected override void CreateBeatGlyphs()
        {
            for (var v = 0; v < Bar.Voices.Count; v++)
            {
                var voice = Bar.Voices[v];
                if (HasVoiceContainer(voice))
                {
                    CreateVoiceGlyphs(Bar.Voices[v]);
                }
            }
        }

        private void CreateVoiceGlyphs(Voice v)
        {
            for (int i = 0, j = v.Beats.Count; i < j; i++)
            {
                var b = v.Beats[i];
                var container = new TabBeatContainerGlyph(b, GetOrCreateVoiceContainer(v));
                container.PreNotes = new TabBeatPreNotesGlyph();
                container.OnNotes = new TabBeatGlyph();
                AddBeatGlyph(container);
            }
        }

        protected override void CreatePostBeatGlyphs()
        {
            base.CreatePostBeatGlyphs();
            if (Bar.MasterBar.IsRepeatEnd)
            {
                AddPostBeatGlyph(new RepeatCloseGlyph(X, 0));
                if (Bar.MasterBar.RepeatCount > 2)
                {
                    AddPostBeatGlyph(new RepeatCountGlyph(0, GetTabY(-0.5f, -3), Bar.MasterBar.RepeatCount));
                }
            }
            else
            {
                AddPostBeatGlyph(new BarSeperatorGlyph(0, 0));
            }
        }

        /// <summary>
        /// Gets the relative y position of the given steps relative to first line.
        /// </summary>
        /// <param name="line">the amount of steps while 2 steps are one line</param>
        /// <param name="correction"></param>
        /// <returns></returns>
        public float GetTabY(float line, float correction = 0)
        {
            return LineOffset * line + correction * Scale;
        }

        protected override void PaintBackground(float cx, float cy, ICanvas canvas)
        {
            base.PaintBackground(cx, cy, canvas);

            var res = Resources;

            //
            // draw string lines
            //
            canvas.Color = res.StaffLineColor;
            var lineY = cy + Y + TopPadding;

            var padding = Scale;

            // collect tab note position for spaces
            var tabNotes = new FastList<FastList<float[]>>();
            for (int i = 0, j = Bar.Staff.Tuning.Length; i < j; i++)
            {
                tabNotes.Add(new FastList<float[]>());
            }

            foreach (var voice in Bar.Voices)
            {
                if (HasVoiceContainer(voice))
                {
                    var vc = GetOrCreateVoiceContainer(voice);
                    foreach (var bg in vc.BeatGlyphs)
                    {
                        var notes = (TabBeatGlyph)bg.OnNotes;
                        var noteNumbers = notes.NoteNumbers;
                        if (noteNumbers != null)
                        {
                            foreach (var s in noteNumbers.NotesPerString)
                            {
                                var noteNumber = noteNumbers.NotesPerString[s];
                                if (!noteNumber.IsEmpty)
                                {
                                    tabNotes[Bar.Staff.Tuning.Length - s].Add(
                                        new[]
                                        {
                                            vc.X + bg.X + notes.X + noteNumbers.X, noteNumbers.Width + padding
                                        });
                                }
                            }
                        }
                    }
                }
            }

            // if we have multiple voices we need to sort by X-position, otherwise have a wild mix in the list
            // but painting relies on ascending X-position
            foreach (var line in tabNotes)
            {
                line.Sort((a, b) => a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0);
            }

            var lineOffset = LineOffset;
            for (int i = 0, j = Bar.Staff.Tuning.Length; i < j; i++)
            {
                if (i > 0)
                {
                    lineY += lineOffset;
                }

                var lineX = 0f;
                foreach (var line in tabNotes[i])
                {
                    canvas.FillRect(cx + X + lineX, (int)lineY, line[0] - lineX, Scale);
                    lineX = line[0] + line[1];
                }

                canvas.FillRect(cx + X + lineX, (int)lineY, Width - lineX, Scale);
            }

            canvas.Color = res.MainGlyphColor;

            PaintSimileMark(cx, cy, canvas);

            // Info guides for debugging

            //DrawInfoGuide(canvas, cx, cy, 0, new Color(255, 0, 0)); // top
            //DrawInfoGuide(canvas, cx, cy, stave.StaveTop, new Color(0, 255, 0)); // stavetop
            //DrawInfoGuide(canvas, cx, cy, stave.StaveBottom, new Color(0,255,0)); // stavebottom
            //DrawInfoGuide(canvas, cx, cy, Height, new Color(255, 0, 0)); // bottom
        }


        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            base.Paint(cx, cy, canvas);
            if (Settings.Notation.RhythmMode != TabRhythmMode.Hidden)
            {
                PaintBeams(cx, cy, canvas);
                PaintTuplets(cx, cy, canvas);
            }
        }


        private void PaintBeams(float cx, float cy, ICanvas canvas)
        {
            for (int i = 0, j = Helpers.BeamHelpers.Count; i < j; i++)
            {
                var v = Helpers.BeamHelpers[i];
                for (int k = 0, l = v.Count; k < l; k++)
                {
                    var h = v[k];
                    PaintBeamHelper(cx + BeatGlyphsStart, cy, canvas, h);
                }
            }
        }

        private void PaintTuplets(float cx, float cy, ICanvas canvas)
        {
            foreach (var voice in Bar.Voices)
            {
                if (HasVoiceContainer(voice))
                {
                    var container = GetOrCreateVoiceContainer(voice);
                    foreach (var tupletGroup in container.TupletGroups)
                    {
                        PaintTupletHelper(cx + BeatGlyphsStart, cy, canvas, tupletGroup);
                    }
                }
            }
        }

        private void PaintBeamHelper(float cx, float cy, ICanvas canvas, BeamingHelper h)
        {
            canvas.Color = h.Voice.Index == 0
                ? Resources.MainGlyphColor
                : Resources.SecondaryGlyphColor;

            // check if we need to paint simple footer
            if (h.Beats.Count == 1 || Settings.Notation.RhythmMode == TabRhythmMode.ShowWithBeams)
            {
                PaintFooter(cx, cy, canvas, h);
            }
            else
            {
                PaintBar(cx, cy, canvas, h);
            }
        }


        private void PaintBar(float cx, float cy, ICanvas canvas, BeamingHelper h)
        {
            for (int i = 0, j = h.Beats.Count; i < j; i++)
            {
                var beat = h.Beats[i];

                if (h.HasBeatLineX(beat))
                {
                    //
                    // draw line
                    //
                    var beatLineX = h.GetBeatLineX(beat);
                    var y1 = cy + Y;
                    var y2 = cy + Y + Height - _tupletSize;

                    var startGlyph = (TabBeatGlyph)GetOnNotesGlyphForBeat(beat);
                    if (startGlyph.NoteNumbers == null)
                    {
                        y1 += Height - Settings.Notation.RhythmHeight * Settings.Display.Scale - _tupletSize;
                    }
                    else
                    {
                        y1 += startGlyph.NoteNumbers.GetNoteY(startGlyph.NoteNumbers.MinStringNote) + LineOffset / 2;
                    }

                    if (h.Direction == BeamDirection.Up)
                    {
                        beatLineX -= startGlyph.Width / 2f;
                    }
                    else
                    {
                        beatLineX += startGlyph.Width / 2f;
                    }

                    canvas.BeginPath();
                    canvas.MoveTo(cx + X + beatLineX, y1);
                    canvas.LineTo(cx + X + beatLineX, y2);
                    canvas.Stroke();

                    var brokenBarOffset = 6 * Scale;
                    var barSpacing = -6 * Scale;
                    var barSize = 3 * Scale;
                    var barCount = beat.Duration.GetIndex() - 2;
                    var barStart = y2;

                    for (var barIndex = 0; barIndex < barCount; barIndex++)
                    {
                        float barStartX;
                        float barEndX;

                        float barStartY;
                        float barEndY;

                        var barY = barStart + barIndex * barSpacing;

                        //
                        // Broken Bar to Next
                        //
                        if (h.Beats.Count == 1)
                        {
                            barStartX = beatLineX;
                            barEndX = beatLineX + brokenBarOffset;
                            barStartY = barY;
                            barEndY = barY;
                            PaintSingleBar(canvas, cx + X + barStartX, barStartY, cx + X + barEndX, barEndY, barSize);
                        }
                        //
                        // Bar to Next?
                        //
                        else if (i < h.Beats.Count - 1)
                        {
                            // full bar?
                            if (BeamingHelper.IsFullBarJoin(beat, h.Beats[i + 1], barIndex))
                            {
                                barStartX = beatLineX;
                                barEndX = h.GetBeatLineX(h.Beats[i + 1]) + Scale;

                                var endGlyph = GetOnNotesGlyphForBeat(h.Beats[i + 1]);
                                if (h.Direction == BeamDirection.Up)
                                {
                                    barEndX -= endGlyph.Width / 2f;
                                }
                                else
                                {
                                    barEndX += endGlyph.Width / 2f;
                                }
                            }
                            // broken bar?
                            else if (i == 0 || !BeamingHelper.IsFullBarJoin(h.Beats[i - 1], beat, barIndex))
                            {
                                barStartX = beatLineX;
                                barEndX = barStartX + brokenBarOffset;
                            }
                            else
                            {
                                continue;
                            }

                            barStartY = barY;
                            barEndY = barY;
                            PaintSingleBar(canvas, cx + X + barStartX, barStartY, cx + X + barEndX, barEndY, barSize);
                        }
                        //
                        // Broken Bar to Previous?
                        //
                        else if (i > 0 && !BeamingHelper.IsFullBarJoin(beat, h.Beats[i - 1], barIndex))
                        {
                            barStartX = beatLineX - brokenBarOffset;
                            barEndX = beatLineX;

                            barStartY = barY;
                            barEndY = barY;

                            PaintSingleBar(canvas, cx + X + barStartX, barStartY, cx + X + barEndX, barEndY, barSize);
                        }
                    }
                }
            }
        }

        private void PaintTupletHelper(float cx, float cy, ICanvas canvas, TupletGroup h)
        {
            var res = Resources;
            var oldAlign = canvas.TextAlign;
            canvas.Color = h.Voice.Index == 0
                ? Resources.MainGlyphColor
                : Resources.SecondaryGlyphColor;
            canvas.TextAlign = TextAlign.Center;
            string s;
            var num = h.Beats[0].TupletNumerator;
            var den = h.Beats[0].TupletDenominator;

            // list as in Guitar Pro 7. for certain tuplets only the numerator is shown
            if (num == 2 && den == 3)
            {
                s = "2";
            }
            else if (num == 3 && den == 2)
            {
                s = "3";
            }
            else if (num == 4 && den == 6)
            {
                s = "4";
            }
            else if (num == 5 && den == 4)
            {
                s = "5";
            }
            else if (num == 6 && den == 4)
            {
                s = "6";
            }
            else if (num == 7 && den == 4)
            {
                s = "7";
            }
            else if (num == 9 && den == 8)
            {
                s = "9";
            }
            else if (num == 10 && den == 8)
            {
                s = "10";
            }
            else if (num == 11 && den == 8)
            {
                s = "11";
            }
            else if (num == 12 && den == 8)
            {
                s = "12";
            }
            else if (num == 13 && den == 8)
            {
                s = "13";
            }
            else
            {
                s = num + ":" + den;
            }

            // check if we need to paint simple footer
            if (h.Beats.Count == 1 || !h.IsFull)
            {
                for (int i = 0, j = h.Beats.Count; i < j; i++)
                {
                    var beat = h.Beats[i];
                    var beamingHelper = Helpers.BeamHelperLookup[h.Voice.Index][beat.Index];
                    if (beamingHelper == null)
                    {
                        continue;
                    }

                    var tupletX = beamingHelper.GetBeatLineX(beat);
                    var startGlyph = (TabBeatGlyph)GetOnNotesGlyphForBeat(beat);
                    if (beamingHelper.Direction == BeamDirection.Up)
                    {
                        tupletX -= startGlyph.Width / 2f;
                    }
                    else
                    {
                        tupletX += startGlyph.Width / 2f;
                    }

                    var tupletY = cy + Y + Height - _tupletSize + res.EffectFont.Size * 0.5f;

                    canvas.Font = res.EffectFont;
                    canvas.FillText(s, cx + X + tupletX, tupletY);
                }
            }
            else
            {
                var firstBeat = h.Beats[0];
                var lastBeat = h.Beats[h.Beats.Count - 1];

                var firstBeamingHelper = Helpers.BeamHelperLookup[h.Voice.Index][firstBeat.Index];
                var lastBeamingHelper = Helpers.BeamHelperLookup[h.Voice.Index][lastBeat.Index];
                if (firstBeamingHelper != null && lastBeamingHelper != null)
                {
                    //
                    // Calculate the overall area of the tuplet bracket

                    var startX = firstBeamingHelper.GetBeatLineX(firstBeat);
                    var endX = lastBeamingHelper.GetBeatLineX(lastBeat);

                    var startGlyph = (TabBeatGlyph)GetOnNotesGlyphForBeat(firstBeat);
                    var endGlyph = (TabBeatGlyph)GetOnNotesGlyphForBeat(firstBeat);
                    if (firstBeamingHelper.Direction == BeamDirection.Up)
                    {
                        startX -= startGlyph.Width / 2f;
                        endX -= endGlyph.Width / 2f;
                    }
                    else
                    {
                        startX += startGlyph.Width / 2f;
                        endX += endGlyph.Width / 2f;
                    }

                    //
                    // Calculate how many space the text will need
                    canvas.Font = res.EffectFont;
                    var sw = canvas.MeasureText(s);
                    var sp = 3 * Scale;

                    //
                    // Calculate the offsets where to break the bracket
                    var middleX = (startX + endX) / 2;
                    var offset1X = middleX - sw / 2 - sp;
                    var offset2X = middleX + sw / 2 + sp;

                    //
                    // calculate the y positions for our bracket
                    var startY = cy + Y + Height - _tupletSize + res.EffectFont.Size * 0.5f;

                    var offset = -res.EffectFont.Size * 0.25f;
                    var size = -5 * Scale;

                    //
                    // draw the bracket
                    canvas.BeginPath();
                    canvas.MoveTo(cx + X + startX, (int)(startY - offset));
                    canvas.LineTo(cx + X + startX, (int)(startY - offset - size));
                    canvas.LineTo(cx + X + offset1X, (int)(startY - offset - size));
                    canvas.Stroke();

                    canvas.BeginPath();
                    canvas.MoveTo(cx + X + offset2X, (int)(startY - offset - size));
                    canvas.LineTo(cx + X + endX, (int)(startY - offset - size));
                    canvas.LineTo(cx + X + endX, (int)(startY - offset));
                    canvas.Stroke();

                    //
                    // Draw the string
                    canvas.FillText(s, cx + X + middleX, startY);
                }
            }

            canvas.TextAlign = oldAlign;
        }

        private static void PaintSingleBar(ICanvas canvas, float x1, float y1, float x2, float y2, float size)
        {
            canvas.BeginPath();
            canvas.MoveTo(x1, y1);
            canvas.LineTo(x2, y2);
            canvas.LineTo(x2, y2 - size);
            canvas.LineTo(x1, y1 - size);
            canvas.ClosePath();
            canvas.Fill();
        }

        private void PaintFooter(float cx, float cy, ICanvas canvas, BeamingHelper h)
        {
            foreach (var beat in h.Beats)
            {
                if (beat.GraceType != GraceType.None || beat.Duration == Duration.Whole ||
                    beat.Duration == Duration.DoubleWhole || beat.Duration == Duration.QuadrupleWhole)
                {
                    return;
                }


                //
                // draw line
                //

                var beatLineX = h.GetBeatLineX(beat);
                var y1 = cy + Y;
                var y2 = cy + Y + Height - _tupletSize;

                var startGlyph = (TabBeatGlyph)GetOnNotesGlyphForBeat(beat);
                if (startGlyph.NoteNumbers == null)
                {
                    y1 += Height - Settings.Notation.RhythmHeight * Settings.Display.Scale - _tupletSize;
                }
                else
                {
                    y1 += startGlyph.NoteNumbers.GetNoteY(startGlyph.NoteNumbers.MinStringNote) + LineOffset / 2;
                }

                if (h.Direction == BeamDirection.Up)
                {
                    beatLineX -= startGlyph.Width / 2f;
                }
                else
                {
                    beatLineX += startGlyph.Width / 2f;
                }

                canvas.BeginPath();
                canvas.MoveTo(cx + X + beatLineX, y1);
                canvas.LineTo(cx + X + beatLineX, y2);
                canvas.Stroke();

                //
                // Draw beam
                //
                if (beat.Duration > Duration.Quarter)
                {
                    var glyph = new BeamGlyph(0, 0, beat.Duration, BeamDirection.Down, false);
                    glyph.Renderer = this;
                    glyph.DoLayout();
                    glyph.Paint(cx + X + beatLineX, y2, canvas);
                }
            }
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
