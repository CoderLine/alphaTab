package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.model.Duration;
import alphatab.model.Note;
import alphatab.rendering.Glyph;
import alphatab.rendering.TabBarRenderer;

class TabBeatGlyph extends BeatGlyphBase
{
	public var noteNumbers : TabNoteChordGlyph;

	public function new(b:Beat) 
	{
		super(b);
	}
	
	public override function doLayout():Void 
	{
		// create glyphs
		if (!beat.isRest())
        {
			//
            // Note numbers
            //
            noteNumbers = new TabNoteChordGlyph();
            noteNumbers.beat = beat;
            noteLoop( function(n) {
                createNoteGlyph(n);
            });
            addGlyph(noteNumbers);			
		}

		
		// left to right layout
		var w = 0;
		for (g in _glyphs)
		{
			g.x = w;
			g.renderer = renderer;
			g.doLayout();
			w += g.width;
		}	
		width = w;
	} 
	
	private function createNoteGlyph(n:Note) 
    {
		var tr = cast(renderer, TabBarRenderer);
		var l = n.beat.voice.bar.track.tuning.length - n.string;
        var noteNumberGlyph:Glyph = new NoteNumberGlyph(0,0, n);        
        noteNumberGlyph.y = tr.getTabY(l, -2);
        noteNumbers.addNoteGlyph(noteNumberGlyph, n);
    }	
}