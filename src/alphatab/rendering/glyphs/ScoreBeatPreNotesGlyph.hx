package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.model.GraceType;
import alphatab.model.Note;

class ScoreBeatPreNotesGlyph extends BeatGlyphBase
{
	public function new() 
	{
		super();
	}
    
	public override function applyGlyphSpacing(spacing:Int):Void 
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
		if (!container.beat.isRest())
		{
			var accidentals:AccidentalGroupGlyph = new AccidentalGroupGlyph(0, 0);
            noteLoop( function(n) {
                createAccidentalGlyph(n, accidentals);
            });
			addGlyph(accidentals);
		}
		
		// a small padding
		addGlyph(new SpacingGlyph(0, 0, Std.int(4 * (container.beat.graceType != GraceType.None ? NoteHeadGlyph.graceScale : 1) * getScale()), true));
		
		super.doLayout();
	}
	
    private function createAccidentalGlyph(n:Note, accidentals:AccidentalGroupGlyph)
    {
		var sr = cast(renderer, ScoreBarRenderer);
        var noteLine = sr.getNoteLine(n);
        var accidental = sr.accidentalHelper.applyAccidental(n, noteLine);
		var isGrace = container.beat.graceType != GraceType.None;
        switch (accidental) 
        {
            case Sharp:   accidentals.addGlyph(new SharpGlyph(0, sr.getScoreY(noteLine), isGrace));
            case Flat:    accidentals.addGlyph(new FlatGlyph(0, sr.getScoreY(noteLine), isGrace));
            case Natural: accidentals.addGlyph(new NaturalizeGlyph(0, sr.getScoreY(noteLine + 1), isGrace));
            default:
        }
    } 
}