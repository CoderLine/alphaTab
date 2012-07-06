package alphatab.rendering.glyphs;
import alphatab.model.Clef;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;

class ClefGlyph extends SvgGlyph
{
	public function new(x:Int = 0, y:Int = 0, clef:Clef)
	{
		super(x, y, getClefSvg(clef), getClefScale(clef), getClefScale(clef));
	}	
	
		
	public override function doLayout():Void 
	{
		width = Std.int(28 * getScale());
	}
	
	public override function canScale():Bool 
    {
        return false;
    }
	
	private function getClefSvg(clef:Clef) : String
	{
		switch(clef)
		{
			case C3: return MusicFont.TenorClef; 
			case C4: return MusicFont.AltoClef;
			case F4: return MusicFont.BassClef;
			case G2: return MusicFont.TrebleClef;
			default: return "";
		}
	}
	
	private function getClefScale(clef:Clef) : Float
	{
		switch(clef)
		{
			case C3,C4: return 1.1;
			default: return 1.02; 
		}	
	}
}