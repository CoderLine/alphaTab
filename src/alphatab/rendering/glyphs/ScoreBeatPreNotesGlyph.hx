package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.model.Note;

class ScoreBeatPreNotesGlyph extends BeatGlyphBase
{
	public function new(b:Beat) 
	{
		super(b);
	}
	
	public override function canScale():Bool 
	{
		return false;
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