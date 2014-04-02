using System.Collections.Generic;

namespace AlphaTab.Rendering.Glyphs
{
    public class AccidentalGroupGlyph : GlyphGroup
    {
        private const int NonReserved = -3000;

        public override void DoLayout()
        {
            //
            // Determine Columns for accidentals
            //
            Glyphs.Sort((a, b) => b.Y.CompareTo(a.Y));

            // defines the reserved y position of the columns
            var columns = new List<int>();
            columns.Add(NonReserved);

            var accidentalSize = (int)(21 * Scale);
            foreach (var g in Glyphs)
            {
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
            var columnWidth = (int)(8 * Scale);
            if (Glyphs.Count == 0)
            {
                Width = 0;
            }
            else
            {
                Width = columnWidth * columns.Count;
            }

            foreach (var g in Glyphs)
            {
                g.X = Width - ((g.X + 1) * columnWidth);
            }
        }
    }
}
