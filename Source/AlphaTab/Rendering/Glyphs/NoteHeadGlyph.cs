using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class NoteHeadGlyph : SvgGlyph
    {
        public const float GraceScale = 0.7f;
        public const int NoteHeadHeight = 9;

        private readonly bool _isGrace;
        private readonly Duration _duration;

        public NoteHeadGlyph(int x, int y, Duration duration, bool isGrace)
            : base(x, y, GetNoteSvg(duration), isGrace ? GraceScale : 1, isGrace ? GraceScale : 1)
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

        private static LazySvg GetNoteSvg(Duration duration)
        {
            switch (duration)
            {
                case Duration.Whole:
                    return MusicFont.NoteWhole;
                case Duration.Half:
                    return MusicFont.NoteHalf;
                default:
                    return MusicFont.NoteQuarter;
            }
        }
    }
}