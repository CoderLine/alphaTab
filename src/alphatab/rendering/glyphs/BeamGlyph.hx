package alphatab.rendering.glyphs;
import alphatab.model.Duration;
import alphatab.rendering.utils.BeamingHelper;

class BeamGlyph extends SvgGlyph
{
	public function new(x:Int = 0, y:Int = 0, duration:Duration, direction:BeamDirection)
	{
		super(x, y, getRestSvg(duration, direction), 1, getSvgScale(duration, direction));
	}	
	
    private function getSvgScale(duration:Duration, direction:BeamDirection)
    {
        if (direction == Up)
        {
            return 1;
        }
        else
        {
            return -1;
        }
    }
		
	public override function doLayout():Void 
	{
		width = 0;
	}
	
	private function getRestSvg(duration:Duration, direction:BeamDirection) : String
	{
        switch(duration)
        {
            case Eighth: return MusicFont.FooterEighth;
            case Sixteenth: return MusicFont.FooterSixteenth;
            case ThirtySecond: return MusicFont.FooterThirtySecond;
            case SixtyFourth: return MusicFont.FooterSixtyFourth;
            default: return "";
        }
}
}