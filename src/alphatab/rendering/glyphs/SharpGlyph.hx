package alphatab.rendering.glyphs;

class SharpGlyph extends SvgGlyph
{
    public static inline var CORRECTION = -1;

	public function new(x:Int = 0, y:Int = 0)
	{
		super(x, y, MusicFont.KeySharp, 1.2, 1.2); 
	}	
	
		
	public override function doLayout():Void 
	{
		width = Std.int(8 * getScale());
	}
	
	public override function applyGlyphSpacing(spacing:Int):Void 
	{
	}
}