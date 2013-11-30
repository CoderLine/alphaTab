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

class NumberGlyph extends GlyphGroup
{
	private var _number:Int;
	public function new(x:Int, y:Int, number:Int) 
	{
		super(x, y, new Array<Glyph>());
		_number = number;
	}
	
    
    public override function canScale():Bool 
    {
        return false;
    }

	public override function doLayout():Void 
	{
		var i = _number;
		while (i > 0)
		{
			var num = i % 10;
			var gl = new DigitGlyph(0, 0, num);
			_glyphs.push(gl);		
			i = Std.int(i / 10);
		}
		_glyphs.reverse();
		
		var cx = 0;
		for (g in _glyphs)
		{
			g.x = cx;
			g.y = 0;
			g.renderer = renderer;
			g.doLayout();
			cx += g.width;
		}	
		width = cx;
	}
}