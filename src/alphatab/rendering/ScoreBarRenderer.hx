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
import alphatab.platform.ICanvas;
import alphatab.rendering.glyphs.DummyScoreGlyph;
import alphatab.rendering.glyphs.DummyTablatureGlyph;
import alphatab.rendering.glyphs.SpacingGlyph;

/**
 * This BarRenderer renders a bar using standard music notation. 
 */
class ScoreBarRenderer extends GlyphBarRenderer
{
	private static inline var LineSpacing = 8;
	public function new(bar:alphatab.model.Bar) 
	{
		super(bar);
	}
	
	private inline function getLineOffset()
	{
		return ((LineSpacing + 1) * getLayout().renderer.scale);
	}
	
	public override function doLayout()
	{
		super.doLayout();
		height = Std.int(getLineOffset() * 4) + (getGlyphOverflow() * 2);
		if (index == 0)
		{
			stave.registerStaveTop(getGlyphOverflow());
			stave.registerStaveBottom(height - getGlyphOverflow());
		}
	}
	
	private override function createGlyphs():Void 
	{
		super.createGlyphs();
		addGlyph(new DummyScoreGlyph(0, 0, 50));
		addGlyph(new DummyScoreGlyph(0, 0, 50));
		addGlyph(new DummyScoreGlyph(0, 0, 50));
	}
	
	/**
	 * gets the padding needed to place glyphs within the bounding box
	 */
	private function getGlyphOverflow()
	{
		var res = getResources();
		return Std.int((res.tablatureFont.getSize() / 2) + (res.tablatureFont.getSize() * 0.2));
	}

	public override function paintBackground(cx:Int, cy:Int, canvas:ICanvas)
	{
		var res = getResources();
		
		//
		// draw string lines
		//
		canvas.setColor(res.staveLineColor);
		var lineY = cy + y + getGlyphOverflow();
		
		var startY = lineY;
		for (i in 0 ... 5)
		{
			if (i > 0) lineY += Std.int(getLineOffset());
			canvas.beginPath();
			canvas.moveTo(cx + x, lineY);
			canvas.lineTo(cx + x + width, lineY);
			canvas.stroke();
		}
		
		//
		// Draw separators
		// 
		
		canvas.setColor(res.barSeperatorColor);

		canvas.beginPath();
		canvas.moveTo(cx + x + width, startY);
		canvas.lineTo(cx + x + width, lineY);
		canvas.stroke();
				
		// Borders of the renderer
		// canvas.setColor(new Color(255,0,0));
		// canvas.strokeRect(cx + x, cy + y, width, height);
	}
}