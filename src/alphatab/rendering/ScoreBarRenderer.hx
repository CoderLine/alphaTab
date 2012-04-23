package alphatab.rendering;
import alphatab.platform.ICanvas;
import alphatab.rendering.glyphs.DummyScoreGlyph;
import alphatab.rendering.glyphs.DummyTablatureGlyph;
import alphatab.rendering.glyphs.SpacingGlyph;

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
		if (isFirstOfLine())
		{
			canvas.beginPath();
			canvas.moveTo(cx + x, startY);
			canvas.lineTo(cx + x, lineY);
			canvas.stroke();
		}
		
		canvas.beginPath();
		canvas.moveTo(cx + x + width, startY);
		canvas.lineTo(cx + x + width, lineY);
		canvas.stroke();
				
		// Borders of the renderer
		// canvas.setColor(new Color(255,0,0));
		// canvas.strokeRect(cx + x, cy + y, width, height);
	}
}