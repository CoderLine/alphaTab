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

import alphatab.model.TextBaseline;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.MusicFont;
import alphatab.rendering.glyphs.SvgGlyph;

class TempoGlyph extends Glyph
{
    private var _tempo:Int;
    
	public function new(x:Int = 0, y:Int = 0, tempo:Int)
	{
		super(x, y);
        _tempo = tempo;
	}	
	
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var res = renderer.getResources();
        canvas.setFont(res.markerFont);
        canvas.setColor(res.mainGlyphColor);
        
        var symbol = new SvgGlyph(0, 0, MusicFont.Tempo, 1, 1);
        symbol.renderer = renderer;
        symbol.paint(cx + x, cy + y, canvas);
        
        canvas.fillText("" + _tempo, cx + x + Std.int(30 * getScale()), cy + y + Std.int(7*getScale()));
    }
}