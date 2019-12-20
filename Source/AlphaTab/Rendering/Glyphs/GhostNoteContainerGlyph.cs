using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    internal class GhostNoteInfo
    {
        public int Line { get; set; }
        public bool IsGhost { get; set; }

        public GhostNoteInfo(int line, bool isGhost)
        {
            Line = line;
            IsGhost = isGhost;
        }
    }


    internal class GhostNoteContainerGlyph : Glyph
    {
        private readonly bool _isOpen;
        private readonly FastList<GhostNoteInfo> _infos;
        private readonly FastList<Glyph> _glyphs;

        public bool IsEmpty { get; private set; }

        public GhostNoteContainerGlyph(bool isOpen) : base(0, 0)
        {
            _isOpen = isOpen;
            _infos = new FastList<GhostNoteInfo>();
            _glyphs = new FastList<Glyph>();
            IsEmpty = true;
        }

        public void AddParenthesis(Note n)
        {
            var sr = (ScoreBarRenderer)Renderer;
            var line = sr.GetNoteLine(n);
            var hasParenthesis = n.IsGhost || IsTiedBend(n) && sr.Settings.Notation.ShowParenthesisForTiedBends;
            AddParenthesisOnLine(line, hasParenthesis);
        }

        public void AddParenthesisOnLine(int line, bool hasParenthesis)
        {
            var info = new GhostNoteInfo(line, hasParenthesis);
            _infos.Add(info);
            if (hasParenthesis)
            {
                IsEmpty = false;
            }
        }

        private bool IsTiedBend(Note note)
        {
            if (note.IsTieDestination)
            {
                if (note.TieOrigin.HasBend)
                {
                    return true;
                }

                return IsTiedBend(note.TieOrigin);
            }

            return false;
        }

        public override void DoLayout()
        {
            var sr = (ScoreBarRenderer)Renderer;
            _infos.Sort((a, b) => a.Line.CompareTo(b.Line));

            GhostParenthesisGlyph previousGlyph = null;

            var sizePerLine = sr.GetScoreY(1);

            for (int i = 0, j = _infos.Count; i < j; i++)
            {
                GhostParenthesisGlyph g;

                if (!_infos[i].IsGhost)
                {
                    previousGlyph = null;
                }
                else if (previousGlyph == null)
                {
                    g = new GhostParenthesisGlyph(_isOpen);
                    g.Renderer = Renderer;
                    g.Y = sr.GetScoreY(_infos[i].Line) - sizePerLine;
                    g.Height = sizePerLine * 2;
                    g.DoLayout();
                    _glyphs.Add(g);
                    previousGlyph = g;
                }
                else
                {
                    var y = sr.GetScoreY(_infos[i].Line) + sizePerLine;
                    previousGlyph.Height = y - previousGlyph.Y;
                }
            }

            Width = _glyphs.Count > 0 ? _glyphs[0].Width : 0;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            base.Paint(cx, cy, canvas);
            foreach (var g in _glyphs)
            {
                g.Paint(cx + X, cy + Y, canvas);
            }
        }
    }
}
