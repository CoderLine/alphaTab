using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{
    class ChordDiagramRowGlyph : GlyphGroup
    {
        private float _glyphWidth = 0;
        public float Height { get; set; }

        public ChordDiagramRowGlyph(float x, float y) : base(x, y)
        {
            Glyphs = new FastList<Glyph>();
        }

        public override void DoLayout()
        {
            var x = (Width - _glyphWidth) / 2;
            foreach (var glyph in Glyphs)
            {
                glyph.X = x;
                x += glyph.Width;
            }
        }

        public void AddChord(ChordDiagramGlyph chord)
        {
            Glyphs.Add(chord);
            _glyphWidth += chord.Width;
            if (chord.Height > Height)
            {
                Height = chord.Height;
            }
        }
    }

    class ChordDiagramContainerGlyph : GlyphGroup
    {
        private const float Padding = 3;

        private FastList<ChordDiagramRowGlyph> _rows;

        public float Height { get; set; }

        public ChordDiagramContainerGlyph(float x, float y) : base(x, y)
        {
            Glyphs = new FastList<Glyph>();
        }

        public void AddChord(Chord chord)
        {
            var chordDiagram = new ChordDiagramGlyph(0, 0, chord);
            chordDiagram.Renderer = Renderer;
            chordDiagram.DoLayout();
            Glyphs.Add(chordDiagram);
        }

        public override void DoLayout()
        {
            var x = 0f;
            var y = 0f;
            var padding = 2 * Padding * Scale;

            _rows = new FastList<ChordDiagramRowGlyph>();
            var row = new ChordDiagramRowGlyph(x, y);
            row.Width = Width;
            foreach (var g in Glyphs)
            {
                if (x + g.Width<Width)
                {
                    row.AddChord((ChordDiagramGlyph) g);
                    x += g.Width;
                }
                else
                {
                    if (!row.IsEmpty)
                    {
                        row.DoLayout();
                        _rows.Add(row);
                        y += row.Height + padding;
                    }
                    x = 0;
                    row = new ChordDiagramRowGlyph(x, y);
                    row.Width = Width;
                    row.AddChord((ChordDiagramGlyph) g);
                    x += g.Width;
                }
            }

            if (!row.IsEmpty)
            {
                row.DoLayout();
                _rows.Add(row);
                y += row.Height + padding;
            }


            Height = y + padding;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            foreach (var row in _rows)
            {
                row.Paint(cx + X, cy + Y + Padding* Scale, canvas);
            }
        }
    }

    class ChordDiagramGlyph : EffectGlyph
    {
        private const float Padding = 5;
        private const float Frets = 5;
        private const float CircleRadius = 2.5f;
        private const float StringSpacing = 10;
        private const float FretSpacing = 12;
        private readonly Chord _chord;

        private float _textRow;
        private float _fretRow;
        private float _firstFretSpacing;

        public ChordDiagramGlyph(float x, float y, Chord chord) : base(x, y)
        {
            _chord = chord;
        }

        public override void DoLayout()
        {
            base.DoLayout();
            var res = Renderer.Resources;
            _textRow = res.EffectFont.Size* 1.5f;
            _fretRow = res.EffectFont.Size* 1.5f;
            if (_chord.FirstFret > 1)
            {
                _firstFretSpacing = FretSpacing* Scale;
            }
            else
            {
                _firstFretSpacing = 0;
            }

            Height = _textRow + _fretRow + (Frets - 1) * FretSpacing * Scale + 2 * Padding;
            Width = _firstFretSpacing + (_chord.Staff.Tuning.Length - 1) * StringSpacing * Scale + 2 * Padding;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            cx += X + Padding* Scale + _firstFretSpacing;
            cy += Y;
            var w = Width - 2 * Padding * Scale + Scale - _firstFretSpacing;
            var stringSpacing = StringSpacing * Scale;
            var fretSpacing = FretSpacing * Scale;
            var res = Renderer.Resources;
            var circleRadius = CircleRadius * Scale;

            var align = canvas.TextAlign;
            var baseline = canvas.TextBaseline;
            canvas.Font = res.EffectFont;
            canvas.TextAlign = TextAlign.Center;
            canvas.TextBaseline = TextBaseline.Top;
            if (_chord.ShowName)
            {
                canvas.FillText(_chord.Name, cx + (Width / 2), cy + res.EffectFont.Size / 2);
            }

            cy += _textRow;
            cx += stringSpacing / 2;
            canvas.Font = res.FretboardNumberFont;
            canvas.TextBaseline = TextBaseline.Middle;
            for (int i = 0; i < _chord.Staff.Tuning.Length; i++)
            {
                var x = cx + i * stringSpacing;
                var y = cy + _fretRow / 2;
                var fret = _chord.Strings[_chord.Staff.Tuning.Length - i - 1];
                if (fret < 0)
                {
                    canvas.FillMusicFontSymbol(x, y, Scale, MusicFontSymbol.FretboardX, true);
                }
                else if (fret == 0)
                {
                    canvas.FillMusicFontSymbol(x, y, Scale, MusicFontSymbol.FretboardO, true);
                }
                else
                {
                    fret -= _chord.FirstFret - 1;
                    canvas.FillText(fret.ToString(), x, y);
                }
            }
            cy += _fretRow;

            for (int i = 0; i<_chord.Staff.Tuning.Length; i++)
            {
                var x = cx + i * stringSpacing;
                canvas.FillRect(x, cy, 1, fretSpacing* Frets + Scale);
            }

            if (_chord.FirstFret > 1)
            {
                canvas.TextAlign = TextAlign.Left;
                canvas.FillText(_chord.FirstFret.ToString(), cx - _firstFretSpacing, cy + fretSpacing / 2);
            }

            canvas.FillRect(cx, cy - Scale, w, 2 * Scale);
            for (int i = 0; i <= Frets; i++)
            {
                var y = cy + i * fretSpacing;
                canvas.FillRect(cx, y, w, Scale);
            }

            var barreLookup = new FastDictionary<int, int[]>();
            foreach (var barreFret in _chord.BarreFrets)
            {
                var strings = new int[2];
                strings[0] = -1;
                strings[1] = -1;
                barreLookup[barreFret - _chord.FirstFret] = strings;
            }

            for (var guitarString = 0; guitarString<_chord.Strings.Count; guitarString++)
            {
                var fret = _chord.Strings[guitarString];
                if (fret > 0)
                {
                    fret -= _chord.FirstFret;
                    if (barreLookup.ContainsKey(fret))
                    {
                        var info = barreLookup[fret];
                        if (info[0] == -1 || guitarString<info[0])
                        {
                            info[0] = guitarString;
                        }
                        if (info[1] == -1 || guitarString > info[1])
                        {
                            info[1] = guitarString;
                        }
                    }
                    var y = cy + fret * fretSpacing + fretSpacing / 2 + 0.5f;
                    var x = cx + (_chord.Strings.Count - guitarString - 1) * stringSpacing;
                    canvas.FillCircle(x, y, circleRadius);
                }
            }

            foreach (var barreFret in barreLookup)
            {
                var strings = barreLookup[barreFret];
                var y = cy + barreFret * fretSpacing + fretSpacing / 2 + Scale;
                var xLeft = cx + (_chord.Strings.Count - strings[1] - 1) * stringSpacing;
                var xRight = cx + (_chord.Strings.Count - strings[0] - 1) * stringSpacing;
                canvas.FillRect(xLeft, y - circleRadius, xRight - xLeft, circleRadius* 2);
            }

            canvas.TextAlign = align;
            canvas.TextBaseline = baseline;
        }

    }
}