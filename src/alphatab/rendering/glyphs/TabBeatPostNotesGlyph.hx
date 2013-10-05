package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.rendering.TabBarRenderer;

class TabBeatPostNotesGlyph extends BeatGlyphBase
{

	public function new() 
	{
		super();
	}
        
	public override function doLayout():Void 
	{
		// note specific effects
		noteLoop(function(n) {
			createNoteGlyphs(n);
		});
		
		addGlyph(new SpacingGlyph(0, 0, Std.int(getBeatDurationWidth() * getScale())));
		super.doLayout();
	}	
	
	private function createNoteGlyphs(n:Note) 
	{
        if (n.isTrill())
        {
            addGlyph(new SpacingGlyph(0, 0, Std.int(4 * getScale())));
            var trillNote = new Note();
            trillNote.isGhost = true;
            trillNote.fret = n.trillFret();
            trillNote.string = n.string;
            var tr = cast(renderer, TabBarRenderer);
            var trillNumberGlyph:Glyph = new NoteNumberGlyph(0, 0, trillNote, true);    
            var l = n.beat.voice.bar.track.tuning.length - n.string;
            trillNumberGlyph.y = tr.getTabY(l);

            addGlyph(trillNumberGlyph);
        }

		if (n.hasBend()) 
		{
			var bendHeight = Std.int(60 * getScale());
			renderer.registerOverflowTop(bendHeight);
			addGlyph(new BendGlyph(n, Std.int(getBeatDurationWidth() * getScale()), bendHeight));
		}     
	}	
}