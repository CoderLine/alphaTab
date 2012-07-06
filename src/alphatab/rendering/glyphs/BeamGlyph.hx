package alphatab.rendering.glyphs;
import alphatab.model.Duration;
import alphatab.rendering.utils.BeamingHelper;

class BeamGlyph extends SvgGlyph
{
	public function new(x:Int = 0, y:Int = 0, duration:Duration, direction:BeamDirection)
	{
		super(x, y, getRestSvg(duration, direction), 1.1, 1.1);
	}	
	
		
	public override function doLayout():Void 
	{
		width = 0;
	}
	
	private function getRestSvg(duration:Duration, direction:BeamDirection) : String
	{
        if (direction == Up)
        {
            switch(duration)
            {
                case Eighth: return MusicFont.FooterUpEighth;
                case Sixteenth: return MusicFont.FooterUpSixteenth;
                case ThirtySecond: return MusicFont.FooterUpThirtySecond;
                case SixtyFourth: return MusicFont.FooterUpSixtyFourth;
                default: return "";
            }
        }
        else
        {
            switch(duration)
            {
                case Eighth: return MusicFont.FooterDownEighth;
                case Sixteenth: return MusicFont.FooterDownSixteenth;
                case ThirtySecond: return MusicFont.FooterDownThirtySecond;
                case SixtyFourth: return MusicFont.FooterDownSixtyFourth;
                default: return "";
            }
        }
	}
}