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
import alphatab.platform.model.Color;
import alphatab.platform.model.Font;
import alphatab.rendering.Glyph;

class TextGlyph extends Glyph
{
    private var _text:String;
    private var _font:Font;
    
	public function new(x:Int = 0, y:Int = 0, text:String, font:Font)
	{
		super(x, y);
        _text = text;
        _font = font;
	}	
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var res = renderer.getResources();
        
        canvas.setFont(_font);
        canvas.setColor(res.mainGlyphColor);
        
        canvas.fillText(_text, cx + x, cy + y);
    }
}