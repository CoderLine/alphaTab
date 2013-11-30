/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package alphatab.rendering.glyphs;

import alphatab.rendering.Glyph;

class AccidentalGroupGlyph extends GlyphGroup
{
    private static inline var NonReserved = -3000;
    public function new(x:Int = 0, y:Int = 0)
    {
        super(x, y, new Array<Glyph>());
    }
    
    public override function doLayout():Void 
    {
        //
        // Determine Columns for accidentals
        //
        _glyphs.sort(function(a, b) {
            if (a.y == b.y) return 0;
            if (a.y < b.y) return -1;
            else return 1;
        });
        
        // defines the reserved y position of the columns
        var columns = new Array<Int>();
        columns.push(NonReserved);
        
        var accidentalSize = Std.int(21 * getScale());
        for (g in _glyphs)
        {
            g.renderer = renderer;
            g.doLayout();
            
            // find column where glyph fits into
            
            // as long the glyph does not fit into the current column
            var gColumn = 0;
            while(columns[gColumn] > g.y)
            {
                // move to next column
                gColumn++;
                
                // and create the new column if needed
                if (gColumn == columns.length)
                {
                    columns.push(NonReserved);
                }
            } 
            
            // temporary save column as X
            g.x = gColumn; 
            columns[gColumn] = g.y + accidentalSize;
        }    
        
        //
        // Place accidentals in columns
        //
        var columnWidth = Std.int(8 * getScale());
         if (_glyphs.length == 0) 
         {
             width = 0;
         }
        else
         {
             width = columnWidth * columns.length;
         }

        for (g in _glyphs)
        {
            g.x = width - ((g.x + 1) * columnWidth);
        }
    }
}