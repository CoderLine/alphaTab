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

import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;

class CircleGlyph extends Glyph
{
    private var _size:Float;
	public function new(x:Int = 0, y:Int = 0, size:Float)
	{
		super(x, y);
        _size = size;
	}

	public override function doLayout():Void 
	{
		width = Std.int(_size + (3 * getScale()));
	}
    
    public override function canScale():Dynamic 
    {
        return false;
    }
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
        canvas.beginPath();
        canvas.circle(cx + x, cy + y, _size);
        canvas.fill();
	}
}