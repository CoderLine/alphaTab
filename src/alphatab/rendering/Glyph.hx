package alphatab.rendering;
import alphatab.platform.ICanvas;

/**
 * ...
 * @author 
 */

class Glyph 
{
	public var index:Int;
	public var x:Int;
	public var y:Int;
	public var width:Int;
	public var renderer:GlyphBarRenderer;
	
	public function new(x:Int = 0, y:Int = 0) 
	{
		this.x = x;
		this.y = y;
	}
	
	public function applyGlyphSpacing(spacing:Int)
	{
		// default behavior: simply replace glyph to new position
		var oldWidth = renderer.width - (spacing * renderer.glyphs.length);
		
		if (index == 0)
		{
			x = 0;
		}
		else
		{
			x = renderer.glyphs[index - 1].x + renderer.glyphs[index - 1].width;
		}
		width += spacing;
	}
	
	public function doLayout()
	{
	}
	
	public function paint(cx:Int, cy:Int, canvas:ICanvas)
	{

	}
}