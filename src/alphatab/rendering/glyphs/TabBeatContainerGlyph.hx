package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.model.Note;
import alphatab.model.SlideType;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;

class TabBeatContainerGlyph extends BeatContainerGlyph
{
	public function new(beat:Beat) 
	{
		super(beat);
    }
    
	private override function createTies(n:Note) 
    {
		if (n.isHammerPullDestination && n.hammerPullOrigin != null)
		{
			var tie = new TabTieGlyph(n.hammerPullOrigin, n, this);
			ties.push(tie);
		}
		else if (n.slideType == SlideType.Legato)
		{
			var tie = new TabTieGlyph(n, n.slideTarget, this);
			ties.push(tie);
		}
		
		if (n.slideType != SlideType.None)
		{
			var l = new TabSlideLineGlyph(n.slideType, n, this);
			ties.push(l);
		}		
    }
}