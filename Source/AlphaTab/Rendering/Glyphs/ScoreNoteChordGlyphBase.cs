using System;
using AlphaTab.Collections;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    internal class ScoreNoteGlyphInfo
    {
        public Glyph Glyph { get; set; }
        public int Line { get; set; }

        public ScoreNoteGlyphInfo(Glyph glyph, int line)
        {
            Glyph = glyph;
            Line = line;
        }
    }

    internal abstract class ScoreNoteChordGlyphBase : Glyph
    {
        private readonly FastList<ScoreNoteGlyphInfo> _infos;
        private float _noteHeadPadding;

        public ScoreNoteGlyphInfo MinNote { get; set; }
        public ScoreNoteGlyphInfo MaxNote { get; set; }

        public Action SpacingChanged { get; set; }
        public float UpLineX { get; set; }
        public float DownLineX { get; set; }
        public float DisplacedX { get; set; }
        public float NoteStartX { get; set; }

        public ScoreNoteChordGlyphBase()
            : base(0, 0)
        {
            _infos = new FastList<ScoreNoteGlyphInfo>();
        }

        public abstract BeamDirection Direction { get; }

        protected virtual void Add(Glyph noteGlyph, int noteLine)
        {
            var info = new ScoreNoteGlyphInfo(noteGlyph, noteLine);
            _infos.Add(info);
            if (MinNote == null || MinNote.Line > info.Line)
            {
                MinNote = info;
            }

            if (MaxNote == null || MaxNote.Line < info.Line)
            {
                MaxNote = info;
            }
        }

        public bool HasTopOverflow => MinNote != null && MinNote.Line <= 0;

        public bool HasBottomOverflow => MaxNote != null && MaxNote.Line > 8;

        public override void DoLayout()
        {
            _infos.Sort((a, b) => b.Line.CompareTo(a.Line));

            var displacedX = 0f;

            var lastDisplaced = false;
            var lastLine = 0;
            var anyDisplaced = false;
            var direction = Direction;

            var w = 0f;
            for (int i = 0, j = _infos.Count; i < j; i++)
            {
                var g = _infos[i].Glyph;
                g.Renderer = Renderer;
                g.DoLayout();

                var displace = false;
                if (i == 0)
                {
                    displacedX = g.Width;
                }
                else
                {
                    // check if note needs to be repositioned
                    if (Math.Abs(lastLine - _infos[i].Line) <= 1)
                    {
                        // reposition if needed
                        if (!lastDisplaced)
                        {
                            displace = true;
                            g.X = displacedX - Scale;
                            anyDisplaced = true;
                            lastDisplaced = true; // let next iteration know we are displace now
                        }
                        else
                        {
                            lastDisplaced = false; // let next iteration know that we weren't displaced now
                        }
                    }
                    else // offset is big enough? no displacing needed
                    {
                        lastDisplaced = false;
                    }
                }

                // for beat direction down we invert the displacement.
                // this means: displaced is on the left side of the stem and not displaced is right
                if (direction == BeamDirection.Down)
                {
                    g.X = displace
                        ? 0
                        : displacedX;
                }
                else
                {
                    g.X = displace
                        ? displacedX
                        : 0;
                }

                g.X += NoteStartX;

                lastLine = _infos[i].Line;
                w = Math.Max(w, g.X + g.Width);
            }

            if (anyDisplaced)
            {
                _noteHeadPadding = 0;
                UpLineX = displacedX;
                DownLineX = displacedX;
            }
            else
            {
                _noteHeadPadding = direction == BeamDirection.Down ? -displacedX : 0;
                w += _noteHeadPadding;
                UpLineX = w;
                DownLineX = 0;
            }

            DisplacedX = displacedX;

            Width = w;
        }


        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            cx += X;
            cy += Y;
            // TODO: this method seems to be quite heavy according to the profiler, why?
            var scoreRenderer = (ScoreBarRenderer)Renderer;

            // TODO: Take care of beateffects in overflow

            var linePadding = 3 * Scale;
            var lineWidth = Width - NoteStartX + linePadding * 2;
            if (HasTopOverflow)
            {
                var color = canvas.Color;
                canvas.Color = scoreRenderer.Resources.StaffLineColor;
                var l = 0;
                while (l >= MinNote.Line)
                {
                    // + 1 Because we want to place the line in the center of the note, not at the top
                    var lY = cy + scoreRenderer.GetScoreY(l);
                    canvas.FillRect(cx - linePadding + NoteStartX, lY, lineWidth, Scale);
                    l -= 2;
                }

                canvas.Color = color;
            }

            if (HasBottomOverflow)
            {
                var color = canvas.Color;
                canvas.Color = scoreRenderer.Resources.StaffLineColor;
                var l = 12;
                while (l <= MaxNote.Line)
                {
                    var lY = cy + scoreRenderer.GetScoreY(l);
                    canvas.FillRect(cx - linePadding + NoteStartX, lY, lineWidth, Scale);
                    l += 2;
                }

                canvas.Color = color;
            }

            var infos = _infos;
            var x = cx + _noteHeadPadding;
            foreach (var g in infos)
            {
                g.Glyph.Renderer = Renderer;
                g.Glyph.Paint(x, cy, canvas);
            }
        }
    }
}
