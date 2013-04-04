package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.model.Note;

class ScoreBeatPostNotesGlyph extends BeatGlyphBase
{
	public function new() 
	{
		super();
	}
    
	public override function doLayout():Void 
	{
		addGlyph(new SpacingGlyph(0, 0, Std.int(getBeatDurationWidth() * getScale())));
		super.doLayout();
	}
}