package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.model.Duration;
import alphatab.model.Note;

class BeatGlyphBase extends GlyphGroup
{
	public var beat:Beat;

	public function new(b:Beat) 
	{
		super();
		beat = b;
	}
	
	public override function doLayout():Void 
	{
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
	
	private function noteLoop( action:Note -> Void ) 
	{
		var i = beat.notes.length -1;
		while ( i >= 0 )
		{
			action(beat.notes[i--]);
		}
	}
	
    private function getBeatDurationWidth(d:Duration) : Int
    {
        switch(d)
        {
            case Whole:         return 65;
            case Half:          return 45;
            case Quarter:       return 29;
            case Eighth:        return 19;
            case Sixteenth:     return 11;
            case ThirtySecond:  return 11;
            case SixtyFourth:   return 11;
            default: return 0;
        }
    }		
}