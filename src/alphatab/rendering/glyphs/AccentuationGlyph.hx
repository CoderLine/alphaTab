package alphatab.rendering.glyphs;
import alphatab.model.AccentuationType;

/**
 * ...
 * @author Daniel Kuschny
 */

class AccentuationGlyph extends SvgGlyph
{
	public function new(x:Int = 0, y:Int = 0, accentuation:AccentuationType)
	{
		super(x, y, getSvg(accentuation), 1, 1);
	}	
	
		
	public override function doLayout():Void 
	{
		width = Std.int(9 * getScale());
	}
    
    public override function canScale():Bool 
    {
        return false;
    }
	
	private function getSvg(accentuation:AccentuationType) : String
	{
		switch(accentuation)
		{
            case Normal: return MusicFont.Accentuation;
            case Heavy: return MusicFont.HeavyAccentuation;
            default: return "";
		}
	}
}