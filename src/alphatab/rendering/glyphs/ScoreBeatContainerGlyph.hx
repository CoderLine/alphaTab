package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.model.SlideType;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;

class ScoreBeatContainerGlyph extends BeatContainerGlyph
{
	public function new(beat:Beat) 
	{
		super(beat);
    }
    
	private override function createTies(n:Note) 
    {
		// create a tie if any effect requires it
		if (n.isTieDestination && n.tieOrigin != null) 
		{
			var tie = new ScoreTieGlyph(n.tieOrigin, n, this);
			ties.push(tie);
		}
		else if (n.isHammerPullDestination)
		{
			var tie = new ScoreTieGlyph(n.hammerPullOrigin, n, this);
            ties.push(tie);
		}
		else if (n.slideType == SlideType.Legato)
		{
			var tie = new ScoreTieGlyph(n, n.slideTarget, this);
			ties.push(tie);
		}
		
		// TODO: depending on the type we have other positioning
		// we should place glyphs in the preNotesGlyph or postNotesGlyph if needed
		if (n.slideType != SlideType.None)
		{
			var l = new ScoreSlideLineGlyph(n.slideType, n, this);
			ties.push(l);
		}	
    }
    
}