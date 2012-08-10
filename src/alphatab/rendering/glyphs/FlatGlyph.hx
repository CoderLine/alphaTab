package alphatab.rendering.glyphs;

class FlatGlyph extends SvgGlyph
{
    public function new(x:Int = 0, y:Int = 0)
	{
		super(x, y, MusicFont.AccidentalFlat, 1, 1); 
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