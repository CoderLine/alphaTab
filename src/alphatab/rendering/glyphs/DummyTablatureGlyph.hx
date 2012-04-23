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
import alphatab.platform.model.Color;
import alphatab.rendering.Glyph;

/**
 * This is a dummy glyph for use in the TabBarRenderer.
 */
class DummyTablatureGlyph extends Glyph
{
	public function new(x:Int = 0, y:Int = 0) 
	{
		super(x, y);
	}
	
	public override function doLayout():Void 
	{
		width = 100;
	}
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		var res = renderer.getResources();
		
		canvas.setColor(new Color(Std.random(256), Std.random(256), Std.random(256), 128));
		canvas.fillRect(cx + x, cy + y, width, renderer.height);
		
		canvas.setFont(res.tablatureFont);
		canvas.setColor(new Color(0, 0, 0));
		canvas.fillText("0 1 2 3 4 5 6 7 9 0", cx + x, cy + y);
	}
}