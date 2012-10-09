package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.model.Note;

class TabBeatPostNotesGlyph extends BeatGlyphBase
{

	public function new(b:Beat) 
	{
		super(b);
	}
	
	public override function doLayout():Void 
	{
		// note specific effects
		noteLoop(function(n) {
			createNoteGlyphs(n);
		});
		
		addGlyph(new SpacingGlyph(0, 0, Std.int(getBeatDurationWidth(beat.duration) * getScale())));
		super.doLayout();
	}	
	
	private function createNoteGlyphs(n:Note) 
	{
		if (n.hasBend()) 
		{
			var bendHeight = Std.int(60 * getScale());
			renderer.registerOverflowTop(bendHeight);
			addGlyph(new BendGlyph(n, Std.int(getBeatDurationWidth(beat.duration) * getScale()), bendHeight));
		}
	}	
}