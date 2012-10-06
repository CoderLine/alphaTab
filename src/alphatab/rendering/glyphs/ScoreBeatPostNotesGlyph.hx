package alphatab.rendering.glyphs;
import alphatab.model.Beat;

class ScoreBeatPostNotesGlyph extends BeatGlyphBase
{
	public function new(b:Beat) 
	{
		super(b);
	}
	
	public override function doLayout():Void 
	{
		addGlyph(new SpacingGlyph(0, 0, Std.int(getBeatDurationWidth(beat.duration) * getScale())));
		super.doLayout();
	}
}