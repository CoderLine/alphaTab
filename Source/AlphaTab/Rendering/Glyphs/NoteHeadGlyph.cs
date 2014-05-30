using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class NoteHeadGlyph : MusicFontGlyph
    {
        public const float GraceScale = 0.7f;
        public const int NoteHeadHeight = 9;

        private readonly bool _isGrace;
        private readonly Duration _duration;

        public NoteHeadGlyph(int x, int y, Duration duration, bool isGrace)
            : base(x, y, isGrace ? GraceScale : 1, GetSymbol(duration))
        {
            _isGrace = isGrace;
            _duration = duration;
        }

        public override void DoLayout()
        {
            switch (_duration)
            {
                case Duration.Whole:
                    Width = (int)(14 * (_isGrace ? GraceScale : 1) * Scale);
                    break;
                default:
                    Width = (int)(9 * (_isGrace ? GraceScale : 1) * Scale);
                    break;
            }
        }

        public override bool CanScale
        {
            get
            {
                return false;
            }
        }

        private static MusicFontSymbol GetSymbol(Duration duration)
        {
            switch (duration)
            {
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