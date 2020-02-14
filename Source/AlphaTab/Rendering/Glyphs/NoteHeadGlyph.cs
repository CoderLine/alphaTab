﻿using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    internal class NoteHeadGlyph : MusicFontGlyph
    {
        public const float GraceScale = 0.75f;
        public const float NoteHeadHeight = 9;
        public const int QuarterNoteHeadWidth = 10;

        private readonly bool _isGrace;
        private readonly Duration _duration;

        public NoteHeadGlyph(float x, float y, Duration duration, bool isGrace)
            : base(x, y, isGrace ? GraceScale : 1, GetSymbol(duration))
        {
            _isGrace = isGrace;
            _duration = duration;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var offset = _isGrace ? Scale : 0;
            canvas.FillMusicFontSymbol(cx + X, cy + Y + offset, GlyphScale * Scale, Symbol);
        }

        public override void DoLayout()
        {
            var scale = (_isGrace ? GraceScale : 1) * Scale;
            switch (_duration)
            {
                case Duration.QuadrupleWhole:
                    Width = 14 * scale;
                    Height = NoteHeadHeight * scale;
                    break;
                case Duration.DoubleWhole:
                    Width = 14 * (_isGrace ? GraceScale : 1) * Scale;
                    Height = NoteHeadHeight * scale;
                    break;
                case Duration.Whole:
                    Width = 14 * (_isGrace ? GraceScale : 1) * Scale;
                    Height = NoteHeadHeight * scale;
                    break;
                default:
                    Width = QuarterNoteHeadWidth * (_isGrace ? GraceScale : 1) * Scale;
                    Height = NoteHeadHeight * scale;
                    break;
            }
        }

        private static MusicFontSymbol GetSymbol(Duration duration)
        {
            switch (duration)
            {
                case Duration.QuadrupleWhole:
                    return MusicFontSymbol.NoteQuadrupleWhole;
                case Duration.DoubleWhole:
                    return MusicFontSymbol.NoteDoubleWhole;
                case Duration.Whole:
                    return MusicFontSymbol.NoteWhole;
                case Duration.Half:
                    return MusicFontSymbol.NoteHalf;
                default:
                    return MusicFontSymbol.NoteQuarter;
            }
        }
    }
}
