package alphatab.rendering.glyphs;
import alphatab.rendering.Glyph;

class TimeSignatureGlyph extends GlyphGroup
{
	private var _numerator:Int;
	private var _denominator:Int;
	public function new(x:Int, y:Int, numerator:Int, denominator:Int) 
	{
		super(x, y, new Array<Glyph>());
		_numerator = numerator;
		_denominator = denominator;
	}
	
	public override function applyGlyphSpacing(spacing:Int):Void 
	{
	}
	
	public override function doLayout():Void 
	{
		var numerator = new NumberGlyph(0, 0, _numerator);
		var denominator = new NumberGlyph(0, Std.int(18 * getScale()), _denominator);

		_glyphs.push(numerator);
		_glyphs.push(denominator);

		super.doLayout();
		
		for (g in _glyphs)
		{
			g.x = Std.int((width - g.width) / 2);
		}
	}
}