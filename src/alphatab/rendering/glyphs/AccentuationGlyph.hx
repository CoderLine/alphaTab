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
		super(x, y, getSvg(accentuation), 0.8, 0.8);
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
            case Normal: return MusicFont.Accent;
            case Heavy: return MusicFont.AccentHeavy;
            default: return "";
		}
	}
}