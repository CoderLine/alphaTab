package alphatab.rendering.glyphs;
import alphatab.model.Beat;

class TabBeatPreNotesGlyph extends BeatGlyphBase
{
	public function new(b:Beat) 
	{
		super(b);
	}
	
	public override function canScale():Bool 
	{
		return false;
	}
}