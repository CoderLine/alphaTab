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

import alphatab.model.Beat;
import alphatab.platform.ICanvas;
import alphatab.platform.model.TextAlign;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.IMultiBeatEffectGlyph;

class LineRangedGlyph extends Glyph implements IMultiBeatEffectGlyph
{
    private static inline var LineSpacing = 3;
    private static inline var LineTopPadding =8;
    private static inline var LineTopOffset = 6;
    private static inline var LineSize = 8;
    private var _isExpanded:Bool;
    private var _label:String;
    
	public function new(x:Int = 0, y:Int = 0, label:String)
	{
		super(x, y);
        _label = label;
	}	
    
    public function expandedTo(beat:Beat)
    {
        _isExpanded = true;
    }
	
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        var step:Float = 11 * getScale();        
        var loops:Int = Math.floor(Math.max(1, (width / step)));
               
        var res = renderer.getResources();
        canvas.setColor(res.mainGlyphColor);
        canvas.setFont(res.effectFont);
        canvas.setTextAlign(TextAlign.Left);
        var textWidth = canvas.measureText(_label);
        canvas.fillText(_label, cx + x, cy + y);
        
        // check if we need lines
        if (_isExpanded)
        {
            var lineSpacing = Std.int(LineSpacing * getScale());
            var startX = cx + x + textWidth + lineSpacing;
            var endX = cx + x + width - lineSpacing - lineSpacing;
            var lineY = cy + y + Std.int(LineTopPadding * getScale());
            var lineSize = Std.int(LineSize * getScale());
                        
            if (endX > startX)
            {
                var lineX = startX;
                canvas.beginPath();
                while (lineX < endX)
                {
                    canvas.beginPath();
                    canvas.moveTo(lineX, lineY);
                    canvas.lineTo(Std.int(Math.min(lineX + lineSize, endX)), lineY);
                    lineX += lineSize + lineSpacing;
                }
                canvas.stroke();
                canvas.moveTo(endX, lineY - Std.int(LineTopOffset * getScale()));
                canvas.lineTo(endX, lineY + Std.int(LineTopOffset * getScale()));
                canvas.stroke();
                
            }
        }
    }
}