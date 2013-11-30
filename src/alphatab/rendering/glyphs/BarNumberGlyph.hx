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

class BarNumberGlyph extends Glyph
{
	private var _number:Int;
	private var _hidden:Bool;
	public function new(x:Int = 0, y:Int = 0, number:Int, hidden:Bool = false)
	{
		super(x, y);
		_number = number;
		_hidden = hidden;
	}

	public override function doLayout():Void 
	{
        var scoreRenderer = renderer.getLayout().renderer;
        scoreRenderer.canvas.setFont(scoreRenderer.renderingResources.barNumberFont);
        width = Std.int(10 * getScale());
	}
    
    public override function canScale():Bool 
    {
        return false;
    }
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		if (_hidden) 
		{
			return;
		}
		var res = renderer.getResources();
		canvas.setColor(res.barNumberColor);
		canvas.setFont(res.barNumberFont);
		
		canvas.fillText(Std.string(_number), cx + x, cy + y);
	}
}