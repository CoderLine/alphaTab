package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.model.Note;

class ScoreBeatPreNotesGlyph extends BeatGlyphBase
{
	public function new(b:Beat) 
	{
		super(b);
	}
	
	public override function applyGlyphSpacing(spacing:Int):Dynamic 
	{
		super.applyGlyphSpacing(spacing);
		// add spacing at the beginning, this way the elements are closer to the note head
		for (g in _glyphs)
		{
			g.x += spacing;
		}
	}
	
	public override function doLayout():Void 
	{
		if (!beat.isRest())
		{
			var accidentals:AccidentalGroupGlyph = new AccidentalGroupGlyph(0, 0);
            noteLoop( function(n) {
                createAccidentalGlyph(n, accidentals);
            });
			addGlyph(accidentals);
		}
		
		super.doLayout();
	}
	
    private function createAccidentalGlyph(n:Note, accidentals:AccidentalGroupGlyph)
    {
		var sr = cast(renderer, ScoreBarRenderer);
        var noteLine = sr.getNoteLine(n);
        var accidental = sr.accidentalHelper.applyAccidental(n, noteLine);
        switch (accidental) 
        {
            case Sharp:   accidentals.addGlyph(new SharpGlyph(0, sr.getScoreY(noteLine)));
            case Flat:    accidentals.addGlyph(new FlatGlyph(0, sr.getScoreY(noteLine)));
            case Natural: accidentals.addGlyph(new NaturalizeGlyph(0, sr.getScoreY(noteLine + 1)));
            default:
        }
    }
}