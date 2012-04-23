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
 * This is a dummy glyph for use in the ScoreBarRenderer.
 */
class DummyScoreGlyph extends Glyph
{
	public function new(x:Int = 0, y:Int = 0, width:Int = 100) 
	{
		super(x, y);
		this.width = width;
	}
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		var res = renderer.getResources();
		
		canvas.setColor(new Color(Std.random(256), Std.random(256), Std.random(256), 128));
		canvas.fillRect(cx + x, cy + y, width, renderer.height);

		canvas.setColor(new Color(Std.random(256), Std.random(256), Std.random(256), 200));
		canvas.beginPath();
		canvas.moveTo(cx + x, cy + y + renderer.height);
		canvas.lineTo(cx + x, cy + y);
		canvas.lineTo(cx + x + width, cy + y + renderer.height);
		canvas.lineTo(cx + x + width, cy + y);
		canvas.stroke();
	}
}