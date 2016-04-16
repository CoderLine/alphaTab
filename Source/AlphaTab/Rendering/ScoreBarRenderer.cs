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
using AlphaTab.Audio;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This BarRenderer renders a bar using standard music notation. 
    /// </summary>
    public class ScoreBarRenderer : GroupedBarRenderer
    {
        /// <summary>
        /// The step offsets of sharp symbols for sharp key signatures.
        /// </summary>
        private static readonly int[] SharpKsSteps = { 1, 4, 0, 3, 6, 2, 5 };

        /// <summary>
        /// The step offsets of sharp symbols for flat key signatures.
        /// </summary>
        private static readonly int[] FlatKsSteps = { 5, 2, 6, 3, 7, 4, 8 };

        private const float LineSpacing = 8;

        private BarHelpers _helpers;

        public AccidentalHelper AccidentalHelper { get; set; }

        public ScoreBarRenderer(Bar bar)
            : base(bar)
        {
            AccidentalHelper = new AccidentalHelper();
        }

        public BeamDirection GetBeatDirection(Beat beat)
        {
            ScoreBeatGlyph g = (ScoreBeatGlyph)GetOnNotesPosition(beat.Voice.Index, beat.Index);
            if (g != null)
            {
                return g.NoteHeads.Direction;
            }
            return BeamDirection.Up;
        }

        public override float GetNoteX(Note note, bool onEnd = true)
        {
            ScoreBeatGlyph g = (ScoreBeatGlyph)GetOnNotesPosition(note.Beat.Voice.Index, note.Beat.Index);
            if (g != null)
            {
                return g.Container.X + g.X + g.NoteHeads.GetNoteX(note, onEnd);
            }
            return 0;
        }

        public override float GetNoteY(Note note)
        {
            ScoreBeatGlyph beat = (ScoreBeatGlyph)GetOnNotesPosition(note.Beat.Voice.Index, note.Beat.Index);
            if (beat != null)
            {
                return beat.NoteHeads.GetNoteY(note);
            }
            return 0;
        }

        public override float TopPadding
        {
            get { return GlyphOverflow; }
        }

        public override float BottomPadding
        {
            get { return GlyphOverflow; }
        }

        public float LineOffset
        {
            get
            {
                return ((LineSpacing + 1) * Scale);
            }
        }

        public override void DoLayout()
        {
            _helpers = Stave.StaveGroup.Helpers.Helpers[Bar.Track.Index][Bar.Index];
            base.DoLayout();


            Height = (LineOffset * 4) + TopPadding + BottomPadding;
            if (Index == 0)
            {
                Stave.RegisterStaveTop(GlyphOverflow);
                Stave.RegisterStaveBottom(Height - GlyphOverflow);
            }

            var top = GetScoreY(0);
            var bottom = GetScoreY(8);

            for (int i = 0, j = _helpers.BeamHelpers.Count; i < j; i++)
            {
                var v = _helpers.BeamHelpers[i];
                for (int k = 0, l = v.Count; k < l; k++)
                {
                    var h = v[k];
                    //
                    // max note (highest) -> top overflow
                    // 
                    var maxNoteY = GetScoreY(GetNoteLine(h.MaxNote));
                    if (h.Direction == BeamDirection.Up)
                    {
                        maxNoteY -= GetStemSize(h.MaxDuration);
                        maxNoteY -= h.FingeringCount * Resources.GraceFont.Size;
                        if (h.HasTuplet)
                        {
                            maxNoteY -= Resources.EffectFont.Size*2;
                        }
                    }

                    if (maxNoteY < top)
                    {
                        RegisterOverflowTop(Math.Abs(maxNoteY));
                    }

                    //
                    // min note (lowest) -> bottom overflow
                    //t
                    var minNoteY = GetScoreY(GetNoteLine(h.MinNote));
                    if (h.Direction == BeamDirection.Down)
                    {
                        minNoteY += GetStemSize(h.MaxDuration);
                        minNoteY += h.FingeringCount * Resources.GraceFont.Size;
                    }

                    if (minNoteY > bottom)
                    {
                        RegisterOverflowBottom(Math.Abs(minNoteY) - bottom);
                    }
                }
            }
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            base.Paint(cx, cy, canvas);
            PaintBeams(cx, cy, canvas);
            PaintTuplets(cx, cy, canvas);
        }

        private void PaintTuplets(float cx, float cy, ICanvas canvas)
        {
            for (int i = 0, j = _helpers.TupletHelpers.Count; i < j; i++)
            {
                var v = _helpers.TupletHelpers[i];
                for (int k = 0, l = v.Count; k < l; k++)
                {
                    var h = v[k];
                    PaintTupletHelper(cx + BeatGlyphsStart, cy, canvas, h);
                }
            }
        }

        private void PaintBeams(float cx, float cy, ICanvas canvas)
        {
            for (int i = 0, j = _helpers.BeamHelpers.Count; i < j; i++)
            {
                var v = _helpers.BeamHelpers[i];
                for (int k = 0, l = v.Count; k < l; k++)
                {
                    var h = v[k];
                    PaintBeamHelper(cx + BeatGlyphsStart, cy, canvas, h);
                }
            }
        }

        private void PaintBeamHelper(float cx, float cy, ICanvas canvas, BeamingHelper h)
        {
            // check if we need to paint simple footer
            if (h.Beats.Count == 1)
            {
                PaintFooter(cx, cy, canvas, h);
            }
            else
            {
                PaintBar(cx, cy, canvas, h);
            }
        }

        private void PaintTupletHelper(float cx, float cy, ICanvas canvas, TupletHelper h)
        {
            var res = Resources;
            var oldAlign = canvas.TextAlign;
            canvas.TextAlign = TextAlign.Center;
            // check if we need to paint simple footer
            if (h.Beats.Count == 1 || !h.IsFull)
            {
                for (int i = 0, j = h.Beats.Count; i < j; i++)
                {
                    var beat = h.Beats[i];
                    var beamingHelper = _helpers.BeamHelperLookup[h.VoiceIndex][beat.Index];
                    if (beamingHelper == null) continue;
                    var direction = beamingHelper.Direction;

                    var tupletX = beamingHelper.GetBeatLineX(beat) + Scale;
                    var tupletY = cy + Y + CalculateBeamY(beamingHelper, tupletX);

                    var offset = direction == BeamDirection.Up
                                ? res.EffectFont.Size * 1.8f
                                : -3 * Scale;

                    canvas.Font = res.EffectFont;
                    canvas.FillText(h.Tuplet.ToString(), cx + X + tupletX, tupletY - offset);
                }
            }
            else
            {
                var firstBeat = h.Beats[0];
                var lastBeat = h.Beats[h.Beats.Count - 1];

                var firstBeamingHelper = _helpers.BeamHelperLookup[h.VoiceIndex][firstBeat.Index];
                var lastBeamingHelper = _helpers.BeamHelperLookup[h.VoiceIndex][lastBeat.Index];
                if (firstBeamingHelper != null && lastBeamingHelper != null)
                {
                    var direction = firstBeamingHelper.Direction;

                    // 
                    // Calculate the overall area of the tuplet bracket

                    var startX = firstBeamingHelper.GetBeatLineX(firstBeat) + Scale;
                    var endX = lastBeamingHelper.GetBeatLineX(lastBeat) + Scale;

                    //
                    // Calculate how many space the text will need
                    canvas.Font = res.EffectFont;
                    var s = h.Tuplet.ToString();
                    var sw = canvas.MeasureText(s);
                    var sp = 3 * Scale;

                    // 
                    // Calculate the offsets where to break the bracket
                    var middleX = (startX + endX) / 2;
                    var offset1X = middleX - sw / 2 - sp;
                    var offset2X = middleX + sw / 2 + sp;

                    //
                    // calculate the y positions for our bracket

                    var startY = CalculateBeamY(firstBeamingHelper, startX);
                    var offset1Y = CalculateBeamY(firstBeamingHelper, offset1X);
                    var middleY = CalculateBeamY(firstBeamingHelper, middleX);
                    var offset2Y = CalculateBeamY(lastBeamingHelper, offset2X);
                    var endY = CalculateBeamY(lastBeamingHelper, endX);

                    var offset = 10 * Scale;
                    var size = 5 * Scale;
                    if (direction == BeamDirection.Down)
                    {
                        offset *= -1;
                        size *= -1;
                    }

                    //
                    // draw the bracket
                    canvas.BeginPath();
                    canvas.MoveTo(cx + X + startX, (int)(cy + Y + startY - offset));
                    canvas.LineTo(cx + X + startX, (int)(cy + Y + startY - offset - size));
                    canvas.LineTo(cx + X + offset1X, (int)(cy + Y + offset1Y - offset - size));
                    canvas.Stroke();

                    canvas.BeginPath();
                    canvas.MoveTo(cx + X + offset2X, (int)(cy + Y + offset2Y - offset - size));
                    canvas.LineTo(cx + X + endX, (int)(cy + Y + endY - offset - size));
                    canvas.LineTo(cx + X + endX, (int)(cy + Y + endY - offset));
                    canvas.Stroke();

                    //
                    // Draw the string
                    canvas.FillText(s, cx + X + middleX, cy + Y + middleY - offset - size - res.EffectFont.Size);
                }
            }
            canvas.TextAlign = oldAlign;
        }

        private float GetStemSize(Duration duration)
        {
            int size;
            switch (duration)
            {
                case Duration.Half: size = 6; break;
                case Duration.Quarter: size = 6; break;
                case Duration.Eighth: size = 6; break;
                case Duration.Sixteenth: size = 6; break;
                case Duration.ThirtySecond: size = 7; break;
                case Duration.SixtyFourth: size = 8; break;
                default: size = 0; break;
            }

            return GetScoreY(size);
        }

        private float CalculateBeamY(BeamingHelper h, float x)
        {
            var correction = NoteHeadGlyph.NoteHeadHeight / 2;
            var stemSize = GetStemSize(h.MaxDuration);
            return h.CalculateBeamY(stemSize, Scale, x, Scale, n => GetScoreY(GetNoteLine(n), correction - 1));
        }

        private void PaintBar(float cx, float cy, ICanvas canvas, BeamingHelper h)
        {
            for (int i = 0, j = h.Beats.Count; i < j; i++)
            {
                var beat = h.Beats[i];

                var correction = NoteHeadGlyph.NoteHeadHeight / 2;

                //
                // draw line 
                //
                var beatLineX = h.GetBeatLineX(beat) + Scale;

                var direction = h.Direction;

                var y1 = cy + Y + (direction == BeamDirection.Up
                            ? GetScoreY(GetNoteLine(beat.MinNote), correction - 1)
                            : GetScoreY(GetNoteLine(beat.MaxNote), correction - 1));

                var y2 = cy + Y + CalculateBeamY(h, beatLineX);

                canvas.BeginPath();
                canvas.MoveTo(cx + X + beatLineX, y1);
                canvas.LineTo(cx + X + beatLineX, y2);
                canvas.Stroke();

                float fingeringY = y2;
                if (direction == BeamDirection.Up)
                {
                    fingeringY -= correction * 3;
                }
                else
                {
                    fingeringY += correction * 3;
                }
                PaintFingering(canvas, beat, cx + X + beatLineX, direction, fingeringY);

                var brokenBarOffset = 6 * Scale;
                var barSpacing = 6 * Scale;
                var barSize = 3 * Scale;
                var barCount = beat.Duration.GetIndex() - 2;
                var barStart = cy + Y;
                if (direction == BeamDirection.Down)
                {
                    barSpacing = -barSpacing;
                    barSize = -barSize;
                }

                for (var barIndex = 0; barIndex < barCount; barIndex++)
                {
                    float barStartX;
                    float barEndX;

                    float barStartY;
                    float barEndY;

                    var barY = barStart + (barIndex * barSpacing);

                    // 
                    // Bar to Next?
                    //
                    if (i < h.Beats.Count - 1)
                    {
                        // full bar?
                        if (IsFullBarJoin(beat, h.Beats[i + 1], barIndex))
                        {
                            barStartX = beatLineX;
                            barEndX = h.GetBeatLineX(h.Beats[i + 1]) + Scale;
                        }
                        // broken bar?
                        else if (i == 0 || !IsFullBarJoin(h.Beats[i - 1], beat, barIndex))
                        {
                            barStartX = beatLineX;
                            barEndX = barStartX + brokenBarOffset;
                        }
                        else
                        {
                            continue;
                        }
                        barStartY = barY + CalculateBeamY(h, barStartX);
                        barEndY = barY + CalculateBeamY(h, barEndX);
                        PaintSingleBar(canvas, cx + X + barStartX, barStartY, cx + X + barEndX, barEndY, barSize);
                    }
                    // 
                    // Broken Bar to Previous?
                    //
                    else if (i > 0 && !IsFullBarJoin(beat, h.Beats[i - 1], barIndex))
                    {
                        barStartX = beatLineX - brokenBarOffset;
                        barEndX = beatLineX;

                        barStartY = barY + CalculateBeamY(h, barStartX);
                        barEndY = barY + CalculateBeamY(h, barEndX);

                        PaintSingleBar(canvas, cx + X + barStartX, barStartY, cx + X + barEndX, barEndY, barSize);
                    }
                }
            }
        }

        private bool IsFullBarJoin(Beat a, Beat b, int barIndex)
        {
            return (a.Duration.GetIndex() - 2 - barIndex > 0)
                && (b.Duration.GetIndex() - 2 - barIndex > 0);
        }
        private static void PaintSingleBar(ICanvas canvas, float x1, float y1, float x2, float y2, float size)
        {
            canvas.BeginPath();
            canvas.MoveTo(x1, y1);
            canvas.LineTo(x2, y2);
            canvas.LineTo(x2, y2 + size);
            canvas.LineTo(x1, y1 + size);
            canvas.ClosePath();
            canvas.Fill();
        }

        private void PaintFooter(float cx, float cy, ICanvas canvas, BeamingHelper h)
        {
            var beat = h.Beats[0];

            var isGrace = beat.GraceType != GraceType.None;
            var scaleMod = isGrace ? NoteHeadGlyph.GraceScale : 1;

            //
            // draw line 
            //

            var stemSize = GetStemSize(h.MaxDuration);

            var correction = ((NoteHeadGlyph.NoteHeadHeight * scaleMod) / 2);
            var beatLineX = h.GetBeatLineX(beat) + Scale;

            var direction = h.Direction;

            var topY = GetScoreY(GetNoteLine(beat.MaxNote), correction);
            var bottomY = GetScoreY(GetNoteLine(beat.MinNote), correction);

            if (beat.Duration == Duration.Whole)
            {
                correction += (1.5f * NoteHeadGlyph.NoteHeadHeight) * scaleMod;
            }

            float beamY;
            float fingeringY;
            if (direction == BeamDirection.Down)
            {
                bottomY += stemSize * scaleMod;
                beamY = bottomY;
                fingeringY = cy + Y + bottomY;
            }
            else
            {
                topY -= stemSize * scaleMod;
                beamY = topY;
                fingeringY = cy + Y + topY - correction;
            }

            PaintFingering(canvas, beat, cx + X + beatLineX, direction, fingeringY);

            if (beat.Duration == Duration.Whole)
            {
                return;
            }


            canvas.BeginPath();
            canvas.MoveTo(cx + X + beatLineX, cy + Y + topY);
            canvas.LineTo(cx + X + beatLineX, cy + Y + bottomY);
            canvas.Stroke();

            if (isGrace)
            {
                var graceSizeY = 15 * Scale;
                var graceSizeX = 12 * Scale;


                canvas.BeginPath();
                if (direction == BeamDirection.Down)
                {
                    canvas.MoveTo(cx + X + beatLineX - (graceSizeX / 2), cy + Y + bottomY - graceSizeY);
                    canvas.LineTo(cx + X + beatLineX + (graceSizeX / 2), cy + Y + bottomY);
                }
                else
                {
                    canvas.MoveTo(cx + X + beatLineX - (graceSizeX / 2), cy + Y + topY + graceSizeY);
                    canvas.LineTo(cx + X + beatLineX + (graceSizeX / 2), cy + Y + topY);
                }
                canvas.Stroke();
            }

            //
            // Draw beam 
            //
            if (beat.Duration > Duration.Quarter)
            {
                var glyph = new BeamGlyph(beatLineX, beamY, beat.Duration, direction, isGrace);
                glyph.Renderer = this;
                glyph.DoLayout();
                glyph.Paint(cx + X, cy + Y, canvas);
            }
        }

        private void PaintFingering(ICanvas canvas, Beat beat, float beatLineX, BeamDirection direction, float topY)
        {
            if (direction == BeamDirection.Up)
            {
                beatLineX -= 10 * Scale;
            }
            else
            {
                beatLineX += 3 * Scale;
                topY -= canvas.Font.Size;
            }

            // sort notes ascending in their value to ensure 
            // we are drawing the numbers according to their order on the stave 
            var noteList = beat.Notes.Clone();
            noteList.Sort((a, b) => b.RealValue - a.RealValue);

            for (int n = 0; n < noteList.Count; n++)
            {
                var note = noteList[n];
                string text = null;
                if (note.LeftHandFinger != Fingers.Unknown)
                {
                    text = FingerToString(beat, note.LeftHandFinger, true);
                }
                else if (note.RightHandFinger != Fingers.Unknown)
                {
                    text = FingerToString(beat, note.RightHandFinger, false);
                }

                if (text == null)
                {
                    continue;
                }

                canvas.FillText(text, beatLineX, topY);
                topY -= (int)(canvas.Font.Size);
            }
        }

        private string FingerToString(Beat beat, Fingers finger, bool leftHand)
        {
            if (Settings.ForcePianoFingering || GeneralMidi.IsPiano(beat.Voice.Bar.Track.PlaybackInfo.Program))
            {
                switch (finger)
                {
                    case Fingers.Unknown:
                    case Fingers.NoOrDead:
                        return null;
                    case Fingers.Thumb:
                        return "1";
                    case Fingers.IndexFinger:
                        return "2";
                    case Fingers.MiddleFinger:
                        return "3";
                    case Fingers.AnnularFinger:
                        return "4";
                    case Fingers.LittleFinger:
                        return "5";
                    default:
                        return null;
                }
            }
            else if (leftHand)
            {
                switch (finger)
                {
                    case Fingers.Unknown:
                    case Fingers.NoOrDead:
                        return "0";
                    case Fingers.Thumb:
                        return "T";
                    case Fingers.IndexFinger:
                        return "1";
                    case Fingers.MiddleFinger:
                        return "2";
                    case Fingers.AnnularFinger:
                        return "3";
                    case Fingers.LittleFinger:
                        return "4";
                    default:
                        return null;
                }
            }
            else
            {
                switch (finger)
                {
                    case Fingers.Unknown:
                    case Fingers.NoOrDead:
                        return null;
                    case Fingers.Thumb:
                        return "p";
                    case Fingers.IndexFinger:
                        return "i";
                    case Fingers.MiddleFinger:
                        return "m";
                    case Fingers.AnnularFinger:
                        return "a";
                    case Fingers.LittleFinger:
                        return "c";
                    default:
                        return null;
                }
            }
        }


        protected override void CreatePreBeatGlyphs()
        {
            if (Bar.MasterBar.IsRepeatStart)
            {
                AddPreBeatGlyph(new RepeatOpenGlyph(0, 0, 1.5f, 3));
            }

            // Clef
            if (IsFirstOfLine || Bar.Clef != Bar.PreviousBar.Clef)
            {
                var offset = 0;
                switch (Bar.Clef)
                {
                    case Clef.Neutral:
                        offset = 4;
                        break;
                    case Clef.F4:
                        offset = 4;
                        break;
                    case Clef.C3:
                        offset = 6;
                        break;
                    case Clef.C4:
                        offset = 4;
                        break;
                    case Clef.G2:
                        offset = 6;
                        break;
                }
                CreateStartSpacing();
                AddPreBeatGlyph(new ClefGlyph(0, GetScoreY(offset), Bar.Clef));
            }

            // Key signature
            if ((Bar.PreviousBar == null && Bar.MasterBar.KeySignature != 0) || (Bar.PreviousBar != null && Bar.MasterBar.KeySignature != Bar.PreviousBar.MasterBar.KeySignature))
            {
                CreateStartSpacing();
                CreateKeySignatureGlyphs();
            }

            // Time Signature
            if ((Bar.PreviousBar == null) || (Bar.PreviousBar != null && Bar.MasterBar.TimeSignatureNumerator != Bar.PreviousBar.MasterBar.TimeSignatureNumerator) || (Bar.PreviousBar != null && Bar.MasterBar.TimeSignatureDenominator != Bar.PreviousBar.MasterBar.TimeSignatureDenominator))
            {
                CreateStartSpacing();
                CreateTimeSignatureGlyphs();
            }

            AddPreBeatGlyph(new BarNumberGlyph(0, GetScoreY(-1, -3), Bar.Index + 1, !Stave.IsFirstInAccolade));

            if (Bar.IsEmpty)
            {
                AddPreBeatGlyph(new SpacingGlyph(0, 0, (30 * Scale), false));
            }
        }

        protected override void CreateBeatGlyphs()
        {
#if MULTIVOICE_SUPPORT
            foreach (var v in Bar.Voices)
            {
                CreateVoiceGlyphs(v);
            }
#else
            CreateVoiceGlyphs(Bar.Voices[0]);
#endif
        }

        protected override void CreatePostBeatGlyphs()
        {
            if (Bar.MasterBar.IsRepeatEnd)
            {
                AddPostBeatGlyph(new RepeatCloseGlyph(X, 0));
                if (Bar.MasterBar.RepeatCount > 2)
                {
                    var line = IsLast || IsLastOfLine ? -1 : -4;
                    AddPostBeatGlyph(new RepeatCountGlyph(0, GetScoreY(line, -3), Bar.MasterBar.RepeatCount));
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

        private bool _startSpacing;

        private void CreateStartSpacing()
        {
            if (_startSpacing) return;
            AddPreBeatGlyph(new SpacingGlyph(0, 0, 2 * Scale));
            _startSpacing = true;
        }

        private void CreateKeySignatureGlyphs()
        {
            int offsetClef = 0;
            int currentKey = Bar.MasterBar.KeySignature;
            int previousKey = Bar.PreviousBar == null ? 0 : Bar.PreviousBar.MasterBar.KeySignature;

            switch (Bar.Clef)
            {
                case Clef.Neutral:
                    offsetClef = 0;
                    break;
                case Clef.G2:
                    offsetClef = 0;
                    break;
                case Clef.F4:
                    offsetClef = 2;
                    break;
                case Clef.C3:
                    offsetClef = -1;
                    break;
                case Clef.C4:
                    offsetClef = 1;
                    break;
            }

            // naturalize previous key
            // TODO: only naturalize the symbols needed 
            var naturalizeSymbols = Math.Abs(previousKey);
            var previousKeyPositions = ModelUtils.KeySignatureIsSharp(previousKey) ? SharpKsSteps : FlatKsSteps;

            for (var i = 0; i < naturalizeSymbols; i++)
            {
                AddPreBeatGlyph(new NaturalizeGlyph(0, GetScoreY(previousKeyPositions[i] + offsetClef)));
            }

            // how many symbols do we need to get from a C-keysignature
            // to the new one
            //var offsetSymbols = (currentKey <= 7) ? currentKey : currentKey - 7;
            // a sharp keysignature
            if (ModelUtils.KeySignatureIsSharp(currentKey))
            {
                for (var i = 0; i < Math.Abs(currentKey); i++)
                {
                    AddPreBeatGlyph(new SharpGlyph(0, GetScoreY(SharpKsSteps[i] + offsetClef)));
                }
            }
            // a flat signature
            else
            {
                for (var i = 0; i < Math.Abs(currentKey); i++)
                {
                    AddPreBeatGlyph(new FlatGlyph(0, GetScoreY(FlatKsSteps[i] + offsetClef)));
                }
            }
        }

        private void CreateTimeSignatureGlyphs()
        {
            AddPreBeatGlyph(new SpacingGlyph(0, 0, 5 * Scale));
            AddPreBeatGlyph(new TimeSignatureGlyph(0, 0, Bar.MasterBar.TimeSignatureNumerator, Bar.MasterBar.TimeSignatureDenominator));
        }

        private void CreateVoiceGlyphs(Voice v)
        {
            for (int i = 0, j = v.Beats.Count; i < j; i++)
            {
                var b = v.Beats[i];
                var container = new ScoreBeatContainerGlyph(b);
                container.PreNotes = new ScoreBeatPreNotesGlyph();
                container.OnNotes = new ScoreBeatGlyph();
                ((ScoreBeatGlyph)container.OnNotes).BeamingHelper = _helpers.BeamHelperLookup[v.Index][b.Index];
                container.PostNotes = new ScoreBeatPostNotesGlyph();
                AddBeatGlyph(container);
            }
        }

        // TODO[performance]: Maybe we should cache this (check profiler)
        public int GetNoteLine(Note n)
        {
            return AccidentalHelper.GetNoteLine(n);
        }

        /// <summary>
        /// Gets the relative y position of the given steps relative to first line. 
        /// </summary>
        /// <param name="steps">the amount of steps while 2 steps are one line</param>
        /// <param name="correction"></param>
        /// <returns></returns>
        public float GetScoreY(int steps, float correction = 0)
        {
            return ((LineOffset / 2) * steps) + (correction * Scale);
        }

        /// <summary>
        /// gets the padding needed to place glyphs within the bounding box
        /// </summary>
        private float GlyphOverflow
        {
            get
            {
                var res = Resources;
                return (res.TablatureFont.Size / 2) + (res.TablatureFont.Size * 0.2f);
            }
        }

        //private static readonly Random Random = new Random();
        protected override void PaintBackground(float cx, float cy, ICanvas canvas)
        {
            base.PaintBackground(cx, cy, canvas);

            var res = Resources;

            //var c = new Color((byte)Random.Next(255),
            //                  (byte)Random.Next(255),
            //                  (byte)Random.Next(255),
            //                  100);
            //canvas.Color = c;
            //canvas.FillRect(cx + X, cy + Y, Width, Height);

            //
            // draw string lines
            //
            canvas.Color = res.StaveLineColor;
            var lineY = cy + Y + GlyphOverflow;

            for (var i = 0; i < 5; i++)
            {
                if (i > 0) lineY += LineOffset;
                canvas.BeginPath();
                canvas.MoveTo(cx + X, (int)lineY);
                canvas.LineTo(cx + X + Width, (int)lineY);
                canvas.Stroke();
            }

            canvas.Color = res.MainGlyphColor;
        }
    }
}
