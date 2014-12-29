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
using AlphaTab.Collections;

namespace AlphaTab.Rendering.Glyphs
{
    public class AccidentalGroupGlyph : GlyphGroup
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
            Glyphs.Sort((a, b) => a.Y.CompareTo(b.Y));

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
            if (Glyphs.Count == 0)
            {
                Width = 0;
            }
            else
            {
                Width = columnWidth * columns.Count;
            }

            for (int i = 0, j = Glyphs.Count; i < j; i++)
            {
                var g = Glyphs[i];
                g.X = Width - ((g.X + 1) * columnWidth);
            }
        }
    }
}
