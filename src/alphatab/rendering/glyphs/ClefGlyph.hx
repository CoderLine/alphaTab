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

import alphatab.model.Clef;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;

class ClefGlyph extends SvgGlyph
{
	public function new(x:Int = 0, y:Int = 0, clef:Clef)
	{
		super(x, y, getClefSvg(clef), 1, 1);
	}	
	
		
	public override function doLayout():Void 
	{
		width = Std.int(28 * getScale());
	}
	
	public override function canScale():Bool 
    {
        return false;
    }
	
	private function getClefSvg(clef:Clef) : String
	{
		switch(clef)
		{
			case C3: return MusicFont.ClefC; 
			case C4: return MusicFont.ClefC;
			case F4: return MusicFont.ClefF;
			case G2: return MusicFont.ClefG;
			default: return "";
		}
	}
}