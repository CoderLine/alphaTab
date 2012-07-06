package alphatab.rendering.glyphs;

class FlatGlyph extends SvgGlyph
{
    public static inline var CORRECTION = -8;

    public function new(x:Int = 0, y:Int = 0)
	{
		super(x, y, MusicFont.KeyFlat, 1.2, 1.2); 
	}	
	
		
	public override function doLayout():Void 
	{
		width = Std.int(8 * getScale());
	}
    
    public override function canScale():Bool 
    {
        return false;
    }
}