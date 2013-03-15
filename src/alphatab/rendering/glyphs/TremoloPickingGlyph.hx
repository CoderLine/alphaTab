package alphatab.rendering.glyphs;
import alphatab.model.Duration;

class TremoloPickingGlyph extends SvgGlyph
{
	public function new(x:Int = 0, y:Int = 0, duration:Duration)
	{
		super(x, y, getSvg(duration), 1, 1);
	}	
	
		
	public override function doLayout():Void 
	{
		width = Std.int(12 * getScale());
	}
    
    public override function canScale():Bool 
    {
        return false;
    }
	
	private function getSvg(duration:Duration) : String
	{
		switch(duration)
		{
            case ThirtySecond: return MusicFont.TremoloPickingThirtySecond;
            case Sixteenth: return MusicFont.TremoloPickingSixteenth;
            case Eighth: return MusicFont.TremoloPickingEighth;
            default: return "";
		}
	}
}