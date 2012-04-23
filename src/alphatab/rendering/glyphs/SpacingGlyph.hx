package alphatab.rendering.glyphs;
import alphatab.rendering.Glyph;

/**
 * ...
 * @author 
 */

class SpacingGlyph extends Glyph
{
	public function new(x:Int = 0, y:Int = 0, width:Int)
	{
		super(x, y);
		this.width = width;
	}
}