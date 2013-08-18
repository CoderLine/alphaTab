package alphatab.rendering.glyphs.effects;
import alphatab.model.PickStrokeType;
import alphatab.rendering.glyphs.MusicFont;
import alphatab.rendering.glyphs.SvgGlyph;

class PickStrokeGlyph extends SvgGlyph
{
	public function new(x:Int = 0, y:Int = 0, pickStroke:PickStrokeType)
	{
		super(x, y, getNoteSvg(pickStroke), 1, 1);
	}	
	
	public override function doLayout():Void 
	{
		width = Std.int(9 * getScale());
	}
    
    public override function canScale():Bool 
    {
        return false;
    }
	
	private function getNoteSvg(pickStroke:PickStrokeType) : String
	{
		switch(pickStroke)
		{
            case Up: return MusicFont.PickStrokeUp;
            case Down: return MusicFont.PickStrokeDown;
            case None: return '';
		}
	}
}