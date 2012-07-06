package alphatab.rendering.glyphs;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;

/**
 * ...
 * @author 
 */

class NumberGlyph extends GlyphGroup
{
	private var _number:Int;
	public function new(x:Int, y:Int, number:Int) 
	{
		super(x, y, new Array<Glyph>());
		_number = number;
	}
	
    
    public override function canScale():Bool 
    {
        return false;
    }

	public override function doLayout():Void 
	{
		var i = _number;
		while (i > 0)
		{
			var num = i % 10;
			var gl = new DigitGlyph(0, 0, num);
			_glyphs.push(gl);		
			i = Std.int(i / 10);
		}
		_glyphs.reverse();
		
		var cx = 0;
		for (g in _glyphs)
		{
			g.x = cx;
			g.y = 0;
			g.renderer = renderer;
			g.doLayout();
			cx += g.width;
		}	
		width = cx;
	}
}