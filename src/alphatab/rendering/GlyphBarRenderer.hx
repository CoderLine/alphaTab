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
package alphatab.rendering;

import alphatab.model.Bar;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.glyphs.SpacingGlyph;

/**
 * This is a BarRenderer which uses a set of Glyphs to layout and render
 * the visual appearance. 
 */
class GlyphBarRenderer extends BarRendererBase
{
	public static inline var FirstGlyphSpacing = 10;

	public var glyphs:Array<Glyph>;
    public var scaleGlyphs:Array<Glyph>;
    
	private function new(bar:Bar) 
	{
		super(bar);
		glyphs = new Array<Glyph>();
		scaleGlyphs = new Array<Glyph>();
	}
	
	public override function doLayout():Void 
	{
		createGlyphs();
	}
	
	private function createGlyphs() : Void
	{
	}
		
	private function addGlyph(glyph:Glyph, ignoreSize:Bool = false) : Void
	{
        glyph.x = width + glyph.x;
		glyph.index = glyphs.length;
		glyph.renderer = this;
		glyph.doLayout();
		if (!ignoreSize && glyph.x + glyph.width > width)
		{
			width = glyph.x + glyph.width;
		}
		glyphs.push(glyph);
        if (!ignoreSize && glyph.canScale())
        {
            scaleGlyphs.push(glyph);
        }
	}	
	
	
	public override function applyBarSpacing(spacing:Int):Void 
	{
		var oldWidth = width;
		width += spacing;
		
		var glyphSpacing = Std.int(spacing / scaleGlyphs.length);
        for (i in 0 ... glyphs.length)
        {
            var g = glyphs[i];
            // default behavior: simply replace glyph to new position
            if (i == 0)
            {
                g.x = 0;
            }
            else
            {
                g.x = glyphs[i - 1].x + glyphs[i - 1].width;
            }
            
            if (g == scaleGlyphs[scaleGlyphs.length - 1])
            {
                g.applyGlyphSpacing(glyphSpacing + (spacing - (glyphSpacing * scaleGlyphs.length)));
            }
            else
            {
                g.applyGlyphSpacing(glyphSpacing);
            }
		}
      

	}
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas)
	{
        paintBackground(cx, cy, canvas);
		
		for (g in glyphs)
		{
			g.paint(cx + x, cy + y, canvas);
		}
	}
	
	public function paintBackground(cx:Int, cy:Int, canvas:ICanvas)
	{
		
	}
}