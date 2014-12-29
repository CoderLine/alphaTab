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
    public class RhythmBarRenderer : GroupedBarRenderer
    {
        private readonly BeamDirection _direction;
        private BarHelpers _helpers;

        public RhythmBarRenderer(Bar bar, BeamDirection direction)
            : base(bar)
        {
            _direction = direction;
        }

        public override void DoLayout()
        {
            _helpers = Stave.StaveGroup.Helpers.Helpers[Bar.Track.Index][Bar.Index];
            base.DoLayout();
            Height = Stave.GetSetting("rhythm-height", 24) * Scale;
            IsEmpty = false;
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

        private void CreateVoiceGlyphs(Voice voice)
        {
            for (int i = 0, j = voice.Beats.Count; i < j; i++)
            {
                var b = voice.Beats[i];
                // we create empty glyphs as alignment references and to get the 
                // effect bar sized
                var container = new BeatContainerGlyph(b);
                container.PreNotes = new BeatGlyphBase();
                container.OnNotes = new BeatGlyphBase();
                container.PostNotes = new BeatGlyphBase();
                AddBeatGlyph(container);
            }
        }

        protected override void PaintBackground(float cx, float cy, ICanvas canvas)
        {
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            base.Paint(cx, cy, canvas);

            for (int i = 0, j = _helpers.BeamHelpers.Count; i < j; i++)
            {
                var v = _helpers.BeamHelpers[i];
                for (int k = 0, l = v.Count; k < l; k++)
                {
                    PaintBeamHelper(cx + BeatGlyphsStart, cy, canvas, v[k]);
                }
            }
        }

        private void PaintBeamHelper(float cx, float cy, ICanvas canvas, BeamingHelper h)
        {
            if (h.Beats[0].GraceType != GraceType.None) return;
            var useBeams = Stave.GetSetting("use-beams", false);
            // check if we need to paint simple footer
            if (useBeams && h.Beats.Count == 1)
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
                    var beatLineX = h.GetBeatLineX(beat) + Scale;

                    var y1 = cy + Y;
                    var y2 = cy + Y + Height;

                    canvas.BeginPath();
                    canvas.MoveTo(cx + X + beatLineX, y1);
                    canvas.LineTo(cx + X + beatLineX, y2);
                    canvas.Stroke();

                    var brokenBarOffset = (6 * Scale);
                    var barSpacing = (6 * Scale);
                    var barSize = (3 * Scale);
                    var barCount = beat.Duration.GetIndex() - 2;
                    var barStart = cy + Y;
                    if (_direction == BeamDirection.Down)
                    {
                        barSpacing = -barSpacing;
                        barStart += Height;
                    }

                    for (int barIndex = 0; barIndex < barCount; barIndex++)
                    {
                        float barStartX;
                        float barEndX;

                        float barStartY;
                        float barEndY;

                        var barY = barStart + (barIndex * barSpacing);

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
                            barStartY = barY;
                            barEndY = barY;
                            PaintSingleBar(canvas, cx + X + barStartX, barStartY, cx + X + barEndX, barEndY, barSize);
                        }
                        // 
                        // Broken Bar to Previous?
                        //
                        else if (i > 0 && !IsFullBarJoin(beat, h.Beats[i - 1], barIndex))
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

        private void PaintFooter(float cx, float cy, ICanvas canvas, BeamingHelper h)
        {
            var beat = h.Beats[0];

            if (beat.Duration == Duration.Whole)
            {
                return;
            }

            //
            // draw line 
            //

            var beatLineX = h.GetBeatLineX(beat) + Scale;

            const float topY = 0;
            var bottomY = Height;

            float beamY = _direction == BeamDirection.Down ? bottomY : topY;

            canvas.BeginPath();
            canvas.MoveTo(cx + X + beatLineX, cy + Y + topY);
            canvas.LineTo(cx + X + beatLineX, cy + Y + bottomY);
            canvas.Stroke();


            //
            // Draw beam 
            //
            var glyph = new BeamGlyph(beatLineX, beamY, beat.Duration, _direction, false);
            glyph.Renderer = this;
            glyph.DoLayout();
            glyph.Paint(cx + X, cy + Y, canvas);
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
            canvas.LineTo(x2, y2 - size);
            canvas.LineTo(x1, y1 - size);
            canvas.ClosePath();
            canvas.Fill();
        }
    }
}
