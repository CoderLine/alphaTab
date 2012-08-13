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

class RepeatCloseGlyph extends Glyph
{
	public function new(x:Int = 0, y:Int = 0)
	{
		super(x, y);
	}

	public override function doLayout():Void 
	{
        var base = renderer.isLast() ?  11 : 13;
		width = Std.int( base * getScale());
	}
	
    
    public override function canScale():Bool 
    {
        return false;
    }

	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		var res = renderer.getResources();
		canvas.setColor(res.mainGlyphColor);
		
		var blockWidth = 4 * getScale();
		
		var top = cy + y + renderer.getTopPadding();
		var bottom = cy + y + renderer.height - renderer.getBottomPadding();
		var left:Float = cx + x;
		var h = bottom - top;

		//circles 
		var circleSize = 1.5 * getScale();
		var middle = (top + bottom) / 2;
		var dotOffset = 3;
		canvas.beginPath();
		canvas.circle(left, middle - (circleSize * dotOffset), circleSize);
		canvas.circle(left, middle + (circleSize * dotOffset), circleSize);
		canvas.fill();
		
		// line
		left += (4 * getScale());
		canvas.beginPath();
		canvas.moveTo(left, top);
		canvas.lineTo(left, bottom);
		canvas.stroke();
		
		// big bar
		left += (3 * getScale()) + 0.5;
		canvas.fillRect(left, top, blockWidth, h); 

	}
}