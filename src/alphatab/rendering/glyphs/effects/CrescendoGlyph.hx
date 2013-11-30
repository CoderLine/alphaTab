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
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.CrescendoType;
import alphatab.rendering.glyphs.MusicFont;
import alphatab.rendering.glyphs.SvgGlyph;

class CrescendoGlyph extends Glyph
{
    public static inline var Height = 17;
    private var _crescendo:CrescendoType;
    public function new(x:Int = 0, y:Int = 0, crescendo:CrescendoType)
    {
        super(x, y);
        _crescendo = crescendo;
    }    
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var height = Height * getScale();
        var res = renderer.getResources();
        canvas.setColor(res.mainGlyphColor);
        canvas.beginPath();
        if (_crescendo == CrescendoType.Crescendo)
        {
            canvas.moveTo(cx + x + width, cy + y);
            canvas.lineTo(cx + x, cy + y + Std.int(height / 2));
            canvas.lineTo(cx + x + width, cy + y + height);
        }
        else
        {
            canvas.moveTo(cx + x, cy + y);
            canvas.lineTo(cx + x + width, cy + y + Std.int(height / 2));
            canvas.lineTo(cx + x, cy + y + height);
        }
        canvas.stroke();
    }
}