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
import alphatab.rendering.layout.ScoreLayout;
import alphatab.rendering.staves.BarSizeInfo;
import haxe.ds.IntMap;


/**
 * This glyph acts as container for handling
 * multiple voice rendering
 */
class VoiceContainerGlyph extends GlyphGroup implements ISupportsFinalize
{
    public static inline var KeySizeBeat = "Beat";

    public var beatGlyphs:Array<BeatContainerGlyph>;
    public var voiceIndex:Int;

	public function new(x:Int = 0, y:Int = 0, voiceIndex:Int)
	{
		super(x, y);
	    beatGlyphs = new Array<BeatContainerGlyph>();
        this.voiceIndex = voiceIndex;
	}

    public override function applyGlyphSpacing(spacing:Int):Void 
    {   
        var glyphSpacing = spacing / beatGlyphs.length;
        var gx = 0.0;
        for (i in 0 ... beatGlyphs.length)
        {
            var g = beatGlyphs[i];
            g.x = Std.int(gx);
            gx += g.width + glyphSpacing;
            g.applyGlyphSpacing(Std.int(glyphSpacing));
        }
        width = Std.int(gx);
    }
    
    private static inline function getKey(index:Int) : String
    {
        return KeySizeBeat;
    }
    
    public function registerMaxSizes(sizes:BarSizeInfo)
    {
        for (b in beatGlyphs)
		{
            b.registerMaxSizes(sizes);
		}
    }
    
    public function applySizes(sizes:BarSizeInfo)
    {
        width = 0;
        for (i in 0 ... beatGlyphs.length)
		{
			beatGlyphs[i].x = (i == 0) ? 0 : beatGlyphs[i - 1].x + beatGlyphs[i - 1].width;
			beatGlyphs[i].applySizes(sizes);
		}
        
        if (beatGlyphs.length > 0)
        {
            width = beatGlyphs[beatGlyphs.length -1].x + beatGlyphs[beatGlyphs.length -1].width;
        }
    }
    
    public override function addGlyph(g:Glyph):Void 
    {
        g.x = beatGlyphs.length == 0 ? 0 : (beatGlyphs[beatGlyphs.length - 1].x + beatGlyphs[beatGlyphs.length - 1].width);
		g.index = beatGlyphs.length;
		g.renderer = renderer;
		g.doLayout();
		beatGlyphs.push(cast g);
        width = g.x + g.width;
    }
    
    public override function doLayout():Void 
    {
    }
    
    public function finalizeGlyph(layout:ScoreLayout) : Void
    {
        for (i in 0 ... beatGlyphs.length)
        {
            beatGlyphs[i].finalizeGlyph(layout);
        }
    }
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        //canvas.setColor(new Color(Std.int(255 * Math.random()), Std.int(255 * Math.random()), Std.int(255 * Math.random()), 100));
        //canvas.fillRect(cx + x, cy + y + (15 * voiceIndex), width, 10);
        for (g in beatGlyphs)
		{
			g.paint(cx + x, cy + y, canvas);
		}	
    }
}