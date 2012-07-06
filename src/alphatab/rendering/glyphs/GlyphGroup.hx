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

/**
 * This glyph allows to group several other glyphs to be
 * drawn at the same x position
 */
class GlyphGroup extends Glyph
{
	private var _glyphs:Array<Glyph>;
	public function new(x:Int = 0, y:Int = 0, glyphs:Array<Glyph>)
	{
		super(x, y);
		_glyphs = glyphs;
	}
	
	public override function doLayout():Void 
	{
		var w = 0;
		for (g in _glyphs)
		{
			g.renderer = renderer;
			g.doLayout();
			w = Std.int(Math.max(w, g.width));
		}	
		width = w;
	}
    
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		for (g in _glyphs)
		{
			g.paint(cx + x, cy + y, canvas);
		}
	}
}