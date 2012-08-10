package alphatab.rendering.glyphs;

class SharpGlyph extends SvgGlyph
{
	public function new(x:Int = 0, y:Int = 0)
	{
		super(x, y, MusicFont.AccidentalSharp, 1, 1); 
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