package alphatab.rendering.glyphs;
import alphatab.model.Duration;

/**
 * ...
 * @author Daniel Kuschny
 */

class RestGlyph extends SvgGlyph
{
	public function new(x:Int = 0, y:Int = 0, duration:Duration)
	{
		super(x, y, getRestSvg(duration), 1, 1);
	}	
	
		
	public override function doLayout():Void 
	{
		width = Std.int(9 * getScale());
	}
	
    public override function canScale():Bool 
    {
        return false;
    }

	private function getRestSvg(duration:Duration) : String
	{
		switch(duration)
		{
            case Whole, Half: return MusicFont.RestWhole;
            case Quarter: return MusicFont.RestQuarter;
            case Eighth: return MusicFont.RestEighth;
            case Sixteenth: return MusicFont.RestSixteenth;
            case ThirtySecond: return MusicFont.RestThirtySecond;
            case SixtyFourth: return MusicFont.RestSixtyFourth;
            default: return "";
		}
	}
}