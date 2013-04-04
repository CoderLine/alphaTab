package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.model.Duration;
import alphatab.model.Note;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.Glyph;

class BeatGlyphBase extends GlyphGroup
{
	public var container:BeatContainerGlyph;

	public function new() 
	{
		super();
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
		var i = container.beat.notes.length -1;
		while ( i >= 0 )
		{
			action(container.beat.notes[i--]);
		}
	}
	
    private function getBeatDurationWidth() : Int
    {
        switch(container.beat.duration)
        {
            case Whole:         return 103;
            case Half:          return 45;
            case Quarter:       return 29;
            case Eighth:        return 19;
            case Sixteenth:     return 11;
            case ThirtySecond:  return 11;
            case SixtyFourth:   return 11;
        }
    }		
}