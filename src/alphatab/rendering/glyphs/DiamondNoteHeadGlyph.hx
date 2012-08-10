package alphatab.rendering.glyphs;

class DiamondNoteHeadGlyph extends SvgGlyph
{
    public static inline var noteHeadHeight = 9;
    
	public function new(x:Int = 0, y:Int = 0)
	{
		super(x, y, MusicFont.NoteHarmonic, 1, 1);
	}		
		
	public override function doLayout():Void 
	{
		width = Std.int(9 * getScale());
	}
    
    public override function canScale():Bool 
    {
        return false;
    }
}