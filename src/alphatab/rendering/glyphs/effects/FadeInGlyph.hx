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
package alphatab.rendering.glyphs.effects;

import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;

class FadeInGlyph extends Glyph
{
    public function new(x:Int = 0, y:Int = 0)
    {
        super(x, y);
    }    
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var size:Int = Std.int(6 * getScale());
        
        canvas.beginPath();
        canvas.moveTo(cx + x, cy + y);
        canvas.quadraticCurveTo(cx + x + Std.int(width/2), cy + y, cx + x + width, cy + y - size);
        canvas.moveTo(cx + x, cy + y);
        canvas.quadraticCurveTo(cx + x + Std.int(width/2), cy + y, cx + x + width, cy + y + size);
        canvas.stroke();
    }
}