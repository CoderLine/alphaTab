using AlphaTab.Collections;

namespace AlphaTab.Rendering.Glyphs
{
    internal class AccidentalGroupGlyph : GlyphGroup
    {
        private const int NonReserved = -3000;

        public AccidentalGroupGlyph()
            : base(0, 0)
        {
        }

        public override void DoLayout()
        {
            if (Glyphs == null)
            {
                Width = 0;
                return;
            }

            //
            // Determine Columns for accidentals
            //
            Glyphs.Sort((a, b) =>
            {
                if (a.Y < b.Y)
                {
                    return -1;
                }

                if (a.Y > b.Y)
                {
                    return 1;
                }

                return 0;
            });

            // defines the reserved y position of the columns
            var columns = new FastList<float>();
            columns.Add(NonReserved);

            var accidentalSize = 21 * Scale;
            for (int i = 0, j = Glyphs.Count; i < j; i++)
            {
                var g = Glyphs[i];
                g.Renderer = Renderer;
                g.DoLayout();

                // find column where glyph fits into

                // as long the glyph does not fit into the current column
                var gColumn = 0;
                while (columns[gColumn] > g.Y)
                {
                    // move to next column
                    gColumn++;

                    // and create the new column if needed
                    if (gColumn == columns.Count)
                    {
                        columns.Add(NonReserved);
                    }
                }

                // temporary save column as X
                g.X = gColumn;
                columns[gColumn] = g.Y + accidentalSize;
            }

            //
            // Place accidentals in columns
            //
            var columnWidth = 8 * Scale;
            var padding = 2 * Scale;
            if (Glyphs.Count == 0)
            {
                Width = 0;
            }
            else
            {
                Width = padding + columnWidth * columns.Count;
            }

            for (int i = 0, j = Glyphs.Count; i < j; i++)
            {
                var g = Glyphs[i];
                g.X = padding + (Width - (g.X + 1) * columnWidth);
            }
        }
    }
}
