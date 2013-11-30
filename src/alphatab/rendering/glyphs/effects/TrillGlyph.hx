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
import alphatab.rendering.glyphs.SvgGlyph;

class TrillGlyph extends Glyph
{
    private var _scale:Float;
	public function new(x:Int = 0, y:Int = 0, scale:Float = 0.9)
	{
		super(x, y);
        _scale = scale;
	}	
	
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var res = renderer.getResources();
        
        canvas.setFont(res.markerFont);
        canvas.setColor(res.mainGlyphColor);
        
        var textw = canvas.measureText("tr");
        canvas.fillText("tr", cx + x, cy + y);
        
        var startX = textw; 
        var endX = width - startX;
        var step:Float = 11 * getScale() * _scale;        
        var loops:Int = Math.floor(Math.max(1, ((endX - startX) / step)));
        
        var loopX = Std.int(startX);
        for (i in 0 ... loops)
        {
            var glyph = new SvgGlyph(loopX, 0, MusicFont.WaveHorizontal, _scale, _scale);
            glyph.renderer = renderer;
            glyph.paint(cx + x, cy + y + Std.int(res.markerFont.getSize() / 2), canvas);
            loopX += Math.floor(step);
        }
    }
}